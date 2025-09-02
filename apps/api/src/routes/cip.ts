import { Router } from "express";
import { z } from "zod";

const router = Router();

// Simplified CIP input schema
const CIPInputSchema = z.object({
  stages: z.literal(2),
  vesselsStage1: z.number().int().min(1),
  vesselsStage2: z.number().int().min(0),
  membranesPerVessel: z.number().int().min(1),
  perVesselFlowGPM: z.number().positive().default(40),
  heater: z.boolean(),
  mainsHz: z.union([z.literal(50), z.literal(60)]),
});

// Simplified calculator function
function cip_calculate(input: z.infer<typeof CIPInputSchema>) {
  const { vesselsStage1, vesselsStage2, perVesselFlowGPM, heater, mainsHz } = input;
  
  const F1 = vesselsStage1 * perVesselFlowGPM;
  const F2 = vesselsStage2 * perVesselFlowGPM;
  const Fmax = Math.max(F1, F2);
  
  const tankGal = Math.max(400, Math.ceil(Math.max(vesselsStage1 * 40, vesselsStage2 * 40) * 1.5 / 50) * 50);
  const heaterKW = heater ? 40 : null;
  
  const pump = mainsHz === 50
    ? `Goulds e-SH 2.5×3-8 (25SH08), ~7-1/8" trim, ≈240 gpm @ ~110 ft, 15 kW IE3, 50 Hz`
    : `Goulds e-SH 65-160/…, ≈240 gpm @ ~110 ft, 10–15 HP, 60 Hz`;

  const bom = [
    { item: "Pump", qty: 1, specification: pump, comments: "VFD-driven; keep ΔP/vessel ≤10–15 psi" },
    { item: "CIP Tank", qty: 1, specification: `${tankGal} gal 316SS cone-bottom with LL/L/HL switches`, comments: "≥1.5× largest stage volume" },
    ...(heater ? [{
      item: "Heater", qty: 1, specification: `Electric immersion ${heaterKW} kW, RTD + over-temp`, comments: `Heat ${tankGal} gal from 20→35 °C`
    }] : []),
    { item: "Cartridge Filter Housing", qty: 1, specification: `30-round, 30", 5 µm absolute, ≥${Fmax} gpm` },
    { item: "Filter Cartridges", qty: Math.ceil(Fmax / 10), specification: `30" 5 µm absolute (PP/nylon), high-temp`, comments: `Design ~10 gpm per cartridge` },
    { item: "Mag Flowmeter", qty: 1, specification: `0–300 gpm, 2–4"`, comments: "One per active loop" },
    { item: "Pressure Gauges/Transmitters", qty: 2, specification: "Feed & return headers" },
    { item: "Valves & Piping", qty: 1, specification: `316L SS headers 4", branches 2"`, comments: "Stage-select + reverse-flow ties" },
    { item: "Controls (PLC + HMI)", qty: 1, specification: "Recipe selector, permissives, logging" }
  ];

  return {
    summary: { F1, F2, Fmax, tankGal, heaterKW, pump },
    bom
  };
}

router.post("/", (req, res) => {
  const parsed = CIPInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const result = cip_calculate(parsed.data);
  return res.json(result);
});

export default router;
