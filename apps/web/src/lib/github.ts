const REPO_OWNER = 'barbourdev'
const REPO_NAME = 'crewflow'

export interface GitHubRepoStats {
  stars: number
  forks: number
  openIssues: number
  language: string | null
  description: string | null
  license: string | null
}

export interface GitHubContributor {
  login: string
  avatarUrl: string
  contributions: number
  profileUrl: string
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

/**
 * Busca dados do repositorio no GitHub.
 * Revalida a cada 1 hora para nao bater rate limit.
 */
export async function fetchRepoStats(): Promise<GitHubRepoStats | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`,
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) return null
    const data = await res.json()
    return {
      stars: data.stargazers_count ?? 0,
      forks: data.forks_count ?? 0,
      openIssues: data.open_issues_count ?? 0,
      language: data.language ?? null,
      description: data.description ?? null,
      license: data.license?.spdx_id ?? null,
    }
  } catch {
    return null
  }
}

/**
 * Busca top contributors do repositorio.
 */
export async function fetchContributors(
  limit = 10,
): Promise<GitHubContributor[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contributors?per_page=${limit}`,
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) return []
    const data = await res.json()
    if (!Array.isArray(data)) return []
    return data.map((c: Record<string, unknown>) => ({
      login: c.login as string,
      avatarUrl: c.avatar_url as string,
      contributions: c.contributions as number,
      profileUrl: c.html_url as string,
    }))
  } catch {
    return []
  }
}

/**
 * Busca total de contributors (paginado).
 */
export async function fetchContributorCount(): Promise<number> {
  try {
    // GitHub retorna Link header com last page info
    const res = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contributors?per_page=1&anon=true`,
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) return 0
    const link = res.headers.get('Link')
    if (link) {
      const match = link.match(/page=(\d+)>; rel="last"/)
      if (match?.[1]) return parseInt(match[1], 10)
    }
    // Se nao tem paginacao, contar os que vieram
    const data = await res.json()
    return Array.isArray(data) ? data.length : 0
  } catch {
    return 0
  }
}

export interface GitHubData {
  stars: number
  starsFormatted: string
  forks: number
  forksFormatted: string
  openIssues: number
  contributors: number
  contributorsFormatted: string
  license: string
  topContributors: GitHubContributor[]
  repoUrl: string
}

const FALLBACK: GitHubData = {
  stars: 0,
  starsFormatted: '0',
  forks: 0,
  forksFormatted: '0',
  openIssues: 0,
  contributors: 0,
  contributorsFormatted: '0',
  license: 'MIT',
  topContributors: [],
  repoUrl: `https://github.com/${REPO_OWNER}/${REPO_NAME}`,
}

/**
 * Busca todos os dados de uma vez para a landing page.
 * Timeout de 5s para nao travar o render se a API nao responder.
 */
export async function fetchGitHubData() {
  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('GitHub API timeout')), 5000),
    )

    const fetcher = async () => {
      const [stats, contributors, contributorCount] = await Promise.all([
        fetchRepoStats(),
        fetchContributors(10),
        fetchContributorCount(),
      ])
      return { stats, contributors, contributorCount }
    }

    const { stats, contributors, contributorCount } = await Promise.race([
      fetcher(),
      timeout,
    ])

    return {
      stars: stats?.stars ?? 0,
      starsFormatted: formatCount(stats?.stars ?? 0),
      forks: stats?.forks ?? 0,
      forksFormatted: formatCount(stats?.forks ?? 0),
      openIssues: stats?.openIssues ?? 0,
      contributors: contributorCount,
      contributorsFormatted: formatCount(contributorCount),
      license: stats?.license ?? 'MIT',
      topContributors: contributors,
      repoUrl: `https://github.com/${REPO_OWNER}/${REPO_NAME}`,
    }
  } catch {
    return FALLBACK
  }
}
