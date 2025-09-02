import { describe, it, expect } from 'vitest';
import { cip_calculate } from '../cip.js';

describe('cip_calculate', () => {
  it('computes expected summary values for baseline case', () => {
    const res = cip_calculate({
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
    } as any);

    expect(res.summary.F1).toBe(240);
    expect(res.summary.F2).toBe(160);
    expect(res.summary.Fmax).toBe(240);
    expect(res.summary.tankGal).toBeGreaterThanOrEqual(400);
    expect(res.summary.heaterKW).toBeGreaterThanOrEqual(36);
    expect(res.summary.heaterKW).toBeLessThanOrEqual(45);
    expect(res.bom.length).toBeGreaterThan(0);
  });
});





