import { extractionService } from '../services/ExtractionService.js';
import { benchmarkService } from '../services/BenchmarkService.js';
import { z } from 'zod';

export const extractBodySchema = z.object({
  formType: z.string().min(1, 'formType is required'),
  narrativeText: z.string().min(5, 'narrativeText must be at least 5 characters long'),
});

export class ExtractionController {
  async extract(req, res, next) {
    try {
      const { formType, narrativeText } = req.body;
      const result = await extractionService.extractFields(formType, narrativeText);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async runBenchmark(_req, res, next) {
    try {
      const report = await benchmarkService.runBenchmark();
      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const extractionController = new ExtractionController();
