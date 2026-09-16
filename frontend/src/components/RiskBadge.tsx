import React from 'react';
import { RiskLevel } from '../types';

interface RiskBadgeProps {
  level: RiskLevel | string;
  score?: number;
  showScore?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, showScore = false }) => {
  let bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let label = 'Normal';
  let dot = 'bg-emerald-500';

  if (level === 'VERIFICATION_REQUIRED' || (score !== undefined && score >= 80)) {
    bg = 'bg-rose-50 text-rose-700 border-rose-200';
    label = 'Verification Required';
    dot = 'bg-rose-500';
  } else if (level === 'ATTENTION' || (score !== undefined && score >= 50)) {
    bg = 'bg-amber-50 text-amber-700 border-amber-200';
    label = 'Attention';
    dot = 'bg-amber-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse`} />
      <span>{label}</span>
      {showScore && score !== undefined && (
        <span className="ml-1 opacity-80 font-mono font-medium">({score})</span>
      )}
    </span>
  );
};
