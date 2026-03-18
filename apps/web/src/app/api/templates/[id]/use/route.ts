import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { created, notFound, handleError } from '@/lib/api-response'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await prisma.user.findFirstOrThrow()
    const body = await request.json()

    const template = await prisma.squadTemplate.findUnique({
      where: { id },
    })

    if (!template) return notFound('Template')

    const squadName = body.name ?? template.name
    const baseCode = slugify(squadName)
    let code = baseCode
    let counter = 1

    while (await prisma.squad.findUnique({ where: { code } })) {
      code = `${baseCode}-${counter}`
      counter++
    }

    const templateAgents = JSON.parse(template.agents) as Array<{
      name: string
      role: string
      icon?: string
      persona?: Record<string, unknown>
      skills?: string[]
      model?: string
      temperature?: number
      maxTokens?: number
      positionCol?: number
      positionRow?: number
    }>

    const templatePipeline = JSON.parse(template.pipeline) as {
      config?: Record<string, unknown>
      steps?: Array<{
        agentIndex: number
        order: number
        label: string
        type?: string
        inputConfig?: Record<string, unknown>
        outputConfig?: Record<string, unknown>
        vetoConditions?: string[]
        format?: string
        onReject?: string
        maxRetries?: number
        parallelGroup?: string
      }>
    }

    const squad = await prisma.$transaction(async (tx) => {
      const newSquad = await tx.squad.create({
        data: {
          name: squadName,
          code,
          description: body.description ?? template.description,
          icon: template.icon,
          userId: user.id,
          config: template.config,
        },
      })

      const agentIdMap: string[] = []
      const agentSkillNames: Map<string, string[]> = new Map()

      for (const agentDef of templateAgents) {
        const agent = await tx.agent.create({
          data: {
            squadId: newSquad.id,
            name: agentDef.name,
            role: agentDef.role,
            icon: agentDef.icon,
            persona: agentDef.persona
              ? JSON.stringify(agentDef.persona)
              : '{}',
            model: agentDef.model,
            temperature: agentDef.temperature,
            maxTokens: agentDef.maxTokens,
            positionCol: agentDef.positionCol ?? 0,
            positionRow: agentDef.positionRow ?? 0,
          },
        })
        agentIdMap.push(agent.id)
        if (agentDef.skills && agentDef.skills.length > 0) {
          agentSkillNames.set(agent.id, agentDef.skills)
        }
      }

      // Associar skills aos agentes
      if (agentSkillNames.size > 0) {
        const allSkillNames = new Set<string>()
        for (const names of agentSkillNames.values()) {
          for (const n of names) allSkillNames.add(n)
        }

        const skills = await tx.skill.findMany({
          where: { name: { in: [...allSkillNames] } },
        })
        const skillByName = new Map(skills.map((s) => [s.name, s.id]))

        for (const [agentId, skillNames] of agentSkillNames) {
          for (const skillName of skillNames) {
            const skillId = skillByName.get(skillName)
            if (skillId) {
              await tx.agentSkill.create({
                data: { agentId, skillId },
              })
            }
          }
        }
      }

      const pipeline = await tx.pipeline.create({
        data: {
          squadId: newSquad.id,
          config: templatePipeline.config
            ? JSON.stringify(templatePipeline.config)
            : '{}',
        },
      })

      if (templatePipeline.steps) {
        for (let idx = 0; idx < templatePipeline.steps.length; idx++) {
          const stepDef = templatePipeline.steps[idx]!
          await tx.step.create({
            data: {
              pipelineId: pipeline.id,
              agentId: stepDef.agentIndex != null ? (agentIdMap[stepDef.agentIndex] ?? null) : null,
              order: stepDef.order ?? idx,
              label: stepDef.label,
              type: stepDef.type ?? 'inline',
              inputConfig: stepDef.inputConfig
                ? JSON.stringify(stepDef.inputConfig)
                : '{}',
              outputConfig: stepDef.outputConfig
                ? JSON.stringify(stepDef.outputConfig)
                : '{}',
              vetoConditions: stepDef.vetoConditions
                ? JSON.stringify(stepDef.vetoConditions)
                : '[]',
              format: stepDef.format ?? 'markdown',
              onReject: stepDef.onReject ?? 'retry',
              maxRetries: stepDef.maxRetries ?? 3,
              parallelGroup: stepDef.parallelGroup,
            },
          })
        }
      }

      return tx.squad.findUnique({
        where: { id: newSquad.id },
        include: {
          agents: true,
          pipeline: {
            include: { steps: { orderBy: { order: 'asc' } } },
          },
        },
      })
    })

    return created(squad)
  } catch (err) {
    return handleError(err)
  }
}
