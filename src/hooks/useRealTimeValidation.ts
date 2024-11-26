import { useState, useCallback, useEffect } from 'react';
import { ValidationError } from '@/types/validation';

interface RealTimeValidationOptions {
  onValidationComplete?: (errors: ValidationError[]) => void;
  onValidationError?: (error: Error) => void;
  debounceMs?: number;
}

export function useRealTimeValidation(options: RealTimeValidationOptions = {}) {
  const [isValidating, setIsValidating] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [content, setContent] = useState('');
  const { debounceMs = 500 } = options;

  const validateContent = useCallback(async (text: string) => {
    try {
      setIsValidating(true);
      setErrors([]);

      // Basic validation rules
      const validationErrors: ValidationError[] = [];

      // Content validation
      if (!text.trim()) {
        validationErrors.push({
          type: 'error',
          message: 'Content cannot be empty',
          field: 'content'
        });
      }

      // Length validation
      if (text.length > 1000) {
        validationErrors.push({
          type: 'warning',
          message: 'Content is too long (max 1000 characters)',
          field: 'content'
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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (content) {
        validateContent(content);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [content, debounceMs, validateContent]);

  const updateContent = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  const resetValidation = useCallback(() => {
    setIsValidating(false);
    setErrors([]);
    setContent('');
  }, []);

  return {
    isValidating,
    errors,
    content,
    updateContent,
    validateContent,
    resetValidation
  };
}