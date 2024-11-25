import { SubjectTemplate } from '../types'

export const biologyTemplates: SubjectTemplate = {
  keyTerms: [
    'cell', 'organism', 'gene', 'protein', 'evolution',
    'ecosystem', 'metabolism', 'homeostasis', 'DNA', 'RNA',
    'mitosis', 'meiosis', 'photosynthesis', 'respiration',
    'inheritance', 'mutation', 'adaptation', 'biodiversity'
  ],
  concepts: [
    'cell biology', 'genetics', 'evolution', 'ecology',
    'physiology', 'molecular biology', 'biotechnology',
    'immunology', 'microbiology', 'anatomy', 'taxonomy',
    'biochemistry', 'developmental biology'
  ],
  commonMisconceptions: [
    'evolution is just a theory',
    'cells are visible to naked eye',
    'all bacteria are harmful',
    'humans evolved from monkeys',
    'acquired traits are inherited',
    'natural selection leads to perfection',
    'all mutations are harmful',
    'all cells are identical'
  ],
  questionTypes: {
    mcq: {
      structure: 'Present biological processes or concepts with detailed options',
      examples: [
        'Describe the process of cellular respiration',
        'Explain how DNA replication occurs',
        'Identify the role of enzymes in digestion',
        'Compare different types of cell division'
      ],
      tips: [
        'Include diagrams where applicable',
        'Use proper biological terminology',
        'Connect processes to real-world examples',
        'Include experimental data interpretation',
        'Reference cellular structures accurately',
        'Include molecular mechanisms'
      ]
    },
    'true-false': {
      structure: 'Present biological statements testing conceptual understanding',
      examples: [
        'Mitochondria are the powerhouse of the cell',
        'All living organisms contain DNA',
        'Viruses are considered living organisms',
        'Photosynthesis occurs in all cells'
      ],
      tips: [
        'Focus on fundamental concepts',
        'Include current scientific understanding',
        'Address common misconceptions',
        'Use precise scientific language',
        'Include process-based statements'
      ]
    },
    blanks: {
      structure: 'Create statements about biological processes with missing terms',
      examples: [
        'The process of _____ converts glucose to energy in cells',
        'DNA replication is _____ conservative',
        'The _____ is responsible for protein synthesis',
        'During photosynthesis, _____ is converted to _____'
      ],
      tips: [
        'Use specific biological terms',
        'Focus on key processes',
        'Include proper scientific terminology',
        'Ensure unambiguous answers',
        'Include pathway steps'
      ]
    }
  },
  validationRules: {
    content: [
      'Uses correct biological terminology',
      'Processes are accurately described',
      'Scientific names are properly formatted',
      'Current scientific understanding is reflected',
      'Cellular components are correctly identified',
      'Biological processes are accurately sequenced'
    ],
    structure: [
      'Diagrams are clearly labeled',
      'Processes are in correct sequence',
      'Cause and effect relationships are clear',
      'Multiple levels of organization are considered',
      'Molecular interactions are properly described'
    ],
    pedagogy: [
      'Connects to real-world examples',
      'Builds on fundamental concepts',
      'Addresses common misconceptions',
      'Incorporates experimental understanding',
      'Links different biological systems',
      'Shows evolutionary relationships'
    ]
  }
} 