import { createWorker } from 'tesseract.js'
import { getDocument } from 'pdfjs-dist'
import '../pdf-worker'

export async function extractTextFromFile(file: File): Promise<string> {
  try {
    const fileType = file.type

    switch (fileType) {
      case 'application/pdf':
        return await extractTextFromPDF(file)
      case 'text/plain':
        return await extractTextFromTXT(file)
      case 'image/jpeg':
      case 'image/png':
        return await extractTextFromImage(file)
      default:
        throw new Error('Unsupported file type')
    }
  } catch (error) {
    console.error('Error extracting text:', error)
    throw error
  }
}

async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise
    let text = ''

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items
        .map((item: any) => item.str)
        .join(' ')
      text += pageText + '\n'
    }

    return text
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

async function extractTextFromTXT(file: File): Promise<string> {
  try {
    return await file.text()
  } catch (error) {
    console.error('Error extracting text from TXT:', error)
    throw new Error('Failed to extract text from TXT file')
  }
}

async function extractTextFromImage(file: File): Promise<string> {
  try {
    const worker = await createWorker()
    const imageUrl = URL.createObjectURL(file)
    const { data: { text } } = await worker.recognize(imageUrl)
    await worker.terminate()
    URL.revokeObjectURL(imageUrl)
    return text
  } catch (error) {
    console.error('Error extracting text from image:', error)
    throw new Error('Failed to extract text from image')
  }
}

export function preprocessText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s.,?!-]/g, '')
    .trim()
}

export function splitIntoChunks(text: string, maxChunkSize: number = 2000): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || []
  const chunks: string[] = []
  let currentChunk = ''

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxChunkSize) {
      currentChunk += sentence
    } else {
      if (currentChunk) chunks.push(currentChunk)
      currentChunk = sentence
    }
  }

  if (currentChunk) chunks.push(currentChunk)
  return chunks
} 