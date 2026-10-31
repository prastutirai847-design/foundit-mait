import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[FoundIt] Unexpected UI error', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-5 py-16">
        <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-8 text-center shadow-card">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-lost-soft text-lost">
            <AlertTriangle aria-hidden="true" size={22} />
          </span>
          <h1 className="mt-5 font-display text-[28px] text-ink">Something went sideways</h1>
          <p className="mt-3 text-[14px] leading-6 text-ink-muted">
            FoundIt hit an unexpected error. Your saved listings are still in the demo database —
            reload to pick up where you left off.
          </p>
          <button
            type="button"
            className="btn-primary mt-6"
            onClick={() => window.location.assign('/')}
          >
            Reload FoundIt
          </button>
        </div>
      </div>
    )
  }
}
