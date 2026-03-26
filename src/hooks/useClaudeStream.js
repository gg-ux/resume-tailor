import { useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Parse Server-Sent Events from a stream
 * @param {string} chunk - Raw SSE data
 * @returns {Array} - Parsed events
 */
function parseSSE(chunk) {
  const events = []
  const lines = chunk.split('\n')

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6)
      if (data === '[DONE]') continue

      try {
        events.push(JSON.parse(data))
      } catch {
        // Skip malformed JSON
      }
    }
  }

  return events
}

/**
 * Extract text content from Anthropic streaming events
 * @param {Array} events - Parsed SSE events
 * @returns {string} - Accumulated text
 */
function extractTextFromEvents(events) {
  let text = ''

  for (const event of events) {
    if (event.type === 'content_block_delta' && event.delta?.text) {
      text += event.delta.text
    }
  }

  return text
}

/**
 * Hook for streaming Claude API responses
 * @returns {object} Streaming state and methods
 */
export function useClaudeStream() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamedText, setStreamedText] = useState('')
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const abortControllerRef = useRef(null)

  const reset = useCallback(() => {
    setIsStreaming(false)
    setStreamedText('')
    setError(null)
    setResult(null)
  }, [])

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsStreaming(false)
    }
  }, [])

  /**
   * Parse a resume using Claude
   * @param {string} resumeText - Raw resume text to parse
   * @returns {Promise<object|null>} - Parsed resume data
   */
  const parseResume = useCallback(async (resumeText) => {
    reset()
    setIsStreaming(true)
    abortControllerRef.current = new AbortController()

    try {
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-resume`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ resumeText, stream: true }),
          signal: abortControllerRef.current.signal,
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to parse resume')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const events = parseSSE(chunk)
        const newText = extractTextFromEvents(events)

        fullText += newText
        setStreamedText(fullText)
      }

      // Parse the complete JSON response
      const parsed = JSON.parse(fullText)
      setResult(parsed)
      setIsStreaming(false)
      return parsed
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request cancelled')
      } else {
        setError(err.message)
      }
      setIsStreaming(false)
      return null
    }
  }, [reset])

  /**
   * Analyze resume match against job description
   * @param {object} resume - Parsed resume data
   * @param {string} jobDescription - Job description text
   * @returns {Promise<object|null>} - Match analysis data
   */
  const analyzeMatch = useCallback(async (resume, jobDescription) => {
    reset()
    setIsStreaming(true)
    abortControllerRef.current = new AbortController()

    try {
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-match`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ resume, jobDescription, stream: true }),
          signal: abortControllerRef.current.signal,
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyze match')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const events = parseSSE(chunk)
        const newText = extractTextFromEvents(events)

        fullText += newText
        setStreamedText(fullText)
      }

      // Parse the complete JSON response
      const parsed = JSON.parse(fullText)
      setResult(parsed)
      setIsStreaming(false)
      return parsed
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request cancelled')
      } else {
        setError(err.message)
      }
      setIsStreaming(false)
      return null
    }
  }, [reset])

  return {
    // State
    isStreaming,
    streamedText,
    error,
    result,

    // Actions
    parseResume,
    analyzeMatch,
    abort,
    reset,
  }
}
