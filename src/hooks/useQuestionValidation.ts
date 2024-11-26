import { useState, useCallback } from 'react';
import { ValidationError } from '@/types/validation';
import { Question } from '@/types/quiz';

interface QuestionValidationOptions {
  onValidationComplete?: (errors: ValidationError[]) => void;
  onValidationError?: (error: Error) => void;
}

export function useQuestionValidation(options: QuestionValidationOptions = {}) {
  const [isValidating, setIsValidating] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const validateQuestion = useCallback(async (question: Question) => {
    try {
      setIsValidating(true);
      setErrors([]);

      // Basic validation rules
      const validationErrors: ValidationError[] = [];

      // Question text validation
      if (!question.text?.trim()) {
        validationErrors.push({
          type: 'error',
          message: 'Question text cannot be empty',
          field: 'text'
        });
      }

      // Options validation
      if (!question.options?.length || question.options.length < 2) {
        validationErrors.push({
          type: 'error',
          message: 'Question must have at least 2 options',
          field: 'options'
        });
      } else {
        // Check for empty options
        question.options.forEach((option, index) => {
          if (!option.text?.trim()) {
            validationErrors.push({
              type: 'error',
              message: `Option ${index + 1} cannot be empty`,
              field: `options[${index}]`
            });
          }
        });
      }

      // Correct answer validation
      if (question.correctAnswer === undefined || question.correctAnswer === null) {
        validationErrors.push({
          type: 'error',
          message: 'Correct answer must be specified',
          field: 'correctAnswer'
        });
      }

      setErrors(validationErrors);
      options.onValidationComplete?.(validationErrors);

      return {
        isValid: validationErrors.length === 0,
        errors: validationErrors
      };
    } catch (error) {
      const validationError = error instanceof Error ? error : new Error('Validation failed');
      options.onValidationError?.(validationError);
      throw validationError;
    } finally {
      setIsValidating(false);
    }
  }, [options]);

  const resetValidation = useCallback(() => {
    setIsValidating(false);
    setErrors([]);
  }, []);

  return {
    isValidating,
    errors,
    validateQuestion,
    resetValidation
  };
}