import type { ReactNode } from 'react'

type PageStateProps = {
  title: string
  message: string
  children?: ReactNode
}

export default function PageState({ title, message, children }: PageStateProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 rounded-[16px] bg-white/70 px-6 py-12 text-center shadow-[0px_4px_16px_rgba(122,95,44,0.08)]">
      <div className="flex max-w-[560px] flex-col gap-2">
        <h2 className="font-cormorant text-[32px] font-bold leading-none text-[#3b2d17]">{title}</h2>
        <p className="font-dm-sans text-[16px] leading-[1.6] text-[#594522]">{message}</p>
      </div>
      {children ? <div className="flex flex-wrap items-center justify-center gap-3">{children}</div> : null}
    </div>
  )
}
