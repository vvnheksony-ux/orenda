export type Language = 'km' | 'zh' | 'en'

const KM = /[ក-៿]/
const ZH = /[一-鿿]/

export function detectLanguage(text: string): Language {
  if (KM.test(text)) return 'km'
  if (ZH.test(text)) return 'zh'
  return 'en'
}
