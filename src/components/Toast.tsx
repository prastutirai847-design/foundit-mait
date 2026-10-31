import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { createId } from '../utils/id'

type ToastVariant = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const ICON_STYLES = {
  success: 'text-found',
  error: 'text-[#A83F2C]',
  info: 'text-accent',
}

function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const Icon = ICONS[item.variant]

  return (
    <div
      role="status"
      className="pointer-events-auto flex w-full items-start gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5 shadow-lift animate-toast-in sm:w-[380px]"
    >
      <Icon aria-hidden="true" size={18} className={`mt-0.5 shrink-0 ${ICON_STYLES[item.variant]}`} />
      <p className="flex-1 text-[13.5px] font-medium leading-5 text-ink-soft">{item.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss notification"
        className="-mr-1 -mt-1 rounded-full p-1 text-ink-faint transition hover:bg-sand/70 hover:text-ink"
      >
        <X aria-hidden="true" size={15} />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef(new Map<string, number>())

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      window.clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const toast = useCallback(
    (message: string, variant: ToastVariant = 'success') => {
      const id = createId('toast')
      setToasts((current) => [...current.slice(-2), { id, message, variant }])
      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), variant === 'error' ? 6500 : 4200),
      )
    },
    [dismiss],
  )

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[80] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
      >
        {toasts.map((item) => (
          <Toast key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside ToastProvider')
  return context
}
