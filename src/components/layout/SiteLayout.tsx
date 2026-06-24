import Navbar from './Navbar'
import Footer from './Footer'
import PageTransition from '@/components/shared/PageTransition'
import MarqueeSpeed from '@/components/shared/MarqueeSpeed'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex flex-col overflow-x-clip">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <MarqueeSpeed />
    </>
  )
}
