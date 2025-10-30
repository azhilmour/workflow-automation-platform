"use client"

import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Select } from "./ui/select"
import type { INode } from "../types/workflow"

interface Props {
  node?: INode | null
  onChange: (next: INode) => void
}

export default function PropertiesPanel({ node, onChange }: Props) {
  if (!node) return (
    <div className="text-sm text-neutral-500">Select a node to edit properties</div>
  )

  return (
    <div className="space-y-3">
      <Input label="Name" value={node.name} onChange={(e) => onChange({ ...node, name: e.currentTarget.value })} />
      {node.type === 'trigger' && (
        <Input label="Webhook ID" value={node.webhookId || ''} onChange={(e) => onChange({ ...node, webhookId: e.currentTarget.value })} />
      )}
      {node.type === 'httpRequest' && (
        <div className="space-y-2">
          <Select label="Method" value={node.parameters?.method || 'GET'} onChange={(e) => onChange({ ...node, parameters: { ...node.parameters, method: e.currentTarget.value } })}
            options={[{ label: 'GET', value: 'GET' }, { label: 'POST', value: 'POST' }, { label: 'PUT', value: 'PUT' }, { label: 'DELETE', value: 'DELETE' }]} />
          <Input label="URL" value={node.parameters?.url || ''} onChange={(e) => onChange({ ...node, parameters: { ...node.parameters, url: e.currentTarget.value } })} />
          <Textarea label="Body" value={node.parameters?.body || ''} onChange={(e) => onChange({ ...node, parameters: { ...node.parameters, body: e.currentTarget.value } })} />
        </div>
      )}
      {node.type === 'sendEmail' && (
        <div className="space-y-2">
          <Input label="To" value={node.parameters?.to || ''} onChange={(e) => onChange({ ...node, parameters: { ...node.parameters, to: e.currentTarget.value } })} />
          <Input label="Subject" value={node.parameters?.subject || ''} onChange={(e) => onChange({ ...node, parameters: { ...node.parameters, subject: e.currentTarget.value } })} />
          <Textarea label="Body" value={node.parameters?.body || ''} onChange={(e) => onChange({ ...node, parameters: { ...node.parameters, body: e.currentTarget.value } })} />
        </div>
      )}
      {node.type === 'sendTelegram' && (
        <div className="space-y-2">
          <Input label="Chat ID" value={node.parameters?.chatId || ''} onChange={(e) => onChange({ ...node, parameters: { ...node.parameters, chatId: e.currentTarget.value } })} />
          <Textarea label="Message" value={node.parameters?.message || ''} onChange={(e) => onChange({ ...node, parameters: { ...node.parameters, message: e.currentTarget.value } })} />
        </div>
      )}
    </div>
  )
}


