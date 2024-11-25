import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'

// Function to get reference data
async function getReferenceData() {
  const [
    { data: categories },
    { data: educationSystems },
    { data: quizzes }
  ] = await Promise.all([
    supabase.from('categories').select('id, name, parent_id, education_system_id'),
    supabase.from('education_systems').select('id, name'),
    supabase.from('quizzes').select('id, title')
  ])

  return {
    categories: categories || [],
    educationSystems: educationSystems || [],
    quizzes: quizzes || []
  }
}

// Function to generate Excel templates with reference data
export async function generateTemplates(type: 'quizzes' | 'questions') {
  const data = await getReferenceData()
  const workbook = XLSX.utils.book_new()

  // Reference Data Sheet
  const referenceData = [
    ['Education Systems'],
    ['ID', 'Name'],
    ...data.educationSystems.map(es => [es.id, es.name]),
    [],
    ['Categories'],
    ['ID', 'Name', 'Parent ID', 'Education System ID'],
    ...data.categories.map(c => [c.id, c.name, c.parent_id || '', c.education_system_id || '']),
    [],
    ['Quizzes'],
    ['ID', 'Title'],
    ...data.quizzes.map(q => [q.id, q.title])
  ]

  // Template Sheet
  let templateData
  if (type === 'quizzes') {
    templateData = [
      ['title', 'description', 'time_limit', 'category_id', 'sub_category_id', 'education_system_id', 'is_published'],
      ['Math Quiz 1', 'Basic arithmetic quiz', '30', 'category-uuid', 'sub-category-uuid', 'education-system-uuid', 'false'],
      ['Science Quiz', 'Basic science concepts', '45', 'category-uuid', 'sub-category-uuid', 'education-system-uuid', 'false']
    ]
  } else {
    templateData = [
      [
        'question_text',
        'question_type',
        'question_explanation',
        'quiz_id',
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
      ],
      [
        'What is 2+2?',
        'mcq',
        'Basic addition explanation',
        'quiz-uuid',
        '1',
        '4',
        'This is the correct answer',
        '3',
        'This is incorrect',
        '5',
        'This is incorrect',
        '2',
        'This is incorrect',
        '',
        '',
        '',
        '',
        'answer_1'
      ],
      [
        'Is water wet?',
        'true-false',
        'Basic properties explanation',
        'quiz-uuid',
        '2',
        'True',
        'This is correct',
        'False',
        'This is incorrect',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        'answer_1'
      ]
    ]
  }

  // Add sheets to workbook
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet(referenceData),
    'Reference Data'
  )

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet(templateData),
    'Template'
  )

  // Add instructions sheet
  const instructions = [
    ['Instructions'],
    ['1. Use the Reference Data sheet to find the correct IDs for your data'],
    ['2. Fill in the Template sheet with your data'],
    ['3. Make sure to use the correct IDs from the Reference Data sheet'],
    ['4. Do not modify the header row in the Template sheet'],
    ['5. Save as Excel or CSV before uploading'],
    [],
    ['Notes for Questions:'],
    ['- Question Types: mcq, true-false, blanks'],
    ['- You can add up to 6 answers per question'],
    ['- For each answer, you can provide an optional explanation'],
    ['- In the correct_answer field, specify which answer is correct (e.g., answer_1, answer_2, etc.)'],
    ['- Leave unused answer fields empty'],
    ['- For true/false questions, use only answer_1 and answer_2'],
    [],
    ['Example:'],
    ['- If answer_1 is correct, put "answer_1" in the correct_answer column'],
    ['- If answer_3 is correct, put "answer_3" in the correct_answer column'],
    ['- Make sure the correct_answer value matches one of your filled answer fields']
  ]

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet(instructions),
    'Instructions'
  )

  return workbook
} 