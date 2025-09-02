import React from 'react';

interface InputCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function InputCard({ title, children, className = '' }: InputCardProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 border border-gray-200 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}
