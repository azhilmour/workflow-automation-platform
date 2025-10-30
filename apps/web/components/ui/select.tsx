"use client"

import type { SelectHTMLAttributes, ReactNode } from "react"

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  description?: ReactNode
  error?: string
  options?: Array<{ label: string; value: string }>
}

export const Select = ({ label, description, error, options, className = "", id, children, ...props }: SelectProps) => {
  const selectId = id || props.name || `select-${Math.random().toString(36).slice(2)}`

  return (
    <div className={className}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...props}
      >
        {options ? options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        )) : children}
      </select>
      {description && (
        <p className="mt-1 text-xs text-neutral-500">{description}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}

export default Select

