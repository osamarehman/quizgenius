import { SubjectTemplate } from '../types'

export const languageTemplates: Record<string, SubjectTemplate> = {
  english: {
    keyTerms: [
      'grammar', 'vocabulary', 'syntax', 'comprehension',
      'literature', 'composition', 'rhetoric', 'analysis',
      'context', 'interpretation', 'genre', 'theme',
      'narrative', 'figurative language', 'tone', 'style'
    ],
    concepts: [
      'reading comprehension', 'writing skills', 'critical analysis',
      'literary devices', 'text interpretation', 'grammar rules',
      'essay writing', 'language structure', 'text analysis',
      'author\'s purpose', 'character development', 'plot structure'
    ],
    commonMisconceptions: [
      'grammar rules never change',
      'passive voice is always wrong',
      'sentences cannot start with conjunctions',
      'informal writing is incorrect writing',
      'longer sentences are better',
      'contractions are always informal',
      'first person perspective is always inappropriate',
      'all paragraphs need five sentences'
    ],
    questionTypes: {
      mcq: {
        structure: 'Present passages or statements with questions testing comprehension and analysis',
        examples: [
          'What is the main theme of the passage?',
          'Which literary device is used in this excerpt?',
          'What can be inferred about the character\'s motivation?',
          'How does the author\'s word choice affect the tone?'
        ],
        tips: [
          'Include context for comprehension questions',
          'Test both explicit and implicit understanding',
          'Use authentic text samples',
          'Include different genres and styles',
          'Test various reading skills',
          'Include questions about author\'s craft'
        ]
      },
      'true-false': {
        structure: 'Present statements about language rules, literary analysis, or text interpretation',
        examples: [
          'The author\'s tone in this passage is formal',
          'This sentence contains a grammatical error',
          'The metaphor in line 5 suggests hope',
          'The character\'s actions demonstrate growth'
        ],
        tips: [
          'Focus on clear, unambiguous statements',
          'Include context where necessary',
          'Test understanding of rules and exceptions',
          'Cover different aspects of language and literature',
          'Include analysis of literary elements'
        ]
      },
      blanks: {
        structure: 'Create sentences or passages with missing words or phrases',
        examples: [
          'The author uses _____ to create suspense',
          'The character\'s _____ reveals their motivation',
          'The tone shifts from _____ to _____ in paragraph 3',
          'The theme of _____ is developed through imagery'
        ],
        tips: [
          'Provide sufficient context',
          'Test specific language skills',
          'Include various difficulty levels',
          'Focus on key literary terms',
          'Test understanding of text structure'
        ]
      }
    },
    validationRules: {
      content: [
        'Uses appropriate language level',
        'Grammar and punctuation are correct',
        'Instructions are clear and unambiguous',
        'Content is culturally appropriate',
        'Literary terms are used correctly',
        'Text excerpts are properly cited'
      ],
      structure: [
        'Question format matches skill being tested',
        'Context is sufficient for understanding',
        'Answer options are clearly distinct',
        'Distractors are plausible',
        'Passages are appropriate length'
      ],
      pedagogy: [
        'Tests understanding rather than memorization',
        'Appropriate for target language level',
        'Builds on fundamental concepts',
        'Promotes critical thinking',
        'Encourages textual analysis',
        'Develops analytical skills'
      ]
    }
  },
  literature: {
    keyTerms: [
      'plot', 'character', 'setting', 'theme', 'conflict',
      'symbolism', 'imagery', 'metaphor', 'irony', 'tone',
      'point of view', 'foreshadowing', 'allegory', 'motif'
    ],
    concepts: [
      'character analysis', 'plot development', 'thematic analysis',
      'literary criticism', 'genre study', 'narrative structure',
      'authorial intent', 'historical context', 'comparative analysis'
    ],
    commonMisconceptions: [
      'themes must be explicitly stated',
      'protagonists must be likeable',
      'symbolism is always intentional',
      'first person narration is always reliable',
      'poetry must rhyme',
      'metaphors and similes are the same'
    ],
    questionTypes: {
      mcq: {
        structure: 'Present literary analysis questions with text evidence',
        examples: [
          'How does the symbol of the river develop the theme?',
          'What motivates the protagonist\'s decision?',
          'How does the setting influence the conflict?'
        ],
        tips: [
          'Include textual evidence',
          'Test analytical thinking',
          'Focus on literary elements',
          'Include different genres'
        ]
      },
      'true-false': {
        structure: 'Present analytical statements about literature',
        examples: [
          'The author uses irony to critique society',
          'The setting serves as a character',
          'The conflict is primarily internal'
        ],
        tips: [
          'Focus on analysis',
          'Include textual support',
          'Test literary understanding',
          'Cover multiple elements'
        ]
      },
      blanks: {
        structure: 'Create analytical statements with missing literary terms',
        examples: [
          'The author uses _____ to develop the theme',
          'The character\'s _____ represents inner conflict',
          'The _____ symbolizes freedom'
        ],
        tips: [
          'Focus on literary analysis',
          'Include context',
          'Test terminology',
          'Require critical thinking'
        ]
      }
    },
    validationRules: {
      content: [
        'Literary terms are used correctly',
        'Analysis is text-based',
        'Questions require critical thinking',
        'Textual evidence is included'
      ],
      structure: [
        'Questions promote analysis',
        'Answers require interpretation',
        'Options are analytically valid',
        'Context is sufficient'
      ],
      pedagogy: [
        'Develops analytical skills',
        'Encourages close reading',
        'Promotes literary understanding',
        'Builds critical thinking'
      ]
    }
  }
}

export type LanguageSubject = keyof typeof languageTemplates 