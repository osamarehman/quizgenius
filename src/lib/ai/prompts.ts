export const generatePrompt = (
  questionType: 'mcq' | 'true-false' | 'blanks',
  context: string,
  subject: string,
  educationLevel: string,
  style: 'standard' | 'analytical' | 'practical' | 'conceptual' = 'standard'
) => {
  const styles = {
    standard: {
      mcq: `Create clear multiple-choice questions testing knowledge of ${subject}.`,
      'true-false': `Generate unambiguous true/false statements about ${subject}.`,
      blanks: `Create fill-in-the-blank questions focusing on key terms in ${subject}.`
    },
    analytical: {
      mcq: `Design analytical multiple-choice questions that require problem-solving and critical thinking in ${subject}.`,
      'true-false': `Create complex true/false statements that require analysis of ${subject} concepts.`,
      blanks: `Generate fill-in-the-blank questions that test understanding of relationships between concepts in ${subject}.`
    },
    practical: {
      mcq: `Create real-world scenario-based multiple-choice questions applying ${subject} concepts.`,
      'true-false': `Generate true/false statements about practical applications of ${subject}.`,
      blanks: `Create fill-in-the-blank questions based on real-world examples of ${subject}.`
    },
    conceptual: {
      mcq: `Design multiple-choice questions that test deep understanding of ${subject} concepts.`,
      'true-false': `Create true/false statements that explore theoretical aspects of ${subject}.`,
      blanks: `Generate fill-in-the-blank questions focusing on fundamental concepts in ${subject}.`
    }
  }

  const basePrompt = `As an expert ${subject} educator for ${educationLevel} level, create questions based on: ${context}\n\n`
  const stylePrompt = styles[style][questionType]

  return `${basePrompt}${stylePrompt}\n\nEnsure questions are:
  1. Clear and unambiguous
  2. Appropriate for ${educationLevel} level
  3. Include detailed explanations
  4. Follow proper formatting
  5. Avoid cultural or regional bias
  6. Use inclusive language`
}

export const explanationStyles = {
  basic: "Provide a straightforward explanation",
  detailed: "Give a comprehensive explanation with examples",
  conceptual: "Focus on underlying concepts and principles",
  practical: "Explain using real-world applications",
  comparative: "Compare with related concepts",
  step_by_step: "Break down the explanation into clear steps"
} 