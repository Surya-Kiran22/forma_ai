import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractionService } from './ExtractionService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class BenchmarkService {
  async runBenchmark() {
    const datasetPath = path.resolve(__dirname, '../benchmarks/labeled_claims_dataset.json');
    const datasetRaw = fs.readFileSync(datasetPath, 'utf8');
    const dataset = JSON.parse(datasetRaw);

    let totalFieldsExpected = 0;
    let totalFieldsExtracted = 0;
    let exactMatches = 0;
    const testResults = [];

    for (const testCase of dataset) {
      const startTime = Date.now();
      const result = await extractionService.extractFields(testCase.formType, testCase.narrativeText);
      const executionTimeMs = Date.now() - startTime;

      const extracted = result.extractedData || {};
      const groundTruth = testCase.groundTruth || {};

      let caseMatched = 0;
      let caseExpected = Object.keys(groundTruth).length;
      let caseExtracted = Object.keys(extracted).length;

      for (const [key, expectedVal] of Object.entries(groundTruth)) {
        const actualVal = extracted[key];
        if (actualVal !== undefined && String(actualVal).toLowerCase() === String(expectedVal).toLowerCase()) {
          caseMatched++;
        }
      }

      totalFieldsExpected += caseExpected;
      totalFieldsExtracted += caseExtracted;
      exactMatches += caseMatched;

      const caseAccuracy = caseExpected > 0 ? (caseMatched / caseExpected) * 100 : 0;

      testResults.push({
        id: testCase.id,
        description: testCase.description,
        formType: testCase.formType,
        executionTimeMs,
        expectedCount: caseExpected,
        matchedCount: caseMatched,
        accuracyPercent: parseFloat(caseAccuracy.toFixed(2)),
        groundTruth,
        extracted,
      });
    }

    const precision = totalFieldsExtracted > 0 ? (exactMatches / totalFieldsExtracted) * 100 : 0;
    const recall = totalFieldsExpected > 0 ? (exactMatches / totalFieldsExpected) * 100 : 0;
    const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    return {
      summary: {
        totalCases: dataset.length,
        totalFieldsExpected,
        totalFieldsExtracted,
        exactMatches,
        precisionPercent: parseFloat(precision.toFixed(2)),
        recallPercent: parseFloat(recall.toFixed(2)),
        f1ScorePercent: parseFloat(f1Score.toFixed(2)),
      },
      testResults,
    };
  }
}

export const benchmarkService = new BenchmarkService();
