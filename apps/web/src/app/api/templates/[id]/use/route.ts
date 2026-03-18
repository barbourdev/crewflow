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
        for (const stepDef of templatePipeline.steps) {
          await tx.step.create({
            data: {
              pipelineId: pipeline.id,
              agentId: agentIdMap[stepDef.agentIndex] ?? null,
              order: stepDef.order,
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
