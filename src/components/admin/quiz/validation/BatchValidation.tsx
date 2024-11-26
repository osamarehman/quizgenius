import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface ValidationResult {
  errors: ValidationError[];
  warnings: ValidationError[];
  infos: ValidationError[];
  totalChecks: number;
  completedChecks: number;
}

interface BatchValidationProps {
  onValidate: () => Promise<ValidationResult>;
  onCancel: () => void;
  isValidating: boolean;
}

export default function BatchValidation({ onValidate, onCancel, isValidating }: BatchValidationProps) {
  const { toast } = useToast();
  const [progress, setProgress] = React.useState(0);
  const [result, setResult] = React.useState<ValidationResult | null>(null);

  const handleValidate = async () => {
    try {
      const validationResult = await onValidate();
      setResult(validationResult);
      setProgress(100);
      
      const { errors, warnings } = validationResult;
      if (errors.length > 0) {
        toast({
          title: 'Validation Failed',
          description: `Found ${errors.length} errors and ${warnings.length} warnings`,
          variant: 'destructive',
        });
      } else if (warnings.length > 0) {
        toast({
          title: 'Validation Complete',
          description: `Found ${warnings.length} warnings`,
          variant: 'warning',
        });
      } else {
        toast({
          title: 'Validation Successful',
          description: 'No issues found',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: 'Validation Error',
        description: 'An error occurred during validation',
        variant: 'destructive',
      });
    }
  };

  React.useEffect(() => {
    if (isValidating) {
      const timer = setInterval(() => {
        setProgress(prev => {
          const next = prev + 1;
          return next > 95 ? 95 : next;
        });
      }, 100);

      return () => clearInterval(timer);
    }
  }, [isValidating]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Validation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress value={progress} className="w-full" />
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isValidating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleValidate}
              disabled={isValidating}
            >
              Start Validation
            </Button>
          </div>

          {result && (
            <div className="mt-4 space-y-2">
              <p>Validation Results:</p>
              <ul className="list-disc pl-5">
                <li className="text-red-500">
                  {result.errors.length} Errors
                </li>
                <li className="text-yellow-500">
                  {result.warnings.length} Warnings
                </li>
                <li className="text-blue-500">
                  {result.infos.length} Info
                </li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}