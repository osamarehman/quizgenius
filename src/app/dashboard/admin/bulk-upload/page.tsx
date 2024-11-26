'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ArrowRight, Download } from 'lucide-react'
import { uploadService } from '@/lib/services/uploadService'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { generateTemplates } from '@/lib/csv-templates/quiz-template'
import * as XLSX from 'xlsx'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Checkbox } from "@/components/ui/checkbox"

// Improved type definitions
type UploadTab = 'quizzes' | 'questions';
type MappingStep = 'upload' | 'mapping';
type FileType = 'quiz' | 'question';
type FileExtension = '.csv' | '.xlsx' | '.xls';

interface FileReaderEvent extends ProgressEvent<FileReader> {
  target: FileReader;
}

interface FieldMapping {
  [key: string]: { csvField: string; skip: boolean };
}

interface Quiz {
  id: string;
  title: string;
  created_at?: string;
}

interface FieldMappingUpload {
  [key: string]: string;
}

interface RequiredFieldsMap {
  quizzes: string[];
  questions: string[];
}

interface MandatoryFields {
  quizzes: string[];
  questions: string[];
}

interface ExistingQuestion {
  order_number: number;
}

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface UploadResult {
  success: boolean;
  message: string;
  errors?: ValidationError[];
}

interface UploadState {
  step: MappingStep;
  quizFile: File | null;
  questionFile: File | null;
  csvHeaders: string[];
  fieldMapping: FieldMapping;
  activeTab: UploadTab;
  quizzes: Quiz[];
  selectedQuizId: string;
}

export default function BulkUploadPage() {
  const [state, setState] = useState<UploadState>({
    step: 'upload',
    quizFile: null,
    questionFile: null,
    csvHeaders: [],
    fieldMapping: {},
    activeTab: 'quizzes',
    quizzes: [],
    selectedQuizId: ''
  });

  const fetchQuizzes = useCallback(async (): Promise<void> => {
    try {
      const supabase = createClientComponentClient<Database>();
      const { data, error } = await supabase
        .from('quizzes')
        .select('id, title, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to fetch quizzes');
        return;
      }

      setState(prev => ({ ...prev, quizzes: data || [] }));
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An error occurred while fetching quizzes');
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    if (state.activeTab === 'questions') {
      fetchQuizzes().then(() => {
        if (!mounted) return;
      });
    }

    return () => {
      mounted = false;
    };
  }, [state.activeTab, fetchQuizzes]);

  const mandatoryFields = useMemo<MandatoryFields>(() => ({
    quizzes: ['title', 'description', 'category_id', 'education_system_id'],
    questions: ['question_text', 'answer_1', 'answer_2', 'answer_3', 'answer_4', 'correct_answer']
  }), []);

  const requiredFieldsMap = useMemo<RequiredFieldsMap>(() => ({
    quizzes: [
      'title',
      'description',
      'time_limit',
      'category_id',
      'sub_category_id',
      'education_system_id',
      'is_published'
    ],
    questions: [
      'question_text',
      'question_type',
      'question_explanation',
      'order_number',
      'answer_1',
      'answer_1_explanation',
      'answer_2',
      'answer_2_explanation',
      'answer_3',
      'answer_3_explanation',
      'answer_4',
      'answer_4_explanation',
      'answer_5',
      'answer_5_explanation',
      'answer_6',
      'answer_6_explanation',
      'correct_answer'
    ]
  }), []);

  const requiredFields = useMemo(() => 
    state.activeTab === 'quizzes' ? requiredFieldsMap.quizzes : requiredFieldsMap.questions,
    [state.activeTab, requiredFieldsMap]
  );

  const autoMapFields = useCallback((headers: string[]): void => {
    const newMapping: FieldMapping = {};
    
    // Create a map of normalized header names for matching
    const normalizedHeaders = headers.map(header => 
      header.toLowerCase().replace(/[^a-z0-9]/g, '')
    );

    requiredFields.forEach(field => {
      // Normalize the field name for matching
      const normalizedField = field.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // Find exact or close matches
      const exactMatchIndex = normalizedHeaders.findIndex(h => h === normalizedField);
      const closeMatchIndex = normalizedHeaders.findIndex(h => 
        h.includes(normalizedField) || normalizedField.includes(h)
      );

      if (exactMatchIndex !== -1) {
        newMapping[field] = { csvField: headers[exactMatchIndex], skip: false };
      } else if (closeMatchIndex !== -1) {
        newMapping[field] = { csvField: headers[closeMatchIndex], skip: false };
      }
    });

    setState(prev => ({ ...prev, fieldMapping: newMapping }));
  }, [requiredFields]);

  const handleFieldMapping = useCallback((field: string, value: string): void => {
    setState(prev => ({
      ...prev,
      fieldMapping: {
        ...prev.fieldMapping,
        [field]: { ...prev.fieldMapping[field], csvField: value }
      }
    }));
  }, []);

  const handleFieldSkip = useCallback((field: string, skip: boolean): void => {
    setState(prev => ({
      ...prev,
      fieldMapping: {
        ...prev.fieldMapping,
        [field]: { ...prev.fieldMapping[field], skip }
      }
    }));
  }, []);

  const isMapComplete = useCallback((): boolean => {
    const mandatoryList = state.activeTab === 'quizzes' ? mandatoryFields.quizzes : mandatoryFields.questions;
    return mandatoryList.every(field => 
      state.fieldMapping[field]?.csvField && !state.fieldMapping[field]?.skip
    );
  }, [state.activeTab, state.fieldMapping, mandatoryFields]);

  const readFileHeaders = async (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event: FileReaderEvent) => {
        try {
          let headers: string[] = [];
          const fileExtension = file.name.slice(file.name.lastIndexOf('.')) as FileExtension;
          
          if (fileExtension === '.csv') {
            const text = event.target.result as string;
            if (typeof text !== 'string') {
              throw new Error('Invalid CSV file format');
            }
            headers = text.split('\n')[0].split(',').map(header => header.trim());
          } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
            const data = event.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const sheetData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            headers = (sheetData[0] as string[]) || [];
          } else {
            throw new Error('Unsupported file format');
          }
          
          resolve(headers);
        } catch (error) {
          reject(error instanceof Error ? error : new Error('Failed to parse file'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsBinaryString(file);
    });
  };

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, type: FileType): Promise<void> => {
    const fileInput = e.target;
    const file = fileInput.files?.[0];
    
    if (!file) {
      toast.error('No file selected');
      return;
    }
    
    const fileExtension = file.name.slice(file.name.lastIndexOf('.')) as FileExtension;
    if (!['.csv', '.xlsx', '.xls'].includes(fileExtension)) {
      toast.error('Invalid file format. Please upload a CSV or Excel file');
      fileInput.value = '';
      return;
    }

    if (type === 'quiz') {
      setState(prev => ({ ...prev, quizFile: file }));
    } else {
      setState(prev => ({ ...prev, questionFile: file }));
    }
    
    try {
      const headers = await readFileHeaders(file);
      if (headers.length === 0) {
        throw new Error('No headers found in file');
      }
      setState(prev => ({ ...prev, csvHeaders: headers }));
      autoMapFields(headers);
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to read file headers');
      fileInput.value = '';
      if (type === 'quiz') {
        setState(prev => ({ ...prev, quizFile: null }));
      } else {
        setState(prev => ({ ...prev, questionFile: null }));
      }
    }
  }, [autoMapFields]);

  const handleUpload = useCallback(async (): Promise<void> => {
    const file = state.activeTab === 'quizzes' ? state.quizFile : state.questionFile;
    if (!file || !isMapComplete() || (state.activeTab === 'questions' && !state.selectedQuizId)) {
      toast.error('Please complete all required fields before uploading');
      return;
    }

    try {
      let startOrderNumber = 1;
      if (state.activeTab === 'questions' && state.selectedQuizId) {
        const supabase = createClientComponentClient<Database>();
        const { data: existingQuestions, error } = await supabase
          .from('questions')
          .select('order_number')
          .eq('quiz_id', state.selectedQuizId)
          .order('order_number', { ascending: false })
          .limit(1);
          
        if (error) {
          throw new Error('Failed to fetch existing questions');
        }
        
        if (existingQuestions && existingQuestions.length > 0) {
          const lastQuestion = existingQuestions[0] as ExistingQuestion;
          startOrderNumber = (lastQuestion.order_number || 0) + 1;
        }
      }
      
      const mappingForUpload: FieldMappingUpload = Object.entries(state.fieldMapping)
        .reduce((acc, [key, value]) => {
          if (!value.skip) {
            acc[key] = value.csvField;
          }
          return acc;
        }, {} as FieldMappingUpload);

      let result: UploadResult;
      if (state.activeTab === 'quizzes') {
        result = await uploadService.uploadQuizzes(file, mappingForUpload);
      } else {
        if (!state.fieldMapping.order_number) {
          mappingForUpload.order_number = 'auto_generated';
        }
        result = await uploadService.uploadQuestions(file, mappingForUpload, state.selectedQuizId, startOrderNumber);
      }

      if (!result.success) {
        throw new Error(result.errors?.[0].message || 'Upload failed');
      }
      
      // Reset states
      setState(prev => ({ ...prev, step: 'upload', fieldMapping: {}, csvHeaders: [], selectedQuizId: '' }));
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
      toast.success(result.message);
    } catch (error) {
      console.error('Error uploading:', error);
      toast.error(error instanceof Error ? error.message : `Failed to upload ${state.activeTab}. Please try again.`);
    }
  }, [state.activeTab, state.quizFile, state.questionFile, isMapComplete, state.selectedQuizId, state.fieldMapping]);

  const handleDownloadTemplate = useCallback(async (): Promise<void> => {
    try {
      const templateType = state.activeTab === 'quizzes' ? 'quizzes' : 'questions';
      await generateTemplates(templateType);
      toast.success(`${templateType} template downloaded successfully`);
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to download template');
    }
  }, [state.activeTab]);

  const renderMappingStep = (): JSX.Element => {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Map Fields</h2>
          <p className="text-sm text-muted-foreground">
            Map your CSV columns to the required fields
          </p>

          {state.activeTab === 'questions' && (
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Select Quiz</label>
              <Select
                value={state.selectedQuizId}
                onValueChange={(value) => setState(prev => ({ ...prev, selectedQuizId: value }))}
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select a quiz" />
                </SelectTrigger>
                <SelectContent>
                  {state.quizzes.map((quiz) => (
                    <SelectItem key={quiz.id} value={quiz.id}>
                      {quiz.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {state.csvHeaders.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Map Fields</h3>
              {requiredFields.map((field) => (
                <div key={field} className="flex items-center gap-4">
                  <label className="w-48 text-sm font-medium">
                    {field}
                    {mandatoryFields[state.activeTab].includes(field) && 
                      <span className="text-red-500 ml-1">*</span>
                    }
                  </label>
                  <Select
                    value={state.fieldMapping[field] ? (state.fieldMapping[field].csvField || '_none') : '_none'}
                    onValueChange={(value) => handleFieldMapping(field, value === '_none' ? '' : value)}
                    disabled={state.fieldMapping[field] ? state.fieldMapping[field].skip : false}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">None</SelectItem>
                      {state.csvHeaders.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Checkbox
                    checked={state.fieldMapping[field] ? state.fieldMapping[field].skip : false}
                    onCheckedChange={(checked) => handleFieldSkip(field, checked as boolean)}
                    disabled={mandatoryFields[state.activeTab].includes(field)}
                  />
                  <span className="text-sm text-muted-foreground">Skip</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setState(prev => ({ ...prev, step: 'upload' }))}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!isMapComplete() || (state.activeTab === 'questions' && !state.selectedQuizId)}
            >
              Upload
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  const renderUploadStep = (): JSX.Element => (
    <Card className="p-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Upload {state.activeTab === 'quizzes' ? 'Quizzes' : 'Questions'}</h2>
        <p className="text-sm text-muted-foreground">
          Upload an Excel or CSV file containing multiple {state.activeTab === 'quizzes' ? 'quizzes' : 'questions'}. 
          Download the template below for the correct format.
        </p>
        
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => handleFileChange(e, state.activeTab === 'quizzes' ? 'quiz' : 'question')}
            className="max-w-md"
          />
          <Button 
            onClick={() => setState(prev => ({ ...prev, step: 'mapping' }))}
            disabled={!(state.activeTab === 'quizzes' ? state.quizFile : state.questionFile)}
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Next
          </Button>
        </div>

        <div className="mt-4">
          <h3 className="font-medium mb-2">Required Fields:</h3>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            {requiredFields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  )

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Bulk Upload</h1>
        <p className="text-muted-foreground">Upload quizzes and questions in bulk using Excel or CSV files</p>
      </div>

      <Tabs value={state.activeTab} onValueChange={(value) => setState(prev => ({ ...prev, activeTab: value, step: 'upload' }))}>
        <TabsList>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="quizzes">
          {state.step === 'upload' ? renderUploadStep() : renderMappingStep()}
        </TabsContent>

        <TabsContent value="questions">
          {state.step === 'upload' ? renderUploadStep() : renderMappingStep()}
        </TabsContent>
      </Tabs>
    </div>
  )
}
