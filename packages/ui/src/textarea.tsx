"use client"

import type { TextareaHTMLAttributes, ReactNode } from "react"

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  description?: ReactNode
  error?: string
}

export const Textarea = ({ label, description, error, className = "", id, ...props }: TextareaProps) => {
  const inputId = id || props.name || `textarea-${Math.random().toString(36).slice(2)}`

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className="w-full min-h-[120px] rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...props}
      />
      {description && (
        <p className="mt-1 text-xs text-neutral-500">{description}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}

export default Textarea

