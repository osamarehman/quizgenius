'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  Trophy,
  Settings,
  PenTool
} from 'lucide-react'

const links = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />
  },
  {
    href: '/learning-paths',
    label: 'Learning Paths',
    icon: <BookOpen className="h-4 w-4" />
  },
  {
    href: '/quizzes',
    label: 'Quizzes',
    icon: <PenTool className="h-4 w-4" />
  },
  {
    href: '/progress',
    label: 'Progress',
    icon: <TrendingUp className="h-4 w-4" />
  },
  {
    href: '/achievements',
    label: 'Achievements',
    icon: <Trophy className="h-4 w-4" />
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: <Settings className="h-4 w-4" />
  }
] as const

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <nav className="grid gap-1 px-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
            pathname === link.href 
              ? "bg-accent text-accent-foreground" 
              : "text-muted-foreground"
          )}
        >
          {link.icon}
          <span>{link.label}</span>
        </Link>
      ))}
    </nav>
  )
} 