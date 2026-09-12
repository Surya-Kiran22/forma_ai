import React from 'react';
import { useFormStore } from '../../store/useFormStore';

export function MissingFieldsBanner() {
  const { missingFields, completionPercentage } = useFormStore();

  const isComplete = missingFields.length === 0;

  return (
    <div className={`border rounded p-4 mb-6 shadow-sm ${
      isComplete ? 'bg-emerald-50 border-emerald-300' : 'bg-blue-50 border-blue-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-sm font-bold ${isComplete ? 'text-emerald-900' : 'text-slate-800'}`}>
          Dynamic Validation Tracker: {completionPercentage}% Form Completion
        </h3>
        <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
          isComplete ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-blue-100 border-blue-300 text-blue-800'
        }`}>
          {isComplete ? '100% Fully Validated' : `${missingFields.length} Required Field(s) Pending`}
        </span>
      </div>

      {/* Progress Bar styled like the blue slider in the screenshot */}
      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden my-2 border border-slate-300">
        <div
          className={`h-full transition-all duration-300 ${isComplete ? 'bg-emerald-600' : 'bg-blue-600'}`}
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      {/* Subtitle labels styled like the screenshot timeline labels */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mt-1">
        <span>v1: Schema Loaded</span>
        <span>
          {isComplete ? 'Status: Form Ready to Submit' : `Pending: ${missingFields.slice(0, 3).join(', ')}${missingFields.length > 3 ? '...' : ''}`}
        </span>
        <span>v5: Submission Finalized</span>
      </div>
    </div>
  );
}
