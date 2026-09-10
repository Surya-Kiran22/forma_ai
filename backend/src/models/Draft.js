import mongoose from 'mongoose';

const draftSchema = new mongoose.Schema(
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
      default: {},
    },
    extractedMetadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    missingFields: [
      {
        type: String,
      },
    ],
    completionPercentage: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress',
    },
    idempotencyKey: {
      type: String,
      index: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique draft per user per form type
draftSchema.index({ userId: 1, formType: 1 }, { unique: true });

export const Draft = mongoose.model('Draft', draftSchema);
