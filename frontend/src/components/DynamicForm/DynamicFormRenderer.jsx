import React from 'react';
import { useForm } from 'react-hook-form';
import { useFormStore } from '../../store/useFormStore';
import { DynamicFormSection } from './DynamicFormSection';
import { MissingFieldsBanner } from '../MagicInput/MissingFieldsBanner';
import { Save, Send, CheckCircle2, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';

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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="h-6 bg-slate-800 rounded-md w-1/3 animate-pulse"></div>
          <div className="h-4 bg-slate-800 rounded-md w-24 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          <div className="h-20 bg-slate-800/60 rounded-xl animate-pulse"></div>
          <div className="h-32 bg-slate-800/60 rounded-xl animate-pulse"></div>
          <div className="h-24 bg-slate-800/60 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (schemaError) {
    return (
      <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-8 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-base font-semibold text-rose-200">Failed to Load Form Schema</h3>
        <p className="text-xs text-slate-400">{schemaError}</p>
        <button
          onClick={() => fetchSchema()}
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-4 py-2 rounded-xl transition-all border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry Loading Schema
        </button>
      </div>
    );
  }

  if (submissionSuccess) {
    return (
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-100">Claim Submitted Successfully!</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Your insurance claim data has passed schema validation and has been securely persisted to MongoDB.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <button
            onClick={() => setFormType(activeFormType)}
            className="bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all"
          >
            Submit Another Claim
          </button>
        </div>
      </div>
    );
  }

  if (!activeSchema) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Dynamic Missing Fields & Validation Progress */}
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

      {/* Save Draft & Submission Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 sticky bottom-4 shadow-2xl z-30">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <button
            type="button"
            onClick={saveDraft}
            disabled={isSavingDraft}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl border border-slate-700 font-medium transition-colors disabled:opacity-50"
          >
            {isSavingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-sky-400" />}
            <span>Save Draft State</span>
          </button>

          {lastSavedAt && (
            <span className="text-[11px] text-slate-400">
              Last auto-saved: {new Date(lastSavedAt).toLocaleTimeString()}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || missingFields.length > 0}
          className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-xl shadow-sky-600/20 transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-sky-200" />
              <span>Submitting Claim...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Finalized Claim</span>
            </>
          )}
        </button>
      </div>

      {submitError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
          {submitError}
        </div>
      )}
    </form>
  );
}
