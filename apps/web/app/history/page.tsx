"use client";

import { useEffect, useState } from "react";
import { InputCard, OutputCard, LoadingSpinner } from "@repo/ui";
import { get, del } from "../../src/lib/api";

interface DesignRun {
  id: string;
  systemType: string;
  inputJson: any;
  outputJson: any;
  createdAt: string;
}

export default function HistoryPage() {
  const [designs, setDesigns] = useState<DesignRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<DesignRun | null>(null);

  useEffect(() => {
    loadDesigns();
  }, []);

  const loadDesigns = async () => {
    try {
      setLoading(true);
      const data = await get("/api/design");
      setDesigns(data);
    } catch (err: any) {
      setError(err.message || "Failed to load design history");
    } finally {
      setLoading(false);
    }
  };

  const clearAllHistory = async () => {
    if (!window.confirm("Are you sure you want to clear all design history? This action cannot be undone.")) {
      return;
    }
    
    try {
      await del("/api/design");
      setDesigns([]);
      setSelectedDesign(null);
      alert("All design history has been cleared.");
    } catch (err: any) {
      setError(err.message || "Failed to clear design history");
    }
  };

  const deleteDesign = async (designId: string) => {
    if (!window.confirm("Are you sure you want to delete this design? This action cannot be undone.")) {
      return;
    }

    try {
      await del(`/api/design/${designId}`);
      const updatedDesigns = designs.filter(d => d.id !== designId);
      setDesigns(updatedDesigns);
      
      if (selectedDesign?.id === designId) {
        setSelectedDesign(null);
      }
      
      alert("Design has been deleted.");
    } catch (err: any) {
      setError(err.message || "Failed to delete design");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSystemDisplayName = (systemType: string) => {
    switch (systemType) {
      case 'cip-ro':
        return 'Membrane Cleaning System (RO)';
      default:
        return systemType;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Design History</h1>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Design History</h1>
        {designs.length > 0 && (
          <button
            onClick={clearAllHistory}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Clear All History
          </button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Design List */}
        <InputCard title="Recent Designs">
          {designs.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No designs found. Create your first design to see it here.
            </div>
          ) : (
            <div className="space-y-3">
              {designs.map((design) => (
                <div
                  key={design.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    selectedDesign?.id === design.id
                      ? 'border-brand-primary bg-brand-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => setSelectedDesign(design)}
                    >
                      <h3 className="font-medium text-gray-900">
                        {getSystemDisplayName(design.systemType)}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(design.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-500">
                        ID: {design.id.slice(-8)}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDesign(design.id);
                        }}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete this design"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Quick summary */}
                  {design.outputJson?.summary && (
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="text-gray-600">
                        Max Flow: <span className="font-medium">{design.outputJson.summary.Fmax} gpm</span>
                      </div>
                      <div className="text-gray-600">
                        Tank: <span className="font-medium">{design.outputJson.summary.tankGal} gal</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </InputCard>

        {/* Design Details */}
        <OutputCard title="Design Details">
          {!selectedDesign ? (
            <div className="text-gray-500 text-center py-8">
              Select a design to view details.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {getSystemDisplayName(selectedDesign.systemType)}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Created: {formatDate(selectedDesign.createdAt)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ID: {selectedDesign.id}
                </p>
              </div>

              {/* Input Parameters */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Input Parameters</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(selectedDesign.inputJson, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Output Summary */}
              {selectedDesign.outputJson?.summary && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Design Summary</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Stage 1 Flow:</span>
                        <span className="ml-2 font-medium">{selectedDesign.outputJson.summary.F1} gpm</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Stage 2 Flow:</span>
                        <span className="ml-2 font-medium">{selectedDesign.outputJson.summary.F2} gpm</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Max Flow:</span>
                        <span className="ml-2 font-medium">{selectedDesign.outputJson.summary.Fmax} gpm</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Tank Size:</span>
                        <span className="ml-2 font-medium">{selectedDesign.outputJson.summary.tankGal} gal</span>
                      </div>
                      {selectedDesign.outputJson.summary.heaterKW && (
                        <div>
                          <span className="text-gray-600">Heater Power:</span>
                          <span className="ml-2 font-medium">{selectedDesign.outputJson.summary.heaterKW} kW</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* BOM Preview */}
              {selectedDesign.outputJson?.bom && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Bill of Materials</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-700">
                      {selectedDesign.outputJson.bom.length} items
                    </div>
                    <div className="mt-2 space-y-1">
                      {selectedDesign.outputJson.bom.slice(0, 5).map((item: any, index: number) => (
                        <div key={index} className="text-sm text-gray-600">
                          • {item.qty}x {item.item}
                        </div>
                      ))}
                      {selectedDesign.outputJson.bom.length > 5 && (
                        <div className="text-sm text-gray-500">
                          ... and {selectedDesign.outputJson.bom.length - 5} more items
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    // TODO: Implement duplicate functionality
                    alert('Duplicate functionality coming soon!');
                  }}
                  className="bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Duplicate Design
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement export functionality
                    alert('Export functionality coming soon!');
                  }}
                  className="bg-brand-accent hover:bg-brand-accent/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Export
                </button>
              </div>
            </div>
          )}
        </OutputCard>
      </div>
    </div>
  );
}
