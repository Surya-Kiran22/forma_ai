import React from 'react';

export function ExtractionConfidenceBadge({ fieldId, confidenceScores, lowConfidenceFields }) {
  const score = confidenceScores?.[fieldId];
  if (score === undefined || score === null) return null;

  const isLowConfidence = lowConfidenceFields?.includes(fieldId) || score < 0.75;
  const percentage = Math.round(score * 100);

  let badgeStyle = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  if (score < 0.75) {
    badgeStyle = 'bg-red-100 text-red-800 border-red-400 font-bold';
  } else if (score < 0.88) {
    badgeStyle = 'bg-amber-100 text-amber-800 border-amber-300';
  }

  return (
    <span className={`inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${badgeStyle}`}>
      {isLowConfidence ? `AI ${percentage}% (Review Advised)` : `AI ${percentage}% Confidence`}
    </span>
  );
}
