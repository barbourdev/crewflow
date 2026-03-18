# CrewFlow

> Framework open source de orquestração multi-agente com interface web completa.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[English](README.en.md)

O CrewFlow permite criar, executar e monitorar equipes de agentes IA (squads) através de uma interface web visual. Monte fluxos de trabalho automatizados para criação de conteúdo, code review, análise de dados, DevOps e mais — tudo rodando localmente na sua máquina.

## Funcionalidades

- **Squad Builder Visual** — Crie equipes de agentes com um wizard intuitivo ou modelos prontos
- **Monitoramento em Tempo Real** — Acompanhe cada agente trabalhando com streaming ao vivo
- **Squads Universais** — Não só conteúdo: dev, QA, análise, DevOps e fluxos personalizados
- **Personas Ricas** — Cada agente tem personalidade, princípios, voz e critérios de qualidade
- **Sistema de Integrações** — Estenda agentes com plugins (MCP, scripts, prompts)
- **Aprovações** — Pause fluxos para revisão e aprovação humana
- **10 Modelos Prontos** — Instagram Carousel, Code Review, Bug Fix e mais
- **22 Boas Práticas** — Conhecimento embutido para plataformas e disciplinas
- **Zero Config** — Clone, instale, rode. SQLite, sem Redis, sem Docker obrigatório
- **Roda Local** — Seus dados ficam na sua máquina. Sem dependência de cloud (exceto APIs de IA)

## Início Rápido

```bash
git clone <repo-url>
cd crewflow
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) — pronto.

No primeiro acesso, o CrewFlow vai:
1. Criar o banco SQLite automaticamente
2. Popular com modelos, integrações e boas práticas
3. Guiar você por um onboarding rápido

> **Nota:** Você precisa de uma [API key da Anthropic](https://console.anthropic.com/) para rodar squads. Configure durante o onboarding ou em Configurações.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, shadcn/ui, Zustand |
| Backend | Next.js API Routes, Prisma ORM, WebSocket |
| Banco | SQLite (zero-config, arquivo local) |
| IA | Anthropic Claude API, OpenAI API (fallback) |
| Monorepo | Turborepo |

## Estrutura do Projeto

```
crewflow/
├── apps/web/          # App Next.js (frontend + API + WebSocket)
├── packages/
│   ├── engine/        # Motor de execução de pipelines
│   ├── ai/            # Abstração de provedores IA
│   └── shared/        # Tipos e schemas compartilhados
└── data/              # Banco SQLite (criado automaticamente)
```

## Modelos de Squads

### Conteúdo
| Modelo | Agentes | Descrição |
|--------|---------|-----------|
| Instagram Carousel | 5 | Pesquisador → Copywriter → Designer → Revisor → Publicador |
| Blog Post | 5 | Pesquisador → Outline → Redator → SEO → Editor |
| LinkedIn Content | 5 | Pesquisador → Thought Leader → Visual → Editor → Publicador |
| YouTube Script | 5 | Pesquisador → Roteirista → Thumbnail → SEO → Revisor |

### Desenvolvimento
| Modelo | Agentes | Descrição |
|--------|---------|-----------|
| Code Review | 4 | Analisador → Auditor de Segurança → Revisor de Performance → Resumo |
| Bug Fix | 5 | Reprodutor → Análise de Causa → Implementador → Testes → Revisor |
| Landing Page | 5 | Pesquisador → Copywriter → UI Designer → Gerador de Código → QA |
| API Builder | 5 | Requisitos → Schema → Endpoints → Testes → Documentação |
| Database Migration | 5 | Schema → Planejamento → Migration → Rollback → Revisor |
| Refactoring | 5 | Code Smells → Arquitetura → Refatoração → Testes → Revisor |

## Roadmap

- [x] Especificação do projeto
- [x] Documentação de arquitetura
- [x] Schema do banco e dados iniciais
- [x] Rotas da API ([documentação](docs/API.md))
- [ ] Motor de execução de pipelines
- [ ] WebSocket tempo real
- [ ] Dashboard
- [ ] Squad Builder
- [ ] Run View com output ao vivo
- [ ] Galeria de modelos
- [ ] Sistema de integrações
- [ ] UI de aprovações
- [ ] i18n (PT-BR, EN, ES)
- [ ] Execução paralela
- [ ] Memória de agentes
- [ ] Marketplace de integrações

## Contribuindo

Veja [CONTRIBUTING.md](CONTRIBUTING.md) para diretrizes.

## Licença

[MIT](LICENSE)
