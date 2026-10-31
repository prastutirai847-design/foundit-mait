import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, Plus, X } from 'lucide-react'
import { Logo } from './Logo'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `nav-link ${isActive ? 'nav-link-active' : ''}`

export function Header() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

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
          <Link to="/report" className="btn-primary mt-4 w-full">
            <Plus aria-hidden="true" size={17} strokeWidth={2.3} />
            Report an item
          </Link>
        </div>
      )}
    </header>
  )
}
