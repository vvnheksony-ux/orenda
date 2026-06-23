'use client'

import Image from 'next/image'
import { UserRound } from 'lucide-react'
import type { ComponentProps } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

type DoctorProfileCardProps = {
  id: string
  name: string
  specialty: string
  imageUrl?: string | null
}

export function DoctorProfileCard({ id, name, specialty, imageUrl }: DoctorProfileCardProps) {
  const t = useTranslations('Doctors')
  const href = `/doctors/${id}` as ComponentProps<typeof Link>['href']

  return (
    <div
      className="relative flex h-[clamp(300px,28vw,400px)] w-full max-w-[300px] flex-col items-center justify-center gap-[clamp(22px,2vw,32px)] overflow-hidden rounded-[16px] bg-[var(--background)] transition-transform duration-300 hover:-translate-y-1"
      style={{ boxShadow: '0px 4px 30px 12px rgba(220,189,114,0.12)' }}
    >
      <div
        className="pointer-events-none absolute left-0 top-0 h-[52%] w-full opacity-[0.64]"
        style={{
          background:
            'linear-gradient(133deg, rgba(234,214,164,0.6) 0%, rgba(206,175,112,0.827) 25%, rgba(184,145,72,0.8) 49.5%, rgba(210,181,120,0.792) 76%, rgba(234,214,164,0.6) 100%)',
        }}
      />

      <div
        className="relative size-[clamp(104px,9vw,146px)] shrink-0 overflow-hidden rounded-full bg-[var(--background)]"
        style={{ boxShadow: '0px 4px 30px 12px rgba(184,145,72,0.2)' }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover object-top"
            sizes="(max-width: 767px) 104px, (max-width: 1199px) 9vw, 146px"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#ead6a4]">
            <UserRound className="size-[42%]" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="flex h-[clamp(124px,10vw,145px)] shrink-0 flex-col items-center justify-between">
        <div className="flex flex-col items-center gap-[clamp(10px,1vw,16px)] overflow-hidden px-3 text-center text-[#3b2d17] capitalize">
          <p className="max-w-[217px] break-words font-cormorant text-[clamp(19px,1.45vw,24px)] font-medium leading-none">
            {name}
          </p>
          <p className="max-w-[186px] break-words font-dm-sans text-[clamp(13px,1vw,16px)] leading-none text-[#594522]">
            {specialty}
          </p>
        </div>
        <Link
          href={href}
          className="flex h-[32px] w-[145px] items-center justify-center overflow-hidden rounded-[10px] bg-[#b89148] px-[12px] py-[8px] font-dm-sans text-[13px] text-[#fbf7ee] transition-colors hover:bg-[#c8a25a]"
        >
          {t('viewProfile')}
        </Link>
      </div>
    </div>
  )
}
