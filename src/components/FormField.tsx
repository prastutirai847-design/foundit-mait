import type { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

interface FormFieldProps {
  id: string
  label: string
  required?: boolean
  optional?: boolean
  hint?: string
  error?: string
  className?: string
  children: ReactNode
}

export function FormField({
  id,
  label,
  required = false,
  optional = false,
  hint,
  error,
  className = '',
  children,
}: FormFieldProps) {
  return (
    <div className={className}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-semibold text-ink-soft">
          {label}
          {required && (
            <span aria-hidden="true" className="ml-0.5 text-accent">
              *
            </span>
          )}
        </label>
        {optional && (
          <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-faint">
            Optional
          </span>
        )}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="field-error">
          <AlertCircle aria-hidden="true" size={13} className="mt-0.5 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function describedBy(id: string, error?: string, hint?: string): string | undefined {
  if (error) return `${id}-error`
  if (hint) return `${id}-hint`
  return undefined
}
