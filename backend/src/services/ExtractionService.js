/**
 * M4: LLM Extraction & Prompt Design
 * Week 1 - Day 2: Core LLM Extraction Engine & Deterministic Heuristic Fallback
 *
 * Fix: Immediately fall back on 401 (invalid key) and 429 (no credits / rate limit)
 *      without wasting retry attempts.
 */

const { buildExtractionPrompt } = require('../prompts/extractionPrompt');
const { extractTargetFields, normalizeExtractedValues, calculateConfidenceMetrics } = require('./promptBuilder');
const { ruleEngineService } = require('./ruleEngineService');

// Status codes that should NEVER be retried — fall back to heuristic instantly
const NON_RETRYABLE_STATUSES = new Set([401, 403, 429]);

class ExtractionService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || null;
    this.provider = process.env.LLM_PROVIDER || (process.env.GEMINI_API_KEY ? 'gemini' : 'openai');
  }

  /**
   * Main extraction entry point
   */
  async extractFields(formOrTargets, narrativeText, options = {}) {
    const targets = extractTargetFields(formOrTargets);
    if (!targets || targets.length === 0) {
      return {
        extractedData: {},
        confidenceScores: {},
        lowConfidenceFields: [],
        missingFields: [],
        source: 'none',
      };
    }

    let extractedData = {};
    let confidenceScores = {};
    let source = 'heuristic_fallback_engine';

    const hasValidApiKey =
      this.apiKey &&
      !this.apiKey.startsWith('sk-placeholder') &&
      !this.apiKey.includes('your_') &&
      !this.apiKey.includes('your-');

    if (hasValidApiKey && !options.forceHeuristic) {
      try {
        const llmResult = await this.extractWithLLM(narrativeText, targets, options);
        extractedData = llmResult.extractedData || {};
        confidenceScores = llmResult.confidenceScores || {};
        source = `${this.provider}_llm_engine`;
      } catch (err) {
        console.warn(
          `[ExtractionService] LLM call failed (${err.message}). Using deterministic heuristic fallback.`
        );
        const fallback = this.localHeuristicParser(narrativeText, targets);
        extractedData = fallback.extractedData;
        confidenceScores = fallback.confidenceScores;
        source = 'heuristic_fallback_engine';
      }
    } else {
      const fallback = this.localHeuristicParser(narrativeText, targets);
      extractedData = fallback.extractedData;
      confidenceScores = fallback.confidenceScores;
      source = 'heuristic_fallback_engine';
    }

    const cleanedExtractedData = normalizeExtractedValues(extractedData, targets);

    const rawFields = Array.isArray(formOrTargets)
      ? formOrTargets
      : formOrTargets && Array.isArray(formOrTargets.fields)
      ? formOrTargets.fields
      : targets;
    const missingFields = ruleEngineService.calculateMissingFields(rawFields, cleanedExtractedData);

    const confidenceMetrics = calculateConfidenceMetrics(confidenceScores, 0.75);

    return {
      extractedData: cleanedExtractedData,
      confidenceScores,
      lowConfidenceFields: confidenceMetrics.lowConfidenceFields,
      missingFields,
      averageConfidence: confidenceMetrics.averageConfidence,
      needsReview: confidenceMetrics.needsReview,
      source,
    };
  }

  /**
   * Evaluate dynamic missing fields for a given form schema and data state
   */
  calculateMissingFields(formOrFields, data) {
    const rawFields = Array.isArray(formOrFields)
      ? formOrFields
      : formOrFields && Array.isArray(formOrFields.fields)
      ? formOrFields.fields
      : [];
    return ruleEngineService.calculateMissingFields(rawFields, data);
  }

  /**
   * Remote LLM caller — immediately throws a non-retryable error on 401/429
   */
  async extractWithLLM(narrativeText, targets, options = {}) {
    const prompt = buildExtractionPrompt(targets, narrativeText, options);

    if (this.provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          temperature: 0,
          response_format: { type: 'json_object' },
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const status = response.status;
        // 401 = bad/missing API key, 429 = quota exhausted / rate limit
        // Do NOT retry these — fall back immediately
        if (NON_RETRYABLE_STATUSES.has(status)) {
          const reason =
            status === 401 ? 'Invalid or missing API key' :
            status === 429 ? 'Quota exhausted or rate limited — add credits at platform.openai.com/settings/organization/billing' :
            `HTTP ${status}`;
          const err = new Error(`OpenAI ${status}: ${reason}`);
          err.status = status;
          err.nonRetryable = true;
          throw err;
        }
        throw new Error(`OpenAI API returned status ${status}`);
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content || '{}';
      const parsed = JSON.parse(content);
      return {
        extractedData: parsed.extractedData || {},
        confidenceScores: parsed.confidenceScores || {},
      };
    }

    throw new Error(`Unsupported LLM provider: ${this.provider}`);
  }

  /**
   * Deterministic local heuristic parser for offline processing and graceful degradation.
   */
  localHeuristicParser(narrativeText, targets) {
    const text = narrativeText || '';
    const textLower = text.toLowerCase();
    const extractedData = {};
    const confidenceScores = {};

    for (const target of targets) {
      const key = target.name;
      const keyLower = key.toLowerCase();
      const labelLower = (target.label || key).toLowerCase();

      // 1. Select and Radio fields with explicit options
      if (
        (target.type === 'select' || target.type === 'radio') &&
        Array.isArray(target.options) &&
        target.options.length > 0
      ) {
        let matchedOption = null;

        if (keyLower.includes('history') || keyLower.includes('prior') || labelLower.includes('history')) {
          if (/\b(?:no prior|no history|denies|negative for|never had)\b/i.test(text) || /\bno\b/i.test(text)) {
            matchedOption = target.options.find((o) => String(o).toLowerCase() === 'no') || 'no';
          } else if (/\b(?:prior|history of|diagnosed with|yes)\b/i.test(text)) {
            matchedOption = target.options.find((o) => String(o).toLowerCase() === 'yes') || 'yes';
          }
        } else if (keyLower.includes('recommend') || labelLower.includes('recommend')) {
          if (/\b(?:would not recommend|do not recommend|never recommend|not recommend)\b/i.test(text)) {
            matchedOption = target.options.find((o) => String(o).toLowerCase() === 'no') || 'no';
          } else if (/\b(?:definitely recommend|would recommend|highly recommend|recommend)\b/i.test(text)) {
            matchedOption = target.options.find((o) => String(o).toLowerCase() === 'yes') || 'yes';
          }
        }

        if (!matchedOption) {
          for (const opt of target.options) {
            const optStr = String(opt).toLowerCase().replace(/_/g, ' ');
            const escaped = optStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const rawOpt = String(opt).toLowerCase();
            const wordRegex = new RegExp(`\\b(?:${escaped}|${rawOpt})\\b`, 'i');
            if (wordRegex.test(text)) {
              matchedOption = opt;
              break;
            }
          }
        }

        if (!matchedOption) {
          if (keyLower.includes('incident') || keyLower.includes('type')) {
            if (textLower.includes('deer') || textLower.includes('animal') || textLower.includes('dog') || textLower.includes('cow')) {
              matchedOption = target.options.find((o) => String(o).toLowerCase().includes('animal')) || 'animal_collision';
            } else if (textLower.includes('rear-ended') || textLower.includes('rear ended') || textLower.includes('behind')) {
              matchedOption = target.options.find((o) => String(o).toLowerCase().includes('rear')) || 'rear_end';
            } else if (textLower.includes('hail') || textLower.includes('storm') || textLower.includes('flood')) {
              matchedOption = target.options.find((o) => String(o).toLowerCase().includes('weather')) || 'weather_damage';
            } else if (textLower.includes('theft') || textLower.includes('stolen')) {
              matchedOption = target.options.find((o) => String(o).toLowerCase().includes('theft')) || 'theft';
            }
          } else if (keyLower.includes('severity')) {
            if (textLower.includes('shattered') || textLower.includes('severe') || textLower.includes('totaled')) {
              matchedOption = target.options.find((o) => String(o).toLowerCase().includes('severe')) || 'severe';
            } else if (textLower.includes('moderate') || textLower.includes('medium')) {
              matchedOption = target.options.find((o) => String(o).toLowerCase().includes('moderate')) || 'moderate';
            } else if (textLower.includes('minor') || textLower.includes('scratch') || textLower.includes('slight')) {
              matchedOption = target.options.find((o) => String(o).toLowerCase().includes('minor')) || 'minor';
            }
          } else if (keyLower.includes('symptom')) {
            if (textLower.includes('chest pain') || textLower.includes('chest')) {
              matchedOption = target.options.find((o) => String(o).toLowerCase().includes('chest')) || 'chest_pain';
            } else if (textLower.includes('headache') || textLower.includes('migraine')) {
              matchedOption = target.options.find((o) => String(o).toLowerCase().includes('headache')) || 'headache';
            } else if (textLower.includes('breath') || textLower.includes('breathing')) {
              matchedOption = target.options.find((o) => String(o).toLowerCase().includes('breath')) || 'shortness_of_breath';
            }
          }
        }

        if (matchedOption) {
          extractedData[key] = matchedOption;
          confidenceScores[key] = 0.95;
          continue;
        }
      }

      // 2. Date fields
      if (target.type === 'date' || keyLower.includes('date')) {
        if (textLower.includes('yesterday')) {
          extractedData[key] = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          confidenceScores[key] = 0.90;
          continue;
        } else if (textLower.includes('today')) {
          extractedData[key] = new Date().toISOString().split('T')[0];
          confidenceScores[key] = 0.92;
          continue;
        } else {
          const dateMatch = text.match(/\b(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})\b/);
          if (dateMatch) {
            extractedData[key] = dateMatch[1];
            confidenceScores[key] = 0.88;
            continue;
          }
        }
      }

      // 3. Vehicle Make
      if (keyLower.includes('make') || keyLower.includes('vehicle') || labelLower.includes('make')) {
        const carMakes = ['Honda', 'Toyota', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Tesla', 'Nissan', 'Hyundai', 'Audi', 'Volkswagen', 'Subaru'];
        for (const make of carMakes) {
          if (textLower.includes(make.toLowerCase())) {
            extractedData[key] = make;
            confidenceScores[key] = 0.96;
            break;
          }
        }
        if (extractedData[key]) continue;
      }

      // 4. Damage Location / Car Parts
      if (keyLower.includes('damage') || keyLower.includes('location') || keyLower.includes('part')) {
        const parts = ['windshield', 'bumper', 'fender', 'door', 'hood', 'headlight', 'mirror', 'roof', 'wheel', 'trunk'];
        for (const part of parts) {
          if (textLower.includes(part)) {
            extractedData[key] = part;
            confidenceScores[key] = 0.92;
            break;
          }
        }
        if (extractedData[key]) continue;
      }

      // 5. Street / Highway Location
      if (keyLower.includes('location') || keyLower.includes('street') || keyLower.includes('highway') || labelLower.includes('location')) {
        const locMatch = text.match(/\b(?:on|at|near)\s+([A-Za-z0-9\-\s]+?)(?=\s+(?:yesterday|today|in|and|while|\.|$))/i);
        if (locMatch) {
          extractedData[key] = locMatch[1].trim();
          confidenceScores[key] = 0.85;
          continue;
        }
      }

      // 6. Number / Currency / Rating fields
      if (target.type === 'number' || keyLower.includes('cost') || keyLower.includes('amount') || keyLower.includes('age') || keyLower.includes('rating')) {
        if (keyLower.includes('rating') || labelLower.includes('rating')) {
          const ratingMatch =
            text.match(/\b([1-5])\s*(?:stars?|\/5)\b/i) ||
            text.match(/\brated?\s*([1-5])\b/i) ||
            text.match(/\brating\s+(?:of\s+)?([1-5])\b/i);
          if (ratingMatch) {
            extractedData[key] = Number(ratingMatch[1]);
            confidenceScores[key] = 0.95;
            continue;
          }
        }
        const numMatch = text.match(/\$?\s*(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:dollars|usd)?/i);
        if (numMatch) {
          extractedData[key] = Number(numMatch[1].replace(/,/g, ''));
          confidenceScores[key] = 0.82;
          continue;
        }
      }

      // 7. Names / People
      if (keyLower.includes('name') || labelLower.includes('name')) {
        const nameMatch =
          text.match(/\b(?:my name is|i am|patient|customer)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/i) ||
          text.match(/^([A-Z][a-z]+)\s+(?:gave|rated|submitted|is|was|stated)\b/i);
        if (nameMatch) {
          extractedData[key] = nameMatch[1].trim();
          confidenceScores[key] = 0.88;
          continue;
        }
      }
    }

    return { extractedData, confidenceScores };
  }
}

const extractionService = new ExtractionService();

module.exports = {
  ExtractionService,
  extractionService,
};
