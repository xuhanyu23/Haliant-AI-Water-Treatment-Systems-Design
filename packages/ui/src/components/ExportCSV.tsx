import React from 'react';

interface ExportCSVProps {
  data: any[];
  filename?: string;
  className?: string;
}

export function ExportCSV({ data, filename = 'export.csv', className = '' }: ExportCSVProps) {
  const exportToCSV = () => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma
          const escaped = String(value).replace(/"/g, '""');
          return escaped.includes(',') ? `"${escaped}"` : escaped;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={exportToCSV}
      className={`bg-brand-accent hover:bg-brand-accent/90 text-white px-4 py-2 rounded-lg font-medium transition-colors ${className}`}
    >
      Export CSV
    </button>
  );
}
