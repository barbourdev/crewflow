# CrewFlow API

Documentacao completa da API REST do CrewFlow.

**Versao:** `0.1.0`
**Base URL:** `http://localhost:3000`

---

## Sumario

- [Visao Geral](#visao-geral)
- [Autenticacao](#autenticacao)
- [Formato de Resposta](#formato-de-resposta)
- [Paginacao](#paginacao)
- [Filtragem](#filtragem)
- [Ordenacao](#ordenacao)
- [Codigos de Status](#codigos-de-status)
- [Endpoints](#endpoints)
  - [Squads](#squads)
  - [Agents](#agents)
  - [Pipeline](#pipeline)
  - [Runs](#runs)
  - [Templates](#templates)
  - [Skills](#skills)
  - [Best Practices](#best-practices)
  - [Settings](#settings)
  - [Metrics](#metrics)

---

## Visao Geral

A API do CrewFlow segue os principios REST e utiliza JSON para todas as requisicoes e respostas. Todas as rotas estao disponíveis sob o prefixo `/api`.

A API utiliza o padrao de envelope (envelope pattern) para respostas, onde todos os dados sao encapsulados em uma estrutura consistente com os campos `data` e, opcionalmente, `meta`.

---

## Autenticacao

O CrewFlow atualmente opera em modo local de usuario unico. **Nenhuma autenticacao e necessaria** para acessar os endpoints da API.

> **Nota:** Em versoes futuras, podera ser adicionado suporte a autenticacao via token. Por enquanto, todas as requisicoes sao associadas automaticamente ao usuario local.

---

## Formato de Resposta

### Resposta de Sucesso

Todas as respostas bem-sucedidas seguem o padrao de envelope:

```json
{
  "data": { ... }
}
```

Para endpoints paginados, o campo `meta` e incluido:

```json
{
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

### Resposta de Erro

Todas as respostas de erro seguem este formato:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Squad not found",
    "details": null
  }
}
```

Para erros de validacao (422), o campo `details` contem os detalhes especificos:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "code": "too_small",
        "minimum": 1,
        "type": "string",
        "inclusive": true,
        "message": "String must contain at least 1 character(s)",
        "path": ["name"]
      }
    ]
  }
}
```

---

## Paginacao

Endpoints que retornam listas suportam paginacao via query parameters:

| Parameter | Tipo   | Default | Descricao                           |
|-----------|--------|---------|-------------------------------------|
| `page`    | number | `1`     | Numero da pagina (minimo: 1)        |
| `limit`   | number | `20`    | Itens por pagina (minimo: 1, maximo: 100) |

Alguns endpoints utilizam `offset` em vez de `page`:

| Parameter | Tipo   | Default | Descricao                              |
|-----------|--------|---------|----------------------------------------|
| `offset`  | number | `0`     | Numero de itens a pular                |
| `limit`   | number | `20`    | Quantidade de itens a retornar         |

A resposta inclui metadados de paginacao no campo `meta` ou diretamente no `data` (dependendo do endpoint).

---

## Filtragem

Os filtros sao aplicados via query parameters. Cada endpoint documenta seus filtros disponiveis.

**Exemplo:**

```
GET /api/templates?category=marketing
GET /api/best-practices?category=seo&platform=instagram
```

Os valores dos filtros sao comparados por igualdade exata (case-sensitive).

---

## Ordenacao

Endpoints que suportam ordenacao aceitam os seguintes query parameters:

| Parameter | Tipo   | Default     | Descricao                       |
|-----------|--------|-------------|---------------------------------|
| `sort`    | string | `createdAt` | Campo para ordenacao            |
| `order`   | string | `desc`      | Direcao: `asc` ou `desc`       |

Os campos permitidos para ordenacao variam por endpoint. Caso um campo invalido seja informado, o padrao `createdAt` sera utilizado.

---

## Codigos de Status

| Codigo | Significado             | Descricao                                                   |
|--------|-------------------------|-------------------------------------------------------------|
| `200`  | OK                      | Requisicao bem-sucedida                                     |
| `201`  | Created                 | Recurso criado com sucesso                                  |
| `204`  | No Content              | Operacao concluida sem conteudo de retorno                  |
| `400`  | Bad Request             | Requisicao invalida ou transicao de estado nao permitida    |
| `404`  | Not Found               | Recurso nao encontrado                                      |
| `409`  | Conflict                | Conflito com o estado atual do recurso                      |
| `422`  | Unprocessable Entity    | Falha na validacao dos dados enviados                       |
| `500`  | Internal Server Error   | Erro interno do servidor                                    |

---

## Endpoints

---

### Squads

#### Listar Squads

```
GET /api/squads
```

Retorna a lista de todos os squads ativos (nao arquivados) do usuario, ordenados por data de atualizacao mais recente.

**Response** `200`:

```json
{
  "data": [
    {
      "id": "clx1abc...",
      "name": "Squad de Marketing",
      "code": "squad-de-marketing",
      "description": "Squad responsavel por conteudo de marketing",
      "icon": "📢",
      "isArchived": false,
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-20T14:30:00.000Z",
      "agentCount": 3,
      "lastRun": {
        "id": "clx2def...",
        "status": "completed",
        "createdAt": "2025-01-20T14:00:00.000Z"
      }
    }
  ]
}
```

---

#### Criar Squad

```
POST /api/squads
```

Cria um novo squad. Um pipeline vazio e criado automaticamente junto com o squad. O campo `code` (slug) e gerado automaticamente a partir do `name`.

**Request Body:**

```json
{
  "name": "Squad de Marketing",
  "description": "Squad responsavel por conteudo de marketing",
  "icon": "📢"
}
```

| Campo         | Tipo   | Obrigatorio | Descricao                          |
|---------------|--------|-------------|------------------------------------|
| `name`        | string | Sim         | Nome do squad (1-100 caracteres)   |
| `description` | string | Nao         | Descricao do squad (max 500 chars) |
| `icon`        | string | Nao         | Emoji ou icone (max 10 chars)      |

**Response** `201`:

```json
{
  "data": {
    "id": "clx1abc...",
    "name": "Squad de Marketing",
    "code": "squad-de-marketing",
    "description": "Squad responsavel por conteudo de marketing",
    "icon": "📢",
    "isArchived": false,
    "userId": "clx0usr...",
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z",
    "pipeline": {
      "id": "clx1pip...",
      "squadId": "clx1abc...",
      "config": null,
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  }
}
```

**Erros:**

- `422` -- Falha na validacao (nome vazio, campos excedendo limites)

---

#### Obter Detalhes do Squad

```
GET /api/squads/:id
```

Retorna os detalhes completos de um squad, incluindo seus agents, pipeline com steps, e as 5 execucoes mais recentes.

**Path Parameters:**

| Parameter | Tipo   | Descricao         |
|-----------|--------|--------------------|
| `id`      | string | ID unico do squad  |

**Response** `200`:

```json
{
  "data": {
    "id": "clx1abc...",
    "name": "Squad de Marketing",
    "code": "squad-de-marketing",
    "description": "Squad responsavel por conteudo de marketing",
    "icon": "📢",
    "isArchived": false,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-20T14:30:00.000Z",
    "agents": [
      {
        "id": "clx1agt...",
        "name": "Redator",
        "role": "copywriter",
        "icon": "✍️",
        "persona": "{}",
        "model": "claude-sonnet-4-20250514",
        "temperature": 0.7,
        "maxTokens": 4096,
        "skills": [
          {
            "id": "clx1as...",
            "skill": {
              "id": "clx1sk...",
              "name": "Web Search",
              "type": "mcp"
            }
          }
        ]
      }
    ],
    "pipeline": {
      "id": "clx1pip...",
      "squadId": "clx1abc...",
      "config": null,
      "steps": [
        {
          "id": "clx1stp...",
          "order": 0,
          "label": "Gerar rascunho",
          "type": "inline",
          "agentId": "clx1agt...",
          "agent": {
            "id": "clx1agt...",
            "name": "Redator",
            "icon": "✍️"
          }
        }
      ]
    },
    "runs": [
      {
        "id": "clx2run...",
        "status": "completed",
        "createdAt": "2025-01-20T14:00:00.000Z",
        "_count": { "steps": 3 }
      }
    ]
  }
}
```

**Erros:**

- `404` -- Squad nao encontrado

---

#### Atualizar Squad

```
PUT /api/squads/:id
```

Atualiza os dados de um squad existente. Todos os campos sao opcionais (atualizacao parcial).

**Path Parameters:**

| Parameter | Tipo   | Descricao         |
|-----------|--------|--------------------|
| `id`      | string | ID unico do squad  |

**Request Body:**

```json
{
  "name": "Squad de Marketing v2",
  "description": "Squad atualizado",
  "icon": "🚀"
}
```

| Campo         | Tipo   | Obrigatorio | Descricao                          |
|---------------|--------|-------------|------------------------------------|
| `name`        | string | Nao         | Nome do squad (1-100 caracteres)   |
| `description` | string | Nao         | Descricao do squad (max 500 chars) |
| `icon`        | string | Nao         | Emoji ou icone (max 10 chars)      |

**Response** `200`:

```json
{
  "data": {
    "id": "clx1abc...",
    "name": "Squad de Marketing v2",
    "code": "squad-de-marketing",
    "description": "Squad atualizado",
    "icon": "🚀",
    "isArchived": false,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-21T09:00:00.000Z"
  }
}
```

**Erros:**

- `404` -- Squad nao encontrado
- `422` -- Falha na validacao

---

#### Arquivar Squad

```
DELETE /api/squads/:id
```

Arquiva um squad (soft delete). O squad nao sera mais exibido nas listagens, mas seus dados sao preservados.

**Path Parameters:**

| Parameter | Tipo   | Descricao         |
|-----------|--------|--------------------|
| `id`      | string | ID unico do squad  |

**Response** `200`:

```json
{
  "data": {
    "id": "clx1abc...",
    "name": "Squad de Marketing",
    "isArchived": true,
    "updatedAt": "2025-01-21T10:00:00.000Z"
  }
}
```

**Erros:**

- `404` -- Squad nao encontrado

---

### Agents

#### Listar Agents de um Squad

```
GET /api/squads/:id/agents
```

Retorna todos os agents pertencentes a um squad, ordenados por data de criacao (mais antigo primeiro). Inclui as skills associadas a cada agent.

**Path Parameters:**

| Parameter | Tipo   | Descricao         |
|-----------|--------|--------------------|
| `id`      | string | ID do squad        |

**Response** `200`:

```json
{
  "data": [
    {
      "id": "clx1agt...",
      "squadId": "clx1abc...",
      "name": "Redator",
      "role": "copywriter",
      "icon": "✍️",
      "persona": "{}",
      "model": "claude-sonnet-4-20250514",
      "temperature": 0.7,
      "maxTokens": 4096,
      "positionCol": 0,
      "positionRow": 0,
      "createdAt": "2025-01-15T10:05:00.000Z",
      "skills": [
        {
          "id": "clx1as...",
          "skill": {
            "id": "clx1sk...",
            "name": "Web Search",
            "type": "mcp"
          }
        }
      ]
    }
  ]
}
```

**Erros:**

- `404` -- Squad nao encontrado

---

#### Criar Agent

```
POST /api/squads/:id/agents
```

Cria um novo agent dentro de um squad.

**Path Parameters:**

| Parameter | Tipo   | Descricao         |
|-----------|--------|--------------------|
| `id`      | string | ID do squad        |

**Request Body:**

```json
{
  "name": "Redator",
  "role": "copywriter",
  "icon": "✍️",
  "persona": {
    "role": "Redator criativo",
    "identity": "Especialista em copywriting",
    "communicationStyle": "Informal e engajante",
    "principles": ["Clareza", "Criatividade"]
  },
  "model": "claude-sonnet-4-20250514",
  "temperature": 0.7,
  "maxTokens": 4096,
  "positionCol": 0,
  "positionRow": 0
}
```

| Campo         | Tipo   | Obrigatorio | Descricao                                     |
|---------------|--------|-------------|------------------------------------------------|
| `name`        | string | Sim         | Nome do agent                                  |
| `role`        | string | Sim         | Papel/funcao do agent                          |
| `icon`        | string | Nao         | Emoji ou icone                                 |
| `persona`     | object | Nao         | Objeto com personalidade do agent              |
| `model`       | string | Nao         | Modelo de IA (ex: `claude-sonnet-4-20250514`)        |
| `temperature` | number | Nao         | Temperatura de geracao (0.0 a 1.0)             |
| `maxTokens`   | number | Nao         | Limite maximo de tokens na resposta            |
| `positionCol` | number | Nao         | Posicao na coluna do canvas visual (default 0) |
| `positionRow` | number | Nao         | Posicao na linha do canvas visual (default 0)  |

**Response** `201`:

```json
{
  "data": {
    "id": "clx1agt...",
    "squadId": "clx1abc...",
    "name": "Redator",
    "role": "copywriter",
    "icon": "✍️",
    "persona": "{\"role\":\"Redator criativo\",...}",
    "model": "claude-sonnet-4-20250514",
    "temperature": 0.7,
    "maxTokens": 4096,
    "positionCol": 0,
    "positionRow": 0,
    "createdAt": "2025-01-15T10:05:00.000Z",
    "skills": []
  }
}
```

**Erros:**

- `404` -- Squad nao encontrado
- `422` -- Falha na validacao

---

#### Obter Detalhes do Agent

```
GET /api/agents/:id
```

Retorna os detalhes de um agent, incluindo suas skills e informacoes basicas do squad ao qual pertence.

**Path Parameters:**

| Parameter | Tipo   | Descricao         |
|-----------|--------|--------------------|
| `id`      | string | ID unico do agent  |

**Response** `200`:

```json
{
  "data": {
    "id": "clx1agt...",
    "squadId": "clx1abc...",
    "name": "Redator",
    "role": "copywriter",
    "icon": "✍️",
    "persona": "{}",
    "model": "claude-sonnet-4-20250514",
    "temperature": 0.7,
    "maxTokens": 4096,
    "positionCol": 0,
    "positionRow": 0,
    "createdAt": "2025-01-15T10:05:00.000Z",
    "skills": [],
    "squad": {
      "id": "clx1abc...",
      "name": "Squad de Marketing",
      "code": "squad-de-marketing"
    }
  }
}
```

**Erros:**

- `404` -- Agent nao encontrado

---

#### Atualizar Agent

```
PUT /api/agents/:id
```

Atualiza os dados de um agent existente. Todos os campos sao opcionais.

**Path Parameters:**

| Parameter | Tipo   | Descricao         |
|-----------|--------|--------------------|
| `id`      | string | ID unico do agent  |

**Request Body:**

```json
{
  "name": "Redator Senior",
  "temperature": 0.8,
  "maxTokens": 8192
}
```

| Campo         | Tipo   | Obrigatorio | Descricao                               |
|---------------|--------|-------------|-----------------------------------------|
| `name`        | string | Nao         | Nome do agent                            |
| `role`        | string | Nao         | Papel/funcao do agent                    |
| `icon`        | string | Nao         | Emoji ou icone                           |
| `persona`     | object | Nao         | Objeto com personalidade do agent        |
| `model`       | string | Nao         | Modelo de IA                             |
| `temperature` | number | Nao         | Temperatura de geracao                   |
| `maxTokens`   | number | Nao         | Limite maximo de tokens                  |
| `positionCol` | number | Nao         | Posicao na coluna do canvas visual       |
| `positionRow` | number | Nao         | Posicao na linha do canvas visual        |

**Response** `200`:

```json
{
  "data": {
    "id": "clx1agt...",
    "name": "Redator Senior",
    "role": "copywriter",
    "temperature": 0.8,
    "maxTokens": 8192,
    "skills": []
  }
}
```

**Erros:**

- `404` -- Agent nao encontrado
- `422` -- Falha na validacao

---

#### Excluir Agent

```
DELETE /api/agents/:id
```

Remove permanentemente um agent do sistema.

**Path Parameters:**

| Parameter | Tipo   | Descricao         |
|-----------|--------|--------------------|
| `id`      | string | ID unico do agent  |

**Response** `200`:

```json
{
  "data": {
    "deleted": true
  }
}
```

**Erros:**

- `404` -- Agent nao encontrado

---

### Pipeline

#### Obter Pipeline do Squad

```
GET /api/squads/:id/pipeline
```

Retorna o pipeline de um squad, incluindo todos os steps ordenados por `order`. Cada step inclui informacoes basicas do agent associado.

**Path Parameters:**

| Parameter | Tipo   | Descricao         |
|-----------|--------|--------------------|
| `id`      | string | ID do squad        |

**Response** `200`:

```json
{
  "data": {
    "id": "clx1pip...",
    "squadId": "clx1abc...",
    "config": null,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "steps": [
      {
        "id": "clx1stp...",
        "pipelineId": "clx1pip...",
        "agentId": "clx1agt...",
        "order": 0,
        "label": "Gerar rascunho",
        "type": "inline",
        "inputConfig": "{}",
        "outputConfig": "{}",
        "vetoConditions": "[]",
        "format": "markdown",
        "onReject": "retry",
        "maxRetries": 3,
        "parallelGroup": null,
        "agent": {
          "id": "clx1agt...",
          "name": "Redator",
          "icon": "✍️"
        }
      }
    ]
  }
}
```

**Erros:**

- `404` -- Pipeline nao encontrado

---

#### Atualizar Pipeline

```
PUT /api/squads/:id/pipeline
```

Substitui completamente os steps de um pipeline. Todos os steps existentes sao removidos e os novos sao criados na ordem fornecida. Opcionalmente, atualiza a configuracao do pipeline.

**Path Parameters:**

| Parameter | Tipo   | Descricao         |
|-----------|--------|--------------------|
| `id`      | string | ID do squad        |

**Request Body:**

```json
{
  "config": {
    "maxParallel": 2,
    "timeout": 300
  },
  "steps": [
    {
      "agentId": "clx1agt...",
      "order": 0,
      "label": "Pesquisar topico",
      "type": "inline",
      "inputConfig": { "source": "user" },
      "outputConfig": { "format": "json" },
      "vetoConditions": ["conteudo_inadequado"],
      "format": "markdown",
      "onReject": "retry",
      "maxRetries": 3,
      "parallelGroup": null
    },
    {
      "agentId": "clx1agt2...",
      "order": 1,
      "label": "Revisar conteudo",
      "type": "checkpoint"
    }
  ]
}
```

| Campo                   | Tipo   | Obrigatorio | Descricao                                          |
|-------------------------|--------|-------------|-----------------------------------------------------|
| `config`                | object | Nao         | Configuracao global do pipeline                     |
| `steps`                 | array  | Nao         | Lista de steps do pipeline                          |
| `steps[].agentId`       | string | Sim         | ID do agent responsavel pelo step                   |
| `steps[].order`         | number | Sim         | Ordem de execucao do step                           |
| `steps[].label`         | string | Sim         | Rotulo descritivo do step                           |
| `steps[].type`          | string | Nao         | Tipo de execucao: `inline`, `subagent`, `checkpoint` (default: `inline`) |
| `steps[].inputConfig`   | object | Nao         | Configuracao de entrada (default: `{}`)             |
| `steps[].outputConfig`  | object | Nao         | Configuracao de saida (default: `{}`)               |
| `steps[].vetoConditions`| array  | Nao         | Condicoes de veto (default: `[]`)                   |
| `steps[].format`        | string | Nao         | Formato de saida (default: `markdown`)              |
| `steps[].onReject`      | string | Nao         | Acao ao rejeitar: `retry` (default: `retry`)        |
| `steps[].maxRetries`    | number | Nao         | Maximo de tentativas (default: `3`)                 |
| `steps[].parallelGroup` | string | Nao         | Grupo de execucao paralela                          |

**Response** `200`:

```json
{
  "data": {
    "id": "clx1pip...",
    "squadId": "clx1abc...",
    "config": "{\"maxParallel\":2,\"timeout\":300}",
    "steps": [
      {
        "id": "clx1stp_new...",
        "order": 0,
        "label": "Pesquisar topico",
        "type": "inline",
        "agent": {
          "id": "clx1agt...",
          "name": "Pesquisador",
          "icon": "🔍"
        }
      }
    ]
  }
}
```

**Erros:**

- `404` -- Pipeline nao encontrado
- `422` -- Falha na validacao

---

### Runs

#### Listar Execucoes do Squad

```
GET /api/squads/:id/runs
```

Retorna a lista paginada de execucoes de um squad, ordenadas da mais recente para a mais antiga.

**Path Parameters:**

| Parameter | Tipo   | Descricao         |
|-----------|--------|--------------------|
| `id`      | string | ID do squad        |

**Query Parameters:**

| Parameter | Tipo   | Default | Descricao                              |
|-----------|--------|---------|----------------------------------------|
| `limit`   | number | `20`    | Quantidade de itens por pagina          |
| `offset`  | number | `0`     | Numero de itens a pular                 |

**Response** `200`:

```json
{
  "data": {
    "runs": [
      {
        "id": "clx2run...",
        "squadId": "clx1abc...",
        "userId": "clx0usr...",
        "status": "completed",
        "input": "{}",
        "output": "{\"result\":\"...\"}",
        "totalTokens": 15234,
        "totalCost": 0.045,
        "createdAt": "2025-01-20T14:00:00.000Z",
        "completedAt": "2025-01-20T14:02:30.000Z",
        "_count": { "steps": 3 }
      }
    ],
    "total": 42,
    "limit": 20,
    "offset": 0
  }
}
```

**Erros:**

- `404` -- Squad nao encontrado

---

#### Iniciar Nova Execucao

```
POST /api/squads/:id/runs
```

Inicia uma nova execucao do pipeline de um squad. O run e criado com status `queued` e todos os steps do pipeline sao copiados como run steps com status `pending`.

**Path Parameters:**

| Parameter | Tipo   | Descricao         |
|-----------|--------|--------------------|
| `id`      | string | ID do squad        |

**Request Body:**

```json
{
  "input": {
    "topic": "Marketing digital para startups",
    "tone": "profissional",
    "length": "2000 palavras"
  }
}
```

| Campo   | Tipo   | Obrigatorio | Descricao                                  |
|---------|--------|-------------|---------------------------------------------|
| `input` | object | Nao         | Dados de entrada para a execucao (default: `{}`) |

**Response** `201`:

```json
{
  "data": {
    "id": "clx2run...",
    "squadId": "clx1abc...",
    "userId": "clx0usr...",
    "status": "queued",
    "input": "{\"topic\":\"Marketing digital para startups\"}",
    "output": null,
    "createdAt": "2025-01-21T10:00:00.000Z",
    "completedAt": null,
    "steps": [
      {
        "id": "clx2rs...",
        "runId": "clx2run...",
        "stepId": "clx1stp...",
        "agentId": "clx1agt...",
        "status": "pending",
        "step": {
          "id": "clx1stp...",
          "label": "Gerar rascunho",
          "order": 0,
          "type": "inline"
        }
      }
    ]
  }
}
```

**Erros:**

- `404` -- Squad ou Pipeline nao encontrado
- `422` -- Falha na validacao

---

#### Obter Detalhes da Execucao

```
GET /api/runs/:id
```

Retorna os detalhes completos de uma execucao, incluindo todos os steps com seus outputs e logs.

**Path Parameters:**

| Parameter | Tipo   | Descricao         |
|-----------|--------|--------------------|
| `id`      | string | ID unico do run    |

**Response** `200`:

```json
{
  "data": {
    "id": "clx2run...",
    "squadId": "clx1abc...",
    "userId": "clx0usr...",
    "status": "completed",
    "input": "{\"topic\":\"...\"}",
    "output": "{\"result\":\"...\"}",
    "totalTokens": 15234,
    "totalCost": 0.045,
    "createdAt": "2025-01-20T14:00:00.000Z",
    "completedAt": "2025-01-20T14:02:30.000Z",
    "squad": {
      "id": "clx1abc...",
      "name": "Squad de Marketing",
      "code": "squad-de-marketing",
      "icon": "📢"
    },
    "steps": [
      {
        "id": "clx2rs...",
        "runId": "clx2run...",
        "stepId": "clx1stp...",
        "agentId": "clx1agt...",
        "status": "completed",
        "output": "{\"text\":\"...\"}",
        "tokensUsed": 5078,
        "cost": 0.015,
        "startedAt": "2025-01-20T14:00:01.000Z",
        "completedAt": "2025-01-20T14:00:45.000Z",
        "step": {
          "id": "clx1stp...",
          "label": "Gerar rascunho",
          "order": 0,
          "type": "inline"
        },
        "agent": {
          "id": "clx1agt...",
          "name": "Redator",
          "icon": "✍️"
        },
        "logs": [
          {
            "id": "clx2lg...",
            "level": "info",
            "message": "Step iniciado",
            "timestamp": "2025-01-20T14:00:01.000Z"
          }
        ]
      }
    ]
  }
}
```

**Erros:**

- `404` -- Run nao encontrado

---

#### Responder a Checkpoint

```
POST /api/runs/:id/checkpoint
```

Envia uma resposta a um checkpoint de uma execucao pausada. O run deve estar com status `paused`. Apos o envio, o run retorna ao status `running`.

**Path Parameters:**

| Parameter | Tipo   | Descricao         |
|-----------|--------|--------------------|
| `id`      | string | ID unico do run    |

**Request Body:**

```json
{
  "runId": "clx2run...",
  "stepId": "clx1stp...",
  "action": "approve",
  "feedback": "Conteudo aprovado, seguir para proxima etapa"
}
```

| Campo      | Tipo   | Obrigatorio | Descricao                                            |
|------------|--------|-------------|------------------------------------------------------|
| `runId`    | string | Sim         | ID do run                                            |
| `stepId`   | string | Sim         | ID do step do pipeline (nao do run step)             |
| `action`   | string | Sim         | Acao: `approve`, `adjust` ou `redo`                  |
| `feedback` | string | Nao         | Comentario ou feedback para o agent                  |

**Response** `200`:

```json
{
  "data": {
    "id": "clx2run...",
    "status": "running",
    "steps": [
      {
        "id": "clx2rs...",
        "status": "completed",
        "output": "{\"checkpointAction\":\"approve\",\"checkpointFeedback\":\"...\"}"
      }
    ]
  }
}
```

**Erros:**

- `400` -- Run nao esta pausado em um checkpoint
- `404` -- Run ou RunStep nao encontrado
- `422` -- Falha na validacao

---

#### Pausar Execucao

```
POST /api/runs/:id/pause
```

Pausa uma execucao que esta em andamento. Somente runs com status `running` podem ser pausados.

**Path Parameters:**

| Parameter | Tipo   | Descricao         |
|-----------|--------|--------------------|
| `id`      | string | ID unico do run    |

**Response** `200`:

```json
{
  "data": {
    "id": "clx2run...",
    "status": "paused",
    "updatedAt": "2025-01-20T14:01:00.000Z"
  }
}
```

**Erros:**

- `400` -- Somente runs em execucao (`running`) podem ser pausados
- `404` -- Run nao encontrado

---

#### Retomar Execucao

```
POST /api/runs/:id/resume
```

Retoma uma execucao que foi pausada. Somente runs com status `paused` podem ser retomados.

**Path Parameters:**

| Parameter | Tipo   | Descricao         |
|-----------|--------|--------------------|
| `id`      | string | ID unico do run    |

**Response** `200`:

```json
{
  "data": {
    "id": "clx2run...",
    "status": "running",
    "updatedAt": "2025-01-20T14:05:00.000Z"
  }
}
```

**Erros:**

- `400` -- Somente runs pausados (`paused`) podem ser retomados
- `404` -- Run nao encontrado

---

#### Cancelar Execucao

```
POST /api/runs/:id/cancel
```

Cancela uma execucao. Todos os steps pendentes ou em andamento sao marcados como `skipped`. Runs ja finalizados (`completed`) ou cancelados (`cancelled`) nao podem ser cancelados novamente.

**Path Parameters:**

| Parameter | Tipo   | Descricao         |
|-----------|--------|--------------------|
| `id`      | string | ID unico do run    |

**Response** `200`:

```json
{
  "data": {
    "id": "clx2run...",
    "status": "cancelled",
    "completedAt": "2025-01-20T14:10:00.000Z",
    "updatedAt": "2025-01-20T14:10:00.000Z"
  }
}
```

**Erros:**

- `400` -- Run ja esta finalizado ou cancelado
- `404` -- Run nao encontrado

---

### Templates

#### Listar Templates

```
GET /api/templates
```

Retorna todos os templates de squads disponíveis, ordenados por nome.

**Query Parameters:**

| Parameter  | Tipo   | Default | Descricao                                   |
|------------|--------|---------|----------------------------------------------|
| `category` | string | --      | Filtrar por categoria (ex: `marketing`, `dev`) |

**Response** `200`:

```json
{
  "data": [
    {
      "id": "clx1tpl...",
      "name": "Squad de Conteudo",
      "description": "Template para criacao de conteudo com pesquisador, redator e revisor",
      "category": "marketing",
      "icon": "📝",
      "agents": "[{\"name\":\"Pesquisador\",...}]",
      "pipeline": "{\"steps\":[...]}",
      "config": "{}",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### Obter Detalhes do Template

```
GET /api/templates/:id
```

Retorna os detalhes completos de um template.

**Path Parameters:**

| Parameter | Tipo   | Descricao            |
|-----------|--------|----------------------|
| `id`      | string | ID unico do template |

**Response** `200`:

```json
{
  "data": {
    "id": "clx1tpl...",
    "name": "Squad de Conteudo",
    "description": "Template para criacao de conteudo",
    "category": "marketing",
    "icon": "📝",
    "agents": "[{\"name\":\"Pesquisador\",\"role\":\"researcher\",\"icon\":\"🔍\",...}]",
    "pipeline": "{\"config\":{},\"steps\":[{\"agentIndex\":0,\"order\":0,\"label\":\"Pesquisar\"}]}",
    "config": "{}",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Erros:**

- `404` -- Template nao encontrado

---

#### Criar Squad a partir de Template

```
POST /api/templates/:id/use
```

Cria um novo squad completo (com agents e pipeline) baseado em um template. Os agents definidos no template sao criados e vinculados aos steps do pipeline automaticamente.

**Path Parameters:**

| Parameter | Tipo   | Descricao            |
|-----------|--------|----------------------|
| `id`      | string | ID unico do template |

**Request Body:**

```json
{
  "name": "Meu Squad de Marketing",
  "description": "Squad customizado baseado no template"
}
```

| Campo         | Tipo   | Obrigatorio | Descricao                                       |
|---------------|--------|-------------|--------------------------------------------------|
| `name`        | string | Nao         | Nome do squad (default: nome do template)        |
| `description` | string | Nao         | Descricao do squad (default: descricao do template) |

**Response** `201`:

```json
{
  "data": {
    "id": "clx1new...",
    "name": "Meu Squad de Marketing",
    "code": "meu-squad-de-marketing",
    "description": "Squad customizado baseado no template",
    "icon": "📝",
    "agents": [
      {
        "id": "clx1agt_new...",
        "name": "Pesquisador",
        "role": "researcher"
      }
    ],
    "pipeline": {
      "id": "clx1pip_new...",
      "steps": [
        {
          "id": "clx1stp_new...",
          "order": 0,
          "label": "Pesquisar",
          "agentId": "clx1agt_new..."
        }
      ]
    }
  }
}
```

**Erros:**

- `404` -- Template nao encontrado

---

### Skills

#### Listar Skills

```
GET /api/skills
```

Retorna todas as skills disponíveis no sistema, ordenadas por nome.

**Response** `200`:

```json
{
  "data": [
    {
      "id": "clx1sk...",
      "name": "Web Search",
      "description": "Realiza buscas na web",
      "type": "mcp",
      "config": "{}",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

> **Nota:** Os tipos de skill disponíveis sao: `mcp`, `script`, `prompt`, `hybrid`.

---

#### Obter Detalhes da Skill

```
GET /api/skills/:id
```

Retorna os detalhes de uma skill, incluindo a lista de agents que a utilizam.

**Path Parameters:**

| Parameter | Tipo   | Descricao          |
|-----------|--------|--------------------|
| `id`      | string | ID unico da skill  |

**Response** `200`:

```json
{
  "data": {
    "id": "clx1sk...",
    "name": "Web Search",
    "description": "Realiza buscas na web",
    "type": "mcp",
    "config": "{}",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "agents": [
      {
        "id": "clx1as...",
        "agent": {
          "id": "clx1agt...",
          "name": "Pesquisador",
          "icon": "🔍"
        }
      }
    ]
  }
}
```

**Erros:**

- `404` -- Skill nao encontrada

---

### Best Practices

#### Listar Boas Praticas

```
GET /api/best-practices
```

Retorna a lista de boas praticas cadastradas, com filtros opcionais por categoria e plataforma.

**Query Parameters:**

| Parameter  | Tipo   | Default | Descricao                                          |
|------------|--------|---------|-----------------------------------------------------|
| `category` | string | --      | Filtrar por categoria (ex: `seo`, `copywriting`)    |
| `platform` | string | --      | Filtrar por plataforma (ex: `instagram`, `linkedin`) |

**Response** `200`:

```json
{
  "data": [
    {
      "id": "clx1bp...",
      "name": "SEO para Blog Posts",
      "description": "Melhores praticas de SEO para artigos de blog",
      "category": "seo",
      "platform": "blog",
      "content": "1. Use palavras-chave no titulo...",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Settings

#### Obter Configuracoes

```
GET /api/settings
```

Retorna as configuracoes do usuario atual. As API keys sao retornadas mascaradas (ex: `sk-...xyz`).

**Response** `200`:

```json
{
  "data": {
    "id": "clx0usr...",
    "name": "Joao Silva",
    "email": "joao@email.com",
    "avatar": null,
    "language": "pt-BR",
    "currency": "BRL",
    "preferences": {
      "theme": "dark",
      "notifications": true
    },
    "apiKeys": {
      "anthropic": "sk-...xyz",
      "openai": "sk-...abc"
    }
  }
}
```

---

#### Atualizar Configuracoes

```
PUT /api/settings
```

Atualiza as configuracoes do usuario. As API keys sao armazenadas de forma completa, mas retornadas mascaradas na resposta. Todos os campos sao opcionais.

**Request Body:**

```json
{
  "name": "Joao Silva",
  "language": "pt-BR",
  "currency": "BRL",
  "anthropicApiKey": "sk-ant-...",
  "openaiApiKey": "sk-..."
}
```

| Campo             | Tipo   | Obrigatorio | Descricao                                     |
|-------------------|--------|-------------|------------------------------------------------|
| `name`            | string | Nao         | Nome do usuario (1-100 caracteres)             |
| `language`        | string | Nao         | Idioma: `pt-BR`, `en` ou `es`                 |
| `currency`        | string | Nao         | Moeda: `BRL`, `USD` ou `EUR`                  |
| `anthropicApiKey` | string | Nao         | API key do Anthropic                           |
| `openaiApiKey`    | string | Nao         | API key do OpenAI                              |

**Response** `200`:

```json
{
  "data": {
    "id": "clx0usr...",
    "name": "Joao Silva",
    "email": "joao@email.com",
    "language": "pt-BR",
    "currency": "BRL",
    "apiKeys": {
      "anthropic": "sk-...xyz",
      "openai": "sk-...abc"
    }
  }
}
```

**Erros:**

- `422` -- Falha na validacao (idioma ou moeda invalidos)

---

#### Validar API Key

```
POST /api/settings/validate-key
```

Valida uma API key fazendo uma chamada de teste ao provider correspondente. A key nao e armazenada neste endpoint.

**Request Body:**

```json
{
  "provider": "anthropic",
  "apiKey": "sk-ant-..."
}
```

| Campo      | Tipo   | Obrigatorio | Descricao                                |
|------------|--------|-------------|------------------------------------------|
| `provider` | string | Sim         | Provider: `anthropic` ou `openai`        |
| `apiKey`   | string | Sim         | API key a ser validada (min 1 caractere) |

**Response** `200` (key valida):

```json
{
  "data": {
    "valid": true
  }
}
```

**Response** `200` (key invalida):

```json
{
  "data": {
    "valid": false,
    "error": "Invalid API key"
  }
}
```

**Erros:**

- `422` -- Falha na validacao (provider invalido, key vazia)

---

### Metrics

#### Obter Metricas do Dashboard

```
GET /api/metrics/dashboard
```

Retorna metricas resumidas para o dashboard, incluindo totais do dia e as execucoes mais recentes.

**Response** `200`:

```json
{
  "data": {
    "totalSquads": 5,
    "runsToday": 12,
    "costToday": 1.35,
    "recentRuns": [
      {
        "id": "clx2run...",
        "status": "completed",
        "totalTokens": 15234,
        "totalCost": 0.045,
        "createdAt": "2025-01-21T10:00:00.000Z",
        "completedAt": "2025-01-21T10:02:30.000Z",
        "squad": {
          "id": "clx1abc...",
          "name": "Squad de Marketing",
          "icon": "📢"
        }
      }
    ]
  }
}
```

---

## Referencia Rapida

| Metodo   | Endpoint                        | Descricao                           |
|----------|---------------------------------|--------------------------------------|
| `GET`    | `/api/squads`                   | Listar squads                        |
| `POST`   | `/api/squads`                   | Criar squad                          |
| `GET`    | `/api/squads/:id`               | Detalhes do squad                    |
| `PUT`    | `/api/squads/:id`               | Atualizar squad                      |
| `DELETE` | `/api/squads/:id`               | Arquivar squad                       |
| `GET`    | `/api/squads/:id/agents`        | Listar agents do squad               |
| `POST`   | `/api/squads/:id/agents`        | Criar agent                          |
| `GET`    | `/api/agents/:id`               | Detalhes do agent                    |
| `PUT`    | `/api/agents/:id`               | Atualizar agent                      |
| `DELETE` | `/api/agents/:id`               | Excluir agent                        |
| `GET`    | `/api/squads/:id/pipeline`      | Obter pipeline                       |
| `PUT`    | `/api/squads/:id/pipeline`      | Atualizar pipeline                   |
| `GET`    | `/api/squads/:id/runs`          | Listar execucoes                     |
| `POST`   | `/api/squads/:id/runs`          | Iniciar execucao                     |
| `GET`    | `/api/runs/:id`                 | Detalhes da execucao                 |
| `POST`   | `/api/runs/:id/checkpoint`      | Responder checkpoint                 |
| `POST`   | `/api/runs/:id/pause`           | Pausar execucao                      |
| `POST`   | `/api/runs/:id/resume`          | Retomar execucao                     |
| `POST`   | `/api/runs/:id/cancel`          | Cancelar execucao                    |
| `GET`    | `/api/templates`                | Listar templates                     |
| `GET`    | `/api/templates/:id`            | Detalhes do template                 |
| `POST`   | `/api/templates/:id/use`        | Criar squad a partir de template     |
| `GET`    | `/api/skills`                   | Listar skills                        |
| `GET`    | `/api/skills/:id`               | Detalhes da skill                    |
| `GET`    | `/api/best-practices`           | Listar boas praticas                 |
| `GET`    | `/api/settings`                 | Obter configuracoes                  |
| `PUT`    | `/api/settings`                 | Atualizar configuracoes              |
| `POST`   | `/api/settings/validate-key`    | Validar API key                      |
| `GET`    | `/api/metrics/dashboard`        | Metricas do dashboard                |
