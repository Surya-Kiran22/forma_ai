import React, { useState } from 'react';
import { api } from '../../services/api';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-300 rounded-md w-full max-w-3xl p-6 shadow-xl relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 font-bold text-xs"
        >
          [ Close ]
        </button>

        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">LLM Accuracy Benchmark Suite</h2>
            <p className="text-xs text-slate-600">Evaluate LLM extraction against ground-truth dataset</p>
          </div>

          <button
            onClick={runBenchmark}
            disabled={loading}
            className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-4 py-2 rounded shadow-sm disabled:opacity-50"
          >
            {loading ? 'Executing Suite...' : 'Run LLM Benchmark'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-5">
          {!report && !loading && (
            <div className="bg-slate-50 border border-slate-300 rounded p-8 text-center space-y-2">
              <h3 className="text-sm font-bold text-slate-700">Ready to Benchmark</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Click "Run LLM Benchmark" to run extraction across labeled narratives and compute exact match precision, recall, and F1 metrics.
              </p>
            </div>
          )}

          {report && (
            <>
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-emerald-50 border border-emerald-300 p-3 rounded text-center">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Precision</span>
                  <span className="text-xl font-extrabold text-emerald-900">{report.summary.precisionPercent}%</span>
                </div>
                <div className="bg-blue-50 border border-blue-300 p-3 rounded text-center">
                  <span className="text-[10px] font-bold text-blue-800 uppercase block">Recall</span>
                  <span className="text-xl font-extrabold text-blue-900">{report.summary.recallPercent}%</span>
                </div>
                <div className="bg-indigo-50 border border-indigo-300 p-3 rounded text-center">
                  <span className="text-[10px] font-bold text-indigo-800 uppercase block">F1 Score</span>
                  <span className="text-xl font-extrabold text-indigo-900">{report.summary.f1ScorePercent}%</span>
                </div>
                <div className="bg-amber-50 border border-amber-300 p-3 rounded text-center">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">Exact Matches</span>
                  <span className="text-xl font-extrabold text-amber-900">
                    {report.summary.exactMatches} / {report.summary.totalFieldsExpected}
                  </span>
                </div>
              </div>

              {/* Test Cases */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase">Test Scenario Breakdown</h4>
                {report.testResults.map((t) => (
                  <div key={t.id} className="bg-slate-50 border border-slate-300 rounded p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">[{t.id}] {t.description}</span>
                      <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                        {t.accuracyPercent}% Match ({t.executionTimeMs}ms)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="bg-white p-2 rounded border border-slate-300">
                        <span className="text-slate-500 font-bold block mb-1">Ground Truth:</span>
                        <pre className="text-slate-800 overflow-x-auto">{JSON.stringify(t.groundTruth, null, 1)}</pre>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-300">
                        <span className="text-slate-500 font-bold block mb-1">LLM Extracted:</span>
                        <pre className="text-emerald-800 overflow-x-auto">{JSON.stringify(t.extracted, null, 1)}</pre>
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
