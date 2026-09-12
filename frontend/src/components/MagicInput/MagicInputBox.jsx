import React, { useState } from 'react';
import { useFormStore } from '../../store/useFormStore';

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
    <div className="bg-white border border-slate-300 rounded-md p-5 shadow-sm mb-6">
      <h2 className="text-base font-bold text-slate-800 mb-2 border-b border-slate-200 pb-2">
        Command Panel: Natural-Language AI Pre-Fill Processor
      </h2>

      <p className="text-xs text-slate-600 mb-3 font-medium">
        Enter an unstructured narrative paragraph describing your situation. Backend LLM extracts structured fields & reveals dynamic branching questions.
      </p>

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
        className="w-full bg-white border border-slate-300 rounded p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all resize-none font-mono"
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        {/* Sample Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Test Samples:</span>
          {samples.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleSampleClick(sample)}
              disabled={isExtracting}
              className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-3 py-1.5 rounded transition-all truncate max-w-xs"
            >
              "{sample.substring(0, 32)}..."
            </button>
          ))}
        </div>

        {/* Action Button matching dark green reference buttons */}
        <button
          onClick={handleExtract}
          disabled={!text.trim() || isExtracting}
          className="bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold text-xs px-5 py-2 rounded transition-colors shadow-sm ml-auto"
        >
          {isExtracting ? 'Extracting LLM Fields...' : 'Execute LLM Structured Extraction'}
        </button>
      </div>

      {extractionError && (
        <div className="mt-3 p-3 rounded border border-red-500 bg-red-50 text-red-700 text-xs font-semibold">
          {extractionError}
        </div>
      )}
    </div>
  );
}
