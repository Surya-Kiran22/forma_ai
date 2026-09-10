import React, { useEffect, useState } from 'react';
import { useFormStore } from './store/useFormStore';
import { Header } from './components/Header/Header';
import { MagicInputBox } from './components/MagicInput/MagicInputBox';
import { DynamicFormRenderer } from './components/DynamicForm/DynamicFormRenderer';
import { AuthModal } from './components/Auth/AuthModal';
import { SubmissionsHistoryModal } from './components/Submissions/SubmissionsHistoryModal';
import { BenchmarkModal } from './components/Benchmark/BenchmarkModal';
import { api } from './services/api';
import { Cpu, Database, Shield, Zap } from 'lucide-react';

export function App() {
  const { fetchSchema, activeFormType, setUser, loadDraft, isAuthenticated } = useFormStore();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);
  const [benchmarkModalOpen, setBenchmarkModalOpen] = useState(false);

  useEffect(() => {
    // Initial schema load
    fetchSchema(activeFormType);

    // Check saved user session
    const token = localStorage.getItem('accessToken');
    if (token) {
      api
        .get('/auth/me')
        .then((res) => {
          setUser(res.data.data.user);
          loadDraft(activeFormType);
        })
        .catch(() => {
          localStorage.removeItem('accessToken');
        });
    }

    const handleAuthExpired = () => setAuthModalOpen(true);
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header Bar */}
      <Header
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenSubmissions={() => setSubmissionsModalOpen(true)}
        onOpenBenchmark={() => setBenchmarkModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Feature Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-200 block">LangChain Engine</span>
              <span className="text-[10px] text-slate-400">Structured JSON Output</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-200 block">3-Level Branching</span>
              <span className="text-[10px] text-slate-400">0ms Client Evaluation</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-200 block">Schema Store</span>
              <span className="text-[10px] text-slate-400">MongoDB Versioned Rules</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-200 block">Security Guard</span>
              <span className="text-[10px] text-slate-400">Prompt Injection Defense</span>
            </div>
          </div>
        </div>

        {/* AI Magic Input Component */}
        <MagicInputBox />

        {/* Dynamic Form Engine Renderer */}
        <DynamicFormRenderer />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>Forma AI Engine — Enterprise Dynamic Form & Natural Language Structured Pre-Fill System</p>
      </footer>

      {/* Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <SubmissionsHistoryModal isOpen={submissionsModalOpen} onClose={() => setSubmissionsModalOpen(false)} />
      <BenchmarkModal isOpen={benchmarkModalOpen} onClose={() => setBenchmarkModalOpen(false)} />
    </div>
  );
}
export default App;
