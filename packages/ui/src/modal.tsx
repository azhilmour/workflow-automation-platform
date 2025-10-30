"use client"

import type { ReactNode } from "react"

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  widthClassName?: string
}

export const Modal = ({ open, onClose, title, children, footer, widthClassName = "max-w-2xl" }: ModalProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative w-full ${widthClassName} bg-white dark:bg-neutral-900 rounded-lg shadow-lg`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200" aria-label="Close">×</button>
        </div>
        <div className="px-4 py-4">
          {children}
        </div>
        {footer && (
          <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal

