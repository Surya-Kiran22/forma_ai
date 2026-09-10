import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { env } from '../config/env.js';
import { schemaService } from './SchemaService.js';
import { ruleEngineService } from './RuleEngineService.js';
import { LLMServiceError } from '../utils/errors.js';

export class ExtractionService {
  constructor() {
    this.model = null;
    const isPlaceholderKey = !env.OPENAI_API_KEY || env.OPENAI_API_KEY.includes('your_openai') || env.OPENAI_API_KEY.startsWith('sk-placeholder');
    if (env.LLM_PROVIDER === 'openai' && !isPlaceholderKey) {
      this.model = new ChatOpenAI({
        openAIApiKey: env.OPENAI_API_KEY,
        modelName: env.OPENAI_MODEL,
        temperature: 0, // Deterministic extraction
        maxRetries: 1,
      });
    }
  }

  /**
   * Main LLM extraction endpoint function
   * @param {string} formType 
   * @param {string} narrativeText 
   * @returns {Promise<Object>} Extracted field map, confidence scores, and missing fields list
   */
  async extractFields(formType, narrativeText) {
    const schema = await schemaService.getLatestSchema(formType);
    const schemaFields = schemaService.extractAllFields(schema);

    // Build target field extraction specifications
    const extractionTargets = schemaFields
      .filter((f) => f.aiExtraction || f.id)
      .map((f) => ({
        id: f.id,
        label: f.label,
        type: f.type,
        options: f.options ? f.options.map((o) => o.value) : undefined,
        description: f.aiExtraction?.description || f.label,
      }));

    let extractedData = {};
    let confidenceScores = {};

    if (this.model && env.OPENAI_API_KEY) {
      try {
        const result = await this.extractWithLLMWithRetry(narrativeText, extractionTargets);
        extractedData = result.extractedData;
        confidenceScores = result.confidenceScores;
      } catch (err) {
        console.warn(`[ExtractionService] LLM API extraction failed. Falling back to local heuristic parser: ${err.message}`);
        const fallbackResult = this.localHeuristicParser(narrativeText, extractionTargets);
        extractedData = fallbackResult.extractedData;
        confidenceScores = fallbackResult.confidenceScores;
      }
    } else {
      // Offline / Local Mock Mode
      const fallbackResult = this.localHeuristicParser(narrativeText, extractionTargets);
      extractedData = fallbackResult.extractedData;
      confidenceScores = fallbackResult.confidenceScores;
    }

    // Post-process values to align types & format
    const cleanedExtractedData = this.normalizeExtractedData(extractedData, extractionTargets);

    // Calculate dynamic missing fields based on rule evaluation
    const missingFields = this.calculateMissingFields(schema, cleanedExtractedData);

    // Identify low-confidence fields that require human review
    const lowConfidenceFields = Object.keys(confidenceScores).filter(
      (key) => (confidenceScores[key] || 0) < 0.75 && cleanedExtractedData[key] !== undefined
    );

    return {
      formType: schema.formType,
      schemaVersion: schema.version,
      extractedData: cleanedExtractedData,
      confidenceScores,
      lowConfidenceFields,
      missingFields,
    };
  }

  /**
   * Exponential backoff retry wrapper for LLM call
   */
  async extractWithLLMWithRetry(narrativeText, targets, maxRetries = 1) {
    let delay = 1000;
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        return await this.executeLLMPrompt(narrativeText, targets);
      } catch (err) {
        // Immediate fallback on 401 authentication error
        if (err.status === 401 || err.message?.includes('401') || err.message?.includes('Incorrect API key')) {
          throw err;
        }
        if (attempt > maxRetries) throw err;
        console.warn(`[LLM Retry] Attempt ${attempt} failed. Retrying in ${delay}ms...`);
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2;
      }
    }
  }

  /**
   * Execute LangChain prompt with strict JSON output instruction
   */
  async executeLLMPrompt(narrativeText, targets) {
    const promptTemplate = PromptTemplate.fromTemplate(`
You are a precise data extraction assistant for an enterprise form system.
Given the user's natural language narrative text, extract the required values according to the target field schema.

Target Fields Schema:
{targetsJson}

User Narrative Text:
"""
{narrativeText}
"""

Instructions:
1. Extract values for each target field using exact keys.
2. For select or radio fields with defined options, map the extracted text strictly to one of the provided option values.
3. For date fields, format as YYYY-MM-DD.
4. Provide a confidence score between 0.00 and 1.00 for each field.
5. Return strictly a JSON object with two keys: "extractedData" and "confidenceScores". Do NOT include markdown code fences or backticks.

Example Output format:
{{
  "extractedData": {{
    "incident.type": "animal_collision",
    "vehicle.make": "Honda"
  }},
  "confidenceScores": {{
    "incident.type": 0.95,
    "vehicle.make": 0.90
  }}
}}
`);

    const chain = promptTemplate.pipe(this.model).pipe(new StringOutputParser());
    const rawResponse = await chain.invoke({
      targetsJson: JSON.stringify(targets, null, 2),
      narrativeText,
    });

    const cleanedText = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedText);

    return {
      extractedData: parsed.extractedData || {},
      confidenceScores: parsed.confidenceScores || {},
    };
  }

  /**
   * Local Heuristic Parser for offline testing and graceful degradation
   */
  localHeuristicParser(narrativeText, targets) {
    const textLower = narrativeText.toLowerCase();
    const extractedData = {};
    const confidenceScores = {};

    for (const target of targets) {
      const fieldId = target.id;
      const desc = (target.description || target.label).toLowerCase();

      // Keyword & option matching logic
      if (target.options && Array.isArray(target.options)) {
        for (const opt of target.options) {
          const optStr = String(opt).toLowerCase();
          if (textLower.includes(optStr) || (optStr.includes('deer') && textLower.includes('deer')) || (optStr.includes('animal') && textLower.includes('deer'))) {
            extractedData[fieldId] = opt;
            confidenceScores[fieldId] = 0.92;
            break;
          }
        }
      }

      // Regex heuristics for common types
      if (!extractedData[fieldId]) {
        if (target.type === 'date') {
          if (textLower.includes('yesterday')) {
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            extractedData[fieldId] = yesterday;
            confidenceScores[fieldId] = 0.88;
          } else if (textLower.includes('today')) {
            const today = new Date().toISOString().split('T')[0];
            extractedData[fieldId] = today;
            confidenceScores[fieldId] = 0.90;
          } else {
            const dateMatch = narrativeText.match(/\b(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})\b/);
            if (dateMatch) {
              extractedData[fieldId] = dateMatch[1];
              confidenceScores[fieldId] = 0.85;
            }
          }
        } else if (fieldId.includes('make') || fieldId.includes('vehicle')) {
          const carMakes = ['Honda', 'Toyota', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Tesla', 'Nissan', 'Hyundai'];
          for (const make of carMakes) {
            if (textLower.includes(make.toLowerCase())) {
              extractedData[fieldId] = make;
              confidenceScores[fieldId] = 0.95;
              break;
            }
          }
        } else if (fieldId.includes('damage') || fieldId.includes('location') || fieldId.includes('part')) {
          const bodyParts = ['windshield', 'bumper', 'fender', 'door', 'hood', 'headlight', 'mirror', 'roof'];
          for (const part of bodyParts) {
            if (textLower.includes(part)) {
              extractedData[fieldId] = part;
              confidenceScores[fieldId] = 0.90;
              break;
            }
          }
        } else if (fieldId.includes('location') || fieldId.includes('street') || fieldId.includes('highway')) {
          const locMatch = narrativeText.match(/\b(on\s+[A-Za-z0-9\-\s]+?(?=\s+yesterday|\s+today|\s+in|\s+and|\.|$))/i);
          if (locMatch) {
            extractedData[fieldId] = locMatch[1].replace(/^on\s+/i, '').trim();
            confidenceScores[fieldId] = 0.80;
          }
        } else if (fieldId.includes('severity') || fieldId.includes('injury')) {
          if (textLower.includes('shattered') || textLower.includes('severe') || textLower.includes('totaled')) {
            extractedData[fieldId] = 'severe';
            confidenceScores[fieldId] = 0.85;
          } else if (textLower.includes('minor') || textLower.includes('scratch')) {
            extractedData[fieldId] = 'minor';
            confidenceScores[fieldId] = 0.85;
          }
        }
      }
    }

    return { extractedData, confidenceScores };
  }

  normalizeExtractedData(extractedData, targets) {
    const cleaned = {};
    for (const target of targets) {
      const val = extractedData[target.id];
      if (val !== undefined && val !== null && val !== '') {
        if (target.type === 'number') {
          const num = Number(val);
          cleaned[target.id] = isNaN(num) ? val : num;
        } else if (target.type === 'checkbox' && typeof val !== 'boolean') {
          cleaned[target.id] = Array.isArray(val) ? val : [val];
        } else {
          cleaned[target.id] = val;
        }
      }
    }
    return cleaned;
  }

  /**
   * Determine missing required fields based on current form schema visibility rules
   */
  calculateMissingFields(schema, formData) {
    const missing = [];

    for (const section of schema.sections || []) {
      // Evaluate section visibility rule
      if (section.showIf && !ruleEngineService.evaluateRule(section.showIf, formData)) {
        continue; // Section is hidden, skip all fields inside
      }

      for (const field of section.fields || []) {
        // Evaluate field visibility rule
        if (field.showIf && !ruleEngineService.evaluateRule(field.showIf, formData)) {
          continue; // Field is hidden by branching logic
        }

        // Check if field is required
        if (field.validation && field.validation.required) {
          const value = ruleEngineService.getNestedValue(formData, field.id);
          if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
            missing.push(field.id);
          }
        }
      }
    }

    return missing;
  }
}

export const extractionService = new ExtractionService();
