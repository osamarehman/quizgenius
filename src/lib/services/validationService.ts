import { Question, ValidationSummary } from '@/lib/ai/types'
import { validateQuestion, ValidationResult, ValidationError, ValidationConfig } from '@/lib/ai/validation'

export class ValidationService {
  /**
   * Validates a batch of questions with progress tracking
   * @param questions Array of questions to validate
   * @param config Validation configuration options
   * @param onProgress Optional callback for progress updates
   * @returns Promise with validation results and summary
   */
  static async validateQuestionBatch(
    questions: Question[],
    config: ValidationConfig = {},
    onProgress?: (progress: number) => void
  ): Promise<{
    results: ValidationResult[];
    summary: ValidationSummary;
  }> {
    const results: ValidationResult[] = [];
    
    for (let i = 0; i < questions.length; i++) {
      try {
        const result = await validateQuestion(questions[i], config);
        results.push(result);
        
        if (onProgress) {
          onProgress(((i + 1) / questions.length) * 100);
        }
      } catch (error) {
        console.error(`Error validating question ${i}:`, error);
        // Add an error result for failed validation
        results.push({
          errors: [{
            id: 'validation-error',
            message: 'Failed to validate question',
            severity: 'error',
            category: 'structure',
            passed: false,
            details: error instanceof Error ? error.message : 'Unknown error'
          }],
          warnings: [],
          info: [],
          all: [],
          isValid: false
        });
      }
    }

    const summary = this.generateValidationSummary(results);
    return { results, summary };
  }

  /**
   * Generates a summary of validation results
   * @param results Array of validation results
   * @returns ValidationSummary object
   */
  private static generateValidationSummary(results: ValidationResult[]): ValidationSummary {
    const summary: ValidationSummary = {
      totalErrors: 0,
      totalWarnings: 0,
      totalInfo: 0,
      categorySummary: {
        content: 0,
        structure: 0,
        pedagogy: 0,
        accessibility: 0
      },
      isValid: true
    };

    results.forEach(result => {
      summary.totalErrors += result.errors.length;
      summary.totalWarnings += result.warnings.length;
      summary.totalInfo += result.info.length;
      summary.isValid = summary.isValid && result.isValid;

      // Count issues by category
      [...result.errors, ...result.warnings, ...result.info].forEach(issue => {
        if (issue.category in summary.categorySummary) {
          summary.categorySummary[issue.category as keyof typeof summary.categorySummary]++;
        }
      });
    });

    return summary;
  }

  /**
   * Gets auto-fixable validation errors
   * @param results Array of validation results
   * @returns Array of auto-fixable validation errors
   */
  static getAutoFixableErrors(results: ValidationResult[]): ValidationError[] {
    return results.flatMap(result => 
      [...result.errors, ...result.warnings, ...result.info]
        .filter(error => error.autoFix)
    );
  }

  /**
   * Checks if a question passes critical validation rules
   * @param question Question to validate
   * @returns Promise<boolean>
   */
  static async isQuestionValid(question: Question): Promise<boolean> {
    const result = await validateQuestion(question, {
      checkContent: true,
      checkStructure: true,
      checkAccessibility: false,
      checkLanguage: false
    });
    return result.isValid;
  }
}
