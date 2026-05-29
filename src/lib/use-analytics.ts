'use client'

import { useLocale } from 'next-intl'
import { trackEvent, AnalyticsEventParams } from './analytics'
import { AnalyticsEventValue, LocaleCode } from '../payload/constants'

export function useAnalytics() {
  const locale = useLocale() as LocaleCode

  const track = (event: AnalyticsEventValue, extra?: Partial<AnalyticsEventParams>) => {
    void trackEvent({
      event,
      locale,
      ...extra,
    })
  }

  return {
    track,
    trackPageView: (slug?: string) => track('page_view', { slug }),
    trackCallClick: (slug?: string) => track('call_click', { slug }),
    trackInquirySubmit: () => track('inquiry_submit'),
    trackTourView: (scene: number, slug?: string) => track('tour_scene_view', { scene, slug }),
    trackDoctorView: (slug: string) => track('doctor_view', { slug }),
    trackDepartmentView: (slug: string) => track('department_view', { slug }),
    trackLanguageSwitch: (newLocale: LocaleCode) => track('language_switch', { locale: newLocale }),
  }
}
