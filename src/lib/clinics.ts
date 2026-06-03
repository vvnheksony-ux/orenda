export interface ClinicDetail {
  id: string
  name: string
  photo: string
  description: string[]
  services: string[]
  category: 'pink' | 'gold'
  icon: string
}

export const CLINIC_DETAILS: ClinicDetail[] = [
  {
    id: 'obstetrics',
    name: 'Obstetrics',
    photo: '/images/clinics/clinic-obstetrics.jpg',
    category: 'pink',
    icon: '/images/clinics/obstetric-icon.png',
    description: [
      'Orienda International Hospital provide clinical care to all women throughout their life stages. Our OB services is one of the best in Cambodia. We provide a wide range of comprehensive one-stop services in a relaxing ambiance.',
      'With our modern equipment and high standard setup facilities, we are able to provide better care for a wide range of women\'s medical.',
    ],
    services: [
      'Preventive care',
      'Diagnostic procedure',
      'Effective treatment',
      'Health screening',
      'Antenatal care',
      'Child delivery',
      'Pathologist\'s Pregnancy (Ex: Severe preterm labor, Pregnancy with high blood pressure and or Preeclampsia, Gestational Diabetic…) with we conduct special room for caring them.',
    ],
  },
  {
    id: 'gynecology',
    name: 'Gynecology',
    photo: '/images/clinics/clinic-obstetrics.jpg',
    category: 'pink',
    icon: '/images/clinics/obstetric-icon2.png',
    description: [
      'Our Gynecology Department offers comprehensive women\'s health services with a team of experienced specialists committed to your wellbeing.',
      'We provide personalized care in a comfortable environment, ensuring that each patient receives the attention and treatment they deserve.',
    ],
    services: [
      'Routine gynecological examinations',
      'Cervical cancer screening',
      'Ultrasound services',
      'Family planning consultation',
      'Minimally invasive surgery',
      'Hormonal disorder treatment',
    ],
  },
  {
    id: 'womens-health',
    name: "Women's Health",
    photo: '/images/clinics/clinic-obstetrics.jpg',
    category: 'pink',
    icon: '/images/clinics/obstetric-icon3.png',
    description: [
      'Our Women\'s Health Clinic provides holistic healthcare addressing physical, emotional, and reproductive health needs throughout every life stage.',
      'Our dedicated team combines expertise with compassionate care to deliver outstanding outcomes for all our patients.',
    ],
    services: [
      'Comprehensive health screenings',
      'Breast health services',
      'Bone density testing',
      'Nutritional counselling',
      'Menopause management',
      'Mental wellness support',
    ],
  },
  {
    id: 'spine-center',
    name: 'Spine Center',
    photo: '/images/clinics/clinic-obstetrics.jpg',
    category: 'gold',
    icon: '/images/clinics/spine-icon.png',
    description: [
      'Our Spine Center specializes in comprehensive diagnosis and treatment of spinal conditions, offering cutting-edge surgical and non-surgical options.',
      'With state-of-the-art imaging and a multidisciplinary team, we deliver precise, effective care for back pain, disc disorders, and complex spinal conditions.',
    ],
    services: [
      'Spinal disorder diagnosis',
      'Minimally invasive spine surgery',
      'Physical therapy and rehabilitation',
      'Pain management programs',
      'Scoliosis treatment',
      'Post-operative care and follow-up',
    ],
  },
]

export const OTHER_CLINICS = [
  { id: 'spine-center', name: 'Spine Center', icon: '/images/clinics/spine-icon.png' },
  { id: 'obstetrics',   name: 'Obstetrics',   icon: '/images/clinics/obstetric-icon.png' },
  { id: 'gynecology',   name: 'Gynecology',   icon: '/images/clinics/obstetric-icon2.png' },
  { id: 'womens-health',name: "Women's Health",icon: '/images/clinics/obstetric-icon3.png' },
]

export const HEALTH_TIPS = [
  { img: '/images/clinics/health-tip-1.jpg', title: 'Nine Natural Beauty Tips That Are Absolutely Free' },
  { img: '/images/clinics/health-tip-2.jpg', title: 'Understanding Spinal Anatomy' },
  { img: '/images/clinics/health-tip-1.jpg', title: 'Nine Natural Beauty Tips That Are Absolutely Free' },
  { img: '/images/clinics/health-tip-3.jpg', title: '7 Amazing Kid Entrepreneurs who Will Make You Think, Man What Was I Doing At Their Age?' },
  { img: '/images/clinics/health-tip-1.jpg', title: 'Nine Natural Beauty Tips That Are Absolutely Free' },
]
