export interface Promotion {
  slug: string
  title: string
  location: string
  price: string
  originalPrice: string
  expires: string
  expiresDisplay: string
  description: string
  body: string[]
}

export const PROMOTIONS: Promotion[] = [
  {
    slug: 'free-health-checkup',
    title: 'Free Health Check-up',
    location: 'Duong Ngeab, Chamkarmon',
    price: '$25.00',
    originalPrice: '$50.00',
    expires: '2027-06-30',
    expiresDisplay: '01-June-2027',
    description: 'Comprehensive health screening package at 50% off for new patients.',
    body: [
      'Orienda International Hospital is proud to offer our comprehensive Free Health Check-up promotion, designed to make high-quality preventive care accessible to everyone. This package includes a full blood panel, blood pressure assessment, BMI analysis, and a consultation with one of our experienced General Practitioners.',
      'Early detection is the cornerstone of modern healthcare. Our team of internationally trained specialists is dedicated to identifying potential health risks before they become serious conditions. This promotion reflects our commitment to the health and wellbeing of the Phnom Penh community.',
      'Whether you are a new patient or an existing member of the Orienda family, this is the perfect opportunity to take control of your health. Our state-of-the-art facility is equipped with the latest diagnostic technology to ensure the most accurate results.',
    ],
  },
  {
    slug: 'maternity-package',
    title: 'Maternity Package',
    location: 'Duong Ngeab, Chamkarmon',
    price: '$120.00',
    originalPrice: '$240.00',
    expires: '2027-05-31',
    expiresDisplay: '31-May-2027',
    description: 'Complete prenatal care bundle including ultrasounds, labs & consultations.',
    body: [
      'Our Maternity Package is tailored to support mothers-to-be through every stage of their pregnancy journey. The package includes four prenatal consultations with our experienced OB/GYN specialists, two ultrasound sessions, a comprehensive prenatal blood panel, and a dedicated midwife support line.',
      'At Orienda International Hospital, we understand that pregnancy is one of the most important periods in a woman\'s life. Our maternity department is staffed by board-certified specialists with decades of combined experience in obstetrics, fetal medicine, and neonatal care.',
      'This promotion is available for new and returning patients and is valid for a single pregnancy. Book your first consultation today and take the first step toward a safe, supported, and celebrated pregnancy.',
    ],
  },
  {
    slug: 'dental-cleaning',
    title: 'Dental Cleaning',
    location: 'Duong Ngeab, Chamkarmon',
    price: '$18.00',
    originalPrice: '$35.00',
    expires: '2027-04-30',
    expiresDisplay: '30-April-2027',
    description: 'Professional teeth cleaning & oral health assessment at half price.',
    body: [
      'A healthy smile starts with professional care. Our Dental Cleaning promotion offers a comprehensive oral health session including professional scaling, polishing, and a full assessment by our certified dental team.',
      'Good oral hygiene is directly linked to overall health. Our dental professionals use the latest ultrasonic scaling equipment to effectively remove plaque and tartar buildup, reducing the risk of gum disease, tooth decay, and associated systemic conditions.',
      'This package is ideal for patients who have not had a professional cleaning in the past year, or those seeking to establish a regular oral health routine. Take advantage of this limited-time offer and invest in your long-term dental health.',
    ],
  },
  {
    slug: 'eye-screening',
    title: 'Eye Screening',
    location: 'Duong Ngeab, Chamkarmon',
    price: '$30.00',
    originalPrice: '$60.00',
    expires: '2027-07-31',
    expiresDisplay: '31-July-2027',
    description: 'Full ophthalmology eye exam including glaucoma and retinal checks.',
    body: [
      'Protect your vision with our comprehensive Eye Screening package. This promotion includes a full visual acuity assessment, intraocular pressure testing for glaucoma detection, retinal examination, and a specialist consultation with one of our experienced ophthalmologists.',
      'Many serious eye conditions — including glaucoma, diabetic retinopathy, and macular degeneration — present with few or no early symptoms. Regular eye screening is the most effective tool for catching these conditions before they cause irreversible damage.',
      'Our ophthalmology department is equipped with digital fundus cameras and OCT scanning technology to provide the highest standard of diagnostic imaging. Book your eye screening today and see your world more clearly.',
    ],
  },
]

export function getPromotionBySlug(slug: string): Promotion | undefined {
  return PROMOTIONS.find((p) => p.slug === slug)
}
