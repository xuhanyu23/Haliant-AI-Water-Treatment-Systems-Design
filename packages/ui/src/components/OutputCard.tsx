import React from 'react';

interface OutputCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function OutputCard({ title, children, className = '' }: OutputCardProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 border border-gray-200 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}
