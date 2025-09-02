import {
  CIPInput,
  CIPDesignResult,
} from "@water/schemas";

const roundUpTo = (step: number, v: number) => Math.ceil(v / step) * step;

export function cip_calculate(input: CIPInput): CIPDesignResult {
  const {
    vesselsStage1, vesselsStage2, perVesselFlowGPM,
    heater, mainsHz, startTempC, targetTempC,
    gpmPerCartridge, headAssumptionFt,
  } = input;

  const F1 = vesselsStage1 * perVesselFlowGPM;   // gpm
  const F2 = vesselsStage2 * perVesselFlowGPM;   // gpm
  const Fmax = Math.max(F1, F2);

  // Tank sizing: ~40 gal per 8" vessel, with ~1.5× largest stage volume (min 400 gal, round to 50)
  const V1 = vesselsStage1 * 40;
  const V2 = vesselsStage2 * 40;
  const tankGal = Math.max(400, roundUpTo(50, Math.max(V1, V2) * 1.5));

  // Heater sizing (kWh), then choose catalog band 36–45 kW if heater=true
  const massKg = tankGal * 3.785; // ~liters
  const deltaT = Math.max(0, targetTempC - startTempC);
  const energyKWh = (massKg * 4.186 * deltaT) / 3600;
  const heaterKW = heater ? Math.max(36, Math.min(45, Math.ceil(energyKWh * 1.4))) : null;

  // Cartridge count (30" absolute, ~10 gpm/cartridge default)
  const cartridges = Math.ceil(Fmax / gpmPerCartridge);

  // Pump pick defaults (string only; you can let users override later)
  const pump =
    mainsHz === 50
      ? `Goulds e-SH 2.5×3-8 (25SH08), ~7-1/8" trim, ≈240 gpm @ ~${headAssumptionFt} ft, 15 kW IE3, 50 Hz`
      : `Goulds e-SH 65-160/…, ≈240 gpm @ ~${headAssumptionFt} ft, 10–15 HP, 60 Hz`;

  const bom = [
    { item: "Pump", qty: 1, specification: pump, comments: "VFD-driven; keep ΔP/vessel ≤10–15 psi" },
    { item: "CIP Tank", qty: 1, specification: `${tankGal} gal 316SS cone-bottom with LL/L/HL switches`, comments: "≥1.5× largest stage volume" },
    ...(heater ? [{
      item: "Heater", qty: 1, specification: `Electric immersion ${heaterKW} kW, RTD + over-temp`, comments: `Heat ${tankGal} gal from ${startTempC}→${targetTempC} °C`
    }] : []),
    { item: "Cartridge Filter Housing", qty: 1, specification: `30-round, 30", 5 µm absolute, ≥${Fmax} gpm` },
    { item: "Filter Cartridges", qty: cartridges, specification: `30" 5 µm absolute (PP/nylon), high-temp`, comments: `Design ~${gpmPerCartridge} gpm per cartridge` },
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
