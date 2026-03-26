import { supabase } from './supabase'

// ============== RESUMES ==============

/**
 * Get the user's resume (MVP: one resume per user)
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function getResume() {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .single()

  return { data, error }
}

/**
 * Create or update a resume
 * @param {object} resumeData - Parsed resume data
 * @param {string} rawText - Original extracted text
 * @param {string} name - Resume name (optional)
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function saveResume(resumeData, rawText, name = 'My Resume') {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: { message: 'Not authenticated' } }
  }

  // Check if user already has a resume
  const { data: existing } = await supabase
    .from('resumes')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('resumes')
      .update({
        data: resumeData,
        raw_text: rawText,
        name,
      })
      .eq('id', existing.id)
      .select()
      .single()

    return { data, error }
  } else {
    // Create new
    const { data, error } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        data: resumeData,
        raw_text: rawText,
        name,
      })
      .select()
      .single()

    return { data, error }
  }
}

/**
 * Update resume data
 * @param {string} id - Resume ID
 * @param {object} updates - Fields to update
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function updateResume(id, updates) {
  const { data, error } = await supabase
    .from('resumes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

// ============== JOBS ==============

/**
 * Get all jobs for the current user
 * @returns {Promise<{data: array|null, error: object|null}>}
 */
export async function getJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })

  return { data, error }
}

/**
 * Get a single job by ID
 * @param {string} id - Job ID
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function getJob(id) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single()

  return { data, error }
}

/**
 * Create a new job application
 * @param {object} jobData - Job data
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function createJob(jobData) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: { message: 'Not authenticated' } }
  }

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      user_id: user.id,
      ...jobData,
    })
    .select()
    .single()

  return { data, error }
}

/**
 * Update a job application
 * @param {string} id - Job ID
 * @param {object} updates - Fields to update
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function updateJob(id, updates) {
  const { data, error } = await supabase
    .from('jobs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

/**
 * Delete a job application
 * @param {string} id - Job ID
 * @returns {Promise<{error: object|null}>}
 */
export async function deleteJob(id) {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id)

  return { error }
}

/**
 * Update job status
 * @param {string} id - Job ID
 * @param {string} status - New status
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function updateJobStatus(id, status) {
  const updates = { status }

  if (status === 'applied') {
    updates.applied_at = new Date().toISOString()
  }

  return updateJob(id, updates)
}
