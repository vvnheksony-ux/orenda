import Image from 'next/image'
import { notFound } from 'next/navigation'
import SiteLayout from '@/components/layout/SiteLayout'
import { Link } from '@/i18n/routing'
import { payloadFetch } from '@/lib/payload-api'
import { ChevronLeft } from 'lucide-react'

function lexicalToParagraphs(rt: any): string[] {
  if (!rt?.root?.children) return []
  return rt.root.children
    .map((node: any) => node.children?.map((n: any) => n.text ?? '').join('').trim() ?? '')
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

  let career: any = null
  try {
    const data = await payloadFetch(
      `/payload-api/careers?where[slug][equals]=${jobId}&locale=${locale}&depth=1&limit=1`
    )
    career = data.docs?.[0] ?? null
  } catch {}

  if (!career) notFound()

  const title = career.position ?? career.title ?? ''
  const dept = typeof career.careerDepartment === 'object' ? career.careerDepartment?.name : null
  const location = typeof career.careerLocation === 'object' ? career.careerLocation?.name : null
  const responsibilities = lexicalToParagraphs(career.responsibilities)
  const requirements = lexicalToParagraphs(career.careerRequirements)
  const expiry = formatDeadline(career.applicationDeadline ?? null)

  return (
    <SiteLayout>
      <div className="min-h-screen pt-[100px] lg:pt-[212px] pb-[120px]" style={{ background: '#fbf7ee' }}>

        <div className="max-w-[1168px] mx-auto px-5 xl:px-0 mb-6">
          <Link
            href="/career"
            className="inline-flex items-center gap-1 font-dm-sans text-[14px] text-gold-700 hover:text-gold-900 transition-colors"
          >
            <ChevronLeft size={16} />
            Back to Career Opportunities
          </Link>
        </div>

        <div className="max-w-[1168px] mx-auto px-5 xl:px-0 mb-10">
          <div className="relative w-full h-[320px] md:h-[460px] xl:h-[574px] rounded-[10px] overflow-hidden">
            <Image
              src={career.thumbnail?.url || '/images/career-hero-bg.jpg'}
              alt={title}
              fill
              className="object-cover object-top"
              sizes="1168px"
              priority
              unoptimized={!!career.thumbnail?.url}
            />
          </div>
        </div>

        <div className="max-w-[1144px] mx-auto px-5 xl:px-0 flex flex-col gap-5">

          <h1 className="font-dm-sans font-bold text-[28px] xl:text-[36px] leading-normal" style={{ color: '#9a7838' }}>
            {title}
          </h1>

          <div className="font-dm-sans text-[16px] xl:text-[20px] text-black leading-normal flex flex-col gap-4">

            <p className="font-semibold">Job Details</p>
            <ul className="list-disc pl-8 flex flex-col gap-1">
              {dept && <li>Department: {dept}</li>}
              {location && <li>Location: {location}</li>}
              {career.careerEmploymentType && <li>Employment Type: {career.careerEmploymentType.replace('_', '-')}</li>}
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
