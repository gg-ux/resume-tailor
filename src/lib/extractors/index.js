import { extractTextFromPDF, extractStructuredPDF } from './pdf'
import { extractTextFromDOCX, extractStructuredDOCX } from './docx'
import { extractFromLinkedIn, isLinkedInExport } from './linkedin'

/**
 * Supported file types for resume extraction
 */
export const SUPPORTED_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt',
  'application/zip': 'zip',
  'application/x-zip-compressed': 'zip',
}

export const SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.zip']

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
 * @returns {string|null} - 'pdf', 'docx', 'txt', 'zip', or null
 */
export function getFileType(file) {
  const type = SUPPORTED_TYPES[file.type]
  if (type) return type

  const ext = file.name.split('.').pop().toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (ext === 'docx') return 'docx'
  if (ext === 'txt') return 'txt'
  if (ext === 'zip') return 'zip'

  return null
}

// Re-export LinkedIn utilities
export { isLinkedInExport }

/**
 * Extract text from a resume file
 * @param {File} file - Resume file (PDF, DOCX, TXT, or LinkedIn ZIP)
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
    case 'zip': {
      const isLinkedIn = await isLinkedInExport(file)
      if (isLinkedIn) {
        const result = await extractFromLinkedIn(file)
        return result.text
      }
      throw new Error('ZIP file does not appear to be a LinkedIn data export')
    }
    default:
      throw new Error(`Unknown file type: ${fileType}`)
  }
}

/**
 * Extract structured content from a resume file
 * @param {File} file - Resume file
 * @returns {Promise<{text: string, metadata: object, parsedData?: object}>}
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
    case 'zip': {
      const isLinkedIn = await isLinkedInExport(file)
      if (isLinkedIn) {
        const result = await extractFromLinkedIn(file)
        return {
          text: result.text,
          metadata: {
            type: 'linkedin',
            source: 'LinkedIn Data Export',
          },
          // LinkedIn exports are already parsed into structured data
          parsedData: result.data,
        }
      }
      throw new Error('ZIP file does not appear to be a LinkedIn data export')
    }
    default:
      throw new Error(`Unknown file type: ${fileType}`)
  }
}
