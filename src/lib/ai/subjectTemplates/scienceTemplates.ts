import { SubjectTemplate } from '../types'

export const scienceTemplates: Record<string, SubjectTemplate> = {
  physics: {
    keyTerms: [
      'force', 'energy', 'momentum', 'velocity', 'acceleration',
      'mass', 'charge', 'field', 'wave', 'particle'
    ],
    concepts: [
      'mechanics', 'thermodynamics', 'electromagnetism',
      'optics', 'quantum mechanics', 'nuclear physics'
    ],
    commonMisconceptions: [
      'heavier objects fall faster',
      'heat and temperature are the same',
      'electricity flows like water'
    ],
    questionTypes: {
      mcq: {
        structure: 'Present physical scenarios with numerical or conceptual solutions',
        examples: [
          'Calculate the force needed to accelerate a 2kg mass at 5 m/s²',
          'Determine the wavelength of light given its frequency'
        ],
        tips: [
          'Include unit analysis',
          'Use real-world applications',
          'Test both calculation and concept understanding'
        ]
      },
      'true-false': {
        structure: 'Present physics principles and their applications',
        examples: [
          'Energy can be created or destroyed in nuclear reactions',
          'The speed of light is constant in all reference frames'
        ],
        tips: [
          'Focus on fundamental laws',
          'Include practical applications',
          'Address common misconceptions'
        ]
      },
      blanks: {
        structure: 'Create physics equations or statements with missing values',
        examples: [
          'F = m × _____',
          'The SI unit of force is _____'
        ],
        tips: [
          'Include units',
          'Focus on fundamental equations',
          'Use standard notation'
        ]
      }
    },
    validationRules: {
      content: [
        'Uses correct SI units',
        'Equations are properly formatted',
        'Vector quantities are clearly indicated'
      ],
      structure: [
        'Problem scenario is clearly described',
        'Required information is provided',
        'Steps for calculation are logical'
      ],
      pedagogy: [
        'Builds on fundamental concepts',
        'Connects theory to practice',
        'Uses appropriate mathematical level'
      ]
    }
  },
  chemistry: {
    keyTerms: [
      'atom', 'molecule', 'element', 'compound', 'reaction',
      'bond', 'pH', 'concentration', 'mole', 'equilibrium'
    ],
    concepts: [
      'atomic structure', 'chemical bonding', 'stoichiometry',
      'thermochemistry', 'kinetics', 'equilibrium'
    ],
    commonMisconceptions: [
      'atoms are visible under microscope',
      'chemical bonds are physical connections',
      'all acids are dangerous'
    ],
    questionTypes: {
      mcq: {
        structure: 'Present chemical problems with balanced equations and calculations',
        examples: [
          'Balance the equation: Fe + O₂ → Fe₂O₃',
          'Calculate the pH of a 0.1M HCl solution'
        ],
        tips: [
          'Include balanced equations',
          'Show stoichiometric calculations',
          'Use proper chemical notation'
        ]
      },
      'true-false': {
        structure: 'Present chemical principles and reactions',
        examples: [
          'All alkali metals react violently with water',
          'The pH scale ranges from 0 to 14'
        ],
        tips: [
          'Focus on chemical properties',
          'Include reaction conditions',
          'Address common misconceptions'
        ]
      },
      blanks: {
        structure: 'Create chemical equations or statements with missing terms',
        examples: [
          'The atomic number of an element represents _____',
          'In the reaction A + B → C, the _____ remains constant'
        ],
        tips: [
          'Include chemical formulas',
          'Use proper subscripts and charges',
          'Focus on key terminology'
        ]
      }
    },
    validationRules: {
      content: [
        'Chemical formulas are correct',
        'Equations are balanced',
        'Units are appropriate'
      ],
      structure: [
        'Reaction conditions are specified',
        'Molecular structures are clear',
        'Stoichiometry is correct'
      ],
      pedagogy: [
        'Builds chemical understanding',
        'Links to practical applications',
        'Shows reaction mechanisms'
      ]
    }
  }
}