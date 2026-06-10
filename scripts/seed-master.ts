import { getPayloadClient } from '../src/lib/payload'
import { lexicalToText } from '../src/lib/payload-api'

function rt(text: string) {
  return { root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children: [{ type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textStyle: '', textFormat: 0, children: [{ mode: 'normal', text, type: 'text', style: '', detail: 0, format: 0, version: 1 }] }] } }
}

// ── Department translations ────────────────────────────────────────────────
const DEPTS: { id: string; en: string; zh: string; km: string }[] = [
  { id: '1',  en: 'Obstetrics Doctor',         zh: '产科医生',       km: 'គ្រូពេទ្យសម្ភព' },
  { id: '2',  en: 'Pediatrics & Neonatology',  zh: '儿科与新生儿科', km: 'កុមារវិទ្យា និងទារកទើបនឹងកើត' },
  { id: '3',  en: 'Radiology',                 zh: '放射科',         km: 'វិទ្យុសាស្ត្រ' },
  { id: '4',  en: 'Anesthesiology',            zh: '麻醉科',         km: 'ថ្នាំសន្លប់' },
  { id: '5',  en: 'General Medicine',          zh: '内科',           km: 'វេជ្ជសាស្ត្រទូទៅ' },
  { id: '6',  en: 'Dermatology',               zh: '皮肤科',         km: 'ជំងឺស្បែក' },
  { id: '7',  en: 'Orthopedic Surgery',        zh: '骨科手术',       km: 'វះកាត់ឆ្អឹង' },
  { id: '8',  en: 'Cardiology',                zh: '心脏科',         km: 'ជំងឺបេះដូង' },
  { id: '9',  en: 'Physiotherapy',             zh: '物理治疗',       km: 'ព្យាបាលរាងកាយ' },
  { id: '10', en: 'Medical Director',          zh: '医疗总监',       km: 'នាយកការពេទ្យ' },
  { id: '11', en: 'Deputy Medical Director',   zh: '副医疗总监',     km: 'នាយករងការពេទ្យ' },
  { id: '12', en: 'Medical Administration',    zh: '医疗行政',       km: 'រដ្ឋបាលវេជ្ជសាស្ត្រ' },
  { id: '13', en: 'General Surgery',           zh: '普通外科',       km: 'វះកាត់ទូទៅ' },
  { id: '14', en: 'Obstetrics',                zh: '产科',           km: 'ផ្នែកសម្ភព' },
  { id: '15', en: 'Gynecology',                zh: '妇科',           km: 'រោគស្ត្រី' },
  { id: '16', en: 'Pediatrics',                zh: '儿科',           km: 'កុមារវិទ្យា' },
  { id: '17', en: 'Neurology',                 zh: '神经科',         km: 'ប្រព័ន្ធសរសៃប្រសាទ' },
  { id: '18', en: 'Medical Imaging',           zh: '医学影像',       km: 'រូបភាពវេជ្ជសាស្ត្រ' },
  { id: '19', en: 'Orthopedics',               zh: '骨科',           km: 'ឆ្អឹង' },
  { id: '20', en: 'Cardiology',                zh: '心脏科',         km: 'បេះដូង' },
  { id: '21', en: 'Obstetrics',                zh: '产科',           km: 'ផ្នែកសម្ភព' },
  { id: '22', en: 'Neonatology',               zh: '新生儿科',       km: 'ទារកទើបនឹងកើត' },
  { id: '23', en: 'Maternity Care',            zh: '产科护理',       km: 'ថែទាំមាតា' },
  { id: '24', en: 'Dermatology',               zh: '皮肤科',         km: 'ជំងឺស្បែក' },
  { id: '25', en: 'Ophthalmology',             zh: '眼科',           km: 'ភ្នែក' },
  { id: '26', en: 'Oncology',                  zh: '肿瘤科',         km: 'ជំងឺមហារីក' },
  { id: '27', en: 'Urology',                   zh: '泌尿科',         km: 'ទឹកនោម' },
  { id: '28', en: 'Gastroenterology',          zh: '胃肠科',         km: 'ការរំលាយអាហារ' },
  { id: '29', en: 'Endocrinology',             zh: '内分泌科',       km: 'ក្រពេញ' },
  { id: '30', en: 'Anesthesiology',            zh: '麻醉科',         km: 'ថ្នាំសន្លប់' },
  { id: '31', en: 'Physiotherapy',             zh: '物理治疗',       km: 'ព្យាបាលរាងកាយ' },
  { id: '32', en: 'Emergency Medicine',        zh: '急诊科',         km: 'ជំនួយបន្ទាន់' },
  { id: '33', en: 'General Surgery',           zh: '外科',           km: 'វះកាត់' },
  { id: '34', en: 'Dentistry',                 zh: '牙科',           km: 'ធ្មេញ' },
]

// ── Doctor translations ────────────────────────────────────────────────────
const DOCTORS: { id: string; enSpec: string; zhSpec: string; kmSpec: string; enBio: string; zhBio: string; kmBio: string }[] = [
  {
    id: '1',
    enSpec: 'Anesthesiology', zhSpec: '麻醉科', kmSpec: 'ថ្នាំសន្លប់',
    enBio: 'Dr. Eng Borey is a specialist in anesthesiology with over 10 years of experience. He ensures patient comfort and safety during all surgical procedures at Orienda International Hospital.',
    zhBio: 'Eng Borey医生是麻醉科专家，拥有超过10年的从业经验，确保欧瑞达国际医院每位患者在手术过程中的安全与舒适。',
    kmBio: 'វេជ្ជបណ្ឌិត Eng Borey គឺជាអ្នកឯកទេសថ្នាំសន្លប់ដែលមានបទពិសោធន៍ជាង 10 ឆ្នាំ។ លោកធានាសុវត្ថិភាព និងភាពស្រួលអ្នកជំងឺក្នុងអំឡុងវះកាត់ទាំងអស់។',
  },
  {
    id: '2',
    enSpec: 'Medical Director & Administration', zhSpec: '医疗总监', kmSpec: 'នាយករដ្ឋបាលវេជ្ជសាស្ត្រ',
    enBio: 'Nop Sovannaret leads the medical administration at Orienda International Hospital, overseeing clinical operations and ensuring the highest standard of patient care.',
    zhBio: 'Nop Sovannaret负责欧瑞达国际医院的医疗行政工作，监督临床运营并确保最高标准的患者护理。',
    kmBio: 'Nop Sovannaret ដឹកនាំរដ្ឋបាលវេជ្ជសាស្ត្រ គ្រប់គ្រងប្រតិបត្តិការគ្លីនិក និងធានាការថែទាំអ្នកជំងឺក្នុងស្តង់ដារខ្ពស់បំផុត។',
  },
  {
    id: '3',
    enSpec: 'Cardiology', zhSpec: '心脏科', kmSpec: 'ជំងឺបេះដូង',
    enBio: 'Dr. Sin Haseka is a cardiologist specializing in the diagnosis and treatment of heart conditions. With extensive training in interventional cardiology, she provides comprehensive cardiac care.',
    zhBio: 'Sin Haseka医生是心脏科专家，专注于心脏疾病的诊断和治疗，拥有丰富的介入心脏病学培训经验。',
    kmBio: 'វេជ្ជបណ្ឌិត Sin Haseka ជាអ្នកឯកទេសបេះដូង ជំនាញខាងការព្យាបាល និងរោគវិនិច្ឆ័យជំងឺបេះដូង ដោយផ្តល់ការថែទាំបេះដូងយ៉ាងទូលំទូលាយ។',
  },
  {
    id: '13',
    enSpec: 'Obstetrics & Gynecology', zhSpec: '妇产科', kmSpec: 'រោគស្ត្រី និងសម្ភព',
    enBio: 'Dr. Sophea Chanthara is an experienced obstetrician-gynecologist dedicated to women\'s health throughout all life stages, from prenatal care to menopause management.',
    zhBio: 'Sophea Chanthara医生是经验丰富的妇产科医生，致力于女性在人生各阶段的健康，从产前护理到更年期管理。',
    kmBio: 'វេជ្ជបណ្ឌិត Sophea Chanthara ជាអ្នកឯកទេសរោគស្ត្រី និងសម្ភព ឧទ្ទិសខ្លួនដើម្បីសុខភាពស្ត្រីក្នុងគ្រប់ដំណាក់កាលជីវិត។',
  },
  {
    id: '14',
    enSpec: 'Pediatrics & Neonatology', zhSpec: '儿科与新生儿科', kmSpec: 'កុមារវិទ្យា',
    enBio: 'Dr. Ratana Kim specializes in pediatrics and neonatal care, providing expert medical attention to newborns, infants, and children at Orienda International Hospital.',
    zhBio: 'Ratana Kim医生专注于儿科和新生儿护理，为欧瑞达国际医院的新生儿、婴幼儿和儿童提供专业医疗服务。',
    kmBio: 'វេជ្ជបណ្ឌិត Ratana Kim ជំនាញខាងកុមារវិទ្យា និងទារកទើបនឹងកើត ផ្តល់ការថែទាំវេជ្ជសាស្ត្រជំនាញដល់ទារក និងកុមារ។',
  },
  {
    id: '15',
    enSpec: 'Diagnostic Radiology', zhSpec: '放射诊断科', kmSpec: 'វិទ្យុសាស្ត្ររោគវិនិច្ឆ័យ',
    enBio: 'Dr. Virak Pheang is a diagnostic radiologist skilled in interpreting medical imaging including X-ray, MRI, CT scan, and ultrasound to aid accurate diagnosis.',
    zhBio: 'Virak Pheang医生是放射诊断科医生，擅长解读X光、MRI、CT扫描和超声波等医学影像，以辅助准确诊断。',
    kmBio: 'វេជ្ជបណ្ឌិត Virak Pheang ជាអ្នកឯកទេសរូបភាពវេជ្ជសាស្ត្រ ជំនាញអានលទ្ធផល X-ray MRI CT Scan និង Ultrasound ដើម្បីរោគវិនិច្ឆ័យត្រឹមត្រូវ។',
  },
  {
    id: '16',
    enSpec: 'General Medicine', zhSpec: '内科', kmSpec: 'វេជ្ជសាស្ត្រទូទៅ',
    enBio: 'Dr. Maly Sovann is a general practitioner providing comprehensive primary care services. She focuses on preventive medicine and the management of chronic conditions.',
    zhBio: 'Maly Sovann医生是全科医生，提供全面的初级医疗服务，专注于预防医学和慢性病管理。',
    kmBio: 'វេជ្ជបណ្ឌិត Maly Sovann ជាគ្រូពេទ្យទូទៅ ផ្តល់សេវាថែទាំបឋមទូលំទូលាយ ផ្តោតលើវេជ្ជសាស្ត្របង្ការ និងការគ្រប់គ្រងជំងឺរ៉ាំរ៉ៃ។',
  },
  {
    id: '17',
    enSpec: 'Dermatology', zhSpec: '皮肤科', kmSpec: 'ជំងឺស្បែក',
    enBio: 'Dr. Kheang Dara is a dermatologist specializing in the diagnosis and treatment of skin, hair, and nail conditions. He offers both medical and cosmetic dermatology services.',
    zhBio: 'Kheang Dara医生是皮肤科专家，专注于皮肤、毛发和指甲疾病的诊断和治疗，提供医疗和美容皮肤科服务。',
    kmBio: 'វេជ្ជបណ្ឌិត Kheang Dara ជំនាញខាងជំងឺស្បែក សក់ និងក្រចក ផ្តល់សេវាវេជ្ជសាស្ត្រ និងសោភ័ណភាពស្បែក។',
  },
  {
    id: '18',
    enSpec: 'Orthopedic Surgery', zhSpec: '骨科手术', kmSpec: 'វះកាត់ឆ្អឹង',
    enBio: 'Dr. Buntha Lim is an orthopedic surgeon with expertise in joint replacement, sports injuries, and spine conditions. He is committed to restoring mobility and quality of life.',
    zhBio: 'Buntha Lim医生是骨科外科医生，擅长关节置换、运动损伤和脊柱疾病，致力于恢复患者的活动能力和生活质量。',
    kmBio: 'វេជ្ជបណ្ឌិត Buntha Lim ជំនាញខាងវះកាត់ឆ្អឹង ជំនាញក្នុងការជំនួសសន្លឹកឆ្អឹង ការរបួសសីហនុ និងជំងឺឆ្អឹងខ្នង។',
  },
  {
    id: '19',
    enSpec: 'Physiotherapy', zhSpec: '物理治疗科', kmSpec: 'ព្យាបាលរាងកាយ',
    enBio: 'Dr. Chanraksmey Heng is a physiotherapist specializing in rehabilitation, musculoskeletal conditions, and post-surgical recovery programs at Orienda International Hospital.',
    zhBio: 'Chanraksmey Heng医生是物理治疗师，专注于康复治疗、肌肉骨骼疾病和外科术后恢复。',
    kmBio: 'វេជ្ជបណ្ឌិត Chanraksmey Heng ជំនាញខាងព្យាបាលរាងកាយ ជំង្គ្រប់ ជំងឺ筋肉骨骼 និងកម្មវិធីស្ដារឡើងវិញ។',
  },
]

// ── FAQs ──────────────────────────────────────────────────────────────────
const FAQS = [
  {
    category: 'general',
    order: 1,
    en: { q: 'What are Orienda Hospital\'s visiting hours?', a: 'Orienda International Hospital is open 24 hours a day, 7 days a week. Our emergency department operates around the clock. General outpatient hours are Monday to Saturday, 8:00 AM to 6:00 PM.' },
    zh: { q: '欧瑞达医院的探视时间是什么时候？', a: '欧瑞达国际医院每天24小时、每周7天开放。急诊科全天候运营。普通门诊时间为周一至周六，早上8:00至下午6:00。' },
    km: { q: 'តើម៉ោងអញ្ជើញទស្សនកិច្ចរបស់មន្ទីរពេទ្យ Orienda គឺម៉ោងណា?', a: 'មន្ទីរពេទ្យអន្តរជាតិ Orienda បើកចំហ 24 ម៉ោង ក្នុងមួយថ្ងៃ 7 ថ្ងៃក្នុងមួយអាទិត្យ។ ផ្នែកបន្ទាន់ដំណើរការពេញ 24 ម៉ោង។ ម៉ោងពេទ្យទូទៅ ចន្ទ-សៅរ៍ ម៉ោង 8:00-18:00។' },
  },
  {
    category: 'appointments',
    order: 2,
    en: { q: 'How do I book an appointment?', a: 'You can book an appointment online through our website, call our hotline at (+855) 018 593 789, or visit our reception desk in person. Our staff is available 24/7 to assist you.' },
    zh: { q: '如何预约就诊？', a: '您可以通过我们的网站在线预约，拨打我们的热线 (+855) 018 593 789，或亲临我们的接待处。我们的工作人员全天候为您服务。' },
    km: { q: 'តើខ្ញុំអាចណាត់ជួបដោយរបៀបណា?', a: 'អ្នកអាចណាត់ជួបតាមអ៊ីនធឺណិតតាមរយៈគេហទំព័ររបស់យើង ឬទូរស័ព្ទទៅ (+855) 018 593 789 ឬទស្សនការផ្ទាល់ខ្លួននៅការិយាល័យទទួលភ្ញៀវ។ បុគ្គលិករបស់យើងផ្ដល់សេវា 24/7។' },
  },
  {
    category: 'insurance',
    order: 3,
    en: { q: 'Do you accept international insurance?', a: 'Yes, Orienda International Hospital works with major international and local insurance providers. Please bring your insurance card and policy documents when you visit. Contact our billing department for a full list of accepted insurers.' },
    zh: { q: '你们接受国际医疗保险吗？', a: '是的，欧瑞达国际医院与主要国际和本地保险公司合作。就诊时请携带您的保险卡和保险文件。如需完整的承保保险公司列表，请联系我们的账单部门。' },
    km: { q: 'តើអ្នកទទួលយកធានារ៉ាប់រងអន្តរជាតិទេ?', a: 'បាទ/ចាស មន្ទីរពេទ្យអន្តរជាតិ Orienda ធ្វើការជាមួយក្រុមហ៊ុនធានារ៉ាប់រងអន្តរជាតិ និងក្នុងស្រុកធំៗ។ សូមនាំប័ណ្ណធានារ៉ាប់រង និងឯកសារ​នៅពេលអ្នកមកទស្សនា។' },
  },
  {
    category: 'general',
    order: 4,
    en: { q: 'What should I bring to my first visit?', a: 'For your first visit, please bring a valid government-issued ID or passport, your insurance card (if applicable), any previous medical records or test results, and a list of current medications.' },
    zh: { q: '初次就诊需要携带哪些证件？', a: '初次就诊时，请携带有效的政府颁发身份证或护照、保险卡（如适用）、任何以前的病历或检查结果，以及当前用药清单。' },
    km: { q: 'តើខ្ញុំត្រូវយកអ្វីទៅនៅការទស្សនាដំបូង?', a: 'សម្រាប់ការទស្សនាដំបូង សូមយក អត្តសញ្ញាណប័ណ្ណ ឬ លិខិតឆ្លងដែន ប័ណ្ណធានារ៉ាប់រង (ប្រសិនបើមាន) ឯកសារវេជ្ជសាស្ត្រពីមុន និង បញ្ជីថ្នាំដែលកំពុងប្រើ។' },
  },
  {
    category: 'services',
    order: 5,
    en: { q: 'Does Orienda Hospital have emergency services?', a: 'Yes, our Emergency Department operates 24 hours a day, 365 days a year. We have a dedicated trauma team, intensive care unit (ICU), and emergency response ambulances. Call (+855) 023 232 789 for emergencies.' },
    zh: { q: '欧瑞达医院有急诊服务吗？', a: '是的，我们的急诊科每天24小时、全年365天运营。我们拥有专业创伤团队、重症监护室（ICU）和急救救护车。紧急情况请拨打 (+855) 023 232 789。' },
    km: { q: 'តើមន្ទីរពេទ្យ Orienda មានសេវាបន្ទាន់ទេ?', a: 'បាទ/ចាស ផ្នែកបន្ទាន់របស់យើងដំណើរការ 24 ម៉ោងក្នុងមួយថ្ងៃ 365 ថ្ងៃក្នុងមួយឆ្នាំ។ យើងមានក្រុម ICU និងរថយន្តសង្គ្រោះ។ ទូរស័ព្ទ (+855) 023 232 789 សម្រាប់ករណីបន្ទាន់។' },
  },
  {
    category: 'general',
    order: 6,
    en: { q: 'What languages does your staff speak?', a: 'Our medical and support staff are fluent in Khmer, English, and Chinese (Mandarin). We also have interpreters available for other languages upon request to ensure effective communication with all patients.' },
    zh: { q: '你们的工作人员会说哪些语言？', a: '我们的医疗和支持人员能流利使用高棉语、英语和中文（普通话）。根据需要，我们还可提供其他语言的口译服务，确保与所有患者的有效沟通。' },
    km: { q: 'តើបុគ្គលិករបស់អ្នកនិយាយភាសាអ្វីខ្លះ?', a: 'បុគ្គលិកវេជ្ជសាស្ត្រ និងបុគ្គលិកជំនួយរបស់យើងស្ទាត់ជំនាញភាសាខ្មែរ អង់គ្លេស និងចិន (ម៉ាន់ដារីន)។ យើងក៏មានអ្នកបកប្រែសម្រាប់ភាសាផ្សេងៗតាមការស្នើសុំ។' },
  },
]

// ── Services to create ─────────────────────────────────────────────────────
const SERVICES_DATA = [
  // Annual checkup → dept 5 (General Medicine)
  { slug: 'complete-blood-count',   deptId: 5,  en: { t: 'Complete Blood Count',    d: 'Full analysis of red cells, white cells, and platelets.' }, zh: { t: '全血细胞计数',  d: '全面分析红细胞、白细胞和血小板。' }, km: { t: 'ការរាប់ឈាមពេញ',   d: 'ការវិភាគពេញលេញនៃកោសិកាឈាម។' } },
  { slug: 'urinalysis',             deptId: 5,  en: { t: 'Urinalysis',               d: 'Laboratory urine examination for kidney and metabolic health.' }, zh: { t: '尿液分析',       d: '实验室尿液检查，评估肾脏和代谢健康。' }, km: { t: 'ការពិនិត្យទឹកនោម',  d: 'ការពិនិត្យទឹកនោមសម្រាប់សុខភាពតម្រងនោម។' } },
  { slug: 'chest-xray',            deptId: 5,  en: { t: 'Chest X-Ray',              d: 'Imaging of the chest to detect lung and cardiac conditions.' }, zh: { t: '胸部X光',       d: '胸部影像检查，检测肺部和心脏疾病。' }, km: { t: 'ថតX-ray ទ្រូង',      d: 'ការថតបង្ហាញរូបភាពទ្រូង ដើម្បីរកជំងឺសួត និងបេះដូង។' } },
  // Heart screening → dept 20 (Cardiology)
  { slug: 'ecg',                   deptId: 20, en: { t: 'ECG / Electrocardiogram',  d: 'Records electrical activity of the heart to detect arrhythmias.' }, zh: { t: '心电图 (ECG)',   d: '记录心脏电活动，检测心律失常。' }, km: { t: 'ECG ចំណុចបេះដូង', d: 'ការកត់ត្រាសកម្មភាពអគ្គិសនីបេះដូង ដើម្បីរកចង្វាក់បេះដូងមិនប្រក្រតី។' } },
  { slug: 'echocardiogram',        deptId: 20, en: { t: 'Echocardiogram',           d: 'Ultrasound imaging of the heart to assess structure and function.' }, zh: { t: '超声心动图',     d: '心脏超声影像检查，评估心脏结构和功能。' }, km: { t: 'Echocardiogram',    d: 'ការថតUltrasound បេះដូង ដើម្បីវាស់ស្ទង់រចនាសម្ព័ន្ធ និងមុខងារបេះដូង។' } },
  { slug: 'lipid-panel',           deptId: 20, en: { t: 'Lipid Blood Panel',        d: 'Measures cholesterol and triglyceride levels to assess cardiovascular risk.' }, zh: { t: '血脂检测',       d: '测量胆固醇和甘油三酯水平，评估心血管风险。' }, km: { t: 'ការពិនិត្យខ្លាញ់ឈាម', d: 'វាស់កម្រិត cholesterol ដើម្បីវាយតម្លៃហានិភ័យនៃប្រព័ន្ធបេះដូង។' } },
  // Women's health → dept 15 (Gynecology)
  { slug: 'pelvic-exam',           deptId: 15, en: { t: 'Pelvic Examination',       d: 'Comprehensive gynecological examination for women\'s reproductive health.' }, zh: { t: '盆腔检查',       d: '全面的妇科检查，评估女性生殖健康。' }, km: { t: 'ការពិនិត្យ Pelvic',  d: 'ការពិនិត្យរោគស្ត្រីទូលំទូលាយសម្រាប់សុខភាពបន្តពូជស្ត្រី។' } },
  { slug: 'breast-exam',           deptId: 15, en: { t: 'Breast Examination',       d: 'Clinical breast exam and mammography screening for early detection.' }, zh: { t: '乳房检查',       d: '临床乳房检查和乳房X光筛查，用于早期发现乳腺疾病。' }, km: { t: 'ការពិនិត្យដើមទ្រូង',  d: 'ការពិនិត្យ និងការ Mammography ដើម្បីរករកបានមុនដំបូង។' } },
  { slug: 'pelvic-ultrasound',     deptId: 15, en: { t: 'Pelvic Ultrasound',        d: 'Ultrasound scan of pelvic organs including uterus and ovaries.' }, zh: { t: '盆腔超声波',     d: '盆腔器官超声波扫描，包括子宫和卵巢检查。' }, km: { t: 'Ultrasound Pelvic',  d: 'ការស្កែន Ultrasound នៃសរីរាង្គ Pelvic រួមមាន ស្បូន និងអំបូររបស់ស្ត្រី។' } },
]

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const payload = await getPayloadClient()

  // 1. Department translations
  console.log('\n── Departments ─────────────────────────')
  for (const d of DEPTS) {
    // fetch existing to get required branch field
    const existing = await (payload.findByID as any)({ collection: 'departments', id: d.id, overrideAccess: true, depth: 0 })
    const branchId = typeof existing.branch === 'object' ? existing.branch?.id : existing.branch
    for (const loc of ['en', 'zh', 'km'] as const) {
      await (payload.update as any)({ collection: 'departments', id: d.id, locale: loc, overrideAccess: true, data: { name: d[loc], branch: branchId } })
    }
    console.log(`  ✓ dept ${d.id}: ${d.en}`)
  }

  // 2. Doctor translations
  console.log('\n── Doctors ─────────────────────────────')
  for (const d of DOCTORS) {
    for (const loc of ['en', 'zh', 'km'] as const) {
      const spec = loc === 'en' ? d.enSpec : loc === 'zh' ? d.zhSpec : d.kmSpec
      const bio  = loc === 'en' ? d.enBio  : loc === 'zh' ? d.zhBio  : d.kmBio
      await (payload.update as any)({ collection: 'doctors', id: d.id, locale: loc, data: { specialty: spec, bio: rt(bio) } })
    }
    console.log(`  ✓ doctor ${d.id}: ${d.enSpec}`)
  }

  // 3. Create services
  console.log('\n── Services ────────────────────────────')
  const serviceIds: Record<string, string> = {}
  for (const s of SERVICES_DATA) {
    const existing = await (payload.find as any)({ collection: 'services', where: { slug: { equals: s.slug } }, limit: 1, overrideAccess: true })
    let id: string
    if (existing.docs?.length) {
      id = String(existing.docs[0].id)
      console.log(`  ~ service exists: ${s.slug} (${id})`)
    } else {
      const created = await (payload.create as any)({
        collection: 'services',
        data: { title: s.en.t, slug: s.slug, description: rt(s.en.d), department: s.deptId, _status: 'published' },
      })
      id = String(created.id)
      console.log(`  ✓ created service: ${s.slug} (${id})`)
    }
    serviceIds[s.slug] = id
    // Add ZH + KM translations
    for (const loc of ['zh', 'km'] as const) {
      const trans = s[loc]
      await (payload.update as any)({ collection: 'services', id, locale: loc, data: { title: trans.t, description: rt(trans.d) } })
    }
    await (payload.update as any)({ collection: 'services', id, locale: 'en', data: { title: s.en.t, description: rt(s.en.d) } })
  }

  // 4. Link service packages to departments + services
  console.log('\n── Service Packages (link) ──────────────')
  const pkgLinks = [
    { id: '3', deptId: 5,  services: ['complete-blood-count', 'urinalysis', 'chest-xray'] },
    { id: '2', deptId: 20, services: ['ecg', 'echocardiogram', 'lipid-panel'] },
    { id: '1', deptId: 15, services: ['pelvic-exam', 'breast-exam', 'pelvic-ultrasound'] },
  ]
  for (const pkg of pkgLinks) {
    const svcIds = pkg.services.map(slug => Number(serviceIds[slug])).filter(Boolean)
    await (payload.update as any)({ collection: 'service-packages', id: pkg.id, data: { department: pkg.deptId, services: svcIds } })
    console.log(`  ✓ package ${pkg.id} → dept ${pkg.deptId} + ${svcIds.length} services`)
  }

  // 5. FAQs
  console.log('\n── FAQs ─────────────────────────────────')
  for (const faq of FAQS) {
    const existing = await (payload.find as any)({ collection: 'faqs', where: { question: { equals: faq.en.q } }, locale: 'en', limit: 1, overrideAccess: true })
    let id: string
    if (existing.docs?.length) {
      id = String(existing.docs[0].id)
      console.log(`  ~ faq exists: "${faq.en.q.substring(0, 40)}..."`)
    } else {
      const created = await (payload.create as any)({
        collection: 'faqs',
        data: { question: faq.en.q, answer: rt(faq.en.a), category: faq.category, order: faq.order, _status: 'published' },
      })
      id = String(created.id)
      console.log(`  ✓ created faq ${id}: "${faq.en.q.substring(0, 40)}..."`)
    }
    for (const loc of ['zh', 'km'] as const) {
      const t = faq[loc]
      await (payload.update as any)({ collection: 'faqs', id, locale: loc, data: { question: t.q, answer: rt(t.a) } })
    }
    await (payload.update as any)({ collection: 'faqs', id, locale: 'en', data: { question: faq.en.q, answer: rt(faq.en.a) } })
  }

  console.log('\nAll done.')
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
