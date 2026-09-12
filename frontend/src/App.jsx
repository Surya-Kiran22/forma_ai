import React, { useEffect, useState } from 'react';
import { useFormStore } from './store/useFormStore';
import { Header } from './components/Header/Header';
import { MagicInputBox } from './components/MagicInput/MagicInputBox';
import { DynamicFormRenderer } from './components/DynamicForm/DynamicFormRenderer';
import { AuthModal } from './components/Auth/AuthModal';
import { SubmissionsHistoryModal } from './components/Submissions/SubmissionsHistoryModal';
import { BenchmarkModal } from './components/Benchmark/BenchmarkModal';
import { api } from './services/api';

export function App() {
  const { fetchSchema, activeFormType, setUser, loadDraft } = useFormStore();
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
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Header Bar */}
      <Header
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenSubmissions={() => setSubmissionsModalOpen(true)}
        onOpenBenchmark={() => setBenchmarkModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* System Architecture Feature Cards styled like reference command boxes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white border border-slate-300 rounded p-3 text-center">
            <span className="text-xs font-bold text-slate-800 block">LangChain LLM Engine</span>
            <span className="text-[11px] text-slate-500 font-mono">Strict Structured Output</span>
          </div>

          <div className="bg-white border border-slate-300 rounded p-3 text-center">
            <span className="text-xs font-bold text-slate-800 block">Dynamic Branching</span>
            <span className="text-[11px] text-slate-500 font-mono">3-Level Deep Rules</span>
          </div>

          <div className="bg-white border border-slate-300 rounded p-3 text-center">
            <span className="text-xs font-bold text-slate-800 block">MongoDB Store</span>
            <span className="text-[11px] text-slate-500 font-mono">Schema Version Control</span>
          </div>

          <div className="bg-white border border-slate-300 rounded p-3 text-center">
            <span className="text-xs font-bold text-slate-800 block">Security Guard</span>
            <span className="text-[11px] text-slate-500 font-mono">Prompt Injection Defense</span>
          </div>
        </div>

        {/* AI Magic Input Component */}
        <MagicInputBox />

        {/* Dynamic Form Engine Renderer */}
        <DynamicFormRenderer />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-300 bg-white py-4 text-center text-xs text-slate-600 font-medium">
        <p>Forma AI Engine — Enterprise AI-Augmented Dynamic Form & Natural Language Pre-Fill System</p>
      </footer>

      {/* Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <SubmissionsHistoryModal isOpen={submissionsModalOpen} onClose={() => setSubmissionsModalOpen(false)} />
      <BenchmarkModal isOpen={benchmarkModalOpen} onClose={() => setBenchmarkModalOpen(false)} />
    </div>
  );
}

export default App;
