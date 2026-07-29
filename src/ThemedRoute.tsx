import { useEffect, type ReactNode } from 'react'

export default function ThemedRoute({
  theme,
  children,
}: {
  theme: 'marketing' | 'app'
  children: ReactNode
}) {
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return children
}
