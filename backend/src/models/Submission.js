import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    formType: {
      type: String,
      required: true,
      index: true,
    },
    schemaVersion: {
      type: Number,
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    narrativeText: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Submission = mongoose.model('Submission', submissionSchema);
