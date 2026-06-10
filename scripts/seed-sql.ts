import { Client } from 'pg'

const db = new Client({ connectionString: process.env.DATABASE_URL! })
await db.connect()

function rtJson(text: string) {
  return JSON.stringify({ root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textStyle: '', textFormat: 0, children: [{ mode: 'normal', text, type: 'text', style: '', detail: 0, format: 0, version: 1 }] }] } })
}

async function upsertLocale(table: string, parentId: number, locale: string, data: Record<string, string | null>) {
  const cols = Object.keys(data)
  const setClause = cols.map(c => `${c} = EXCLUDED.${c}`).join(', ')
  const placeholders = cols.map((_, i) => `$${i + 3}`).join(', ')
  await db.query(
    `INSERT INTO payload.${table} (_parent_id, _locale, ${cols.join(', ')})
     VALUES ($1, $2, ${placeholders})
     ON CONFLICT (_parent_id, _locale) DO UPDATE SET ${setClause}`,
    [parentId, locale, ...cols.map(c => data[c])]
  )
}

// ── Departments ────────────────────────────────────────────────────────────
console.log('\n── Departments ─────────────────────────')
const DEPTS: { id: number; en: string; zh: string; km: string }[] = [
  { id: 1,  en: 'Obstetrics Doctor',        zh: '产科医生',      km: 'គ្រូពេទ្យសម្ភព' },
  { id: 2,  en: 'Pediatrics & Neonatology', zh: '儿科与新生儿科',km: 'កុមារវិទ្យា និងទារកទើបនឹងកើត' },
  { id: 3,  en: 'Radiology',                zh: '放射科',        km: 'វិទ្យុសាស្ត្រ' },
  { id: 4,  en: 'Anesthesiology',           zh: '麻醉科',        km: 'ថ្នាំសន្លប់' },
  { id: 5,  en: 'General Medicine',         zh: '内科',          km: 'វេជ្ជសាស្ត្រទូទៅ' },
  { id: 6,  en: 'Dermatology',              zh: '皮肤科',        km: 'ជំងឺស្បែក' },
  { id: 7,  en: 'Orthopedic Surgery',       zh: '骨科手术',      km: 'វះកាត់ឆ្អឹង' },
  { id: 8,  en: 'Cardiology',               zh: '心脏科',        km: 'ជំងឺបេះដូង' },
  { id: 9,  en: 'Physiotherapy',            zh: '物理治疗',      km: 'ព្យាបាលរាងកាយ' },
  { id: 10, en: 'Medical Director',         zh: '医疗总监',      km: 'នាយកការពេទ្យ' },
  { id: 11, en: 'Deputy Medical Director',  zh: '副医疗总监',    km: 'នាយករងការពេទ្យ' },
  { id: 12, en: 'Medical Administration',   zh: '医疗行政',      km: 'រដ្ឋបាលវេជ្ជសាស្ត្រ' },
  { id: 13, en: 'General Surgery',          zh: '普通外科',      km: 'វះកាត់ទូទៅ' },
  { id: 14, en: 'Obstetrics',               zh: '产科',          km: 'ផ្នែកសម្ភព' },
  { id: 15, en: 'Gynecology',               zh: '妇科',          km: 'រោគស្ត្រី' },
  { id: 16, en: 'Pediatrics',               zh: '儿科',          km: 'កុមារវិទ្យា' },
  { id: 17, en: 'Neurology',                zh: '神经科',        km: 'ប្រព័ន្ធសរសៃប្រសាទ' },
  { id: 18, en: 'Medical Imaging',          zh: '医学影像',      km: 'រូបភាពវេជ្ជសាស្ត្រ' },
  { id: 19, en: 'Orthopedics',              zh: '骨科',          km: 'ឆ្អឹង' },
  { id: 20, en: 'Cardiology',               zh: '心脏科',        km: 'បេះដូង' },
  { id: 21, en: 'Obstetrics',               zh: '产科',          km: 'ផ្នែកសម្ភព' },
  { id: 22, en: 'Neonatology',              zh: '新生儿科',      km: 'ទារកទើបនឹងកើត' },
  { id: 23, en: 'Maternity Care',           zh: '产科护理',      km: 'ថែទាំមាតា' },
  { id: 24, en: 'Dermatology',              zh: '皮肤科',        km: 'ជំងឺស្បែក' },
  { id: 25, en: 'Ophthalmology',            zh: '眼科',          km: 'ភ្នែក' },
  { id: 26, en: 'Oncology',                 zh: '肿瘤科',        km: 'ជំងឺមហារីក' },
  { id: 27, en: 'Urology',                  zh: '泌尿科',        km: 'ទឹកនោម' },
  { id: 28, en: 'Gastroenterology',         zh: '胃肠科',        km: 'ការរំលាយអាហារ' },
  { id: 29, en: 'Endocrinology',            zh: '内分泌科',      km: 'ក្រពេញ' },
  { id: 30, en: 'Anesthesiology',           zh: '麻醉科',        km: 'ថ្នាំសន្លប់' },
  { id: 31, en: 'Physiotherapy',            zh: '物理治疗',      km: 'ព្យាបាលរាងកាយ' },
  { id: 32, en: 'Emergency Medicine',       zh: '急诊科',        km: 'ជំនួយបន្ទាន់' },
  { id: 33, en: 'General Surgery',          zh: '外科',          km: 'វះកាត់' },
  { id: 34, en: 'Dentistry',               zh: '牙科',          km: 'ធ្មេញ' },
]

for (const d of DEPTS) {
  await upsertLocale('departments_locales', d.id, 'en', { name: d.en })
  await upsertLocale('departments_locales', d.id, 'zh', { name: d.zh })
  await upsertLocale('departments_locales', d.id, 'km', { name: d.km })
  console.log(`  ✓ dept ${d.id}: ${d.en}`)
}

// ── Doctors ───────────────────────────────────────────────────────────────
console.log('\n── Doctors ─────────────────────────────')
const DOCTORS = [
  { id: 1,  enS: 'Anesthesiology',                 zhS: '麻醉科',       kmS: 'ថ្នាំសន្លប់',
    enB: 'Dr. Eng Borey is an anesthesiology specialist with over 10 years of experience, ensuring patient safety and comfort during all surgical procedures at Orienda International Hospital.',
    zhB: 'Eng Borey医生是麻醉科专家，拥有超过10年从业经验，确保每位患者在手术过程中的安全与舒适。',
    kmB: 'វេជ្ជបណ្ឌិត Eng Borey ជាអ្នកឯកទេសថ្នាំសន្លប់ ដែលមានបទពិសោធន៍ជាង 10 ឆ្នាំ ធានាសុវត្ថិភាព និងភាពស្រួលអ្នកជំងឺក្នុងអំឡុងវះកាត់ទាំងអស់។' },
  { id: 2,  enS: 'Medical Director & Administration', zhS: '医疗总监',     kmS: 'នាយករដ្ឋបាលវេជ្ជសាស្ត្រ',
    enB: 'Nop Sovannaret leads Orienda\'s medical administration, overseeing clinical operations and ensuring the highest standard of patient care across all departments.',
    zhB: 'Nop Sovannaret负责欧瑞达的医疗行政工作，监督临床运营并确保各科室的最高患者护理标准。',
    kmB: 'Nop Sovannaret ដឹកនាំរដ្ឋបាលវេជ្ជសាស្ត្ររបស់ Orienda គ្រប់គ្រងប្រតិបត្តិការគ្លីនិក និងធានាស្តង់ដារថែទាំអ្នកជំងឺខ្ពស់បំផុត។' },
  { id: 3,  enS: 'Cardiology',                      zhS: '心脏科',       kmS: 'ជំងឺបេះដូង',
    enB: 'Dr. Sin Haseka is a cardiologist specializing in the diagnosis and treatment of cardiovascular conditions, with extensive training in interventional cardiology and cardiac imaging.',
    zhB: 'Sin Haseka医生是心脏科专家，专注于心血管疾病的诊断和治疗，拥有丰富的介入心脏病学及心脏影像培训经验。',
    kmB: 'វេជ្ជបណ្ឌិត Sin Haseka ជំនាញខាងការព្យាបាល និងរោគវិនិច្ឆ័យជំងឺបេះដូង ជាមួយបទពិសោធន៍ Interventional Cardiology ។' },
  { id: 13, enS: 'Obstetrics & Gynecology',          zhS: '妇产科',       kmS: 'រោគស្ត្រី និងសម្ភព',
    enB: 'Dr. Sophea Chanthara is an experienced obstetrician-gynecologist dedicated to women\'s health throughout all life stages, from prenatal care to menopause management.',
    zhB: 'Sophea Chanthara医生是经验丰富的妇产科医生，致力于女性在人生各阶段的健康，从产前护理到更年期管理。',
    kmB: 'វេជ្ជបណ្ឌិត Sophea Chanthara ជំនាញខាងរោគស្ត្រី និងសម្ភព ឧទ្ទិសខ្លួនដើម្បីសុខភាពស្ត្រីក្នុងគ្រប់ដំណាក់កាលជីវិត។' },
  { id: 14, enS: 'Pediatrics & Neonatology',         zhS: '儿科与新生儿科',kmS: 'កុមារវិទ្យា',
    enB: 'Dr. Ratana Kim specializes in pediatrics and neonatal care, providing expert medical attention to newborns, infants, and children with a compassionate approach.',
    zhB: 'Ratana Kim医生专注于儿科和新生儿护理，以富有爱心的方式为新生儿、婴幼儿和儿童提供专业医疗服务。',
    kmB: 'វេជ្ជបណ្ឌិត Ratana Kim ជំនាញខាងកុមារវិទ្យា និងទារកទើបនឹងកើត ផ្ដល់ការថែទាំជំនាញដោយក្ដីអាណិតដល់ទារក និងកុមារ។' },
  { id: 15, enS: 'Diagnostic Radiology',             zhS: '放射诊断科',   kmS: 'វិទ្យុសាស្ត្ររោគវិនិច្ឆ័យ',
    enB: 'Dr. Virak Pheang is a diagnostic radiologist skilled in interpreting X-ray, MRI, CT scan, and ultrasound imaging to support accurate clinical diagnoses.',
    zhB: 'Virak Pheang医生是放射诊断科专家，擅长解读X光、MRI、CT扫描及超声波影像，协助精准的临床诊断。',
    kmB: 'វេជ្ជបណ្ឌិត Virak Pheang ជំនាញអានរូបភាព X-ray MRI CT Scan និង Ultrasound ដើម្បីជំនួយក្នុងរោគវិនិច្ឆ័យត្រឹមត្រូវ។' },
  { id: 16, enS: 'General Medicine',                 zhS: '内科',         kmS: 'វេជ្ជសាស្ត្រទូទៅ',
    enB: 'Dr. Maly Sovann is a general practitioner providing comprehensive primary care. She focuses on preventive medicine, chronic disease management, and patient education.',
    zhB: 'Maly Sovann医生是全科医生，提供全面的初级医疗服务，专注于预防医学、慢性病管理和患者教育。',
    kmB: 'វេជ្ជបណ្ឌិត Maly Sovann ជាគ្រូពេទ្យទូទៅ ផ្ដល់ការថែទាំបឋម ផ្ដោតលើការបង្ការ ការគ្រប់គ្រងជំងឺរ៉ាំរ៉ៃ និងការអប់រំអ្នកជំងឺ។' },
  { id: 17, enS: 'Dermatology',                      zhS: '皮肤科',       kmS: 'ជំងឺស្បែក',
    enB: 'Dr. Kheang Dara specializes in diagnosing and treating skin, hair, and nail conditions, offering both medical and cosmetic dermatology services.',
    zhB: 'Kheang Dara医生专注于皮肤、毛发和指甲疾病的诊断和治疗，提供医疗和美容皮肤科全方位服务。',
    kmB: 'វេជ្ជបណ្ឌិត Kheang Dara ជំនាញខាងជំងឺស្បែក សក់ និងក្រចក ផ្ដល់សេវាវេជ្ជសាស្ត្រ និងសោភ័ណភាព។' },
  { id: 18, enS: 'Orthopedic Surgery',               zhS: '骨科手术',     kmS: 'វះកាត់ឆ្អឹង',
    enB: 'Dr. Buntha Lim is an orthopedic surgeon with expertise in joint replacement, sports injuries, and spine conditions, committed to restoring patient mobility.',
    zhB: 'Buntha Lim医生是骨科外科医生，擅长关节置换、运动损伤和脊柱疾病，致力于恢复患者的活动能力。',
    kmB: 'វេជ្ជបណ្ឌិត Buntha Lim ជំនាញខាងការជំនួសសន្លឹកឆ្អឹង ការរបួសសន្លឹក និងជំងឺឆ្អឹងខ្នង ឧទ្ទិសខ្លួនដើម្បីស្ដារចលនា។' },
  { id: 19, enS: 'Physiotherapy',                    zhS: '物理治疗科',   kmS: 'ព្យាបាលរាងកាយ',
    enB: 'Dr. Chanraksmey Heng is a physiotherapist specializing in rehabilitation programs, musculoskeletal conditions, and post-surgical recovery at Orienda International Hospital.',
    zhB: 'Chanraksmey Heng医生是物理治疗师，专注于康复治疗项目、肌肉骨骼疾病和外科术后恢复。',
    kmB: 'វេជ្ជបណ្ឌិត Chanraksmey Heng ជំនាញខាងកម្មវិធីស្ដារ ជំងឺ筋肉骨骼 និងការស្ដារបន្ទាប់ពីវះកាត់។' },
]

for (const d of DOCTORS) {
  await upsertLocale('doctors_locales', d.id, 'en', { specialty: d.enS, bio: rtJson(d.enB) })
  await upsertLocale('doctors_locales', d.id, 'zh', { specialty: d.zhS, bio: rtJson(d.zhB) })
  await upsertLocale('doctors_locales', d.id, 'km', { specialty: d.kmS, bio: rtJson(d.kmB) })
  console.log(`  ✓ doctor ${d.id}: ${d.enS}`)
}

// ── FAQs — create rows then upsert locales ────────────────────────────────
console.log('\n── FAQs ─────────────────────────────────')
const FAQS = [
  { cat: 'general',      ord: 1,
    enQ: "What are Orienda Hospital's visiting hours?",
    enA: "Orienda International Hospital is open 24/7. Emergency services operate around the clock. General outpatient hours are Monday–Saturday, 8:00 AM to 6:00 PM.",
    zhQ: "欧瑞达医院的开放时间是什么？",
    zhA: "欧瑞达国际医院全天候开放。急诊科24小时运营。普通门诊时间为周一至周六上午8:00至下午6:00。",
    kmQ: "តើម៉ោងបើកនៃមន្ទីរពេទ្យ Orienda គឺម៉ោងណា?",
    kmA: "មន្ទីរពេទ្យ Orienda បើកចំហ 24/7 ។ ផ្នែកបន្ទាន់ដំណើរការពេញ 24 ម៉ោង។ ម៉ោងពេទ្យទូទៅ ចន្ទ-សៅរ៍ ម៉ោង 8:00–18:00។" },
  { cat: 'appointments', ord: 2,
    enQ: "How do I book an appointment?",
    enA: "Book online through our website, call (+855) 018 593 789, or visit our reception desk. Staff are available 24/7.",
    zhQ: "如何预约就诊？",
    zhA: "您可以通过我们的网站在线预约，拨打 (+855) 018 593 789，或亲临接待处预约。工作人员24小时为您服务。",
    kmQ: "តើខ្ញុំអាចណាត់ជួបដោយរបៀបណា?",
    kmA: "ណាត់ជួបតាមអ៊ីនធឺណិត ឬទូរស័ព្ទ (+855) 018 593 789 ឬទស្សនការផ្ទាល់ខ្លួន។ បុគ្គលិករបស់យើងផ្ដល់សេវា 24/7។" },
  { cat: 'insurance',    ord: 3,
    enQ: "Do you accept international insurance?",
    enA: "Yes, we work with major international and local insurance providers. Bring your insurance card and policy documents. Contact our billing department for the full list.",
    zhQ: "你们接受国际医疗保险吗？",
    zhA: "是的，我们与主要国际及本地保险公司合作。就诊时请携带保险卡及保险文件。如需完整承保列表，请联系账单部门。",
    kmQ: "តើអ្នកទទួលយកធានារ៉ាប់រងអន្តរជាតិទេ?",
    kmA: "បាទ/ចាស យើងធ្វើការជាមួយក្រុមហ៊ុនធានារ៉ាប់រងអន្តរជាតិ និងក្នុងស្រុក។ សូមនាំប័ណ្ណធានារ៉ាប់រង និងឯកសារ​។" },
  { cat: 'general',      ord: 4,
    enQ: "What should I bring to my first visit?",
    enA: "Bring a valid ID or passport, your insurance card (if applicable), any previous medical records or test results, and a list of current medications.",
    zhQ: "初次就诊需要携带哪些材料？",
    zhA: "请携带有效身份证或护照、保险卡（如适用）、以往病历或检查结果，以及当前用药清单。",
    kmQ: "តើខ្ញុំត្រូវយកអ្វីទៅនៅការទស្សនាដំបូង?",
    kmA: "សូមយកអត្តសញ្ញាណប័ណ្ណ ប័ណ្ណធានារ៉ាប់រង ឯកសារវេជ្ជសាស្ត្រពីមុន និងបញ្ជីថ្នាំដែលកំពុងប្រើ។" },
  { cat: 'services',     ord: 5,
    enQ: "Does Orienda Hospital have 24/7 emergency services?",
    enA: "Yes, our Emergency Department operates 24 hours, 365 days. We have a trauma team, ICU, and emergency ambulances. Call (+855) 023 232 789 for emergencies.",
    zhQ: "欧瑞达医院有24小时急诊服务吗？",
    zhA: "是的，急诊科全年365天24小时运营，配备专业创伤团队、重症监护室（ICU）和急救救护车。紧急情况请拨打 (+855) 023 232 789。",
    kmQ: "តើមន្ទីរពេទ្យ Orienda មានសេវាបន្ទាន់ 24/7 ទេ?",
    kmA: "បាទ/ចាស ផ្នែកបន្ទាន់ដំណើរការ 24 ម៉ោង 365 ថ្ងៃ មាន ICU និងរថយន្តសង្គ្រោះ។ ទូរស័ព្ទ (+855) 023 232 789 ។" },
  { cat: 'general',      ord: 6,
    enQ: "What languages does your staff speak?",
    enA: "Our staff are fluent in Khmer, English, and Mandarin Chinese. Interpreters for other languages are available upon request.",
    zhQ: "你们的工作人员会说哪些语言？",
    zhA: "我们的工作人员能流利使用高棉语、英语和普通话。根据需要可提供其他语言口译服务。",
    kmQ: "តើបុគ្គលិករបស់អ្នកនិយាយភាសាអ្វីខ្លះ?",
    kmA: "បុគ្គលិករបស់យើងស្ទាត់ជំនាញភាសាខ្មែរ អង់គ្លេស និងចិន (ម៉ាន់ដារីន)។ ភាសាផ្សេងៗមានតាមការស្នើ។" },
]

for (const faq of FAQS) {
  // check if exists
  const existing = await db.query(`SELECT id FROM payload.faqs WHERE _status='published' LIMIT 1 OFFSET ${FAQS.indexOf(faq)}`)
  let faqId: number
  const all = await db.query(`SELECT id FROM payload.faqs ORDER BY "order" ASC NULLS LAST`)
  if (all.rows.length > FAQS.indexOf(faq)) {
    faqId = all.rows[FAQS.indexOf(faq)].id as number
    console.log(`  ~ updating faq ${faqId}`)
  } else {
    const ins = await db.query(
      `INSERT INTO payload.faqs (category, "order", _status, created_at, updated_at) VALUES ($1, $2, 'published', NOW(), NOW()) RETURNING id`,
      [faq.cat, faq.ord]
    )
    faqId = ins.rows[0].id as number
    console.log(`  ✓ created faq ${faqId}`)
  }
  await upsertLocale('faqs_locales', faqId, 'en', { question: faq.enQ, answer: rtJson(faq.enA) })
  await upsertLocale('faqs_locales', faqId, 'zh', { question: faq.zhQ, answer: rtJson(faq.zhA) })
  await upsertLocale('faqs_locales', faqId, 'km', { question: faq.kmQ, answer: rtJson(faq.kmA) })
}

// ── Services — create + translate ─────────────────────────────────────────
console.log('\n── Services ────────────────────────────')
const SVCS = [
  { slug: 'complete-blood-count', dept: 5,  en: ['Complete Blood Count',    'Full analysis of red cells, white cells, and platelets.'], zh: ['全血细胞计数',   '全面分析红细胞、白细胞和血小板。'], km: ['ការរាប់ឈាម',       'ការវិភាគពេញលេញនៃកោសិកាឈាម'] },
  { slug: 'urinalysis',           dept: 5,  en: ['Urinalysis',               'Laboratory urine examination for kidney and metabolic health.'], zh: ['尿液分析',        '实验室尿液检查，评估肾脏和代谢健康。'], km: ['ការពិនិត្យទឹកនោម', 'ការពិនិត្យទឹកនោមសម្រាប់សុខភាពតម្រងនោម'] },
  { slug: 'chest-xray',          dept: 5,  en: ['Chest X-Ray',              'Imaging of the chest to detect lung and cardiac conditions.'], zh: ['胸部X光',         '胸部影像检查，检测肺部和心脏疾病。'], km: ['ថតX-ray ទ្រូង',    'ការថតបង្ហាញរូបភាពទ្រូង ដើម្បីរកជំងឺសួត'] },
  { slug: 'ecg',                  dept: 20, en: ['ECG / Electrocardiogram',  'Records heart electrical activity to detect arrhythmias.'], zh: ['心电图 (ECG)',    '记录心脏电活动，检测心律失常。'], km: ['ECG បេះដូង',       'ការកត់ត្រាចរន្តអគ្គិសនីបេះដូង'] },
  { slug: 'echocardiogram',      dept: 20, en: ['Echocardiogram',           'Ultrasound imaging of the heart to assess structure and function.'], zh: ['超声心动图',      '心脏超声波检查，评估心脏结构和功能。'], km: ['Echocardiogram',  'ការថតUltrasound បេះដូង'] },
  { slug: 'lipid-panel',         dept: 20, en: ['Lipid Blood Panel',        'Measures cholesterol and triglycerides for cardiovascular risk.'], zh: ['血脂检测',        '测量胆固醇和甘油三酯，评估心血管风险。'], km: ['ការពិនិត្យខ្លាញ់ឈាម', 'វាស់ cholesterol ដើម្បីវាយតម្លៃហានិភ័យបេះដូង'] },
  { slug: 'pelvic-exam',         dept: 15, en: ['Pelvic Examination',       "Comprehensive gynecological exam for women's reproductive health."], zh: ['盆腔检查',        '全面妇科检查，评估女性生殖健康。'], km: ['ការពិនិត្យ Pelvic',  'ការពិនិត្យរោគស្ត្រីទូលំទូលាយ'] },
  { slug: 'breast-exam',         dept: 15, en: ['Breast Examination',       'Clinical breast exam and mammography for early detection.'], zh: ['乳房检查',        '临床乳房检查和乳房X光，用于早期发现。'], km: ['ការពិនិត្យដើមទ្រូង', 'ការពិនិត្យ Mammography ដើម្បីរករកបានមុនដំបូង'] },
  { slug: 'pelvic-ultrasound',   dept: 15, en: ['Pelvic Ultrasound',        'Ultrasound scan of uterus and ovaries.'], zh: ['盆腔超声波',      '子宫和卵巢超声波扫描。'], km: ['Ultrasound Pelvic', 'ការស្កែន Ultrasound ស្បូន និងអំបូររបស់ស្ត្រី'] },
]

const svcIdMap: Record<string, number> = {}
for (const s of SVCS) {
  const ex = await db.query(`SELECT id FROM payload.services WHERE slug=$1 LIMIT 1`, [s.slug])
  let svcId: number
  if (ex.rows.length) {
    svcId = ex.rows[0].id as number
    await db.query(`UPDATE payload.services SET department_id=$1, _status='published', updated_at=NOW() WHERE id=$2`, [s.dept, svcId])
    console.log(`  ~ service exists: ${s.slug} (${svcId})`)
  } else {
    const ins = await db.query(
      `INSERT INTO payload.services (slug, department_id, _status, created_at, updated_at) VALUES ($1, $2, 'published', NOW(), NOW()) RETURNING id`,
      [s.slug, s.dept]
    )
    svcId = ins.rows[0].id as number
    console.log(`  ✓ created service: ${s.slug} (${svcId})`)
  }
  svcIdMap[s.slug] = svcId
  await upsertLocale('services_locales', svcId, 'en', { title: s.en[0], description: rtJson(s.en[1]) })
  await upsertLocale('services_locales', svcId, 'zh', { title: s.zh[0], description: rtJson(s.zh[1]) })
  await upsertLocale('services_locales', svcId, 'km', { title: s.km[0], description: rtJson(s.km[1]) })
}

// ── Service packages — link dept + services ───────────────────────────────
console.log('\n── Service Packages (link) ─────────────')
const PKG_LINKS = [
  { id: 3, dept: 5,  svcs: ['complete-blood-count', 'urinalysis', 'chest-xray'] },
  { id: 2, dept: 20, svcs: ['ecg', 'echocardiogram', 'lipid-panel'] },
  { id: 1, dept: 15, svcs: ['pelvic-exam', 'breast-exam', 'pelvic-ultrasound'] },
]
for (const p of PKG_LINKS) {
  await db.query(`UPDATE payload.service_packages SET department_id=$1, updated_at=NOW() WHERE id=$2`, [p.dept, p.id])
  await db.query(`DELETE FROM payload.service_packages_rels WHERE parent_id=$1 AND path='services'`, [p.id])
  for (let i = 0; i < p.svcs.length; i++) {
    const svcId = svcIdMap[p.svcs[i]]
    if (svcId) await db.query(
      `INSERT INTO payload.service_packages_rels (parent_id, path, services_id, "order") VALUES ($1, 'services', $2, $3)`,
      [p.id, svcId, i + 1]
    )
  }
  console.log(`  ✓ package ${p.id} → dept ${p.dept} + ${p.svcs.length} services`)
}

await db.end()
console.log('\nAll done.')
process.exit(0)
