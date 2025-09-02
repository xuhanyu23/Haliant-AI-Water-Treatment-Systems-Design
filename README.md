# Water Systems

A monorepo for water treatment system calculations and BOM generation.

## Project Overview

This is a web application for water treatment system design with:
- **Frontend**: Next.js (React + TypeScript) + Tailwind + shadcn/ui, TanStack Query/Table
- **Backend**: Express (TypeScript) with REST routes
- **Shared packages**: calculators, schemas, prompts, ui
- **AI Integration**: GPT-5 for formatting/specs/comments via tool-calling

## Architecture

```
water-systems/
├─ apps/
│  ├─ web/          # Next.js 14 (App Router)
│  └─ api/          # Express + TS
├─ packages/
│  ├─ calculators/  # pure TS engineering rules
│  ├─ schemas/      # Zod schemas
│  ├─ prompts/      # LLM prompts & tool definitions
│  └─ ui/           # shared React components & theme
├─ .env.example
├─ turbo.json
├─ package.json
└─ README.md
```

## Features

- **System Selector**: Menu for different water treatment systems
- **Membrane Cleaning System (RO)**: Functional CIP page with input/output
- **Deterministic Calculations**: Pure TypeScript engineering math
- **AI-Powered Specs**: GPT-5 for polished specifications and comments
- **BOM Generation**: Bill of Materials with costs and specifications

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example apps/api/.env
   # Edit apps/api/.env with your OpenAI API key
   ```

### Development

Run both apps in development mode:

```bash
# Terminal 1 - API
pnpm --filter api dev

# Terminal 2 - Web
pnpm --filter web dev
```

- API: http://localhost:4000
- Web: http://localhost:3000

### Build

```bash
pnpm build
```

## Package Structure

### Apps

- **web**: Next.js frontend with Tailwind CSS and shadcn/ui
- **api**: Express backend with TypeScript and OpenAI integration

### Packages

- **calculators**: Pure TypeScript engineering calculations (no AI)
- **schemas**: Zod schemas for inputs/outputs/BOM (shared by front/back/AI)
- **prompts**: OpenAI system prompts + tool specifications
- **ui**: Shared React components & theme tokens

## Environment Variables

Copy `.env.example` to `apps/api/.env` and configure:

- `OPENAI_API_KEY`: Your OpenAI API key
- `API_ORIGIN`: API server origin (default: http://localhost:4000)
- `WEB_ORIGIN`: Web app origin (default: http://localhost:3000)

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Express, TypeScript, OpenAI API
- **Database**: PostgreSQL (via Prisma - to be added)
- **Package Manager**: pnpm
- **Monorepo**: Turborepo
- **UI Components**: shadcn/ui
- **Data Fetching**: TanStack Query
- **Tables**: TanStack Table
- **Forms**: React Hook Form + Zod
- **Logging**: Pino

## Development Workflow

1. **Calculations**: Pure TypeScript in `packages/calculators`
2. **Schemas**: Zod types in `packages/schemas`
3. **AI Integration**: Prompts and tools in `packages/prompts`
4. **UI Components**: Shared components in `packages/ui`
5. **Frontend**: Next.js app in `apps/web`
6. **Backend**: Express API in `apps/api`

## License

Private project - All rights reserved.
