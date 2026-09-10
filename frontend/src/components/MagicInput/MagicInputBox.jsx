import React, { useState } from 'react';
import { useFormStore } from '../../store/useFormStore';
import { Wand2, Loader2, AlertCircle, CheckCircle2, Sparkles, HelpCircle } from 'lucide-react';

const SAMPLE_PROMPTS = {
  auto_claim: [
    'I hit a deer on I-95 yesterday in my Honda, and the windshield shattered.',
    'A Toyota rear-ended my car today while I was stopped at the traffic red light on Main Street. The rear bumper is broken.',
    'Severe hail storm yesterday caused multiple dents on the hood and roof of my Ford truck.',
  ],
  health_intake: [
    'Patient reports sudden onset chest pain starting yesterday morning with shortness of breath. No prior cardiac history.',
    'Severe abdominal pain starting today accompanied by fever and fatigue.',
  ],
};

export function MagicInputBox() {
  const { activeFormType, extractFromNarrative, isExtracting, extractionError } = useFormStore();
  const [text, setText] = useState('');

  const handleExtract = () => {
    if (!text.trim() || isExtracting) return;
    extractFromNarrative(text.trim());
  };

  const handleSampleClick = (sample) => {
    setText(sample);
    extractFromNarrative(sample);
  };

  const samples = SAMPLE_PROMPTS[activeFormType] || [];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              AI Magic Input
              <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                LangChain LLM Extraction
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Type or paste a natural language situation paragraph to automatically extract fields & evaluate dynamic form branching.
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            activeFormType === 'auto_claim'
              ? 'e.g. "I hit a deer on I-95 yesterday in my Honda, and the windshield shattered."'
              : 'e.g. "Patient reports sudden onset chest pain starting yesterday morning with shortness of breath..."'
          }
          rows={3}
          disabled={isExtracting}
          className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all resize-none disabled:opacity-50"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          {/* Sample Prompts */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Try Sample:
            </span>
            {samples.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleSampleClick(sample)}
                disabled={isExtracting}
                className="text-[11px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700 transition-all text-left truncate max-w-xs"
              >
                "{sample.substring(0, 35)}..."
              </button>
            ))}
          </div>

          <button
            onClick={handleExtract}
            disabled={!text.trim() || isExtracting}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-medium text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-sky-600/20 transition-all ml-auto"
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-sky-200" />
                <span>Extracting Fields...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Pre-fill Form with AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error / Prompt Injection Warning */}
      {extractionError && (
        <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-rose-200">Extraction Notice</p>
            <p>{extractionError}</p>
          </div>
        </div>
      )}
    </div>
  );
}
