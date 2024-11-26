'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Database,
  Settings,
  PenTool,
  Users,
  Upload,
  FileText,
} from 'lucide-react'

const links = [
  {
    href: '/dashboard/admin',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />
  },
  {
    href: '/dashboard/admin/quizzes',
    label: 'Quizzes',
    icon: <PenTool className="h-4 w-4" />
  },
  {
    href: '/dashboard/admin/questions',
    label: 'Questions Bank',
    icon: <Database className="h-4 w-4" />
  },
  {
    href: '/dashboard/admin/users',
    label: 'User Management',
    icon: <Users className="h-4 w-4" />
  },
  {
    href: '/dashboard/admin/bulk-upload',
    label: 'Bulk Upload',
    icon: <Upload className="h-4 w-4" />
  },
  {
    href: '/dashboard/admin/quiz-extractor',
    label: 'Quiz Extractor',
    icon: <FileText className="h-4 w-4" />
  },
  {
    href: '/dashboard/admin/settings',
    label: 'Settings',
    icon: <Settings className="h-4 w-4" />
  }
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <nav className="flex-1">
      <ul role="list" className="flex flex-1 flex-col gap-1 px-4">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                'group flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                pathname === link.href
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              )}
            >
              {link.icon}
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}