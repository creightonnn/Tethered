import { useEffect, type ReactNode } from 'react'

export default function ThemedRoute({
  theme,
  children,
}: {
  theme: 'marketing' | 'guide' | 'traveler'
  children: ReactNode
}) {
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return children
}
