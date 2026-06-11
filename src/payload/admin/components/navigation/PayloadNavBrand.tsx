import Image from 'next/image'

export default function PayloadNavBrand() {
  return (
    <div className="bg-[#5a431f] w-full">
      <Image src="/logo.png" width={400} height={104} alt="Orienda Logo" priority />
      <p>Orienda Staff Portal</p>
    </div>
  )
}
