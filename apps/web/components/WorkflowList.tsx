"use client"

import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { getAllWorkflows, createWorkflow, deleteWorkflow } from "../lib/api"
import type { WorkflowDTO } from "../types/workflow"

interface Props {
  selectedId?: number
  onSelect: (workflow: WorkflowDTO) => void
}

export default function WorkflowList({ selectedId, onSelect }: Props) {
  const [workflows, setWorkflows] = useState<WorkflowDTO[]>([])
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await getAllWorkflows() as { workflows: WorkflowDTO[] }
      setWorkflows(res.workflows || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function handleCreate() {
    const payload = {
      name: `Workflow ${workflows.length + 1}`,
      status: 'INACTIVE' as const,
      nodes: [],
      connections: {},
    }
    const created = await createWorkflow(payload)
    await load()
    const wf = (created?.workflow || created) as WorkflowDTO
    if (wf) onSelect(wf)
  }

  async function handleDelete(id: number) {
    await deleteWorkflow(id)
    await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold">Workflows</h2>
        <Button size="sm" variant="secondary" onClick={handleCreate}>New</Button>
      </div>
      <div className="space-y-1">
        {loading && <div className="text-xs text-neutral-500">Loading…</div>}
        {workflows.map((wf) => (
          <div key={wf.id} className={`group flex items-center justify-between rounded-md px-2 py-1.5 text-sm cursor-pointer ${selectedId === wf.id ? 'bg-blue-50 dark:bg-blue-950/30' : 'hover:bg-neutral-100 dark:hover:bg-neutral-900'}`}
            onClick={() => onSelect(wf)}>
            <span className="truncate">{wf.name}</span>
            <button className="opacity-0 group-hover:opacity-100 text-xs text-red-600 hover:underline" onClick={(e) => { e.stopPropagation(); void handleDelete(wf.id) }}>Delete</button>
          </div>
        ))}
        {!loading && workflows.length === 0 && (
          <div className="text-xs text-neutral-500">No workflows yet.</div>
        )}
      </div>
    </div>
  )
}


