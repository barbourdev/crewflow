import { LandingOrchestrator } from '@/components/landing/landing-orchestrator'
import { fetchGitHubData } from '@/lib/github'

export default async function LandingPage() {
  const github = await fetchGitHubData()

  return <LandingOrchestrator github={github} />
}
