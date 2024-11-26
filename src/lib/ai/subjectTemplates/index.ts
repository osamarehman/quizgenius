import { mathTemplates } from './mathTemplates'
import { scienceTemplates } from './scienceTemplates'
import { languageTemplates } from './languageTemplates'
import { socialStudiesTemplates } from './socialStudiesTemplates'
import { QuestionType, EducationLevel, EducationSystem } from '../types'

export interface SubjectTemplate {
  keyTerms: string[]
  concepts: string[]
  commonMisconceptions: string[]
  questionTypes: Record<QuestionType, {
    structure: string
    examples: string[]
    tips: string[]
  }>
  validationRules: {
    content: string[]
    structure: string[]
    pedagogy: string[]
  }
}

export const subjectTemplates = {
  mathematics: mathTemplates,
  physics: scienceTemplates.physics,
  chemistry: scienceTemplates.chemistry,
  biology: scienceTemplates.biology,
  english: languageTemplates.english,
  history: socialStudiesTemplates.history,
  geography: socialStudiesTemplates.geography
}

export function getSubjectTemplate(
  subject: string,
  educationSystem: EducationSystem,
  level: EducationLevel
): SubjectTemplate | null {
  const template = subjectTemplates[subject as keyof typeof subjectTemplates]
  if (!template) return null

  // Adjust template based on education system and level
  return {
    ...template,
    questionTypes: adjustQuestionTypes(template.questionTypes, educationSystem, level),
    validationRules: adjustValidationRules(template.validationRules, educationSystem, level)
  }
}

function adjustQuestionTypes(
  questionTypes: SubjectTemplate['questionTypes'],
  educationSystem: EducationSystem,
  level: EducationLevel
) {
  // Adjust question complexity and structure based on system and level
  const adjustedTypes = { ...questionTypes }
  
  for (const type in adjustedTypes) {
    const questionType = type as QuestionType
    adjustedTypes[questionType].tips = [
      ...adjustedTypes[questionType].tips,
      ...getSystemSpecificTips(educationSystem, level)
    ]
  }

  return adjustedTypes
}

function adjustValidationRules(
  rules: SubjectTemplate['validationRules'],
  educationSystem: EducationSystem,
  level: EducationLevel
) {
  // Add system and level specific validation rules
  return {
    ...rules,
    content: [
      ...rules.content,
      ...getSystemSpecificValidationRules(educationSystem, level)
    ]
  }
}

function getSystemSpecificTips(
  system: EducationSystem,
): string[] {
  switch (system) {
    case 'o-levels':
      return [
        'Follow Cambridge O Level format',
        'Include command words as specified in syllabus',
        'Ensure appropriate difficulty for O Level students'
      ]
    case 'a-levels':
      return [
        'Include higher-order thinking questions',
        'Follow Cambridge A Level assessment objectives',
        'Include application-based scenarios'
      ]
    case 'mcat':
      return [
        'Follow AAMC guidelines',
        'Include passage-based questions',
        'Focus on scientific reasoning'
      ]
    default:
      return []
  }
}

function getSystemSpecificValidationRules(
  system: EducationSystem,
): string[] {
  switch (system) {
    case 'o-levels':
      return [
        'Question follows O Level command word structure',
        'Difficulty appropriate for O Level',
        'Clear marking scheme possible'
      ]
    case 'a-levels':
      return [
        'Tests higher-order thinking skills',
        'Includes application of knowledge',
        'Follows A Level assessment objectives'
      ]
    case 'mcat':
      return [
        'Follows AAMC format',
        'Tests scientific reasoning',
        'Includes experimental data interpretation'
      ]
    default:
      return []
  }
} 