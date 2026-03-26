import { useState, useCallback } from 'react'
import { extractText, extractStructured, isSupported, SUPPORTED_EXTENSIONS } from '../lib/extractors'

/**
 * Hook for handling resume file uploads with extraction
 * @returns {object} Upload state and handlers
 */
export function useResumeUpload() {
  const [file, setFile] = useState(null)
  const [text, setText] = useState('')
  const [metadata, setMetadata] = useState(null)
  const [parsedData, setParsedData] = useState(null) // Pre-parsed data (e.g., from LinkedIn)
  const [isExtracting, setIsExtracting] = useState(false)
  const [error, setError] = useState(null)

  const reset = useCallback(() => {
    setFile(null)
    setText('')
    setMetadata(null)
    setParsedData(null)
    setError(null)
    setIsExtracting(false)
  }, [])

  const processFile = useCallback(async (uploadedFile) => {
    // Validate file
    if (!isSupported(uploadedFile)) {
      setError(`Unsupported file type. Please upload ${SUPPORTED_EXTENSIONS.join(', ')}`)
      return false
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (uploadedFile.size > maxSize) {
      setError('File too large. Maximum size is 10MB.')
      return false
    }

    setFile(uploadedFile)
    setError(null)
    setIsExtracting(true)
    setParsedData(null)

    try {
      const result = await extractStructured(uploadedFile)
      setText(result.text)
      setMetadata(result.metadata)
      // LinkedIn exports come with pre-parsed data
      if (result.parsedData) {
        setParsedData(result.parsedData)
      }
      setIsExtracting(false)
      return result
    } catch (err) {
      console.error('Extraction error:', err)
      setError(`Failed to extract text: ${err.message}`)
      setIsExtracting(false)
      return null
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()

    const droppedFile = e.dataTransfer?.files?.[0]
    if (droppedFile) {
      processFile(droppedFile)
    }
  }, [processFile])

  const handleFileSelect = useCallback((e) => {
    const selectedFile = e.target?.files?.[0]
    if (selectedFile) {
      processFile(selectedFile)
    }
  }, [processFile])

  const handlePaste = useCallback((pastedText) => {
    if (typeof pastedText === 'string' && pastedText.trim()) {
      setFile(null)
      setText(pastedText.trim())
      setMetadata({ type: 'pasted' })
      setError(null)
    }
  }, [])

  return {
    // State
    file,
    text,
    metadata,
    parsedData,
    isExtracting,
    error,
    hasContent: Boolean(text),
    isLinkedIn: metadata?.type === 'linkedin',

    // Actions
    processFile,
    handleDrop,
    handleFileSelect,
    handlePaste,
    reset,

    // Utilities
    supportedExtensions: SUPPORTED_EXTENSIONS,
  }
}
