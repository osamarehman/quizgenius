'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  LineChart,
  Settings,
  PenTool
} from 'lucide-react';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const SidebarItem = ({ icon, label, href }: SidebarItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link 
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
        "hover:bg-slate-100 dark:hover:bg-slate-800",
        isActive && "bg-slate-100 dark:bg-slate-800 text-primary"
      )}
    >
      <div className="w-6 h-6">{icon}</div>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
};

export function Sidebar() {
  return (
    <div className="w-64 border-r h-screen p-4 flex flex-col gap-2 bg-black text-white">
      <div className="px-3 py-2">
        <h2 className="text-2xl font-bold">Learning Platform</h2>
      </div>
      
      <div className="flex flex-col gap-1 mt-8">
        <SidebarItem 
          icon={<LayoutDashboard className="w-5 h-5" />} 
          label="Dashboard" 
          href="/dashboard" 
        />
        <SidebarItem 
          icon={<BookOpen className="w-5 h-5" />} 
          label="Learning Paths" 
          href="/learning-paths" 
        />
        <SidebarItem 
          icon={<PenTool className="w-5 h-5" />} 
          label="Quizzes" 
          href="/quizzes" 
        />
        <SidebarItem 
          icon={<LineChart className="w-5 h-5" />} 
          label="Progress" 
          href="/progress" 
        />
        <SidebarItem 
          icon={<Trophy className="w-5 h-5" />} 
          label="Achievements" 
          href="/achievements" 
        />
        <SidebarItem 
          icon={<Settings className="w-5 h-5" />} 
          label="Settings" 
          href="/settings" 
        />
      </div>
    </div>
  );
} 