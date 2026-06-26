export type Rag2Collection =
  | 'doctors' | 'departments' | 'branches' | 'service_packages'
  | 'news' | 'health_tips' | 'careers' | 'doctor_talks'
  | 'promotions' | 'faqs' | 'price'

export type IntentTarget = { collection: Rag2Collection; topK: number }

const PATTERNS: Array<{ re: RegExp; collection: Rag2Collection; topK: number }> = [
  { re: /doctor|physician|specialist|surgeon|ob\b|gyn|pediatrician|vej|វេជ|医生|医师|专科/i, collection: 'doctors', topK: 6 },
  { re: /department|clinic|centre|center|unit|ward|spine|icu|nicu|division|មន្ទីរ|ផ្នែក|科室|部门/i, collection: 'departments', topK: 5 },
  { re: /branch|location|address|direction|how to get|ORD1|ORD2|orienda hospital|orienda clinic|សាខា|ទីតាំង|分院|地址/i, collection: 'branches', topK: 4 },
  { re: /package|checkup|check.up|antenatal|prenatal|delivery|screening|women health|service package|health package|កញ្ចប់|ការពិនិត្យ|套餐|检查/i, collection: 'service_packages', topK: 6 },
  { re: /news|announcement|update|article|latest|ព័ត៌មាន|ថ្មី|新闻|公告|最新/i, collection: 'news', topK: 4 },
  { re: /health tip|health advice|wellness|lifestyle|diet|nutrition|exercise|healthy|ចំណែក|健康|养生|建议|小贴士/i, collection: 'health_tips', topK: 4 },
  { re: /career|job|vacancy|hiring|position|apply|employment|recruit|ការងារ|ជ្រើស|职位|招聘|工作/i, collection: 'careers', topK: 4 },
  { re: /doctor talk|seminar|talk|webinar|youtube|speaker|ការពិភាក្សា|讲座|研讨/i, collection: 'doctor_talks', topK: 3 },
  { re: /promot|offer|discount|deal|special|sale|ប្រូម៉ូ|优惠|折扣/i, collection: 'promotions', topK: 4 },
  { re: /price|cost|fee|rate|how much|charge|budget|ថ្លៃ|តម្លៃ|价格|费用|多少钱/i, collection: 'price', topK: 6 },
  { re: /faq|question|how|what|why|when|who|answer|explain|tell me|ហ?ើ|什么|怎么|为什么|告诉/i, collection: 'faqs', topK: 5 },
]

const FALLBACK: IntentTarget[] = [
  { collection: 'faqs', topK: 4 },
  { collection: 'departments', topK: 3 },
  { collection: 'branches', topK: 3 },
]

export function detectRag2Intent(message: string): IntentTarget[] {
  const matched: IntentTarget[] = []
  const seen = new Set<Rag2Collection>()
  for (const { re, collection, topK } of PATTERNS) {
    if (re.test(message) && !seen.has(collection)) {
      matched.push({ collection, topK })
      seen.add(collection)
      if (matched.length >= 3) break
    }
  }
  return matched.length > 0 ? matched : FALLBACK
}
