"use client"

export default function BaseNode({ data }: { data?: { label?: string } }) {
  return (
    <div className="min-w-36 max-w-64 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100">
      <div className="truncate font-medium">{data?.label ?? 'Node'}</div>
    </div>
  )
}


