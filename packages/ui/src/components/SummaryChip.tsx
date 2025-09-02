import React from 'react';

interface SummaryChipProps {
  label: string;
  value: string | number;
  unit?: string;
  className?: string;
}

export function SummaryChip({ label, value, unit, className = '' }: SummaryChipProps) {
  return (
    <div className={`bg-brand-primary/10 border border-brand-primary/20 rounded-lg px-3 py-2 ${className}`}>
      <div className="text-sm font-medium text-brand-primary">{label}</div>
      <div className="text-lg font-semibold text-gray-900">
        {value}
        {unit && <span className="text-sm text-gray-600 ml-1">{unit}</span>}
      </div>
    </div>
  );
}
