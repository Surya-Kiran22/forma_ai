import React, { useState } from 'react';
import { api } from '../../services/api';
import { X, BarChart2, Play, CheckCircle2, Clock, Award, Loader2 } from 'lucide-react';

export function BenchmarkModal({ isOpen, onClose }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const runBenchmark = async () => {
    setLoading(true);
    try {
      const res = await api.get('/extraction/benchmark');
      setReport(res.data.data);
    } catch (err) {
      console.error('Failed to run benchmark suite', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-accordion-down">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">LLM Accuracy Benchmark Suite</h2>
              <p className="text-xs text-slate-400">Evaluate LLM extraction against labeled test set ground truth</p>
            </div>
          </div>

          <button
            onClick={runBenchmark}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{loading ? 'Evaluating Test Cases...' : 'Run Benchmark'}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6">
          {!report && !loading && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-8 text-center space-y-3">
              <Award className="w-12 h-12 text-indigo-400 mx-auto opacity-80" />
              <h3 className="text-sm font-semibold text-slate-200">Ready to Run Benchmark</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Click "Run Benchmark" to execute extraction across labeled claim narratives and compute exact match precision, recall, and F1 metrics.
              </p>
            </div>
          )}

          {report && (
            <>
              {/* Metrics Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-mono block">Precision</span>
                  <span className="text-lg font-extrabold text-emerald-400">{report.summary.precisionPercent}%</span>
                </div>
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-mono block">Recall</span>
                  <span className="text-lg font-extrabold text-sky-400">{report.summary.recallPercent}%</span>
                </div>
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-mono block">F1 Score</span>
                  <span className="text-lg font-extrabold text-indigo-400">{report.summary.f1ScorePercent}%</span>
                </div>
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-mono block">Exact Field Matches</span>
                  <span className="text-lg font-extrabold text-amber-400">
                    {report.summary.exactMatches} / {report.summary.totalFieldsExpected}
                  </span>
                </div>
              </div>

              {/* Scenario Results List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Test Scenario Breakdown</h4>
                {report.testResults.map((t) => (
                  <div key={t.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{t.id}</span>
                        <span className="text-slate-400">{t.description}</span>
                      </div>
                      <span className="font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                        {t.accuracyPercent}% Match ({t.executionTimeMs}ms)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                      <div className="bg-slate-900 p-2 rounded border border-slate-800">
                        <span className="text-slate-500 block">Ground Truth:</span>
                        <pre className="text-emerald-400 overflow-x-auto">{JSON.stringify(t.groundTruth, null, 1)}</pre>
                      </div>
                      <div className="bg-slate-900 p-2 rounded border border-slate-800">
                        <span className="text-slate-500 block">LLM Extracted:</span>
                        <pre className="text-sky-400 overflow-x-auto">{JSON.stringify(t.extracted, null, 1)}</pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
