import React from 'react';
import { useFormStore } from '../../store/useFormStore';
import { Sparkles, FileText, UserCheck, LogIn, BarChart2, ShieldCheck } from 'lucide-react';

export function Header({ onOpenAuth, onOpenSubmissions, onOpenBenchmark }) {
  const { activeFormType, setFormType, activeSchema, user, isAuthenticated, logout } = useFormStore();

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-slate-100 tracking-tight">Forma AI</h1>
              <span className="text-[10px] uppercase tracking-wider font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full">
                Production Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">AI-Augmented Dynamic Form Architecture</p>
          </div>
        </div>

        {/* Form Schema Switcher */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setFormType('auto_claim')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeFormType === 'auto_claim'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Auto Insurance Claim
          </button>
          <button
            onClick={() => setFormType('health_intake')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeFormType === 'health_intake'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Healthcare Intake
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {activeSchema && (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-700/50">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Schema v{activeSchema.version}</span>
            </div>
          )}

          <button
            onClick={onOpenBenchmark}
            className="flex items-center gap-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
          >
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            <span>Benchmark Suite</span>
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenSubmissions}
                className="flex items-center gap-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
              >
                <FileText className="w-4 h-4 text-sky-400" />
                <span>My Claims</span>
              </button>

              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <span className="text-xs text-slate-300 font-medium hidden sm:inline">{user?.name}</span>
                <button
                  onClick={logout}
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-1.5 rounded-lg shadow-sm transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
