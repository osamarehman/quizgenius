import { useState, useCallback } from 'react';
import { ValidationError, ValidationSummary } from '@/types/validation';

interface ValidationState {
  isValidating: boolean;
  errors: ValidationError[];
  summary: ValidationSummary | null;
}

interface ValidationOptions {
  onValidationComplete?: (summary: ValidationSummary) => void;
  onValidationError?: (error: Error) => void;
}

export function useValidation(options: ValidationOptions = {}) {
  const [state, setState] = useState<ValidationState>({
    isValidating: false,
    errors: [],
    summary: null
  });

  const validate = useCallback(async (content: string) => {
    try {
      setState(prev => ({ ...prev, isValidating: true, errors: [] }));

      // Simulated validation delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const validationErrors: ValidationError[] = [];
      let errorCount = 0;
      const warningCount = 0;

      // Basic content validation
      if (!content.trim()) {
        validationErrors.push({
          type: 'error',
          message: 'Content cannot be empty',
          line: 1,
          column: 1
        });
        errorCount++;
      }

      // Create validation summary
      const summary: ValidationSummary = {
        errorCount,
        warningCount,
        passedChecks: validationErrors.length === 0,
        timestamp: new Date().toISOString()
      };

      setState(prev => ({
        ...prev,
        isValidating: false,
        errors: validationErrors,
        summary
      }));

      options.onValidationComplete?.(summary);

      return {
        success: validationErrors.length === 0,
        errors: validationErrors,
        summary
      };
    } catch (error) {
      const validationError = error instanceof Error ? error : new Error('Validation failed');
      setState(prev => ({ ...prev, isValidating: false }));
      options.onValidationError?.(validationError);
      throw validationError;
    }
  }, [options]);

  const reset = useCallback(() => {
    setState({
      isValidating: false,
      errors: [],
      summary: null
    });
  }, []);

  return {
    ...state,
    validate,
    reset
  };
}