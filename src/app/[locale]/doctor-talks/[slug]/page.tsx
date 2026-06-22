'use client'

import Image from 'next/image'
import { useState, useEffect, use } from 'react'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'
import { ArrowRight, Clock, Play } from 'lucide-react'
import SiteLayout from '@/components/layout/SiteLayout'

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

  useEffect(() => {
    Promise.all([
      fetch(`/api/doctor-talks?locale=${locale}&slug=${encodeURIComponent(slug)}`).then((r) => r.json()),
      fetch(`/api/doctor-talks?locale=${locale}&limit=8`).then((r) => r.json()).catch(() => ({ docs: [] })),
    ])
      .then(([detail, all]) => {
        if (detail) setTalk(detail)
        setRelated(((all?.docs || []) as RelatedTalk[]).filter((item) => item.slug !== slug).slice(0, 4))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [locale, slug])

  const paragraphs = (talk?.body || talk?.excerpt || '').split('\n').filter((paragraph) => paragraph.trim().length > 0)

  return (
    <SiteLayout>
      <div className="bg-[var(--background)] w-full pb-[120px] pt-[100px] lg:pt-[212px]">
        <div className="page-shell flex flex-col gap-[80px]">
          {loading && <div className="h-[600px] rounded-[16px] bg-[#f0ebe0] animate-pulse" />}

          {!loading && !talk && (
            <div className="text-center py-[80px]">
              <p className="font-cormorant text-[32px] text-[#3b2d17]">Doctor talk not found</p>
              <Link href="/doctor-talks" className="font-dm-sans text-[#b89148] underline mt-4 block">← Back to Doctor Talks</Link>
            </div>
          )}

          {!loading && talk && (
            <>
              <div className="flex flex-col gap-[40px] w-full">
                <div className="flex flex-wrap items-center gap-[12px]">
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
                </div>

                <h1 className="font-cormorant font-semibold text-[32px] sm:text-[36px] lg:text-[40px] text-[#3b2d17] leading-tight w-full">
                  {talk.title}
                </h1>

                <div className="w-full h-[1px] bg-[#d4b97a]" />

                {talk.thumbnail && (
                  <a
                    href={talk.meetingLink || '#'}
                    target={talk.meetingLink ? '_blank' : undefined}
                    rel={talk.meetingLink ? 'noopener noreferrer' : undefined}
                    className="relative block w-full h-[260px] sm:h-[360px] lg:h-[500px] rounded-[16px] overflow-hidden bg-white/80 shadow-[0px_4px_16px_4px_rgba(122,95,44,0.12)] group"
                  >
                    <Image src={talk.thumbnail} alt={talk.title} fill className="object-cover" sizes="100vw" unoptimized />
                    <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="size-[64px] rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <Play size={28} className="text-[#b89148] ml-1" fill="#b89148" />
                      </div>
                    </div>
                  </a>
                )}

                <div className="flex flex-col lg:flex-row gap-[40px] items-start w-full">
                  <div className="flex-1 min-w-0 font-dm-sans text-[18px] text-[#2a2620] leading-[1.8]">
                    {paragraphs.map((paragraph, index) => (
                      <p key={index} className="mb-[32px] last:mb-0">{paragraph}</p>
                    ))}
                  </div>

                  <div className="flex flex-col gap-[24px] shrink-0 w-full lg:w-[332px]">
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

              <div className="flex flex-col gap-[40px] items-center">
                <div className="flex flex-col gap-[12px] text-center w-full leading-none">
                   <h2 className="font-cormorant font-bold text-[36px] sm:text-[42px] lg:text-[48px] text-[#3b2d17]">More Doctor Talks</h2>
                   <p className="font-dm-sans text-[16px] sm:text-[18px] lg:text-[20px] text-[#594522]">Explore more sessions and healthcare topics</p>
                 </div>

                {related.length > 0 && (
                  <div className="flex gap-[40px] items-center justify-center flex-wrap">
                    {related.map((item) => (
                      <Link
                        key={item.id}
                        href={`/doctor-talks/${item.slug}` as any}
                        className="bg-white flex flex-col items-center overflow-hidden rounded-[16px] shrink-0 w-[300px] hover:shadow-lg transition-shadow"
                        style={{ boxShadow: '0px 4px 30px 12px rgba(220,189,114,0.12)' }}
                      >
                        <div className="relative h-[170px] w-full bg-[#f9f9f9] overflow-hidden">
                          {item.thumbnail ? <Image src={item.thumbnail} alt={item.title} fill className="object-cover" sizes="300px" unoptimized /> : <div className="w-full h-full bg-[#f0ebe0]" />}
                        </div>
                        <div className="flex flex-col h-[200px] items-end justify-between pb-[24px] pt-[32px] px-[24px] w-full">
                          <div className="w-full flex flex-col gap-[8px]">
                            <p className="font-dm-sans text-[12px] text-[#7a5f2c]/70">{formatDate(item.eventDate)}</p>
                            <p className="font-dm-sans font-medium text-[16px] text-[#3b2d17] leading-[1.5] w-full line-clamp-3">{item.title}</p>
                          </div>
                          <div className="flex items-center h-[32px] px-[12px] py-[8px] border border-[#b89148] rounded-[12px] gap-[4px] shrink-0">
                            <span className="font-dm-sans text-[12px] text-[#594522] px-[8px]">Read More</span>
                            <ArrowRight size={16} className="text-[#594522]" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </SiteLayout>
  )
}
