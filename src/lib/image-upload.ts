import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function uploadQuestionImage(file: File) {
  try {
    // Create authenticated client
    const supabase = createClientComponentClient()

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size must be less than 5MB')
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error('File type must be JPEG, PNG, or WebP')
    }

    // Create a unique file name
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
    const filePath = `question-images/${fileName}`

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('quiz-assets')
      .upload(filePath, file)

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('quiz-assets')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    console.error('Upload error:', error)
    if (error instanceof Error) {
      throw new Error(`Upload failed: ${error.message}`)
    }
    throw new Error('Upload failed')
  }
} 