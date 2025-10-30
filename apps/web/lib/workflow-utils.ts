import type { Edge, Node } from "@xyflow/react"
import type { IConnections, INode } from "../types/workflow"

export function toReactFlowNodes(nodes: INode[]): Node[] {
  return nodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: { x: n.position[0], y: n.position[1] },
    data: {
      label: n.name,
      parameters: n.parameters,
      webhookId: n.webhookId,
    },
  }))
}

export function toReactFlowEdges(connections: IConnections): Edge[] {
  const edges: Edge[] = []
  Object.entries(connections).forEach(([sourceId, outputs]) => {
    const main = outputs?.["main"] as any
    const first: any[] | undefined = Array.isArray(main) ? main[0] : undefined
    first?.forEach((conn, idx) => {
      edges.push({
        id: `${sourceId}-${conn.node}-${idx}`,
        source: sourceId,
        target: conn.node,
        type: "default",
      })
    })
  })
  return edges
}

export function upsertConnection(connections: IConnections, sourceId: string, targetId: string): IConnections {
  const next: IConnections = { ...connections }
  if (!next[sourceId]) next[sourceId] = {}
  if (!next[sourceId]["main"]) next[sourceId]["main"] = []
  if (!Array.isArray(next[sourceId]["main"])) next[sourceId]["main"] = []
  if (!next[sourceId]["main"][0]) next[sourceId]["main"][0] = []
  ;(next[sourceId]["main"][0] as any[]).push({ node: targetId, type: "main", index: 0 })
  return next
}

export function ensureTriggerNode(nodes: INode[]): INode[] {
  const hasTrigger = nodes.some((n) => n.type === 'trigger')
  if (hasTrigger) return nodes
  const trigger: INode = {
    id: `trigger_${Math.random().toString(36).slice(2, 7)}`,
    name: 'Webhook Trigger',
    type: 'trigger',
    typeVersion: 1,
    position: [100, 100],
    parameters: {},
    webhookId: Math.random().toString(36).slice(2, 8),
  }
  return [trigger, ...nodes]
}

export function fromReactFlowNodes(flowNodes: Node[], existing: INode[]): INode[] {
  const existingById = new Map(existing.map((n) => [n.id, n]))
  return flowNodes.map((fn) => {
    const prev = existingById.get(fn.id)
    const name = (fn.data as any)?.label ?? prev?.name ?? fn.id
    const parameters = (fn.data as any)?.parameters ?? prev?.parameters ?? {}
    const webhookId = (fn.data as any)?.webhookId ?? prev?.webhookId
    return {
      id: fn.id,
      name,
      type: fn.type || prev?.type || 'httpRequest',
      typeVersion: prev?.typeVersion ?? 1,
      position: [fn.position.x, fn.position.y],
      parameters,
      webhookId,
    }
  })
}

export function fromEdgesToConnections(edges: Edge[]): IConnections {
  const map: IConnections = {}
  for (const e of edges) {
    const outputs = map[e.source] ?? (map[e.source] = {})
    const main = (outputs['main'] ??= [])
    const first = (main[0] ??= []) as unknown as Array<{ node: string; type: string; index: number }>
    first.push({ node: e.target, type: 'main', index: 0 })
  }
  return map
}


