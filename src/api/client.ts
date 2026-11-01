import { getCurrentDemoUser } from '../auth/demoIdentity'

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined

export const API_BASE_URL = (configuredBaseUrl ?? 'http://127.0.0.1:8000/api').replace(
  /\/$/,
  '',
)

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
}

function readDetail(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object' || !('detail' in payload)) return null

  const detail = (payload as { detail: unknown }).detail
  if (typeof detail === 'string') return detail

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (item && typeof item === 'object' && 'msg' in item) {
          return String((item as { msg: unknown }).msg)
        }
        return null
      })
      .filter((message): message is string => Boolean(message))

    if (messages.length > 0) return messages.join(' ')
  }

  return null
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const demoUser = getCurrentDemoUser()
  const headers: Record<string, string> = {}
  if (demoUser) {
    // Demo identity, not authentication. The backend checks ownership against
    // this value, but any client can choose a different one.
    headers['X-Demo-User'] = demoUser
  }

  let body: string | undefined
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(options.body)
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body,
    })
  } catch {
    throw new ApiError(
      `Could not reach the FoundIt API at ${API_BASE_URL}. Start the FastAPI server on port 8000 and try again.`,
      0,
    )
  }

  if (!response.ok) {
    let message = `The API returned HTTP ${response.status}.`
    try {
      const payload: unknown = await response.json()
      message = readDetail(payload) ?? message
    } catch {
      // Keep the HTTP status message when the body is not JSON.
    }
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error && error.message) return error.message
  return 'Something went wrong while talking to the FoundIt API.'
}
