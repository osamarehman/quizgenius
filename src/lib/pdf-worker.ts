import { GlobalWorkerOptions } from 'pdfjs-dist'

if (typeof window !== 'undefined') {
  const pdfjsVersion = '3.11.174'
  GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`
} 