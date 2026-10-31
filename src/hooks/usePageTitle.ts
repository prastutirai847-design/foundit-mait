import { useEffect } from 'react'

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · FoundIt` : 'FoundIt — MAIT campus lost & found'
  }, [title])
}
