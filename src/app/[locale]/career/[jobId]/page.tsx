import Image from 'next/image'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import SiteLayout from '@/components/layout/SiteLayout'
import Reveal from '@/components/shared/Reveal'
import ApplyButton from '@/components/career/ApplyButton'

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

type CareerDetail = {
  id: string
  title?: string | null
  thumbnail?: string | null
  department?: string | null
  employmentType?: string | null
  experienceLevel?: string | null
  salaryRange?: string | null
  description?: string | null
  body?: string | null
  responsibilities?: string | null
  requirements?: string | null
  applicationDeadline?: string | null
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

  let career: CareerDetail | null = null
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
  const description = (career.description ?? '').trim()
  const bodyParas = textToParagraphs(career.body ?? null)
  const responsibilities = textToParagraphs(career.responsibilities ?? null)
  const requirements = textToParagraphs(career.requirements ?? null)
  const expiry = formatDeadline(career.applicationDeadline ?? null)

  return (
    <SiteLayout>
      <div className="min-h-screen pb-[120px] pt-[90px] lg:pt-[150px]" style={{ background: 'var(--background)' }}>
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

          {description && (
            <p className="font-dm-sans text-[16px] xl:text-[20px] text-[#3b2d17] leading-relaxed">{description}</p>
          )}

          <Reveal className="font-dm-sans text-[16px] xl:text-[20px] text-[#3b2d17] leading-normal flex flex-col gap-4">

            {bodyParas.length > 0 && (
              <>
                <p className="font-semibold">About This Role</p>
                <div className="flex flex-col gap-3">
                  {bodyParas.map((b, i) => <p key={i}>{b}</p>)}
                </div>
              </>
            )}

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

          </Reveal>

          {expiry && (
            <p className="font-dm-sans font-bold text-[20px] xl:text-[24px] leading-normal mt-2" style={{ color: '#9a7838' }}>
              Application Deadline: {expiry}
            </p>
          )}

          <div className="mt-4">
            <ApplyButton />
          </div>

        </div>
      </div>
    </SiteLayout>
  )
}
