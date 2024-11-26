import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r bg-background">
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <AdminSidebar />
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
