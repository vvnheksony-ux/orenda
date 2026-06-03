import Image from 'next/image'

export default function OurClinics() {
  return (
    <div className="flex flex-col gap-[40px] items-end w-full max-w-[1356px]">

      {/* Title */}
      <h2 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none text-center w-full">
        Our Clinics
      </h2>

      {/* Image + first paragraph row */}
      <div className="flex gap-[40px] items-start w-full">
        <div className="relative shrink-0 w-[536px] h-[510px] rounded-[24px] overflow-hidden shadow-[0px_4px_30px_12px_rgba(220,189,114,0.12)] bg-white">
          <Image
            src="/images/about/about-vision.jpg"
            alt="Our Clinics"
            fill
            className="object-cover"
            sizes="536px"
          />
        </div>
        <p className="flex-1 font-dm-sans font-light text-[24px] text-black leading-[1.8] min-w-0">
          We began our journey as a health care service provider in 2014 as a very small clinic, called Sokha, providing consultation on gynecology and infertility-related issues. In 2018, Sokha developed into a polyclinic called Orienda. From its inception and for only a period of less than 2 years, Orienda received a remarkable success and vast supports from Cambodian people for having handled complicated cases and saved lives. Such success earned us a recognition internationally, notably ISO9001:2005 from UE CERT and Best Women&apos;s Health Care Award from Global Health Award of Singapore.{' '}
          <br /><br />
          With such support, we moved to open our second branch.
        </p>
      </div>

      {/* Full-width second paragraph */}
      <p className="font-dm-sans font-light text-[24px] text-black leading-[1.8] w-full">
        Orienda International Hospital offers comprehensive medical services including fertility-related issues, maternity, gynecology, obstetrics, general medicines, diabetes, neo-ICU, laboratory, emergency with 24-hour service coverage and air ambulance. Our quality services are made possible by qualified and experienced doctors and latest medical technology including MRI, CT Scan, X-Ray, Bone Densitometry, mammogram that could provide highly accurate test for scanning of tissues, cells, veins, bones and other various part of bodies. To offer confidence in accuracy of our test results, we have cooperated with a leading Singaporean imaging company called Medisol Solution that can provide a highly accurate translation of the test results. We are one of the biggest Hospital in Cambodia.
      </p>

    </div>
  )
}
