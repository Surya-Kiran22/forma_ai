import React, { useEffect } from 'react';
import { useFormStore } from '../../store/useFormStore';

export function SubmissionsHistoryModal({ isOpen, onClose }) {
  const { userSubmissions, fetchSubmissions } = useFormStore();

  useEffect(() => {
    if (isOpen) {
      fetchSubmissions();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-300 rounded-md w-full max-w-2xl p-6 shadow-xl relative max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 font-bold text-xs"
        >
          [ Close ]
        </button>

        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">
          Submitted Claims History (MongoDB Ledger)
        </h2>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {userSubmissions.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs font-medium">
              No submitted claims found. Complete and submit a form to view history.
            </div>
          ) : (
            userSubmissions.map((sub) => (
              <div key={sub._id} className="bg-slate-50 border border-slate-300 rounded p-4 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 uppercase">{sub.formType}</span>
                    <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded">
                      v{sub.schemaVersion}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(sub.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  {Object.entries(sub.data || {}).map(([key, val]) => (
                    <div key={key} className="bg-white p-2 rounded border border-slate-200 truncate">
                      <span className="text-slate-500 block text-[10px]">{key}</span>
                      <span className="text-emerald-800 font-bold">{String(val)}</span>
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
