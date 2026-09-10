import React, { useState } from 'react';
import { useFormStore } from '../../store/useFormStore';
import { evaluateRule } from '../../utils/ruleEvaluator';
import { DynamicFormField } from './DynamicFormField';
import { ChevronDown, ChevronUp, Layers, Sparkles } from 'lucide-react';

export function DynamicFormSection({ section, register, errors }) {
  const { formData } = useFormStore();
  const [isOpen, setIsOpen] = useState(true);

  // Evaluate Section-level dynamic branching rule
  if (section.showIf && !evaluateRule(section.showIf, formData)) {
    return null; // Entire section is hidden dynamically based on backend JSON schema branching rules
  }

  const isConditionalBranch = Boolean(section.showIf);

  return (
    <div
      className={`border rounded-2xl mb-6 overflow-hidden transition-all duration-300 ${
        isConditionalBranch
          ? 'bg-slate-900/90 border-sky-500/30 shadow-lg shadow-sky-500/5'
          : 'bg-slate-900/60 border-slate-800'
      }`}
    >
      {/* Section Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-slate-800/40 hover:bg-slate-800/80 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold ${
              isConditionalBranch
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-100">{section.title}</h3>
              {isConditionalBranch && (
                <span className="text-[10px] font-medium bg-sky-500/10 text-sky-300 border border-sky-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-sky-400" /> Conditional Branch Active
                </span>
              )}
            </div>
            {section.description && (
              <p className="text-xs text-slate-400 mt-0.5">{section.description}</p>
            )}
          </div>
        </div>

        <div className="text-slate-400">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Section Body */}
      {isOpen && (
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-slate-800/60 animate-accordion-down">
          {section.fields?.map((field) => (
            <DynamicFormField key={field.id} field={field} register={register} errors={errors} />
          ))}
        </div>
      )}
    </div>
  );
}
