"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { InputCard, OutputCard, SummaryChip, LoadingSpinner, DataTable, ExportCSV, ExportXLSX, AIAssistant } from "@repo/ui";
import { createColumnHelper } from "@tanstack/react-table";
import { post } from "../../../src/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

const CIPInputSchema = z.object({
  stages: z.literal(2),
  vesselsStage1: z.number().int().min(1),
  vesselsStage2: z.number().int().min(0),
  membranesPerVessel: z.number().int().min(1),
  perVesselFlowGPM: z.number().positive().default(40),
  heater: z.boolean(),
  mainsHz: z.union([z.literal(50), z.literal(60)]),
  startTempC: z.number().default(20),
  targetTempC: z.number().default(35),
  headAssumptionFt: z.number().default(110),
  gpmPerCartridge: z.number().default(10),
});

type CIPInput = z.infer<typeof CIPInputSchema>;

interface BomRow {
  item: string;
  qty: number;
  unitCost?: number | null;
  extendedCost?: number | null;
  specification: string;
  comments?: string;
}

interface CIPDesignResult {
  summary: {
    F1: number;
    F2: number;
    Fmax: number;
    tankGal: number;
    heaterKW: number | null;
    pump: string;
  };
  bom: BomRow[];
}

export default function CIPROPage() {
  const [result, setResult] = useState<CIPDesignResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useLLM, setUseLLM] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CIPInput>({
    resolver: zodResolver(CIPInputSchema),
    defaultValues: {
      stages: 2,
      vesselsStage1: 6,
      vesselsStage2: 4,
      membranesPerVessel: 6,
      perVesselFlowGPM: 40,
      heater: true,
      mainsHz: 50,
      startTempC: 20,
      targetTempC: 35,
      headAssumptionFt: 110,
      gpmPerCartridge: 10,
    },
  });

  // Watch all form values for AI Assistant context
  const currentParameters = watch();

  const onSubmit = async (data: CIPInput) => {
    setLoading(true);
    setError(null);
    try {
      const url = useLLM ? "/api/design/cip?useLLM=true" : "/api/design/cip";
      const response = await post(url, data);
      setResult(response);
    } catch (err: any) {
      setError(err.message || "Failed to calculate design");
    } finally {
      setLoading(false);
    }
  };

  const columnHelper = createColumnHelper<BomRow>();
  const columns = [
    columnHelper.accessor("item", {
      header: "Item",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("qty", {
      header: "Qty",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("unitCost", {
      header: "Unit Cost ($)",
      cell: (info) => {
        const value = info.getValue();
        return value ? `$${value.toFixed(2)}` : "-";
      },
    }),
    columnHelper.accessor("extendedCost", {
      header: "Extended ($)",
      cell: (info) => {
        const value = info.getValue();
        return value ? `$${value.toFixed(2)}` : "-";
      },
    }),
    columnHelper.accessor("specification", {
      header: "Specification",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("comments", {
      header: "Comments",
      cell: (info) => info.getValue() || "-",
    }),
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Membrane Cleaning System (RO)</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Card */}
        <InputCard title="Input Parameters">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stage 1 Vessels
                </label>
                <input
                  type="number"
                  {...register("vesselsStage1", { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                {errors.vesselsStage1 && (
                  <p className="text-red-500 text-sm mt-1">{errors.vesselsStage1.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stage 2 Vessels
                </label>
                <input
                  type="number"
                  {...register("vesselsStage2", { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                {errors.vesselsStage2 && (
                  <p className="text-red-500 text-sm mt-1">{errors.vesselsStage2.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Membranes per Vessel
              </label>
              <input
                type="number"
                {...register("membranesPerVessel", { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              {errors.membranesPerVessel && (
                <p className="text-red-500 text-sm mt-1">{errors.membranesPerVessel.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Per Vessel Flow (GPM)
              </label>
              <input
                type="number"
                step="0.1"
                {...register("perVesselFlowGPM", { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              {errors.perVesselFlowGPM && (
                <p className="text-red-500 text-sm mt-1">{errors.perVesselFlowGPM.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mains Frequency
                </label>
                <select
                  {...register("mainsHz")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <option value={50}>50 Hz</option>
                  <option value={60}>60 Hz</option>
                </select>
                {errors.mainsHz && (
                  <p className="text-red-500 text-sm mt-1">{errors.mainsHz.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Head Assumption (ft)
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...register("headAssumptionFt", { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                {errors.headAssumptionFt && (
                  <p className="text-red-500 text-sm mt-1">{errors.headAssumptionFt.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...register("startTempC", { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                {errors.startTempC && (
                  <p className="text-red-500 text-sm mt-1">{errors.startTempC.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...register("targetTempC", { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                {errors.targetTempC && (
                  <p className="text-red-500 text-sm mt-1">{errors.targetTempC.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GPM per Cartridge
              </label>
              <input
                type="number"
                step="0.1"
                {...register("gpmPerCartridge", { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
              {errors.gpmPerCartridge && (
                <p className="text-red-500 text-sm mt-1">{errors.gpmPerCartridge.message}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register("heater")}
                className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Include Heater
              </label>
            </div>

            {/* AI Enhancement Toggle */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={useLLM}
                      onChange={(e) => setUseLLM(e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-purple-700">AI Enhancement</span>
                  </label>
                  <p className="mt-1 text-xs text-purple-600">
                    Use AI to enhance specifications and comments with industry standards and detailed notes
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-purple-600">GPT-4o</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary hover:bg-brand-primary/90 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Calculating...
                </div>
              ) : (
                "Calculate Design"
              )}
            </button>
          </form>
        </InputCard>

        {/* Output Card */}
        <OutputCard title="Design Results">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {!result && !loading && (
            <div className="text-gray-500 text-center py-8">
              Run a design to see results.
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* AI Enhancement Indicator */}
              {useLLM && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-sm font-medium text-purple-700">AI Enhanced</span>
                  </div>
                  <p className="text-xs text-purple-600 mt-1">
                    Specifications and comments have been enhanced with AI for better procurement and installation guidance
                  </p>
                </div>
              )}

              {/* Summary Chips */}
              <div className="grid grid-cols-2 gap-4">
                <SummaryChip label="Stage 1 Flow" value={result.summary.F1} unit="gpm" />
                <SummaryChip label="Stage 2 Flow" value={result.summary.F2} unit="gpm" />
                <SummaryChip label="Max Flow" value={result.summary.Fmax} unit="gpm" />
                <SummaryChip label="Tank Size" value={result.summary.tankGal} unit="gal" />
                {result.summary.heaterKW && (
                  <SummaryChip label="Heater Power" value={result.summary.heaterKW} unit="kW" />
                )}
              </div>

              {/* Pump Selection */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Pump Selection</h3>
                <p className="text-sm text-gray-700">{result.summary.pump}</p>
              </div>

              {/* BOM Table */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Bill of Materials</h3>
                  <div className="flex gap-2">
                    <ExportCSV data={result.bom} filename="cip-bom.csv" />
                    <ExportXLSX data={result.bom} filename="cip-bom.xlsx" />
                  </div>
                </div>
                <DataTable data={result.bom} columns={columns} />
              </div>
            </div>
          )}
        </OutputCard>
      </div>
      
      {/* AI Assistant */}
      <AIAssistant
        isOpen={aiAssistantOpen}
        onToggle={() => setAiAssistantOpen(!aiAssistantOpen)}
        systemContext={{
          systemType: 'cip-ro',
          currentParameters,
          designResults: result,
        }}
      />
    </div>
  );
}
