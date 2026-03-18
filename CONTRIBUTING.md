# Contribuindo com o CrewFlow

Obrigado pelo interesse em contribuir!

## Pré-requisitos

- Node.js 20+
- npm 10+

## Setup

```bash
git clone <repo-url>
cd crewflow
npm install
npm run dev
```

O app estará rodando em `http://localhost:3000`.

## Estrutura do Projeto

```
crewflow/
├── apps/web/          # App Next.js (frontend + API)
├── packages/engine/   # Motor de execução de pipelines
├── packages/ai/       # Abstração de provedores IA
├── packages/shared/   # Tipos e schemas compartilhados
└── data/              # Banco SQLite (criado automaticamente)
```

## Comandos

```bash
npm run dev        # Servidor de desenvolvimento
npm run build      # Build de produção
npm run test       # Rodar testes
npm run lint       # Rodar linter
npm run typecheck  # Checar tipos TypeScript
npm run db:push    # Aplicar schema no banco
npm run db:seed    # Popular banco com dados iniciais
```

## Estilo de Código

- TypeScript strict mode
- Prettier para formatação
- ESLint para linting
- Conventional Commits para mensagens de git

### Conventional Commits

```
feat: add squad builder wizard
fix: resolve WebSocket reconnection issue
docs: update API documentation
chore: upgrade dependencies
refactor: simplify pipeline runner
test: add agent executor tests
```

## Pull Requests

1. Fork o repo e crie sua branch a partir de `main`
2. Faça suas alterações
3. Adicione testes para funcionalidades novas
4. Garanta que todos os testes passam
5. Abra um PR com descrição clara

## Reportar Bugs

Use o [template de Bug Report](https://github.com/crewflow/crewflow/issues/new?template=bug_report.md).

## Sugerir Features

Use o [template de Feature Request](https://github.com/crewflow/crewflow/issues/new?template=feature_request.md).

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a Licença MIT.
