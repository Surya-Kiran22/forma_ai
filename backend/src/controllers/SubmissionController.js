import { submissionService } from '../services/SubmissionService.js';
import { z } from 'zod';

export const submitFormBodySchema = z.object({
  data: z.record(z.unknown()),
  narrativeText: z.string().optional(),
});

export class SubmissionController {
  async submitForm(req, res, next) {
    try {
      const { formType } = req.params;
      const submission = await submissionService.submitForm(req.user.id, formType, req.body);
      res.status(201).json({
        success: true,
        data: submission,
      });
    } catch (err) {
      next(err);
    }
  }

  async listSubmissions(req, res, next) {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '10', 10);
      const result = await submissionService.listUserSubmissions(req.user.id, page, limit);
      res.status(200).json({
        success: true,
        data: result.submissions,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  async getSubmission(req, res, next) {
    try {
      const { id } = req.params;
      const submission = await submissionService.getSubmissionById(id, req.user.id);
      res.status(200).json({
        success: true,
        data: submission,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const submissionController = new SubmissionController();
