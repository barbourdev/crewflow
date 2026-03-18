import { PrismaClient } from '@prisma/client'
import { platformBestPractices } from './seed-data/best-practices-platform'
import { disciplineBestPractices } from './seed-data/best-practices-discipline'
import { skills as skillsData } from './seed-data/skills'
import { squadTemplates } from './seed-data/squad-templates'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting CrewFlow seed...')

  // Check if already seeded
  const existingUser = await prisma.user.findFirst()
  if (existingUser) {
    console.log('✅ Database already has data. Seed skipped.')
    return
  }

  // ====================================================================
  // DEFAULT USER
  // ====================================================================
  const user = await prisma.user.create({
    data: {
      name: 'User',
      role: 'admin',
      language: 'pt-BR',
      currency: 'USD',
      preferences: JSON.stringify({
        theme: 'dark',
        language: 'pt-BR',
        advancedMode: false,
        defaultModel: 'claude-sonnet-4-20250514',
        currency: 'USD',
      }),
    },
  })
  console.log('👤 Default user created')

  // ====================================================================
  // BEST PRACTICES (22)
  // ====================================================================
  const allBestPractices = [...platformBestPractices, ...disciplineBestPractices]

  for (const bp of allBestPractices) {
    await prisma.bestPractice.create({ data: bp })
  }
  console.log(`📚 ${allBestPractices.length} best practices created`)

  // ====================================================================
  // SKILLS (18)
  // ====================================================================
  for (const skill of skillsData) {
    await prisma.skill.create({
      data: {
        name: skill.name,
        type: skill.type,
        description: skill.description,
        icon: skill.icon,
        config: skill.config || '{}',
        implementation: skill.implementation || null,
        isBuiltin: skill.isBuiltin,
        version: skill.version,
      },
    })
  }
  console.log(`🔌 ${skillsData.length} skills created`)

  // ====================================================================
  // SQUAD TEMPLATES (10)
  // ====================================================================
  for (const template of squadTemplates) {
    await prisma.squadTemplate.create({ data: template })
  }
  console.log(`📦 ${squadTemplates.length} squad templates created`)

  // ====================================================================
  // EXAMPLE SQUAD (so the user sees something on the dashboard)
  // ====================================================================
  const squad = await prisma.squad.create({
    data: {
      name: 'My First Squad',
      code: 'my-first-squad',
      icon: '🚀',
      description: 'Example squad to explore CrewFlow',
      userId: user.id,
    },
  })

  await prisma.agent.createMany({
    data: [
      {
        squadId: squad.id,
        name: 'Rita Research',
        icon: '🔍',
        role: 'Researcher',
        persona: JSON.stringify({
          identity: 'Meticulous researcher who finds the best sources and data. Never presents an insight without supporting evidence.',
          role_definition: 'Research and synthesize information about the requested topic, producing a comprehensive brief.',
          operational_framework: {
            methodology: '1. Understand the topic and audience. 2. Search for authoritative sources. 3. Identify unique angles. 4. Compile research brief with citations.',
            constraints: ['Minimum 3 sources per claim', 'Include quantitative data', 'Flag unverified claims'],
          },
          principles: ['Accuracy over speed', 'Primary sources over secondary', 'Always cite sources'],
          anti_patterns: ['Never present opinions as facts', 'Never rely on a single source'],
          quality_criteria: ['All claims supported by sources', 'At least 3 content angles identified'],
        }),
        positionCol: 1,
        positionRow: 1,
      },
      {
        squadId: squad.id,
        name: 'Carlos Copy',
        icon: '✍️',
        role: 'Copywriter',
        persona: JSON.stringify({
          identity: 'Creative copywriter with a talent for irresistible hooks. Every word earns its place.',
          role_definition: 'Transform research into engaging, persuasive content tailored to the target audience.',
          operational_framework: {
            methodology: '1. Read research brief. 2. Identify key message and angle. 3. Write hook. 4. Write body with value. 5. Add CTA. 6. Self-review.',
          },
          voice_and_style: {
            tone: 'Conversational and direct',
            vocabulary: 'Simple words, power verbs, no filler',
          },
          principles: ['Every sentence must pull the reader to the next', 'Benefits before features', 'Hook is everything'],
          anti_patterns: ['Never use clichés', 'Never start with "In today\'s world..."', 'Never write without knowing the audience'],
        }),
        positionCol: 2,
        positionRow: 1,
      },
      {
        squadId: squad.id,
        name: 'Victor Verdict',
        icon: '👁️',
        role: 'Reviewer',
        persona: JSON.stringify({
          identity: 'Exacting editor with zero tolerance for mediocrity. Gives specific, actionable feedback.',
          role_definition: 'Review content for quality, accuracy, consistency, and adherence to best practices.',
          operational_framework: {
            methodology: '1. Check structure and flow. 2. Verify factual accuracy. 3. Check tone consistency. 4. Score against quality criteria. 5. Provide specific feedback.',
          },
          principles: ['Specific feedback over general praise', 'If in doubt, reject', 'Quality gates protect the brand'],
          anti_patterns: ['Never give vague feedback like "make it better"', 'Never approve content that violates constraints'],
        }),
        positionCol: 1,
        positionRow: 2,
      },
    ],
  })

  const pipeline = await prisma.pipeline.create({
    data: { squadId: squad.id },
  })

  const agents = await prisma.agent.findMany({
    where: { squadId: squad.id },
    orderBy: { createdAt: 'asc' },
  })

  await prisma.step.createMany({
    data: [
      { pipelineId: pipeline.id, agentId: agents[0]!.id, order: 0, label: 'Research topic', type: 'subagent' },
      { pipelineId: pipeline.id, order: 1, label: 'Approve research', type: 'checkpoint' },
      { pipelineId: pipeline.id, agentId: agents[1]!.id, order: 2, label: 'Write content', type: 'inline' },
      { pipelineId: pipeline.id, order: 3, label: 'Approve content', type: 'checkpoint' },
      { pipelineId: pipeline.id, agentId: agents[2]!.id, order: 4, label: 'Review quality', type: 'inline', onReject: 'retry' },
    ],
  })

  // Associar skills aos agentes do example squad
  const apifySkill = await prisma.skill.findUnique({ where: { name: 'apify' } })
  if (apifySkill && agents[0]) {
    await prisma.agentSkill.create({
      data: { agentId: agents[0].id, skillId: apifySkill.id },
    })
  }

  console.log('🚀 Example squad created')
  console.log('')
  console.log('✅ Seed complete!')
  console.log(`   👤 1 user`)
  console.log(`   📚 ${allBestPractices.length} best practices`)
  console.log(`   🔌 ${skillsData.length} skills`)
  console.log(`   📦 ${squadTemplates.length} squad templates`)
  console.log(`   🚀 1 example squad`)
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
