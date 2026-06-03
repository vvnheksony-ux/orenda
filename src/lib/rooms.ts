export interface Room {
  id: string
  name: string
  desc: string
  src: string
  extraPhotos: string[]
  doctors: { name: string; specialty: string }[]
}

export const ROOMS: Room[] = [
  {
    id: 'standard',
    name: 'Standard Room',
    desc: 'A surgery room is a specialized medical facility designed to provide a sterile, safe, and controlled environment for surgical procedures. It is equipped with advanced medical technology and operated by highly trained healthcare professionals to ensure the highest standard of patient care before, during, and after surgery.\n\nThe room is carefully designed to maintain cleanliness and minimize the risk of infection through strict sterilization protocols, proper ventilation systems, and organized surgical workflows. Modern surgical rooms are equipped with operating tables, surgical lighting, anesthesia machines, patient monitoring systems, and specialized instruments required for various types of procedures.',
    src: '/images/360/StandardRoom.JPG',
    extraPhotos: [
      '/images/360/OPD-1stFloor.JPG',
      '/images/360/OPD-2ndFloor.JPG',
      '/images/360/OPD-3rdFloor.JPG',
    ],
    doctors: [
      { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist' },
      { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist' },
      { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist' },
      { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist' },
    ],
  },
  {
    id: 'opd1',
    name: 'OPD – 1st Floor',
    desc: 'Our Outpatient Department on the 1st Floor provides comprehensive medical consultations in a welcoming environment. Designed for efficiency and comfort, it serves patients requiring specialist consultations and follow-up care.\n\nThe department is staffed by experienced physicians and support personnel dedicated to ensuring each patient receives prompt, thorough, and compassionate care tailored to their individual needs.',
    src: '/images/360/OPD-1stFloor.JPG',
    extraPhotos: [
      '/images/360/OPD-2ndFloor.JPG',
      '/images/360/OPD-3rdFloor.JPG',
      '/images/360/StandardRoom.JPG',
    ],
    doctors: [
      { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist' },
      { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist' },
      { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist' },
      { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist' },
    ],
  },
  {
    id: 'opd2',
    name: 'OPD – 2nd Floor',
    desc: 'The 2nd Floor Outpatient Department houses specialist clinics offering targeted care across multiple medical disciplines. Each consultation room is equipped with the latest diagnostic tools to ensure accurate assessment.\n\nOur team of highly qualified specialists collaborates to deliver integrated healthcare solutions, ensuring every patient benefit from a multidisciplinary approach to their treatment plan.',
    src: '/images/360/OPD-2ndFloor.JPG',
    extraPhotos: [
      '/images/360/OPD-1stFloor.JPG',
      '/images/360/OPD-3rdFloor.JPG',
      "/images/360/King's Room/KingRoom-Patient.JPG",
    ],
    doctors: [
      { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist' },
      { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist' },
      { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist' },
      { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist' },
    ],
  },
  {
    id: 'opd3',
    name: 'OPD – 3rd Floor',
    desc: 'Located on the 3rd Floor, our advanced outpatient facilities provide specialized diagnostic and treatment services. The space is designed to maximize patient flow while ensuring privacy and comfort for every consultation.\n\nState-of-the-art medical equipment is available throughout the floor, supporting our clinicians in delivering precise diagnoses and effective treatment plans for all patients.',
    src: '/images/360/OPD-3rdFloor.JPG',
    extraPhotos: [
      '/images/360/OPD-1stFloor.JPG',
      '/images/360/OPD-2ndFloor.JPG',
      '/images/360/StandardRoom.JPG',
    ],
    doctors: [
      { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist' },
      { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist' },
      { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist' },
      { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist' },
    ],
  },
  {
    id: 'king-patient',
    name: "King's Suite",
    desc: "Our King's Suite represents the pinnacle of luxury patient accommodation, combining world-class medical care with five-star comfort. The suite features a private patient room, dedicated guest room, and a spacious living area.\n\nEvery detail has been thoughtfully designed to ensure the highest level of comfort and privacy. Dedicated nursing staff and personalised service ensure an exceptional experience for both patient and accompanying family members.",
    src: "/images/360/King's Room/KingRoom-Patient.JPG",
    extraPhotos: [
      "/images/360/King's Room/KingRoom-GuestRoom.JPG",
      "/images/360/King's Room/KingRoom-LivingRoom.JPG",
      '/images/360/OPD-1stFloor.JPG',
    ],
    doctors: [
      { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist' },
      { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist' },
      { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist' },
      { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist' },
    ],
  },
  {
    id: 'queen-patient',
    name: "Queen's Suite",
    desc: "The Queen's Suite offers an elegant and comfortable environment for patients seeking premium inpatient care. Designed with refined aesthetics and functional layout, this suite provides exceptional comfort throughout your stay.\n\nDedicated support staff ensure attentive care at all times, while the suite's thoughtful amenities allow family members to remain close during treatment and recovery.",
    src: "/images/360/Queen's Room/QueenRoom-PatientRoom.JPG",
    extraPhotos: [
      "/images/360/Queen's Room/QueenRoom-GuestRoom.JPG",
      "/images/360/Queen's Room/QueenRoom-LivingRoom.JPG",
      '/images/360/OPD-2ndFloor.JPG',
    ],
    doctors: [
      { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist' },
      { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist' },
      { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist' },
      { name: 'DR. Eudaldo Gonzalez Martines', specialty: 'Orthopedic and Trauma Specialist' },
    ],
  },
]
