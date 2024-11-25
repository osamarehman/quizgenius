import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';

interface Quiz {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: string;
  category_id: string;
  thumbnail_url: string;
  created_at: string;
}

interface QuizState {
  quizzes: Quiz[];
  loading: boolean;
  error: string | null;
  filters: {
    category: string;
    difficulty: string;
    search: string;
    sort: string;
  };
  setFilters: (filters: Partial<QuizState['filters']>) => void;
  fetchQuizzes: () => Promise<void>;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  quizzes: [],
  loading: false,
  error: null,
  filters: {
    category: 'all',
    difficulty: 'all',
    search: '',
    sort: 'newest'
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
          *,
          categories(name)
        `)
        .eq('is_published', true);

      if (filters.category !== 'all') {
        query = query.eq('category_id', filters.category);
      }
      if (filters.difficulty !== 'all') {
        query = query.eq('difficulty', filters.difficulty);
      }
      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      switch (filters.sort) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'popular':
          query = query.order('total_attempts', { ascending: false });
          break;
        // Add more sorting options as needed
      }

      const { data, error } = await query;

      if (error) throw error;
      set({ quizzes: data, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch quizzes', loading: false });
    }
  }
})); 