import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getPayloadClient } from '@/lib/payload'

export async function GET() {
  const payload = await getPayloadClient()
  try {
    const d = await (payload as any).create({
      collection: 'careers',
      data: { title: 'Test Career', position: 'Test', _status: 'published' },
      overrideAccess: true,
      locale: 'en',
      disableTransaction: true,
    })
    return NextResponse.json({ ok: true, id: d.id, title: d.title })
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack?.split('\n').slice(0, 5) })
  }
}

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 })
  }

  const payload = await getPayloadClient()
  const results: Record<string, any> = {}

  // Clean up any test records
  const testCareer = await (payload as any).find({ collection: 'careers', overrideAccess: true, draft: true, limit: 10, where: { position: { equals: 'Test' } } })
  for (const doc of testCareer.docs ?? []) {
    await (payload as any).delete({ collection: 'careers', id: doc.id, overrideAccess: true })
  }

  // Check existing
  const existingTalks = await (payload as any).find({ collection: 'doctor-talks', overrideAccess: true, draft: true, limit: 1 })
  const existingCareers = await (payload as any).find({ collection: 'careers', overrideAccess: true, draft: true, limit: 1 })

  // Doctor Talks — using real doctor IDs from DB
  if (existingTalks.totalDocs === 0) {
    const talks = [
      {
        title: 'Heart Health: Prevention & Early Detection',
        talkTopic: 'Heart Health: Prevention & Early Detection',
        featuredDoctor: 3, // Sin Haseka - Cardiology
        eventDate: '2026-06-20T00:00:00.000Z',
        eventTime: '09:00 - 11:00',
        duration: 120,
        isVirtual: false,
        excerpt: 'Learn about cardiovascular risk factors, prevention strategies, and the latest in early detection technology.',
        author: 'Sin Haseka',
        _status: 'published',
      },
      {
        title: 'Pediatric Care: From Newborn to Adolescent',
        talkTopic: 'Pediatric Care: From Newborn to Adolescent',
        featuredDoctor: 14, // Dr. Ratana Kim - Pediatrics
        eventDate: '2026-06-25T00:00:00.000Z',
        eventTime: '14:00 - 15:30',
        duration: 90,
        isVirtual: true,
        meetingLink: 'https://meet.orienda.com/pediatric-talk',
        excerpt: 'Essential guidance for parents on child development, vaccinations, and common childhood illnesses.',
        author: 'Dr. Ratana Kim',
        _status: 'published',
      },
      {
        title: "Women's Health: Obstetrics & Gynecology Essentials",
        talkTopic: "Women's Health: Obstetrics & Gynecology Essentials",
        featuredDoctor: 13, // Dr. Sophea Chanthara - OB/GYN
        eventDate: '2026-07-03T00:00:00.000Z',
        eventTime: '10:00 - 12:00',
        duration: 120,
        isVirtual: false,
        excerpt: "A comprehensive overview of women's health topics including prenatal care, family planning, and gynecological wellness.",
        author: 'Dr. Sophea Chanthara',
        _status: 'published',
      },
      {
        title: 'Skin & Dermatology: Common Conditions & Treatments',
        talkTopic: 'Skin & Dermatology: Common Conditions & Treatments',
        featuredDoctor: 17, // Dr. Kheang Dara - Dermatology
        eventDate: '2026-07-10T00:00:00.000Z',
        eventTime: '15:00 - 16:30',
        duration: 90,
        isVirtual: true,
        meetingLink: 'https://meet.orienda.com/dermatology-talk',
        excerpt: 'Understanding skin conditions, treatment options, and how to maintain healthy skin in Cambodia\'s climate.',
        author: 'Dr. Kheang Dara',
        _status: 'published',
      },
    ]

    const created = []
    for (const t of talks) {
      try {
        const d = await (payload as any).create({ collection: 'doctor-talks', data: t as any, overrideAccess: true, locale: 'en', disableTransaction: true })
        created.push({ id: d.id, title: (d as any).title ?? t.title })
      } catch (e: any) {
        created.push({ error: e.message, title: t.title })
      }
    }
    results.doctorTalks = created
  } else {
    results.doctorTalks = `skipped — ${existingTalks.totalDocs} already exist`
  }

  // Careers
  if (existingCareers.totalDocs === 0) {
    const careers = [
      {
        title: 'Senior Cardiologist',
        position: 'Senior Cardiologist',
        careerEmploymentType: 'full_time',
        experienceLevel: 'senior',
        salaryRange: '$2,000 - $3,500 / month',
        applicationDeadline: '2026-07-31T00:00:00.000Z',
        excerpt: 'We are seeking an experienced cardiologist to join our growing cardiac care team.',
        author: 'HR Department',
        _status: 'published',
      },
      {
        title: 'Registered Nurse — ICU',
        position: 'Registered Nurse — ICU',
        careerEmploymentType: 'full_time',
        experienceLevel: 'mid',
        salaryRange: '$800 - $1,200 / month',
        applicationDeadline: '2026-07-15T00:00:00.000Z',
        excerpt: 'Experienced ICU nurses needed to provide high-quality critical care to our patients.',
        author: 'HR Department',
        _status: 'published',
      },
      {
        title: 'Medical Laboratory Technician',
        position: 'Medical Laboratory Technician',
        careerEmploymentType: 'full_time',
        experienceLevel: 'entry',
        salaryRange: '$500 - $800 / month',
        applicationDeadline: '2026-07-20T00:00:00.000Z',
        excerpt: 'Join our laboratory team and contribute to accurate and timely diagnostic testing.',
        author: 'HR Department',
        _status: 'published',
      },
      {
        title: 'Pediatric Nurse Practitioner',
        position: 'Pediatric Nurse Practitioner',
        careerEmploymentType: 'full_time',
        experienceLevel: 'mid',
        salaryRange: '$1,000 - $1,500 / month',
        applicationDeadline: '2026-08-01T00:00:00.000Z',
        excerpt: 'Provide specialized nursing care to infants, children, and adolescents in our pediatrics ward.',
        author: 'HR Department',
        _status: 'published',
      },
      {
        title: 'Hospital Administrator',
        position: 'Hospital Administrator',
        careerEmploymentType: 'full_time',
        experienceLevel: 'senior',
        salaryRange: '$1,500 - $2,500 / month',
        applicationDeadline: '2026-07-25T00:00:00.000Z',
        excerpt: 'Lead administrative operations across departments to ensure smooth hospital management.',
        author: 'HR Department',
        _status: 'published',
      },
    ]

    const created = []
    for (const c of careers) {
      try {
        const d = await (payload as any).create({ collection: 'careers', data: c as any, overrideAccess: true, locale: 'en', disableTransaction: true })
        created.push({ id: d.id, title: (d as any).title ?? c.title })
      } catch (e: any) {
        created.push({ error: e.message, title: c.title })
      }
    }
    results.careers = created
  } else {
    results.careers = `skipped — ${existingCareers.totalDocs} already exist`
  }

  // Health Tips — bypass Payload ORM (health_tips_health_tip_tags table missing)
  const pool = (payload as any).db.pool
  // Clear wrong news thumbnails from existing health tips (IDs 35,36,47,48,63 are news photos)
  await pool.query(`UPDATE payload.health_tips SET thumbnail_id = NULL WHERE thumbnail_id IN (35,36,47,48,63)`)
  const { rows: tipCountRows } = await pool.query(`SELECT COUNT(*) FROM payload.health_tips WHERE _status = 'published'`)
  const tipCount = parseInt(tipCountRows[0].count, 10)
  if (tipCount === 0) {
    const tipsRaw = [
      { title: '5 Simple Habits for a Healthy Heart', slug: '5-simple-habits-for-a-healthy-heart', excerpt: 'Discover daily habits that significantly reduce your risk of heart disease — from diet changes to stress management techniques.', category: 'preventiveCare', readingTime: 4, publishedAt: '2026-06-01T00:00:00.000Z' },
      { title: 'Understanding Diabetes: Prevention & Management', slug: 'understanding-diabetes-prevention-management', excerpt: 'Key insights into preventing Type 2 diabetes and managing blood sugar levels through nutrition, exercise, and regular screening.', category: 'chronicDisease', readingTime: 6, publishedAt: '2026-05-25T00:00:00.000Z' },
      { title: 'Maternal Health: What to Expect During Pregnancy', slug: 'maternal-health-what-to-expect-during-pregnancy', excerpt: 'A comprehensive guide to prenatal care, nutrition, and warning signs every expectant mother should know.', category: 'preventiveCare', readingTime: 7, publishedAt: '2026-05-18T00:00:00.000Z' },
      { title: "Children's Nutrition: Building Strong Foundations", slug: 'childrens-nutrition-building-strong-foundations', excerpt: 'Essential nutritional guidance for growing children — what to eat, what to avoid, and how to build healthy eating habits early.', category: 'nutrition', readingTime: 5, publishedAt: '2026-05-10T00:00:00.000Z' },
      { title: 'Mental Wellness: Coping with Stress in Modern Life', slug: 'mental-wellness-coping-with-stress-in-modern-life', excerpt: "Practical strategies for managing stress, improving sleep, and maintaining mental wellbeing in today's fast-paced world.", category: 'mentalHealth', readingTime: 5, publishedAt: '2026-05-03T00:00:00.000Z' },
    ]
    const created = []
    for (const tip of tipsRaw) {
      try {
        const body = JSON.stringify({ root: { type: 'root', children: [{ type: 'paragraph', version: 1, children: [{ type: 'text', text: tip.excerpt }], direction: 'ltr', format: '', indent: 0 }], direction: 'ltr', format: '', indent: 0, version: 1 } })
        const { rows: ins } = await pool.query(
          `INSERT INTO payload.health_tips (slug, thumbnail_id, author, health_tip_category, reading_time, published_at, updated_at, created_at, _status)
           VALUES ($1, NULL, $2, $3, $4, $5, NOW(), NOW(), 'published') RETURNING id`,
          [tip.slug, 'Orienda Medical Team', tip.category, tip.readingTime, tip.publishedAt]
        )
        const newId = ins[0].id
        await pool.query(
          `INSERT INTO payload.health_tips_locales (title, body, excerpt, _locale, _parent_id) VALUES ($1, $2::jsonb, $3, 'en', $4)`,
          [tip.title, body, tip.excerpt, newId]
        )
        created.push({ id: newId, title: tip.title })
      } catch (e: any) {
        created.push({ error: e.message, title: tip.title })
      }
    }
    results.healthTips = created
  } else {
    results.healthTips = `skipped — ${tipCount} already exist`
  }

  // More Doctor Talks (additional 4 for richer demo)
  const talkCount = await (payload as any).find({ collection: 'doctor-talks', overrideAccess: true, draft: true, limit: 1 })
  if (talkCount.totalDocs < 6) {
    const moreTalks = [
      {
        title: 'Orthopedic Health: Spine, Joints & Sports Injuries',
        talkTopic: 'Orthopedic Health: Spine, Joints & Sports Injuries',
        featuredDoctor: 18, // Dr. Buntha Lim - Orthopedic Surgery
        eventDate: '2026-07-15T00:00:00.000Z',
        eventTime: '09:00 - 11:00',
        duration: 120,
        isVirtual: false,
        excerpt: 'Expert guidance on preventing and treating orthopedic conditions, from lower back pain to sports-related injuries.',
        author: 'Dr. Buntha Lim',
        _status: 'published',
      },
      {
        title: 'Neonatal Care: Giving Your Newborn the Best Start',
        talkTopic: 'Neonatal Care: Giving Your Newborn the Best Start',
        featuredDoctor: 14, // Dr. Ratana Kim
        eventDate: '2026-07-22T00:00:00.000Z',
        eventTime: '14:00 - 15:30',
        duration: 90,
        isVirtual: true,
        meetingLink: 'https://meet.orienda.com/neonatal-talk',
        excerpt: 'Essential care practices for newborns in the first weeks of life — feeding, sleep, and early health monitoring.',
        author: 'Dr. Ratana Kim',
        _status: 'published',
      },
    ]
    const created = []
    for (const t of moreTalks) {
      try {
        const d = await (payload as any).create({ collection: 'doctor-talks', data: t as any, overrideAccess: true, locale: 'en', disableTransaction: true })
        created.push({ id: d.id, title: (d as any).title ?? t.title })
      } catch (e: any) {
        created.push({ error: e.message, title: t.title })
      }
    }
    results.moreDoctorTalks = created
  } else {
    results.moreDoctorTalks = `skipped — ${talkCount.totalDocs} already exist`
  }

  // Seed images into news articles (news_rels with path='images')
  // Copy each news thumbnail into the images[] field if not already present
  await pool.query(`
    INSERT INTO payload.news_rels ("order", parent_id, path, media_id)
    SELECT 1, n.id, 'images', n.thumbnail_id
    FROM payload.news n
    WHERE n.thumbnail_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM payload.news_rels nr
        WHERE nr.parent_id = n.id AND nr.path = 'images' AND nr.media_id = n.thumbnail_id
      )
  `)
  results.newsImages = 'seeded thumbnail as gallery image for each news article'

  // Fix news thumbnails — assign real media to items missing thumbnails
  // news-thumb media IDs: 11,12,23,24,35,36,47,48,63,64,65
  const newsThumbnailMap: Record<number, number> = {
    13: 11,  // news 13 → news-thumb-1.jpg
    14: 12,  // news 14 → news-thumb-2.jpg
    15: 23,  // news 15 → news-thumb-3.jpg
    1:  25,  // news 1 (Soma Group, has wrong Discord img) → figma-news-4.jpg
  }
  const newsUpdates = await Promise.all(
    Object.entries(newsThumbnailMap).map(([newsId, mediaId]) =>
      payload.update({ collection: 'news', id: Number(newsId), data: { thumbnail: mediaId } as any, overrideAccess: true } as any)
        .then((d: any) => ({ id: newsId, ok: true, slug: d.slug }))
        .catch((e: any) => ({ id: newsId, error: e.message }))
    )
  )
  results.newsThumbnails = newsUpdates
  revalidateTag('news', 'default')

  return NextResponse.json(results)
}
