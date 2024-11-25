'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  BookOpen,
  Upload,
  Database,
  Settings,
  PenTool,
  FileSpreadsheet,
  Users,
  BookMarked,
  GraduationCap,
  Trophy,
  LineChart,
  Download
} from 'lucide-react'

const links = [
  {
    href: '/dashboard/admin/dashboard',
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
    href: '/dashboard/admin/learning-paths',
    label: 'Learning Paths',
    icon: <BookOpen className="h-4 w-4" />
  },
  {
    href: '/dashboard/admin/users',
    label: 'Users',
    icon: <Users className="h-4 w-4" />
  },
  {
    href: '/dashboard/admin/subjects',
    label: 'Subjects',
    icon: <BookMarked className="h-4 w-4" />
  },
  {
    href: '/dashboard/admin/education-systems',
    label: 'Education Systems',
    icon: <GraduationCap className="h-4 w-4" />
  },
  {
    href: '/dashboard/admin/achievements',
    label: 'Achievements',
    icon: <Trophy className="h-4 w-4" />
  },
  {
    href: '/dashboard/admin/analytics',
    label: 'Analytics',
    icon: <LineChart className="h-4 w-4" />
  },
  {
    href: '/dashboard/admin/quiz-extractor',
    label: 'Quiz Extractor',
    icon: <Download className="h-4 w-4" />
  },
  {
    href: '#',
    label: 'Bulk Upload',
    icon: <Upload className="h-4 w-4" />,
    subItems: [
      {
        href: '/dashboard/admin/bulk-upload/quizzes',
        label: 'Upload Quizzes',
        icon: <FileSpreadsheet className="h-4 w-4" />
      },
      {
        href: '/dashboard/admin/bulk-upload/questions',
        label: 'Upload Questions',
        icon: <FileSpreadsheet className="h-4 w-4" />
      }
    ]
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
    <nav className="grid gap-1 px-2">
      {links.map((link) => (
        <div key={link.href}>
          {link.subItems ? (
            <>
              <div className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground">
                {link.icon}
                <span>{link.label}</span>
              </div>
              <div className="ml-6 mt-1 space-y-1">
                {link.subItems.map((subItem) => (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                      pathname === subItem.href 
                        ? "bg-accent text-accent-foreground" 
                        : "text-muted-foreground"
                    )}
                  >
                    {subItem.icon}
                    <span>{subItem.label}</span>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <Link
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
          )}
        </div>
      ))}
    </nav>
  )
} 