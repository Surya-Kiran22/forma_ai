import { Submission } from '../models/Submission.js';

export class SubmissionRepository {
  async create(submissionData) {
    const submission = new Submission(submissionData);
    return submission.save();
  }

  async findById(id) {
    return Submission.findById(id);
  }

  async listByUser(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [submissions, total] = await Promise.all([
      Submission.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Submission.countDocuments({ userId }),
    ]);

    return {
      submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const submissionRepository = new SubmissionRepository();
