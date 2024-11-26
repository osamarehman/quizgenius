import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

interface UploadMapping {
  [key: string]: string;
}

interface QuizData {
  title: string;
  description: string;
  category_id: string;
  education_system_id: string;
  is_published?: boolean;
  time_limit?: number;
  [key: string]: string | number | boolean | undefined;
}

interface QuestionData {
  question_text: string;
  quiz_id: string;
  order_number: number;
  answer_1: string;
  answer_2: string;
  answer_3: string;
  answer_4: string;
  correct_answer: string;
  [key: string]: string | number;
}

interface Answer {
  question_id: string;
  answer_text: string;
  is_correct: boolean;
  order_number: number;
  explanation?: string;
}

interface UploadResult {
  success: boolean;
  message: string;
  error?: {
    message: string;
    field?: string;
  };
}

export const uploadService = {
  async parseFile<T>(file: File): Promise<T[]> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
      return new Promise((resolve, reject) => {
        Papa.parse(file, {
          complete: (results) => {
            if (!results.data || !Array.isArray(results.data) || results.data.length < 2) {
              reject(new Error('Invalid CSV format or empty file'));
              return;
            }

            try {
              // Ensure we have valid headers
              const rawData = results.data as string[][];
              const headers = rawData[0];
              
              if (!Array.isArray(headers) || headers.length === 0) {
                reject(new Error('No headers found in CSV file'));
                return;
              }

              // Process each row
              const parsedData = rawData.slice(1)
                .filter(row => row.length === headers.length && row.some(cell => cell !== '')) // Skip empty rows
                .map(row => {
                  const obj: Record<string, string> = {};
                  headers.forEach((header, index) => {
                    // Clean header names and use them as keys
                    const cleanHeader = header.trim().replace(/[\s\W]+/g, '_').toLowerCase();
                    obj[cleanHeader] = row[index]?.trim() ?? '';
                  });
                  return obj as T;
                });

              resolve(parsedData);
            } catch (error) {
              reject(new Error(`Error parsing CSV: ${error instanceof Error ? error.message : 'Unknown error'}`));
            }
          },
          error: (error) => reject(error),
          skipEmptyLines: true,
        });
      });
    } else if (extension === 'xlsx' || extension === 'xls') {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      return XLSX.utils.sheet_to_json<T>(worksheet);
    } else {
      throw new Error('Unsupported file format. Please use CSV, XLSX, or XLS files.');
    }
  },

  async uploadQuizzes(file: File, mapping: UploadMapping): Promise<UploadResult> {
    try {
      const data = await this.parseFile<Record<string, string>>(file);
      const supabase = createClientComponentClient<Database>();

      let successCount = 0;
      let errorCount = 0;

      for (const row of data) {
        try {
          const quizData: QuizData = {
            title: '',
            description: '',
            category_id: '',
            education_system_id: '',
          };

          // Map fields according to the provided mapping
          for (const [field, csvField] of Object.entries(mapping)) {
            if (row[csvField]) {
              // Handle boolean values
              if (field === 'is_published') {
                quizData[field] = row[csvField].toLowerCase() === 'true';
              }
              // Handle numeric values
              else if (field === 'time_limit') {
                quizData[field] = parseInt(row[csvField], 10);
              }
              // Handle string values
              else {
                quizData[field] = row[csvField];
              }
            }
          }

          // Validate required fields
          if (!quizData.title || !quizData.description || !quizData.category_id || !quizData.education_system_id) {
            throw new Error('Missing required fields');
          }

          const { error } = await supabase.from('quizzes').insert([quizData]);
          if (error) throw error;
          successCount++;
        } catch (err) {
          console.error('Error inserting quiz:', err);
          errorCount++;
        }
      }

      return {
        success: true,
        message: `Upload complete: ${successCount} quizzes added, ${errorCount} failed`,
      };
    } catch (error) {
      console.error('Error processing file:', error);
      return {
        success: false,
        message: 'Error processing file. Please check the format and try again.',
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  },

  async uploadQuestions(
    file: File,
    mapping: UploadMapping,
    quizId: string,
    startOrderNumber: number = 1
  ): Promise<UploadResult> {
    try {
      const data = await this.parseFile<Record<string, string>>(file);
      const supabase = createClientComponentClient<Database>();

      let successCount = 0;
      let errorCount = 0;
      let currentOrderNumber = startOrderNumber;

      for (const row of data) {
        try {
          const questionData: QuestionData = {
            question_text: '',
            quiz_id: quizId,
            order_number: currentOrderNumber++,
            answer_1: '',
            answer_2: '',
            answer_3: '',
            answer_4: '',
            correct_answer: '',
          };

          // Map fields according to the provided mapping
          for (const [field, csvField] of Object.entries(mapping)) {
            if (csvField === 'auto_generated' && field === 'order_number') {
              continue; // Skip auto-generated order number
            }

            if (row[csvField]) {
              questionData[field] = row[csvField];
            }
          }

          // Validate required fields
          if (!questionData.question_text || !questionData.quiz_id) {
            throw new Error('Missing required fields');
          }

          // Insert question
          const { data: question, error: questionError } = await supabase
            .from('questions')
            .insert([questionData])
            .select()
            .single();

          if (questionError || !question) {
            throw questionError || new Error('Failed to insert question');
          }

          // Process answers
          const answers: Answer[] = [];
          for (let i = 1; i <= 6; i++) {
            const answerField = `answer_${i}`;
            const explanationField = `answer_${i}_explanation`;

            if (mapping[answerField] && row[mapping[answerField]]) {
              const answer: Answer = {
                question_id: question.id,
                answer_text: row[mapping[answerField]],
                is_correct: mapping.correct_answer && row[mapping.correct_answer] === row[mapping[answerField]],
                order_number: i,
              };

              // Add explanation if the field exists and isn't skipped
              if (mapping[explanationField] && row[mapping[explanationField]]) {
                answer.explanation = row[mapping[explanationField]];
              }

              answers.push(answer);
            }
          }

          // Ensure at least one answer exists
          if (answers.length === 0) {
            throw new Error('At least one answer is required');
          }

          // Insert answers
          const { error: answersError } = await supabase.from('answers').insert(answers);
          if (answersError) throw answersError;

          successCount++;
        } catch (error) {
          console.error('Error processing row:', error);
          errorCount++;
        }
      }

      return {
        success: true,
        message: `Processed ${successCount + errorCount} questions. ${successCount} successful, ${errorCount} failed.`,
      };
    } catch (error) {
      console.error('Error uploading questions:', error);
      return {
        success: false,
        message: 'Failed to upload questions',
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  },
};
