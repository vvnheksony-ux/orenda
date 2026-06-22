import Image from 'next/image'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import SiteLayout from '@/components/layout/SiteLayout'
import { Link } from '@/i18n/routing'
import { ChevronLeft } from 'lucide-react'

function textToParagraphs(text: string | null): string[] {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function formatDeadline(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default async function CareerDetailPage({
  params,
}: {
  params: Promise<{ jobId: string; locale: string }>
}) {
  const { jobId, locale } = await params
  const headerStore = await headers()

  // Fetch via the raw-pool API route (the working DB path) instead of Payload's
  // direct connection, which times out on serverless. Mirrors the promotions page.
  const forwardedProto = headerStore.get('x-forwarded-proto')
  const forwardedHost = headerStore.get('x-forwarded-host')
  const host = forwardedHost ?? headerStore.get('host')
  const base = host
    ? `${forwardedProto ?? 'https'}://${host}`
    : process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  let career: any = null
  try {
    const res = await fetch(
      `${base}/api/careers?slug=${encodeURIComponent(jobId)}&locale=${locale}`,
      { cache: 'no-store' }
    )
    if (res.ok) {
      const data = await res.json()
      career = data?.id ? data : null
    }
  } catch {}

  if (!career) notFound()

  const title = career.title ?? ''
  const dept = career.department || null
  const location: string | null = null
  const responsibilities = textToParagraphs(career.responsibilities)
  const requirements = textToParagraphs(career.requirements)
  const expiry = formatDeadline(career.applicationDeadline ?? null)

  return (
    <SiteLayout>
      <div className="min-h-screen pt-[100px] lg:pt-[212px] pb-[120px]" style={{ background: 'var(--background)' }}>

        <div className="narrow-shell mb-6">
          <Link
            href="/career"
            className="inline-flex items-center gap-1 font-dm-sans text-[14px] text-gold-700 hover:text-gold-900 transition-colors"
          >
            <ChevronLeft size={16} />
            Back to Career Opportunities
          </Link>
        </div>

        <div className="narrow-shell mb-10">
          <div className="relative w-full h-[320px] md:h-[460px] xl:h-[574px] rounded-[10px] overflow-hidden">
            <Image
              src={career.thumbnail || '/images/career-hero-bg.jpg'}
              alt={title}
              fill
              className="object-cover object-top"
              sizes="1168px"
              priority
              unoptimized={!!career.thumbnail}
            />
          </div>
        </div>

        <div className="narrow-shell flex flex-col gap-5">

          <h1 className="font-dm-sans font-bold text-[28px] xl:text-[36px] leading-normal" style={{ color: '#9a7838' }}>
            {title}
          </h1>

          <div className="font-dm-sans text-[16px] xl:text-[20px] text-[#3b2d17] leading-normal flex flex-col gap-4">

            <p className="font-semibold">Job Details</p>
            <ul className="list-disc pl-8 flex flex-col gap-1">
              {dept && <li>Department: {dept}</li>}
              {location && <li>Location: {location}</li>}
              {career.employmentType && <li>Employment Type: {career.employmentType.replace('_', '-')}</li>}
              {career.experienceLevel && <li>Experience Level: {career.experienceLevel}</li>}
              {career.salaryRange && <li>Salary Range: {career.salaryRange}</li>}
            </ul>

            {responsibilities.length > 0 && (
              <>
                <p className="font-semibold">Core Responsibilities</p>
                <ul className="list-disc pl-8 flex flex-col gap-1">
                  {responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </>
            )}

            {requirements.length > 0 && (
              <>
                <p className="font-semibold">Requirements &amp; Qualifications</p>
                <ul className="list-disc pl-8 flex flex-col gap-1">
                  {requirements.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </>
            )}

          </div>

          {expiry && (
            <p className="font-dm-sans font-bold text-[20px] xl:text-[24px] leading-normal mt-2" style={{ color: '#9a7838' }}>
              Application Deadline: {expiry}
            </p>
          )}

          <div className="mt-4">
            <a
              href="mailto:hr@orienda.com"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-[12px] font-dm-sans font-medium text-[16px] text-white transition-opacity hover:opacity-90"
              style={{ background: '#b89148' }}
            >
              Apply for this Position
            </a>
          </div>

        </div>
      </div>
    </SiteLayout>
  )
}
