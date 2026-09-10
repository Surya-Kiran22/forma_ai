import { draftRepository } from '../repositories/DraftRepository.js';
import { schemaService } from './SchemaService.js';
import { extractionService } from './ExtractionService.js';
import { NotFoundError } from '../utils/errors.js';

export class DraftService {
  async saveDraft(userId, formType, draftPayload) {
    const schema = await schemaService.getLatestSchema(formType);

    // Dynamic missing fields calculation
    const missingFields = extractionService.calculateMissingFields(schema, draftPayload.data || {});

    // Compute completion percentage
    const allFields = schemaService.extractAllFields(schema);
    const requiredCount = allFields.filter((f) => f.validation?.required).length || 1;
    const filledRequiredCount = Math.max(0, requiredCount - missingFields.length);
    const completionPercentage = Math.min(100, Math.round((filledRequiredCount / requiredCount) * 100));

    const draftData = {
      schemaVersion: draftPayload.schemaVersion || schema.version,
      data: draftPayload.data || {},
      extractedMetadata: draftPayload.extractedMetadata || {},
      missingFields,
      completionPercentage,
      status: 'in_progress',
      idempotencyKey: draftPayload.idempotencyKey,
    };

    return draftRepository.upsertDraft(userId, formType, draftData);
  }

  async getDraft(userId, formType) {
    const draft = await draftRepository.findByUserAndForm(userId, formType);
    if (!draft) {
      throw new NotFoundError(`No saved draft found for form '${formType}'`);
    }
    return draft;
  }

  async listUserDrafts(userId) {
    return draftRepository.listUserDrafts(userId);
  }
}

export const draftService = new DraftService();
