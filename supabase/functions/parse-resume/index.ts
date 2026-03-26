import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PARSE_PROMPT = `You are a resume parser. Extract structured data from the following resume text.

Return ONLY valid JSON matching this exact schema (no markdown, no explanation):
{
  "personalInfo": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "optional phone",
    "location": "optional city, state",
    "linkedin": "optional linkedin url",
    "website": "optional website url"
  },
  "summary": "optional professional summary paragraph",
  "experience": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "location": "optional location",
      "startDate": "Month Year",
      "endDate": "Month Year or Present",
      "bullets": ["Achievement 1", "Achievement 2"]
    }
  ],
  "education": [
    {
      "school": "School Name",
      "degree": "Degree Type",
      "field": "optional field of study",
      "dates": "Year - Year or Year",
      "gpa": "optional GPA"
    }
  ],
  "skills": ["Skill 1", "Skill 2", "Skill 3"],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "optional issuing organization",
      "date": "optional date"
    }
  ]
}

Rules:
- Extract ALL information present in the resume
- If a field is not present, omit it or use null
- Keep bullet points concise but complete
- Preserve the original wording where possible
- Skills should be individual items, not comma-separated strings

Resume text to parse:
`

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { resumeText, stream = true } = await req.json()

    if (!resumeText) {
      return new Response(
        JSON.stringify({ error: 'Resume text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4096,
        stream,
        messages: [
          {
            role: 'user',
            content: PARSE_PROMPT + resumeText,
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Anthropic API error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to parse resume' }),
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
        // If JSON parsing fails, return raw content
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
