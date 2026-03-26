import { extractTextFromPDF, extractStructuredPDF } from './pdf'
import { extractTextFromDOCX, extractStructuredDOCX } from './docx'

/**
 * Supported file types for resume extraction
 */
export const SUPPORTED_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt',
}

export const SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.txt']

/**
 * Check if a file type is supported
 * @param {File} file - File to check
 * @returns {boolean}
 */
export function isSupported(file) {
  const type = SUPPORTED_TYPES[file.type]
  if (type) return true

  // Fallback to extension check
  const ext = '.' + file.name.split('.').pop().toLowerCase()
  return SUPPORTED_EXTENSIONS.includes(ext)
}

/**
 * Get file type from File object
 * @param {File} file - File to check
 * @returns {string|null} - 'pdf', 'docx', 'txt', or null
 */
export function getFileType(file) {
  const type = SUPPORTED_TYPES[file.type]
  if (type) return type

  const ext = file.name.split('.').pop().toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (ext === 'docx') return 'docx'
  if (ext === 'txt') return 'txt'

  return null
}

/**
 * Extract text from a resume file
 * @param {File} file - Resume file (PDF, DOCX, or TXT)
 * @returns {Promise<string>} - Extracted text
 */
export async function extractText(file) {
  const fileType = getFileType(file)

  if (!fileType) {
    throw new Error(`Unsupported file type: ${file.type || file.name}`)
  }

  switch (fileType) {
    case 'pdf':
      return extractTextFromPDF(file)
    case 'docx':
      return extractTextFromDOCX(file)
    case 'txt':
      return file.text()
    default:
      throw new Error(`Unknown file type: ${fileType}`)
  }
}

/**
 * Extract structured content from a resume file
 * @param {File} file - Resume file
 * @returns {Promise<{text: string, metadata: object}>}
 */
export async function extractStructured(file) {
  const fileType = getFileType(file)

  if (!fileType) {
    throw new Error(`Unsupported file type: ${file.type || file.name}`)
  }

  switch (fileType) {
    case 'pdf': {
      const result = await extractStructuredPDF(file)
      return {
        text: result.text,
        metadata: {
          type: 'pdf',
          pages: result.structured.length,
          structured: result.structured,
        },
      }
    }
    case 'docx': {
      const result = await extractStructuredDOCX(file)
      return {
        text: result.text,
        metadata: {
          type: 'docx',
          html: result.html,
        },
      }
    }
    case 'txt': {
      const text = await file.text()
      return {
        text,
        metadata: {
          type: 'txt',
        },
      }
    }
    default:
      throw new Error(`Unknown file type: ${fileType}`)
  }
}
