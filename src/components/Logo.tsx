import { Link } from 'react-router-dom'
import { PackageSearch } from 'lucide-react'

interface LogoProps {
  inverse?: boolean
  withCampusLabel?: boolean
}

export function Logo({ inverse = false, withCampusLabel = true }: LogoProps) {
  return (
    <Link
      to="/"
      aria-label="FoundIt home"
      className="group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-offset-4"
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-[11px] transition-transform duration-200 group-hover:-rotate-3 ${
          inverse ? 'bg-white text-accent' : 'bg-accent text-white'
        }`}
      >
        <PackageSearch aria-hidden="true" size={19} strokeWidth={2.1} />
      </span>
      <span className="flex items-center gap-2">
        <span
          className={`text-[20px] font-semibold tracking-[-0.035em] ${
            inverse ? 'text-white' : 'text-ink'
          }`}
        >
          FoundIt
        </span>
        {withCampusLabel && (
          <span
            className={`hidden rounded-full border px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] sm:inline-flex ${
              inverse
                ? 'border-white/20 text-white/60'
                : 'border-line bg-[#F3EEE5] text-ink-muted'
            }`}
          >
            MAIT
          </span>
        )}
      </span>
    </Link>
  )
}
