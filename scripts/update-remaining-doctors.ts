import { Client } from 'pg'

const DB = 'postgresql://postgres.rmxxlirvvubublylbixp:gYqQhcM2OkzBBYzG@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres'

function lex(text: string) {
  return JSON.stringify({ root: { type: 'root', format: '', indent: 0, version: 1, children: text.split('\n').filter(Boolean).map(p => ({ type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textFormat: 0, textStyle: '', children: [{ type: 'text', format: 0, style: '', mode: 'normal', text: p, version: 1, detail: 0 }] })) } })
}

const UPDATES = [
  {
    id: 17,
    bio: 'Dr. Kheang Dara is the Head of the Dermatology Department at Orienda International Hospital. She provides comprehensive medical and cosmetic dermatology treatments for patients of all ages, managing skin conditions including acne, rosacea, warts, eczema, and complex dermatological diseases. Her international training across Singapore, France, Korea, and Thailand ensures world-class dermatological care.',
    education: ['Diploma of Dermatology and Venereology, University of Health Sciences, Phnom Penh', 'Certificate of Laser for Skin Rejuvenation & Chemical Peeling, Singapore', 'Certificate of Allergology, Paris, France', 'Certificate of Stem Cell Injection & Aesthetic Devices, Seoul, Korea', 'Certificate of Anti-Aging Medicine, Bangkok, Thailand'],
    languages: ['Khmer', 'English', 'French'],
  },
  {
    id: 1,
    bio: 'Eng Borey is an experienced Anesthesiology and Emergency specialist at Orienda International Hospital. With expertise in perioperative care, ICU management, and emergency medicine, he ensures patient safety and comfort throughout all surgical procedures. His comprehensive training makes him a cornerstone of Orienda surgical excellence.',
    education: ['MD, University of Health Sciences, Cambodia', 'Anesthesiology and Emergency Medicine Residency', 'Advanced ICU Training, Preah Kossamak Hospital'],
    languages: ['Khmer', 'English'],
  },
  {
    id: 15,
    bio: 'Dr. Virak Pheang is a Diagnostic Radiologist at Orienda International Hospital with over 10 years of experience. He operates Orienda state-of-the-art imaging suite including 128-Slice CT, MRI 1.5 Tesla, Digital X-ray, BMD, and Digital Mammogram — all meeting Singapore-standard protocols. His diagnostic precision supports accurate diagnoses across all medical departments.',
    education: ['MD, University of Health Sciences, Cambodia', 'Radiology Specialization, Sihanouk Hospital Center of HOPE', 'Advanced Diagnostic Imaging Training, Singapore Medisol Solution'],
    languages: ['Khmer', 'English', 'Chinese'],
  },
  {
    id: 14,
    bio: 'Dr. Ratana Kim is a Pediatric and Neonatal specialist at Orienda International Hospital, trained at Angkor Hospital for Children. With 11 years of clinical experience, she provides expert care for newborns, infants and children including NICU management for critically ill newborns. Her certification in Pediatric Emergency Care ensures rapid response in critical situations.',
    education: ['MD, International University, Cambodia', 'Specialist Training, Angkor Hospital for Children', 'Certificate of Pediatrics, IPPC (International Pediatric Practice Course)', 'ER/PICU Fellowship Training'],
    languages: ['Khmer', 'English'],
  },
  {
    id: 19,
    bio: 'Dr. Chanraksmey Heng leads the Physiotherapy and Rehabilitation Department at Orienda International Hospital. She designs personalized rehabilitation programs for patients recovering from orthopedic surgery, sports injuries, neurological conditions, and chronic pain. Her evidence-based approach combines manual therapy, therapeutic exercise, and advanced rehabilitation technology.',
    education: ['Bachelor of Physiotherapy, University of Health Sciences, Cambodia', 'Advanced Certification in Musculoskeletal Physiotherapy', 'Sports Rehabilitation Training, international accredited program'],
    languages: ['Khmer', 'English'],
  },
  {
    id: 16,
    bio: 'Dr. Maly Sovann is a General Medicine specialist at Orienda International Hospital dedicated to preventive healthcare and chronic disease management. She provides comprehensive annual health checkups, manages hypertension, diabetes, and metabolic disorders, and coordinates multidisciplinary care for complex patients.',
    education: ['MD, University of Health Sciences, Cambodia', 'Certificate in Internal Medicine and Chronic Disease Management', 'Advanced Training in Preventive Medicine'],
    languages: ['Khmer', 'English', 'French'],
  },
  {
    id: 2,
    bio: 'Nop Sovannaret serves as Assistant to the Medical Director at Orienda International Hospital, coordinating clinical operations and medical quality standards across all departments. With 15 years of clinical and administrative experience, she ensures that Orienda consistently delivers internationally accredited healthcare.',
    education: ['MD, University of Health Sciences, Cambodia', 'Hospital Management Certificate, Royal University of Phnom Penh', 'Healthcare Quality Management Training, international program'],
    languages: ['Khmer', 'English', 'French'],
  },
  {
    id: 3,
    bio: 'Sin Haseka is a Cardiologist at Orienda International Hospital specializing in the diagnosis and treatment of cardiovascular diseases. She uses advanced cardiac imaging technology including ECG, echocardiography, and CT angiography. Her fellowship training in Bangkok has equipped her with the latest interventional cardiology techniques.',
    education: ['MD, University of Health Sciences, Cambodia', 'Cardiology Fellowship, Chulalongkorn University Hospital, Bangkok, Thailand', 'Certificate in Interventional Cardiology and Cardiac Imaging'],
    languages: ['Khmer', 'English'],
  },
]

async function main() {
  const db = new Client({ connectionString: DB })
  await db.connect()
  for (const d of UPDATES) {
    await db.query('UPDATE payload.doctors_locales SET bio=$1 WHERE _parent_id=$2 AND _locale=$3', [lex(d.bio), d.id, 'en'])
    await db.query('DELETE FROM payload.doctors_education WHERE _parent_id=$1', [d.id])
    for (let i = 0; i < d.education.length; i++)
      await db.query('INSERT INTO payload.doctors_education (_order,_parent_id,id,description) VALUES ($1,$2,$3,$4)', [i + 1, d.id, `${d.id}_e${i}_${Date.now()}`, d.education[i]])
    await db.query('DELETE FROM payload.doctors_languages WHERE _parent_id=$1', [d.id])
    for (let i = 0; i < d.languages.length; i++)
      await db.query('INSERT INTO payload.doctors_languages (_order,_parent_id,id,name) VALUES ($1,$2,$3,$4)', [i + 1, d.id, `${d.id}_l${i}_${Date.now()}`, d.languages[i]])
    console.log('Updated doctor', d.id)
  }
  await db.end()
  console.log('Done!')
  process.exit(0)
}
main().catch(e => { console.error(e.message); process.exit(1) })
