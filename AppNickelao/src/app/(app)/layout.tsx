import { getCurrentUser } from '@/lib/auth'
import BottomNav from '@/components/BottomNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  const role = user?.role ?? 'CLIENT'

  return (
    <div className="bg-[#F5F4E6] min-h-screen pb-20">
      {children}
      <BottomNav role={role} />
    </div>
  )
}
