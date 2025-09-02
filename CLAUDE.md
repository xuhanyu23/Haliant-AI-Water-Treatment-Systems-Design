# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development Setup
```bash
# Install dependencies
pnpm install

# Environment setup - copy .env.example to apps/api/.env and configure OPENAI_API_KEY
cp .env.example apps/api/.env

# Development (run in separate terminals)
pnpm --filter api dev     # API server on :4000
pnpm --filter web dev     # Web app on :3000

# Or run everything with turborepo
pnpm dev
```

### Build & Deploy
```bash
pnpm build                # Build all packages
pnpm --filter web build   # Build specific workspace
pnpm --filter api build
```

### Testing & Quality
```bash
pnpm lint                 # Lint all packages
pnpm check-types          # TypeScript check all packages
pnpm --filter api test    # Run API tests (vitest)
pnpm --filter calculators test  # Run calculator tests

# Run single test file
cd apps/api && pnpm vitest src/__tests__/cip.contract.test.ts
```

### Database Operations
```bash
cd apps/api
npx prisma generate       # Generate Prisma client
npx prisma db push        # Sync schema to database
npx prisma studio         # Database GUI
```

## Architecture

### Monorepo Structure
- **Turborepo + pnpm workspaces** for orchestration
- **apps/web**: Next.js 15 frontend (App Router)
- **apps/api**: Express TypeScript backend
- **packages/**: Shared libraries across apps

### Key Architectural Patterns

#### Data Flow: Frontend → Backend → AI Enhancement
1. **Frontend**: React Hook Form + Zod validation → API call via `src/lib/api.ts`
2. **Backend**: Express route validates with Zod → pure calculations → optional AI enhancement → database persistence
3. **AI**: GPT-4o-mini enhances BOM specifications when `useLLM=true` query param is present

#### Shared Type Safety
- **packages/schemas**: Zod schemas shared between frontend/backend
- Same validation schema (e.g., `CIPInputSchema`) used in frontend forms and API routes
- TypeScript types generated from Zod schemas for end-to-end type safety

#### Pure Engineering Calculations
- **packages/calculators**: Pure TypeScript functions for water treatment engineering math
- No dependencies on external services or AI - deterministic engineering calculations only
- Example: `cip_calculate()` computes flow rates, tank sizing, heater power from first principles

#### AI as Optional Enhancement Layer
- Core calculations always work without AI
- AI enhancement in `apps/api/src/services/llm.ts` adds professional specifications to BOM
- Graceful fallbacks: if OpenAI fails, returns unenhanced results
- Lazy OpenAI client creation - only requires API key when AI features are used

### Package Dependencies
```
apps/web → @repo/ui, @water/schemas
apps/api → @water/calculators, @water/schemas, OpenAI, Prisma
packages/calculators → @water/schemas
packages/schemas → zod (shared validation)
packages/ui → React components + Tailwind
packages/prompts → OpenAI system prompts (stub)
```

### Data Models
**Prisma Schema** (`apps/api/prisma/schema.prisma`):
- `DesignRun`: Stores user inputs and calculation results as JSON
- `CatalogItem`: Equipment catalog for cost estimation
- SQLite for development, easily switchable to PostgreSQL

### Frontend Architecture
- **Next.js App Router** with TypeScript
- **TanStack Query** for server state management
- **TanStack Table** for BOM data tables
- **shadcn/ui** components from `@repo/ui` package
- **Tailwind CSS** with shared design tokens

### API Architecture
- **Express** with TypeScript ESM modules
- **Zod validation** for request/response schemas
- **Pino logging** with structured logs
- **Rate limiting** and CORS configuration
- **OpenAI integration** for AI enhancement features

## Environment Variables

Copy `.env.example` to `apps/api/.env`:
- `OPENAI_API_KEY`: Required for AI enhancement features
- `DATABASE_URL`: SQLite file path (default: "file:./dev.db")
- `API_ORIGIN`: API server URL for CORS
- `WEB_ORIGIN`: Frontend URL for CORS

## Development Workflow

### Adding New Water Treatment Systems
1. **Schema**: Define input/output schemas in `packages/schemas/`
2. **Calculator**: Pure calculation logic in `packages/calculators/`
3. **API Route**: Add route in `apps/api/src/app.ts` with validation
4. **Frontend**: Create page in `apps/web/app/systems/[system-name]/`
5. **AI Enhancement**: Add system-specific prompts in `apps/api/src/services/llm.ts`

### Testing Strategy
- **Unit tests**: `packages/calculators` for pure engineering math
- **Integration tests**: `apps/api/src/__tests__/` for API contract testing
- **Vitest** configuration per workspace with globals enabled

### Cost Calculation System
- `apps/api/src/catalog.ts` provides fuzzy matching for equipment costs
- Extensible catalog system with quantity discounts
- Costs optional - engineering calculations work without pricing data

## Current Implementation Status
- **Membrane Cleaning System (RO)**: Fully functional with frontend/backend/AI
- **Other systems**: Placeholders in frontend menu, ready for implementation following the established patterns