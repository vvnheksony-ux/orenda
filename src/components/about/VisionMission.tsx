import Image from 'next/image'

export default function VisionMission() {
  return (
    <div className="flex flex-col items-center w-full gap-[0px]">

      {/* Section header */}
      <div className="flex flex-col gap-[12px] text-center w-full mb-[56px]">
        <h2 className="font-cormorant font-bold text-[48px] text-[#3b2d17] leading-none">
          Our Vision &amp; Mission
        </h2>
        <p className="font-dm-sans text-[20px] text-[#594522] leading-none">
          A selected team of experts committed to your health
        </p>
      </div>

      {/* Vision — photo left, text card overlapping right */}
      <div className="relative w-[1261px] h-[508px] mb-[120px]">
        {/* Photo card */}
        <div className="absolute left-0 top-0 w-[645px] h-[459px] rounded-[22px] overflow-hidden shadow-[0px_3.6px_27px_10.8px_rgba(220,189,114,0.12)] bg-white">
          <Image
            src="/images/about/about-vision.jpg"
            alt="Vision"
            fill
            className="object-cover"
            sizes="645px"
          />
        </div>
        {/* Text card */}
        <div className="absolute left-[565px] top-[198px] w-[658px] h-[310px] rounded-[22px] bg-[#fbf7ee] shadow-[0px_3.6px_27px_10.8px_rgba(138,124,88,0.12)] flex flex-col justify-center pl-[126px] pr-[36px] py-[36px] gap-[22px]">
          <h3 className="font-cormorant font-bold text-[43px] text-black leading-none">Vision</h3>
          <p className="font-dm-sans font-normal text-[22px] text-black leading-[1.5]">
            Our vision is to become a leading healthcare center dedicated to delivering trusted, compassionate, and world-class care.
          </p>
        </div>
      </div>

      {/* Mission — text card left, photo right */}
      <div className="relative w-[1261px] h-[431px]">
        {/* Text card */}
        <div className="absolute left-0 top-[120px] w-[581px] h-[305px] rounded-[22px] bg-[#fbf7ee] shadow-[0px_3.6px_27px_10.8px_rgba(138,124,88,0.12)] flex flex-col justify-center pl-[36px] pr-[66px] py-[36px] gap-[22px]">
          <h3 className="font-cormorant font-bold text-[43px] text-black leading-none">Mission</h3>
          <p className="font-dm-sans font-normal text-[22px] text-black leading-[1.5]">
            Our mission is to provide exceptional clinical care and deliver outstanding service quality and patient-centered excellence.
          </p>
        </div>
        {/* Photo card */}
        <div className="absolute left-[574px] top-0 w-[666px] h-[431px] rounded-[22px] overflow-hidden shadow-[0px_3.6px_27px_10.8px_rgba(220,189,114,0.12)] bg-white">
          <Image
            src="/images/about/about-mission.jpg"
            alt="Mission"
            fill
            className="object-cover"
            sizes="666px"
          />
        </div>
      </div>

    </div>
  )
}
