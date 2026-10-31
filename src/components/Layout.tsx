import { Outlet } from 'react-router-dom'
import { AlertTriangle, RefreshCw, X } from 'lucide-react'
import { Header } from './Header'
import { Footer } from './Footer'
import { useFoundIt } from '../store/FoundItProvider'

export function Layout() {
  const { loading, error, clearError, refresh } = useFoundIt()

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <Header />
      {loading && (
        <div
          role="status"
          aria-label="Talking to the FoundIt API"
          className="h-0.5 w-full overflow-hidden bg-accent-soft"
        >
          <div className="h-full w-1/2 animate-pulse rounded-full bg-accent" />
        </div>
      )}
      {error && (
        <div className="border-b border-[#EBD9B6] bg-[#FBF3E2]">
          <div className="page-shell flex items-start gap-3 py-3">
            <AlertTriangle
              aria-hidden="true"
              size={17}
              className="mt-0.5 shrink-0 text-[#8A5A0A]"
            />
            <p role="alert" className="flex-1 text-[12.5px] leading-5 text-[#6F4A0C]">
              {error}
            </p>
            <button
              type="button"
              onClick={() => void refresh()}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold text-[#8A5A0A] transition hover:bg-[#F5E7C8]"
            >
              <RefreshCw aria-hidden="true" size={12} />
              Retry
            </button>
            <button
              type="button"
              onClick={clearError}
              className="rounded-full p-1 text-[#8A5A0A] transition hover:bg-[#F5E7C8]"
              aria-label="Dismiss API notice"
            >
              <X aria-hidden="true" size={15} />
            </button>
          </div>
        </div>
      )}
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
