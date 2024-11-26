-- Add position column to questions table
ALTER TABLE questions ADD COLUMN position integer;

-- Update existing questions with position values
WITH numbered_questions AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY quiz_id ORDER BY created_at) as row_num
  FROM questions
)
UPDATE questions
SET position = numbered_questions.row_num
FROM numbered_questions
WHERE questions.id = numbered_questions.id;

-- Make position column not null
ALTER TABLE questions ALTER COLUMN position SET NOT NULL;

-- Add index for faster ordering
CREATE INDEX questions_position_idx ON questions(quiz_id, position);
