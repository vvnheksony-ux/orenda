import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { getRawPool } from '@/lib/db'

export async function GET() {
  const pool = getRawPool()
  const { rows } = await pool.query(`SELECT id, filename, prefix FROM payload.media ORDER BY id`)
  return NextResponse.json(rows)
}

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 })
  }

  const payload = await getPayloadClient()
  const pool = getRawPool()
  const results: Record<string, any> = {}

  // ── 1. DEPARTMENT ICONS ──────────────────────────────────────────────────
  // dept-*.png images: 115=obstetric 116=gynecology 117=pediatric
  //   118=imaging 119=orthopedics 120=neurology 121=cardiology
  await pool.query(`
    UPDATE payload.departments SET icon_id = CASE id
      WHEN 22 THEN 117
      WHEN 23 THEN 115
      WHEN 24 THEN 116
      WHEN 25 THEN 118
      WHEN 26 THEN 120
      WHEN 27 THEN 119
      WHEN 28 THEN 121
      WHEN 29 THEN 115
      WHEN 30 THEN 120
      WHEN 31 THEN 119
      WHEN 32 THEN 121
      WHEN 33 THEN 118
      WHEN 34 THEN 116
      ELSE icon_id
    END
    WHERE id IN (22,23,24,25,26,27,28,29,30,31,32,33,34)
  `)
  results.deptIcons = 'assigned dept-*.png icons to all 13 departments'

  // ── 2. HEALTH TIP THUMBNAILS ─────────────────────────────────────────────
  // 21=clinic-obstetrics 24=news-thumb-4 33=clinic-obstetrics-1
  // 35=news-thumb-5 36=news-thumb-6
  await pool.query(`
    UPDATE payload.health_tips SET thumbnail_id = CASE id
      WHEN 2 THEN 24
      WHEN 3 THEN 35
      WHEN 4 THEN 21
      WHEN 5 THEN 33
      WHEN 6 THEN 36
      ELSE thumbnail_id
    END
    WHERE id IN (2,3,4,5,6)
  `)
  results.healthTipThumbnails = 'assigned thumbnails to 5 health tips'

  // ── 3. NEWS THUMBNAILS (missing ones) ────────────────────────────────────
  // 63=news-thumb-9 64=news-thumb-10 65=news-thumb-11
  await pool.query(`
    UPDATE payload.news SET thumbnail_id = CASE id
      WHEN 10 THEN 65
      WHEN 11 THEN 64
      WHEN 12 THEN 63
      ELSE thumbnail_id
    END
    WHERE id IN (10,11,12) AND thumbnail_id IS NULL
  `)
  // Also fix news 13, 14, 15, 1 via Payload so _status stays consistent
  // 11=news-thumb-1 12=news-thumb-2 23=news-thumb-3 25=figma-news-4
  const fixedThumbs = await Promise.allSettled([
    pool.query(`UPDATE payload.news SET thumbnail_id = 11 WHERE id = 13 AND thumbnail_id IS NULL`),
    pool.query(`UPDATE payload.news SET thumbnail_id = 12 WHERE id = 14 AND thumbnail_id IS NULL`),
    pool.query(`UPDATE payload.news SET thumbnail_id = 23 WHERE id = 15 AND thumbnail_id IS NULL`),
    pool.query(`UPDATE payload.news SET thumbnail_id = 25 WHERE id = 1  AND thumbnail_id = 1`),
  ])
  results.newsThumbnails = `fixed: ${fixedThumbs.filter(r => r.status === 'fulfilled').length}/4`

  // ── 4. NEWS GALLERY IMAGES ───────────────────────────────────────────────
  // Seed thumbnail as first gallery image (idempotent)
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
  // Add 2 extra gallery images per news article for richer demo
  // 10=figma-news-1 13=figma-news-2 22=figma-news-3 25=figma-news-4
  // 34=figma-news-5 37=figma-news-6 46=figma-news-7 49=figma-news-8
  // 61=figma-news-9 62=figma-news-10 57=clinic-obstetrics-3
  const galleryPairs: [number, number, number][] = [
    // [order, news_id, media_id]
    [2,  1,  25], [3,  1,  22],   // Soma Group
    [2,  5,  61], [3,  5,  62],   // Oknha MoU
    [2, 10,  46], [3, 10,  34],   // ACLEDA
    [2, 11,  49], [3, 11,  37],   // Spine
    [2, 12,  57], [3, 12,  45],   // Women Health
    [2, 13,  10], [3, 13,  13],   // Orchid
    [2, 14,  13], [3, 14,  22],   // Grand Opening
    [2, 15,  22], [3, 15,  34],   // Ministry MoU
  ]
  for (const [ord, nid, mid] of galleryPairs) {
    await pool.query(`
      INSERT INTO payload.news_rels ("order", parent_id, path, media_id)
      SELECT $1, $2, 'images', $3
      WHERE NOT EXISTS (
        SELECT 1 FROM payload.news_rels WHERE parent_id = $2 AND path = 'images' AND media_id = $3
      )
    `, [ord, nid, mid])
  }
  results.newsGallery = 'seeded 2 extra images per news article'

  // ── 5. DOCTOR TALK THUMBNAILS ────────────────────────────────────────────
  // 21=clinic-obstetrics 34=figma-news-5 37=figma-news-6
  // 45=clinic-obstetrics-2 46=figma-news-7 49=figma-news-8
  await pool.query(`
    UPDATE payload.doctor_talks
    SET thumbnail_id = (ARRAY[34,45,21,37,46,49])[(((id - 1) % 6) + 1)]
    WHERE thumbnail_id IS NULL
  `)
  results.talkThumbnails = 'assigned thumbnails to doctor talks without images'

  // ── 6. CAREER THUMBNAILS ─────────────────────────────────────────────────
  // 14=promo-card-1 15=promo-card-2 26=promo-card-3 27=promo-card-4 38=promo-card-5
  await pool.query(`
    UPDATE payload.careers
    SET thumbnail_id = (ARRAY[14,15,26,27,38])[(((id - 1) % 5) + 1)]
    WHERE thumbnail_id IS NULL
  `)
  results.careerThumbnails = 'assigned thumbnails to careers without images'

  // ── 7. SEED MISSING CAREERS (if < 5) ─────────────────────────────────────
  const { rows: careerCountRows } = await pool.query(
    `SELECT COUNT(*) FROM payload.careers WHERE status = 'published'`
  )
  const careerCount = parseInt(careerCountRows[0].count, 10)
  if (careerCount < 5) {
    const careers = [
      { position: 'Senior Cardiologist',          employmentType: 'full_time', experienceLevel: 'senior', salary: '$2,000 - $3,500 / month', deadline: '2026-07-31', slug: 'senior-cardiologist' },
      { position: 'Registered Nurse — ICU',        employmentType: 'full_time', experienceLevel: 'mid',    salary: '$800 - $1,200 / month',   deadline: '2026-07-15', slug: 'registered-nurse-icu' },
      { position: 'Medical Laboratory Technician', employmentType: 'full_time', experienceLevel: 'entry',  salary: '$500 - $800 / month',     deadline: '2026-07-20', slug: 'medical-lab-technician' },
      { position: 'Pediatric Nurse Practitioner',  employmentType: 'full_time', experienceLevel: 'mid',    salary: '$1,000 - $1,500 / month', deadline: '2026-08-01', slug: 'pediatric-nurse-practitioner' },
      { position: 'Hospital Administrator',        employmentType: 'full_time', experienceLevel: 'senior', salary: '$1,500 - $2,500 / month', deadline: '2026-07-25', slug: 'hospital-administrator' },
    ]
    const created = []
    for (const c of careers) {
      try {
        const { rows: exists } = await pool.query(
          `SELECT id FROM payload.careers WHERE slug = $1 LIMIT 1`, [c.slug]
        )
        if (exists.length > 0) { created.push({ skip: c.slug }); continue }
        const body = JSON.stringify({ root: { type: 'root', children: [{ type: 'paragraph', version: 1, children: [{ type: 'text', text: `Join Orienda International Hospital as ${c.position}.` }], direction: 'ltr', format: '', indent: 0 }], direction: 'ltr', format: '', indent: 0, version: 1 } })
        const { rows: ins } = await pool.query(`
          INSERT INTO payload.careers
            (slug, career_employment_type, experience_level, application_deadline,
             status, _status, published_at, updated_at, created_at)
          VALUES ($1, $2, $3, $4, 'published', 'published', NOW(), NOW(), NOW())
          RETURNING id
        `, [c.slug, c.employmentType, c.experienceLevel, c.deadline])
        const newId = ins[0].id
        await pool.query(`
          INSERT INTO payload.careers_locales
            (title, position, salary_range, body, _locale, _parent_id)
          VALUES ($1, $2, $3, $4::jsonb, 'en', $5)
        `, [c.position, c.position, c.salary, body, newId])
        created.push({ id: newId, position: c.position })
      } catch (e: any) {
        created.push({ error: e.message, slug: c.slug })
      }
    }
    results.careers = created
  } else {
    results.careers = `skipped — ${careerCount} already exist`
  }

  // ── 8. SEED MISSING DOCTOR TALKS (if < 5) ────────────────────────────────
  const { rows: talkCountRows } = await pool.query(
    `SELECT COUNT(*) FROM payload.doctor_talks WHERE status = 'published'`
  )
  const talkCount = parseInt(talkCountRows[0].count, 10)
  if (talkCount < 5) {
    const talks = [
      { slug: 'heart-health-prevention', title: 'Heart Health: Prevention & Early Detection', topic: 'Heart Health: Prevention & Early Detection', doctorId: 3,  date: '2026-06-20', time: '09:00 - 11:00', duration: 120, virtual: false, meeting: '',   excerpt: 'Learn about cardiovascular risk factors, prevention strategies, and the latest in early detection technology.' },
      { slug: 'pediatric-care-newborn',   title: 'Pediatric Care: From Newborn to Adolescent',    topic: 'Pediatric Care: From Newborn to Adolescent',    doctorId: 14, date: '2026-06-25', time: '14:00 - 15:30', duration:  90, virtual: true,  meeting: 'https://meet.orienda.com/pediatric-talk', excerpt: 'Essential guidance for parents on child development, vaccinations, and common childhood illnesses.' },
      { slug: 'womens-health-obstetrics', title: "Women's Health: Obstetrics & Gynecology",       topic: "Women's Health: Obstetrics & Gynecology",       doctorId: 13, date: '2026-07-03', time: '10:00 - 12:00', duration: 120, virtual: false, meeting: '',   excerpt: "A comprehensive overview of women's health topics including prenatal care and gynecological wellness." },
      { slug: 'orthopedic-health',        title: 'Orthopedic Health: Spine, Joints & Sports',     topic: 'Orthopedic Health: Spine, Joints & Sports',     doctorId: 18, date: '2026-07-15', time: '09:00 - 11:00', duration: 120, virtual: false, meeting: '',   excerpt: 'Expert guidance on preventing and treating orthopedic conditions.' },
      { slug: 'neonatal-care',            title: 'Neonatal Care: Giving Your Newborn the Best Start', topic: 'Neonatal Care', doctorId: 14, date: '2026-07-22', time: '14:00 - 15:30', duration: 90, virtual: true, meeting: 'https://meet.orienda.com/neonatal-talk', excerpt: 'Essential care practices for newborns in the first weeks of life.' },
    ]
    const created = []
    for (const t of talks) {
      try {
        const { rows: exists } = await pool.query(
          `SELECT id FROM payload.doctor_talks WHERE slug = $1 LIMIT 1`, [t.slug]
        )
        if (exists.length > 0) { created.push({ skip: t.slug }); continue }
        const body = JSON.stringify({ root: { type: 'root', children: [{ type: 'paragraph', version: 1, children: [{ type: 'text', text: t.excerpt }], direction: 'ltr', format: '', indent: 0 }], direction: 'ltr', format: '', indent: 0, version: 1 } })
        const { rows: ins } = await pool.query(`
          INSERT INTO payload.doctor_talks
            (slug, featured_doctor_id, event_date, event_time, duration,
             is_virtual, meeting_link, status, _status, published_at, updated_at, created_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,'published','published',NOW(),NOW(),NOW())
          RETURNING id
        `, [t.slug, t.doctorId, t.date, t.time, t.duration, t.virtual, t.meeting])
        const newId = ins[0].id
        await pool.query(`
          INSERT INTO payload.doctor_talks_locales
            (title, talk_topic, excerpt, body, _locale, _parent_id)
          VALUES ($1,$2,$3,$4::jsonb,'en',$5)
        `, [t.title, t.topic, t.excerpt, body, newId])
        created.push({ id: newId, title: t.title })
      } catch (e: any) {
        created.push({ error: e.message, slug: t.slug })
      }
    }
    results.doctorTalks = created
    // Assign thumbnails to newly created talks
    await pool.query(`
      UPDATE payload.doctor_talks
      SET thumbnail_id = (ARRAY[34,45,21,37,46,49])[(((id - 1) % 6) + 1)]
      WHERE thumbnail_id IS NULL
    `)
  } else {
    results.doctorTalks = `skipped — ${talkCount} already exist`
  }

  // ── 9. HEALTH TIPS (if missing) ───────────────────────────────────────────
  const { rows: tipCountRows } = await pool.query(
    `SELECT COUNT(*) FROM payload.health_tips WHERE _status = 'published'`
  )
  const tipCount = parseInt(tipCountRows[0].count, 10)
  if (tipCount === 0) {
    const tips = [
      { slug: '5-simple-habits-for-a-healthy-heart',           title: '5 Simple Habits for a Healthy Heart',                excerpt: 'Discover daily habits that significantly reduce your risk of heart disease.', category: 'preventiveCare', readingTime: 4, publishedAt: '2026-06-01', thumbId: 24 },
      { slug: 'understanding-diabetes-prevention-management',   title: 'Understanding Diabetes: Prevention & Management',     excerpt: 'Key insights into preventing Type 2 diabetes and managing blood sugar levels.', category: 'chronicDisease',  readingTime: 6, publishedAt: '2026-05-25', thumbId: 35 },
      { slug: 'maternal-health-what-to-expect-during-pregnancy',title: 'Maternal Health: What to Expect During Pregnancy',    excerpt: 'A comprehensive guide to prenatal care, nutrition, and warning signs.', category: 'preventiveCare', readingTime: 7, publishedAt: '2026-05-18', thumbId: 21 },
      { slug: 'childrens-nutrition-building-strong-foundations', title: "Children's Nutrition: Building Strong Foundations",   excerpt: 'Essential nutritional guidance for growing children.', category: 'nutrition',        readingTime: 5, publishedAt: '2026-05-10', thumbId: 33 },
      { slug: 'mental-wellness-coping-with-stress-in-modern-life',title: 'Mental Wellness: Coping with Stress in Modern Life', excerpt: "Practical strategies for managing stress and maintaining mental wellbeing.", category: 'mentalHealth',    readingTime: 5, publishedAt: '2026-05-03', thumbId: 36 },
    ]
    const created = []
    for (const tip of tips) {
      try {
        const body = JSON.stringify({ root: { type: 'root', children: [{ type: 'paragraph', version: 1, children: [{ type: 'text', text: tip.excerpt }], direction: 'ltr', format: '', indent: 0 }], direction: 'ltr', format: '', indent: 0, version: 1 } })
        const { rows: ins } = await pool.query(`
          INSERT INTO payload.health_tips
            (slug, thumbnail_id, author, health_tip_category, reading_time,
             published_at, updated_at, created_at, _status)
          VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW(),'published') RETURNING id
        `, [tip.slug, tip.thumbId, 'Orienda Medical Team', tip.category, tip.readingTime, tip.publishedAt])
        const newId = ins[0].id
        await pool.query(`
          INSERT INTO payload.health_tips_locales (title, body, excerpt, _locale, _parent_id)
          VALUES ($1,$2::jsonb,$3,'en',$4)
        `, [tip.title, body, tip.excerpt, newId])
        created.push({ id: newId, title: tip.title })
      } catch (e: any) {
        created.push({ error: e.message, slug: tip.slug })
      }
    }
    results.healthTips = created
  } else {
    results.healthTips = `skipped — ${tipCount} already exist (thumbnails updated above)`
  }

  return NextResponse.json(results)
}
