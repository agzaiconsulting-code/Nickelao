import { getCurrentUser } from '@/lib/auth'
import AppHeader from '@/components/AppHeader'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  const initialUser = user
    ? { name: user.name, image: user.image, role: user.role }
    : null

  return (
    <div className="bg-[#F5F4E6] min-h-screen">
      <AppHeader initialUser={initialUser} />
      {children}
    </div>
  )
}
