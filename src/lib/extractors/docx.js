import mammoth from 'mammoth'

/**
 * Extract text content from a DOCX file
 * @param {File} file - DOCX file to extract text from
 * @returns {Promise<string>} - Extracted text content
 */
export async function extractTextFromDOCX(file) {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value.trim()
}

/**
 * Extract HTML from DOCX for richer formatting info
 * @param {File} file - DOCX file to extract from
 * @returns {Promise<{text: string, html: string}>} - Text and HTML content
 */
export async function extractStructuredDOCX(file) {
  const arrayBuffer = await file.arrayBuffer()

  const [textResult, htmlResult] = await Promise.all([
    mammoth.extractRawText({ arrayBuffer }),
    mammoth.convertToHtml({ arrayBuffer }),
  ])

  return {
    text: textResult.value.trim(),
    html: htmlResult.value,
  }
}
