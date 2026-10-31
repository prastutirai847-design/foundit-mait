import { Link } from 'react-router-dom'
import { HardDrive, LockKeyhole } from 'lucide-react'
import { Logo } from './Logo'

const exploreLinks = [  { label: 'Discover all items', to: '/' },
  { label: 'Lost items', to: '/?type=lost#browse' },
  { label: 'Found items', to: '/?type=found#browse' },
  { label: 'Report an item', to: '/report' },
]

const activityLinks = [
  { label: 'My reports', to: '/activity?tab=reports' },
  { label: 'Incoming requests', to: '/activity?tab=incoming' },
  { label: 'My requests', to: '/activity?tab=requests' },
]

const areaLinks = [
  { label: 'Library', to: '/?location=library#browse' },
  { label: 'Canteen', to: '/?location=canteen#browse' },
  { label: 'Computer Labs', to: '/?location=computer-labs#browse' },
  { label: 'Auditorium', to: '/?location=auditorium#browse' },
]

const YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="mt-20 bg-[#101826] text-white/65">
      <div className="page-shell py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo inverse withCampusLabel={false} />
            <p className="mt-5 font-display text-[22px] leading-snug text-white/90">
              Lost something on campus? Let&apos;s find it.
            </p>
            <p className="mt-3 text-[13.5px] leading-6">
              A calm, campus-only place to report lost belongings and return found items at MAIT.
            </p>
            <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-3.5 text-[12px] leading-5 text-white/70">
              <LockKeyhole aria-hidden="true" size={15} className="mt-0.5 shrink-0 text-white/55" />
              <p>
                Everything stays in this browser. Listings and requests are not shared with other
                students or devices.
              </p>
            </div>
          </div>

          <nav aria-label="Explore FoundIt">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
              Explore
            </h2>
            <ul className="mt-4 space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="rounded text-[13.5px] transition hover:text-white focus-visible:outline-offset-4"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Your activity">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
              Your activity
            </h2>
            <ul className="mt-4 space-y-3">
              {activityLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="rounded text-[13.5px] transition hover:text-white focus-visible:outline-offset-4"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Campus areas">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
              Campus areas
            </h2>
            <ul className="mt-4 space-y-3">
              {areaLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="rounded text-[13.5px] transition hover:text-white focus-visible:outline-offset-4"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-white/10 pt-7 text-[12px] leading-5 text-white/60 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="flex items-start gap-2">
              <HardDrive aria-hidden="true" size={14} className="mt-0.5 shrink-0" />
              <span>
                FoundIt is a functional frontend prototype. Reports, images and claim requests are
                stored only in this browser&apos;s local storage and can be lost if you clear site
                data. Nothing is synced or verified.
              </span>
            </p>
            <p>
              An independent student-built project for the MAIT campus. Not affiliated with or
              endorsed by Maharaja Agrasen Institute of Technology.
            </p>
          </div>
          <p className="shrink-0">© {YEAR} FoundIt · Built for students, by students</p>
        </div>
      </div>
    </footer>
  )
}
