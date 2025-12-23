import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Spill',
}

export default function JoinLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
