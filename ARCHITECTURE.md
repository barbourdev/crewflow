# CrewFlow - Arquitetura Tecnica

> **Versao:** 1.0.0
> **Ultima Atualizacao:** 2026-03-17
> **Status:** Referencia Definitiva

---

## 1. Visao Geral do Sistema

CrewFlow e um framework de orquestracao multi-agente, open-source, executado localmente, com interface web. Ele permite que usuarios componham squads de agentes de IA, definam pipelines de execucao e observem runs em tempo real -- tudo a partir de um unico comando `npm run dev` sem dependencias externas.

### Arquitetura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Browser (Client)                           │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────────┐ │
│  │  React UI    │  │  Zustand     │  │  WebSocket Client         │ │
│  │  (shadcn/ui) │  │  Stores      │  │  (eventos em tempo real)  │ │
│  └──────┬───────┘  └──────┬───────┘  └─────────────┬─────────────┘ │
│         │                 │                         │               │
└─────────┼─────────────────┼─────────────────────────┼───────────────┘
          │ HTTP            │ State                   │ WS
          ▼                 ▼                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Next.js 16 (Server)                             │
│                                                                     │
│  ┌──────────────────────┐  ┌──────────────────────────────────────┐ │
│  │  App Router          │  │  API Routes                         │ │
│  │  (Server Components) │  │  /api/squads, /api/runs, ...        │ │
│  └──────────────────────┘  └──────────────┬───────────────────────┘ │
│                                           │                         │
│  ┌────────────────────────────────────────┼───────────────────────┐ │
│  │              WebSocket Server          │                       │ │
│  │              (biblioteca ws)           │                       │ │
│  └────────────────────────────────────────┼───────────────────────┘ │
│                                           │                         │
│  ┌────────────────────────────────────────▼───────────────────────┐ │
│  │                    Pipeline Engine                             │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌────────────────────────┐ │ │
│  │  │ Pipeline     │ │ Agent        │ │ Checkpoint / Veto /    │ │ │
│  │  │ Runner       │ │ Executor     │ │ Handoff Managers       │ │ │
│  │  └──────┬───────┘ └──────┬───────┘ └────────────────────────┘ │ │
│  │         │                │                                     │ │
│  │  ┌──────▼───────┐ ┌──────▼───────┐                            │ │
│  │  │ p-queue      │ │ AI Providers │                            │ │
│  │  │ (fila jobs)  │ │ (Claude/GPT) │                            │ │
│  │  └──────────────┘ └──────────────┘                            │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    Camada de Dados                             │ │
│  │  ┌──────────────┐ ┌──────────────────────────────────────────┐ │ │
│  │  │ Prisma ORM   │ │ SQLite (arquivo: data/app.db)           │ │ │
│  │  └──────────────┘ └──────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     APIs Externas de IA                              │
│  ┌──────────────────────┐  ┌──────────────────────────────────────┐ │
│  │  Anthropic (Claude)  │  │  OpenAI (GPT-4o, etc.)             │ │
│  └──────────────────────┘  └──────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Stack Tecnologico

| Camada      | Tecnologia                          | Proposito                            |
|-------------|-------------------------------------|--------------------------------------|
| Frontend    | Next.js 16, React 19, TypeScript    | Framework de UI, SSR, roteamento     |
| Estilizacao | Tailwind CSS 4, shadcn/ui          | CSS utilitario, componentes          |
| Estado      | Zustand                             | Gerenciamento de estado no cliente   |
| Backend     | Next.js API Routes                  | API REST, servidor em porta unica    |
| Tempo real  | ws (WebSocket)                      | Saida em streaming, atualizacoes ao vivo |
| ORM         | Prisma                              | Acesso tipado ao banco de dados      |
| Banco       | SQLite (modo WAL)                   | Persistencia sem configuracao        |
| Fila        | p-queue                             | Concorrencia de jobs em processo     |
| IA          | Anthropic SDK, OpenAI SDK           | Integracoes com provedores de LLM    |
| Validacao   | Zod                                 | Validacao de schemas em runtime      |
| Build       | Turborepo                           | Orquestracao de build no monorepo    |
| Testes      | Vitest, Playwright                  | Testes unitarios, integracao, E2E    |

---

## 2. Estrutura do Monorepo

O projeto usa **Turborepo** com tres pacotes e uma aplicacao. O engine e as camadas de IA sao isolados da aplicacao web para permitir uso futuro via CLI, distribuicao como SDK ou frontends alternativos.

```
crewflow/
├── apps/
│   └── web/                            # Aplicacao Next.js 16 (frontend + backend)
│       ├── src/
│       │   ├── app/                    # Paginas do App Router
│       │   │   ├── (auth)/             # Grupo de layout com autenticacao
│       │   │   │   ├── page.tsx                    # Dashboard /
│       │   │   │   ├── templates/page.tsx          # /templates
│       │   │   │   ├── squads/
│       │   │   │   │   ├── new/page.tsx            # /squads/new
│       │   │   │   │   └── [id]/
│       │   │   │   │       ├── page.tsx            # /squads/[id]
│       │   │   │   │       └── runs/[runId]/page.tsx  # Detalhe do Run
│       │   │   │   ├── integrations/page.tsx       # /integrations
│       │   │   │   └── settings/page.tsx           # /settings
│       │   │   ├── welcome/page.tsx                # Onboarding (sem autenticacao)
│       │   │   ├── api/                            # Rotas de API
│       │   │   │   ├── squads/
│       │   │   │   │   ├── route.ts                # POST, GET (listar)
│       │   │   │   │   └── [id]/
│       │   │   │   │       ├── route.ts            # GET, PUT, DELETE
│       │   │   │   │       ├── run/route.ts        # POST (iniciar run)
│       │   │   │   │       └── runs/route.ts       # GET (listar runs)
│       │   │   │   ├── agents/
│       │   │   │   │   └── [id]/route.ts           # GET, PUT
│       │   │   │   ├── runs/
│       │   │   │   │   └── [id]/
│       │   │   │   │       ├── route.ts            # GET (detalhe do run)
│       │   │   │   │       ├── steps/route.ts      # GET (etapas + saidas)
│       │   │   │   │       ├── checkpoint/route.ts # POST (resposta do checkpoint)
│       │   │   │   │       ├── pause/route.ts      # POST
│       │   │   │   │       ├── resume/route.ts     # POST
│       │   │   │   │       └── cancel/route.ts     # POST
│       │   │   │   ├── skills/
│       │   │   │   │   ├── route.ts                # GET (listar)
│       │   │   │   │   └── [id]/
│       │   │   │   │       ├── route.ts            # GET (detalhe)
│       │   │   │   │       └── install/route.ts    # POST
│       │   │   │   ├── templates/
│       │   │   │   │   ├── route.ts                # GET (listar)
│       │   │   │   │   └── [id]/
│       │   │   │   │       ├── route.ts            # GET (detalhe)
│       │   │   │   │       └── use/route.ts        # POST (criar squad)
│       │   │   │   ├── settings/
│       │   │   │   │   ├── route.ts                # GET, PUT
│       │   │   │   │   └── validate-key/route.ts   # POST
│       │   │   │   └── metrics/
│       │   │   │       └── dashboard/route.ts      # GET
│       │   │   ├── layout.tsx
│       │   │   └── globals.css
│       │   ├── components/
│       │   │   ├── ui/                 # Primitivos shadcn/ui (Button, Dialog, etc.)
│       │   │   ├── layout/             # Shell, Sidebar, Header, Footer
│       │   │   ├── squad/              # SquadCard, SquadBuilder, FlowViz
│       │   │   ├── agent/              # AgentCard, AgentEditor, PersonaForm
│       │   │   ├── run/                # RunView, StepOutput, ProgressBar
│       │   │   ├── pipeline/           # PipelineEditor, StepCard, StepConnector
│       │   │   └── shared/             # EmptyState, LoadingSpinner, ErrorFallback
│       │   ├── hooks/                  # Hooks React customizados
│       │   │   ├── use-squad.ts
│       │   │   ├── use-run.ts
│       │   │   ├── use-websocket.ts
│       │   │   ├── use-streaming.ts
│       │   │   └── use-i18n.ts
│       │   ├── stores/                 # Stores Zustand
│       │   │   ├── squad-store.ts
│       │   │   ├── run-store.ts
│       │   │   ├── websocket-store.ts
│       │   │   ├── ui-store.ts
│       │   │   └── settings-store.ts
│       │   ├── lib/                    # Utilitarios
│       │   │   ├── api-client.ts       # Wrapper tipado de fetch
│       │   │   ├── ws-client.ts        # Cliente WebSocket com reconexao
│       │   │   ├── encryption.ts       # Criptografia AES-256 de chaves
│       │   │   ├── rate-limit.ts       # Middleware de rate limiting
│       │   │   ├── errors.ts           # Classes de erro e formatador
│       │   │   ├── prisma.ts           # Cliente Prisma singleton
│       │   │   └── utils.ts            # Utilitarios gerais (cn, formatadores)
│       │   ├── types/                  # Definicoes de tipos TypeScript
│       │   │   ├── api.ts              # Tipos de request/response da API
│       │   │   ├── squad.ts
│       │   │   ├── run.ts
│       │   │   ├── agent.ts
│       │   │   └── ws-events.ts        # Definicoes de tipos de eventos WebSocket
│       │   └── i18n/                   # Internacionalizacao
│       │       ├── locales/
│       │       │   ├── pt-BR.json
│       │       │   ├── en.json
│       │       │   └── es.json
│       │       └── index.ts
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/
│       │   └── seed.ts
│       ├── public/
│       │   ├── logo.svg
│       │   └── favicon.ico
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       ├── postcss.config.js
│       ├── components.json             # Configuracao do shadcn/ui
│       └── tsconfig.json
├── packages/
│   ├── engine/                         # Engine de execucao de pipeline (logica pura)
│   │   ├── src/
│   │   │   ├── index.ts               # Exports da API publica
│   │   │   ├── pipeline-runner.ts      # Orquestra execucao de etapas
│   │   │   ├── agent-executor.ts       # Prepara contexto, chama IA
│   │   │   ├── skill-loader.ts         # Resolve e injeta instrucoes de skills
│   │   │   ├── checkpoint-handler.ts   # Pausa execucao, aguarda input do usuario
│   │   │   ├── veto-checker.ts         # Valida saida contra condicoes de veto
│   │   │   ├── handoff-manager.ts      # Gerencia transicoes de estado entre agentes
│   │   │   ├── queue.ts               # Wrapper do p-queue com controle de concorrencia
│   │   │   └── types.ts              # Tipos internos do engine
│   │   ├── __tests__/
│   │   │   ├── pipeline-runner.test.ts
│   │   │   ├── agent-executor.test.ts
│   │   │   ├── veto-checker.test.ts
│   │   │   └── handoff-manager.test.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── ai/                             # Abstracao de provedores de IA
│   │   ├── src/
│   │   │   ├── index.ts               # Exports da API publica
│   │   │   ├── provider.ts            # Interface AIProvider
│   │   │   ├── providers/
│   │   │   │   ├── anthropic.ts       # Integracao com API do Claude
│   │   │   │   └── openai.ts          # Integracao com API da OpenAI
│   │   │   ├── streaming.ts           # Handler unificado de streaming
│   │   │   ├── token-counter.ts       # Utilitarios de contagem de tokens
│   │   │   └── types.ts              # Tipos especificos de IA
│   │   ├── __tests__/
│   │   │   ├── anthropic.test.ts
│   │   │   └── openai.test.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── shared/                         # Tipos e utilitarios compartilhados
│       ├── src/
│       │   ├── index.ts               # Exports da API publica
│       │   ├── types.ts               # Tipos de dominio compartilhados entre pacotes
│       │   ├── schemas.ts             # Schemas Zod para validacao
│       │   └── constants.ts           # Constantes compartilhadas
│       ├── package.json
│       └── tsconfig.json
├── data/                               # Banco SQLite fica aqui (ignorado pelo git)
│   └── .gitkeep
├── turbo.json
├── package.json
├── tsconfig.base.json
├── .env.example
├── .gitignore
├── LICENSE
└── ARCHITECTURE.md
```

### Grafo de Dependencias entre Pacotes

```
apps/web
  ├── @crewflow/engine
  ├── @crewflow/ai
  └── @crewflow/shared

packages/engine
  ├── @crewflow/ai
  └── @crewflow/shared

packages/ai
  └── @crewflow/shared

packages/shared
  └── (sem dependencias internas)
```

### Pipeline do Turborepo (turbo.json)

```jsonc
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "dependsOn": ["^build"],
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "test": {
      "dependsOn": ["^build"]
    },
    "db:push": {
      "cache": false
    },
    "db:seed": {
      "cache": false
    }
  }
}
```

---

## 3. Arquitetura do Backend

### 3.1 Design das Rotas de API

Todas as rotas de API seguem convencoes RESTful. Cada rota valida a entrada com Zod e retorna envelopes de resposta consistentes.

#### Envelope de Resposta

```typescript
// Sucesso
{
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

// Erro
{
  error: string;
  code: string;
  details?: Record<string, unknown>;
}
```

#### Tabela Completa de Rotas

| Metodo   | Caminho                         | Descricao                    | Corpo da Requisicao            | Resposta                        |
|----------|---------------------------------|------------------------------|----------------------------------|---------------------------------|
| `POST`   | `/api/squads`                   | Criar squad                  | `CreateSquadInput`               | `Squad`                         |
| `GET`    | `/api/squads`                   | Listar squads                | —                                | `Squad[]`                       |
| `GET`    | `/api/squads/:id`               | Obter detalhe do squad       | —                                | `Squad` (com agents, pipeline)  |
| `PUT`    | `/api/squads/:id`               | Atualizar squad              | `UpdateSquadInput`               | `Squad`                         |
| `DELETE` | `/api/squads/:id`               | Excluir squad                | —                                | `{ deleted: true }`             |
| `POST`   | `/api/squads/:id/run`           | Iniciar run do pipeline      | `StartRunInput`                  | `Run`                           |
| `GET`    | `/api/squads/:id/runs`          | Listar runs do squad         | `?page&pageSize&status`          | `Run[]`                         |
| `GET`    | `/api/runs/:id`                 | Obter detalhe do run com etapas | —                             | `Run` (com steps)               |
| `GET`    | `/api/runs/:id/steps`           | Obter etapas do run com saidas | —                              | `RunStep[]`                     |
| `POST`   | `/api/runs/:id/checkpoint`      | Enviar resposta do checkpoint | `CheckpointResponseInput`       | `Run`                           |
| `POST`   | `/api/runs/:id/pause`           | Pausar run                   | —                                | `Run`                           |
| `POST`   | `/api/runs/:id/resume`          | Retomar run                  | —                                | `Run`                           |
| `POST`   | `/api/runs/:id/cancel`          | Cancelar run                 | —                                | `Run`                           |
| `GET`    | `/api/agents/:id`               | Obter detalhe do agent       | —                                | `Agent`                         |
| `PUT`    | `/api/agents/:id`               | Atualizar agent              | `UpdateAgentInput`               | `Agent`                         |
| `GET`    | `/api/skills`                   | Listar skills disponiveis    | `?category`                      | `Skill[]`                       |
| `GET`    | `/api/skills/:id`               | Obter detalhe da skill       | —                                | `Skill`                         |
| `POST`   | `/api/skills/:id/install`       | Instalar/habilitar skill     | —                                | `Skill`                         |
| `GET`    | `/api/templates`                | Listar templates             | `?category`                      | `Template[]`                    |
| `GET`    | `/api/templates/:id`            | Obter detalhe do template    | —                                | `Template`                      |
| `POST`   | `/api/templates/:id/use`        | Criar squad a partir de template | `UseTemplateInput`            | `Squad`                         |
| `GET`    | `/api/settings`                 | Obter configuracoes          | —                                | `Settings`                      |
| `PUT`    | `/api/settings`                 | Atualizar configuracoes      | `UpdateSettingsInput`            | `Settings`                      |
| `POST`   | `/api/settings/validate-key`    | Validar chave de API         | `ValidateKeyInput`               | `{ valid: boolean, model?: string }` |
| `GET`    | `/api/metrics/dashboard`        | Metricas do dashboard        | —                                | `DashboardMetrics`              |

#### Tipos Principais de Request/Response

```typescript
// --- Squads ---

interface CreateSquadInput {
  name: string;
  description?: string;
  agents: CreateAgentInput[];
  pipeline: CreatePipelineInput;
}

interface CreateAgentInput {
  name: string;
  role: string;
  persona: string;
  provider: "anthropic" | "openai";
  model: string;
  bestPracticeIds: string[];
  skillIds: string[];
}

interface CreatePipelineInput {
  steps: CreateStepInput[];
}

interface CreateStepInput {
  agentIndex: number;       // Indice no array de agents
  instruction: string;
  inputSource: "user" | "previous_step" | "specific_step";
  inputStepIndex?: number;  // Para specific_step
  checkpoint: boolean;      // Pausar para revisao humana apos a etapa?
  vetoConditions?: string[];
}

// --- Runs ---

interface StartRunInput {
  input: string;            // Input inicial do usuario para o pipeline
  variables?: Record<string, string>;  // Variaveis do template
}

interface CheckpointResponseInput {
  approved: boolean;
  feedback?: string;        // Feedback opcional se nao aprovado
}

// --- Settings ---

interface UpdateSettingsInput {
  anthropicApiKey?: string;
  openaiApiKey?: string;
  defaultProvider?: "anthropic" | "openai";
  defaultModel?: string;
  language?: "pt-BR" | "en" | "es";
  theme?: "dark" | "light" | "system";
}

interface ValidateKeyInput {
  provider: "anthropic" | "openai";
  apiKey: string;
}

// --- Templates ---

interface UseTemplateInput {
  name?: string;            // Sobrescrever nome do template
  variables?: Record<string, string>;
}

// --- Metricas ---

interface DashboardMetrics {
  totalSquads: number;
  totalRuns: number;
  runsToday: number;
  totalTokensUsed: number;
  totalCost: number;
  recentRuns: Run[];
  runsByStatus: Record<RunStatus, number>;
}
```

### 3.2 Pipeline Engine

O engine (`packages/engine`) e o coracao do CrewFlow. Ele e um **pacote de logica pura** sem dependencias de HTTP ou WebSocket. Ele se comunica com a aplicacao hospedeira (a aplicacao web Next.js) atraves de emissores de eventos e interfaces de callback.

#### Visao Geral da Arquitetura

```
┌──────────────────────────────────────────────────────────┐
│                    PipelineRunner                         │
│                                                          │
│  Recebe: Configuracao do Squad + input do usuario        │
│  Emite:  Eventos (step:start, step:output, etc.)         │
│  Retorna: RunResult final                                │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐ │
│  │   Queue    │  │  Handoff   │  │  Checkpoint         │ │
│  │  (p-queue) │  │  Manager   │  │  Handler            │ │
│  └─────┬──────┘  └──────┬─────┘  └──────────┬──────────┘ │
│        │                │                    │            │
│  ┌─────▼────────────────▼────────────────────▼──────────┐ │
│  │              AgentExecutor                            │ │
│  │                                                      │ │
│  │  ┌──────────┐  ┌──────────────┐  ┌────────────────┐  │ │
│  │  │  Skill   │  │  Context     │  │  Veto          │  │ │
│  │  │  Loader  │  │  Composer    │  │  Checker       │  │ │
│  │  └──────────┘  └──────────────┘  └────────────────┘  │ │
│  └──────────────────────┬───────────────────────────────┘ │
│                         │                                 │
│                         ▼                                 │
│                   AIProvider                              │
│              (Anthropic / OpenAI)                         │
└──────────────────────────────────────────────────────────┘
```

#### Maquina de Estados

```
                    ┌─────────┐
                    │ QUEUED  │
                    └────┬────┘
                         │ dequeue
                         ▼
                    ┌─────────┐
             ┌──────│ RUNNING │──────┐
             │      └────┬────┘      │
             │ pause     │           │ erro (apos retry)
             ▼           │           ▼
        ┌─────────┐      │      ┌─────────┐
        │ PAUSED  │      │      │ FAILED  │
        └────┬────┘      │      └─────────┘
             │ resume    │
             ▼           │
        ┌─────────┐      │ todas as etapas completas
        │ RUNNING │      │
        └────┬────┘      ▼
             │      ┌───────────┐
             └─────►│ COMPLETED │
                    └───────────┘

Nota: PAUSED pode ser acionado por:
  1. Usuario pausando explicitamente
  2. Etapa de checkpoint requerendo revisao humana
  3. Condicao de veto acionada

Nota: RUNNING pode transicionar para CANCELLED a qualquer momento
  por solicitacao do usuario.
```

```typescript
type RunStatus = "queued" | "running" | "paused" | "completed" | "failed" | "cancelled";

type StepStatus = "pending" | "running" | "completed" | "failed" | "skipped"
                | "waiting_checkpoint" | "vetoed";
```

#### PipelineRunner

O orquestrador de nivel superior. Ele recebe uma configuracao de squad e input inicial, e entao executa cada etapa em sequencia (ou em paralelo, se configurado).

```typescript
class PipelineRunner {
  private queue: PQueue;
  private emitter: EventEmitter;
  private checkpointHandler: CheckpointHandler;
  private handoffManager: HandoffManager;

  constructor(config: PipelineRunnerConfig) {}

  /**
   * Executa um run completo do pipeline.
   * As etapas sao executadas em ordem. Apos cada etapa:
   *   1. Verifica condicoes de veto
   *   2. Se checkpoint habilitado, pausa para revisao humana
   *   3. Passa a saida para a proxima etapa
   */
  async execute(squad: Squad, input: string): Promise<RunResult> {}

  /**
   * Pausa um pipeline em execucao. A etapa atual e concluida,
   * mas a proxima etapa nao iniciara ate que seja retomada.
   */
  async pause(runId: string): Promise<void> {}

  /**
   * Retoma um pipeline pausado de onde parou.
   */
  async resume(runId: string): Promise<void> {}

  /**
   * Cancela um pipeline em execucao. A etapa atual e abortada
   * se possivel, e o run e marcado como cancelado.
   */
  async cancel(runId: string): Promise<void> {}

  on(event: EngineEvent, handler: EventHandler): void {}
}
```

#### AgentExecutor

Responsavel por compor o contexto do prompt de IA e executar uma unica etapa de agente.

```typescript
class AgentExecutor {
  private skillLoader: SkillLoader;
  private vetoChecker: VetoChecker;
  private aiProvider: AIProvider;

  /**
   * Executa uma unica etapa de agente.
   *
   * Ordem de composicao do contexto (system prompt):
   *   1. Persona do agente (papel + personalidade + estilo de escrita)
   *   2. Boas praticas (diretrizes de conhecimento selecionadas)
   *   3. Instrucoes de skills (orientacao de ferramentas/formato)
   *   4. Instrucao especifica da etapa
   *
   * Mensagem do usuario:
   *   - Input da etapa (input do usuario ou saida da etapa anterior)
   */
  async execute(step: PipelineStep, context: StepContext): Promise<StepResult> {}
}
```

**Detalhe da composicao de contexto:**

```
┌────────────────────────────────────────┐
│           SYSTEM PROMPT                │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ 1. Persona do Agente            │  │
│  │    "Voce e um UX Writer Senior. │  │
│  │     Voce escreve de forma       │  │
│  │     concisa e calorosa..."      │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ 2. Boas Praticas                │  │
│  │    "Sempre use voz ativa..."    │  │
│  │    "Limite paragrafos a 3..."   │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ 3. Instrucoes de Skills         │  │
│  │    "A saida deve ser JSON       │  │
│  │     valido neste schema: {...}" │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ 4. Instrucao da Etapa           │  │
│  │    "Revise o texto da landing   │  │
│  │     page e sugira edicoes."     │  │
│  └──────────────────────────────────┘  │
├────────────────────────────────────────┤
│           MENSAGEM DO USUARIO          │
│                                        │
│  "Aqui esta o texto atual da landing   │
│   page: ..."                           │
│  (ou: saida da etapa anterior)         │
└────────────────────────────────────────┘
```

#### SkillLoader

Resolve referencias de skills e as compila em instrucoes para o prompt.

```typescript
class SkillLoader {
  /**
   * Carrega e compila instrucoes de skills para um agente.
   * Skills podem incluir:
   *   - Restricoes de formato de saida (JSON, Markdown, etc.)
   *   - Diretrizes especificas de dominio
   *   - Instrucoes de uso de ferramentas
   *   - Regras de validacao
   */
  async loadSkills(skillIds: string[]): Promise<CompiledSkills> {}
}
```

#### CheckpointHandler

Gerencia o ciclo de pausa/retomada quando uma etapa esta configurada para revisao humana.

```typescript
class CheckpointHandler {
  /**
   * Pausa a execucao e aguarda resposta do usuario.
   * Emite o evento 'checkpoint:request'.
   * Retorna uma promise que resolve quando o usuario responde
   * via 'checkpoint:response'.
   */
  async waitForCheckpoint(
    runId: string,
    stepId: string,
    output: string
  ): Promise<CheckpointResult> {}

  /**
   * Envia a resposta do usuario para um checkpoint pendente.
   */
  submitResponse(
    runId: string,
    approved: boolean,
    feedback?: string
  ): void {}
}

interface CheckpointResult {
  approved: boolean;
  feedback?: string;
}
```

#### VetoChecker

Valida a saida de uma etapa contra condicoes configuraveis.

```typescript
class VetoChecker {
  /**
   * Verifica se a saida da etapa viola alguma condicao de veto.
   * As condicoes de veto sao regras em linguagem natural que sao
   * avaliadas por uma chamada leve de IA.
   *
   * Exemplos:
   *   - "A saida nao deve conter palavroes"
   *   - "A saida deve ser JSON valido"
   *   - "A saida deve ter menos de 500 palavras"
   *
   * Se um veto e acionado, a etapa e marcada como 'vetoed' e o
   * pipeline pausa para revisao humana.
   */
  async check(output: string, conditions: string[]): Promise<VetoResult> {}
}

interface VetoResult {
  passed: boolean;
  violations: Array<{
    condition: string;
    explanation: string;
  }>;
}
```

#### HandoffManager

Gerencia a transicao de dados entre etapas.

```typescript
class HandoffManager {
  /**
   * Prepara o payload de handoff de uma etapa para a proxima.
   * Lida com:
   *   - Passagem direta da saida (padrao)
   *   - Transformacao da saida (se configurado)
   *   - Agregacao de multiplas fontes (se a etapa recebe input
   *     de multiplas etapas anteriores)
   */
  prepareHandoff(
    fromStep: CompletedStep,
    toStep: PipelineStep,
    allSteps: CompletedStep[]
  ): HandoffPayload {}
}
```

#### Queue (wrapper do p-queue)

```typescript
class ExecutionQueue {
  private queue: PQueue;

  constructor(concurrency: number = 1) {
    // Concorrencia padrao de 1 garante execucao sequencial.
    // Pode ser aumentada para execucao paralela de etapas.
    this.queue = new PQueue({ concurrency });
  }

  /**
   * Adiciona um run de pipeline na fila.
   * Retorna imediatamente com status de enfileirado.
   * O run iniciara quando houver capacidade na fila.
   */
  async enqueue(run: QueuedRun): Promise<void> {}

  /**
   * Obtem o status atual da fila.
   */
  getStatus(): QueueStatus {}
}
```

### 3.3 Eventos WebSocket

WebSocket e usado exclusivamente para comunicacao em tempo real durante runs do pipeline. O servidor mantem uma conexao WebSocket por aba do navegador.

#### Ciclo de Vida da Conexao

```
Cliente                             Servidor
  │                                    │
  │──── WS connect ───────────────────►│
  │◄─── connection:ack ───────────────│
  │                                    │
  │  (inscrever para atualizacoes do run) │
  │──── subscribe:run {runId} ────────►│
  │◄─── subscribed:run {runId} ───────│
  │                                    │
  │  (receber eventos em tempo real)   │
  │◄─── step:start ──────────────────│
  │◄─── step:output (chunk) ─────────│
  │◄─── step:output (chunk) ─────────│
  │◄─── step:complete ───────────────│
  │                                    │
  │  (enviar comandos de controle)     │
  │──── run:pause ────────────────────►│
  │◄─── run:status {paused} ─────────│
  │                                    │
  │──── unsubscribe:run {runId} ──────►│
  │                                    │
  │──── WS disconnect ───────────────►│
```

#### Eventos do Servidor para o Cliente

```typescript
// --- Eventos de nivel do Run ---

interface RunStatusEvent {
  type: "run:status";
  runId: string;
  status: RunStatus;         // queued | running | paused | completed | failed | cancelled
  timestamp: string;
}

interface RunMetricsEvent {
  type: "run:metrics";
  runId: string;
  metrics: {
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    estimatedCost: number;   // USD
    elapsedMs: number;
  };
}

// --- Eventos de nivel da Etapa ---

interface StepStartEvent {
  type: "step:start";
  runId: string;
  stepId: string;
  stepIndex: number;
  agentId: string;
  agentName: string;
  instruction: string;
  timestamp: string;
}

interface StepOutputEvent {
  type: "step:output";
  runId: string;
  stepId: string;
  chunk: string;            // Fragmento de texto em streaming
  accumulated: number;      // Total de caracteres ate o momento
}

interface StepCompleteEvent {
  type: "step:complete";
  runId: string;
  stepId: string;
  output: string;           // Saida completa
  tokens: {
    prompt: number;
    completion: number;
  };
  durationMs: number;
  timestamp: string;
}

interface StepErrorEvent {
  type: "step:error";
  runId: string;
  stepId: string;
  error: string;
  retryable: boolean;
  timestamp: string;
}

// --- Eventos de nivel do Agente ---

interface AgentStatusEvent {
  type: "agent:status";
  runId: string;
  agentId: string;
  status: "idle" | "working" | "delivering" | "done";
}

// --- Eventos de Handoff ---

interface HandoffStartEvent {
  type: "handoff:start";
  runId: string;
  fromAgentId: string;
  toAgentId: string;
  fromStepIndex: number;
  toStepIndex: number;
}

interface HandoffEndEvent {
  type: "handoff:end";
  runId: string;
  fromAgentId: string;
  toAgentId: string;
}

// --- Eventos de Checkpoint ---

interface CheckpointRequestEvent {
  type: "checkpoint:request";
  runId: string;
  stepId: string;
  stepIndex: number;
  output: string;           // A saida a ser revisada
  agentName: string;
  instruction: string;
}
```

#### Eventos do Cliente para o Servidor

```typescript
interface CheckpointResponseEvent {
  type: "checkpoint:response";
  runId: string;
  stepId: string;
  approved: boolean;
  feedback?: string;
}

interface RunPauseEvent {
  type: "run:pause";
  runId: string;
}

interface RunResumeEvent {
  type: "run:resume";
  runId: string;
}

interface RunCancelEvent {
  type: "run:cancel";
  runId: string;
}

interface SubscribeRunEvent {
  type: "subscribe:run";
  runId: string;
}

interface UnsubscribeRunEvent {
  type: "unsubscribe:run";
  runId: string;
}
```

### 3.4 Abstracao de Provedores de IA

O pacote `packages/ai` fornece uma interface unificada para interagir com diferentes provedores de IA. Isso desacopla o engine de qualquer provedor especifico.

#### Interface do Provedor

```typescript
interface AIProvider {
  readonly name: string;
  readonly provider: "anthropic" | "openai";

  /**
   * Gera uma resposta de texto completa (sem streaming).
   * Usado para tarefas leves como verificacao de veto.
   */
  generateText(params: GenerateTextParams): Promise<GenerateTextResult>;

  /**
   * Faz streaming de uma resposta de texto fragmento por fragmento.
   * Usado para execucao de etapas de agentes (caminho principal).
   */
  streamText(params: StreamTextParams): AsyncIterable<StreamChunk>;

  /**
   * Conta tokens para um dado texto.
   * Usado para estimativa de custo e gerenciamento de janela de contexto.
   */
  countTokens(text: string, model: string): Promise<number>;
}

interface GenerateTextParams {
  model: string;
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
  temperature?: number;
}

interface GenerateTextResult {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
  model: string;
  finishReason: "stop" | "max_tokens" | "error";
}

interface StreamTextParams {
  model: string;
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
  temperature?: number;
}

interface StreamChunk {
  type: "text_delta" | "usage" | "done";
  text?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}
```

#### AnthropicProvider

```typescript
class AnthropicProvider implements AIProvider {
  readonly name = "Anthropic";
  readonly provider = "anthropic" as const;

  constructor(apiKey: string) {}

  // Usa @anthropic-ai/sdk
  // Modelos: claude-sonnet-4-20250514, claude-opus-4-20250514, etc.
  // Suporta streaming via messages.stream()
}
```

#### OpenAIProvider

```typescript
class OpenAIProvider implements AIProvider {
  readonly name = "OpenAI";
  readonly provider = "openai" as const;

  constructor(apiKey: string) {}

  // Usa openai SDK
  // Modelos: gpt-4o, gpt-4o-mini, etc.
  // Suporta streaming via chat.completions.create({ stream: true })
}
```

#### Ordem de Composicao do Contexto

Quando o `AgentExecutor` prepara uma chamada para qualquer provedor de IA, o system prompt e montado nesta ordem estrita:

1. **Persona do Agente** -- O papel do agente, personalidade, tom e diretrizes comportamentais
2. **Boas Praticas** -- Diretrizes de conhecimento selecionadas (ex.: "Sempre use voz ativa", "Mantenha paragrafos com no maximo 3 linhas")
3. **Instrucoes de Skills** -- Orientacao de ferramentas e formato (ex.: "A saida deve ser JSON valido correspondendo ao schema X")
4. **Instrucao da Etapa** -- A instrucao especifica da tarefa para esta etapa do pipeline

Essa ordem garante que o contexto de maior prioridade (persona) seja visto primeiro pelo modelo, enquanto as instrucoes especificas da etapa ficam mais proximas da mensagem do usuario.

---

## 4. Arquitetura do Frontend

### 4.1 Gerenciamento de Estado (Zustand)

O frontend usa Zustand para gerenciamento de estado. Cada responsabilidade tem sua propria store, seguindo o principio de separacao. As stores sao mantidas planas e minimas.

#### Definicoes das Stores

```typescript
// --- Squad Store ---
interface SquadStore {
  squads: Squad[];
  currentSquad: Squad | null;
  isLoading: boolean;

  fetchSquads: () => Promise<void>;
  fetchSquad: (id: string) => Promise<void>;
  createSquad: (input: CreateSquadInput) => Promise<Squad>;
  updateSquad: (id: string, input: UpdateSquadInput) => Promise<Squad>;
  deleteSquad: (id: string) => Promise<void>;
  setCurrentSquad: (squad: Squad | null) => void;
}

// --- Run Store ---
interface RunStore {
  runs: Map<string, Run>;             // runId -> Run
  activeRunId: string | null;
  stepOutputs: Map<string, string>;   // stepId -> saida acumulada
  streamingStepId: string | null;

  startRun: (squadId: string, input: string) => Promise<Run>;
  fetchRun: (runId: string) => Promise<void>;
  fetchRunsForSquad: (squadId: string) => Promise<void>;
  updateRunStatus: (runId: string, status: RunStatus) => void;
  appendStepOutput: (stepId: string, chunk: string) => void;
  setStepComplete: (stepId: string, output: string) => void;
  setActiveRun: (runId: string | null) => void;
  submitCheckpoint: (runId: string, approved: boolean, feedback?: string) => void;
  pauseRun: (runId: string) => void;
  resumeRun: (runId: string) => void;
  cancelRun: (runId: string) => void;
}

// --- WebSocket Store ---
interface WebSocketStore {
  status: "connecting" | "connected" | "disconnected" | "reconnecting";
  reconnectAttempts: number;

  connect: () => void;
  disconnect: () => void;
  subscribe: (runId: string) => void;
  unsubscribe: (runId: string) => void;
  send: (event: ClientWSEvent) => void;
}

// --- UI Store ---
interface UIStore {
  sidebarOpen: boolean;
  theme: "dark" | "light" | "system";
  language: "pt-BR" | "en" | "es";

  toggleSidebar: () => void;
  setTheme: (theme: "dark" | "light" | "system") => void;
  setLanguage: (language: "pt-BR" | "en" | "es") => void;
}

// --- Settings Store ---
interface SettingsStore {
  settings: Settings | null;
  apiKeyStatus: {
    anthropic: "valid" | "invalid" | "unchecked";
    openai: "valid" | "invalid" | "unchecked";
  };
  isLoading: boolean;

  fetchSettings: () => Promise<void>;
  updateSettings: (input: UpdateSettingsInput) => Promise<void>;
  validateApiKey: (provider: string, key: string) => Promise<boolean>;
}
```

#### Padrao de Interacao entre Stores

As stores interagem entre si atraves de composicao de hooks, nunca importando stores diretamente:

```typescript
// Exemplo: hook que conecta eventos WebSocket a store de Run
function useRunWebSocket(runId: string) {
  const ws = useWebSocketStore();
  const runStore = useRunStore();

  useEffect(() => {
    ws.subscribe(runId);
    return () => ws.unsubscribe(runId);
  }, [runId]);

  // Eventos WebSocket atualizam a store de run
  useWebSocketEvent("step:output", (event) => {
    runStore.appendStepOutput(event.stepId, event.chunk);
  });

  useWebSocketEvent("run:status", (event) => {
    runStore.updateRunStatus(event.runId, event.status);
  });
}
```

### 4.2 Arquitetura de Componentes

Os componentes seguem uma separacao clara entre **componentes de UI** (apresentacao pura, recebem props) e **componentes container** (logica, hooks, busca de dados).

#### Hierarquia de Componentes

```
AppShell (layout/Shell)
├── Sidebar (layout/Sidebar)
│   ├── Logo
│   ├── NavItem (Dashboard)
│   ├── NavItem (Templates)
│   ├── NavItem (Integracoes)
│   ├── NavItem (Configuracoes)
│   └── SquadList
│       └── SquadNavItem (por squad)
├── Header (layout/Header)
│   ├── Breadcrumbs
│   ├── ThemeToggle
│   └── LanguageSelector
└── MainContent
    ├── [Pagina Dashboard]
    │   ├── DashboardMetrics (shared/MetricCard)
    │   ├── RecentRuns (run/RunList)
    │   └── QuickActions
    ├── [Pagina Detalhe do Squad]
    │   ├── SquadHeader (squad/SquadHeader)
    │   ├── AgentList (agent/AgentCard[])
    │   ├── PipelineEditor (pipeline/PipelineEditor)
    │   │   ├── StepCard (pipeline/StepCard)
    │   │   ├── StepConnector (pipeline/StepConnector)
    │   │   └── AddStepButton
    │   ├── FlowVisualization (squad/FlowViz)
    │   └── RunHistory (run/RunList)
    ├── [Pagina Detalhe do Run]
    │   ├── RunHeader (run/RunHeader)
    │   ├── RunProgress (run/ProgressBar)
    │   ├── AgentStatusBar (agent/AgentStatusBar)
    │   ├── StepOutputList (run/StepOutput[])
    │   │   └── StreamingMarkdown
    │   ├── CheckpointDialog (run/CheckpointDialog)
    │   └── RunMetrics (run/RunMetrics)
    └── [Pagina Templates]
        └── TemplateGrid (shared/TemplateCard[])
```

#### Primitivos de UI (shadcn/ui)

Os seguintes componentes shadcn/ui sao usados como camada base:

| Componente    | Uso                                      |
|---------------|------------------------------------------|
| Button        | Todas as acoes interativas               |
| Card          | Cards de squad, agent, metricas          |
| Dialog        | Revisao de checkpoint, confirmacoes      |
| Dropdown Menu | Menus de contexto, acoes em overflow     |
| Input         | Formularios, busca                       |
| Label         | Rotulos de formulario                    |
| Select        | Seletor de modelo, seletor de provedor   |
| Tabs          | Secoes do detalhe do squad               |
| Textarea      | Persona do agente, instrucoes de etapas  |
| Toast         | Notificacoes, erros                      |
| Badge         | Indicadores de status, tags              |
| Progress      | Progresso do run, progresso da etapa     |
| Separator     | Divisores visuais                        |
| Sheet         | Sidebar mobile                           |
| Skeleton      | Estados de carregamento                  |
| Switch        | Toggles (checkpoint, modo escuro)        |
| Tooltip       | Texto de ajuda, texto truncado           |
| ScrollArea    | Regioes de conteudo com scroll           |

### 4.3 Atualizacoes em Tempo Real

#### Cliente WebSocket

```typescript
// lib/ws-client.ts

class WSClient {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private listeners: Map<string, Set<Function>> = new Map();

  /**
   * Conecta ao servidor WebSocket.
   * URL: ws://localhost:3000/api/ws
   */
  connect(): void {}

  /**
   * Reconexao automatica com backoff exponencial.
   * Atrasos: 1s, 2s, 4s, 8s, 16s, 30s (limite)
   */
  private reconnect(): void {
    const delay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempts),
      30000
    );
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  /**
   * Inscreve-se para eventos de um run especifico.
   */
  subscribe(runId: string): void {
    this.send({ type: "subscribe:run", runId });
  }

  /**
   * Envia um evento tipado para o servidor.
   */
  send(event: ClientWSEvent): void {
    this.ws?.send(JSON.stringify(event));
  }

  /**
   * Escuta um tipo de evento especifico.
   */
  on<T extends ServerWSEvent>(
    eventType: T["type"],
    handler: (event: T) => void
  ): () => void {}
}
```

#### Renderizacao de Saida em Streaming

As saidas das etapas sao transmitidas como markdown e renderizadas incrementalmente:

1. Eventos `step:output` adicionam a um buffer no `RunStore`
2. O componente `StepOutput` le do buffer
3. O markdown e parseado e renderizado usando `react-markdown`
4. Blocos de codigo usam syntax highlighting via `rehype-highlight`
5. O container de scroll rola automaticamente para o final durante o streaming

#### Atualizacoes Otimistas

Para operacoes que devem parecer instantaneas:

- **Pausar/Retomar/Cancelar**: A UI atualiza imediatamente, a confirmacao do servidor vem depois
- **Aprovacao de checkpoint**: O dialogo fecha imediatamente, o pipeline continua
- **Atualizacoes de squad**: O estado local atualiza primeiro, depois sincroniza com o servidor
- Em caso de erro do servidor, o estado reverte e uma notificacao toast aparece

---

## 5. Camada de Dados

### 5.1 Schema Prisma

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// ============================================================
// USUARIO & CONFIGURACOES
// ============================================================

model Settings {
  id                String   @id @default(cuid())
  anthropicApiKey   String?  // Criptografado com AES-256
  openaiApiKey      String?  // Criptografado com AES-256
  defaultProvider   String   @default("anthropic") // "anthropic" | "openai"
  defaultModel      String   @default("claude-sonnet-4-20250514")
  language          String   @default("pt-BR")     // "pt-BR" | "en" | "es"
  theme             String   @default("dark")       // "dark" | "light" | "system"
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

// ============================================================
// SQUADS
// ============================================================

model Squad {
  id          String   @id @default(cuid())
  name        String
  description String?
  icon        String?  // Emoji ou identificador de icone
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  agents      Agent[]
  pipeline    Pipeline?
  runs        Run[]

  @@index([isActive])
  @@index([createdAt])
}

// ============================================================
// AGENTS
// ============================================================

model Agent {
  id          String   @id @default(cuid())
  squadId     String
  name        String
  role        String   // Descricao curta do papel (ex.: "UX Writer Senior")
  persona     String   // Prompt completo da persona
  provider    String   @default("anthropic") // "anthropic" | "openai"
  model       String   @default("claude-sonnet-4-20250514")
  temperature Float    @default(0.7)
  maxTokens   Int      @default(4096)
  orderIndex  Int      @default(0)     // Posicao no squad
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  squad           Squad             @relation(fields: [squadId], references: [id], onDelete: Cascade)
  bestPractices   AgentBestPractice[]
  skills          AgentSkill[]
  pipelineSteps   PipelineStep[]
  runSteps        RunStep[]

  @@index([squadId])
}

// ============================================================
// BOAS PRATICAS
// ============================================================

model BestPractice {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String
  content     String   // O texto real da boa pratica injetado nos prompts
  category    String   // "writing" | "code" | "analysis" | "communication" | "general"
  isBuiltIn   Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  agents      AgentBestPractice[]

  @@index([category])
  @@index([slug])
}

model AgentBestPractice {
  id              String       @id @default(cuid())
  agentId         String
  bestPracticeId  String

  agent           Agent        @relation(fields: [agentId], references: [id], onDelete: Cascade)
  bestPractice    BestPractice @relation(fields: [bestPracticeId], references: [id], onDelete: Cascade)

  @@unique([agentId, bestPracticeId])
}

// ============================================================
// SKILLS
// ============================================================

model Skill {
  id           String   @id @default(cuid())
  name         String
  slug         String   @unique
  description  String
  instructions String   // O texto de instrucao injetado nos prompts
  category     String   // "output-format" | "integration" | "analysis" | "generation" | "review"
  icon         String?
  isBuiltIn    Boolean  @default(true)
  isInstalled  Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  agents       AgentSkill[]

  @@index([category])
  @@index([slug])
  @@index([isInstalled])
}

model AgentSkill {
  id       String @id @default(cuid())
  agentId  String
  skillId  String

  agent    Agent  @relation(fields: [agentId], references: [id], onDelete: Cascade)
  skill    Skill  @relation(fields: [skillId], references: [id], onDelete: Cascade)

  @@unique([agentId, skillId])
}

// ============================================================
// PIPELINES
// ============================================================

model Pipeline {
  id        String   @id @default(cuid())
  squadId   String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  squad     Squad          @relation(fields: [squadId], references: [id], onDelete: Cascade)
  steps     PipelineStep[]
}

model PipelineStep {
  id             String   @id @default(cuid())
  pipelineId     String
  agentId        String
  instruction    String
  orderIndex     Int
  inputSource    String   @default("previous_step") // "user" | "previous_step" | "specific_step"
  inputStepId    String?  // Referencia a etapa especifica para input
  checkpoint     Boolean  @default(false) // Pausar para revisao humana apos a etapa
  vetoConditions String?  // Array JSON de strings de condicoes de veto
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  pipeline       Pipeline @relation(fields: [pipelineId], references: [id], onDelete: Cascade)
  agent          Agent    @relation(fields: [agentId], references: [id], onDelete: Cascade)

  @@index([pipelineId, orderIndex])
}

// ============================================================
// RUNS
// ============================================================

model Run {
  id              String   @id @default(cuid())
  squadId         String
  status          String   @default("queued") // queued|running|paused|completed|failed|cancelled
  input           String   // Input do usuario que iniciou o run
  finalOutput     String?  // Saida da ultima etapa
  error           String?
  startedAt       DateTime?
  completedAt     DateTime?
  totalTokens     Int      @default(0)
  promptTokens    Int      @default(0)
  completionTokens Int     @default(0)
  estimatedCost   Float    @default(0)
  durationMs      Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  squad           Squad     @relation(fields: [squadId], references: [id], onDelete: Cascade)
  steps           RunStep[]

  @@index([squadId])
  @@index([status])
  @@index([createdAt])
}

model RunStep {
  id              String   @id @default(cuid())
  runId           String
  agentId         String
  stepIndex       Int
  instruction     String
  input           String?  // O input que esta etapa recebeu
  output          String?  // A saida que esta etapa produziu
  status          String   @default("pending") // pending|running|completed|failed|skipped|waiting_checkpoint|vetoed
  error           String?
  promptTokens    Int      @default(0)
  completionTokens Int     @default(0)
  durationMs      Int      @default(0)
  checkpointApproved Boolean?
  checkpointFeedback String?
  vetoResult      String?  // JSON do VetoResult se vetado
  startedAt       DateTime?
  completedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  run             Run      @relation(fields: [runId], references: [id], onDelete: Cascade)
  agent           Agent    @relation(fields: [agentId], references: [id], onDelete: Cascade)

  @@index([runId, stepIndex])
  @@index([status])
}

// ============================================================
// TEMPLATES
// ============================================================

model Template {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String
  category    String   // "content" | "code" | "analysis" | "marketing" | "support" | "data"
  icon        String?
  config      String   // JSON: configuracao completa de squad + pipeline
  variables   String?  // JSON: array de { name, description, defaultValue }
  isBuiltIn   Boolean  @default(true)
  popularity  Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([category])
  @@index([slug])
  @@index([popularity])
}
```

### 5.2 Estrategia de Dados Iniciais (Seed)

Na primeira execucao, a aplicacao verifica se o banco de dados esta vazio (nenhum registro `Settings` existe). Se estiver vazio, executa o processo de seed:

#### Fluxo de Execucao do Seed

```
1. Criar registro padrao de Settings
   - Sem chaves de API (usuario deve configurar)
   - Idioma: pt-BR
   - Tema: dark
   - Provedor: anthropic

2. Inserir 22 Best Practices em 5 categorias:
   Writing (6):
     - active-voice, concise-paragraphs, audience-awareness,
       consistent-tone, scannable-formatting, clear-cta
   Code (5):
     - clean-code, error-handling, type-safety,
       documentation-comments, security-first
   Analysis (4):
     - data-driven, structured-reasoning, bias-awareness,
       actionable-insights
   Communication (4):
     - empathy-first, clarity-over-cleverness,
       context-setting, feedback-sandwich
   General (3):
     - chain-of-thought, step-by-step, verify-assumptions

3. Inserir 18 Skills:
   Conteúdo e Automação (8):
     - json-output, markdown-report, csv-export,
       code-review, translation, summarization,
       sentiment-analysis, data-extraction
   Novas (10):
     - seo-optimization, email-drafting, social-media-copy,
       technical-writing, api-documentation, test-generation,
       sql-query-builder, persona-interview, competitive-analysis,
       content-calendar

4. Inserir 10 Templates de Squad:
     - content-pipeline       (Criacao de conteudo com revisao)
     - code-review-squad      (Revisao de codigo em multiplos estagios)
     - blog-factory           (Linha de producao de blog posts)
     - email-campaign         (Gerador de sequencia de emails)
     - landing-page-copy      (Copywriting de landing page)
     - data-analysis-team     (Pipeline de analise de dados)
     - customer-support-kb    (Construtor de base de conhecimento)
     - social-media-engine    (Engine de conteudo para redes sociais)
     - technical-docs-squad   (Equipe de documentacao tecnica)
     - competitor-research    (Pipeline de analise competitiva)
```

#### Implementacao do Seed

```typescript
// prisma/seed.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Verifica se ja foi populado
  const existing = await prisma.settings.findFirst();
  if (existing) {
    console.log("Banco de dados ja populado. Pulando.");
    return;
  }

  console.log("Populando banco de dados...");

  // 1. Settings
  await prisma.settings.create({ data: { /* padroes */ } });

  // 2. Best Practices (22)
  await prisma.bestPractice.createMany({ data: BEST_PRACTICES });

  // 3. Skills (18)
  await prisma.skill.createMany({ data: SKILLS });

  // 4. Templates (10)
  await prisma.template.createMany({ data: TEMPLATES });

  console.log("Seed concluido.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## 6. Seguranca

### Criptografia de Chaves de API

As chaves de API sao criptografadas em repouso usando AES-256-GCM antes de serem armazenadas no SQLite.

```typescript
// lib/encryption.ts

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";

/**
 * Fonte da chave de criptografia (em ordem de prioridade):
 * 1. Variavel de ambiente ENCRYPTION_KEY (32 bytes, codificada em hex)
 * 2. Chave auto-gerada armazenada em data/.encryption-key (criada na primeira execucao)
 *
 * A abordagem de chave auto-gerada significa zero configuracao para uso local,
 * enquanto a abordagem de variavel de ambiente suporta cenarios de deploy.
 */
function getEncryptionKey(): Buffer {}

function encrypt(plaintext: string): string {
  // Retorna: base64(iv + authTag + ciphertext)
}

function decrypt(encrypted: string): string {
  // Extrai iv, authTag, ciphertext da string base64
  // Retorna plaintext
}
```

### Rate Limiting

```typescript
// lib/rate-limit.ts

import { LRUCache } from "lru-cache";

interface RateLimitConfig {
  interval: number;    // Janela de tempo em ms
  maxRequests: number; // Maximo de requisicoes por janela
}

/**
 * Rate limiter em memoria usando cache LRU.
 * Aplicado nas rotas de API para prevenir abuso.
 *
 * Limites padrao:
 *   - Rotas que chamam IA (run): 10 req/min
 *   - Rotas CRUD: 60 req/min
 *   - Rotas somente leitura: 120 req/min
 */
function rateLimit(config: RateLimitConfig) {
  // Retorna funcao middleware do Next.js
}
```

### Validacao de Entrada

Cada rota de API valida a entrada usando schemas Zod do `@crewflow/shared`:

```typescript
// Exemplo: validacao de criacao de squad
import { z } from "zod";

export const CreateSquadSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  agents: z.array(CreateAgentSchema).min(1).max(10),
  pipeline: CreatePipelineSchema,
});

// Aplicado no handler da rota:
export async function POST(request: Request) {
  const body = await request.json();
  const parsed = CreateSquadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validacao falhou", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  // ... prossegue com dados validados
}
```

### Configuracao de CORS

```typescript
// next.config.ts
{
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "http://localhost:3000" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
    ];
  },
}
```

### Modelo de Autenticacao

- **v1.0 (atual)**: Sem autenticacao. Assume-se deploy local para usuario unico. A aplicacao escuta apenas em `localhost:3000`.
- **Futuro**: Camada de autenticacao opcional com credenciais locais ou OAuth. O modelo `Settings` sera expandido para um modelo `User`. As rotas de API verificarao um token de sessao.

---

## 7. Decisoes de Design Importantes

### 1. SQLite em vez de PostgreSQL

| Fator         | SQLite                          | PostgreSQL                     |
|---------------|---------------------------------|--------------------------------|
| Configuracao  | Zero-config, baseado em arquivo | Requer instalacao de servidor  |
| Performance   | Excelente para usuario unico    | Melhor para usuarios concorrentes |
| Portabilidade | Arquivo unico, backup facil     | Requer dump/restore            |
| Dependencias  | Nenhuma (incluso com Node)      | Servico externo                |

**Decisao**: SQLite. O CrewFlow e uma ferramenta local-first. Zero configuracao vence. Um unico usuario nunca atingira os limites de concorrencia do SQLite. O modo WAL permite leituras concorrentes durante a execucao do pipeline. A migracao para PostgreSQL e trivial via troca de provedor do Prisma.

### 2. Fila em Processo em vez de Redis/BullMQ

| Fator         | p-queue                         | BullMQ + Redis                 |
|---------------|---------------------------------|--------------------------------|
| Configuracao  | `npm install p-queue`           | Requer servidor Redis          |
| Persistencia  | Nenhuma (em memoria)            | Persistencia completa          |
| Escalabilidade| Processo unico                  | Multi-processo, distribuido    |
| Complexidade  | Minima                          | Significativa                  |

**Decisao**: p-queue. Os runs de pipeline nao precisam sobreviver a reinicializacoes do servidor (o usuario pode re-executar). A simplicidade de uma fila em processo elimina uma dependencia inteira de infraestrutura. Se um run for interrompido por reinicializacao do servidor, ele e marcado como falho e o usuario e notificado.

### 3. Next.js API Routes em vez de Backend Separado

| Fator         | Next.js API Routes              | Express/Fastify                |
|---------------|---------------------------------|--------------------------------|
| Portas        | Porta unica (3000)              | Duas portas (3000 + 4000)      |
| Deploy        | Um processo                     | Dois processos                 |
| Compartilhamento de tipos | Automatico (mesmo projeto) | Requer pacote compartilhado |
| Acesso SSR    | Acesso direto ao DB em RSC      | Chamadas de API a partir de RSC|

**Decisao**: Next.js API Routes. Uma unica porta significa configuracao mais simples, sem problemas de CORS, e um processo para gerenciar. Server Components podem acessar o banco de dados diretamente para carregamentos iniciais de pagina, enquanto as rotas de API lidam com mutacoes e operacoes em tempo real.

### 4. Zustand em vez de Redux

| Fator         | Zustand                         | Redux Toolkit                  |
|---------------|---------------------------------|--------------------------------|
| Boilerplate   | Minimo                          | Moderado (slices, reducers)    |
| Tamanho bundle| ~1KB                            | ~10KB                          |
| Curva de aprendizado | Baixa                    | Moderada                       |
| DevTools      | Basico                          | Excelente                      |

**Decisao**: Zustand. O estado da aplicacao nao e profundamente aninhado ou complexo o suficiente para justificar a estrutura do Redux. A simplicidade do Zustand e seu pequeno tamanho de bundle estao alinhados com a filosofia local-first e leve do projeto.

### 5. p-queue em vez de BullMQ

Veja a decisao #2. A escolha e a mesma -- p-queue fornece controle de concorrencia sem dependencias externas. O wrapper `ExecutionQueue` adiciona o comportamento especifico do dominio (rastreamento de status, emissao de eventos).

### 6. Prisma em vez de Drizzle

| Fator         | Prisma                          | Drizzle                        |
|---------------|---------------------------------|--------------------------------|
| Ecossistema   | Maduro, grande comunidade       | Crescendo, mais recente        |
| Seguranca de tipos | Tipos gerados a partir do schema | Tipos schema-as-code      |
| Migracoes     | CLI integrado                   | Baseado em kit                 |
| Suporte SQLite| Completo                        | Completo                       |
| Studio        | Prisma Studio (GUI)             | Drizzle Studio (mais recente)  |

**Decisao**: Prisma. A maturidade do ecossistema, documentacao excelente e ferramentas de migracao integradas o tornam a escolha pragmatica. O arquivo de schema declarativo e facil de ler e modificar. O Prisma Studio fornece uma forma rapida de inspecionar dados locais durante o desenvolvimento.

### 7. shadcn/ui em vez de Chakra UI / Material UI

| Fator         | shadcn/ui                       | Chakra / MUI                   |
|---------------|---------------------------------|--------------------------------|
| Runtime       | Zero (componentes copy-paste)   | CSS-in-JS em runtime           |
| Customizacao  | Controle total (codigo proprio) | Restrito ao tema               |
| Tamanho bundle| Apenas o que voce usa           | Biblioteca completa            |
| Estilizacao   | Tailwind CSS                    | Sistema proprietario           |

**Decisao**: shadcn/ui. Os componentes sao copiados para o projeto e se tornam codigo proprio. Sem overhead de runtime, customizacao completa e integracao com Tailwind CSS. A qualidade dos componentes e alta, e o padrao de "seja dono dos seus componentes" significa sem lock-in de versao.

### 8. Monorepo em vez de Polyrepo

| Fator         | Monorepo (Turborepo)            | Polyrepo                       |
|---------------|---------------------------------|--------------------------------|
| Compartilhamento de tipos | Imports diretos       | Pacotes publicados             |
| Build         | Incremental, com cache          | Independente por repositorio   |
| Coordenacao   | Um unico PR para mudancas transversais | Multiplos PRs, sincronizacao de versoes |
| Configuracao  | Um clone, um install            | Multiplos clones               |

**Decisao**: Monorepo. Os pacotes de engine e IA precisam compartilhar tipos com a aplicacao web. Um monorepo torna isso trivial. O Turborepo fornece cache de build e orquestracao de tarefas. O pacote engine pode ser publicado independentemente no futuro para uso via CLI ou SDK.

---

## 8. Estrategia de Tratamento de Erros

### Respostas de Erro da API

Todas as rotas de API retornam erros em um formato consistente:

```typescript
interface APIError {
  error: string;        // Mensagem legivel para humanos
  code: string;         // Codigo de erro legivel para maquinas
  details?: unknown;    // Contexto adicional (erros de validacao, etc.)
}
```

#### Catalogo de Codigos de Erro

| Codigo                  | Status HTTP | Descricao                            |
|-------------------------|-------------|--------------------------------------|
| `VALIDATION_ERROR`      | 400         | Validacao Zod falhou                 |
| `NOT_FOUND`             | 404         | Recurso nao encontrado               |
| `CONFLICT`              | 409         | Estado duplicado ou conflitante      |
| `RATE_LIMITED`           | 429         | Limite de taxa excedido              |
| `INTERNAL_ERROR`        | 500         | Erro inesperado do servidor          |
| `AI_PROVIDER_ERROR`     | 502         | API de IA retornou erro              |
| `AI_RATE_LIMITED`       | 429         | Limite de taxa da API de IA atingido |
| `AI_TIMEOUT`            | 504         | API de IA expirou tempo limite       |
| `INVALID_API_KEY`       | 401         | Chave de API invalida ou ausente     |
| `RUN_NOT_RUNNING`       | 409         | Tentou pausar/cancelar run que nao esta em execucao |
| `RUN_NOT_PAUSED`        | 409         | Tentou retomar run que nao esta pausado |
| `CHECKPOINT_NOT_PENDING`| 409         | Nenhum checkpoint aguardando resposta |

### Tratamento de Erros do Pipeline

```
Fluxo de Erro na Execucao de Etapa:

  1. Chamada de IA falha
     │
     ├── E um erro de rate limit?
     │   └── Sim: Aguarda (backoff exponencial), tenta novamente ate 3 vezes
     │
     ├── E um erro transiente (timeout, 500)?
     │   └── Sim: Tenta novamente uma vez apos atraso de 2 segundos
     │
     └── E um erro permanente (chave invalida, 400)?
         └── Sim: Marca etapa como falha, pausa pipeline
              │
              └── Emite step:error e run:status(paused)
                  Usuario ve o erro na UI, pode:
                  - Corrigir o problema e retomar
                  - Cancelar o run
```

### Tratamento de Erros do WebSocket

```typescript
// Reconexao automatica com backoff exponencial
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000, 30000]; // ms

class WSClient {
  private onDisconnect() {
    this.status = "reconnecting";
    const delay = RECONNECT_DELAYS[
      Math.min(this.reconnectAttempts, RECONNECT_DELAYS.length - 1)
    ];
    setTimeout(() => this.connect(), delay);
    this.reconnectAttempts++;
  }

  private onConnect() {
    this.status = "connected";
    this.reconnectAttempts = 0;
    // Re-inscreve em quaisquer runs ativos
    this.activeSubscriptions.forEach(runId => this.subscribe(runId));
  }
}
```

### Error Boundaries do Frontend

```
App Layout
├── ErrorBoundary (nivel de pagina: captura erros de roteamento)
│   ├── Sidebar (isolado: erros do sidebar nao quebram o conteudo principal)
│   └── MainContent
│       └── ErrorBoundary (nivel de secao: captura erros de componentes)
│           ├── StepOutputList
│           │   └── ErrorBoundary (por etapa: erro de uma etapa nao quebra as outras)
│           └── ...
```

Cada error boundary exibe uma mensagem de erro contextual com um botao "Tentar novamente". Erros sao registrados no console do navegador com stack traces completos.

---

## 9. Estrategia de Testes

### Testes Unitarios (Vitest)

**Escopo**: Logica pura em `packages/engine`, `packages/ai`, `packages/shared`.

```
packages/engine/__tests__/
├── pipeline-runner.test.ts      # Ordem de execucao de etapas, transicoes de estado
├── agent-executor.test.ts       # Composicao de contexto, construcao de prompts
├── veto-checker.test.ts         # Avaliacao de condicoes de veto
├── handoff-manager.test.ts      # Passagem de dados entre etapas
├── checkpoint-handler.test.ts   # Ciclo de pausa/retomada
└── queue.test.ts                # Controle de concorrencia

packages/ai/__tests__/
├── anthropic.test.ts            # Mock da API Anthropic
├── openai.test.ts               # Mock da API OpenAI
├── streaming.test.ts            # Processamento de stream
└── token-counter.test.ts        # Precisao da contagem de tokens

packages/shared/__tests__/
├── schemas.test.ts              # Validacao de schemas Zod
└── constants.test.ts            # Integridade das constantes
```

**Configuracao**:

```typescript
// vitest.config.ts (raiz)
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["packages/**/__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["packages/*/src/**"],
    },
  },
});
```

### Testes de Integracao

**Escopo**: Rotas de API com banco de dados de teste.

```
apps/web/__tests__/
├── api/
│   ├── squads.test.ts           # Operacoes CRUD
│   ├── runs.test.ts             # Ciclo de vida do run
│   ├── templates.test.ts        # Uso de templates
│   └── settings.test.ts         # Gerenciamento de configuracoes
└── setup.ts                     # Setup/teardown do banco de teste
```

**Banco de teste**: Um arquivo SQLite separado (`data/test.db`) e utilizado. Antes de cada suite de testes, o banco de dados e resetado e populado.

```typescript
// __tests__/setup.ts
import { execSync } from "child_process";

beforeAll(async () => {
  process.env.DATABASE_URL = "file:../../data/test.db";
  execSync("npx prisma db push --force-reset", { env: process.env });
  execSync("npx prisma db seed", { env: process.env });
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

### Testes End-to-End (Playwright)

**Escopo**: Fluxos criticos do usuario. Planejados para fases posteriores.

```
e2e/
├── onboarding.spec.ts           # Fluxo de configuracao inicial
├── create-squad.spec.ts         # Criacao completa de squad
├── run-pipeline.spec.ts         # Executar e observar um run
├── checkpoint-review.spec.ts    # Fluxo de aprovacao de checkpoint
└── template-usage.spec.ts       # Criar squad a partir de template
```

### Comandos de Teste

```bash
# Testes unitarios
turbo test

# Testes unitarios com cobertura
turbo test -- --coverage

# Testes de integracao
turbo test:integration

# Testes E2E (requer servidor dev em execucao)
turbo test:e2e

# Todos os testes
turbo test:all
```

---

## 10. Consideracoes de Performance

### Otimizacao do SQLite

```sql
-- Habilita modo WAL para leituras concorrentes durante execucao do pipeline
PRAGMA journal_mode = WAL;

-- Aumenta tamanho do cache para melhor performance de leitura
PRAGMA cache_size = -20000;  -- 20MB

-- Habilita chaves estrangeiras
PRAGMA foreign_keys = ON;
```

Esses PRAGMAs sao definidos pelo cliente Prisma na conexao atraves de um middleware customizado ou parametro de string de conexao.

### WebSocket em vez de Polling

| Abordagem   | Latencia    | Carga no Servidor | Largura de Banda |
|-------------|-------------|-------------------|------------------|
| Polling     | Atraso 1-5s | N requisicoes/seg | Alta (overhead)  |
| WebSocket   | <50ms       | 1 conexao         | Minima (eventos) |

WebSocket e a escolha clara para streaming de saida de IA, onde chunks chegam a cada 50-200ms. Polling criaria latencia e carga no servidor inaceitaveis.

### Streaming de Respostas de IA

As respostas de IA sao transmitidas token por token do provedor para o navegador:

```
AI API → AsyncIterable → Engine → WebSocket → Browser → React render
```

Cada chunk:
1. E emitido pelo SDK de IA como um async iterable
2. Encaminhado pelo emissor de eventos do engine
3. Enviado via WebSocket como um evento `step:output`
4. Adicionado ao buffer da store Zustand
5. Renderizado pelo React (agrupado via `requestAnimationFrame`)

Nenhuma etapa espera pela conclusao total antes que o usuario veja a saida.

### Lazy Loading

Componentes pesados sao carregados sob demanda usando `next/dynamic`:

```typescript
import dynamic from "next/dynamic";

// Monaco Editor: ~2MB, necessario apenas na edicao de pipeline
const PipelineEditor = dynamic(
  () => import("@/components/pipeline/PipelineEditor"),
  { loading: () => <EditorSkeleton /> }
);

// Visualizacao de fluxo: baseado em D3, necessario apenas no detalhe do squad
const FlowViz = dynamic(
  () => import("@/components/squad/FlowViz"),
  { loading: () => <FlowSkeleton /> }
);

// Renderizador de Markdown: necessario apenas durante runs
const StreamingMarkdown = dynamic(
  () => import("@/components/run/StreamingMarkdown"),
  { loading: () => <OutputSkeleton /> }
);
```

### Server Components

Next.js Server Components sao usados para carregamentos iniciais de pagina sempre que possivel:

| Pagina            | Estrategia de Renderizacao                          |
|-------------------|-----------------------------------------------------|
| Dashboard         | Server Component (metricas estaticas, consulta DB)  |
| Lista de Squads   | Server Component (consulta DB, sem interatividade)  |
| Detalhe do Squad  | Hibrido (server para dados, client para editor)     |
| Detalhe do Run    | Client Component (atualizacoes em tempo real via WebSocket) |
| Templates         | Server Component (lista estatica do DB)             |
| Configuracoes     | Client Component (interacoes de formulario)         |

### Orcamento de Tamanho de Bundle

| Chunk              | Meta     | Estrategia                        |
|--------------------|----------|-----------------------------------|
| JS Inicial         | < 150KB  | Server Components, tree shaking   |
| shadcn/ui          | < 30KB   | Importar apenas componentes usados|
| Zustand            | < 2KB    | Ja e minimo                       |
| Renderizador Markdown | < 20KB | Lazy loaded                      |
| Monaco Editor      | < 2MB    | Lazy loaded, apenas em paginas de edicao |

---

## Apendice A: Variaveis de Ambiente

```bash
# .env.example

# Banco de dados (padrao: arquivo SQLite local)
DATABASE_URL="file:../../data/app.db"

# Provedores de IA (tambem podem ser configurados via UI de Settings)
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# Criptografia (opcional: auto-gerado se nao definido)
ENCRYPTION_KEY=

# Servidor
PORT=3000
NODE_ENV=development
```

## Apendice B: Comandos de Desenvolvimento

```bash
# Instalar dependencias
npm install

# Enviar schema para o banco de dados (cria tabelas)
npx turbo db:push

# Popular banco de dados com dados padrao
npx turbo db:seed

# Iniciar servidor de desenvolvimento
npx turbo dev

# Build para producao
npx turbo build

# Executar linting
npx turbo lint

# Executar testes
npx turbo test

# Abrir Prisma Studio (GUI do banco de dados)
npx prisma studio --schema=apps/web/prisma/schema.prisma

# Gerar cliente Prisma apos mudancas no schema
npx prisma generate --schema=apps/web/prisma/schema.prisma

# Criar uma nova migracao
npx prisma migrate dev --schema=apps/web/prisma/schema.prisma --name <nome>
```

## Apendice C: Fluxo de Request/Response

Um exemplo completo de como iniciar um run de pipeline:

```
1. Usuario clica em "Executar" na pagina de detalhe do squad

2. Frontend:
   RunStore.startRun(squadId, input)
   → POST /api/squads/:id/run { input: "..." }

3. Rota de API:
   - Valida input com Zod
   - Cria registro Run (status: "queued")
   - Cria registros RunStep (status: "pending")
   - Enfileira run no PipelineRunner
   - Retorna objeto Run

4. Frontend:
   - Recebe Run com id
   - WebSocketStore.subscribe(runId)
   - Navega para /squads/:id/runs/:runId

5. Engine (PipelineRunner):
   - Desenfileira run, define status: "running"
   - Emite run:status { status: "running" }

6. Engine (para cada etapa):
   a. Emite step:start
   b. Emite agent:status { status: "working" }
   c. AgentExecutor compoe contexto
   d. AIProvider.streamText() inicia
   e. Para cada chunk: emite step:output { chunk }
   f. Stream termina: emite step:complete
   g. VetoChecker valida saida
   h. Se checkpoint: emite checkpoint:request, aguarda
   i. Emite agent:status { status: "delivering" }
   j. HandoffManager prepara input da proxima etapa
   k. Emite handoff:start / handoff:end

7. WebSocket repassa todos os eventos para clientes inscritos

8. Frontend (para cada evento):
   - step:output → RunStore.appendStepOutput()
   - step:complete → RunStore.setStepComplete()
   - checkpoint:request → Exibe CheckpointDialog
   - run:status → RunStore.updateRunStatus()

9. Pipeline conclui:
   - Engine emite run:status { status: "completed" }
   - Registro Run atualizado com finalOutput, metricas
   - Frontend exibe estado de conclusao
```
