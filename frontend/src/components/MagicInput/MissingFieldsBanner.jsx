import React from 'react';
import { useFormStore } from '../../store/useFormStore';
import { AlertCircle, CheckCircle2, ListChecks } from 'lucide-react';

export function MissingFieldsBanner() {
  const { missingFields, completionPercentage } = useFormStore();

  if (missingFields.length === 0) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-emerald-300">All Required Questions Completed</h3>
            <p className="text-[11px] text-emerald-400/80">The form dynamic validation rules are fully satisfied. Ready for submission.</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full">
          100% Ready
        </span>
      </div>
    );
  }

  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <h3 className="text-xs font-semibold text-amber-200">
            {missingFields.length} Required Field{missingFields.length > 1 ? 's' : ''} Remaining to Complete
          </h3>
        </div>
        <span className="text-xs font-mono font-semibold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
          {completionPercentage}% Complete
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        {missingFields.map((fieldId) => (
          <span
            key={fieldId}
            className="text-[11px] font-mono bg-slate-900/90 text-amber-300/90 border border-amber-500/30 px-2 py-0.5 rounded-md"
          >
            {fieldId}
          </span>
        ))}
      </div>
    </div>
  );
}
