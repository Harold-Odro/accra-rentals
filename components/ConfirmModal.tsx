'use client'

import { useEffect, useRef } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'danger' | 'warning' | 'default'
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default'
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onCancel])

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  const confirmButtonStyles = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    default: 'bg-primary-600 hover:bg-primary-700 text-white'
  }

  const iconColors = {
    danger: 'text-red-600 bg-red-100',
    warning: 'text-yellow-600 bg-yellow-100',
    default: 'text-primary-600 bg-primary-100'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${iconColors[variant]}`}>
            <AlertTriangle className="h-6 w-6" />
          </div>

          {/* Content */}
          <h2 id="modal-title" className="text-xl font-display font-bold text-neutral-900 text-center mb-2">
            {title}
          </h2>
          <p className="text-neutral-600 text-center mb-6">
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${confirmButtonStyles[variant]}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
