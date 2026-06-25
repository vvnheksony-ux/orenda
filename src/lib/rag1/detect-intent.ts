export type DocType =
  | 'doctor' | 'price' | 'promotion_package' | 'service'
  | 'department' | 'contact' | 'branch' | 'faq'
  | 'about' | 'policy' | 'brand'

const TOPIC_K: Record<DocType, number> = {
  doctor: 6, price: 8, promotion_package: 8, service: 6,
  department: 5, contact: 4, branch: 4, faq: 6,
  about: 4, policy: 4, brand: 3,
}

const KEYWORD_MAP: Array<{ pattern: RegExp; types: DocType[] }> = [
  { pattern: /doctor|គ្រូពេទ្យ|医生|physician|specialist/i, types: ['doctor'] },
  { pattern: /price|តម្លៃ|价格|cost|fee|ថ្លៃ|charge|rate/i, types: ['price'] },
  { pattern: /package|promotion|ប្រូម៉ូសិន|促销|deal|offer|bundle/i, types: ['promotion_package'] },
  { pattern: /service|សេវា|服务/i, types: ['service'] },
  { pattern: /department|ឯកទេស|科室|unit|ward/i, types: ['department'] },
  { pattern: /contact|phone|លេខ|ទូរស័ព្ទ|电话|call|hotline|number/i, types: ['contact'] },
  { pattern: /branch|location|សាខា|ទីតាំង|地址|address|where|map/i, types: ['branch'] },
  { pattern: /\?|faq|question|help|how|what|why|when|who/i, types: ['faq'] },
  { pattern: /about|orienda|hospital|clinic|មន្ទីរពេទ្យ|history|mission/i, types: ['about'] },
  { pattern: /policy|rule|គោលការណ៍|regulation|guideline/i, types: ['policy'] },
  { pattern: /brand|logo|品牌|identity/i, types: ['brand'] },
]

const FALLBACK: DocType[] = ['faq', 'about', 'service']

export function detectIntent(message: string): Array<{ type: DocType; topK: number }> {
  const matched = new Set<DocType>()
  for (const { pattern, types } of KEYWORD_MAP) {
    if (pattern.test(message)) types.forEach(t => matched.add(t))
  }
  const types = matched.size > 0 ? [...matched] : FALLBACK
  return types.map(type => ({ type, topK: TOPIC_K[type] }))
}
