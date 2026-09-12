import React from 'react';
import { useFormStore } from '../../store/useFormStore';

export function Header({ onOpenAuth, onOpenSubmissions, onOpenBenchmark }) {
  const { activeFormType, setFormType, activeSchema, user, isAuthenticated, logout } = useFormStore();

  return (
    <header className="bg-white border-b border-slate-300 pt-6 pb-4 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Forma AI — Dynamic Form & AI Extraction Engine
            </h1>
            <p className="text-sm text-slate-600 mt-1 font-medium">
              LangChain Structured Extraction • MongoDB Schema Store • 3-Level Deep Dynamic Branching
            </p>
          </div>

          {/* User Auth & Benchmark Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenBenchmark}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs px-4 py-2 rounded transition-colors shadow-sm"
            >
              LLM Accuracy Benchmark Suite
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-300 rounded px-3 py-1.5">
                <button
                  onClick={onOpenSubmissions}
                  className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 underline"
                >
                  My Claims History
                </button>
                <span className="text-xs text-slate-500">|</span>
                <span className="text-xs font-bold text-slate-700">{user?.name}</span>
                <button
                  onClick={logout}
                  className="text-xs text-red-600 hover:text-red-700 font-semibold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-2 rounded transition-colors shadow-sm"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>

        {/* Action Controls & Form Type Selection Bar (Styled like the reference search & create box) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-200">
          {/* Active Schema Switcher Box */}
          <div className="md:col-span-2 flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Form Type:</span>
            <div className="inline-flex rounded border border-slate-300 bg-white p-1">
              <button
                onClick={() => setFormType('auto_claim')}
                className={`px-4 py-1.5 rounded text-xs font-semibold transition-all ${
                  activeFormType === 'auto_claim'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Auto Insurance Claim (50+ Fields)
              </button>
              <button
                onClick={() => setFormType('health_intake')}
                className={`px-4 py-1.5 rounded text-xs font-semibold transition-all ${
                  activeFormType === 'health_intake'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Healthcare Medical Intake
              </button>
            </div>
          </div>

          {/* Active Schema Version Card */}
          <div className="bg-slate-50 border border-slate-300 rounded p-2.5 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Schema Version:</span>
            <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded">
              {activeSchema ? `v${activeSchema.version} (${activeSchema.formType})` : 'Loading...'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
