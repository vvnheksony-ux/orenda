import Image from 'next/image'

export default function PayloadNavBrand() {
  return (
    <div className="bg-[#5a431f] w-full">
      <Image src="/logo-cropped.png" width={400} height={104} alt="Orienda Logo" priority />
      <p>Admin Portal</p>
    </div>
  )
}
