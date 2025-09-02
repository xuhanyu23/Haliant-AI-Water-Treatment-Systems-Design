import { z } from "zod";

export const CIPInputSchema = z.object({
  stages: z.literal(2),                       // MVP supports 2 stages
  vesselsStage1: z.number().int().min(1),
  vesselsStage2: z.number().int().min(0),
  membranesPerVessel: z.number().int().min(1),
  perVesselFlowGPM: z.number().positive().default(40),
  heater: z.boolean(),
  mainsHz: z.union([z.literal(50), z.literal(60)]),
  startTempC: z.number().default(20),
  targetTempC: z.number().default(35),
  headAssumptionFt: z.number().default(110),
  gpmPerCartridge: z.number().default(10)
});
export type CIPInput = z.infer<typeof CIPInputSchema>;

export const BomRowSchema = z.object({
  item: z.string(),
  qty: z.number().positive(),
  unitCost: z.number().nullable().optional(),
  extendedCost: z.number().nullable().optional(),
  specification: z.string(),
  comments: z.string().optional(),
  catalogItemId: z.string().optional()
});
export type BomRow = z.infer<typeof BomRowSchema>;

export const CIPDesignResultSchema = z.object({
  summary: z.object({
    F1: z.number(),
    F2: z.number(),
    Fmax: z.number(),
    tankGal: z.number(),
    heaterKW: z.number().nullable(),
    pump: z.string()
  }),
  bom: z.array(BomRowSchema)
});
export type CIPDesignResult = z.infer<typeof CIPDesignResultSchema>;
