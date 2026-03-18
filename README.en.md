# CrewFlow

> Open source multi-agent orchestration framework with a complete web interface.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[Português](README.md)

CrewFlow lets you create, run, and monitor teams of AI agents (squads) through a visual web interface. Build automated workflows for content creation, code review, data analysis, DevOps, and more — all running locally on your machine.

## Features

- **Visual Squad Builder** — Create agent teams through an intuitive wizard or ready-made templates
- **Real-time Monitoring** — Watch each agent work with live streaming output
- **Universal Squads** — Not just content: dev, QA, analysis, DevOps, and custom workflows
- **Rich Agent Personas** — Each agent has personality, principles, voice, and quality criteria
- **Skill System** — Extend agents with plugins (MCP, scripts, prompts)
- **Checkpoints** — Pause workflows for human review and approval
- **10 Ready-made Templates** — Instagram Carousel, Code Review, Bug Fix, and more
- **22 Best Practices** — Built-in knowledge for platforms and disciplines
- **Zero Config** — Clone, install, run. SQLite, no Redis, no Docker required.
- **Runs Locally** — Your data stays on your machine. No cloud dependency (except AI APIs).

## Quick Start

```bash
git clone <repo-url>
cd crewflow
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — that's it.

On first launch, CrewFlow will:
1. Create the SQLite database automatically
2. Seed it with templates, skills, and best practices
3. Guide you through a quick onboarding wizard

> **Note:** You'll need an [Anthropic API key](https://console.anthropic.com/) to run squads. You can configure it during onboarding or in Settings.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, shadcn/ui, Zustand |
| Backend | Next.js API Routes, Prisma ORM, WebSocket |
| Database | SQLite (zero-config, local file) |
| AI | Anthropic Claude API, OpenAI API (fallback) |
| Monorepo | Turborepo |

## Project Structure

```
crewflow/
├── apps/web/          # Next.js app (frontend + API + WebSocket)
├── packages/
│   ├── engine/        # Pipeline execution engine
│   ├── ai/            # AI provider abstraction
│   └── shared/        # Shared types and schemas
└── data/              # SQLite database (auto-created)
```

## Squad Templates

### Content
| Template | Agents | Description |
|----------|--------|-------------|
| Instagram Carousel | 5 | Researcher → Copywriter → Designer → Reviewer → Publisher |
| Blog Post | 5 | Topic Researcher → Outline Writer → Content Writer → SEO Optimizer → Editor |
| LinkedIn Content | 5 | Market Researcher → Thought Leadership Writer → Visual Creator → Editor → Publisher |
| YouTube Script | 5 | Topic Researcher → Script Writer → Thumbnail Designer → SEO Optimizer → Reviewer |

### Development
| Template | Agents | Description |
|----------|--------|-------------|
| Code Review | 4 | Code Analyzer → Security Auditor → Performance Reviewer → Summary Writer |
| Bug Fix | 5 | Bug Reproducer → Root Cause Analyzer → Fix Implementer → Test Writer → Reviewer |
| Landing Page | 5 | Market Researcher → Copywriter → UI Designer → Code Generator → QA Tester |
| API Builder | 5 | Requirements Analyzer → Schema Designer → Endpoint Implementer → Test Writer → Doc Writer |
| Database Migration | 5 | Schema Analyzer → Migration Planner → Migration Writer → Rollback Planner → Reviewer |
| Refactoring | 5 | Code Smell Detector → Architecture Planner → Refactorer → Test Updater → Reviewer |

## Roadmap

- [x] Project specification
- [x] Architecture documentation
- [ ] Database schema and seed data
- [ ] Pipeline execution engine
- [ ] API routes
- [ ] WebSocket real-time updates
- [ ] Dashboard page
- [ ] Squad Builder
- [ ] Run View with live output
- [ ] Template gallery
- [ ] Skill system
- [ ] Checkpoint UI
- [ ] i18n (PT-BR, EN, ES)
- [ ] Parallel execution
- [ ] Agent memory
- [ ] Skill marketplace

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE)
