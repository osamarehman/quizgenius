'use client'

import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Skip dashboard layout for admin routes
  if (pathname?.includes('/admin')) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r bg-background">
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Learning Platform</h1>
          </div>
          <DashboardSidebar />
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}