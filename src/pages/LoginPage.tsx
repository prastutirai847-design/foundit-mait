import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  Database,
  LogOut,
  PackageSearch,
  ShieldAlert,
  UserRound,
  Users,
} from 'lucide-react'
import { useDemoAuth } from '../auth/DemoAuthProvider'
import { DEMO_ACCOUNTS } from '../auth/demoIdentity'
import { usePageTitle } from '../hooks/usePageTitle'

interface LoginLocationState {
  from?: unknown
}

function safeReturnPath(from: unknown): string {
  return typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') ? from : '/'
}

export function LoginPage() {
  usePageTitle('Demo sign-in')

  const { demoUser, signIn, signOut } = useDemoAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LoginLocationState | null
  const returnTo = safeReturnPath(state?.from)

  const [username, setUsername] = useState(demoUser ?? '')
  const [error, setError] = useState<string | null>(null)

  const completeSignIn = (value: string) => {
    const result = signIn(value)
    if (!result.ok) {
      setError(result.message)
      return
    }
    navigate(returnTo, { replace: true })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    completeSignIn(username)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line/80 bg-canvas/90 backdrop-blur-md">
        <div className="page-shell flex h-[68px] items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-accent text-white">
              <PackageSearch aria-hidden="true" size={19} strokeWidth={2.1} />
            </span>
            <span className="flex items-center gap-2">
              <span className="text-[20px] font-semibold tracking-[-0.035em] text-ink">FoundIt</span>
              <span className="hidden rounded-full border border-line bg-[#F3EEE5] px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-muted sm:inline-flex">
                MAIT
              </span>
            </span>
          </div>
          <span className="badge border-accent-line bg-accent-soft text-accent">Demo sign-in</span>
        </div>
      </header>

      <main className="flex-1">
        <div className="page-shell grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-12 lg:py-14">
          <div>
            <p className="eyebrow">{demoUser ? 'Switch identity' : 'Demo sign-in'}</p>
            <h1 className="display-lg mt-2">
              {demoUser ? 'Use a different demo identity.' : 'Who’s using FoundIt?'}
            </h1>
            <p className="mt-3 max-w-xl text-[14px] leading-7 text-ink-muted">
              Choose the demo identity this browser should act as. Reports, incoming requests and
              handover notes then follow that identity. There is no password and no real account.
            </p>

            {demoUser && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-found-line bg-found-soft px-4 py-3.5">
                <p className="flex items-center gap-2 text-[13px] font-medium text-found">
                  <Check aria-hidden="true" size={15} />
                  Signed in as <span className="font-semibold">{demoUser}</span>
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Link to="/" className="btn-secondary btn-small">
                    Open the board
                  </Link>
                  <button type="button" onClick={signOut} className="btn-ghost btn-small">
                    <LogOut aria-hidden="true" size={14} />
                    Sign out
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="surface-card mt-6 p-6 sm:p-7">
              <label htmlFor="demo-user" className="field-label">
                Demo username
              </label>
              <div className="relative">
                <UserRound
                  aria-hidden="true"
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
                />
                <input
                  id="demo-user"
                  name="demo-user"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  maxLength={40}
                  required
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value)
                    if (error) setError(null)
                  }}
                  className="field-control pl-10"
                  placeholder="demo-me"
                  aria-invalid={error ? 'true' : 'false'}
                  aria-describedby={error ? 'demo-user-hint demo-user-error' : 'demo-user-hint'}
                />
              </div>
              <p id="demo-user-hint" className="field-hint">
                Use 3–40 letters, numbers, underscores or hyphens. It is sent as the{' '}
                <code className="rounded bg-canvas px-1 py-0.5 text-[11.5px]">X-Demo-User</code>{' '}
                header.
              </p>
              {error && (
                <p id="demo-user-error" role="alert" className="field-error">
                  <ShieldAlert aria-hidden="true" size={14} />
                  {error}
                </p>
              )}
              <button type="submit" className="btn-primary mt-5 w-full">
                Continue to the board
                <ArrowRight aria-hidden="true" size={16} />
              </button>
            </form>

            <section className="mt-8" aria-labelledby="seeded-identities">
              <div className="flex items-center gap-2">
                <Users aria-hidden="true" size={16} className="text-ink-muted" />
                <h2 id="seeded-identities" className="text-[15px] font-semibold text-ink">
                  Or continue with a seeded identity
                </h2>
              </div>
              <p className="mt-1.5 text-[12.5px] leading-6 text-ink-muted">
                These demo usernames match the sample reports and requests in the database.
              </p>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => completeSignIn(account.id)}
                    className="group flex h-full flex-col items-start rounded-2xl border border-line bg-surface p-4 text-left shadow-[0_1px_1px_rgba(17,24,39,0.02)] transition hover:border-[#d5ccbd] hover:bg-[#FCFAF5]"
                  >
                    <span className="flex w-full items-center justify-between gap-2">
                      <span className="text-[13.5px] font-semibold text-ink">{account.role}</span>
                      <span className="rounded-full border border-line bg-canvas px-2 py-0.5 font-mono text-[10.5px] text-ink-muted">
                        {account.id}
                      </span>
                    </span>
                    <span className="mt-1.5 text-[12px] leading-5 text-ink-muted">
                      {account.description}
                    </span>
                    <span className="mt-auto flex items-center gap-1.5 pt-3 text-[11.5px] font-semibold text-accent">
                      Continue as {account.id}
                      <ArrowRight
                        aria-hidden="true"
                        size={12}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-4" aria-label="About this sign-in">
            <section className="rounded-3xl border border-line bg-surface p-6 shadow-card">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                <UserRound aria-hidden="true" size={18} />
              </span>
              <h2 className="mt-4 text-[15px] font-semibold text-ink">Identity, not authentication</h2>
              <p className="mt-2 text-[12.5px] leading-6 text-ink-muted">
                This page only chooses which demo username the app sends. It does not verify anyone
                and does not protect data. The backend still checks that username for ownership
                rules.
              </p>
              <ul className="mt-4 space-y-2.5 text-[12.5px] leading-6 text-ink-soft">
                <li className="flex gap-2">
                  <Check aria-hidden="true" size={14} className="mt-1 shrink-0 text-found" />
                  Each identity sees its own reports and requests.
                </li>
                <li className="flex gap-2">
                  <Check aria-hidden="true" size={14} className="mt-1 shrink-0 text-found" />
                  Handover notes stay hidden until a request is approved.
                </li>
                <li className="flex gap-2">
                  <Check aria-hidden="true" size={14} className="mt-1 shrink-0 text-found" />
                  The choice is remembered in this browser so a reload keeps you signed in.
                </li>
              </ul>
            </section>

            <section className="rounded-2xl border border-[#EBD9B6] bg-[#FBF3E2] p-5">
              <p className="flex items-start gap-2 text-[12px] leading-5 text-[#6F4A0C]">
                <ShieldAlert aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
                Never enter a real password or sensitive personal details here. Anyone can send a
                different demo username straight to the API.
              </p>
            </section>

            <section className="rounded-2xl border border-line bg-[#F2EDE3]/70 p-5">
              <p className="flex items-start gap-2 text-[12px] leading-5 text-ink-muted">
                <Database aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
                Reports and requests live in the shared FastAPI + SQLite demo database, not in
                browser storage. Only your demo username is remembered locally.
              </p>
            </section>
          </aside>
        </div>
      </main>

      <footer className="border-t border-line/80">
        <div className="page-shell flex flex-col gap-1.5 py-5 text-[11.5px] text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>An independent student project, not affiliated with or endorsed by MAIT.</p>
          <p>Demo identity only — not authentication.</p>
        </div>
      </footer>
    </div>
  )
}
