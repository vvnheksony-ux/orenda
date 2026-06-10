import { getPayload } from 'payload'
import config from '../payload.config'
import { Client } from 'pg'

// Real data from oriendainternationalhospital.com.kh

const NEWS_ARTICLES = [
  {
    slug: 'orienda-spine-neurology-technology',
    title: 'Orienda International Hospital Brings the Latest in Spine and Neurology Treatment Technology to Cambodia',
    excerpt: 'Orienda International Hospital is proud to introduce cutting-edge spine and neurology treatment technology to Cambodia, offering patients world-class surgical options including minimally invasive spine procedures with one-hour surgeries and single overnight hospital stays.',
  },
  {
    slug: 'cooperation-orchid-koh-pich-hospital',
    title: 'Cooperation and Membership Cards Launch Between Orienda International Hospital and Orchid Koh Pich Hospital',
    excerpt: 'Orienda International Hospital and Orchid Koh Pich Hospital have signed a landmark cooperation agreement and launched joint membership cards, expanding access to quality healthcare services across Phnom Penh.',
  },
  {
    slug: 'mou-ministry-water-resources',
    title: 'Ministry of Water Resources and Meteorology Signs MoU with Orienda International Hospital',
    excerpt: 'The Ministry of Water Resources and Meteorology has signed a Memorandum of Understanding with Orienda International Hospital to provide comprehensive healthcare services to all ministry officials and their families.',
  },
  {
    slug: '7-health-tips-women',
    title: '7 Health Tips Every Woman Should Take to Heart',
    excerpt: 'Orienda International Hospital presents seven essential health tips for women: annual wellness checks, smoking cessation, prioritizing sleep, sun protection, regular medical checkups, balanced nutrition, and 20 minutes of daily physical activity. Small consistent habits create lasting health benefits.',
  },
  {
    slug: 'understanding-spinal-anatomy',
    title: 'Understanding Spinal Anatomy: A Beginner\'s Guide',
    excerpt: 'The spine comprises 33 vertebrae across five regions: cervical, thoracic, lumbar, sacral, and coccygeal. Each section plays a critical role in supporting the body. Orienda\'s Spine Center offers advanced diagnosis and minimally invasive treatment for all spinal conditions.',
  },
]

const FAQS = [
  {
    question: 'How do I book an appointment at Orienda International Hospital?',
    answer: 'You can book an appointment online through our website, call our hotline at 016 593 789 / 012 593 789, or walk in directly to our hospital at Steung Mean Chey, Khan Mean Chey, Phnom Penh. We are open 24 hours every day.',
  },
  {
    question: 'What emergency services does Orienda offer?',
    answer: 'Orienda International Hospital provides 24/7 emergency services. You can reach our emergency team at +855 81 811 789 or 023 232 789. Our emergency department is equipped with ICU, NICU, and trauma care capabilities.',
  },
  {
    question: 'Does Orienda International Hospital accept international patients?',
    answer: 'Yes, Orienda International Hospital welcomes patients from over 20 countries. We have multilingual staff and provide internationally accredited medical services that meet ISO-certified standards. We offer telemedicine consultations for international patients.',
  },
  {
    question: 'What specialties does Orienda International Hospital offer?',
    answer: 'Orienda offers comprehensive medical services including Obstetrics & Gynecology, Pediatrics & NICU, Neurosurgery, Spine Center (S-Spine), Orthopedics, Emergency & ICU, General Medicine, Dermatology, Endocrine/Diabetic, Imaging Center, Laboratory, Anti-Aging Center, and Telemedicine.',
  },
  {
    question: 'How can I contact Orienda International Hospital?',
    answer: 'General inquiries: 016 593 789 / 012 593 789 (24 hours). Emergency: 023 232 789 / 078 233 789 / 096 6233 789 (24 hours). Our hospital is located at Steung Mean Chey, Khan Mean Chey, Phnom Penh, Cambodia.',
  },
  {
    question: 'What are the visiting hours at Orienda International Hospital?',
    answer: 'Orienda International Hospital is open 24 hours a day, 7 days a week. Our outpatient clinics operate during standard hours, while emergency and ICU services are available around the clock.',
  },
]

async function main() {
  const payload = await getPayload({ config })
  const db = new Client({ connectionString: process.env.DATABASE_URL! })
  await db.connect()

  // ── UPDATE NEWS ──
  console.log('Updating news articles...')
  for (const article of NEWS_ARTICLES) {
    const existing = await payload.find({
      collection: 'news',
      where: { slug: { equals: article.slug } },
      limit: 1,
    } as any)

    const bioLexical = (text: string) => ({
      root: {
        type: 'root', format: '', indent: 0, version: 1,
        children: text.split('. ').filter(Boolean).map(s => ({
          type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr',
          textFormat: 0, textStyle: '',
          children: [{ type: 'text', format: 0, style: '', mode: 'normal', text: s + '.', version: 1, detail: 0 }],
        })),
      },
    })

    if (existing.docs.length > 0) {
      // Update excerpt in locales
      await db.query(
        'UPDATE payload.news_locales SET excerpt=$1 WHERE _parent_id=$2 AND _locale=$3',
        [article.excerpt, existing.docs[0].id, 'en']
      )
      console.log(`  Updated: ${article.title.slice(0, 50)}`)
    } else {
      console.log(`  Skipped (not found): ${article.slug}`)
    }
  }

  // ── UPDATE FAQS ──
  console.log('\nUpdating FAQs...')
  // Get existing FAQs
  const existingFaqs = await payload.find({ collection: 'faqs', limit: 20 } as any)
  const faqCount = existingFaqs.docs.length

  // Check if answer is JSON or text in faqs_locales
  const { rows: faqCols } = await db.query(
    "SELECT data_type FROM information_schema.columns WHERE table_schema='payload' AND table_name='faqs_locales' AND column_name='answer'"
  )
  const answerIsJson = faqCols[0]?.data_type === 'jsonb' || faqCols[0]?.data_type === 'json'

  const toAnswer = (text: string) => answerIsJson ? JSON.stringify({
    root: { type: 'root', format: '', indent: 0, version: 1,
      children: [{ type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textFormat: 0, textStyle: '',
        children: [{ type: 'text', format: 0, style: '', mode: 'normal', text, version: 1, detail: 0 }] }] }
  }) : text

  for (let i = 0; i < FAQS.length; i++) {
    const faq = FAQS[i]
    if (i < faqCount) {
      const faqId = existingFaqs.docs[i].id
      await db.query(
        'UPDATE payload.faqs_locales SET question=$1, answer=$2 WHERE _parent_id=$3 AND _locale=$4',
        [faq.question, toAnswer(faq.answer), faqId, 'en']
      )
      console.log(`  Updated FAQ ${i + 1}: ${faq.question.slice(0, 50)}`)
    } else {
      const res = await db.query(
        `INSERT INTO payload.faqs (status, _status, published_at, updated_at, created_at)
         VALUES ('published','published',NOW(),NOW(),NOW()) RETURNING id`
      )
      const newId = res.rows[0].id
      await db.query(
        'INSERT INTO payload.faqs_locales (question, answer, _locale, _parent_id) VALUES ($1,$2,$3,$4)',
        [faq.question, toAnswer(faq.answer), 'en', newId]
      )
      console.log(`  Created FAQ ${i + 1}: ${faq.question.slice(0, 50)}`)
    }
  }

  await db.end()
  console.log('\nAll done!')
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
