import { SubjectTemplate } from '../types'

export const socialStudiesTemplates: Record<string, SubjectTemplate> = {
  history: {
    keyTerms: [
      'chronology', 'causation', 'evidence', 'interpretation',
      'primary source', 'secondary source', 'civilization',
      'revolution', 'empire', 'democracy', 'monarchy',
      'industrialization', 'colonization', 'nationalism'
    ],
    concepts: [
      'historical analysis', 'cause and effect', 'historical context',
      'historical interpretation', 'continuity and change',
      'historical significance', 'historical evidence',
      'historical perspective', 'historical empathy'
    ],
    commonMisconceptions: [
      'history is just memorizing dates',
      'historical events have single causes',
      'historical accounts are always objective',
      'progress is always linear',
      'history repeats itself exactly',
      'winners write all history'
    ],
    questionTypes: {
      mcq: {
        structure: 'Present historical scenarios or sources with analytical questions',
        examples: [
          'Analyze the causes of World War I',
          'Evaluate the impact of the Industrial Revolution',
          'Interpret a primary source document'
        ],
        tips: [
          'Include source analysis',
          'Test historical thinking skills',
          'Use authentic historical materials',
          'Include different perspectives'
        ]
      },
      'true-false': {
        structure: 'Present historical statements testing factual and conceptual understanding',
        examples: [
          'The French Revolution began in 1789',
          'The Cold War had only military causes',
          'Democracy originated in ancient Greece'
        ],
        tips: [
          'Include both facts and interpretations',
          'Test historical reasoning',
          'Address common misconceptions',
          'Use precise historical language'
        ]
      },
      blanks: {
        structure: 'Create historical statements with missing key terms or dates',
        examples: [
          'The _____ Revolution began in Britain around 1760',
          'The Declaration of Independence was signed in _____',
          '_____ was the first President of the United States'
        ],
        tips: [
          'Focus on significant terms and dates',
          'Provide adequate context',
          'Include various historical periods',
          'Test understanding not just recall'
        ]
      }
    },
    validationRules: {
      content: [
        'Historical facts are accurate',
        'Sources are properly cited',
        'Multiple perspectives are considered',
        'Context is historically accurate',
        'Dates and names are correct'
      ],
      structure: [
        'Questions promote historical thinking',
        'Sources are appropriately used',
        'Answer options are historically plausible',
        'Time periods are clearly indicated'
      ],
      pedagogy: [
        'Develops historical thinking skills',
        'Encourages source analysis',
        'Promotes understanding of causation',
        'Builds chronological thinking'
      ]
    }
  },
  geography: {
    keyTerms: [
      'latitude', 'longitude', 'climate', 'topography',
      'population', 'migration', 'urbanization', 'resources',
      'ecosystem', 'sustainability', 'globalization'
    ],
    concepts: [
      'spatial analysis', 'human-environment interaction',
      'place and region', 'movement', 'location theory',
      'cultural geography', 'economic geography',
      'physical geography', 'political geography'
    ],
    commonMisconceptions: [
      'maps show exact reality',
      'climate and weather are the same',
      'population is evenly distributed',
      'resources are infinite',
      'geography is just memorizing places'
    ],
    questionTypes: {
      mcq: {
        structure: 'Present geographical scenarios with map analysis and data interpretation',
        examples: [
          'Analyze population distribution patterns',
          'Interpret climate data',
          'Evaluate resource distribution'
        ],
        tips: [
          'Include maps and data',
          'Test spatial thinking',
          'Use real-world examples',
          'Include different scales'
        ]
      },
      'true-false': {
        structure: 'Present geographical concepts and relationships',
        examples: [
          'The equator experiences constant high temperatures',
          'All deserts are hot',
          'Rivers always flow north to south'
        ],
        tips: [
          'Test geographical relationships',
          'Include spatial concepts',
          'Address common misconceptions',
          'Use precise terminology'
        ]
      },
      blanks: {
        structure: 'Create statements about geographical features and processes',
        examples: [
          'The _____ Ocean is the largest on Earth',
          'The process of _____ shapes river valleys',
          'The _____ climate zone is characterized by low precipitation'
        ],
        tips: [
          'Include geographical terms',
          'Focus on processes',
          'Use proper terminology',
          'Include spatial relationships'
        ]
      }
    },
    validationRules: {
      content: [
        'Geographical facts are accurate',
        'Maps are properly referenced',
        'Data is current and accurate',
        'Spatial relationships are correct'
      ],
      structure: [
        'Questions promote spatial thinking',
        'Maps and data are clear',
        'Answer options are geographically valid',
        'Scale is appropriately indicated'
      ],
      pedagogy: [
        'Develops spatial thinking',
        'Encourages data analysis',
        'Promotes geographical understanding',
        'Builds analytical skills'
      ]
    }
  }
}

export type SocialStudiesSubject = keyof typeof socialStudiesTemplates 