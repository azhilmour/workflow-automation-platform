"use client"

import { Button } from "@repo/ui/button"

interface Props {
  onAdd: (type: string) => void
}

export default function NodePalette({ onAdd }: Props) {
  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold uppercase text-neutral-500">Nodes</div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" size="md" onClick={() => onAdd('httpRequest')}>HTTP</Button>
        <Button variant="secondary" size="md" onClick={() => onAdd('sendEmail')}>Email</Button>
        <Button variant="secondary" size="md" onClick={() => onAdd('sendTelegram')}>Telegram</Button>
        <Button variant="secondary" size="md" onClick={() => onAdd('condition')}>Condition</Button>
      </div>
    </div>
  )
}


