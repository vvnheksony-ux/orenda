import type { Metadata } from 'next'
export const metadata: Metadata = { title: '360° Virtual Tour' }
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</> }
