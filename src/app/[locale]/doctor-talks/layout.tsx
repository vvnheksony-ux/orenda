import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Doctor Talks' }
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</> }
