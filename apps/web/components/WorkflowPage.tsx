"use client"

import { useMemo, useState } from "react"
import { Button } from "./ui/button"
import WorkflowList from "./WorkflowList"
import WorkflowEditor from "./WorkflowEditor"
import ExecutionModal from "./ExecutionModal"
import NodePalette from "./NodePalette"
import { executeWorkflow, updateWorkflow } from "../lib/api"
import type { WorkflowDTO } from "../types/workflow"

export default function WorkflowPage() {
  const [selected, setSelected] = useState<WorkflowDTO | null>(null)
  const [execOpen, setExecOpen] = useState(false)

  const webhookUrl = useMemo(() => {
    const trigger = selected?.nodes.find((n) => n.type === 'trigger' && n.webhookId)
    return trigger ? `http://localhost:8090/webhook/handler/${trigger.webhookId}` : ''
  }, [selected])

  async function handleExecute(payload: Record<string, any>) {
    if (!selected) return
    const trigger = selected.nodes.find((n) => n.type === 'trigger' && n.webhookId)
    if (!trigger?.webhookId) return
    await executeWorkflow(trigger.webhookId, payload)
  }

  async function handleChange(next: Partial<WorkflowDTO>) {
    if (!selected) return
    const merged = { ...selected, ...next }
    await updateWorkflow(selected.id, { name: merged.name, status: merged.status, nodes: merged.nodes, connections: merged.connections })
    setSelected(merged as WorkflowDTO)
  }

  return (
    <div className="h-screen w-screen grid grid-cols-[280px_1fr] grid-rows-[56px_1fr]">
      <header className="col-span-2 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3 py-3">
          <span className="text-sm font-semibold">Workflow Automation</span>
        </div>
        <div className="flex items-center gap-2">
          {selected && <Button size="sm" onClick={() => setExecOpen(true)}>Execute</Button>}
        </div>
      </header>
      <aside className="border-r border-neutral-200 dark:border-neutral-800 p-4 space-y-4">
        <WorkflowList selectedId={selected?.id} onSelect={setSelected} />
        <NodePalette onAdd={(type) => {
          if (!selected) return
          const newNodeId = `${type}_${Math.random().toString(36).slice(2,7)}`
          const newNode = { id: newNodeId, name: type, type, typeVersion: 1, position: [200, 200] as [number, number], parameters: {} }
          const next = { ...selected, nodes: [...selected.nodes, newNode] }
          setSelected(next as any)
        }} />
      </aside>
      <main className="p-4">
        {!selected ? (
          <div className="h-full w-full rounded-md border border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-500">
            Select or create a workflow
          </div>
        ) : (
          <WorkflowEditor
            workflow={selected}
            onChange={handleChange}
            onExecute={() => setExecOpen(true)}
          />
        )}
      </main>

      {selected && (
        <ExecutionModal
          open={execOpen}
          onClose={() => setExecOpen(false)}
          onExecute={handleExecute}
          webhookUrl={webhookUrl}
        />
      )}
    </div>
  )
}


