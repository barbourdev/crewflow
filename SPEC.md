# CrewFlow — Especificação do Produto

> **Versão:** 1.0.0-draft
> **Última atualização:** 17/03/2026
> **Status:** Fonte única de verdade para todo o desenvolvimento

---

## 1. Visão Geral

**CrewFlow** é um framework open-source de orquestração multi-agente com uma interface web completa que roda inteiramente na máquina local do usuário. Não é um produto SaaS — não existe versão hospedada, nem assinatura, nem dependência de fornecedor. Os usuários clonam o repositório, instalam as dependências e começam a construir fluxos de trabalho com IA em minutos.

### Visão

Fornecer o framework mais acessível, extensível e pronto para produção para orquestrar equipes de agentes de IA através de uma interface web visual — capacitando qualquer pessoa, independentemente de habilidade técnica, a automatizar fluxos de trabalho complexos de múltiplas etapas.

### Princípios

1. **Local-first.** Tudo roda em `localhost:3000`. Seus dados nunca saem da sua máquina, a menos que você chame explicitamente uma API de IA externa.
2. **Zero configuração por padrão.** `git clone` + `npm install` + `npm run dev` — nada mais é necessário. Sem Docker, sem Redis, sem Postgres, sem contas na nuvem (além de uma chave de API de IA).
3. **Squads universais.** O CrewFlow é agnóstico de domínio. Squads podem lidar com desenvolvimento de software, criação de conteúdo, pesquisa, análise de dados, automação DevOps, pipelines de QA, campanhas de marketing e qualquer outro fluxo de trabalho multi-etapas que se beneficie de colaboração com IA.
4. **Acessível para não-desenvolvedores.** A interface principal é uma UI web visual com assistentes guiados, templates pré-construídos e configuração em linguagem natural. Acesso via YAML e código existe para usuários avançados, mas nunca é obrigatório.

### Como Funciona (Resumo em 30 Segundos)

1. O usuário cria um **Squad** — uma equipe de agentes de IA com papéis definidos.
2. Cada **Agent** tem uma persona, habilidades e critérios de qualidade.
3. Um **Pipeline** define a ordem em que os agentes trabalham, incluindo etapas sequenciais, ramificações paralelas e checkpoints humanos.
4. O usuário dispara um **Run**, fornecendo uma entrada (ex.: "Escreva um post de blog sobre segurança em IA").
5. Cada agente executa sua etapa, transmite a saída em tempo real, passa o contexto para o próximo agente via **Handoff**, e o resultado final é entregue ao usuário.

---

## 2. Público-Alvo

O CrewFlow atende cinco personas distintas. Cada uma tem necessidades, expectativas e caminhos de onboarding diferentes.

### 2.1 Empreendedores

**Perfil:** Fundadores não-técnicos, solopreneurs e donos de pequenos negócios que precisam produzir conteúdo, analisar mercados e automatizar tarefas repetitivas sem contratar uma equipe completa.

**Necessidades principais:**
- Automatizar criação de conteúdo em múltiplas plataformas (blog, redes sociais, newsletters)
- Gerar pesquisas de mercado e análises de concorrentes
- Criar textos de marketing em escala
- Resumir documentos e extrair insights

**Abordagem de onboarding:**
- O assistente de boas-vindas pergunta "O que você quer automatizar?" com opções visuais
- Imediatamente sugere 2-3 templates de squads correspondentes à resposta
- A primeira execução usa um Content Squad pré-configurado com um prompt simples ("Conte-me sobre seu negócio")
- Tour guiado destaca a galeria de templates e o histórico de execuções
- Sem jargão técnico — todos os conceitos usam termos simples na UI

### 2.2 Profissionais de Marketing

**Perfil:** Profissionais de marketing e gerentes de redes sociais que precisam criar conteúdo multi-plataforma de forma consistente e em volume.

**Necessidades principais:**
- Criar conteúdo específico por plataforma (Twitter/X, LinkedIn, Instagram, TikTok, blog)
- Manter a voz da marca entre canais
- Seguir boas práticas de cada plataforma automaticamente
- Testes A/B de variações
- Agendar e produzir conteúdo em lotes

**Abordagem de onboarding:**
- O assistente de boas-vindas detecta intenção de "marketing" e pré-seleciona templates de conteúdo
- O primeiro squad usa o template "Conteúdo Multi-Plataforma"
- A biblioteca de boas práticas é destacada logo no início, mostrando regras específicas por plataforma
- As personas dos agentes vêm pré-configuradas com vozes específicas para marketing
- A saída inclui formatação e contagem de caracteres específica por plataforma

### 2.3 Gestores

**Perfil:** Líderes de equipe, gerentes de projeto e gerentes de operações que desejam automatizar relatórios, análises e coordenação de fluxos de trabalho.

**Necessidades principais:**
- Relatórios de status e resumos automatizados
- Análise de dados e descrições de visualização
- Preparação e acompanhamento de reuniões
- Documentação de processos
- Suporte a decisões com análise estruturada

**Abordagem de onboarding:**
- O assistente de boas-vindas oferece o caminho "Gerenciar e Analisar"
- O primeiro squad é o template "Pesquisa e Análise"
- Ênfase nos recursos de checkpoint (aprovação humana antes da saída final)
- Mostra como configurar ciclos de revisão para controle de qualidade
- Destaca capacidades de exportação para compartilhar resultados

### 2.4 Freelancers

**Perfil:** Profissionais independentes (escritores, designers, consultores, assistentes virtuais) que precisam escalar sua produção sem escalar suas horas.

**Necessidades principais:**
- Multiplicar a capacidade de produção de conteúdo
- Manter qualidade consistente entre entregas
- Automatizar pesquisa e primeiros rascunhos
- Criar fluxos de trabalho padronizados para projetos recorrentes de clientes
- Rastrear tempo e custo por entrega

**Abordagem de onboarding:**
- O assistente de boas-vindas pergunta sobre sua profissão e entregas típicas
- Sugere templates mais próximos do seu trabalho (ex.: "Blog Writing Squad" para escritores)
- Destaca o recurso de rastreamento de custos (custo por execução em reais, não em tokens)
- Mostra como salvar squads personalizados como templates pessoais
- Enfatiza o fluxo de trabalho "clonar e personalizar" para projetos de clientes

### 2.5 Desenvolvedores

**Perfil:** Engenheiros de software, tech leads e engenheiros DevOps que desejam fluxos de trabalho de desenvolvimento assistidos por IA.

**Necessidades principais:**
- Code review automatizado com múltiplas perspectivas (segurança, performance, legibilidade)
- Geração de testes QA e planejamento de execução
- Análise e sugestões de refatoração
- Geração de documentação
- Análise e otimização de pipelines CI/CD
- Revisão de arquitetura e documentação de decisões

**Abordagem de onboarding:**
- O assistente de boas-vindas detecta intenção de desenvolvedor e oferece o toggle "Modo avançado" imediatamente
- O primeiro squad é o template "Code Review" ou "QA Pipeline"
- Mostra o modo de configuração YAML logo no início
- Destaca o sistema de skills e a integração com o protocolo MCP
- Fornece acesso direto ao editor Monaco para configuração de agentes
- Mostra como criar skills personalizadas via scripts

---

## 3. Glossário / Linguagem da UI

O CrewFlow usa termos técnicos internos na sua base de código, mas apresenta linguagem amigável na UI. Este mapeamento garante consistência em todas as interfaces.

| Termo Interno | Termo na UI (PT-BR) | Termo na UI (EN) | Descrição |
|---------------|----------------------|-------------------|-----------|
| Squad | Equipe | Squad | Uma equipe de agentes de IA trabalhando juntos |
| Agent | Assistente / Membro | Assistant / Member | Um agente de IA individual com papel e persona definidos |
| Pipeline | Fluxo de trabalho | Workflow | A sequência ordenada de etapas que os agentes seguem |
| Step | Etapa | Step | Uma unidade individual de trabalho no pipeline |
| Skill | Habilidade / Integracao | Skill / Integration | Um plugin que dá capacidades específicas aos agentes |
| Run | Execucao | Run | Uma única execução de um pipeline |
| Checkpoint | Aprovacao | Approval | Um ponto de pausa onde um humano revisa e aprova |
| Handoff | Passagem de bastao | Handoff | A transição de contexto de um agente para o próximo |
| Veto condition | Criterio de qualidade | Quality check | Regras de validação automatizada aplicadas à saída do agente |
| Output | Resultado / Entrega | Result / Deliverable | O produto final ou intermediário do trabalho de um agente |
| Persona | Personalidade | Personality | A definição de caráter, voz e comportamento de um agente |
| Best practice | Boas praticas | Best practice | Regras de plataforma ou disciplina que guiam o comportamento do agente |
| Template | Modelo pronto | Template | Uma configuração de squad pré-construída pronta para uso |
| Token | *(oculto)* | *(hidden)* | Nunca exibido ao usuário — exibir custo em moeda local ($, R$, etc.) |
| Config | Configuracoes | Settings | Preferências do usuário e do squad |
| Streaming | Ao vivo | Live | Saída em tempo real enquanto o agente trabalha |

### Regras de Linguagem da UI

1. **Nunca mostrar "tokens" para o usuário.** Sempre converter para custo monetário usando o preço do modelo. Exibir como "$0.03" ou "R$ 0,15".
2. **Nunca mostrar JSON bruto para usuários não-avançados.** Sempre renderizar dados estruturados como cards, tabelas ou formulários.
3. **Usar rótulos orientados à ação.** "Executar" / "Run" em vez de "Start pipeline". "Criar equipe" / "Create squad" em vez de "New squad configuration".
4. **Mensagens de erro devem sugerir uma correção.** Nunca mostrar "Error 500". Mostrar "Algo deu errado. Tente executar novamente ou verifique sua chave de API em Configurações."

---

## 4. Conceitos Fundamentais

### 4.1 Squad

Um Squad é uma equipe de agentes de IA organizados para realizar uma categoria de tarefas. Cada squad possui:

- **Nome e ícone** — identidade visual na UI
- **Code** — slug único para URL e referência na API (ex.: `content-blog`)
- **Descrição** — explicação em linguagem simples do que o squad faz
- **Versão** — versionamento semântico para mudanças de configuração
- **Agents** — um ou mais agentes com papéis definidos
- **Pipeline** — o fluxo de trabalho que conecta os agentes
- **Config** — configurações no nível do squad (modelo padrão, temperature, max retries, etc.)

Squads podem ser criados do zero, a partir de um template ou clonando e modificando um squad existente.

### 4.2 Agent

Um Agent é uma entidade de IA com identidade e capacidades bem definidas. Cada agente possui:

- **Nome e ícone** — identidade visual no canvas e nos logs
- **Role** — descrição em uma linha da função do agente (ex.: "Senior Blog Writer")
- **Persona** — uma estrutura JSON rica definindo:
  - `identity`: Quem o agente é (histórico, expertise, anos de experiência)
  - `role_definition`: O que o agente faz no contexto do squad
  - `operational_framework`: Como o agente aborda tarefas (metodologia, processo)
  - `voice_and_style`: Tom, vocabulário, orientação sobre estrutura de frases
  - `output_format`: Estrutura esperada das entregas do agente
  - `output_examples`: Exemplos concretos de boa saída
  - `anti_patterns`: Coisas que o agente nunca deve fazer
  - `quality_criteria`: Padrões mensuráveis que a saída deve atender
  - `principles`: Crenças fundamentais que guiam as decisões do agente
  - `context_awareness`: O que o agente sabe sobre seu ambiente e squad
- **Skills** — quais integrações/plugins o agente pode usar
- **Position** — posicionamento coluna/linha no canvas visual do pipeline

### 4.3 Pipeline

Um Pipeline é a sequência ordenada de etapas que define como o trabalho flui através de um squad. Pipelines suportam:

- **Execução sequencial** — etapas rodam uma após a outra, cada uma recebendo a saída da etapa anterior
- **Execução paralela** (P2) — múltiplas etapas rodam simultaneamente, resultados são mesclados antes da próxima etapa sequencial
- **Ramificação condicional** (futuro) — etapas que só executam se uma condição for atendida

Um pipeline pertence a exatamente um squad e contém uma ou mais etapas.

### 4.4 Step

Um Step é a menor unidade de trabalho em um pipeline. Cada step possui:

- **Label** — nome legível por humanos (ex.: "Rascunhar post do blog")
- **Tipo de execução:**
  - `inline` — o agente processa a entrada e produz saída usando sua persona e skills
  - `subagent` — o step delega para um sub-squad (execução aninhada)
  - `checkpoint` — o step pausa e aguarda aprovação humana
- **Configuração de entrada** — define quais dados o step recebe (saída do step anterior, entrada original ou mapeamento customizado)
- **Configuração de saída** — define o formato e schema esperado da saída
- **Veto conditions** — verificações automáticas de qualidade aplicadas à saída antes de prosseguir
- **Format** — estrutura de saída esperada (markdown, JSON, texto plano, código)
- **On reject** — o que acontece se as veto conditions falharem ou um humano rejeitar no checkpoint:
  - `retry` — re-executar o mesmo step (com prompt modificado opcional)
  - `revise` — enviar de volta para um step anterior com feedback
  - `abort` — parar toda a execução
  - `skip` — prosseguir para o próximo step mesmo assim (com aviso)

### 4.5 Skill

Uma Skill é um plugin que estende as capacidades de um agente além da geração de texto. Skills possuem quatro tipos:

- **`mcp`** — Integração via Model Context Protocol. O agente pode chamar ferramentas externas pelo padrão MCP (acesso ao sistema de arquivos, busca web, consultas a banco de dados, chamadas de API).
- **`script`** — Um script customizado (JavaScript/TypeScript) que roda em ambiente sandboxed. Recebe entrada, retorna saída.
- **`prompt`** — Um template de prompt especializado que o agente pode invocar. Útil para formatação, tradução ou extração estruturada.
- **`hybrid`** — Uma combinação dos tipos acima. Por exemplo, uma skill que usa um prompt para decidir qual script executar.

Cada skill possui:
- **Nome e ícone** — identidade visual
- **Descrição** — o que a skill habilita
- **Versão** — para gerenciamento de atualizações
- **Config** — configurações específicas da skill (chaves de API, endpoints, parâmetros)
- **isBuiltin** — se vem incluída com o CrewFlow
- **isPublic** — se é visível para todos os usuários (suporte multi-usuário futuro)

### 4.6 Run

Um Run é uma única execução do pipeline de um squad. Ele registra:

- **Status** — `pending`, `running`, `paused` (no checkpoint), `completed`, `failed`, `cancelled`
- **Input** — o prompt/dados originais fornecidos pelo usuário
- **Temporização** — quando a execução começou e terminou
- **Custo** — total de tokens usados e custo monetário em todas as etapas
- **Steps** — registros individuais de RunStep para cada etapa executada

### 4.7 Checkpoint

Um Checkpoint é um tipo especial de step que pausa a execução e solicita revisão humana. A UI exibe:

- A saída da etapa anterior
- Uma interface de aprovar/rejeitar/editar
- Campo opcional de feedback para o agente caso rejeitado
- Indicador visual (amarelo pulsante) no canvas do pipeline

Quando aprovado, a execução continua. Quando rejeitado, o comportamento `on_reject` é acionado.

### 4.8 Handoff

Um Handoff é a transição de contexto de um agente para o próximo no pipeline. Durante um handoff:

1. A saída do agente atual é formatada conforme sua configuração de saída
2. Um resumo do handoff é gerado (o que foi feito, o que precisa acontecer em seguida)
3. O próximo agente recebe: o resumo do handoff, a saída anterior e a entrada original da execução
4. A UI mostra uma animação visual do contexto movendo entre os cards dos agentes

### 4.9 Veto Conditions

Veto conditions são verificações automáticas de qualidade aplicadas à saída de um agente antes que o pipeline prossiga. Exemplos:

- **Verificação de comprimento** — a saída deve ter entre 100 e 5000 caracteres
- **Verificação de formato** — a saída deve ser markdown válido / JSON válido
- **Verificação de palavras-chave** — a saída deve incluir ou excluir termos específicos
- **Verificação de sentimento** — a saída deve corresponder a um tom alvo (requer avaliação por IA)
- **Verificação customizada** — uma função JavaScript que retorna aprovado/reprovado

Se qualquer veto condition falhar, o comportamento `on_reject` do step é acionado automaticamente.

### 4.10 Ciclos de Revisão

Quando um step é rejeitado (por humano ou veto condition), a configuração `on_reject` determina a próxima ação. O padrão mais comum é um ciclo de revisão:

1. Agent A produz saída
2. Veto condition falha (ex.: saída muito curta)
3. Step é reexecutado com feedback: "A saída tinha 50 caracteres. O mínimo é 100. Por favor, expanda."
4. Agent A produz saída revisada
5. Veto condition passa
6. Pipeline continua para o Agent B

Ciclos de revisão possuem um número máximo configurável de tentativas (padrão: 3) para evitar loops infinitos.

---

## 5. Stack Tecnológica

### 5.1 Frontend

| Tecnologia | Versão | Finalidade |
|------------|--------|-----------|
| Next.js | 16.x | Framework (App Router, Turbopack para builds de desenvolvimento rápidos) |
| TypeScript | 5.x | Segurança de tipos em toda a base de código |
| Tailwind CSS | 4.x | Estilização utility-first |
| shadcn/ui | latest | Componentes de UI pré-construídos e acessíveis |
| Zustand | 5.x | Gerenciamento de estado global leve |
| WebSocket (nativo) | — | Streaming em tempo real do backend |
| Monaco Editor | latest | Edição de código/YAML no navegador para modo avançado |
| React Flow | latest | Canvas visual do pipeline com drag-and-drop |
| Framer Motion | latest | Animações (transições de handoff, mudanças de status) |

### 5.2 Backend

| Tecnologia | Versão | Finalidade |
|------------|--------|-----------|
| Next.js API Routes | 16.x | Endpoints REST API co-localizados com o frontend |
| Prisma ORM | 6.x | Acesso ao banco de dados com queries type-safe |
| SQLite | 3.x | Banco de dados padrão (zero configuração, baseado em arquivo) |
| PostgreSQL | 16.x | Banco de dados de produção opcional (via `DATABASE_URL`) |
| Socket.IO ou ws | latest | Servidor WebSocket para streaming em tempo real |
| p-queue / better-queue | latest | Fila de jobs em processo (sem dependência de Redis) |
| Zod | 3.x | Validação de entrada em runtime e definição de schemas |
| bcrypt / argon2 | latest | Criptografia de chaves de API em repouso |

### 5.3 Integração com IA

| Tecnologia | Finalidade |
|------------|-----------|
| Anthropic Claude API | Provedor de IA primário (Claude 3.5 Sonnet, Claude 4 Opus) |
| OpenAI API | Provedor secundário/fallback (GPT-4o, GPT-4.1) |
| MCP Protocol | Protocolo padronizado de uso de ferramentas para skills de agentes |
| Streaming (SSE/WS) | Entrega token-por-token da saída para o frontend |
| Contagem de tokens | Estimativa de tokens no lado do cliente para previsão de custos |

### 5.4 Infraestrutura

| Tecnologia | Finalidade |
|------------|-----------|
| Turborepo | Gerenciamento de monorepo (se pacotes forem separados) |
| GitHub Actions | CI/CD (lint, type-check, teste, build) |
| Docker Compose | Deploy containerizado opcional |
| Vitest | Testes unitários e de integração |
| Playwright | Testes end-to-end |

### 5.5 Diagrama de Arquitetura (Conceitual)

```
Browser (localhost:3000)
  |
  |-- HTTP -----> Next.js App Router (pages + API routes)
  |                  |
  |                  |-- Prisma --> SQLite (data/app.db)
  |                  |
  |                  |-- Job Queue (in-process)
  |                  |      |
  |                  |      |-- AI Provider (Claude / OpenAI)
  |                  |      |-- MCP Server (skills)
  |                  |      |-- Script Runner (sandboxed)
  |                  |
  |-- WebSocket --> Socket.IO / ws server
                       |
                       |-- Streaming tokens
                       |-- Agent status updates
                       |-- Checkpoint notifications
```

---

## 6. Filosofia Zero Configuração

O CrewFlow deve ser executável com exatamente três comandos:

```bash
git clone https://github.com/user/crewflow.git
cd crewflow
npm install
npm run dev
```

O único passo manual é adicionar uma chave de API de IA. Todo o resto é automático.

### 6.1 SQLite como Banco de Dados Padrão

- O arquivo do banco de dados é armazenado em `data/app.db` (ignorado pelo git)
- Criado automaticamente na primeira execução se não existir
- Nenhum servidor de banco de dados para instalar, configurar ou gerenciar
- SQLite suporta bancos de dados de até 281 TB — mais que suficiente para uso local
- Para uso em produção/equipe, defina `DATABASE_URL=postgresql://...` no `.env` e o Prisma troca automaticamente

### 6.2 Sem Redis Necessário

- A fila de jobs usa `p-queue` ou `better-queue` rodando no processo Node.js
- O estado da fila é persistido no SQLite (sobrevivendo a reinicializações)
- O limite de execuções concorrentes é configurável (padrão: 3 execuções simultâneas)
- Para cenários de alta vazão, um adaptador Redis pode ser adicionado posteriormente sem alterar a interface da fila

### 6.3 Sem Docker Necessário

- Todas as dependências são pacotes Node.js
- SQLite é embutido (via binding nativo `better-sqlite3`)
- Nenhum serviço de sistema para instalar
- Docker Compose é fornecido como conveniência opcional para usuários que preferem containers

### 6.4 Chaves de API via .env

- `.env.example` é fornecido com todas as chaves disponíveis documentadas
- Na primeira execução, se não existir `.env`, o app copia `.env.example` para `.env`
- O assistente de boas-vindas solicita a entrada da chave de API e grava no `.env`
- As chaves também são armazenadas criptografadas no banco de dados para a página de configurações da UI
- Chaves suportadas:
  - `ANTHROPIC_API_KEY` — obrigatória (provedor primário)
  - `OPENAI_API_KEY` — opcional (provedor secundário)
  - `DATABASE_URL` — opcional (padrão para SQLite)
  - `PORT` — opcional (padrão para 3000)
  - `NODE_ENV` — opcional (padrão para development)

### 6.5 Seed Automático na Primeira Execução

Na primeira inicialização, se o banco de dados estiver vazio, o CrewFlow faz seed automaticamente de:

- 22 boas práticas built-in (14 de plataformas + 8 de disciplinas)
- 18 skills built-in (8 de conteúdo/automação + 10 focadas em desenvolvimento)
- 10 templates de squads (4 focados em conteúdo + 6 focados em desenvolvimento)
- Preferências padrão do usuário

O seed é idempotente — executá-lo múltiplas vezes não cria duplicatas.

### 6.6 Migrações Automáticas na Inicialização

- `npm run dev` e `npm run start` ambos executam `prisma migrate deploy` antes de iniciar o servidor
- Mudanças de schema são aplicadas automaticamente
- Nenhum comando de migração manual necessário
- O histórico de migrações é rastreado pelo Prisma na tabela `_prisma_migrations`

### 6.7 Porta Única

- Frontend, API e WebSocket rodam todos na porta 3000
- Upgrades WebSocket acontecem no mesmo servidor HTTP
- Sem problemas de CORS já que tudo é same-origin
- A porta é configurável via variável de ambiente `PORT`

---

## 7. Schema do Banco de Dados

### 7.1 Visão Geral do Relacionamento entre Entidades

```
User 1--* Squad
Squad 1--1 Pipeline
Squad 1--* Agent
Pipeline 1--* Step
Step *--1 Agent
Agent *--* Skill (via AgentSkill)
Squad 1--* Run
Run 1--* RunStep
RunStep 1--* RunLog
BestPractice (standalone)
SquadTemplate (standalone)
```

### 7.2 User

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| id | String (CUID) | PK | Identificador único |
| email | String | Unique, opcional | Email do usuário (opcional para uso apenas local) |
| name | String | Obrigatório | Nome de exibição |
| avatar | String | Opcional | URL ou caminho para imagem de avatar |
| role | Enum (admin, user) | Default: admin | Papel do usuário (para futuro suporte multi-usuário) |
| apiKeys | String (criptografado) | Opcional | String JSON de chaves de API criptografadas: `{ anthropic: "...", openai: "..." }` |
| preferences | JSON | Default: {} | Preferências de UI: `{ theme, language, advancedMode, defaultModel, currency }` |
| language | String | Default: "pt-BR" | Idioma preferido da UI |
| currency | String | Default: "USD" | Moeda para exibição de custos |
| createdAt | DateTime | Auto | Timestamp de criação da conta |
| updatedAt | DateTime | Auto | Timestamp da última modificação |

### 7.3 Squad

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| id | String (CUID) | PK | Identificador único |
| name | String | Obrigatório | Nome de exibição (ex.: "Blog Content Team") |
| code | String | Unique, Obrigatório | Slug seguro para URL (ex.: "blog-content-team") |
| icon | String | Opcional | Emoji ou identificador de ícone |
| description | String | Opcional | Descrição em linguagem simples do propósito do squad |
| version | String | Default: "1.0.0" | Versão semântica para rastreamento de configuração |
| userId | String | FK -> User.id | Proprietário do squad |
| config | JSON | Default: {} | Configurações no nível do squad: `{ defaultModel, temperature, maxRetries, maxTokensPerStep, maxCostPerRun }` |
| isTemplate | Boolean | Default: false | Se este squad é um template |
| isArchived | Boolean | Default: false | Flag de exclusão lógica |
| createdAt | DateTime | Auto | Timestamp de criação |
| updatedAt | DateTime | Auto | Timestamp da última modificação |

### 7.4 Agent

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| id | String (CUID) | PK | Identificador único |
| squadId | String | FK -> Squad.id | Squad pai |
| name | String | Obrigatório | Nome de exibição (ex.: "Ana the Writer") |
| icon | String | Opcional | Emoji ou avatar |
| role | String | Obrigatório | Descrição em uma linha do papel |
| persona | JSON | Obrigatório | Definição completa da persona (veja estrutura abaixo) |
| model | String | Opcional | Sobrescrita de modelo (padrão vem da config do squad) |
| temperature | Float | Opcional | Sobrescrita de temperature |
| maxTokens | Int | Opcional | Sobrescrita de max tokens de saída |
| positionCol | Int | Default: 0 | Posição da coluna no canvas do pipeline |
| positionRow | Int | Default: 0 | Posição da linha no canvas do pipeline |
| createdAt | DateTime | Auto | Timestamp de criação |
| updatedAt | DateTime | Auto | Timestamp da última modificação |

**Estrutura JSON da Persona:**

```json
{
  "identity": "Escritor de conteúdo sênior com 10 anos de experiência em blogs de tecnologia...",
  "role_definition": "Responsável por rascunhar o post inicial do blog com base na pesquisa fornecida...",
  "operational_framework": {
    "methodology": "1. Ler resumo da pesquisa. 2. Criar esboço. 3. Escrever rascunho. 4. Auto-revisão.",
    "constraints": ["Máximo de 2000 palavras", "Deve incluir 3+ subtítulos"],
    "tools_usage": "Usar skill web_search para verificar fatos quando incerto."
  },
  "voice_and_style": {
    "tone": "Profissional, mas acessível",
    "vocabulary": "Evitar jargão. Explicar termos técnicos.",
    "sentence_structure": "Misturar frases curtas e longas. Preferir voz ativa."
  },
  "output_format": {
    "structure": "# Título\n\n## Introdução\n\n## Corpo (3-5 seções)\n\n## Conclusão",
    "format": "markdown",
    "length": "1200-2000 palavras"
  },
  "output_examples": [
    "Exemplo 1: Um post de blog bem estruturado sobre...",
    "Exemplo 2: ..."
  ],
  "anti_patterns": [
    "Nunca usar títulos clickbait",
    "Nunca começar com 'No mundo de hoje...'",
    "Nunca usar mais de um ponto de exclamação"
  ],
  "quality_criteria": [
    "Score de legibilidade Flesch acima de 60",
    "Todas as afirmações suportadas pela pesquisa do step anterior",
    "Nenhum parágrafo com mais de 5 frases"
  ],
  "principles": [
    "Precisão acima de velocidade",
    "Valor para o leitor acima de contagem de palavras",
    "Clareza acima de criatividade"
  ],
  "context_awareness": {
    "squad_role": "Segundo no pipeline após o Pesquisador",
    "receives_from": "Resumo de pesquisa com descobertas-chave e fontes",
    "delivers_to": "Editor para revisão e polimento"
  }
}
```

### 7.5 Pipeline

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| id | String (CUID) | PK | Identificador único |
| squadId | String | FK -> Squad.id, Unique | Squad pai (relacionamento 1:1) |
| config | JSON | Default: {} | Configuração no nível do pipeline: `{ maxDuration, maxCost, onTimeout }` |
| createdAt | DateTime | Auto | Timestamp de criação |
| updatedAt | DateTime | Auto | Timestamp da última modificação |

### 7.6 Step

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| id | String (CUID) | PK | Identificador único |
| pipelineId | String | FK -> Pipeline.id | Pipeline pai |
| agentId | String | FK -> Agent.id | Agente responsável por este step |
| order | Int | Obrigatório | Ordem de execução (base 0) |
| label | String | Obrigatório | Rótulo legível por humanos (ex.: "Pesquisar tópico") |
| type | Enum | Obrigatório | `inline`, `subagent`, `checkpoint` |
| inputConfig | JSON | Default: {} | Mapeamento de entrada: `{ source: "previous" \| "original" \| "custom", fields: [...] }` |
| outputConfig | JSON | Default: {} | Expectativas de saída: `{ format, schema, maxLength }` |
| vetoConditions | JSON | Default: [] | Array de verificações de qualidade: `[{ type, params, message }]` |
| format | String | Default: "markdown" | Formato esperado da saída |
| onReject | Enum | Default: "retry" | `retry`, `revise`, `abort`, `skip` |
| maxRetries | Int | Default: 3 | Número máximo de tentativas |
| parallelGroup | String | Opcional | Steps com o mesmo parallelGroup rodam simultaneamente |
| createdAt | DateTime | Auto | Timestamp de criação |
| updatedAt | DateTime | Auto | Timestamp da última modificação |

### 7.7 Skill

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| id | String (CUID) | PK | Identificador único |
| name | String | Unique, Obrigatório | Nome da skill (ex.: "web_search") |
| type | Enum | Obrigatório | `mcp`, `script`, `prompt`, `hybrid` |
| description | String | Obrigatório | O que a skill faz |
| version | String | Default: "1.0.0" | Versão semântica |
| icon | String | Opcional | Emoji ou identificador de ícone |
| config | JSON | Default: {} | Schema de configuração e valores padrão específicos da skill |
| implementation | String | Opcional | Conteúdo do script ou URL do servidor MCP |
| isBuiltin | Boolean | Default: false | Vem incluída com o CrewFlow |
| isPublic | Boolean | Default: true | Visível para todos os usuários |
| createdAt | DateTime | Auto | Timestamp de criação |
| updatedAt | DateTime | Auto | Timestamp da última modificação |

### 7.8 AgentSkill (Tabela de Junção)

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| agentId | String | FK -> Agent.id, PK | Referência ao agente |
| skillId | String | FK -> Skill.id, PK | Referência à skill |
| config | JSON | Default: {} | Sobrescritas de configuração da skill específicas do agente |
| assignedAt | DateTime | Auto | Quando a skill foi atribuída |

### 7.9 Run

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| id | String (CUID) | PK | Identificador único |
| squadId | String | FK -> Squad.id | Squad sendo executado |
| userId | String | FK -> User.id | Usuário que disparou a execução |
| status | Enum | Obrigatório | `pending`, `running`, `paused`, `completed`, `failed`, `cancelled` |
| input | JSON | Obrigatório | Dados de entrada fornecidos pelo usuário |
| output | JSON | Opcional | Saída final agregada |
| startedAt | DateTime | Opcional | Quando a execução começou |
| completedAt | DateTime | Opcional | Quando a execução terminou |
| totalTokens | Int | Default: 0 | Total de tokens consumidos em todas as etapas |
| totalCost | Float | Default: 0.0 | Custo monetário total em USD |
| error | String | Opcional | Mensagem de erro se o status for `failed` |
| metadata | JSON | Default: {} | Metadados adicionais da execução |
| createdAt | DateTime | Auto | Timestamp de criação |
| updatedAt | DateTime | Auto | Timestamp da última modificação |

### 7.10 RunStep

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| id | String (CUID) | PK | Identificador único |
| runId | String | FK -> Run.id | Execução pai |
| stepId | String | FK -> Step.id | Step do pipeline sendo executado |
| agentId | String | FK -> Agent.id | Agente realizando o trabalho |
| status | Enum | Obrigatório | `pending`, `running`, `streaming`, `completed`, `failed`, `skipped`, `waiting_approval` |
| input | JSON | Opcional | Entrada real passada ao agente |
| output | JSON | Opcional | Saída do agente |
| feedback | String | Opcional | Feedback humano (de rejeição no checkpoint) |
| tokensUsed | Int | Default: 0 | Tokens consumidos neste step |
| cost | Float | Default: 0.0 | Custo monetário deste step |
| attempts | Int | Default: 0 | Número de tentativas de execução (incrementado em retry) |
| startedAt | DateTime | Opcional | Quando a execução do step começou |
| completedAt | DateTime | Opcional | Quando a execução do step terminou |
| createdAt | DateTime | Auto | Timestamp de criação |

### 7.11 RunLog

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| id | String (CUID) | PK | Identificador único |
| runStepId | String | FK -> RunStep.id | RunStep pai |
| level | Enum | Obrigatório | `debug`, `info`, `warn`, `error` |
| message | String | Obrigatório | Mensagem de log |
| metadata | JSON | Default: {} | Dados estruturados adicionais (contagem de tokens, temporização, chamadas de skills) |
| timestamp | DateTime | Auto | Quando o log foi criado |

### 7.12 BestPractice

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| id | String (CUID) | PK | Identificador único |
| name | String | Obrigatório | Nome da prática (ex.: "Twitter Thread Best Practices") |
| platform | String | Opcional | Plataforma alvo (ex.: "twitter", "linkedin", "github") |
| contentType | String | Opcional | Tipo de conteúdo (ex.: "thread", "post", "pull_request") |
| description | String | Obrigatório | Breve descrição da prática |
| constraints | JSON | Default: [] | Array de regras: `[{ rule, reason, example }]` |
| content | String | Obrigatório | Conteúdo completo em texto do documento de boas práticas |
| tags | JSON | Default: [] | Tags de categorização |
| version | String | Default: "1.0.0" | Rastreamento de versão |
| createdAt | DateTime | Auto | Timestamp de criação |
| updatedAt | DateTime | Auto | Timestamp da última modificação |

### 7.13 SquadTemplate

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| id | String (CUID) | PK | Identificador único |
| name | String | Obrigatório | Nome do template (ex.: "Blog Content Squad") |
| category | String | Obrigatório | Categoria: "content", "dev", "research", "analysis", "devops", "qa" |
| description | String | Obrigatório | O que este template faz |
| icon | String | Opcional | Emoji ou ícone |
| config | JSON | Obrigatório | Configuração no nível do squad |
| agents | JSON | Obrigatório | Array de definições de agentes (personas, papéis, skills) |
| pipeline | JSON | Obrigatório | Definição do pipeline (steps, ordem, veto conditions) |
| requiredSkills | JSON | Default: [] | Skills que devem estar instaladas para este template funcionar |
| estimatedTime | String | Opcional | Tempo típico de execução (ex.: "2-5 minutos") |
| estimatedCost | String | Opcional | Faixa de custo típica (ex.: "$0.05 - $0.15") |
| popularity | Int | Default: 0 | Contagem de uso para ordenação |
| createdAt | DateTime | Auto | Timestamp de criação |
| updatedAt | DateTime | Auto | Timestamp da última modificação |

---

## 8. Páginas / Rotas

### 8.1 /welcome — Assistente de Onboarding

**Objetivo:** Guiar novos usuários pela configuração inicial em 4 passos.

**Passos:**

1. **Boas-vindas e Nome** — Saudação, pedir nome de exibição, breve introdução ao CrewFlow
2. **Propósito** — "O que você quer automatizar?" Múltipla escolha com ícones (Conteúdo, Dev, Pesquisa, Análise, Marketing, Outro). Determina quais templates são destacados.
3. **Chave de API** — Campo de entrada para chave de API da Anthropic (obrigatória). Chave OpenAI opcional. Botão "Testar conexão" com validação ao vivo. Link para a página de chave de API da Anthropic.
4. **Execução Demo** — Seleciona automaticamente um template baseado no passo 2. Mostra uma execução demo de 30 segundos com saída em streaming. "Seu primeiro squad está pronto!" CTA para o dashboard.

**Estados:**
- **Primeira visita:** Assistente completo, sem opção de pular
- **Retorno (sem chave de API):** Pula para o passo 3
- **Retorno (com chave de API):** Redireciona para o dashboard

**Componentes:**
- StepIndicator (1/4, 2/4, etc.)
- AnimatedIllustrations para cada passo
- APIKeyInput com indicador de validação (check verde / X vermelho)
- DemoRunViewer com saída em streaming

### 8.2 / — Dashboard

**Objetivo:** Hub central mostrando o estado atual do usuário e ações rápidas.

**Layout:**
- **Barra de saudação** — "Bom dia, [nome]" com saudação baseada no horário
- **Squads em execução** — Cards ao vivo mostrando quaisquer execuções em andamento com progresso
- **Ações rápidas** — "Criar novo squad", "Explorar templates", "Última execução"
- **Execuções recentes** — Tabela das últimas 10 execuções com status, nome do squad, horário, custo
- **Resumo de métricas** — Total de execuções esta semana, custo total, squad mais usado, tempo médio de execução

**Estados:**
- **Vazio (sem squads):** Grande CTA para criar primeiro squad ou explorar templates, ilustração
- **Carregando:** Skeleton de cards e tabela
- **Erro:** Banner de erro com botão de tentar novamente
- **Populado:** Dashboard completo com todas as seções

**Componentes:**
- GreetingBar
- RunningSquadCard (com atualizações via WebSocket ao vivo)
- QuickActionButtons
- RecentRunsTable (ordenável, filtrável)
- MetricsSummaryCards

### 8.3 /templates — Galeria de Templates

**Objetivo:** Navegar e usar configurações de squad pré-construídas.

**Layout:**
- **Filtro por categoria** — Abas horizontais: Todos, Conteúdo, Desenvolvimento, Pesquisa, Análise, DevOps, QA
- **Barra de busca** — Busca full-text em nomes e descrições de templates
- **Grid de cards de template** — Cada card mostra: ícone, nome, descrição, badge de categoria, tempo estimado, custo estimado, número de agentes, botão "Usar este"
- **Modal de preview do template** — Detalhes completos: lista de agentes com papéis, visualização do pipeline, requisitos de skills, exemplo de entrada/saída

**Estados:**
- **Carregando:** Grid de skeleton
- **Busca vazia:** "Nenhum template corresponde à sua busca" com sugestão de explorar todos
- **Populado:** Grid de cards de template

**Componentes:**
- CategoryTabs
- TemplateSearchBar
- TemplateCard
- TemplatePreviewModal
- UseTemplateButton (cria um squad a partir do template e redireciona para /squads/[id])

### 8.4 /squads/new — Construtor de Squad

**Objetivo:** Criar um novo squad do zero ou personalizar um template.

**Modos:**

1. **Modo Simples (assistido por IA):**
   - Área de texto única: "Descreva o que você quer que sua equipe faça"
   - IA gera uma configuração completa do squad (agentes, pipeline, personas)
   - Usuário revisa e pode ajustar antes de salvar
   - Melhor para usuários não-técnicos

2. **Modo Template:**
   - Selecionar um template, depois personalizar
   - Agentes e pipeline pré-preenchidos
   - Usuário pode adicionar/remover agentes, mudar personas, ajustar pipeline
   - Melhor para usuários que querem um ponto de partida

3. **Modo Avançado (YAML):**
   - Editor YAML completo (Monaco) com validação de schema
   - Preview em tempo real da estrutura do squad
   - Importar/exportar arquivos YAML
   - Melhor para desenvolvedores

**Estados:**
- **Seleção de modo:** Três cards para escolher o modo de criação
- **Construindo:** Formulário/editor ativo com preview ao vivo
- **Validando:** Validação de schema em execução, erros destacados
- **Salvando:** Estado de carregamento no botão salvar
- **Erro:** Erros de validação inline ou banner de falha ao salvar

**Componentes:**
- ModeSelector
- SimpleSquadForm (textarea + geração por IA)
- TemplateCustomizer (formulário com valores pré-preenchidos)
- YAMLEditor (Monaco com validação de JSON schema)
- SquadPreview (representação visual da configuração atual)
- AgentConfigurator (editor de persona com seções)
- PipelineBuilder (ordenação de steps por drag-and-drop)

### 8.5 /squads/[id] — Detalhes do Squad

**Objetivo:** Visualizar e gerenciar um squad específico, lançar execuções, revisar histórico.

**Layout:**
- **Cabeçalho** — Nome do squad, ícone, descrição, versão, botão editar, botão arquivar
- **Visualização do pipeline** — Canvas React Flow mostrando agentes como cards conectados por setas, com rótulos e tipos de steps
- **Cards de agentes** — Cards clicáveis no canvas mostrando nome do agente, papel, status (ocioso/trabalhando/concluído), badges de skills
- **Painel de execução** — Campo de entrada + botão "Executar", seletor de modelo, estimativa de custo
- **Aba de histórico** — Tabela de execuções passadas com status, tempo, custo, preview da saída
- **Aba de configuração** — Visualização somente-leitura da configuração do squad (agentes, pipeline, skills) com botão editar

**Estados:**
- **Carregando:** Layout de skeleton
- **Vazio (sem execuções):** Visualização do pipeline + CTA proeminente "Execute sua primeira execução"
- **Populado:** Layout completo com histórico
- **Executando:** Atualizações em tempo real nos cards dos agentes (indicadores pulsantes), painel de execução mostra progresso
- **Erro:** Banner de erro se o squad falhou ao carregar

**Componentes:**
- SquadHeader
- PipelineCanvas (React Flow)
- AgentCard (com indicador de status)
- RunInputPanel
- RunHistoryTable
- SquadConfigViewer
- CostEstimator

### 8.6 /squads/[id]/runs/[runId] — Visualização de Execução

**Objetivo:** Monitorar e interagir com uma execução ao vivo ou concluída.

**Layout:**
- **Barra de progresso** — Progresso geral da execução (step X de Y), tempo decorrido, estimativa restante
- **Timeline de agentes** — Timeline horizontal mostrando o step de cada agente com indicadores de status:
  - Cinza: pendente
  - Azul pulsante: trabalhando
  - Amarelo pulsante: aguardando aprovação (checkpoint)
  - Verde: concluído
  - Vermelho: falhou
- **Painel de saída** — Saída em streaming em tempo real do agente atual, com renderização markdown
- **Interface de checkpoint** — Quando pausado em um checkpoint: botões aprovar/rejeitar, campo de feedback, opção de editar saída
- **Controles** — Botões pausar, retomar, cancelar
- **Barra lateral** — Detalhes por step: entrada recebida, saída produzida, tokens usados, custo, duração, contagem de tentativas
- **Visualizador de logs** — Painel expansível mostrando entradas de RunLog com filtragem por nível

**Estados:**
- **Pendente:** Aguardando na fila, horário estimado de início
- **Executando:** Streaming ao vivo, timeline animada de agentes
- **Pausado (checkpoint):** Interface de checkpoint visível, indicador amarelo pulsante
- **Concluído:** Saída completa exibida, todos os steps verdes, métricas de resumo
- **Falhou:** Detalhes do erro, step que falhou destacado em vermelho, botão de reexecutar
- **Cancelado:** Saída parcial, steps restantes em cinza

**Componentes:**
- RunProgressBar
- AgentTimeline
- StreamingOutputPanel (com renderização markdown)
- CheckpointInterface
- RunControls
- StepDetailsSidebar
- LogViewer (com filtro por nível)
- RunSummaryMetrics

### 8.7 /integrations — Skills e Integrações

**Objetivo:** Gerenciar skills disponíveis para agentes.

**Layout:**
- **Abas** — Instaladas, Disponíveis, Todas
- **Grid de cards de skills** — Cada card mostra: ícone, nome, badge de tipo (MCP/script/prompt/hybrid), descrição, versão, status (instalada/disponível), botão configurar/instalar
- **Modal de detalhes da skill** — Descrição completa, formulário de configuração, agentes suportados, exemplos de uso
- **Assistente de configuração** — Configuração passo-a-passo para skills que precisam de chaves de API ou setup

**Estados:**
- **Carregando:** Grid de skeleton
- **Vazio (sem skills):** "Nenhuma skill instalada. Explore as skills disponíveis."
- **Populado:** Grid com indicadores de status
- **Instalando:** Indicador de progresso no card da skill
- **Erro:** Banner de erro na falha de instalação

**Componentes:**
- SkillTabs
- SkillCard
- SkillDetailModal
- SkillSetupWizard
- SkillConfigForm

### 8.8 /settings — Configurações

**Objetivo:** Perfil do usuário, chaves de API e configuração da aplicação.

**Seções:**

1. **Perfil** — Nome, avatar, preferência de idioma, moeda, tema (claro/escuro/sistema)
2. **Chaves de API** — Chave Anthropic (com status de validação), chave OpenAI (com status de validação), exibição mascarada, botões editar/testar. A validação chama a API com uma requisição mínima para confirmar que a chave funciona.
3. **Toggle de modo avançado** — Habilita editor YAML, visualizações de JSON bruto, logging de debug e funcionalidades orientadas a desenvolvedores em toda a UI
4. **Gerenciamento de dados** — Exportar todos os dados (squads, execuções, boas práticas) como JSON. Importar dados de JSON. Resetar banco de dados (com confirmação).
5. **Sobre** — Versão, licença, links para GitHub, documentação e changelog

**Estados:**
- **Carregando:** Formulários de skeleton
- **Salvando:** Indicador de carregamento no botão salvar
- **Salvo:** Notificação toast de sucesso
- **Erro de validação:** Erros inline nos campos
- **Chave de API inválida:** Indicador vermelho com mensagem "Chave inválida ou expirada"

**Componentes:**
- ProfileForm
- APIKeyManager (com botão de teste)
- AdvancedModeToggle
- DataExportButton
- DataImportButton
- DatabaseResetButton (com confirmação dupla)

---

## 9. Funcionalidades por Prioridade

### P0 — Core (MVP)

Estas funcionalidades devem estar funcionando antes de qualquer lançamento público. Elas constituem o produto mínimo viável.

| # | Funcionalidade | Descrição |
|---|----------------|-----------|
| P0-1 | Criação de squad via web | Criar um squad pelo assistente web (modo simples), definindo nome, descrição, agentes e pipeline |
| P0-2 | Definição rica de persona do agente | Configurar agentes com JSON completo de persona (identity, role, voice, output format, anti-patterns, quality criteria) via formulários |
| P0-3 | Definição de pipeline | Definir steps sequenciais ordenados com atribuição de agente, config de entrada/saída e tipos de step |
| P0-4 | Execução sequencial do pipeline | Executar um pipeline step-a-step, passando a saída de cada agente para o próximo |
| P0-5 | Saída em streaming em tempo real | Transmitir saída do agente token-por-token para o navegador via WebSocket |
| P0-6 | Visualização de status do agente | Mostrar status ao vivo de cada agente (ocioso, trabalhando, entregando, concluído) no canvas do pipeline |
| P0-7 | Persistência de saída do step | Salvar entrada, saída, tokens, custo e temporização de cada step no banco de dados |
| P0-8 | Histórico de execuções | Visualizar execuções passadas com status, custo, tempo e replay completo da saída |
| P0-9 | Assistente de boas-vindas | Onboarding na primeira execução com nome, propósito, chave de API e execução demo |
| P0-10 | Página de configurações | Gerenciamento de chaves de API com validação, configurações de perfil, toggle de idioma |

### P1 — Essencial

Estas funcionalidades são necessárias logo após o MVP para tornar o CrewFlow genuinamente útil.

| # | Funcionalidade | Descrição |
|---|----------------|-----------|
| P1-1 | Sistema de skills | Instalar, configurar e atribuir skills a agentes. Suporte a todos os 4 tipos de skill (mcp, script, prompt, hybrid) |
| P1-2 | Templates de squads (10) | Templates de squad pré-construídos: 4 focados em conteúdo + 6 focados em desenvolvimento (ver Seção 10) |
| P1-3 | Checkpoints | Pausar execução em steps de checkpoint para revisão humana. Interface aprovar/rejeitar/editar |
| P1-4 | Visualização de handoff | Transição animada entre agentes mostrando passagem de contexto |
| P1-5 | Biblioteca de boas práticas | 22 documentos de boas práticas importados, navegáveis e atribuíveis a agentes |
| P1-6 | Métricas por execução | Exibir tokens usados, custo monetário, tempo de execução por step e por execução |
| P1-7 | Página de galeria de templates | Galeria de templates navegável, pesquisável e categorizada com preview e "usar este" |
| P1-8 | Veto conditions | Configurar verificações automáticas de qualidade na saída do step com retry em caso de falha |
| P1-9 | Ciclos de revisão | Na rejeição (veto ou humana), rotear de volta para step anterior com feedback |
| P1-10 | Controles de execução | Pausar, retomar e cancelar pipelines em execução |

### P2 — Diferencial

Estas funcionalidades diferenciam o CrewFlow das alternativas e constroem comunidade.

| # | Funcionalidade | Descrição |
|---|----------------|-----------|
| P2-1 | Marketplace de skills | Navegar, instalar e publicar skills criadas pela comunidade |
| P2-2 | Compartilhamento de templates de squad | Exportar/importar templates de squad, compartilhar via link ou galeria comunitária |
| P2-3 | Execução paralela | Steps com o mesmo `parallelGroup` executam simultaneamente |
| P2-4 | Memória de agente | Contexto persistente entre execuções (agente lembra interações e preferências passadas) |
| P2-5 | Webhook / API pública | Disparar execuções via API HTTP, receber resultados via webhook |
| P2-6 | Notificações | Notificações por email e push no navegador ao completar execução, checkpoint ou falha |
| P2-7 | Multi-modelo por agente | Diferentes agentes no mesmo squad podem usar diferentes modelos de IA |
| P2-8 | Orçamentos de custo | Definir limites de custo por execução e por squad com parada automática |
| P2-9 | Comparação de execuções | Comparação lado-a-lado de saídas de diferentes execuções do mesmo squad |
| P2-10 | Plugin SDK | Pacote npm publicado para criar skills customizadas com TypeScript |

---

## 10. Dados de Seed

### 10.1 Boas Práticas (22 no total)

#### Boas Práticas de Plataforma (14)

| # | Nome | Plataforma | Tipo de Conteúdo |
|---|------|------------|-----------------|
| 1 | Twitter/X Thread Best Practices | twitter | thread |
| 2 | Twitter/X Single Post Best Practices | twitter | post |
| 3 | LinkedIn Article Best Practices | linkedin | article |
| 4 | LinkedIn Post Best Practices | linkedin | post |
| 5 | Instagram Caption Best Practices | instagram | caption |
| 6 | Instagram Carousel Best Practices | instagram | carousel |
| 7 | TikTok Script Best Practices | tiktok | script |
| 8 | YouTube Video Script Best Practices | youtube | script |
| 9 | Blog Post SEO Best Practices | blog | post |
| 10 | Newsletter Best Practices | email | newsletter |
| 11 | GitHub README Best Practices | github | readme |
| 12 | GitHub Pull Request Best Practices | github | pull_request |
| 13 | GitHub Issue Best Practices | github | issue |
| 14 | Technical Documentation Best Practices | docs | technical |

#### Boas Práticas de Disciplina (8)

| # | Nome | Disciplina |
|---|------|-----------|
| 15 | Copywriting Fundamentals | copywriting |
| 16 | SEO Content Writing | seo |
| 17 | Technical Writing Principles | technical_writing |
| 18 | Code Review Checklist | code_review |
| 19 | API Design Guidelines | api_design |
| 20 | Security Review Checklist | security |
| 21 | Performance Optimization Checklist | performance |
| 22 | Accessibility (a11y) Guidelines | accessibility |

### 10.2 Skills (18 no total)

#### Conteúdo e Automação (8)

| # | Nome | Tipo | Descrição |
|---|------|------|-----------|
| 1 | web_search | mcp | Buscar informações atuais na web |
| 2 | url_reader | mcp | Ler e extrair conteúdo de URLs |
| 3 | image_generator | mcp | Gerar imagens via DALL-E ou Stable Diffusion |
| 4 | text_formatter | prompt | Formatar texto para plataformas específicas |
| 5 | hashtag_generator | prompt | Gerar hashtags relevantes para conteúdo social |
| 6 | tone_analyzer | prompt | Analisar e ajustar o tom do texto |
| 7 | content_calendar | script | Gerar e gerenciar calendários de conteúdo |
| 8 | platform_publisher | hybrid | Formatar e preparar conteúdo para publicação em plataformas |

#### Novas Skills de Desenvolvimento (10)

| # | Nome | Tipo | Descrição |
|---|------|------|-----------|
| 9 | code_reader | mcp | Ler arquivos do sistema de arquivos local |
| 10 | code_writer | mcp | Escrever e modificar arquivos locais |
| 11 | git_operations | mcp | Comandos Git (status, diff, log, commit) |
| 12 | test_runner | script | Executar suítes de teste e analisar resultados |
| 13 | linter | script | Executar ESLint/Prettier e retornar achados |
| 14 | dependency_checker | script | Analisar package.json para dependências desatualizadas/vulneráveis |
| 15 | api_tester | script | Enviar requisições HTTP e validar respostas |
| 16 | db_query | mcp | Executar consultas somente-leitura no banco de dados |
| 17 | docker_manager | script | Construir, executar e gerenciar containers Docker |
| 18 | ci_checker | hybrid | Verificar status do pipeline CI/CD (GitHub Actions) |

### 10.3 Templates de Squads (10 no total)

#### Templates de Conteúdo (4)

**1. Blog Content Squad**
- **Categoria:** content
- **Descrição:** Cria posts de blog otimizados para SEO a partir de um tópico
- **Agentes:**
  - Researcher (pesquisa o tópico, reúne fontes)
  - Writer (rascunha o post do blog usando a pesquisa)
  - Editor (revisa gramática, clareza, tom)
  - SEO Specialist (otimiza para busca: título, meta, palavras-chave, estrutura)
- **Pipeline:** Researcher -> Writer -> Editor -> Checkpoint (revisão humana) -> SEO Specialist
- **Tempo estimado:** 3-5 minutos
- **Custo estimado:** $0.08 - $0.20

**2. Social Media Content Squad**
- **Categoria:** content
- **Descrição:** Cria conteúdo multi-plataforma para redes sociais a partir de um briefing único
- **Agentes:**
  - Strategist (define ângulos e mensagens-chave)
  - Twitter Writer (cria thread + post único)
  - LinkedIn Writer (cria post profissional)
  - Instagram Writer (cria legenda + esboço de carrossel)
  - Visual Director (descreve imagens/gráficos ideais para cada plataforma)
- **Pipeline:** Strategist -> [Twitter Writer | LinkedIn Writer | Instagram Writer] (paralelo) -> Visual Director
- **Tempo estimado:** 2-4 minutos
- **Custo estimado:** $0.10 - $0.25

**3. Newsletter Squad**
- **Categoria:** content
- **Descrição:** Cria uma newsletter semanal a partir de tópicos e links
- **Agentes:**
  - Curator (seleciona e resume os melhores links/tópicos)
  - Writer (escreve seções da newsletter com comentários)
  - Editor (revisa tom e consistência)
- **Pipeline:** Curator -> Writer -> Editor -> Checkpoint
- **Tempo estimado:** 3-5 minutos
- **Custo estimado:** $0.06 - $0.15

**4. YouTube Script Squad**
- **Categoria:** content
- **Descrição:** Cria um roteiro completo de vídeo para YouTube com ganchos e CTAs
- **Agentes:**
  - Researcher (pesquisa de fundo e pontos de dados)
  - Scriptwriter (escreve o roteiro completo com timestamps)
  - Hook Specialist (cria os primeiros 30 segundos para máxima retenção)
  - Thumbnail Advisor (sugere conceitos de thumbnail e títulos)
- **Pipeline:** Researcher -> Scriptwriter -> Hook Specialist -> Checkpoint -> Thumbnail Advisor
- **Tempo estimado:** 4-7 minutos
- **Custo estimado:** $0.12 - $0.30

#### Templates de Desenvolvimento (6)

**5. Code Review Squad**
- **Categoria:** dev
- **Descrição:** Code review multi-perspectiva (segurança, performance, legibilidade, arquitetura)
- **Agentes:**
  - Security Reviewer (verifica vulnerabilidades, injeção, problemas de autenticação)
  - Performance Reviewer (identifica gargalos, queries N+1, vazamentos de memória)
  - Readability Reviewer (verifica nomenclatura, estrutura, comentários, complexidade)
  - Architecture Reviewer (avalia padrões de design, princípios SOLID, acoplamento)
  - Summary Writer (consolida todas as revisões em um relatório priorizado)
- **Pipeline:** [Security Reviewer | Performance Reviewer | Readability Reviewer | Architecture Reviewer] (paralelo) -> Summary Writer
- **Tempo estimado:** 2-4 minutos
- **Custo estimado:** $0.15 - $0.35

**6. QA Test Generator Squad**
- **Categoria:** dev
- **Descrição:** Gera suítes de teste abrangentes para uma base de código
- **Agentes:**
  - Analyzer (lê código e identifica unidades testáveis, edge cases)
  - Unit Test Writer (escreve testes unitários com mocks)
  - Integration Test Writer (escreve testes de integração)
  - Test Reviewer (revisa testes quanto a cobertura e qualidade)
- **Pipeline:** Analyzer -> [Unit Test Writer | Integration Test Writer] (paralelo) -> Test Reviewer -> Checkpoint
- **Tempo estimado:** 3-6 minutos
- **Custo estimado:** $0.10 - $0.25

**7. Refactoring Squad**
- **Categoria:** dev
- **Descrição:** Analisa código e produz um plano de refatoração com implementação
- **Agentes:**
  - Code Analyst (identifica code smells, duplicação, complexidade)
  - Architect (propõe estratégia de refatoração e arquitetura alvo)
  - Implementer (escreve o código refatorado)
  - Reviewer (valida código refatorado contra funcionalidade original)
- **Pipeline:** Code Analyst -> Architect -> Checkpoint -> Implementer -> Reviewer
- **Tempo estimado:** 5-10 minutos
- **Custo estimado:** $0.20 - $0.50

**8. Documentation Squad**
- **Categoria:** dev
- **Descrição:** Gera documentação abrangente a partir de código
- **Agentes:**
  - Code Reader (lê e entende a estrutura da base de código)
  - API Documenter (gera docs de referência da API)
  - Guide Writer (escreve guias de início rápido e how-to)
  - Editor (revisa clareza, completude e precisão)
- **Pipeline:** Code Reader -> [API Documenter | Guide Writer] (paralelo) -> Editor -> Checkpoint
- **Tempo estimado:** 4-8 minutos
- **Custo estimado:** $0.15 - $0.40

**9. DevOps Pipeline Squad**
- **Categoria:** devops
- **Descrição:** Analisa e otimiza pipelines CI/CD
- **Agentes:**
  - Pipeline Analyst (lê configuração CI/CD atual, identifica problemas)
  - Optimizer (sugere melhorias de performance, caching, paralelização)
  - Security Auditor (verifica segredos no CI, práticas inseguras)
  - Implementer (escreve arquivos de configuração CI/CD otimizados)
- **Pipeline:** Pipeline Analyst -> [Optimizer | Security Auditor] (paralelo) -> Checkpoint -> Implementer
- **Tempo estimado:** 3-5 minutos
- **Custo estimado:** $0.10 - $0.25

**10. Bug Triage Squad**
- **Categoria:** dev
- **Descrição:** Analisa relatórios de bugs e produz planos de investigação
- **Agentes:**
  - Report Analyzer (analisa relatório de bug, extrai sintomas e passos de reprodução)
  - Code Investigator (rastreia caminhos de código prováveis e potenciais causas raiz)
  - Fix Planner (propõe abordagens de correção com avaliação de risco)
  - Test Planner (define testes para verificar a correção e prevenir regressão)
- **Pipeline:** Report Analyzer -> Code Investigator -> Fix Planner -> Test Planner
- **Tempo estimado:** 2-4 minutos
- **Custo estimado:** $0.08 - $0.20

---

## 11. Internacionalização (i18n)

### 11.1 Idiomas Suportados

| Prioridade | Idioma | Código | Status |
|------------|--------|--------|--------|
| 1 | Português Brasileiro | pt-BR | Padrão |
| 2 | Inglês | en | Segundo |
| 3 | Espanhol | es | Terceiro |

### 11.2 Implementação

- **Detecção automática:** Na primeira visita, detectar o idioma do navegador via `navigator.language`. Se pt-BR ou pt, usar PT-BR. Se es, usar ES. Caso contrário, padrão para EN.
- **Toggle:** Seletor de idioma na área superior direita do cabeçalho, persistido nas preferências do usuário.
- **Externalização de strings:** Todas as strings da UI são armazenadas em arquivos JSON de locale (`locales/pt-BR.json`, `locales/en.json`, `locales/es.json`). Nenhuma string hardcoded em componentes.
- **Biblioteca:** Usar `next-intl` ou `react-i18next` para interpolação, pluralização e formatação.
- **Formatação de data/hora:** Usar `Intl.DateTimeFormat` com o locale do usuário.
- **Formatação de moeda:** Usar `Intl.NumberFormat` com a preferência de moeda do usuário.
- **Conteúdo vs. UI:** Saídas dos agentes NÃO são traduzidas (estão no idioma do prompt do usuário). Apenas o chrome da UI é traduzido.
- **Dados de seed:** Nomes e descrições de boas práticas são armazenados nos três idiomas. Nomes e descrições de templates são armazenados nos três idiomas.

### 11.3 Fluxo de Trabalho de Tradução

1. Desenvolvedores adicionam novas strings ao `locales/en.json` com chaves descritivas
2. Traduções PT-BR e ES são adicionadas no mesmo PR
3. Traduções faltantes fazem fallback para EN
4. CI verifica chaves de tradução ausentes

---

## 12. Segurança

### 12.1 Proteção de Chaves de API

- Chaves de API inseridas pela UI são criptografadas antes do armazenamento usando criptografia AES-256
- A chave de criptografia é derivada de um segredo específico da máquina (ou um `ENCRYPTION_KEY` fornecido via variável de ambiente)
- Chaves de API NUNCA são logadas, NUNCA são incluídas em mensagens de erro, NUNCA são enviadas ao frontend (apenas versões mascaradas como `sk-...a3b2`)
- O arquivo `.env` está no `.gitignore` e `.dockerignore`

### 12.2 Validação de Entrada

- Todas as entradas de rotas da API são validadas com schemas Zod
- Entradas de pipeline são sanitizadas para prevenir injeção de prompt (instruções para ignorar persona)
- Caminhos de arquivo em skills (code_reader, code_writer) são sandboxed para diretórios permitidos
- SQL injection é prevenido pelas queries parametrizadas do Prisma

### 12.3 Rate Limiting

- Rotas da API possuem rate limit (padrão: 100 requisições por minuto por rota)
- Chamadas à API de IA respeitam rate limits do provedor com backoff exponencial
- A fila de execução limita execuções concorrentes (padrão: 3)

### 12.4 Segurança de Rede

- O CrewFlow roda apenas em localhost por padrão (não exposto na rede)
- Para expor na rede, o usuário deve definir explicitamente `HOST=0.0.0.0`
- Quando exposto, todas as rotas requerem autenticação (futuro: JWT ou tokens de sessão)
- Conexões WebSocket são autenticadas com o mesmo mecanismo

### 12.5 Divulgação Responsável

Um arquivo `SECURITY.md` na raiz do repositório contém:
- Como reportar vulnerabilidades de segurança (email, não issue pública)
- Timeline de resposta esperada (48 horas para reconhecimento, 7 dias para avaliação)
- Escopo da política de segurança
- Hall da fama para divulgadores responsáveis

### 12.6 Medidas Adicionais

- Nenhum segredo commitado no git (garantido pelo `.gitignore` e hook pre-commit opcional)
- Auditoria de dependências em toda execução de CI (`npm audit`)
- Headers de Content Security Policy configurados para o frontend
- Proteção CSRF em todas as rotas da API que alteram estado

---

## 13. Requisitos Não-Funcionais

### 13.1 Performance

| Métrica | Meta | Medição |
|---------|------|---------|
| Carregamento da primeira página (cold) | < 3 segundos | Lighthouse em localhost, build de produção |
| Navegação entre páginas (warm) | < 500ms | Roteamento client-side, sem reload completo |
| Latência WebSocket | < 100ms | Tempo do emit do servidor até atualização na UI |
| Tempo até primeiro token | < 2 segundos | Do início da execução até primeiro token em streaming na UI |
| Tempo de query no banco | < 50ms | Para queries típicas de entidade única |
| Tempo de query no banco (complexa) | < 200ms | Para listas paginadas com joins |
| Tempo de build (dev) | < 5 segundos | Hot reload do Turbopack |
| Tempo de build (produção) | < 60 segundos | Build de produção completo do Next.js |

### 13.2 Escalabilidade (Contexto Local)

| Dimensão | Meta |
|----------|------|
| Agentes por squad | 10+ suportados, testado com até 20 |
| Steps por pipeline | 20+ suportados |
| Execuções concorrentes | 3 por padrão, configurável até 10 |
| Total de execuções no banco | 10.000+ sem degradação |
| Total de squads | 100+ sem degradação |
| Tamanho do banco SQLite | Testado com até 1GB (SQLite suporta até 281TB) |
| Skills instaladas | 50+ sem degradação |

### 13.3 Compatibilidade

| Plataforma | Versão | Nível de Suporte |
|------------|--------|-----------------|
| Windows | 10, 11 | Completo |
| macOS | 12+ (Monterey+) | Completo |
| Linux | Ubuntu 20.04+, Fedora 36+, Arch | Completo |
| Node.js | 20.x LTS, 22.x LTS | Obrigatório |
| Navegadores | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ | Completo |

### 13.4 Confiabilidade

- **Recuperação de crash:** Se o servidor cair durante uma execução, ao reiniciar a execução é marcada como `failed` com mensagem de erro apropriada. Sem corrupção de dados.
- **Persistência da fila:** Jobs pendentes são armazenados no SQLite e sobrevivem a reinicializações.
- **Desligamento gracioso:** Em SIGTERM/SIGINT, steps em execução completam antes do processo encerrar (com timeout de 30 segundos).
- **Auto-retry:** Chamadas à API de IA fazem retry em erros transitórios (429, 500, 503) com backoff exponencial (até 3 tentativas).

### 13.5 Observabilidade

- Todas as execuções produzem logs estruturados (entradas de RunLog)
- Níveis de log: debug, info, warn, error
- Logs são visualizáveis na UI de Visualização de Execução
- Modo debug (configuração avançada) habilita logging verboso no stdout

---

## 14. Critérios de Aceite

### P0-1: Criação de Squad via Web

- [ ] Usuário pode acessar /squads/new e ver três opções de modo de criação
- [ ] No modo simples, usuário digita uma descrição e uma IA gera uma configuração de squad
- [ ] Configuração gerada inclui pelo menos 2 agentes com personas e um pipeline
- [ ] Usuário pode revisar a configuração gerada antes de salvar
- [ ] Usuário pode editar nomes, papéis e descrições dos agentes antes de salvar
- [ ] Salvar cria Squad, Agents, Pipeline e Steps no banco de dados
- [ ] Após salvar, usuário é redirecionado para /squads/[id]
- [ ] Validação impede salvar com nome vazio ou zero agentes

### P0-2: Definição Rica de Persona do Agente

- [ ] Formulário de criação de agente tem seções para todos os campos de persona (identity, role, voice, output format, anti-patterns, quality criteria, principles)
- [ ] Cada seção tem texto placeholder útil e tooltips
- [ ] Persona é salva como JSON estruturado no registro do Agent
- [ ] Persona pode ser editada após criação
- [ ] Persona é enviada como contexto de system prompt durante a execução do agente
- [ ] Persona do agente suporta output_examples como array de strings
- [ ] Anti-patterns são incluídos no system prompt como instruções explícitas de "nunca faça"

### P0-3: Definição de Pipeline

- [ ] Usuário pode adicionar steps a um pipeline com drag-and-drop ou formulário
- [ ] Cada step pode ser atribuído a um agente do squad
- [ ] Steps possuem ordem configurável (reordenáveis)
- [ ] Tipos de step (inline, checkpoint) são selecionáveis
- [ ] Visualização do pipeline atualiza em tempo real conforme steps são adicionados/removidos
- [ ] Pipeline requer pelo menos um step para ser válido
- [ ] Steps são exibidos na ordem correta no canvas visual

### P0-4: Execução Sequencial do Pipeline

- [ ] Usuário pode clicar "Executar" e fornecer texto de entrada
- [ ] Pipeline executa steps na ordem definida
- [ ] O agente de cada step recebe: sua persona como system prompt, a entrada do step como mensagem do usuário
- [ ] Saída do step é armazenada no registro RunStep
- [ ] Próximo step recebe a saída do step anterior como entrada
- [ ] Saída do step final é armazenada como output do Run
- [ ] Status da execução transiciona: pending -> running -> completed
- [ ] Se qualquer step falhar após max retries, status da execução torna-se `failed`

### P0-5: Saída em Streaming em Tempo Real

- [ ] Conexão WebSocket é estabelecida quando usuário abre uma Visualização de Execução
- [ ] Conforme cada token é gerado pela IA, é enviado ao cliente via WebSocket
- [ ] Tokens renderizam incrementalmente no painel de saída (sem esperar resposta completa)
- [ ] Markdown é renderizado progressivamente conforme tokens chegam
- [ ] Se WebSocket desconectar, cliente reconecta e busca estado atual
- [ ] Múltiplas abas do navegador podem assistir a mesma execução simultaneamente

### P0-6: Visualização de Status do Agente

- [ ] Cada card de agente no canvas do pipeline mostra um indicador de status
- [ ] Indicadores de status: cinza (ocioso), azul pulsante (trabalhando), check verde (concluído), X vermelho (falhou)
- [ ] Status atualiza em tempo real via WebSocket
- [ ] Quando um agente começa a trabalhar, seu card transiciona de ocioso para trabalhando com animação
- [ ] Quando um agente termina, seu card transiciona para concluído
- [ ] Na Visualização de Execução, a timeline de agentes mostra todos os status de uma vez

### P0-7: Persistência de Saída do Step

- [ ] Todo RunStep registra: input (JSON), output (JSON), tokensUsed (int), cost (float), startedAt, completedAt
- [ ] Dados são persistidos antes do próximo step começar (não após conclusão completa da execução)
- [ ] Se o servidor crashar no meio da execução, steps concluídos mantêm seus dados
- [ ] Custo do step é calculado a partir da contagem de tokens e precificação do modelo
- [ ] Contagem de tokens inclui tanto tokens de entrada quanto de saída

### P0-8: Histórico de Execuções

- [ ] Dashboard mostra as 10 execuções mais recentes
- [ ] /squads/[id] mostra todas as execuções daquele squad
- [ ] Cada entrada de execução mostra: ícone de status, nome do squad, timestamp, duração, custo
- [ ] Clicar em uma entrada de execução abre /squads/[id]/runs/[runId]
- [ ] Execuções concluídas mostram saída completa com todos os resultados dos steps
- [ ] Execuções com falha mostram a mensagem de erro e o step que falhou
- [ ] Execuções são ordenáveis por data, status e custo

### P0-9: Assistente de Boas-Vindas

- [ ] Primeira visita ao app redireciona para /welcome
- [ ] Passo 1: Entrada de nome com validação (não vazio)
- [ ] Passo 2: Seleção de propósito (múltipla escolha) — armazena preferência
- [ ] Passo 3: Entrada de chave de API com botão "Testar". Teste chama a API da Anthropic com uma requisição mínima. Check verde no sucesso, X vermelho com erro na falha.
- [ ] Passo 4: Execução demo executa automaticamente com template correspondente ao propósito selecionado
- [ ] Após conclusão do assistente, usuário é redirecionado para /
- [ ] Usuários retornantes com chaves de API válidas pulam o assistente inteiramente
- [ ] Estado do assistente é preservado se usuário atualizar a página (armazena progresso no localStorage)

### P0-10: Página de Configurações

- [ ] Página de configurações tem seções Perfil, Chaves de API e Avançado
- [ ] Perfil: nome e idioma podem ser alterados e salvos
- [ ] Chaves de API: chave Anthropic pode ser inserida, exibição mascarada mostra `sk-...XXXX`
- [ ] Chaves de API: botão "Testar" valida a chave contra a API do provedor
- [ ] Chaves de API: chaves são criptografadas antes do armazenamento no banco
- [ ] Toggle de modo avançado habilita/desabilita funcionalidades de desenvolvedor em todo o app
- [ ] Exportação de dados baixa um arquivo JSON com todos os dados do usuário (squads, execuções, configurações)
- [ ] Importação de dados aceita um arquivo JSON e carrega (com diálogo de confirmação)
- [ ] Todas as alterações mostram toast de sucesso ao salvar

---

*Esta especificação é a fonte única de verdade para o desenvolvimento do CrewFlow. Todas as funcionalidades, designs e decisões técnicas devem referenciar este documento. Atualizações nesta spec requerem incremento de versão e entrada no changelog.*
