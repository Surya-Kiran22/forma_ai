import React from 'react';
import { useFormStore } from '../../store/useFormStore';
import { evaluateRule, getNestedValue } from '../../utils/ruleEvaluator';
import { ExtractionConfidenceBadge } from '../MagicInput/ExtractionConfidenceBadge';

export function DynamicFormField({ field, register, errors }) {
  const { formData, updateFieldValue, extractedMetadata, lowConfidenceFields } = useFormStore();

  // Evaluate field-level conditional branching rule
  if (field.showIf && !evaluateRule(field.showIf, formData)) {
    return null; // Field hidden by dynamic schema rule
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
    <div className="space-y-1 bg-white p-3 border border-slate-200 rounded">
      <div className="flex items-center justify-between mb-1">
        <label
          htmlFor={`field_${field.id}`}
          className="block text-xs font-bold text-slate-800"
        >
          {field.label}
          {isRequired && <span className="text-red-600 ml-1">*</span>}
        </label>

        {/* AI Confidence Badge */}
        <ExtractionConfidenceBadge
          fieldId={field.id}
          confidenceScores={extractedMetadata}
          lowConfidenceFields={lowConfidenceFields}
        />
      </div>

      {field.placeholder && (
        <p className="text-[11px] text-slate-500 mb-1">{field.placeholder}</p>
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
          className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all font-sans"
        />
      ) : field.type === 'textarea' ? (
        <textarea
          id={`field_${field.id}`}
          value={currentValue}
          onChange={handleChange}
          rows={3}
          aria-required={isRequired}
          aria-invalid={Boolean(errorMsg)}
          className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all resize-none font-sans"
        />
      ) : field.type === 'select' ? (
        <select
          id={`field_${field.id}`}
          value={currentValue}
          onChange={handleChange}
          aria-required={isRequired}
          aria-invalid={Boolean(errorMsg)}
          className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
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
                className={`flex items-center gap-2 p-2 rounded border text-xs cursor-pointer font-medium transition-all ${
                  checked
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name={`radio_${field.id}`}
                  value={opt.value}
                  checked={checked}
                  onChange={handleChange}
                  className="text-emerald-800 focus:ring-emerald-600 h-3.5 w-3.5"
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
            className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-600 h-4 w-4 bg-white"
          />
          <span className="text-xs text-slate-800 font-medium">{field.label}</span>
        </label>
      ) : null}

      {errorMsg && (
        <p className="text-[11px] text-red-600 font-bold mt-1">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
