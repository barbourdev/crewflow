import type { AITool, AIToolCall } from '@crewflow/ai'

// ============================================================================
// Web Search Tool — Busca real na web
// ============================================================================

export interface WebSearchResult {
  title: string
  url: string
  snippet: string
}

/**
 * Definicao da tool web_search para ser passada ao AI provider.
 * O modelo pode chamar esta tool para pesquisar na web.
 */
export const WEB_SEARCH_TOOL: AITool = {
  name: 'web_search',
  description: 'Search the web for current information. Use this when you need to find recent data, facts, news, research, or any information that may not be in your training data. Returns titles, URLs, and snippets from search results.',
  input_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query. Be specific and use keywords for better results.',
      },
      num_results: {
        type: 'number',
        description: 'Number of results to return (default: 5, max: 10)',
      },
    },
    required: ['query'],
  },
}

/**
 * Definicao da tool web_fetch para buscar conteudo de uma URL.
 */
export const WEB_FETCH_TOOL: AITool = {
  name: 'web_fetch',
  description: 'Fetch and read the content of a specific web page URL. Use this after web_search to read the full content of a relevant result. Returns the text content of the page.',
  input_schema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'The URL to fetch content from.',
      },
    },
    required: ['url'],
  },
}

/** Todas as tools de pesquisa disponiveis */
export const RESEARCH_TOOLS: AITool[] = [WEB_SEARCH_TOOL, WEB_FETCH_TOOL]

// ============================================================================
// Executors
// ============================================================================

/**
 * Executa uma tool call e retorna o resultado como string.
 */
export async function executeToolCall(toolCall: AIToolCall): Promise<string> {
  switch (toolCall.name) {
    case 'web_search':
      return executeWebSearch(
        toolCall.input.query as string,
        (toolCall.input.num_results as number) ?? 5,
      )
    case 'web_fetch':
      return executeWebFetch(toolCall.input.url as string)
    default:
      return `Error: Unknown tool "${toolCall.name}"`
  }
}

/**
 * Executa busca na web usando DuckDuckGo HTML (sem API key necessaria).
 * Fallback: se o usuario configurar TAVILY_API_KEY, usa Tavily.
 */
async function executeWebSearch(query: string, numResults: number): Promise<string> {
  const maxResults = Math.min(numResults, 10)

  // Tentar Tavily se a key existir (melhor qualidade para AI)
  const tavilyKey = process.env.TAVILY_API_KEY
  if (tavilyKey) {
    return searchWithTavily(query, maxResults, tavilyKey)
  }

  // Tentar Brave Search se a key existir
  const braveKey = process.env.BRAVE_SEARCH_API_KEY
  if (braveKey) {
    return searchWithBrave(query, maxResults, braveKey)
  }

  // Default: DuckDuckGo (sem API key)
  return searchWithDuckDuckGo(query, maxResults)
}

/**
 * Busca com Tavily API (otimizado para AI agents).
 * Free tier: 1000 queries/month.
 */
async function searchWithTavily(query: string, maxResults: number, apiKey: string): Promise<string> {
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        max_results: maxResults,
        include_answer: true,
        search_depth: 'basic',
      }),
    })

    if (!res.ok) {
      throw new Error(`Tavily API error: ${res.status}`)
    }

    const data = (await res.json()) as {
      answer?: string
      results: Array<{ title: string; url: string; content: string }>
    }

    const results: WebSearchResult[] = data.results.map((r) => ({
      title: r.title,
      url: r.url,
      snippet: r.content.slice(0, 300),
    }))

    return formatSearchResults(query, results, data.answer)
  } catch (err) {
    console.error('[WEB_SEARCH] Tavily error, falling back to DuckDuckGo:', err)
    return searchWithDuckDuckGo(query, maxResults)
  }
}

/**
 * Busca com Brave Search API.
 * Free tier: 2000 queries/month.
 */
async function searchWithBrave(query: string, maxResults: number, apiKey: string): Promise<string> {
  try {
    const params = new URLSearchParams({
      q: query,
      count: String(maxResults),
    })

    const res = await fetch(`https://api.search.brave.com/res/v1/web/search?${params}`, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': apiKey,
      },
    })

    if (!res.ok) {
      throw new Error(`Brave Search API error: ${res.status}`)
    }

    const data = (await res.json()) as {
      web?: { results: Array<{ title: string; url: string; description: string }> }
    }

    const results: WebSearchResult[] = (data.web?.results ?? []).map((r) => ({
      title: r.title,
      url: r.url,
      snippet: r.description.slice(0, 300),
    }))

    return formatSearchResults(query, results)
  } catch (err) {
    console.error('[WEB_SEARCH] Brave error, falling back to DuckDuckGo:', err)
    return searchWithDuckDuckGo(query, maxResults)
  }
}

/**
 * Busca com DuckDuckGo HTML (sem API key).
 * Faz parse do HTML da pagina de resultados lite.
 */
async function searchWithDuckDuckGo(query: string, maxResults: number): Promise<string> {
  try {
    const params = new URLSearchParams({ q: query })
    const res = await fetch(`https://html.duckduckgo.com/html/?${params}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CrewFlow/1.0; +https://github.com/renatoasse/opensquad)',
      },
    })

    if (!res.ok) {
      throw new Error(`DuckDuckGo error: ${res.status}`)
    }

    const html = await res.text()
    const results = parseDuckDuckGoHTML(html, maxResults)

    return formatSearchResults(query, results)
  } catch (err) {
    return `Error searching for "${query}": ${err instanceof Error ? err.message : 'Unknown error'}. Try a different query or check your internet connection.`
  }
}

/**
 * Parse basico do HTML do DuckDuckGo lite para extrair resultados.
 */
function parseDuckDuckGoHTML(html: string, maxResults: number): WebSearchResult[] {
  const results: WebSearchResult[] = []

  // Regex para extrair resultados do DuckDuckGo HTML
  // Formato: <a class="result__a" href="URL">TITLE</a> ... <a class="result__snippet">SNIPPET</a>
  const linkRegex = /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g
  const snippetRegex = /<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g

  const links: Array<{ url: string; title: string }> = []
  const snippets: string[] = []

  let match: RegExpExecArray | null

  match = linkRegex.exec(html)
  while (match) {
    const url = decodeURIComponent(match[1]!.replace(/.*uddg=/, '').replace(/&.*/, ''))
    const title = match[2]!.replace(/<[^>]*>/g, '').trim()
    if (url.startsWith('http')) {
      links.push({ url, title })
    }
    match = linkRegex.exec(html)
  }

  match = snippetRegex.exec(html)
  while (match) {
    snippets.push(match[1]!.replace(/<[^>]*>/g, '').trim())
    match = snippetRegex.exec(html)
  }

  for (let i = 0; i < Math.min(links.length, maxResults); i++) {
    results.push({
      title: links[i]!.title,
      url: links[i]!.url,
      snippet: snippets[i] ?? '',
    })
  }

  return results
}

/**
 * Fetch do conteudo de uma pagina web.
 */
async function executeWebFetch(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CrewFlow/1.0)',
        'Accept': 'text/html,application/xhtml+xml,text/plain',
      },
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      return `Error fetching ${url}: HTTP ${res.status}`
    }

    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.includes('text/') && !contentType.includes('application/json')) {
      return `Cannot read content from ${url}: content type is ${contentType} (not text/html or JSON)`
    }

    const html = await res.text()

    // Extrair texto legivel do HTML
    const text = extractTextFromHTML(html)

    // Limitar a ~4000 chars para nao explodir o contexto
    const maxChars = 4000
    if (text.length > maxChars) {
      return `Content from ${url} (truncated to ${maxChars} chars):\n\n${text.slice(0, maxChars)}...`
    }

    return `Content from ${url}:\n\n${text}`
  } catch (err) {
    return `Error fetching ${url}: ${err instanceof Error ? err.message : 'Unknown error'}`
  }
}

/**
 * Extrai texto legivel de HTML removendo tags, scripts, styles.
 */
function extractTextFromHTML(html: string): string {
  return html
    // Remove scripts e styles
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    // Remove tags HTML
    .replace(/<[^>]+>/g, ' ')
    // Decode HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Limpar whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Formata resultados de busca em texto legivel para o agente.
 */
function formatSearchResults(query: string, results: WebSearchResult[], answer?: string): string {
  if (results.length === 0) {
    return `No results found for "${query}". Try rephrasing your search query.`
  }

  const parts: string[] = [`Search results for "${query}":\n`]

  if (answer) {
    parts.push(`**Quick Answer:** ${answer}\n`)
  }

  results.forEach((r, i) => {
    parts.push(`${i + 1}. **${r.title}**`)
    parts.push(`   URL: ${r.url}`)
    if (r.snippet) {
      parts.push(`   ${r.snippet}`)
    }
    parts.push('')
  })

  return parts.join('\n')
}
