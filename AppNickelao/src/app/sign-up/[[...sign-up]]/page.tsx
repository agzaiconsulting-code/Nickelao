'use client'

import { SignUp } from '@clerk/nextjs'
import Image from 'next/image'

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-[#1E2A27] flex flex-col items-center justify-center gap-8 px-4">
      <div className="flex flex-col items-center gap-3">
        <Image
          src="/logo.jpeg"
          alt="Nickelao Barber"
          width={88}
          height={88}
          className="rounded-2xl border-2 border-[#F2C230]"
        />
        <h1 className="text-[#F5F4E6] text-2xl font-bold tracking-wide">
          Nickelao Barber
        </h1>
        <p className="text-[#A7A8A3] text-sm">Foz · Mondoñedo</p>
      </div>
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/complete-profile"
      />
    </main>
  )
}
