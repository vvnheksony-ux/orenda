import { getPayload } from 'payload'
import config from '../payload.config'

function rt(text: string) {
  return { root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textStyle: '', textFormat: 0, children: [{ mode: 'normal', text, type: 'text', style: '', detail: 0, format: 0, version: 1 }] }] } }
}

// ── Health Tips ────────────────────────────────────────────────────────────
const HEALTH_TIPS = [
  {
    slug: 'foods-that-boost-heart-health',
    category: 'Nutrition',
    readingTime: 5,
    tags: ['heart', 'nutrition', 'diet'],
    en: {
      title: '5 Foods That Boost Your Heart Health',
      excerpt: 'Simple dietary changes can dramatically improve cardiovascular health. Discover the top five heart-friendly foods recommended by Orienda cardiologists.',
      body: 'Eating the right foods is one of the most powerful ways to protect your heart. Orienda International Hospital cardiologists recommend incorporating these five foods into your daily diet: fatty fish like salmon and mackerel rich in omega-3 fatty acids; colorful berries packed with antioxidants that reduce inflammation; leafy greens such as spinach and kale high in vitamin K; oats and whole grains that lower LDL cholesterol; and nuts like walnuts and almonds that support healthy blood pressure. Small consistent changes in your diet can significantly reduce your risk of heart disease over time.',
    },
    zh: {
      title: '5种促进心脏健康的食物',
      excerpt: '简单的饮食改变可以显著改善心血管健康。了解欧瑞达心脏科医生推荐的五大对心脏友好的食物。',
      body: '摄入正确的食物是保护心脏最有效的方式之一。欧瑞达国际医院心脏科医生建议每日饮食中加入以下五种食物：富含omega-3脂肪酸的鲑鱼和鲭鱼等油性鱼类；富含抗氧化剂的彩色浆果；富含维生素K的菠菜和羽衣甘蓝等绿叶蔬菜；降低低密度脂蛋白胆固醇的燕麦和全谷物；以及支持健康血压的核桃和杏仁等坚果。饮食上的小改变可以显著降低患心脏病的风险。',
    },
    km: {
      title: 'អាហារ ៥ ប្រភេទដែលជំរុញសុខភាពបេះដូងរបស់អ្នក',
      excerpt: 'ការផ្លាស់ប្ដូររបបអាហារសាមញ្ញអាចធ្វើអោយសុខភាពបេះដូងប្រសើរឡើងគួរសម។ រកឱ្យដឹងពីអាហារ ៥ ប្រភេទដែលអ្នកឯកទេសបេះដូងនៃ Orienda ណែនាំ។',
      body: 'ការញ៉ាំអាហារត្រឹមត្រូវគឺជាវិធីសាស្ត្រមួយក្នុងចំណោមវិធីដ៏មានឥទ្ធិពលបំផុតដើម្បីការពារបេះដូងរបស់អ្នក។ អ្នកឯកទេសបេះដូងនៃមន្ទីរពេទ្យអន្តរជាតិ Orienda ណែនាំឱ្យបញ្ចូលអាហារទាំង ៥ ប្រភេទនេះទៅក្នុងរបបអាហារប្រចាំថ្ងៃ៖ ត្រីខ្លាញ់ដូចជាត្រីសាម៉ុន និងត្រីម៉ាឃើលដែលសម្បូរ omega-3; ផ្លែប្រហំពណ៌ស្រស់ស្ថិតនៅ antioxidant; បន្លែស្លឹកបៃតង ដូចជា spinach និង kale; ស្រូវសាលី និងធញ្ញជាតិ; ផ្លែបឹង និងអាម៉ង់។ ការផ្លាស់ប្ដូររបបអាហារបន្តិចម្ដងៗអាចកាត់បន្ថយហានិភ័យជំងឺបេះដូងបានយ៉ាងច្រើន។',
    },
  },
  {
    slug: 'benefits-of-daily-walking',
    category: 'Exercise',
    readingTime: 4,
    tags: ['exercise', 'walking', 'fitness'],
    en: {
      title: 'The Benefits of 30 Minutes of Daily Walking',
      excerpt: 'Walking is one of the simplest and most effective exercises available to everyone. Learn how just 30 minutes a day can transform your health.',
      body: 'You do not need a gym membership to stay healthy. Walking 30 minutes each day delivers remarkable health benefits that many people overlook. Regular daily walking strengthens the heart and reduces the risk of cardiovascular disease by up to 35%. It helps maintain healthy body weight, improves blood sugar control, and reduces the risk of type 2 diabetes. Walking also boosts mood by releasing endorphins and reduces symptoms of anxiety and depression. It strengthens bones and muscles, reducing the risk of osteoporosis. For those with joint pain, brisk walking on flat surfaces is a low-impact way to stay active without added strain. Start with 10 minutes and build up gradually.',
    },
    zh: {
      title: '每日步行30分钟的好处',
      excerpt: '步行是所有人都能做到的最简单、最有效的运动之一。了解每天仅30分钟如何改变您的健康状况。',
      body: '保持健康不需要健身房会员资格。每天步行30分钟可以带来许多人忽视的显著健康益处。规律的日常步行能强健心脏，将心血管疾病风险降低高达35%。它有助于维持健康体重、改善血糖控制并降低2型糖尿病风险。步行还能通过释放内啡肽来提升情绪，减轻焦虑和抑郁症状。它能强化骨骼和肌肉，降低骨质疏松的风险。对于有关节疼痛的人，在平坦地面快走是一种低冲击的保持活动方式。从10分钟开始，逐渐增加时间。',
    },
    km: {
      title: 'អត្ថប្រយោជន៍នៃការដើរ ៣០ នាទីប្រចាំថ្ងៃ',
      excerpt: 'ការដើរគឺជាលំហាត់ប្រាណដ៏សាមញ្ញ និងមានប្រសិទ្ធភាពបំផុតសម្រាប់មនុស្សគ្រប់រូប។ ស្វែងយល់ពីរបៀបដែលការដើរត្រឹម ៣០ នាទីក្នុងមួយថ្ងៃអាចផ្លាស់ប្ដូរសុខភាពរបស់អ្នក។',
      body: 'អ្នកមិនត្រូវការសមាជិកភាពកន្លែងហាត់ប្រាណដើម្បីរក្សាសុខភាពទេ។ ការដើរ ៣០ នាទីក្នុងមួយថ្ងៃផ្ដល់អត្ថប្រយោជន៍ដ៏ស្ថិតស្ថេរ។ ការដើរប្រចាំថ្ងៃ ពង្រឹងបេះដូង កាត់បន្ថយហានិភ័យជំងឺបេះដូង ជំរុញការគ្រប់គ្រងជាតិស្ករ និងបន្ថយហានិភ័យជំងឺទឹកនោមផ្អែម ប្រភេទ ២។ ការដើរក៏ជំរុញអារម្មណ៍ល្អ ដោយបន្ថយរោគសញ្ញាបារម្ភ និងជំងឺធ្លាក់ទឹកចិត្ត។ ចាប់ផ្ដើមពី ១០ នាទី ហើយបង្កើនបន្ដិចម្ដងៗ។',
    },
  },
  {
    slug: 'managing-stress-simple-techniques',
    category: 'Mental Health',
    readingTime: 6,
    tags: ['stress', 'mental-health', 'wellness'],
    en: {
      title: 'Managing Stress: Simple Techniques That Work',
      excerpt: 'Chronic stress silently damages your physical and mental health. Orienda mental health specialists share practical, evidence-based stress management strategies.',
      body: 'Stress is a natural part of life, but chronic stress takes a serious toll on both mind and body. It raises blood pressure, weakens the immune system, disrupts sleep, and contributes to anxiety and depression. The good news is that simple, science-backed techniques can significantly reduce stress levels. Deep breathing exercises activate the parasympathetic nervous system, slowing the heart rate within minutes. Progressive muscle relaxation helps release physical tension stored in the body. Mindfulness meditation, practiced for as little as 10 minutes daily, reduces cortisol levels measurably. Regular physical activity is one of the most powerful stress relievers available. Finally, maintaining social connections and seeking professional support when needed are essential components of long-term mental wellness. Orienda International Hospital offers mental health consultations for those struggling with chronic stress.',
    },
    zh: {
      title: '压力管理：简单有效的技巧',
      excerpt: '慢性压力悄悄损害您的身心健康。欧瑞达心理健康专家分享实用的、循证的压力管理策略。',
      body: '压力是生活的自然组成部分，但慢性压力对身心都有严重影响。它会升高血压、削弱免疫系统、扰乱睡眠，并引发焦虑和抑郁。好消息是，简单的科学技巧可以显著降低压力水平。深呼吸练习能激活副交感神经系统，在几分钟内减慢心率。渐进式肌肉放松有助于释放储存在身体中的紧张感。正念冥想，每天仅需10分钟，可以显著降低皮质醇水平。规律体育锻炼是最有效的减压方式之一。保持社会联系并在需要时寻求专业支持也是长期心理健康的关键。欧瑞达国际医院为饱受慢性压力困扰的人士提供心理健康咨询服务。',
    },
    km: {
      title: 'ការគ្រប់គ្រងភាពតានតឹង: បច្ចេកទេសសាមញ្ញដែលមានប្រសិទ្ធភាព',
      excerpt: 'ភាពតានតឹងរ៉ាំរ៉ៃបំផ្លាញសុខភាពផ្លូវកាយ និងផ្លូវចិត្តរបស់អ្នកដោយស្ងាត់ស្ងៀម។ អ្នកឯកទេសសុខភាពផ្លូវចិត្ត Orienda ចែករំលែកយុទ្ធសាស្ត្រគ្រប់គ្រងភាពតានតឹងដែលមានអត្ថស្នូល។',
      body: 'ភាពតានតឹងជាផ្នែកធម្មជាតិនៃជីវិត ប៉ុន្តែភាពតានតឹងរ៉ាំរ៉ៃប៉ះពាល់ខ្លាំងទៅដល់ទាំងផ្លូវកាយ និងផ្លូវចិត្ត។ វាបង្កើនសម្ពាធឈាម បន្ថយប្រព័ន្ធភាពស៊ាំ ខូចដំណេក និងរួមចំណែកដល់ការថប់បារម្ភ។ ការដកដង្ហើមជ្រៅ ការបន្ធូរបន្ថយសាច់ដុំ និងការគ្រប់គ្រងការដឹងខ្លួន ១០ នាទីប្រចាំថ្ងៃ ល្មមបន្ថយកម្រិត cortisol។ សកម្មភាពរាងកាយជាប្រចាំក៏ជាមធ្យោបាយបន្ថែមភាពតានតឹងដ៏ខ្លាំងពូកែ។',
    },
  },
  {
    slug: 'annual-health-screenings-adults',
    category: 'Preventive Care',
    readingTime: 7,
    tags: ['screening', 'prevention', 'checkup'],
    en: {
      title: 'Annual Health Screenings Every Adult Needs',
      excerpt: 'Preventive screenings catch diseases before symptoms appear. This guide covers the essential annual tests recommended for adults by Orienda physicians.',
      body: 'Prevention is far more effective than treatment. Annual health screenings detect conditions like hypertension, diabetes, high cholesterol, and certain cancers in their earliest and most treatable stages. Every adult should have blood pressure checked at least once yearly, as hypertension often presents no symptoms. A fasting blood glucose or HbA1c test screens for diabetes and prediabetes. A lipid panel assesses cardiovascular risk through cholesterol levels. Women should receive annual breast exams and Pap smears from age 21 every three years. Men over 50 should discuss prostate cancer screening with their doctor. Colorectal cancer screening is recommended for all adults from age 45. Eye and dental exams, along with skin cancer checks, complete a comprehensive annual health review. Orienda International Hospital offers comprehensive health screening packages tailored to age and risk factors.',
    },
    zh: {
      title: '每位成年人都需要的年度健康筛查',
      excerpt: '预防性筛查在症状出现之前发现疾病。本指南涵盖欧瑞达医生为成年人推荐的基本年度检查项目。',
      body: '预防远比治疗更有效。年度健康筛查能在最早期、最可治疗的阶段发现高血压、糖尿病、高胆固醇和某些癌症等疾病。每位成年人每年至少应检查一次血压，因为高血压通常没有症状。空腹血糖或HbA1c检测可筛查糖尿病和糖尿病前期。血脂检测通过胆固醇水平评估心血管风险。女性应从21岁起每年进行乳房检查，每三年进行一次宫颈涂片检查。50岁以上男性应与医生讨论前列腺癌筛查。建议所有45岁以上成年人进行结直肠癌筛查。欧瑞达国际医院提供根据年龄和风险因素定制的综合健康筛查套餐。',
    },
    km: {
      title: 'ការពិនិត្យសុខភាពប្រចាំឆ្នាំដែលមនុស្សពេញវ័យគ្រប់រូបត្រូវការ',
      excerpt: 'ការពិនិត្យបង្ការរកឃើញជំងឺមុនពេលរោគសញ្ញាលេចឡើង។ ការណែនាំនេះគ្របដណ្ដប់លើការធ្វើតេស្តប្រចាំឆ្នាំដែលត្រូវការ ដោយគ្រូពេទ្យ Orienda ណែនាំ។',
      body: 'ការបង្ការមានប្រសិទ្ធភាពជាងការព្យាបាលណាស់។ ការពិនិត្យសុខភាពប្រចាំឆ្នាំរកឃើញជំងឺ ដូចជា ជំងឺความดันโลหิตสูง ជំងឺទឹកនោមផ្អែម ជម្ងឺ cholesterol ខ្ពស់ នៅដំណាក់កាលដំបូង។ មនុស្សពេញវ័យគ្រប់រូបគួរពិនិត្យសម្ពាធឈាម កម្រិតជាតិស្ករ cholesterol រៀងរាល់ឆ្នាំ។ មន្ទីរពេទ្យ Orienda ផ្ដល់កញ្ចប់ពិនិត្យសុខភាពទូលំទូលាយ។',
    },
  },
  {
    slug: 'living-well-with-diabetes',
    category: 'Chronic Disease',
    readingTime: 8,
    tags: ['diabetes', 'blood-sugar', 'chronic-disease'],
    en: {
      title: 'Living Well with Diabetes: Daily Management Tips',
      excerpt: 'Diabetes is a lifelong condition, but with the right habits, people with diabetes can live full, healthy lives. Orienda endocrinologists share proven daily management strategies.',
      body: 'A diabetes diagnosis can feel overwhelming, but it does not define the limits of your life. Millions of people manage diabetes successfully every day with consistent habits and the right medical support. Blood sugar monitoring is the cornerstone of diabetes management — understanding your patterns allows you to make smart food and activity choices. Carbohydrate counting helps maintain stable blood glucose levels throughout the day. Physical activity improves insulin sensitivity significantly, even a 15-minute walk after meals can lower post-meal blood sugar spikes. Medication adherence is critical — never skip doses or adjust insulin without consulting your physician. Stress management matters too, as stress hormones raise blood glucose directly. Regular follow-ups with your endocrinologist, ophthalmologist, nephrologist, and podiatrist catch complications early. Orienda International Hospital\'s Endocrine and Diabetic Center provides comprehensive diabetes care including education programs, nutritional counseling, and specialist consultations.',
    },
    zh: {
      title: '与糖尿病共同生活：日常管理技巧',
      excerpt: '糖尿病是终身疾病，但有了正确的习惯，糖尿病患者可以过上充实健康的生活。欧瑞达内分泌科医生分享经过验证的日常管理策略。',
      body: '糖尿病诊断可能令人不知所措，但它并不决定您生活的极限。每天都有数百万人成功管理糖尿病。血糖监测是糖尿病管理的基石。碳水化合物计数有助于全天保持稳定的血糖水平。体育锻炼显著提高胰岛素敏感性，饭后15分钟的散步也可以降低餐后血糖峰值。严格遵医嘱用药至关重要，切勿在未咨询医生的情况下跳过剂量或调整胰岛素。欧瑞达国际医院内分泌和糖尿病中心提供全面的糖尿病护理，包括教育项目、营养咨询和专科医生会诊。',
    },
    km: {
      title: 'ការរស់នៅយ៉ាងល្អជាមួយជំងឺទឹកនោមផ្អែម: គន្លឹះគ្រប់គ្រងប្រចាំថ្ងៃ',
      excerpt: 'ជំងឺទឹកនោមផ្អែមជាជំងឺពេញមួយជីវិត ប៉ុន្តែជាមួយទម្លាប់ត្រឹមត្រូវ អ្នកអាចរស់នៅបានល្អ និងមានសុខភាពល្អ។ អ្នកឯកទេស Orienda ចែករំលែកយុទ្ធសាស្ត្រគ្រប់គ្រងប្រចាំថ្ងៃ។',
      body: 'ការត្រួតពិនិត្យជាតិស្ករក្នុងឈាមគឺជារឿងសំខាន់បំផុតក្នុងការគ្រប់គ្រងជំងឺទឹកនោមផ្អែម។ ការរាប់កាបូអ៊ីដ្រាត ការហាត់ប្រាណ និងការប្រើថ្នាំឱ្យបានត្រឹមត្រូវ ជួយរក្សាកម្រិតជាតិស្ករឱ្យស្ថិតស្ថេរ។ ការតាមដានជាប្រចាំជាមួយអ្នកឯកទេស endocrinology ការត្រួតពិនិត្យភ្នែក និងជើងជួយចាប់ការខូចខាតមុន។ មណ្ឌលជំងឺ Endocrine and Diabetic នៃ Orienda ផ្ដល់ការថែទាំ និងការអប់រំជំងឺទឹកនោមផ្អែមទូលំទូលាយ។',
    },
  },
]

// ── Announcements ──────────────────────────────────────────────────────────
const ANNOUNCEMENTS = [
  {
    slug: 'new-maternity-ward-opening',
    priority: 'high',
    isBanner: true,
    bannerBackgroundColor: '#1a6fa8',
    startDate: '2026-06-10T00:00:00.000Z',
    endDate: '2026-06-30T00:00:00.000Z',
    title: 'Grand Opening: New State-of-the-Art Maternity Ward',
    excerpt: 'Orienda International Hospital proudly opens its newly expanded Maternity Ward on June 10, 2026, featuring 30 private birthing suites, a Level III NICU, and a dedicated postpartum recovery floor.',
    body: 'Orienda International Hospital is proud to announce the grand opening of our newly expanded Maternity Ward on June 10, 2026. The new facility features 30 private birthing suites equipped with modern fetal monitoring technology, a Level III Neonatal Intensive Care Unit capable of supporting the most premature infants, and a dedicated postpartum recovery floor with 24-hour nursing support. Our team of experienced obstetricians, midwives, and neonatal specialists are committed to providing the safest and most comfortable birthing experience in Cambodia. To celebrate the opening, we are offering complimentary prenatal consultations throughout June 2026. Contact our maternity department at +855 81 811 789 to schedule your visit.',
  },
  {
    slug: 'free-blood-pressure-screening',
    priority: 'medium',
    isBanner: false,
    startDate: '2026-06-15T00:00:00.000Z',
    endDate: '2026-06-22T00:00:00.000Z',
    title: 'Free Blood Pressure Screening Campaign — World Hypertension Day',
    excerpt: 'In observance of World Hypertension Day, Orienda International Hospital offers free blood pressure screenings to all community members at our main lobby from June 15–22, 2026.',
    body: 'Hypertension, or high blood pressure, affects over 1 billion people worldwide and is a leading cause of heart attack and stroke. Yet it is often called the "silent killer" because most people experience no symptoms. In observance of World Hypertension Day 2026, Orienda International Hospital is offering free blood pressure screenings at our main lobby every day from June 15 to June 22, 2026, between 8:00 AM and 4:00 PM. No appointment is required. Our nurses and cardiologists will be on hand to discuss results and provide lifestyle guidance. Those identified with elevated blood pressure will receive a discounted follow-up consultation voucher. We encourage everyone in the community to participate — knowing your numbers saves lives.',
  },
  {
    slug: 'holiday-operating-hours-2026',
    priority: 'low',
    isBanner: false,
    startDate: '2026-06-01T00:00:00.000Z',
    endDate: '2026-06-05T00:00:00.000Z',
    title: 'Operating Hours During National Holiday Period',
    excerpt: 'Orienda International Hospital will maintain full 24/7 emergency services during the upcoming national holiday period. Outpatient clinic hours will be adjusted for June 2–4.',
    body: 'Orienda International Hospital wishes all patients and community members a safe and joyful national holiday period. Please note the following adjusted outpatient clinic hours for June 2–4, 2026: Outpatient clinics will operate from 8:00 AM to 2:00 PM on June 2 and 3. Full outpatient services resume on June 5. Emergency services, ICU, NICU, and inpatient wards will operate at full capacity 24 hours a day throughout the holiday period. Pharmacy services will remain available around the clock. For urgent medical needs during the holiday, please proceed directly to our Emergency Department or call our emergency hotline at 023 232 789. We apologize for any inconvenience and thank you for your understanding.',
  },
]

// ── Careers ────────────────────────────────────────────────────────────────
// Department IDs from seed-master: 5=General Medicine, 8=Cardiology, 9=Physiotherapy, 2=Pediatrics & Neonatology
const CAREERS = [
  {
    slug: 'senior-registered-nurse',
    careerEmploymentType: 'full-time',
    experienceLevel: 'mid',
    salaryRange: '$600 – $900 / month',
    applicationDeadline: '2026-07-31T00:00:00.000Z',
    careerDepartment: 5,
    en: {
      title: 'Senior Registered Nurse',
      position: 'Senior Registered Nurse',
      excerpt: 'Orienda International Hospital seeks an experienced registered nurse to lead patient care in the General Medicine ward.',
      body: 'We are seeking a dedicated Senior Registered Nurse to join our General Medicine team. The successful candidate will deliver evidence-based nursing care, mentor junior nurses, coordinate with physicians on patient care plans, and ensure compliance with hospital protocols. A minimum of 3 years of clinical nursing experience and a valid Cambodian nursing license are required. Advanced nursing certification and experience in a hospital setting are strongly preferred. Orienda offers a competitive salary, professional development opportunities, and a supportive team environment.',
      requirements: 'Bachelor\'s Degree in Nursing or equivalent. Valid Cambodian nursing license. Minimum 3 years clinical nursing experience. Strong communication and teamwork skills. Proficiency in Khmer; English or Chinese is an advantage.',
      responsibilities: 'Deliver direct patient care according to physician orders and nursing care plans. Monitor patient vital signs and respond promptly to changes in condition. Administer medications and treatments safely and accurately. Mentor and supervise junior nursing staff. Maintain accurate and timely patient documentation. Collaborate with multidisciplinary care teams.',
    },
    zh: {
      title: '高级注册护士',
      position: '高级注册护士',
      excerpt: '欧瑞达国际医院诚聘一名经验丰富的注册护士，负责内科病房的患者护理工作。',
      body: '我们正在寻找一名敬业的高级注册护士加入我们的内科团队。成功候选人将提供循证护理、指导初级护士、与医生协调护理计划并确保符合医院规程。要求至少3年临床护理经验及有效的柬埔寨护理执照。',
      requirements: '护理学士学位或同等学历。有效的柬埔寨护理执照。至少3年临床护理经验。良好的沟通和团队合作能力。',
      responsibilities: '按照医嘱和护理计划提供直接患者护理。监测患者生命体征并及时应对病情变化。安全准确地给药和治疗。指导和监督初级护理人员。',
    },
    km: {
      title: 'គិលានុបដ្ឋាយិកាជាន់ខ្ពស់',
      position: 'គិលានុបដ្ឋាយិកាជាន់ខ្ពស់',
      excerpt: 'មន្ទីរពេទ្យអន្តរជាតិ Orienda ស្វែងរកគិលានុបដ្ឋាយិកាដែលមានបទពិសោធន៍ ដើម្បីដឹកនាំការថែទាំអ្នកជំងឺក្នុងជំងឺទូទៅ។',
      body: 'យើងស្វែងរកគិលានុបដ្ឋាយិកាជាន់ខ្ពស់ ដើម្បីចូលរួមក្នុងក្រុម General Medicine។ បេក្ខជនដែលជោគជ័យ នឹងផ្ដល់ការថែទាំអ្នកជំងឺ ណែនាំគិលានុបដ្ឋាយិកាកម្រិតទាប ហើយធ្វើការសហការណ៍ជាមួយពេទ្យ។',
      requirements: 'បរិញ្ញាបត្រ Nursing ឬដូចគ្នា។ អាជ្ញាប័ណ្ណ Nursing កម្ពុជា។ បទពិសោធន៍ Nursing ទំនើប ៣ ឆ្នាំ។',
      responsibilities: 'ផ្ដល់ការថែទាំផ្ទាល់ ព្យាបាលថ្នាំ ត្រួតពិនិត្យស្ថានភាពអ្នកជំងឺ និងសរសេរឯកសារ។',
    },
  },
  {
    slug: 'consultant-cardiologist',
    careerEmploymentType: 'full-time',
    experienceLevel: 'senior',
    salaryRange: '$3,000 – $5,000 / month',
    applicationDeadline: '2026-08-15T00:00:00.000Z',
    careerDepartment: 8,
    en: {
      title: 'Consultant Cardiologist',
      position: 'Consultant Cardiologist',
      excerpt: 'Orienda International Hospital is seeking a highly qualified Consultant Cardiologist to join our expanding Cardiology Department.',
      body: 'Orienda International Hospital invites applications from experienced cardiologists to join our team. The Consultant Cardiologist will manage inpatient and outpatient cardiology cases, perform and interpret diagnostic procedures including ECG, echocardiography, and stress testing, and collaborate on complex cardiac cases. Fellowship training in cardiology and a minimum of 5 years of post-residency experience are required. Experience with interventional cardiology is a significant advantage. Orienda offers an internationally competitive compensation package, modern cardiology equipment, and a collegial work environment.',
      requirements: 'Medical degree (MD or MBBS) with specialization in Cardiology. Board certification or equivalent. Minimum 5 years post-fellowship clinical experience. Competency in echocardiography, ECG interpretation, and cardiac catheterization. Valid Cambodian medical license or eligibility to obtain one.',
      responsibilities: 'Diagnose and manage cardiac conditions including heart failure, arrhythmias, coronary artery disease, and valvular disease. Perform and interpret echocardiograms, stress tests, and Holter monitors. Consult on inpatient cardiac cases across all wards. Participate in department quality improvement initiatives. Mentor resident physicians and medical students.',
    },
    zh: {
      title: '心脏科顾问医生',
      position: '心脏科顾问医生',
      excerpt: '欧瑞达国际医院诚聘一名资深心脏科顾问医生，加入我们不断扩大的心脏科团队。',
      body: '欧瑞达国际医院诚邀经验丰富的心脏科医生加入我们的团队。心脏科顾问医生将负责管理住院和门诊心脏病病例，执行和解读心电图、超声心动图等诊断程序，并就复杂心脏病例进行会诊。要求完成心脏科专科培训并有至少5年工作经验。',
      requirements: '医学学位（MD或MBBS）并专攻心脏科。委员会认证或同等资格。至少5年专科培训后临床经验。',
      responsibilities: '诊断和管理心脏病，包括心力衰竭、心律失常和冠状动脉疾病。执行超声心动图和压力测试。对各病房的住院心脏病例进行会诊。',
    },
    km: {
      title: 'គ្រូពេទ្យបេះដូងប្រឹក្សា',
      position: 'គ្រូពេទ្យបេះដូងប្រឹក្សា',
      excerpt: 'មន្ទីរពេទ្យអន្តរជាតិ Orienda ស្វែងរកគ្រូពេទ្យបេះដូងដែលមានគុណវុឌ្ឍិខ្ពស់ ដើម្បីចូលរួមក្នុងផ្នែកបេះដូង។',
      body: 'គ្រូពេទ្យបេះដូងប្រឹក្សា នឹងគ្រប់គ្រងករណីបេះដូង ធ្វើ ECG echocardiography និងតេស្ត stress ហើយធ្វើការដូចក្រុម។ ត្រូវការបទពិសោធន៍ ៥ ឆ្នាំ។',
      requirements: 'បណ្ណប័ត្រ cardiology ។ បទពិសោធន៍ ៥ ឆ្នាំ។ ជំនាញ echo ECG ។',
      responsibilities: 'រោគវិនិច្ឆ័យ និងព្យាបាលជំងឺបេះដូង ធ្វើ echocardiogram ពិគ្រោះករណីអ្នកជំងឺ។',
    },
  },
  {
    slug: 'medical-receptionist',
    careerEmploymentType: 'full-time',
    experienceLevel: 'entry',
    salaryRange: '$250 – $350 / month',
    applicationDeadline: '2026-07-15T00:00:00.000Z',
    careerDepartment: 5,
    en: {
      title: 'Medical Receptionist',
      position: 'Medical Receptionist',
      excerpt: 'Join Orienda International Hospital as a Medical Receptionist and be the welcoming face of our outpatient department.',
      body: 'Orienda International Hospital is looking for a friendly and organized Medical Receptionist to manage patient intake and appointment scheduling for our outpatient department. The role involves greeting patients and visitors, registering patients in the hospital information system, scheduling and confirming appointments, handling telephone inquiries professionally, and coordinating with clinical staff to ensure smooth patient flow. Strong customer service skills and basic computer literacy are essential. Proficiency in Khmer is required; English or Chinese language skills are a significant advantage in our multilingual hospital environment.',
      requirements: 'High school diploma or higher. Strong interpersonal and communication skills. Basic computer proficiency (Microsoft Office, data entry). Proficiency in Khmer; English or Chinese is an advantage. Previous hospital or customer service experience preferred but not required.',
      responsibilities: 'Welcome patients and direct them to appropriate departments. Register new patients and update existing records accurately. Schedule, reschedule, and confirm patient appointments. Handle incoming telephone calls with professionalism. Coordinate with nurses and doctors on appointment flow. Maintain confidentiality of all patient information.',
    },
    zh: {
      title: '医疗前台接待员',
      position: '医疗前台接待员',
      excerpt: '加入欧瑞达国际医院担任医疗前台接待员，成为我们门诊部的热情门面。',
      body: '欧瑞达国际医院正在寻找一名友善、有条理的医疗前台接待员，负责门诊部患者接待和预约安排工作。职责包括接待患者和访客、在医院信息系统中注册患者、安排和确认预约、专业处理电话咨询，以及与临床人员协调确保患者顺畅就诊。',
      requirements: '高中文凭或以上。良好的人际交往和沟通能力。基本计算机能力。通晓高棉语；英语或汉语为优先。',
      responsibilities: '欢迎患者并引导至适当科室。准确登记患者信息。安排患者预约。专业接听来电。',
    },
    km: {
      title: 'បុគ្គលិកទទួលភ្ញៀវវេជ្ជសាស្ត្រ',
      position: 'បុគ្គលិកទទួលភ្ញៀវវេជ្ជសាស្ត្រ',
      excerpt: 'ចូលរួមជាមួយ Orienda International Hospital ក្នុងនាមជាបុគ្គលិកទទួលភ្ញៀវវេជ្ជសាស្ត្រ ហើយក្លាយជាមុខមាត់នៃផ្នែកជំងឺក្រៅ។',
      body: 'យើងស្វែងរកបុគ្គលិកទទួលភ្ញៀវ ដើម្បីគ្រប់គ្រងការទទួលអ្នកជំងឺ ណាត់ជួប ហើយសម្របសម្រួលជាមួយក្រុមព្យាបាលដើម្បីធានាដំណើរការរលូន។',
      requirements: 'ការអប់រំ High School ឬខ្ពស់ជាង។ ភាសាខ្មែរ; ភាសាអង់គ្លេស ឬ ចិន ជាការល្អ។',
      responsibilities: 'ស្វាគមន៍អ្នកជំងឺ ចុះឈ្មោះ ណាត់ជួប ទូរស័ព្ទ ហើយរក្សាការសម្ងាត់ព័ត៌មានអ្នកជំងឺ។',
    },
  },
  {
    slug: 'physiotherapy-assistant',
    careerEmploymentType: 'part-time',
    experienceLevel: 'entry',
    salaryRange: '$200 – $300 / month',
    applicationDeadline: '2026-07-20T00:00:00.000Z',
    careerDepartment: 9,
    en: {
      title: 'Physiotherapy Assistant',
      position: 'Physiotherapy Assistant',
      excerpt: 'Support our physiotherapy team at Orienda International Hospital in delivering rehabilitation programs to patients recovering from surgery, injury, or chronic conditions.',
      body: 'Orienda International Hospital\'s Physiotherapy Department is seeking a motivated Physiotherapy Assistant to support our licensed physiotherapists in delivering patient rehabilitation programs. Responsibilities include setting up treatment equipment, assisting patients with exercises under physiotherapist supervision, maintaining clean and organized therapy areas, and accurately recording treatment progress in patient files. A diploma or degree in physiotherapy, sports science, or a related health field is preferred. Recent graduates are encouraged to apply. This is an excellent opportunity to gain hands-on clinical experience in a busy hospital physiotherapy department.',
      requirements: 'Diploma or degree in Physiotherapy, Sports Science, or related field (preferred). Good physical fitness. Empathetic and patient-focused attitude. Ability to follow clinical instructions precisely. Willingness to learn and take direction from senior physiotherapists.',
      responsibilities: 'Assist physiotherapists in conducting patient rehabilitation sessions. Set up, operate, and clean therapy equipment. Guide patients through prescribed exercises under supervision. Record patient progress notes accurately. Maintain a safe and organized treatment environment.',
    },
    zh: {
      title: '物理治疗助理',
      position: '物理治疗助理',
      excerpt: '支持欧瑞达国际医院物理治疗团队，为从手术、损伤或慢性病康复的患者提供康复项目。',
      body: '欧瑞达国际医院物理治疗部门正在寻找一名积极主动的物理治疗助理。职责包括配置治疗设备、在物理治疗师监督下协助患者进行锻炼、维护整洁有序的治疗区域，以及准确记录患者文件中的治疗进展。欢迎应届毕业生申请。',
      requirements: '物理治疗、运动科学或相关健康领域文凭或学位（优先）。良好的体能。同理心和以患者为中心的态度。',
      responsibilities: '协助物理治疗师进行患者康复疗程。配置和清洁治疗设备。在监督下引导患者进行规定锻炼。',
    },
    km: {
      title: 'ជំនួយការព្យាបាលរាងកាយ',
      position: 'ជំនួយការព្យាបាលរាងកាយ',
      excerpt: 'ជំនួយក្រុមព្យាបាលរាងកាយ Orienda International Hospital ក្នុងការផ្ដល់កម្មវិធីស្ដារឡើងវិញ។',
      body: 'ផ្នែកព្យាបាលរាងកាយ Orienda ស្វែងរកជំនួយការ ដើម្បីជួយ physiotherapists ផ្ដល់ការស្ដារឡើងវិញ ដំឡើង equipment ណែនាំអ្នកជំងឺ និងសរសេរកំណត់ត្រា។',
      requirements: 'សញ្ញាបត្ររៀនជំងឺ Physiotherapy ឬ Sports Science ។ ចង់រៀន។',
      responsibilities: 'ជួយ physiotherapists ត្រួតពិនិត្យ equipment ណែនាំអ្នកជំងឺ ហើយរក្សាបរិវេណថែទាំ។',
    },
  },
]

// ── Doctor Talks ───────────────────────────────────────────────────────────
// Uses existing doctor IDs: 3=Sin Haseka (Cardiology), 13=Sophea Chanthara (OB/GYN), 14=Ratana Kim (Pediatrics), 1=Eng Borey (Anesthesiology)
const DOCTOR_TALKS = [
  {
    slug: 'understanding-cardiovascular-disease-prevention',
    featuredDoctor: 3,
    eventDate: '2026-07-05T09:00:00.000Z',
    eventTime: '09:00 - 11:00',
    duration: 120,
    isVirtual: false,
    maxAttendees: 80,
    en: {
      title: 'Understanding Cardiovascular Disease Prevention',
      talkTopic: 'Heart Disease Prevention and Lifestyle Modification',
      excerpt: 'Join Dr. Sin Haseka, Orienda cardiologist, for an insightful talk on preventing the most common cause of death globally — cardiovascular disease.',
      body: 'Cardiovascular disease remains the leading cause of death worldwide, yet up to 80% of cases are preventable through lifestyle changes. In this talk, Dr. Sin Haseka will guide attendees through the latest evidence on risk factors including hypertension, high cholesterol, diabetes, smoking, and sedentary lifestyle. The session will cover practical strategies for heart-healthy eating, the role of physical activity, stress management, and the importance of regular cardiac screening. Time will be allocated for a live Q&A session where attendees can ask Dr. Sin Haseka their personal cardiovascular health questions. This talk is open to all community members and requires no medical background.',
    },
    zh: {
      title: '了解心血管疾病预防',
      talkTopic: '心脏病预防与生活方式改变',
      excerpt: '加入欧瑞达心脏科医生Sin Haseka博士的精彩讲座，深入了解如何预防全球最常见的死亡原因——心血管疾病。',
      body: '心血管疾病仍是全球主要死因，但高达80%的病例可通过生活方式改变来预防。在本次讲座中，Sin Haseka医生将引导参与者了解最新的风险因素证据，包括高血压、高胆固醇、糖尿病、吸烟和久坐不动的生活方式。讲座将涵盖心脏健康饮食的实用策略、体育锻炼的作用、压力管理，以及定期心脏筛查的重要性。',
    },
    km: {
      title: 'ការយល់ដឹងអំពីការការពារជំងឺបេះដូងនិងសរសៃឈាម',
      talkTopic: 'ការការពារជំងឺបេះដូង និងការកែប្រែរបៀបរស់នៅ',
      excerpt: 'ចូលរួមជាមួយ វេជ្ជបណ្ឌិត Sin Haseka អ្នកឯកទេសបេះដូង Orienda ដើម្បីស្ដាប់ការបង្ហាញអំពីការការពារជំងឺបេះដូង។',
      body: 'ជំងឺបេះដូងនិងសរសៃឈាមនៅតែជាមូលហេតុចម្បងនៃការស្លាប់ជុំវិញពិភពលោក ប៉ុន្តែ ៨០% នៃករណីអាចបង្ការបានតាមរយៈការផ្លាស់ប្ដូររបៀបរស់នៅ។ វេជ្ជបណ្ឌិត Sin Haseka នឹងណែនាំយុទ្ធសាស្ត្រសម្រាប់ការញ៉ាំអាហារ ការហាត់ប្រាណ ការគ្រប់គ្រងភាពតានតឹង និងការពិនិត្យបេះដូងជាប្រចាំ។',
    },
  },
  {
    slug: 'healthy-pregnancy-what-every-mother-should-know',
    featuredDoctor: 13,
    eventDate: '2026-07-19T14:00:00.000Z',
    eventTime: '14:00 - 16:00',
    duration: 120,
    isVirtual: true,
    meetingLink: 'https://meet.orienda.com.kh/maternal-health-talk',
    maxAttendees: 150,
    en: {
      title: 'Healthy Pregnancy: What Every Mother Should Know',
      talkTopic: 'Prenatal Care, Nutrition, and Birth Preparation',
      excerpt: 'Dr. Sophea Chanthara, OB/GYN specialist at Orienda, covers essential prenatal nutrition, warning signs during pregnancy, and how to prepare for a safe delivery.',
      body: 'A healthy pregnancy sets the foundation for both mother and child\'s long-term wellbeing. In this comprehensive online talk, Dr. Sophea Chanthara will cover the critical stages of fetal development, essential prenatal nutrition including folic acid, iron, and calcium requirements, common warning signs that require immediate medical attention, the importance of regular antenatal check-ups and ultrasounds, preparing for labor and delivery, and postpartum recovery and breastfeeding support. The talk is designed for expectant mothers at any stage of pregnancy, as well as women planning to conceive. A live Q&A with Dr. Sophea will conclude the session. Orienda\'s Maternity Department offers comprehensive antenatal packages — contact us to learn more.',
    },
    zh: {
      title: '健康怀孕：每位母亲应该知道的事',
      talkTopic: '产前护理、营养与分娩准备',
      excerpt: '欧瑞达妇产科专家Sophea Chanthara医生讲解基本的产前营养、怀孕期间的预警信号以及如何为安全分娩做准备。',
      body: '健康的怀孕为母亲和孩子的长期健康奠定基础。在这次综合性线上讲座中，Sophea Chanthara医生将讲解胎儿发育的关键阶段、基本产前营养（包括叶酸、铁和钙的需求）、需要立即就医的常见预警信号、定期产前检查和超声波的重要性，以及分娩准备和产后康复。讲座面向任何阶段的准妈妈，以及计划怀孕的女性。',
    },
    km: {
      title: 'ការមានផ្ទៃពោះសុខភាពល្អ: អ្វីដែលម្ដាយគ្រប់រូបត្រូវដឹង',
      talkTopic: 'ការថែទាំមុនសម្រាល អាហារូបត្ថម្ភ និងការត្រៀមសម្រាល',
      excerpt: 'វេជ្ជបណ្ឌិត Sophea Chanthara អ្នកឯកទេសសម្ភព OB/GYN Orienda លើកបង្ហាញអំពីអាហារូបត្ថម្ភ សញ្ញាព្រមាន និងការត្រៀមសម្រាល។',
      body: 'ការមានផ្ទៃពោះបានសុខភាពល្អ បង្កើតមូលដ្ឋានសម្រាប់សុខុមាលភាពរបស់ម្ដាយ និងកូន។ វេជ្ជបណ្ឌិត Sophea Chanthara នឹងលើកបង្ហាញអំពីដំណាក់កាលនៃការអភិវឌ្ឍន៍ទារក អាហារូបត្ថម្ភ folic acid ជាតិដែក កាល់ស្យូម សញ្ញាព្រមាន ការពិនិត្យ prenatal ឱ្យបានទៀតទាត់ ការត្រៀមសម្រាល និងការស្ដារឡើងវិញ។',
    },
  },
  {
    slug: 'protecting-child-health-vaccination-guide',
    featuredDoctor: 14,
    eventDate: '2026-08-02T10:00:00.000Z',
    eventTime: '10:00 - 12:00',
    duration: 120,
    isVirtual: false,
    maxAttendees: 100,
    en: {
      title: "Protecting Your Child's Health: A Complete Vaccination Guide",
      talkTopic: 'Childhood Immunization Schedule and Vaccine Safety',
      excerpt: "Dr. Ratana Kim, pediatric specialist at Orienda, demystifies childhood vaccination — covering which vaccines children need, when, and why they are safe and effective.",
      body: "Vaccines are one of the greatest achievements of modern medicine, preventing millions of childhood deaths every year. Despite their proven safety and effectiveness, vaccine hesitancy remains a significant public health challenge. In this talk, Dr. Ratana Kim will walk parents through Cambodia's national childhood immunization schedule, the science of how vaccines build immunity, common and rare side effects and what to expect, how to discuss vaccine concerns with your pediatrician, and the importance of herd immunity for protecting vulnerable community members. Dr. Ratana will also address common myths and misconceptions about childhood vaccines with evidence-based responses. Parents, grandparents, and caregivers of children of all ages are welcome. No registration is required — walk-ins welcome.",
    },
    zh: {
      title: '保护您孩子的健康：完整疫苗接种指南',
      talkTopic: '儿童免疫接种计划与疫苗安全',
      excerpt: '欧瑞达儿科专家Ratana Kim医生揭开儿童疫苗接种的神秘面纱，讲解儿童需要哪些疫苗、何时接种以及为什么安全有效。',
      body: '疫苗是现代医学最伟大的成就之一，每年防止数百万儿童死亡。在本次讲座中，Ratana Kim医生将引导家长了解柬埔寨国家儿童免疫接种计划、疫苗如何建立免疫力的科学原理、常见和罕见副作用及应对方法，以及群体免疫的重要性。Ratana医生还将以循证回应解答关于儿童疫苗的常见误解。欢迎所有年龄段儿童的父母、祖父母和照护者参加。',
    },
    km: {
      title: 'ការការពារសុខភាពកូន: មគ្គុទ្ទេសក៍វ៉ាក់សាំងពេញលេញ',
      talkTopic: 'កាលវិភាគចាក់វ៉ាក់សាំងកុមារ និងសុវត្ថិភាពវ៉ាក់សាំង',
      excerpt: 'វេជ្ជបណ្ឌិត Ratana Kim អ្នកឯកទេសកុមារ Orienda ពន្យល់ពីការចាក់វ៉ាក់សាំង ថាតើវ៉ាក់សាំងណាដែលកុមារត្រូវការ ពេលណា និងហេតុអ្វីដែលវាមានសុវត្ថិភាព។',
      body: 'វ៉ាក់សាំងជាសមិទ្ធផលដ៏ធំបំផុតនៃវេជ្ជសាស្ត្រទំនើប ការពារការស្លាប់កុមារជាច្រើនលាននាក់ប្រចាំឆ្នាំ។ វេជ្ជបណ្ឌិត Ratana Kim នឹងណែនាំអ្នកឪពុកម្ដាយអំពីកាលវិភាគចាក់វ៉ាក់សាំងជាតិ វិទ្យាសាស្ត្របង្កើតប្រព័ន្ធភាពស៊ាំ ផលប៉ះពាល់ទូទៅ និងការឆ្លើយសំណួរអំពីការភ័ន្តច្រលំ។',
    },
  },
]

async function upsert(payload: any, collection: string, slug: string, data: any) {
  const existing = await (payload.find as any)({ collection, where: { slug: { equals: slug } }, limit: 1, overrideAccess: true })
  if (existing.docs?.length) {
    const id = String(existing.docs[0].id)
    console.log(`  ~ exists: ${collection}/${slug} (${id})`)
    return id
  }
  const created = await (payload.create as any)({ collection, data, overrideAccess: true })
  const id = String(created.id)
  console.log(`  ✓ created: ${collection}/${slug} (${id})`)
  return id
}

async function main() {
  const payload = await getPayload({ config })

  // ── Health Tips ──────────────────────────────────────────────────────────
  console.log('\n── Health Tips ──────────────────────────')
  for (const tip of HEALTH_TIPS) {
    const id = await upsert(payload, 'health-tips', tip.slug, {
      title: tip.en.title,
      slug: tip.slug,
      excerpt: tip.en.excerpt,
      body: rt(tip.en.body),
      healthTipCategory: tip.category,
      readingTime: tip.readingTime,
      healthTipTags: tip.tags.map(tag => ({ tag })),
      status: 'published',
      publishedAt: new Date().toISOString(),
      _status: 'published',
    })
    for (const loc of ['zh', 'km'] as const) {
      const t = tip[loc]
      await (payload.update as any)({ collection: 'health-tips', id, locale: loc, overrideAccess: true, data: { title: t.title, excerpt: t.excerpt, body: rt(t.body) } })
    }
    await (payload.update as any)({ collection: 'health-tips', id, locale: 'en', overrideAccess: true, data: { title: tip.en.title, excerpt: tip.en.excerpt, body: rt(tip.en.body) } })
  }

  // ── Announcements ────────────────────────────────────────────────────────
  console.log('\n── Announcements ────────────────────────')
  for (const ann of ANNOUNCEMENTS) {
    await upsert(payload, 'announcements', ann.slug, {
      title: ann.title,
      slug: ann.slug,
      excerpt: ann.excerpt,
      body: rt(ann.body),
      priority: ann.priority,
      isBanner: ann.isBanner,
      ...(ann.bannerBackgroundColor ? { bannerBackgroundColor: ann.bannerBackgroundColor } : {}),
      startDate: ann.startDate,
      endDate: ann.endDate,
      status: 'published',
      publishedAt: new Date().toISOString(),
      _status: 'published',
    })
  }

  // ── Careers ──────────────────────────────────────────────────────────────
  console.log('\n── Careers ──────────────────────────────')
  for (const career of CAREERS) {
    const id = await upsert(payload, 'careers', career.slug, {
      title: career.en.title,
      position: career.en.position,
      slug: career.slug,
      excerpt: career.en.excerpt,
      body: rt(career.en.body),
      careerRequirements: rt(career.en.requirements),
      responsibilities: rt(career.en.responsibilities),
      careerEmploymentType: career.careerEmploymentType,
      experienceLevel: career.experienceLevel,
      salaryRange: career.salaryRange,
      applicationDeadline: career.applicationDeadline,
      careerDepartment: career.careerDepartment,
      status: 'published',
      publishedAt: new Date().toISOString(),
      _status: 'published',
    })
    for (const loc of ['zh', 'km'] as const) {
      const t = career[loc]
      await (payload.update as any)({ collection: 'careers', id, locale: loc, overrideAccess: true, data: { title: t.title, position: t.position, excerpt: t.excerpt, body: rt(t.body), careerRequirements: rt(t.requirements), responsibilities: rt(t.responsibilities) } })
    }
    await (payload.update as any)({ collection: 'careers', id, locale: 'en', overrideAccess: true, data: { title: career.en.title, position: career.en.position, excerpt: career.en.excerpt, body: rt(career.en.body), careerRequirements: rt(career.en.requirements), responsibilities: rt(career.en.responsibilities) } })
  }

  // ── Doctor Talks ─────────────────────────────────────────────────────────
  console.log('\n── Doctor Talks ─────────────────────────')
  for (const talk of DOCTOR_TALKS) {
    const id = await upsert(payload, 'doctor-talks', talk.slug, {
      title: talk.en.title,
      slug: talk.slug,
      excerpt: talk.en.excerpt,
      body: rt(talk.en.body),
      talkTopic: talk.en.talkTopic,
      featuredDoctor: talk.featuredDoctor,
      eventDate: talk.eventDate,
      eventTime: talk.eventTime,
      duration: talk.duration,
      isVirtual: talk.isVirtual,
      ...(talk.meetingLink ? { meetingLink: talk.meetingLink } : {}),
      maxAttendees: talk.maxAttendees,
      status: 'published',
      publishedAt: new Date().toISOString(),
      _status: 'published',
    })
    for (const loc of ['zh', 'km'] as const) {
      const t = talk[loc]
      await (payload.update as any)({ collection: 'doctor-talks', id, locale: loc, overrideAccess: true, data: { title: t.title, talkTopic: t.talkTopic, excerpt: t.excerpt, body: rt(t.body) } })
    }
    await (payload.update as any)({ collection: 'doctor-talks', id, locale: 'en', overrideAccess: true, data: { title: talk.en.title, talkTopic: talk.en.talkTopic, excerpt: talk.en.excerpt, body: rt(talk.en.body) } })
  }

  console.log('\nAll done.')
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
