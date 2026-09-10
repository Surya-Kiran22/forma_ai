import { connectDB, disconnectDB } from '../config/db.js';
import { seedDatabase } from './seed.js';
import { benchmarkService } from '../services/BenchmarkService.js';

async function main() {
  console.log('===========================================================');
  console.log('  Forma AI LLM Extraction Accuracy Benchmark Runner');
  console.log('===========================================================');

  try {
    await connectDB();
    await seedDatabase();

    const report = await benchmarkService.runBenchmark();

    console.log('\n------------------- BENCHMARK SUMMARY -------------------');
    console.log(`Total Test Scenarios : ${report.summary.totalCases}`);
    console.log(`Total Fields Expected: ${report.summary.totalFieldsExpected}`);
    console.log(`Total Fields Extracted: ${report.summary.totalFieldsExtracted}`);
    console.log(`Exact Field Matches  : ${report.summary.exactMatches}`);
    console.log(`Precision            : ${report.summary.precisionPercent}%`);
    console.log(`Recall               : ${report.summary.recallPercent}%`);
    console.log(`F1 Score             : ${report.summary.f1ScorePercent}%`);
    console.log('-----------------------------------------------------------\n');

    console.log('---------------- SCENARIO BREAKDOWN ----------------');
    report.testResults.forEach((t) => {
      console.log(`[${t.id}] ${t.description} (${t.formType})`);
      console.log(`  Matches: ${t.matchedCount}/${t.expectedCount} (${t.accuracyPercent}%) in ${t.executionTimeMs}ms`);
    });
    console.log('----------------------------------------------------\n');
  } catch (err) {
    console.error('Benchmark execution error:', err);
  } finally {
    await disconnectDB();
  }
}

main();
