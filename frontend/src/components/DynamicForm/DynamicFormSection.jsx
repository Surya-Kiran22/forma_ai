import React, { useState } from 'react';
import { useFormStore } from '../../store/useFormStore';
import { evaluateRule } from '../../utils/ruleEvaluator';
import { DynamicFormField } from './DynamicFormField';

export function DynamicFormSection({ section, register, errors }) {
  const { formData } = useFormStore();
  const [isOpen, setIsOpen] = useState(true);

  // Evaluate Section-level dynamic branching rule
  if (section.showIf && !evaluateRule(section.showIf, formData)) {
    return null; // Hidden by dynamic branching rule
  }

  const isConditionalBranch = Boolean(section.showIf);

  return (
    <div
      className={`border rounded mb-6 overflow-hidden bg-white shadow-sm ${
        isConditionalBranch ? 'border-emerald-600 border-2' : 'border-slate-300'
      }`}
    >
      {/* Section Header styled like the Command Panel header in screenshot */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 flex items-center justify-between transition-colors text-left border-b ${
          isConditionalBranch ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">{section.title}</h3>
          {isConditionalBranch && (
            <span className="text-[10px] font-bold uppercase bg-emerald-700 text-white px-2 py-0.5 rounded">
              3-Level Branch Active
            </span>
          )}
        </div>

        <span className="text-xs font-bold text-slate-600">
          {isOpen ? '[ Collapse ]' : '[ Expand ]'}
        </span>
      </button>

      {section.description && (
        <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-200 text-xs text-slate-600 italic">
          {section.description}
        </div>
      )}

      {/* Section Body */}
      {isOpen && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/30">
          {section.fields?.map((field) => (
            <DynamicFormField key={field.id} field={field} register={register} errors={errors} />
          ))}
        </div>
      )}
    </div>
  );
}
