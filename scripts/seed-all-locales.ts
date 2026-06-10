import { getPayloadClient } from '../src/lib/payload'

function richText(text: string) {
  return {
    root: {
      type: 'root', format: '', indent: 0, version: 1,
      direction: 'ltr',
      children: [{
        type: 'paragraph', format: '', indent: 0, version: 1,
        direction: 'ltr', textStyle: '', textFormat: 0,
        children: [{ mode: 'normal', text, type: 'text', style: '', detail: 0, format: 0, version: 1 }],
      }],
    },
  }
}

// ── Promotions ───────────────────────────────────────────────────────────────

const PROMOTIONS: {
  id: string
  en: { title: string; description: string }
  zh: { title: string; description: string }
  km: { title: string; description: string }
}[] = [
  {
    id: '1',
    en: {
      title: 'Surgery Package — 25% Off',
      description: 'Save 25% on selected surgical procedures at Orienda International Hospital. Valid for consultations booked before December 31, 2026.',
    },
    zh: {
      title: '手术套餐优惠25%',
      description: '欧瑞达国际医院精选外科手术项目享受75折优惠。优惠适用于2026年12月31日前预约的咨询。',
    },
    km: {
      title: 'កញ្ចប់វះកាត់ បញ្ចុះថ្លៃ 25%',
      description: 'សន្សំ 25% សម្រាប់សេវាវះកាត់ដែលបានជ្រើសរើសនៅមន្ទីរពេទ្យអន្តរជាតិ Orienda។ ត្រឹមថ្ងៃទី 31 ខែធ្នូ ឆ្នាំ 2026។',
    },
  },
  {
    id: '2',
    en: {
      title: 'Free Eye Screening',
      description: 'Complimentary eye screening for all patients. Includes vision acuity test, intraocular pressure check, and specialist consultation.',
    },
    zh: {
      title: '免费眼部检查',
      description: '为所有患者提供免费眼部筛查，包括视力测试、眼压检查及专科医生咨询。',
    },
    km: {
      title: 'ពិនិត្យភ្នែកឥតគិតថ្លៃ',
      description: 'ការពិនិត្យភ្នែកឥតគិតថ្លៃសម្រាប់អ្នកជំងឺទាំងអស់ រួមមានការធ្វើតេស្តការមើលឃើញ ការចំនុចបំពង់ភ្នែក និងការពិគ្រោះជាមួយគ្រូពេទ្យឯកទេស។',
    },
  },
  {
    id: '3',
    en: {
      title: 'Dental Cleaning Package',
      description: 'Professional dental cleaning and oral health assessment at a special rate. Includes scaling, polishing, and fluoride treatment.',
    },
    zh: {
      title: '专业牙齿清洁套餐',
      description: '以优惠价格提供专业牙齿清洁及口腔健康评估，包括洗牙、抛光及氟化物护理。',
    },
    km: {
      title: 'កញ្ចប់សម្អាតធ្មេញ',
      description: 'ការសម្អាតធ្មេញដោយវិជ្ជាជីវៈ និងការវាយតម្លៃសុខភាពមាត់ក្នុងតម្លៃពិសេស រួមមានការដូសក្ដារ ការPolish និងការព្យាបាលដោយ fluoride។',
    },
  },
  {
    id: '4',
    en: {
      title: 'Maternity Care Package',
      description: 'Comprehensive prenatal and postnatal care package for expecting mothers. Includes regular check-ups, ultrasound scans, and newborn screening.',
    },
    zh: {
      title: '孕产妇全程护理套餐',
      description: '为准妈妈提供全面的产前及产后护理套餐，包括定期检查、超声波扫描及新生儿筛查。',
    },
    km: {
      title: 'កញ្ចប់ការថែទាំមានផ្ទៃពោះ',
      description: 'កញ្ចប់ការថែទាំមុន និងក្រោយសម្រាលកូនយ៉ាងទូលំទូលាយ រួមមានការពិនិត្យទៀងទាត់ ការស្កែន Ultrasound និងការ​ត្រួតពិនិត្យទារក។',
    },
  },
  {
    id: '5',
    en: {
      title: 'General Health Checkup',
      description: 'Thorough full-body health assessment covering blood tests, chest X-ray, ECG, and physician consultation. Ideal for annual screening.',
    },
    zh: {
      title: '全面身体健康检查',
      description: '全面的全身健康评估，涵盖血液检查、胸部X光、心电图及医生会诊，适合年度体检。',
    },
    km: {
      title: 'ការពិនិត្យសុខភាពទូទៅ',
      description: 'ការវាយតម្លៃសុខភាពរាងកាយទូទៅ រួមមានការធ្វើតេស្តឈាម ការថតកាំរស្មី X លើទ្រូង ECG និងការពិគ្រោះជាមួយគ្រូពេទ្យ។ល។',
    },
  },
]

// ── Service Packages ──────────────────────────────────────────────────────────

const PACKAGES: {
  id: string
  en: { title: string; description: string; priceLabel: string }
  zh: { title: string; description: string; priceLabel: string }
  km: { title: string; description: string; priceLabel: string }
}[] = [
  {
    id: '1',
    en: {
      title: "Women's Health Package",
      description: 'Comprehensive health screening designed for women, including gynecology, breast examination, pelvic ultrasound, and blood panel.',
      priceLabel: '$150',
    },
    zh: {
      title: '女性健康全面套餐',
      description: '专为女性设计的全面健康筛查，包括妇科检查、乳房检查、盆腔超声波及血液化验。',
      priceLabel: '$150',
    },
    km: {
      title: 'កញ្ចប់សុខភាពស្ត្រី',
      description: 'ការពិនិត្យសុខភាពទូលំទូលាយសម្រាប់ស្ត្រី រួមមានការពិនិត្យរោគស្ត្រី ការពិនិត្យដើមទ្រូង ការស្កែន Ultrasound និងការពិនិត្យឈាម។',
      priceLabel: '$150',
    },
  },
  {
    id: '2',
    en: {
      title: 'Heart Health Screening',
      description: 'Advanced cardiac evaluation including ECG, echocardiogram, lipid panel, and consultation with a cardiologist.',
      priceLabel: '$200',
    },
    zh: {
      title: '心脏健康全面筛查',
      description: '高级心脏评估，包括心电图、超声心动图、血脂检测及心脏科医生会诊。',
      priceLabel: '$200',
    },
    km: {
      title: 'ការពិនិត្យសុខភាពបេះដូង',
      description: 'ការវាយតម្លៃបេះដូងកម្រិតខ្ពស់ រួមមាន ECG echocardiogram ការពិនិត្យ lipid និងការពិគ្រោះជាមួយគ្រូពេទ្យឯកទេស។',
      priceLabel: '$200',
    },
  },
  {
    id: '3',
    en: {
      title: 'Annual Health Checkup',
      description: 'Complete annual physical examination including blood count, liver and kidney function tests, urinalysis, and chest X-ray.',
      priceLabel: '$99',
    },
    zh: {
      title: '年度全面健康体检',
      description: '完整的年度体检，包括血常规、肝肾功能检查、尿液分析及胸部X光检查。',
      priceLabel: '$99',
    },
    km: {
      title: 'ការពិនិត្យសុខភាពប្រចាំឆ្នាំ',
      description: 'ការពិនិត្យរាងកាយប្រចាំឆ្នាំពេញលេញ រួមមានការរាប់ឈាម ការធ្វើតេស្តមុខងារថ្លើម និងតម្រងនោម ការវិភាគទឹកនោម និងការថតX-ray ទ្រូង។',
      priceLabel: '$99',
    },
  },
]

// ── Runner ────────────────────────────────────────────────────────────────────

async function main() {
  const payload = await getPayloadClient()

  console.log('\n── Promotions ──────────────────────────')
  for (const p of PROMOTIONS) {
    for (const locale of ['en', 'zh', 'km'] as const) {
      await (payload.update as any)({
        collection: 'promotions',
        id: p.id,
        locale,
        data: {
          title: p[locale].title,
          description: richText(p[locale].description),
        },
      })
      console.log(`  ✓ [${locale}] promo ${p.id}: ${p[locale].title}`)
    }
  }

  console.log('\n── Service Packages ────────────────────')
  for (const p of PACKAGES) {
    for (const locale of ['en', 'zh', 'km'] as const) {
      await (payload.update as any)({
        collection: 'service-packages',
        id: p.id,
        locale,
        data: {
          title: p[locale].title,
          description: richText(p[locale].description),
          priceLabel: p[locale].priceLabel,
        },
      })
      console.log(`  ✓ [${locale}] package ${p.id}: ${p[locale].title}`)
    }
  }

  console.log('\nDone.')
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
