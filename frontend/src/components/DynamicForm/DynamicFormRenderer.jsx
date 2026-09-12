import React from 'react';
import { useForm } from 'react-hook-form';
import { useFormStore } from '../../store/useFormStore';
import { DynamicFormSection } from './DynamicFormSection';
import { MissingFieldsBanner } from '../MagicInput/MissingFieldsBanner';

export function DynamicFormRenderer() {
  const {
    activeSchema,
    isLoadingSchema,
    schemaError,
    fetchSchema,
    saveDraft,
    isSavingDraft,
    lastSavedAt,
    submitForm,
    isSubmitting,
    submitError,
    submissionSuccess,
    missingFields,
    setFormType,
    activeFormType,
  } = useFormStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = () => {
    submitForm();
  };

  if (isLoadingSchema) {
    return (
      <div className="bg-white border border-slate-300 rounded p-6 shadow-sm space-y-4 text-center">
        <div className="text-sm font-bold text-slate-700">Loading Form Schema from MongoDB...</div>
      </div>
    );
  }

  if (schemaError) {
    return (
      <div className="bg-white border border-red-500 rounded p-6 text-center space-y-3">
        <h3 className="text-sm font-bold text-red-700">Failed to Load Form Schema</h3>
        <p className="text-xs text-slate-600">{schemaError}</p>
        <button
          onClick={() => fetchSchema()}
          className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-4 py-2 rounded"
        >
          Retry Loading Schema
        </button>
      </div>
    );
  }

  if (submissionSuccess) {
    return (
      <div className="bg-white border border-emerald-500 rounded p-8 text-center space-y-4 shadow-sm">
        <h3 className="text-xl font-bold text-emerald-900">Form Claim Submitted Successfully!</h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Your insurance claim responses passed dynamic validation rules and have been saved to MongoDB.
        </p>
        <button
          onClick={() => setFormType(activeFormType)}
          className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-6 py-2.5 rounded"
        >
          Submit Another Form Claim
        </button>
      </div>
    );
  }

  if (!activeSchema) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Dynamic Validation & Progress Slider Tracker */}
      <MissingFieldsBanner />

      {/* Render Dynamic Schema Sections */}
      {activeSchema.sections?.map((section) => (
        <DynamicFormSection
          key={section.id}
          section={section}
          register={register}
          errors={errors}
        />
      ))}

      {/* Save Draft & Submission Command Bar styled like the reference buttons */}
      <div className="bg-white border border-slate-300 rounded p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={saveDraft}
            disabled={isSavingDraft}
            className="bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-xs px-4 py-2 rounded transition-colors"
          >
            {isSavingDraft ? 'Saving Draft...' : 'Save Draft State (Idempotent)'}
          </button>

          {lastSavedAt && (
            <span className="text-xs font-mono text-slate-500">
              Saved at: {new Date(lastSavedAt).toLocaleTimeString()}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || missingFields.length > 0}
          className="bg-emerald-900 hover:bg-black disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold text-xs px-6 py-2.5 rounded transition-all shadow-sm"
        >
          {isSubmitting ? 'Submitting Claim...' : 'Finalize & Submit Form Claim'}
        </button>
      </div>

      {submitError && (
        <div className="p-3 rounded border border-red-500 bg-red-50 text-red-700 text-xs font-bold">
          {submitError}
        </div>
      )}
    </form>
  );
}
