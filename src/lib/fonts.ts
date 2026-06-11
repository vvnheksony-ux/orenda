import { Cormorant_Garamond, DM_Sans, Inter, Great_Vibes, Suwannaphum, Kantumruy_Pro, Noto_Serif_SC } from 'next/font/google'

export const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--cormorant-font',
  display: 'swap',
})

export const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--dm-sans-font',
  display: 'swap',
})

export const inter = Inter({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--inter-font',
  display: 'swap',
})

export const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--script-font',
  display: 'swap',
})

export const khmerSerif = Suwannaphum({
  subsets: ['khmer'],
  weight: ['400', '700'],
  variable: '--khmer-serif',
  display: 'swap',
})

export const khmerSans = Kantumruy_Pro({
  subsets: ['khmer'],
  weight: ['400', '500', '600', '700'],
  variable: '--khmer-sans',
  display: 'swap',
})

export const chineseSerif = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--chinese-serif',
  display: 'swap',
  preload: false,
})

