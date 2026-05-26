import { Cormorant_Garamond, DM_Sans, Inter, Great_Vibes } from 'next/font/google'

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
