import React from 'react';
import { useFormStore } from '../../store/useFormStore';
import { evaluateRule, getNestedValue } from '../../utils/ruleEvaluator';
import { ExtractionConfidenceBadge } from '../MagicInput/ExtractionConfidenceBadge';

export function DynamicFormField({ field, register, errors }) {
  const { formData, updateFieldValue, extractedMetadata, lowConfidenceFields } = useFormStore();

  // Evaluate field-level conditional branching rule
  if (field.showIf && !evaluateRule(field.showIf, formData)) {
    return null; // Field is hidden by dynamic schema branching rule
  }

  const currentValue = getNestedValue(formData, field.id) ?? '';
  const errorMsg = errors?.[field.id]?.message || field.validation?.customMessage;
  const isRequired = field.validation?.required;

  const handleChange = (e) => {
    let val = e.target.value;
    if (field.type === 'number') {
      val = e.target.value === '' ? '' : Number(e.target.value);
    } else if (field.type === 'checkbox') {
      val = e.target.checked;
    }
    updateFieldValue(field.id, val);
  };

  return (
    <div className="space-y-1.5 animate-accordion-down">
      <div className="flex items-center justify-between">
        <label
          htmlFor={`field_${field.id}`}
          className="block text-xs font-semibold text-slate-200 tracking-wide"
        >
          {field.label}
          {isRequired && <span className="text-rose-400 ml-1" aria-hidden="true">*</span>}
        </label>

        {/* AI Confidence Badge */}
        <ExtractionConfidenceBadge
          fieldId={field.id}
          confidenceScores={extractedMetadata}
          lowConfidenceFields={lowConfidenceFields}
        />
      </div>

      {field.placeholder && (
        <p className="text-[11px] text-slate-400">{field.placeholder}</p>
      )}

      {/* Input Field Rendering */}
      {field.type === 'text' || field.type === 'date' || field.type === 'number' ? (
        <input
          id={`field_${field.id}`}
          type={field.type}
          value={currentValue}
          onChange={handleChange}
          aria-required={isRequired}
          aria-invalid={Boolean(errorMsg)}
          aria-describedby={errorMsg ? `error_${field.id}` : undefined}
          className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
        />
      ) : field.type === 'textarea' ? (
        <textarea
          id={`field_${field.id}`}
          value={currentValue}
          onChange={handleChange}
          rows={3}
          aria-required={isRequired}
          aria-invalid={Boolean(errorMsg)}
          className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all resize-none"
        />
      ) : field.type === 'select' ? (
        <select
          id={`field_${field.id}`}
          value={currentValue}
          onChange={handleChange}
          aria-required={isRequired}
          aria-invalid={Boolean(errorMsg)}
          className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
        >
          <option value="">-- Select an option --</option>
          {field.options?.map((opt, i) => (
            <option key={i} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : field.type === 'radio' ? (
        <div className="grid grid-cols-2 gap-2 pt-1">
          {field.options?.map((opt, i) => {
            const checked = String(currentValue).toLowerCase() === String(opt.value).toLowerCase();
            return (
              <label
                key={i}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  checked
                    ? 'bg-sky-500/10 border-sky-500/50 text-sky-200'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name={`radio_${field.id}`}
                  value={opt.value}
                  checked={checked}
                  onChange={handleChange}
                  className="text-sky-500 focus:ring-sky-500 h-3.5 w-3.5"
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      ) : field.type === 'checkbox' ? (
        <label className="flex items-center gap-2 pt-1 cursor-pointer">
          <input
            id={`field_${field.id}`}
            type="checkbox"
            checked={Boolean(currentValue)}
            onChange={handleChange}
            className="rounded border-slate-700 text-sky-500 focus:ring-sky-500 h-4 w-4 bg-slate-950"
          />
          <span className="text-xs text-slate-300">{field.label}</span>
        </label>
      ) : null}

      {errorMsg && (
        <p id={`error_${field.id}`} className="text-[11px] text-rose-400 font-medium">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
