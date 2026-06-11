import Navbar from './Navbar'
import Footer from './Footer'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex flex-col overflow-x-hidden">{children}</main>
      <Footer />
    </>
  )
}
