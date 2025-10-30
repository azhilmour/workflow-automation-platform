"use client"

import { useCallback, useMemo, useState } from "react"
import { ReactFlow, Background, Controls, MiniMap, addEdge, useEdgesState, useNodesState, type Connection, type Edge, type Node } from "@xyflow/react"
import { Button } from "./ui/button"
import { toReactFlowEdges, toReactFlowNodes, ensureTriggerNode, fromReactFlowNodes, fromEdgesToConnections } from "../lib/workflow-utils"
import type { WorkflowDTO } from "../types/workflow"
import PropertiesPanel from "./PropertiesPanel"
import BaseNode from "./nodes/BaseNode"

interface Props {
  workflow: WorkflowDTO
  onChange: (next: Partial<WorkflowDTO>) => void
  onExecute: () => void
}

export default function WorkflowEditor({ workflow, onChange, onExecute }: Props) {
  const initialNodes: Node[] = useMemo(() => toReactFlowNodes(ensureTriggerNode(workflow.nodes)), [workflow.nodes])
  const initialEdges: Edge[] = useMemo(() => toReactFlowEdges(workflow.connections), [workflow.connections])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const nodeTypes = useMemo(() => ({ default: BaseNode as unknown as any }), [])

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge(connection, eds))
  }, [setEdges])

  // Sync canvas when workflow prop changes (e.g., new node added from palette)
  useMemo(() => {
    setNodes(toReactFlowNodes(ensureTriggerNode(workflow.nodes)))
    setEdges(toReactFlowEdges(workflow.connections))
  }, [workflow.nodes, workflow.connections, setNodes, setEdges])

  return (
    <div className="h-full w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium">{workflow.name}</div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const nextNodes = fromReactFlowNodes(nodes, workflow.nodes)
              const nextConnections = fromEdgesToConnections(edges)
              onChange({ nodes: nextNodes as any, connections: nextConnections as any })
            }}
          >
            Save
          </Button>
          <Button size="sm" onClick={onExecute}>Execute</Button>
        </div>
      </div>
      <div className="h-[calc(100%-40px)] grid grid-cols-[1fr_320px] gap-4">
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden">
          <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            nodeTypes={nodeTypes as any}
          fitView
          >
            <MiniMap pannable zoomable />
            <Controls showInteractive={false} position="bottom-right" />
            <Background color="#e5e7eb" gap={16} />
          </ReactFlow>
        </div>
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-md p-4">
          <PropertiesPanel
            node={nodes.find((n) => n.id === selectedNodeId)?.data as any}
            onChange={(updated) => {
              setNodes((prev) => prev.map((n) => n.id === selectedNodeId ? {
                ...n,
                data: { ...n.data, ...{ label: updated.name, parameters: updated.parameters, webhookId: updated.webhookId } }
              } : n))
            }}
          />
        </div>
      </div>
    </div>
  )
}


