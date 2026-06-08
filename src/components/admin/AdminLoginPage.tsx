import { LockKeyhole, Mail, ShieldCheck } from 'lucide-react'

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f8f7f5] px-4 py-12 pt-32 lg:pt-12">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-[0_24px_70px_rgba(53,42,22,0.16)] ring-1 ring-[#eee7dc] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative hidden bg-[#3b2a14] p-10 text-[#dacdb8] lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(196,154,66,0.35),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.08),transparent_42%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <div className="grid size-16 place-items-center rounded-full bg-white text-2xl font-bold text-[#6a4f23] shadow-sm">DA</div>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.32em] text-[#b38a3c]">Orienda Staff Portal</p>
              <h1 className="mt-4 text-4xl font-bold leading-tight text-white">Secure hospital operations dashboard.</h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-[#c6b69a]">
                Access appointments, content workflow, analytics, and hospital operations from one custom admin layer.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10 lg:p-12">
          <div className="mx-auto max-w-md">
            <div className="lg:hidden">
              <div className="grid size-14 place-items-center rounded-full bg-[#3b2a14] text-xl font-bold text-white">DA</div>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.28em] text-[#b38a3c]">Orienda Staff Portal</p>
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-[#242424] lg:mt-0">Admin Login</h2>
            <p className="mt-2 text-sm text-[#8f8a82]">Sign in to manage Orienda International Hospital content and operations.</p>

            <form className="mt-8 space-y-5">
              <label className="block">
                <span className="text-sm font-bold text-[#4a4031]">Email Address</span>
                <span className="mt-2 flex h-13 items-center gap-3 rounded-2xl border border-[#eee5d7] bg-[#fbfaf8] px-4 transition focus-within:border-[#c49a42] focus-within:bg-white">
                  <Mail className="size-5 text-[#a99061]" />
                  <input type="email" placeholder="admin@orienda.com" className="w-full bg-transparent text-sm text-[#2d2b28] outline-none placeholder:text-[#b9b2a9]" />
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-[#4a4031]">Password</span>
                <span className="mt-2 flex h-13 items-center gap-3 rounded-2xl border border-[#eee5d7] bg-[#fbfaf8] px-4 transition focus-within:border-[#c49a42] focus-within:bg-white">
                  <LockKeyhole className="size-5 text-[#a99061]" />
                  <input type="password" placeholder="Enter password" className="w-full bg-transparent text-sm text-[#2d2b28] outline-none placeholder:text-[#b9b2a9]" />
                </span>
              </label>

              <div className="flex items-center justify-between gap-4 text-sm">
                <label className="flex items-center gap-2 text-[#6d675f]">
                  <input type="checkbox" className="size-4 rounded border-[#d8c6a6] accent-[#b88a34]" />
                  Remember me
                </label>
                <a href="#" className="font-semibold text-[#a97c2d] hover:text-[#7c581d]">Forgot password?</a>
              </div>

              <button type="submit" className="h-13 w-full rounded-2xl bg-[#3b2a14] text-sm font-bold text-white shadow-[0_14px_30px_rgba(59,42,20,0.22)] transition hover:bg-[#4a3519]">
                Sign In
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-[#9b948b]">Authorized staff only. All actions are recorded in audit logs.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
