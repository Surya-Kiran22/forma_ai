import React from 'react';
import { AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

export function ExtractionConfidenceBadge({ fieldId, confidenceScores, lowConfidenceFields }) {
  const score = confidenceScores?.[fieldId];
  if (score === undefined || score === null) return null;

  const isLowConfidence = lowConfidenceFields?.includes(fieldId) || score < 0.75;
  const percentage = Math.round(score * 100);

  let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  if (score < 0.75) {
    badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse';
  } else if (score < 0.88) {
    badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  }

  return (
    <div className={`inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${badgeColor}`}>
      {isLowConfidence ? (
        <>
          <AlertTriangle className="w-3 h-3 text-rose-400" />
          <span>AI {percentage}% (Human Review Advised)</span>
        </>
      ) : (
        <>
          <CheckCircle className="w-3 h-3 text-emerald-400" />
          <span>AI {percentage}% Confidence</span>
        </>
      )}
    </div>
  );
}
