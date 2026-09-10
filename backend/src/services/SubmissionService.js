import { submissionRepository } from '../repositories/SubmissionRepository.js';
import { draftRepository } from '../repositories/DraftRepository.js';
import { schemaService } from './SchemaService.js';
import { extractionService } from './ExtractionService.js';
import { BadRequestError } from '../utils/errors.js';

export class SubmissionService {
  async submitForm(userId, formType, submissionPayload) {
    const schema = await schemaService.getLatestSchema(formType);

    // Verify all required fields for active branching paths are populated
    const missingFields = extractionService.calculateMissingFields(schema, submissionPayload.data || {});
    if (missingFields.length > 0) {
      throw new BadRequestError(`Cannot submit form: Required fields are missing`, {
        missingFields,
      });
    }

    const submission = await submissionRepository.create({
      userId,
      formType,
      schemaVersion: schema.version,
      data: submissionPayload.data,
      narrativeText: submissionPayload.narrativeText,
    });

    // Delete in-progress draft upon successful submission
    await draftRepository.deleteByUserAndForm(userId, formType);

    return submission;
  }

  async listUserSubmissions(userId, page, limit) {
    return submissionRepository.listByUser(userId, page, limit);
  }

  async getSubmissionById(id, userId) {
    const submission = await submissionRepository.findById(id);
    if (!submission) {
      throw new BadRequestError('Submission not found');
    }
    return submission;
  }
}

export const submissionService = new SubmissionService();
