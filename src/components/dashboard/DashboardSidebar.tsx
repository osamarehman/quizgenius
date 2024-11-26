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
  PenTool,
  LogOut
} from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/button'

const links = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />
  },
  {
    href: '/dashboard/learning-paths',
    label: 'Learning Paths',
    icon: <BookOpen className="h-4 w-4" />
  },
  {
    href: '/dashboard/quizzes',
    label: 'Quizzes',
    icon: <PenTool className="h-4 w-4" />
  },
  {
    href: '/dashboard/progress',
    label: 'Progress',
    icon: <TrendingUp className="h-4 w-4" />
  },
  {
    href: '/dashboard/achievements',
    label: 'Achievements',
    icon: <Trophy className="h-4 w-4" />
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: <Settings className="h-4 w-4" />
  }
] as const

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <div className="flex flex-col justify-between h-full py-4">
      <nav className="space-y-1 px-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
              pathname === link.href || pathname?.startsWith(link.href + '/')
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
            )}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="px-2 mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}