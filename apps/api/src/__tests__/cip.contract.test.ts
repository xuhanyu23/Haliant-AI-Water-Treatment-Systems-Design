import request from 'supertest';
import { app } from '../app.ts';

describe('POST /api/design/cip', () => {
  it('returns valid design result and BOM', async () => {
    const res = await request(app)
      .post('/api/design/cip')
      .send({
        stages: 2,
        vesselsStage1: 6,
        vesselsStage2: 4,
        membranesPerVessel: 6,
        perVesselFlowGPM: 40,
        heater: true,
        mainsHz: 50
      })
      .set('content-type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body?.summary?.F1).toBe(240);
    expect(res.body?.summary?.F2).toBe(160);
    expect(res.body?.summary?.Fmax).toBe(240);
    expect(Array.isArray(res.body?.bom)).toBe(true);
    expect(res.body.bom.length).toBeGreaterThan(0);
  });
});





