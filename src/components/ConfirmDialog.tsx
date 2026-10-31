import { useEffect, useRef } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  tone?: 'primary' | 'danger'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  tone = 'primary',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onCancel()
      }}
      className="m-auto w-[min(92vw,440px)] rounded-3xl border border-line bg-surface p-0 text-ink shadow-lift backdrop:bg-[#101826]/45 backdrop:backdrop-blur-[2px]"
    >
      {open && (
        <div className="p-6 sm:p-7">
          <h2
            id="confirm-dialog-title"
            className="font-display text-[24px] leading-tight tracking-[-0.01em] text-ink"
          >
            {title}
          </h2>
          <p
            id="confirm-dialog-description"
            className="mt-3 text-[13.5px] leading-6 text-ink-muted"
          >
            {description}
          </p>
          <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <button type="button" className="btn-secondary py-2.5 text-[13px]" onClick={onCancel}>
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`btn py-2.5 text-[13px] text-white ${
                tone === 'danger'
                  ? 'bg-[#A33E2A] hover:bg-[#8C3220]'
                  : 'bg-accent hover:bg-accent-dark'
              }`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      )}
    </dialog>
  )
}
