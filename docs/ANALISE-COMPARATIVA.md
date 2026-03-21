# Analise Comparativa: meuopensquad vs opensquad

Data: 2026-03-19

---

## Resumo Executivo

O opensquad eh um sistema de orquestracao multi-agente **baseado em arquivos** que roda dentro do Claude Code CLI. Toda a inteligencia esta embutida em arquivos markdown/yaml que instruem o LLM sobre como criar squads, executar pipelines, avaliar qualidade e iterar.

O meuopensquad eh uma **aplicacao web** (Next.js + Prisma + WebSocket) que tenta replicar a mesma funcionalidade com uma interface grafica. O core engine existe (PipelineRunner, AgentExecutor, etc.) mas esta **significativamente mais simples** em termos de inteligencia aplicada.

**Conclusao principal:** O problema NAO eh ter interface grafica. O problema eh que a inteligencia que o opensquad embute nos prompts (best practices, quality gates, agent personas detalhadas, skill injection, format injection, etc.) nao foi portada para o meuopensquad.

---

## Mapa de Divergencias

### 1. CRIACAO DE SQUADS — Gap Critico

| Aspecto | opensquad | meuopensquad |
|---------|-----------|--------------|
| Processo | 6 fases guiadas pelo Architect (1142 linhas de instrucoes) | Formulario web simples com nome/descricao/agentes |
| Discovery | 7+ perguntas contextuais (proposito, audiencia, referencias, performance, formatos) | Nenhuma — usuario preenche campos |
| Investigation | Sherlock scraping de perfis de referencia | Inexistente |
| Research | Pesquisa de dominio com web search + best practices | Inexistente |
| Skill Discovery | Escaneia skills instaladas e sugere relevantes | Templates pre-definidos com skills fixas |
| Design | Projeta agentes com nomes, roles, tasks decompostos, pipeline completo | Usuario adiciona agentes manualmente |
| Build | Gera ~35 arquivos (agents, tasks, steps, data, pipeline) | Salva no banco (nome, role, systemPrompt) |
| Validation | 5 gates automaticos verificando completude e coerencia | Nenhuma validacao |

**O que falta:** Todo o processo de "Architect" — a IA que entende o que o usuario quer e projeta o squad ideal. No meuopensquad, o usuario tem que saber exatamente o que quer e configurar tudo manualmente.

---

### 2. AGENTES — Gap Critico

| Aspecto | opensquad | meuopensquad |
|---------|-----------|--------------|
| Definicao | Arquivo .agent.md com 8+ secoes obrigatorias | Campo `systemPrompt` no banco (texto livre) |
| Persona | Nome aliterativo + role + expertise + identity | Apenas `role` e `systemPrompt` |
| Voice Guidance | `alwaysUse`, `neverUse`, `toneRules` | Inexistente |
| Anti-Patterns | Lista do que o agente NUNCA deve fazer | Inexistente |
| Quality Criteria | Criterios especificos com thresholds | Inexistente |
| Operational Framework | Passo-a-passo de como o agente trabalha | Inexistente |
| Tasks | Decompostos em arquivos separados com input/output/order | Nao tem conceito de tasks por agente |

**Exemplo concreto:**
- opensquad "Pedro Pesquisa" tem: persona detalhada, 2 tasks (find-news, rank-stories), criterios de qualidade, anti-patterns, voice guidance
- meuopensquad agente tem: `{ name: "Researcher", role: "researcher", systemPrompt: "You are a researcher..." }`

---

### 3. PIPELINE EXECUTION — Gap Moderado

| Aspecto | opensquad | meuopensquad |
|---------|-----------|--------------|
| Step types | checkpoint, agent (inline/subagent) | step com tipo (agent/checkpoint/veto) |
| Execution modes | inline (no contexto principal) vs subagent (processo separado) | Tudo inline via AI provider |
| Context injection | Agent file + task files + format file + skill file + data files + memories + handoff | systemPrompt + guidelines + memories + previous output |
| Format injection | Le best-practices/{format}.md e injeta no prompt | Best practices do banco, mas injecao menos estruturada |
| Skill injection | Le SKILL.md e injeta instrucoes completas no agente | Skills como descricao no banco, nao como instrucoes operacionais |
| State management | state.json atualizado a cada step com status por agente | Status no banco (pending/running/completed/failed) |
| Checkpoints | AskUserQuestion com opcoes estruturadas | Human input detection via regex (DESABILITADO por bugs) |
| Veto/Redo | Condicoes de veto por step, redo automatico | VetoChecker existe mas regras sao basicas (min/max length) |
| Output structure | Arquivos .md estruturados (briefing, specs.json, roteiro) | Texto livre retornado pela IA |

**O que funciona no meuopensquad:**
- PipelineRunner executa steps em ordem
- AgentExecutor constroi system prompts com contexto
- CheckpointHandler gerencia aprovacoes
- HandoffManager passa contexto entre agentes
- VetoChecker valida outputs
- Streaming via WebSocket funciona

**O que falta:**
- Task decomposition (agente executa 1 prompt, nao multiplas tasks)
- Format injection (best practices nao sao injetados como instrucoes operacionais detalhadas)
- Skill injection real (skills sao descricoes, nao workflows operacionais)
- Subagent execution (tudo roda inline)
- Structured outputs (arquivos .md com specs)

---

### 4. SKILLS — Gap Critico

| Aspecto | opensquad | meuopensquad |
|---------|-----------|--------------|
| Formato | SKILL.md com frontmatter + instrucoes detalhadas | Registro no banco com name/description/type |
| Tipos | mcp, script, prompt, hybrid | mcp, script (nenhum funciona em runtime) |
| Runtime | MCP tools executados pelo Claude, scripts via bash | Stub — nao executa nada |
| Criacao | Skill Creator com capture intent + write + test + grade + iterate | Nao tem |
| Testing | 6 runs (with/without skill), grading automatico, benchmark | Nao tem |
| Injection | SKILL.md inteiro injetado no contexto do agente | Descricao curta no prompt |

**Exemplo concreto do gap:**
- opensquad "instagram-content-workflow" skill: 160 linhas de instrucoes detalhadas sobre workflow Briefing→Criacao→Aprovacao, formatos suportados, estrutura de output, boas praticas
- meuopensquad skill: `{ name: "Web Search", description: "Search the web", type: "mcp" }`

---

### 5. BEST PRACTICES — Gap Moderado

| Aspecto | opensquad | meuopensquad |
|---------|-----------|--------------|
| Formato | Markdown files com 100+ linhas de instrucoes detalhadas | Registros no banco com titulo/conteudo |
| Quantidade | 20+ arquivos (copywriting, instagram-feed, instagram-reels, review, etc.) | 22 registros (platform + discipline based) |
| Injection | Injetados no contexto do agente baseado no `format:` do step | Filtrados por agent role, mas injection menos detalhada |
| Conteudo | Regras operacionais especificas (dimensoes, slide count, CTA rules, etc.) | Mais generico |

**Nota:** Este eh o gap MENOR. O meuopensquad tem seed data com best practices. O problema eh como sao injetados — precisam ser mais detalhados e operacionais.

---

### 6. QUALITY & REVIEW — Gap Critico

| Aspecto | opensquad | meuopensquad |
|---------|-----------|--------------|
| Review agent | Vera Veredito com scorecard (8 criterios, escala 1-10, threshold >=7) | OutputAnalyzer com regex (deteccao basica) |
| Quality scoring | Score numerico por criterio + veredito APROVADO/REJEITADO | Nao tem scoring |
| Eval system | Skill Creator testa with/without, grader avalia assertions | Nao tem |
| Benchmark | benchmark.json com pass rate, tokens, timing | Nao tem |
| Feedback loop | Viewer HTML + feedback.json + iteracao | Nao tem |

---

### 7. MEMORIA E CONTEXTO — Gap Moderado

| Aspecto | opensquad | meuopensquad |
|---------|-----------|--------------|
| Squad memory | memories.md atualizado pos-run (preferencias detectadas, decisoes) | Campo `memories` no agente (JSON) |
| Company profile | company.md + preferences.md | Registro de usuario no banco |
| Handoff | Output do step anterior vira input do proximo | HandoffManager existe e funciona |
| Run history | state.json arquivado por run | Registros de steps no banco |

---

## Resumo dos Outputs — O que Cada Sistema Produz

### opensquad (run do Instagram-tech):
```
output/2026-03-19-211800/v1/
  research-results.md    — 5 noticias rankeadas com scores
  angles.md              — 5 angulos criativos com triggers emocionais
  feed-carousel.md       — Carrossel 7 slides estruturado
  reels-script.md        — Roteiro 30s com cenas e timestamps
  stories-sequence.md    — 5 frames com enquete
  content-package.md     — Pacote consolidado com specs
  review-verdict.md      — Review 8.4/10 com scorecard
  visuals/               — 12 arquivos HTML renderizados (slides + stories)
  rendered-visuals.md    — Summary dos visuais
```

### meuopensquad (run tipica):
```
Run no banco com steps:
  Step 1: output text (resposta da IA)
  Step 2: output text (resposta da IA)
  ...
```

**A diferenca eh gritante.** O opensquad produz deliverables estruturados e acionaveis. O meuopensquad produz texto.

---

## Plano de Acao — Por Onde Comecar

### Prioridade 1: Agent Intelligence (MAIOR IMPACTO)
Onde: `packages/engine/src/agent-executor.ts`

O AgentExecutor ja monta um system prompt dinamico. O que falta:
1. **Task decomposition** — Em vez de 1 prompt por agente, executar N tasks em sequencia
2. **Structured output** — Instruir agentes a produzirem arquivos .md estruturados
3. **Rich personas** — Transformar o campo `systemPrompt` em secoes estruturadas (persona, voice, anti-patterns, quality criteria)

Sugestao: Criar um formato de agente mais rico no schema Prisma ou usar campos JSON estruturados.

### Prioridade 2: Skill Injection Real
Onde: `packages/engine/src/agent-executor.ts` + schema Prisma

Skills precisam ter **instrucoes operacionais** (como o SKILL.md do opensquad), nao apenas nome/descricao. Quando um agente usa uma skill, as instrucoes completas da skill devem ser injetadas no prompt.

Sugestao: Adicionar campo `instructions` (text longo) na tabela Skill e injetar no AgentExecutor.

### Prioridade 3: Squad Architect (IA guia criacao)
Onde: Nova funcionalidade

Criar um fluxo de criacao de squad guiado por IA:
1. Perguntas contextuais (o que o squad deve fazer, publico, referencias)
2. IA sugere agentes, tasks, pipeline
3. IA gera configuracao completa
4. Validacao automatica

Isso pode ser uma API route que usa o AI provider para gerar a configuracao.

### Prioridade 4: Quality Gates
Onde: `packages/engine/src/veto-checker.ts` + novo ReviewAgent

1. Expandir VetoChecker com criterios mais ricos
2. Criar um agente de review automatico que roda apos conteudo ser criado
3. Scoring numerico (1-10) por criterio

### Prioridade 5: Format/Best Practice Injection
Onde: `packages/engine/src/agent-executor.ts`

Best practices ja existem no banco. Melhorar:
1. Injecao baseada no formato do step (nao so role do agente)
2. Conteudo mais operacional e especifico
3. Regras inegociaveis (dimensoes, contagens, etc.)

---

## Nota Final

O opensquad funciona porque toda a "inteligencia" esta nos prompts — arquivos markdown enormes e detalhados que dizem ao LLM EXATAMENTE o que fazer. O meuopensquad tem a infraestrutura (pipeline, streaming, banco, UI) mas falta essa inteligencia nos prompts.

A boa noticia: a infraestrutura do meuopensquad eh SOLIDA. PipelineRunner, AgentExecutor, WebSocket streaming, CheckpointHandler — tudo funciona. O que precisa eh enriquecer o CONTEUDO que alimenta esses sistemas.

Ter interface grafica NAO eh o problema. Eh possivel ter a mesma qualidade de output com UI. O que precisa eh:
1. Prompts mais ricos e estruturados
2. Task decomposition por agente
3. Skill injection real
4. Quality scoring automatico
5. Squad creation guiada por IA
