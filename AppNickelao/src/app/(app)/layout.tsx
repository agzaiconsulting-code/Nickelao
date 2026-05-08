import { getCurrentUser } from '@/lib/auth'
import BottomNav from '@/components/BottomNav'
import AppHeader from '@/components/AppHeader'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  const role = user?.role ?? 'CLIENT'
  const initialUser = user
    ? { name: user.name, image: user.image, role: user.role }
    : null

  return (
    <div className="bg-[#F5F4E6] min-h-screen pb-20">
      <AppHeader initialUser={initialUser} />
      {children}
      <BottomNav role={role} />
    </div>
  )
}
