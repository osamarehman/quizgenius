import { QuizFilters } from '@/components/quiz/QuizFilters';
import { QuizGrid } from '@/components/quiz/QuizGrid';

export default function QuizzesPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Quizzes</h1>
      </div>
      
      <QuizFilters />
      <QuizGrid />
    </div>
  );
} 