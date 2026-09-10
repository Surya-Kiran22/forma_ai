import mongoose from 'mongoose';

const fieldOptionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const validationSchema = new mongoose.Schema(
  {
    required: { type: Boolean, default: false },
    pattern: { type: String }, // Regex string
    min: { type: Number },
    max: { type: Number },
    customMessage: { type: String },
  },
  { _id: false }
);

const aiExtractionSchema = new mongoose.Schema(
  {
    entityKey: { type: String, required: true },
    description: { type: String },
    expectedType: { type: String, default: 'string' },
  },
  { _id: false }
);

const formFieldSchema = new mongoose.Schema(
  {
    id: { type: String, required: true }, // Dynamic field path e.g. "incident.type"
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ['text', 'textarea', 'select', 'radio', 'checkbox', 'date', 'number', 'nested_group'],
      required: true,
    },
    placeholder: { type: String },
    defaultValue: { type: mongoose.Schema.Types.Mixed },
    options: [fieldOptionSchema],
    validation: validationSchema,
    showIf: { type: mongoose.Schema.Types.Mixed }, // SingleCondition or CompoundCondition
    aiExtraction: aiExtractionSchema,
    fields: [{ type: mongoose.Schema.Types.Mixed }], // Sub-fields if nested_group
  },
  { _id: false }
);

const formSectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    showIf: { type: mongoose.Schema.Types.Mixed },
    fields: [formFieldSchema],
  },
  { _id: false }
);

const formSchemaDefinition = new mongoose.Schema(
  {
    formType: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    version: { type: Number, required: true, default: 1 },
    isPublished: { type: Boolean, default: true, index: true },
    sections: [formSectionSchema],
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly fetch latest active schema version
formSchemaDefinition.index({ formType: 1, version: -1 });

export const FormSchema = mongoose.model('FormSchema', formSchemaDefinition);
