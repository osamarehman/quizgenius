'use client'

import React, { createContext, useContext, useReducer, useCallback } from 'react'
import { ValidationResult, Question } from '@/lib/ai/types'
import { validateQuestionBatch } from '@/lib/ai/batchValidation'

interface ValidationState {
  results: Map<string, ValidationResult>
  isValidating: boolean
  error: Error | null
}

type ValidationAction =
  | { type: 'START_VALIDATION' }
  | { type: 'VALIDATION_SUCCESS'; questionId: string; result: ValidationResult }
  | { type: 'VALIDATION_ERROR'; error: Error }
  | { type: 'RESET_VALIDATION' }

interface ValidationContextType extends ValidationState {
  validateQuestion: (question: Question) => Promise<void>
  validateQuestions: (questions: Question[]) => Promise<void>
  resetValidation: () => void
}

const ValidationContext = createContext<ValidationContextType | undefined>(undefined)

function validationReducer(state: ValidationState, action: ValidationAction): ValidationState {
  switch (action.type) {
    case 'START_VALIDATION':
      return {
        ...state,
        isValidating: true,
        error: null
      }
    case 'VALIDATION_SUCCESS':
      return {
        ...state,
        results: new Map(state.results).set(action.questionId, action.result),
        isValidating: false
      }
    case 'VALIDATION_ERROR':
      return {
        ...state,
        error: action.error,
        isValidating: false
      }
    case 'RESET_VALIDATION':
      return {
        results: new Map(),
        isValidating: false,
        error: null
      }
    default:
      return state
  }
}

export function ValidationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(validationReducer, {
    results: new Map(),
    isValidating: false,
    error: null
  })

  const validateQuestion = useCallback(async (question: Question) => {
    try {
      dispatch({ type: 'START_VALIDATION' })
      const result = await validateQuestionBatch([question])
      dispatch({
        type: 'VALIDATION_SUCCESS',
        questionId: question.id,
        result: result.results[0]
      })
    } catch (error) {
      dispatch({
        type: 'VALIDATION_ERROR',
        error: error instanceof Error ? error : new Error('Validation failed')
      })
    }
  }, [])

  const validateQuestions = useCallback(async (questions: Question[]) => {
    try {
      dispatch({ type: 'START_VALIDATION' })
      const results = await validateQuestionBatch(questions)
      questions.forEach((question, index) => {
        dispatch({
          type: 'VALIDATION_SUCCESS',
          questionId: question.id,
          result: results.results[index]
        })
      })
    } catch (error) {
      dispatch({
        type: 'VALIDATION_ERROR',
        error: error instanceof Error ? error : new Error('Batch validation failed')
      })
    }
  }, [])

  const resetValidation = useCallback(() => {
    dispatch({ type: 'RESET_VALIDATION' })
  }, [])

  return (
    <ValidationContext.Provider
      value={{
        ...state,
        validateQuestion,
        validateQuestions,
        resetValidation
      }}
    >
      {children}
    </ValidationContext.Provider>
  )
}

export function useValidation() {
  const context = useContext(ValidationContext)
  if (context === undefined) {
    throw new Error('useValidation must be used within a ValidationProvider')
  }
  return context
} 