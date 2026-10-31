import { Outlet } from 'react-router-dom'
import { AlertTriangle, X } from 'lucide-react'
import { Header } from './Header'
import { Footer } from './Footer'
import { useFoundIt } from '../store/FoundItProvider'

export function Layout() {
  const { storageError, clearStorageError } = useFoundIt()

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <Header />
      {storageError && (
        <div className="border-b border-[#EBD9B6] bg-[#FBF3E2]">
          <div className="page-shell flex items-start gap-3 py-3">
            <AlertTriangle
              aria-hidden="true"
              size={17}
              className="mt-0.5 shrink-0 text-[#8A5A0A]"
            />
            <p role="alert" className="flex-1 text-[12.5px] leading-5 text-[#6F4A0C]">
              {storageError}
            </p>
            <button
              type="button"
              onClick={clearStorageError}
              className="rounded-full p-1 text-[#8A5A0A] transition hover:bg-[#F5E7C8]"
              aria-label="Dismiss storage notice"
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
