import * as pdfjsLib from 'pdfjs-dist'

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

/**
 * Extract text content from a PDF file
 * @param {File} file - PDF file to extract text from
 * @returns {Promise<string>} - Extracted text content
 */
export async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  let fullText = ''

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()

    // Extract text items and join with proper spacing
    const pageText = textContent.items
      .map(item => {
        // Add newline for significant vertical gaps
        if (item.hasEOL) {
          return item.str + '\n'
        }
        return item.str
      })
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    fullText += pageText + '\n\n'
  }

  return fullText.trim()
}

/**
 * Extract structured text with position data for better parsing
 * @param {File} file - PDF file to extract from
 * @returns {Promise<{text: string, structured: Array}>} - Text and structured data
 */
export async function extractStructuredPDF(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  const structured = []
  let fullText = ''

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const viewport = page.getViewport({ scale: 1.0 })

    const pageItems = textContent.items.map(item => ({
      text: item.str,
      x: item.transform[4],
      y: viewport.height - item.transform[5], // Flip Y axis
      width: item.width,
      height: item.height,
      fontSize: Math.abs(item.transform[0]),
    }))

    structured.push({
      page: i,
      items: pageItems,
    })

    // Build text with line breaks based on Y position changes
    let lastY = null
    let lineText = ''

    for (const item of pageItems) {
      if (lastY !== null && Math.abs(item.y - lastY) > item.height * 0.5) {
        fullText += lineText.trim() + '\n'
        lineText = ''
      }
      lineText += item.text + ' '
      lastY = item.y
    }
    fullText += lineText.trim() + '\n\n'
  }

  return {
    text: fullText.trim(),
    structured,
  }
}
