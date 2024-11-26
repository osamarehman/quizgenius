import { createWorker } from 'tesseract.js'
import { getDocument } from 'pdfjs-dist'
import '../pdf-worker'

export interface ProcessedFile {
  content: string
  metadata: {
    filename: string
    size: number
    type: string
    lastModified: Date
    [key: string]: string | number | Date | boolean
  }
}

export interface ImageData {
  text: string
  confidence: number
  bbox: {
    x0: number
    y0: number
    x1: number
    y1: number
  }
}

interface TesseractResult {
  data: {
    text: string
    confidence: number
    bbox: {
      x0: number
      y0: number
      x1: number
      y1: number
    }
  }[]
}

interface PDFPageContent {
  items: {
    str: string
    dir: string
    width: number
    height: number
    transform: number[]
  }[]
}

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
        const imageData = await extractTextFromImage(file)
        return imageData.map(data => data.text).join(' ')
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
    const pdf = await getDocument({ data: arrayBuffer }).promise
    const numPages = pdf.numPages
    let text = ''

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent() as PDFPageContent
      text += content.items.map(item => item.str).join(' ') + '\n'
    }

    return text
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    throw new Error('Failed to extract text from PDF file')
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

async function extractTextFromImage(file: File): Promise<ImageData[]> {
  try {
    const worker = await createWorker()
    const imageUrl = URL.createObjectURL(file)
    const result = await worker.recognize(imageUrl) as { data: TesseractResult }
    await worker.terminate()
    URL.revokeObjectURL(imageUrl)
    
    return result.data.data.map((item) => ({
      text: item.text,
      confidence: item.confidence,
      bbox: item.bbox,
    }))
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

export async function processFile(file: File): Promise<ProcessedFile> {
  const content = await extractTextFromFile(file)
  const metadata = {
    filename: file.name,
    size: file.size,
    type: file.type,
    lastModified: new Date(file.lastModified),
  }

  return { content, metadata }
}