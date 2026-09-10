import React, { useEffect } from 'react';
import { useFormStore } from '../../store/useFormStore';
import { X, FileCheck, Calendar, ShieldCheck } from 'lucide-react';

export function SubmissionsHistoryModal({ isOpen, onClose }) {
  const { userSubmissions, fetchSubmissions } = useFormStore();

  useEffect(() => {
    if (isOpen) {
      fetchSubmissions();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-accordion-down">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Submitted Claims History</h2>
            <p className="text-xs text-slate-400">Persisted MongoDB submissions with locked schema versions</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {userSubmissions.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No submitted claims found. Complete and submit a form to view history.
            </div>
          ) : (
            userSubmissions.map((sub) => (
              <div key={sub._id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">{sub.formType}</span>
                    <span className="text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full">
                      v{sub.schemaVersion}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(sub.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {Object.entries(sub.data || {}).map(([key, val]) => (
                    <div key={key} className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/60 truncate">
                      <span className="text-slate-500 block text-[10px]">{key}</span>
                      <span className="text-sky-300 font-semibold">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
