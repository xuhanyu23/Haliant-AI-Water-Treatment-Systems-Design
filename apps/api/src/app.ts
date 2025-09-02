import express from 'express';
import cors from 'cors';
import pino from 'pino';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { calculateUnitCost } from './catalog.js';
import { enhanceCIPDesign } from './services/llm.js';
import { AIChatService } from './services/aiChat.js';
import { prisma } from './db/prisma.js';

export const log = pino();

export const app = express();

app.use(cors({ origin: ["http://localhost:3000"], credentials: false }));
app.use(express.json());

const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false });
app.use('/api/', apiLimiter);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/api/test', (req, res) => {
  res.json({ message: 'Test endpoint working', body: req.body });
});

const CIPInputSchema = z.object({
  stages: z.literal(2),
  vesselsStage1: z.number().int().min(1),
  vesselsStage2: z.number().int().min(0),
  membranesPerVessel: z.number().int().min(1),
  perVesselFlowGPM: z.number().positive().default(40),
  heater: z.boolean(),
  mainsHz: z.union([z.literal(50), z.literal(60)]),
});

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
    ...(heater ? [{ item: "Heater", qty: 1, specification: `Electric immersion ${heaterKW} kW, RTD + over-temp`, comments: `Heat ${tankGal} gal from 20→35 °C` }] : []),
    { item: "Cartridge Filter Housing", qty: 1, specification: `30-round, 30", 5 µm absolute, ≥${Fmax} gpm`, comments: "" },
    { item: "Filter Cartridges", qty: Math.ceil(Fmax / 10), specification: `30" 5 µm absolute (PP/nylon), high-temp`, comments: `Design ~10 gpm per cartridge` },
    { item: "Mag Flowmeter", qty: 1, specification: `0–300 gpm, 2–4"`, comments: "One per active loop" },
    { item: "Pressure Gauges/Transmitters", qty: 2, specification: "Feed & return headers", comments: "" },
    { item: "Valves & Piping", qty: 1, specification: `316L SS headers 4", branches 2"`, comments: "Stage-select + reverse-flow ties" },
    { item: "Controls (PLC + HMI)", qty: 1, specification: "Recipe selector, permissives, logging", comments: "" }
  ];
  const bomWithCosts = bom.map(item => {
    const { unitCost, extendedCost } = calculateUnitCost(item.item, item.specification, item.qty);
    return { 
      ...item, 
      unitCost: unitCost ?? null, 
      extendedCost: extendedCost ?? null,
      comments: item.comments || ""
    };
  });
  return { summary: { F1, F2, Fmax, tankGal, heaterKW, pump }, bom: bomWithCosts };
}

app.post('/api/design/cip', async (req, res) => {
  const parsed = CIPInputSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const useLLM = req.query.useLLM === 'true';
  try {
    let result = cip_calculate(parsed.data);
    
    // Apply AI enhancement if requested
    if (useLLM) {
      try {
        result = await enhanceCIPDesign({ input: parsed.data, result }) as typeof result;
      } catch (e) {
        log.error('AI enhancement failed:', e);
        // Continue with unenhanced result
      }
    }
    
    // persist design run
    try {
      await prisma.designRun.create({
        data: {
          systemType: 'cip-ro',
          inputJson: parsed.data as unknown as object,
          outputJson: result as unknown as object,
        },
      });
    } catch (e) {
      log.error('Failed to persist design run', e as any);
    }
    return res.json(result);
  } catch (error) {
    log.error('CIP calculation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// list recent designs
app.get('/api/design', async (_req, res) => {
  const rows = await prisma.designRun.findMany({ orderBy: { createdAt: 'desc' }, take: 25 });
  res.json(rows);
});

// get design by id
app.get('/api/design/:id', async (req, res) => {
  const row = await prisma.designRun.findUnique({ where: { id: req.params.id } });
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// delete specific design
app.delete('/api/design/:id', async (req, res) => {
  try {
    await prisma.designRun.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    log.error('Error deleting design:', error);
    res.status(404).json({ error: 'Design not found' });
  }
});

// clear all design history
app.delete('/api/design', async (_req, res) => {
  try {
    const result = await prisma.designRun.deleteMany();
    res.json({ success: true, deletedCount: result.count });
  } catch (error) {
    log.error('Error clearing design history:', error);
    res.status(500).json({ error: 'Failed to clear design history' });
  }
});

// AI Chat Service
const aiChatService = new AIChatService();

const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })),
  systemContext: z.object({
    systemType: z.string(),
    currentParameters: z.any().optional(),
    designResults: z.any().optional(),
  }),
});

app.post('/api/ai/chat', async (req, res) => {
  const parsed = ChatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { messages, systemContext } = parsed.data;
  
  try {
    const response = await aiChatService.generateResponse(messages, systemContext);
    res.json({ 
      message: {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    log.error('AI chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Parameter validation endpoint
app.post('/api/ai/validate', async (req, res) => {
  const ValidationRequestSchema = z.object({
    parameters: z.any(),
    systemType: z.string(),
  });

  const parsed = ValidationRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { parameters, systemType } = parsed.data;
  
  try {
    const warnings = aiChatService.validateParameters(parameters, systemType);
    res.json({ warnings });
  } catch (error) {
    log.error('Parameter validation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


