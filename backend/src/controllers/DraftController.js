import { draftService } from '../services/DraftService.js';
import { z } from 'zod';

export const saveDraftBodySchema = z.object({
  schemaVersion: z.number().optional(),
  data: z.record(z.unknown()),
  extractedMetadata: z.record(z.unknown()).optional(),
  idempotencyKey: z.string().optional(),
});

export class DraftController {
  async saveDraft(req, res, next) {
    try {
      const { formType } = req.params;
      const draft = await draftService.saveDraft(req.user.id, formType, req.body);
      res.status(200).json({
        success: true,
        data: draft,
      });
    } catch (err) {
      next(err);
    }
  }

  async getDraft(req, res, next) {
    try {
      const { formType } = req.params;
      const draft = await draftService.getDraft(req.user.id, formType);
      res.status(200).json({
        success: true,
        data: draft,
      });
    } catch (err) {
      next(err);
    }
  }

  async listDrafts(req, res, next) {
    try {
      const drafts = await draftService.listUserDrafts(req.user.id);
      res.status(200).json({
        success: true,
        data: drafts,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const draftController = new DraftController();
