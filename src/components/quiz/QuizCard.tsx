'use client'

import React from 'react';
import { Clock, BookOpen } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface QuizCardProps {
  id: string;
  title: string;
  description: string;
  time_limit: number;
  sub_category?: string;
  created_at: string;
  image_url?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'medium';
}

export function QuizCard({
  id,
  title,
  description,
  time_limit,
  sub_category,
  created_at,
  image_url,
  difficulty = 'beginner'
}: QuizCardProps) {
  const router = useRouter();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'advanced':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'expert':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
      {image_url ? (
        <div className="relative h-48 w-full">
          <Image
            src={image_url}
            alt={title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute top-2 right-2 flex gap-2">
            {sub_category && (
              <div className="bg-white/90 dark:bg-slate-800/90 px-2 py-1 rounded text-sm">
                {sub_category}
              </div>
            )}
            <div className={`px-2 py-1 rounded text-sm capitalize ${getDifficultyColor(difficulty)}`}>
              {difficulty}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-24 bg-gradient-to-r from-primary/10 to-primary/5 flex items-center justify-center relative">
          <h3 className="text-xl font-semibold text-primary/70">{title}</h3>
          <div className="absolute top-2 right-2 flex gap-2">
            {sub_category && (
              <div className="bg-white/90 dark:bg-slate-800/90 px-2 py-1 rounded text-sm">
                {sub_category}
              </div>
            )}
            <div className={`px-2 py-1 rounded text-sm capitalize ${getDifficultyColor(difficulty)}`}>
              {difficulty}
            </div>
          </div>
        </div>
      )}
      
      <div className="p-4">
        <h3 className="font-semibold text-lg">{!image_url && title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        
        <div className="flex gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{time_limit ? `${time_limit} mins` : 'No time limit'}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{new Date(created_at).toLocaleDateString()}</span>
          </div>
        </div>
        
        <button 
          onClick={() => router.push(`/quizzes/${id}/take`)}
          className="mt-4 w-full bg-primary text-black py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
} 