'use client'

import Image from 'next/image'
import type { ComponentProps } from 'react'
import { useState, useEffect, use } from 'react'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Clock, Play } from 'lucide-react'
import SiteLayout from '@/components/layout/SiteLayout'
import PageState from '@/components/shared/PageState'
import ExploreMoreCarousel from '@/components/shared/ExploreMoreCarousel'
import Reveal from '@/components/shared/Reveal'

interface DoctorTalkDetail {
  id: string
  title: string
  slug: string
  body: string
  excerpt: string
  thumbnail: string | null
  eventDate: string
  eventTime: string
  duration: number | null
  isVirtual: boolean
  meetingLink: string
  talkTopic: string
  featuredDoctor: { name: string; specialty: string } | null
}

interface RelatedTalk {
  id: string
  title: string
  slug: string
  thumbnail: string | null
  eventDate: string
}

type LocalizedHref = ComponentProps<typeof Link>['href']
const talkHref = (slug: string): LocalizedHref => `/doctor-talks/${slug}` as LocalizedHref

function formatDate(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function DoctorTalkDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const locale = useLocale()
  const [talk, setTalk] = useState<DoctorTalkDetail | null>(null)
  const [related, setRelated] = useState<RelatedTalk[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    // Reset the detail view immediately when the route changes to avoid stale content flashes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setLoadError('')

    Promise.all([
      fetch(`/api/doctor-talks?locale=${locale}&slug=${encodeURIComponent(slug)}`, { cache: 'no-store', signal: controller.signal }).then(async (r) => {
        if (!r.ok) throw new Error('We could not load this doctor talk right now.')
        return r.json()
      }),
      fetch(`/api/doctor-talks?locale=${locale}&limit=8`, { cache: 'no-store', signal: controller.signal }).then((r) => r.json()).catch(() => ({ docs: [] })),
    ])
      .then(([detail, all]) => {
        if (controller.signal.aborted) return
        if (detail) setTalk(detail)
        setLoadError('')
        setRelated(((all?.docs || []) as RelatedTalk[]).filter((item) => item.slug !== slug).slice(0, 4))
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        setTalk(null)
        setRelated([])
        setLoadError(err instanceof Error ? err.message : 'We could not load this doctor talk right now.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [locale, slug])

  const paragraphs = (talk?.body || talk?.excerpt || '').split('\n').filter((paragraph) => paragraph.trim().length > 0)

  return (
    <SiteLayout>
      <div className="bg-[var(--background)] w-full pb-[120px] pt-[90px] lg:pt-[150px]">
        <div className="page-shell flex flex-col gap-[80px]">
          {loading && <div className="h-[600px] rounded-[16px] bg-[#f0ebe0] animate-pulse" />}

          {!loading && !talk && (
            loadError ? (
              <PageState
                title="Doctor talk unavailable"
                message={loadError}
              >
                <Link href="/doctor-talks" className="font-dm-sans text-[#b89148] underline">
                  Back to Doctor Talks
                </Link>
              </PageState>
            ) : (
              <div className="text-center py-[80px]">
                <p className="font-cormorant text-[32px] text-[#3b2d17]">Doctor talk not found</p>
                <Link href="/doctor-talks" className="font-dm-sans text-[#b89148] underline mt-4 block">← Back to Doctor Talks</Link>
              </div>
            )
          )}

          {!loading && talk && (
            <>
              <div className="flex flex-col gap-[40px] w-full">
                <Reveal className="flex flex-wrap items-center gap-[12px]">
                  {talk.talkTopic && (
                    <span className="px-[12px] py-[6px] rounded-full bg-[#b89148]/15 font-dm-sans text-[14px] text-[#7a5f2c] font-medium">
                      {talk.talkTopic}
                    </span>
                  )}
                  {talk.duration && (
                    <span className="flex items-center gap-[6px] font-dm-sans text-[14px] text-[#594522]">
                      <Clock size={14} />
                      {talk.duration} min
                    </span>
                  )}
                  {talk.isVirtual && (
                    <span className="px-[12px] py-[6px] rounded-full bg-[#7a5f2c]/10 font-dm-sans text-[14px] text-[#7a5f2c]">
                      Virtual event
                    </span>
                  )}
                </Reveal>

                <h1 className="font-cormorant font-semibold text-[32px] sm:text-[36px] lg:text-[40px] text-[#3b2d17] leading-tight w-full">
                  {talk.title}
                </h1>

                <div className="w-full h-[1px] bg-[#d4b97a]" />

                {talk.thumbnail && (
                  <div className="relative block w-full h-[260px] sm:h-[360px] lg:h-[500px] rounded-[16px] overflow-hidden bg-white/80 shadow-[0px_4px_16px_4px_rgba(122,95,44,0.12)] group">
                    <Image src={talk.thumbnail} alt={talk.title} fill className="object-cover" sizes="100vw" unoptimized />
                    <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors" />
                    {talk.meetingLink && (
                      <a
                        href={talk.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="size-[64px] rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                          <Play size={28} className="text-[#b89148] ml-1" fill="#b89148" />
                        </div>
                      </a>
                    )}
                    {!talk.meetingLink && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded-full bg-white/90 px-5 py-3 font-dm-sans text-[14px] font-medium text-[#7a5f2c] shadow-lg">
                          Event details
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-[40px] items-start w-full">
                  <div className="flex-1 min-w-0 font-dm-sans text-[18px] text-[#2a2620] leading-[1.8]">
                    {paragraphs.map((paragraph, index) => (
                      <p key={index} className="mb-[32px] last:mb-0">{paragraph}</p>
                    ))}
                  </div>

                  <div className="flex flex-col gap-[24px] shrink-0 w-full md:w-[332px]">
                    <div className="bg-white rounded-[12px] p-[24px] flex flex-col gap-[16px]" style={{ boxShadow: '0px 4px 8px rgba(122,95,44,0.12)' }}>
                      <p className="font-cormorant font-medium text-[24px] text-[#3b2d17] leading-none">Featured Doctor</p>
                      <p className="font-dm-sans text-[16px] text-[#2a2620] leading-[1.8]">
                        {talk.featuredDoctor?.name || 'Orienda specialist'}
                      </p>
                      {talk.featuredDoctor?.specialty && (
                        <p className="font-dm-sans text-[14px] text-[#594522]">{talk.featuredDoctor.specialty}</p>
                      )}
                    </div>

                    <div className="bg-white rounded-[12px] p-[24px] flex flex-col gap-[16px]" style={{ boxShadow: '0px 4px 8px rgba(122,95,44,0.12)' }}>
                      <p className="font-cormorant font-medium text-[24px] text-[#3b2d17] leading-none">Event Details</p>
                      <p className="font-dm-sans text-[16px] text-[#2a2620] leading-[1.8]">
                        {formatDate(talk.eventDate)}
                        {talk.eventTime ? ` at ${talk.eventTime}` : ''}
                      </p>
                      {talk.meetingLink && (
                        <a
                          href={talk.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-[8px] w-full h-[48px] bg-[#b89148] rounded-[12px] font-dm-sans text-[18px] text-white hover:bg-[#c8a25a] transition-colors"
                        >
                          Watch Talk
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <ExploreMoreCarousel
                title="More Doctor Talks"
                subtitle="Explore more sessions and healthcare topics"
                ctaLabel="Watch"
                items={related.map((item) => ({
                  title: item.title,
                  image: item.thumbnail,
                  href: talkHref(item.slug),
                  meta: formatDate(item.eventDate),
                }))}
              />
            </>
          )}
        </div>
      </div>
    </SiteLayout>
  )
}
