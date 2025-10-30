"use client"

import { useState } from "react"
import { Modal } from "./ui/modal"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"

interface Props {
  open: boolean
  webhookUrl: string
  onClose: () => void
  onExecute: (payload: Record<string, any>) => Promise<void>
}

export default function ExecutionModal({ open, onClose, onExecute, webhookUrl }: Props) {
  const [json, setJson] = useState<string>("{}")
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)

  async function handleExecute() {
    setError("")
    let payload: any = {}
    try {
      payload = json ? JSON.parse(json) : {}
    } catch {
      setError("Invalid JSON")
      return
    }
    setLoading(true)
    try {
      await onExecute(payload)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Execute Workflow">
      <div className="space-y-3">
        <div>
          <div className="text-xs text-neutral-500 mb-1">Webhook URL</div>
          <code className="block rounded-md bg-neutral-100 dark:bg-neutral-900 px-3 py-2 text-xs break-all">{webhookUrl}</code>
        </div>
        <Textarea label="Trigger Data (JSON)" value={json} onChange={(e) => setJson(e.currentTarget.value)} />
        {error && <div className="text-xs text-red-600">{error}</div>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleExecute} disabled={loading}>{loading ? 'Executing…' : 'Execute'}</Button>
        </div>
      </div>
    </Modal>
  )
}


