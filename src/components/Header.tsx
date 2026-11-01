import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { LogOut, Menu, Plus, UserRound, X } from 'lucide-react'
import { Logo } from './Logo'
import { useDemoAuth } from '../auth/DemoAuthProvider'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `nav-link ${isActive ? 'nav-link-active' : ''}`

export function Header() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { demoUser, signOut } = useDemoAuth()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-canvas/90 backdrop-blur-md">
      <div className="page-shell flex h-[68px] items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
          <div className="flex items-center gap-1 rounded-full border border-line/80 bg-[#F2EDE3]/70 p-1">
            <NavLink to="/" end className={navLinkClass}>
              Discover
            </NavLink>
            <NavLink to="/activity" className={navLinkClass}>
              My activity
            </NavLink>
          </div>
          <NavLink
            to="/login"
            className="ml-1 inline-flex max-w-[160px] items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-2 text-[12px] font-medium text-ink-muted transition hover:border-[#d5ccbd] hover:text-ink"
            aria-label={`Demo identity ${demoUser}. Switch or sign out`}
            title="Demo identity — switch or sign out"
          >
            <UserRound aria-hidden="true" size={13} />
            <span className="truncate">{demoUser}</span>
          </NavLink>
          <Link to="/report" className="btn-primary btn-small ml-2">
            <Plus aria-hidden="true" size={16} strokeWidth={2.3} />
            Report an item
          </Link>
        </nav>

        <button
          type="button"
          className="icon-button md:hidden"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
        </button>
      </div>

      {open && (
        <div
          id="mobile-navigation"
          className="border-t border-line bg-canvas px-5 pb-6 pt-4 md:hidden animate-fade-in"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `rounded-xl px-3 py-3 text-[15px] font-medium ${
                  isActive ? 'bg-surface text-ink shadow-sm ring-1 ring-line' : 'text-ink-muted'
                }`
              }
            >
              Discover
            </NavLink>
            <NavLink
              to="/?type=lost#browse"
              className="rounded-xl px-3 py-3 text-[15px] font-medium text-ink-muted hover:bg-surface hover:text-ink"
            >
              Lost items
            </NavLink>
            <NavLink
              to="/?type=found#browse"
              className="rounded-xl px-3 py-3 text-[15px] font-medium text-ink-muted hover:bg-surface hover:text-ink"
            >
              Found items
            </NavLink>
            <NavLink
              to="/activity"
              className={({ isActive }) =>
                `rounded-xl px-3 py-3 text-[15px] font-medium ${
                  isActive ? 'bg-surface text-ink shadow-sm ring-1 ring-line' : 'text-ink-muted'
                }`
              }
            >
              My activity
            </NavLink>
          </nav>
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3 py-2.5">
            <span className="flex min-w-0 items-center gap-2 text-[12.5px] text-ink-muted">
              <UserRound aria-hidden="true" size={14} className="shrink-0" />
              <span className="truncate">
                Signed in as <span className="font-semibold text-ink">{demoUser}</span>
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1">
              <Link
                to="/login"
                className="rounded-full px-2.5 py-1.5 text-[11.5px] font-semibold text-accent transition hover:bg-accent-soft"
              >
                Switch
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11.5px] font-semibold text-ink-muted transition hover:bg-sand/70 hover:text-ink"
              >
                <LogOut aria-hidden="true" size={12} />
                Log out
              </button>
            </span>
          </div>
          <Link to="/report" className="btn-primary mt-4 w-full">
            <Plus aria-hidden="true" size={17} strokeWidth={2.3} />
            Report an item
          </Link>
        </div>
      )}
    </header>
  )
}
