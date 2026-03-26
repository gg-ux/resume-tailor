import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ANALYZE_PROMPT = `You are an expert resume analyst. Compare this resume against the job description and provide actionable feedback.

Return ONLY valid JSON matching this exact schema (no markdown, no explanation):
{
  "matchScore": 75,
  "matchedKeywords": ["keyword1", "keyword2"],
  "missingKeywords": ["keyword3", "keyword4"],
  "suggestions": [
    {
      "type": "bullet_improvement",
      "section": "experience",
      "index": 0,
      "bulletIndex": 0,
      "original": "Original bullet text from resume",
      "suggested": "Improved bullet incorporating keywords",
      "reason": "Brief explanation of why this helps"
    },
    {
      "type": "add_skill",
      "skill": "Skill Name",
      "reason": "Why this skill should be added"
    },
    {
      "type": "reword_summary",
      "original": "Original summary if exists",
      "suggested": "New summary text",
      "reason": "Why this improves the match"
    }
  ],
  "overallFeedback": "2-3 sentence summary of how well the resume matches and key areas to improve"
}

Rules:
- matchScore should reflect realistic keyword and experience alignment (0-100)
- matchedKeywords: skills/technologies/terms that appear in BOTH resume and job description
- missingKeywords: important terms in job description NOT in resume (prioritize hard skills)
- suggestions should be specific and actionable
- For bullet improvements, incorporate missing keywords naturally
- Limit to 5-7 most impactful suggestions
- Be realistic about match scores (most resumes are 40-80%)

Resume (JSON):
{RESUME}

Job Description:
{JOB_DESCRIPTION}
`

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { resume, jobDescription, stream = true } = await req.json()

    if (!resume || !jobDescription) {
      return new Response(
        JSON.stringify({ error: 'Resume and job description are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const prompt = ANALYZE_PROMPT
      .replace('{RESUME}', JSON.stringify(resume, null, 2))
      .replace('{JOB_DESCRIPTION}', jobDescription)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        stream,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Anthropic API error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to analyze match' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (stream) {
      // Return streaming response
      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } else {
      // Return JSON response
      const data = await response.json()
      const content = data.content[0]?.text || ''

      // Try to parse the JSON from the response
      let parsed
      try {
        parsed = JSON.parse(content)
      } catch {
        return new Response(
          JSON.stringify({ error: 'Failed to parse response as JSON', raw: content }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ data: parsed }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
