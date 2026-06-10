import { Client } from 'pg'

const DOCTORS = [
  {
    slug: null, id: 13, // Dr. Sophea Chanthara
    bio: 'Dr. Sophea Chanthara is a dedicated OB/GYN specialist with over 8 years of clinical experience. She provides comprehensive care for women across all life stages, from prenatal care to complex gynecological conditions.',
    education: [
      'Bachelor of Medicine from University of Health Sciences Cambodia',
      "Master's in Obstetrics & Gynecology from Mahidol University, Thailand",
    ],
    languages: ['Khmer', 'English'],
    position_title: 'OB/GYN Specialist', nationality: 'Cambodian',
    total_experience_years: 8, specialist_experience_years: 6,
  },
  {
    id: 14, // Dr. Ratana Kim
    bio: 'Dr. Ratana Kim specializes in pediatric and neonatal care, with particular expertise in managing premature infants and complex newborn conditions. Passionate about child health and family-centered care.',
    education: [
      'MD from Royal University of Health Sciences',
      'Fellowship in Neonatology, Chulalongkorn Hospital Bangkok',
    ],
    languages: ['Khmer', 'English', 'Japanese', 'Chinese', 'French'],
    position_title: 'Pediatric Specialist', nationality: 'Cambodian',
    total_experience_years: 7, specialist_experience_years: 5,
  },
  {
    id: 15, // Dr. Virak Pheang
    bio: 'Dr. Virak Pheang is an experienced radiologist specializing in advanced imaging including MRI, CT scan, and ultrasound diagnostics. His precision and expertise ensure accurate diagnoses for all patients.',
    education: [
      'MD, University of Health Sciences',
      'Radiology Residency, Sihanouk Hospital Cambodia',
    ],
    languages: ['Khmer', 'English'],
    position_title: 'Radiologist', nationality: 'Cambodian',
    total_experience_years: 9, specialist_experience_years: 7,
  },
  {
    id: 16, // Dr. Maly Sovann
    bio: 'Dr. Maly Sovann is a general physician committed to preventive care and chronic disease management. Her patient-first approach has made her one of the most trusted doctors at Orienda.',
    education: [
      'Bachelor of Medicine, University of Health Sciences Cambodia',
      'Certificate in Internal Medicine',
    ],
    languages: ['Khmer', 'English', 'French'],
    position_title: 'General Physician', nationality: 'Cambodian',
    total_experience_years: 6, specialist_experience_years: 4,
  },
  {
    id: 17, // Dr. Kheang Dara
    bio: 'Dr. Kheang Dara is a board-certified dermatologist treating a wide range of skin conditions including acne, eczema, psoriasis, and cosmetic skin procedures with exceptional patient outcomes.',
    education: [
      'MD from University of Health Sciences',
      'Dermatology Specialization, Thailand',
    ],
    languages: ['Khmer', 'English'],
    position_title: 'Dermatologist', nationality: 'Cambodian',
    total_experience_years: 8, specialist_experience_years: 6,
  },
  {
    id: 18, // Dr. Buntha Lim
    bio: 'Dr. Buntha Lim is an orthopedic surgeon specializing in joint replacement, sports injuries, and minimally invasive spine procedures with over 10 years of surgical experience delivering excellent results.',
    education: [
      'MD, University of Health Sciences',
      'Orthopedic Surgery Residency, Vietnam',
      'Fellowship in Joint Replacement, Singapore',
    ],
    languages: ['Khmer', 'English', 'Vietnamese'],
    position_title: 'Orthopedic Surgeon', nationality: 'Cambodian',
    total_experience_years: 10, specialist_experience_years: 8,
  },
  {
    id: 19, // Dr. Chanraksmey Heng
    bio: 'Dr. Chanraksmey Heng leads the physiotherapy department, helping patients recover from surgery, injuries, and chronic pain through evidence-based rehabilitation programs tailored to each patient.',
    education: [
      'Bachelor of Physiotherapy, University of Health Sciences Cambodia',
      'Advanced PT Certification in Sports Rehabilitation',
    ],
    languages: ['Khmer', 'English'],
    position_title: 'Physiotherapy Specialist', nationality: 'Cambodian',
    total_experience_years: 5, specialist_experience_years: 4,
  },
  {
    id: 1, // Eng Borey
    bio: 'Eng Borey is an experienced anesthesiologist ensuring patient safety and comfort during surgical procedures. His expertise in perioperative care is essential to Orienda\'s surgical excellence.',
    education: [
      'MD, University of Health Sciences Cambodia',
      'Anesthesiology Residency, Preah Kossamak Hospital',
    ],
    languages: ['Khmer', 'English'],
    position_title: 'Senior Anesthesiologist', nationality: 'Cambodian',
    total_experience_years: 12, specialist_experience_years: 10,
  },
  {
    id: 2, // Nop Sovannaret
    bio: 'Nop Sovannaret serves as Assistant to the Medical Director, coordinating clinical operations and ensuring the highest standards of medical practice across all departments at Orienda International Hospital.',
    education: [
      'MD, University of Health Sciences Cambodia',
      'Hospital Management Certificate, Royal University of Phnom Penh',
    ],
    languages: ['Khmer', 'English', 'French'],
    position_title: 'Assistant Medical Director', nationality: 'Cambodian',
    total_experience_years: 15, specialist_experience_years: 10,
  },
  {
    id: 3, // Sin Haseka
    bio: 'Sin Haseka is a skilled cardiologist dedicated to the diagnosis and treatment of heart disease. Using the latest diagnostic technology, she provides comprehensive cardiovascular care to all patients.',
    education: [
      'MD, University of Health Sciences Cambodia',
      'Cardiology Fellowship, Chulalongkorn University Hospital, Bangkok',
    ],
    languages: ['Khmer', 'English'],
    position_title: 'Cardiologist', nationality: 'Cambodian',
    total_experience_years: 9, specialist_experience_years: 7,
  },
]

async function main() {
  const db = new Client({ connectionString: process.env.DATABASE_URL! })
  await db.connect()

  for (const d of DOCTORS) {
    // Update main doctor fields via SQL (bypass Branch required validation)
    await db.query(
      `UPDATE payload.doctors SET
        position_title=$1, nationality=$2,
        total_clinical_experience_years=$3, specialist_experience_years=$4
       WHERE id=$5`,
      [d.position_title, d.nationality, d.total_experience_years, d.specialist_experience_years, d.id]
    )

    // Update bio as Lexical JSON
    const bioLexical = {
      root: {
        type: 'root', format: '', indent: 0, version: 1,
        children: d.bio.split('\n').filter(Boolean).map(para => ({
          type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr',
          textFormat: 0, textStyle: '',
          children: [{ type: 'text', format: 0, style: '', mode: 'normal', text: para, version: 1, detail: 0 }],
        })),
      },
    }
    await db.query(
      'UPDATE payload.doctors_locales SET bio=$1 WHERE _parent_id=$2 AND _locale=$3',
      [JSON.stringify(bioLexical), d.id, 'en']
    )

    // Clear + insert education
    await db.query('DELETE FROM payload.doctors_education WHERE _parent_id=$1', [d.id])
    for (let i = 0; i < d.education.length; i++) {
      const uid = `${d.id}_edu_${i}_${Date.now()}`
      await db.query(
        'INSERT INTO payload.doctors_education (_order, _parent_id, id, description) VALUES ($1,$2,$3,$4)',
        [i + 1, d.id, uid, d.education[i]]
      )
    }

    // Clear + insert languages
    await db.query('DELETE FROM payload.doctors_languages WHERE _parent_id=$1', [d.id])
    for (let i = 0; i < d.languages.length; i++) {
      const uid = `${d.id}_lang_${i}_${Date.now()}`
      await db.query(
        'INSERT INTO payload.doctors_languages (_order, _parent_id, id, name) VALUES ($1,$2,$3,$4)',
        [i + 1, d.id, uid, d.languages[i]]
      )
    }

    console.log(`✓ Doctor ${d.id} updated`)
  }

  await db.end()
  console.log('All done!')
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
