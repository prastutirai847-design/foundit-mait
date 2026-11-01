export const DEMO_USER_KEY = 'foundit.demo-user.v1'
export const DEMO_USER_PATTERN = /^[A-Za-z0-9_-]{3,40}$/

export interface DemoAccount {
  id: string
  role: string
  description: string
}

/**
 * Seeded demo identities. They are not accounts: each value is simply sent as
 * the X-Demo-User header so the reporter and claimant sides can be tried.
 */
export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'demo-me',
    role: 'Reporter',
    description: 'Owns the seeded headphones and notebook reports, and sees both sample requests.',
  },
  {
    id: 'demo-owner',
    role: 'Second reporter',
    description: 'Owns the other six seeded reports. Their activity starts empty.',
  },
  {
    id: 'demo-ishaan',
    role: 'Claimant',
    description: 'Sent the pending claim on the black over-ear headphones.',
  },
  {
    id: 'demo-sneha',
    role: 'Lead sender',
    description: 'Sent the pending lead on the spiral notebook.',
  },
]

let currentDemoUser: string | null = null

export function isValidDemoUser(value: string): boolean {
  return DEMO_USER_PATTERN.test(value)
}

/** Read the remembered demo identity once, when the auth provider starts. */
export function initializeDemoUser(): string | null {
  let stored: string | null = null
  try {
    stored = window.localStorage.getItem(DEMO_USER_KEY)
  } catch {
    // Storage may be blocked; the demo can still work for this tab.
  }

  currentDemoUser = stored && isValidDemoUser(stored) ? stored : null
  return currentDemoUser
}

/** Store the demo identity and keep it available to the API client. */
export function setCurrentDemoUser(value: string | null): void {
  currentDemoUser = value
  try {
    if (value) window.localStorage.setItem(DEMO_USER_KEY, value)
    else window.localStorage.removeItem(DEMO_USER_KEY)
  } catch {
    // The in-memory identity still works until this tab is closed.
  }
}

export function getCurrentDemoUser(): string | null {
  return currentDemoUser
}
