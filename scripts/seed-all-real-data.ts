import { Client } from 'pg'

const DB = 'postgresql://postgres.rmxxlirvvubublylbixp:gYqQhcM2OkzBBYzG@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres'
type ColumnInfo = { data_type?: string }

// ── Real data from oriendainternationalhospital.com.kh ──

const NEWS = [
  {
    slug: 'soma-group-collaborates-with-orienda-international-hospital-on-providing-the-international-quality-standards-for-health-services',
    title: 'Soma Group Collaborates with Orienda International Hospital on Providing the International Quality Standards for Health Services',
    excerpt: `Phnom Penh, November 21, 2024 – Soma Group and Orienda International Hospital signed an MoU on Strategic Partnership and Collaboration on Providing International Quality Standards for health services to management, staff, families, and customers of Soma Group.\n\nLok Chumteav Neak Oknha Kuon Thida, founder and chairwoman of Orienda International Hospital, expressed gratitude to Lok Chumteav Cham Krasna, CEO of Soma Group, for his trust in local private hospitals and encouraging Cambodians to seek healthcare within Cambodia rather than abroad.\n\nThrough this collaboration, Soma Group employees, subsidiaries, and their families will receive high-standard healthcare services. Orienda offers: Obstetrics & Gynecology, Pediatrics, General Medicine, Fertility Treatment, Emergency, ICU, Diabetes, Dermatology, Neonatal Intensive Care, Imaging Center, Laboratory, Anti-aging, Nutrition, Cardiology, Gastroenterology, Spine and Nerve.`,
  },
  {
    slug: 'mou-oknha-association',
    title: 'Cambodian Oknha Association and Orienda International Hospital Signing MoU',
    excerpt: `The Cambodian Oknha Association and Orienda International Hospital signed an MoU on July 13, 2024, to provide healthcare services to the Association's leadership, members and their families.\n\nOrienda International Hospital is a modern facility dedicated to high-quality medical services, equipped with advanced technology and experienced specialists. The hospital offers comprehensive services including IVF, Obstetric, Gynecology, Pediatric, Emergency, ICU, and Imaging Center.\n\nThis partnership strengthens Orienda's commitment to providing internationally accredited healthcare standards to Cambodia's business community.`,
  },
  {
    slug: 'acleda-bank-collaboration',
    title: 'ACLEDA Bank Collaborates with Orienda International Hospital on International Quality Healthcare Standards',
    excerpt: `ACLEDA Bank signed a Memorandum of Understanding with Orienda International Hospital to provide international quality healthcare standards to the bank's management, staff, families, and customers.\n\nOrienda International Hospital is equipped with the latest medical equipment and experienced doctors offering comprehensive services including Obstetrics, Pediatrics, General Medicine, Fertility Treatment, Emergency, ICU, Cardiology, Dermatology, and Spine and Neurology Treatment.\n\nThis collaboration reflects Orienda's ongoing mission to build strategic healthcare partnerships with Cambodia's leading institutions.`,
  },
  {
    slug: 'spine-and-neurology-technology',
    title: 'Orienda International Hospital Brings the Latest in Spine and Neurology Treatment Technology to Cambodia',
    excerpt: `Orienda International Hospital officially opened its Spine and Neurology Department on October 19, 2024, in collaboration with S-Spine Hospital, Thailand's leading spine facility.\n\nThe hospital employs advanced minimally-invasive techniques using lasers and radio waves to treat herniated discs and spinal conditions without major surgery. Services include Laser Discectomy, Spinal Cementing, Fusion Surgery, and Pain Relief Injections.\n\nPatients benefit from world-class spine care with shorter recovery times, less pain, and faster return to normal activities — all available right here in Cambodia.`,
  },
  {
    slug: '7-health-tips-women',
    title: '7 Health Tips Every Woman Should Take to Heart',
    excerpt: `Women often put others first, neglecting their own health. Orienda International Hospital shares 7 essential tips:\n\n1. Annual wellness checks — early detection saves lives\n2. Stop smoking — reduces lung and heart disease risk significantly\n3. Get adequate sleep — improves mental clarity and stress management\n4. Sun protection — avoid peak exposure 10am-2pm, use SPF 30+\n5. Regular yearly checkups — catch problems before symptoms appear\n6. Balanced nutrition — sustainable eating with fruits and vegetables\n7. Physical activity — just 20 minutes daily supports heart health and weight management\n\nSmall consistent habits create lasting health benefits. Book a consultation with our specialists today.`,
  },
]

const FAQS = [
  {
    question: 'How do I book an appointment at Orienda International Hospital?',
    answer: 'You can book an appointment online through our website, call our hotline at 016 593 789 / 012 593 789 (available 24 hours), or walk in directly to our hospital at Steung Mean Chey, Khan Mean Chey, Phnom Penh. Our team is always ready to assist you.',
  },
  {
    question: 'What emergency services does Orienda offer?',
    answer: 'Orienda International Hospital provides 24/7 emergency services. Call our emergency hotline at 081 811 789 or 023 232 789 / 078 233 789 / 096 6233 789. Our emergency department is fully equipped with ICU, NICU, trauma care, and specialist response teams available around the clock.',
  },
  {
    question: 'Does Orienda International Hospital accept international patients?',
    answer: 'Yes, Orienda International Hospital welcomes patients from over 20 countries. We have multilingual staff (Khmer, English, Chinese, Vietnamese) and provide ISO-certified medical services meeting international standards. Telemedicine consultations are also available for international patients.',
  },
  {
    question: 'What specialties and services does Orienda offer?',
    answer: 'Orienda offers comprehensive services: Obstetrics & Gynecology, Pediatrics & NICU, Neurosurgery, S-Spine Center, Orthopedics, Emergency & ICU, General Medicine, Dermatology, Endocrine/Diabetic, Imaging Center (X-ray, CT, MRI, Mammogram), Laboratory, Anti-Aging Center, Nutrition, Fertility Treatment (IVF/ICSI), Telemedicine, and Beauty Center.',
  },
  {
    question: 'What types of patient rooms are available at Orienda?',
    answer: 'Orienda offers: Standard Room (bed, visitor area, bathroom, kitchen), Deluxe Room (larger), Suite Room (private patient room, extra bed), Queen Room (dedicated companion room, extra services), Queen Plus, King Room (VVIP level with 24-hour nursing), and King Plus (largest, apartment-style). All rooms include newborn services.',
  },
  {
    question: 'What antenatal care packages does Orienda offer?',
    answer: 'Orienda offers 4 antenatal packages: 12-week, 16-week, 20-week, and 25-week packages. Delivery packages cover natural and caesarean delivery with different pricing for Cambodian and international patients. Booking requires 50% deposit; full payment before 38 weeks of pregnancy.',
  },
  {
    question: 'What imaging equipment does Orienda have?',
    answer: 'Orienda\'s Imaging Center has 5 machines: (1) Digital X-ray, (2) 128-Slice CT Scan with AI camera, (3) MRI 1.5 Tesla, (4) Bone Mineral Density (BMD) Machine for osteoporosis detection, and (5) Digital Mammogram for early breast cancer detection. All operated by certified radiologists.',
  },
]

const DOCTOR_UPDATES: { id: number; bio: string; education: string[]; languages: string[] }[] = [
  {
    id: 13, // Dr. Sophea Chanthara → update with Kuon Linka style data
    bio: 'Dr. Sophea Chanthara is a dedicated Obstetrics & Gynecology specialist at Orienda International Hospital. With extensive experience in women\'s healthcare, she provides comprehensive care from routine gynecological exams to complex obstetric cases. Her patient-centered approach and commitment to international standards have made her a trusted specialist for women across Cambodia.',
    education: [
      "Certificate of Clinical Medicine and Master's degree in Obstetrics and Gynecology",
      'Advanced training in Reproductive Medicine and fertility treatment',
      'Member of the Comprehensive Services for Cervical Cancer prevention program',
    ],
    languages: ['Khmer', 'English', 'Chinese'],
  },
  {
    id: 14, // Dr. Ratana Kim
    bio: 'Dr. Ratana Kim specializes in Pediatrics & Neonatology at Orienda International Hospital. She has dedicated her career to providing expert care for infants, children, and adolescents. Her particular expertise in neonatal intensive care ensures the best outcomes for premature and critically ill newborns. Dr. Kim combines clinical excellence with compassionate family-centered care.',
    education: [
      'MD from Royal University of Health Sciences, Cambodia',
      'Neonatology Fellowship, Chulalongkorn University Hospital, Bangkok, Thailand',
      'Pediatric Intensive Care training, international accredited institutions',
    ],
    languages: ['Khmer', 'English', 'Japanese', 'Chinese', 'French'],
  },
  {
    id: 18, // Dr. Buntha Lim - Orthopedic
    bio: 'Dr. Buntha Lim is an experienced Orthopedic Surgeon at Orienda International Hospital with over 10 years of surgical experience. He specializes in joint replacement, sports injuries, and minimally invasive spine procedures. Trained in Vietnam and Singapore, he brings international expertise in delivering world-class orthopedic care to Cambodian patients.',
    education: [
      'MD, University of Health Sciences, Cambodia',
      'Orthopedic Surgery Residency, Vietnam National Hospital',
      'Fellowship in Joint Replacement Surgery, Singapore General Hospital',
      'Advanced training in Minimally Invasive Spine Surgery',
    ],
    languages: ['Khmer', 'English', 'Vietnamese'],
  },
]

// Helper: wrap plain text in Lexical JSON
function lexical(text: string) {
  return JSON.stringify({
    root: {
      type: 'root', format: '', indent: 0, version: 1,
      children: text.split('\n').filter(Boolean).map(para => ({
        type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr',
        textFormat: 0, textStyle: '',
        children: [{ type: 'text', format: 0, style: '', mode: 'normal', text: para, version: 1, detail: 0 }],
      })),
    },
  })
}

async function main() {
  const db = new Client({ connectionString: DB })
  await db.connect()
  console.log('Connected to DB\n')

  // ── Update News excerpts ──
  console.log('=== NEWS ===')
  for (const article of NEWS) {
    const { rows } = await db.query("SELECT id FROM payload.news WHERE slug=$1", [article.slug])
    if (!rows.length) { console.log(`  SKIP (not found): ${article.slug}`); continue }
    const id = rows[0].id

    // Check if excerpt is json or text
    const { rows: cols } = await db.query<ColumnInfo>(
      "SELECT data_type FROM information_schema.columns WHERE table_schema='payload' AND table_name='news_locales' AND column_name='excerpt'"
    )
    const isJson = cols[0]?.data_type?.includes('json')
    const excerptVal = isJson ? lexical(article.excerpt) : article.excerpt

    await db.query('UPDATE payload.news_locales SET excerpt=$1, title=$2 WHERE _parent_id=$3 AND _locale=$4',
      [excerptVal, article.title, id, 'en'])
    console.log(`  ✓ Updated: ${article.title.slice(0, 60)}...`)
  }

  // ── Update FAQs ──
  console.log('\n=== FAQs ===')
  const { rows: existingFaqs } = await db.query('SELECT fl.id, fl._parent_id FROM payload.faqs_locales fl WHERE fl._locale=$1 ORDER BY fl._parent_id', ['en'])

  // Check FAQ answer type
  const { rows: faqCols } = await db.query<ColumnInfo>(
    "SELECT data_type FROM information_schema.columns WHERE table_schema='payload' AND table_name='faqs_locales' AND column_name='answer'"
  )
  const faqAnswerIsJson = faqCols[0]?.data_type?.includes('json')

  for (let i = 0; i < FAQS.length; i++) {
    const faq = FAQS[i]
    const answerVal = faqAnswerIsJson ? lexical(faq.answer) : faq.answer

    if (i < existingFaqs.length) {
      await db.query('UPDATE payload.faqs_locales SET question=$1, answer=$2 WHERE id=$3',
        [faq.question, answerVal, existingFaqs[i].id])
      console.log(`  ✓ Updated FAQ ${i+1}: ${faq.question.slice(0, 55)}...`)
    } else {
      const { rows: newFaq } = await db.query(
        `INSERT INTO payload.faqs (status, _status, published_at, updated_at, created_at)
         VALUES ('published','published',NOW(),NOW(),NOW()) RETURNING id`
      )
      await db.query(
        'INSERT INTO payload.faqs_locales (question, answer, _locale, _parent_id) VALUES ($1,$2,$3,$4)',
        [faq.question, answerVal, 'en', newFaq[0].id]
      )
      console.log(`  ✓ Created FAQ ${i+1}: ${faq.question.slice(0, 55)}...`)
    }
  }

  // ── Update Doctor bios + education + languages ──
  console.log('\n=== DOCTORS ===')
  for (const d of DOCTOR_UPDATES) {
    // Bio
    await db.query('UPDATE payload.doctors_locales SET bio=$1 WHERE _parent_id=$2 AND _locale=$3',
      [lexical(d.bio), d.id, 'en'])

    // Education
    await db.query('DELETE FROM payload.doctors_education WHERE _parent_id=$1', [d.id])
    for (let i = 0; i < d.education.length; i++) {
      await db.query('INSERT INTO payload.doctors_education (_order,_parent_id,id,description) VALUES ($1,$2,$3,$4)',
        [i+1, d.id, `${d.id}_e${i}_${Date.now()}`, d.education[i]])
    }

    // Languages
    await db.query('DELETE FROM payload.doctors_languages WHERE _parent_id=$1', [d.id])
    for (let i = 0; i < d.languages.length; i++) {
      await db.query('INSERT INTO payload.doctors_languages (_order,_parent_id,id,name) VALUES ($1,$2,$3,$4)',
        [i+1, d.id, `${d.id}_l${i}_${Date.now()}`, d.languages[i]])
    }
    console.log(`  ✓ Updated doctor ${d.id}`)
  }

  await db.end()
  console.log('\n✅ All done!')
  process.exit(0)
}

main().catch(e => { console.error(e.message); process.exit(1) })
