// Sample Quiz Data (save as quizzes.xlsx)
const sampleQuizzes = [
  {
    title: "Algebra I: Linear Equations",
    description: "Master solving linear equations and understanding their applications",
    time_limit: 45,
    category_id: "[math-category-id]",
    sub_category_id: "[algebra-subcategory-id]",
    education_system_id: "[education-system-id]",
    is_published: false,
    difficulty_level: "intermediate"
  },
  {
    title: "Biology: Cell Structure and Function",
    description: "Comprehensive quiz on cell organelles and their functions",
    time_limit: 40,
    category_id: "[science-category-id]",
    sub_category_id: "[biology-subcategory-id]",
    education_system_id: "[education-system-id]",
    is_published: false,
    difficulty_level: "intermediate"
  },
  {
    title: "World History: Ancient Civilizations",
    description: "Test your knowledge of ancient Egyptian, Greek, and Roman civilizations",
    time_limit: 50,
    category_id: "[history-category-id]",
    sub_category_id: "[ancient-history-subcategory-id]",
    education_system_id: "[education-system-id]",
    is_published: false,
    difficulty_level: "advanced"
  }
]

// Sample Question Data (save as questions.xlsx)
const sampleQuestions = [
  // Algebra Questions
  {
    question_text: "Solve for x: 3x + 7 = 22",
    question_type: "mcq",
    question_explanation: "Use inverse operations to isolate x",
    quiz_id: "[algebra-quiz-id]",
    order_number: 1,
    answer_1: "5",
    answer_1_explanation: "Correct! Subtract 7 from both sides: 3x = 15, then divide by 3: x = 5",
    answer_2: "7",
    answer_2_explanation: "Incorrect. Check your arithmetic when solving for x",
    answer_3: "8",
    answer_3_explanation: "Incorrect. Remember to divide by 3 after subtracting 7",
    answer_4: "4",
    answer_4_explanation: "Incorrect. Verify your solution by plugging it back into the equation",
    correct_answer: "answer_1"
  },
  {
    question_text: "Which of the following represents the slope-intercept form of a linear equation?",
    question_type: "mcq",
    quiz_id: "[algebra-quiz-id]",
    order_number: 2,
    answer_1: "y = mx + b",
    answer_1_explanation: "Correct! This is the standard slope-intercept form where m is the slope and b is the y-intercept",
    answer_2: "y = x + m",
    answer_2_explanation: "Incorrect. This is not the standard form",
    answer_3: "x = my + b",
    answer_3_explanation: "Incorrect. The variables are switched",
    answer_4: "y = b + mx",
    answer_4_explanation: "While technically equivalent, this is not the standard form",
    correct_answer: "answer_1"
  },

  // Biology Questions
  {
    question_text: "Which organelle is known as the 'powerhouse' of the cell?",
    question_type: "mcq",
    question_explanation: "Understanding cellular organelles and their functions",
    quiz_id: "[biology-quiz-id]",
    order_number: 1,
    answer_1: "Mitochondria",
    answer_1_explanation: "Correct! Mitochondria produce most of the cell's energy through cellular respiration",
    answer_2: "Nucleus",
    answer_2_explanation: "Incorrect. The nucleus contains genetic material but doesn't produce energy",
    answer_3: "Golgi apparatus",
    answer_3_explanation: "Incorrect. The Golgi apparatus packages and distributes proteins",
    answer_4: "Endoplasmic reticulum",
    answer_4_explanation: "Incorrect. The ER is involved in protein synthesis and transport",
    correct_answer: "answer_1"
  },
  {
    question_text: "What is the primary function of the cell membrane?",
    question_type: "mcq",
    quiz_id: "[biology-quiz-id]",
    order_number: 2,
    answer_1: "Selective permeability",
    answer_1_explanation: "Correct! The cell membrane controls what enters and exits the cell",
    answer_2: "Energy production",
    answer_2_explanation: "Incorrect. This is the function of mitochondria",
    answer_3: "Protein synthesis",
    answer_3_explanation: "Incorrect. This occurs in ribosomes",
    answer_4: "DNA storage",
    answer_4_explanation: "Incorrect. This is the function of the nucleus",
    correct_answer: "answer_1"
  },

  // History Questions
  {
    question_text: "Which ancient Egyptian structure was built as a tomb for the pharaohs?",
    question_type: "mcq",
    quiz_id: "[history-quiz-id]",
    order_number: 1,
    answer_1: "Pyramids",
    answer_1_explanation: "Correct! The pyramids were built as elaborate tombs for pharaohs",
    answer_2: "Sphinx",
    answer_2_explanation: "Incorrect. The Sphinx was a guardian statue",
    answer_3: "Obelisks",
    answer_3_explanation: "Incorrect. Obelisks were monuments to the sun god",
    answer_4: "Temple of Luxor",
    answer_4_explanation: "Incorrect. This was a temple for worship",
    correct_answer: "answer_1"
  },
  {
    question_text: "What was the significance of the Roman Colosseum?",
    question_type: "mcq",
    quiz_id: "[history-quiz-id]",
    order_number: 2,
    answer_1: "Entertainment and gladiatorial contests",
    answer_1_explanation: "Correct! The Colosseum was primarily used for public spectacles and games",
    answer_2: "Religious ceremonies",
    answer_2_explanation: "Incorrect. Religious ceremonies were typically held in temples",
    answer_3: "Political meetings",
    answer_3_explanation: "Incorrect. The Roman Forum was used for political gatherings",
    answer_4: "Military training",
    answer_4_explanation: "Incorrect. Military training occurred in separate facilities",
    correct_answer: "answer_1"
  },
  {
    question_text: "The Greek philosopher who founded the Academy in Athens was:",
    question_type: "mcq",
    quiz_id: "[history-quiz-id]",
    order_number: 3,
    answer_1: "Plato",
    answer_1_explanation: "Correct! Plato founded the Academy in Athens around 387 BC",
    answer_2: "Aristotle",
    answer_2_explanation: "Incorrect. Aristotle was Plato's student and later founded the Lyceum",
    answer_3: "Socrates",
    answer_3_explanation: "Incorrect. Socrates was Plato's teacher but didn't found the Academy",
    answer_4: "Pythagoras",
    answer_4_explanation: "Incorrect. Pythagoras founded his school in Croton",
    correct_answer: "answer_1"
  }
]

// Reference Data Sheet (save as reference.xlsx)
const referenceData = {
  categories: [
    { id: "math-category-id", name: "Mathematics" },
    { id: "science-category-id", name: "Science" },
    { id: "history-category-id", name: "History" }
  ],
  subcategories: [
    { id: "algebra-subcategory-id", name: "Algebra", category_id: "math-category-id" },
    { id: "biology-subcategory-id", name: "Biology", category_id: "science-category-id" },
    { id: "ancient-history-subcategory-id", name: "Ancient History", category_id: "history-category-id" }
  ],
  education_systems: [
    { id: "education-system-id", name: "International Baccalaureate" }
  ]
}

export { sampleQuizzes, sampleQuestions, referenceData } 