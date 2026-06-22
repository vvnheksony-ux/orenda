import Navbar from './Navbar'
import Footer from './Footer'
import PageTransition from '@/components/shared/PageTransition'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex flex-col overflow-x-clip">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  )
}
