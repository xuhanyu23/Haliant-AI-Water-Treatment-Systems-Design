import React from 'react';

interface ExportXLSXProps {
  data: any[];
  filename?: string;
  className?: string;
}

export function ExportXLSX({ data, filename = 'export.xlsx', className = '' }: ExportXLSXProps) {
  const exportToXLSX = async () => {
    if (data.length === 0) return;

    try {
      // Dynamic import to avoid SSR issues
      const XLSX = await import('xlsx');
      
      const headers = Object.keys(data[0]);
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error('Failed to export XLSX:', error);
      alert('Failed to export Excel file. Please try again.');
    }
  };

  return (
    <button
      onClick={exportToXLSX}
      className={`bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2 rounded-lg font-medium transition-colors ${className}`}
    >
      Export Excel
    </button>
  );
}
