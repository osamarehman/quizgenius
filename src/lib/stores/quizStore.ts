import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface Quiz {
  id: string;
  title: string;
  description: string;
  sub_category: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  is_published: boolean;
  time_limit: number;
  category_id: string;
  sub_category_id: string;
  education_system_id: string;
  image_url?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'medium';
}

interface QuizFilters {
  category: string;
  search: string;
  sort: string;
  difficulty: string;
}

interface QuizState {
  quizzes: Quiz[];
  loading: boolean;
  error: string | null;
  filters: QuizFilters;
  setFilters: (filters: Partial<QuizState['filters']>) => void;
  fetchQuizzes: () => Promise<void>;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  quizzes: [],
  loading: false,
  error: null,
  filters: {
    category: 'all',
    search: '',
    sort: 'newest',
    difficulty: 'all'
  },
  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters }
    }));
    get().fetchQuizzes();
  },
  fetchQuizzes: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      let query = supabase
        .from('quizzes')
        .select(`
          *
        `);

      if (filters.category !== 'all') {
        query = query.eq('category_id', filters.category);
      }
      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }
      if (filters.difficulty !== 'all') {
        query = query.eq('difficulty', filters.difficulty);
      }

      switch (filters.sort) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'popular':
          query = query.order('created_at', { ascending: false });
          break;
        case 'difficulty':
          query = query.order('difficulty', { ascending: true });
          break;
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      // Add default difficulty if not set
      const quizzesWithDifficulty = (data || []).map(quiz => ({
        ...quiz,
        difficulty: quiz.difficulty || 'beginner'
      }));

      set({ quizzes: quizzesWithDifficulty, loading: false });
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      set({ error: 'Failed to fetch quizzes', loading: false });
    }
  }
}));