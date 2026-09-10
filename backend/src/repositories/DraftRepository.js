import { Draft } from '../models/Draft.js';

export class DraftRepository {
  async findByUserAndForm(userId, formType) {
    return Draft.findOne({ userId, formType });
  }

  async findById(id) {
    return Draft.findById(id);
  }

  /**
   * Idempotent save or update draft
   */
  async upsertDraft(userId, formType, draftData) {
    const { schemaVersion, data, extractedMetadata, missingFields, completionPercentage, status, idempotencyKey } = draftData;

    // If idempotencyKey is supplied and already processed, return existing
    if (idempotencyKey) {
      const existing = await Draft.findOne({ userId, formType, idempotencyKey });
      if (existing) {
        return existing;
      }
    }

    const updatePayload = {
      schemaVersion,
      data,
      extractedMetadata: extractedMetadata || {},
      missingFields: missingFields || [],
      completionPercentage: completionPercentage || 0,
      status: status || 'in_progress',
      ...(idempotencyKey ? { idempotencyKey } : {}),
    };

    return Draft.findOneAndUpdate(
      { userId, formType },
      { $set: updatePayload },
      { new: true, upsert: true, runValidators: true }
    );
  }

  async deleteByUserAndForm(userId, formType) {
    return Draft.deleteOne({ userId, formType });
  }

  async listUserDrafts(userId) {
    return Draft.find({ userId }).sort({ updatedAt: -1 });
  }
}

export const draftRepository = new DraftRepository();
