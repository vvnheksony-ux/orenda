import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Insurance' }

import Image from 'next/image'
import { headers } from 'next/headers'
import SiteLayout from '@/components/layout/SiteLayout'
import Reveal from '@/components/shared/Reveal'
import PromotionStyleHero from '@/components/shared/PromotionStyleHero'
import PageState from '@/components/shared/PageState'

type InsuranceDoc = {
  id: string | number
  insuranceProvider?: string | null
  title?: string | null
  thumbnail?: string | null
}

async function getInsuranceUpdates(locale: string): Promise<{
  insurers: { id: string; name: string; logo: string | null }[]
  error: string | null
}> {
  // Fetch via the raw-pool API route (the working DB path) instead of Payload's
  // direct connection, which times out on serverless.
  try {
    const headerStore = await headers()
    const forwardedProto = headerStore.get('x-forwarded-proto')
    const forwardedHost = headerStore.get('x-forwarded-host')
    const host = forwardedHost ?? headerStore.get('host')
    const base = host
      ? `${forwardedProto ?? 'https'}://${host}`
      : process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

    const res = await fetch(`${base}/api/insurance-updates?locale=${locale}`, { cache: 'no-store' })
    if (!res.ok) {
      return { insurers: [], error: 'We could not load insurance providers right now.' }
    }
    const data = await res.json()
    const docs = (data.docs ?? []) as InsuranceDoc[]
    return {
      insurers: docs.map((doc) => ({
        id: String(doc.id),
        name: doc.insuranceProvider || doc.title || '',
        logo: doc.thumbnail ?? null,
      })),
      error: null,
    }
  } catch {
    return { insurers: [], error: 'We could not load insurance providers right now.' }
  }
}

export default async function InsurancePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const { insurers, error } = await getInsuranceUpdates(locale)

  return (
    <SiteLayout>
      <div className="bg-[var(--background)] w-full">
        <div className="page-shell flex flex-col gap-[56px] lg:gap-[80px] items-center pb-[120px] pt-[90px] lg:pt-[150px]">

          {/* Hero slider card */}
          <PromotionStyleHero
            imageSrc="/images/insurance/hero-3.jpg"
            imageAlt="Orienda International Hospital"
            title="Orienda International Hospital"
            lines={[
              'We dedicated to providing safe and reliable medical services.',
              'Schedule and appointment to experience world-class healthcare.',
            ]}
          />

          {/* Insurance section */}
          <div className="flex flex-col gap-[40px] items-center w-full">
            <Reveal className="flex flex-col gap-[12px] text-center w-full">
              <h2 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none w-full">
                Insurance
              </h2>
              <p className="font-dm-sans text-[20px] text-[#594522] capitalize w-full">
                What do we accept?
              </p>
            </Reveal>

            {error ? (
              <PageState
                title="Insurance unavailable"
                message={error}
              />
            ) : insurers.length > 0 ? (
              <div className="flex flex-wrap gap-5 lg:gap-[40px] items-stretch justify-center w-full">
                {insurers.map((ins) => (
                  <div
                    key={ins.id}
                    className="bg-white flex w-full sm:flex-1 flex-col sm:flex-row gap-5 lg:gap-[40px] items-center min-w-0 sm:min-w-[320px] overflow-hidden px-5 sm:px-6 lg:px-[40px] py-5 lg:py-[24px] rounded-[16px]"
                    style={{ boxShadow: '0px 4px 30px 12px rgba(220,189,114,0.12)' }}
                  >
                    <div className="relative shrink-0 size-[120px]">
                      {ins.logo ? (
                        <Image
                          src={ins.logo}
                          alt={ins.name}
                          fill
                          className="object-contain"
                          sizes="120px"
                          unoptimized
                        />
                      ) : (
                        <div className="size-[120px] bg-[#f5ede0] rounded-[8px] flex items-center justify-center">
                          <span className="text-[#b89148] text-[32px] font-cormorant font-bold">
                            {ins.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="font-dm-sans font-normal text-[18px] lg:text-[24px] text-[#3b2d17] text-center break-words">
                      {ins.name}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <PageState
                title="No insurance providers listed yet"
                message="We do not have any insurance partners published right now."
              />
            )}
          </div>

        </div>
      </div>
    </SiteLayout>
  )
}
