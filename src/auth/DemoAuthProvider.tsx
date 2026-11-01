import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  initializeDemoUser,
  isValidDemoUser,
  setCurrentDemoUser,
} from './demoIdentity'

export type SignInResult = { ok: true } | { ok: false; message: string }

interface DemoAuthContextValue {
  demoUser: string | null
  signIn: (raw: string) => SignInResult
  signOut: () => void
}

const DemoAuthContext = createContext<DemoAuthContextValue | null>(null)

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [demoUser, setDemoUser] = useState<string | null>(() => initializeDemoUser())

  const signIn = useCallback((raw: string): SignInResult => {
    const value = raw.trim()
    if (!value) {
      return { ok: false, message: 'Enter a demo username to continue.' }
    }
    if (!isValidDemoUser(value)) {
      return {
        ok: false,
        message: 'Use 3–40 characters: letters, numbers, underscores or hyphens.',
      }
    }

    setCurrentDemoUser(value)
    setDemoUser(value)
    return { ok: true }
  }, [])

  const signOut = useCallback(() => {
    setCurrentDemoUser(null)
    setDemoUser(null)
  }, [])

  const value = useMemo<DemoAuthContextValue>(
    () => ({ demoUser, signIn, signOut }),
    [demoUser, signIn, signOut],
  )

  return <DemoAuthContext.Provider value={value}>{children}</DemoAuthContext.Provider>
}

export function useDemoAuth(): DemoAuthContextValue {
  const context = useContext(DemoAuthContext)
  if (!context) throw new Error('useDemoAuth must be used inside DemoAuthProvider')
  return context
}
