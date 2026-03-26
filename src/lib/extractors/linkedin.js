import JSZip from 'jszip'

/**
 * Parse CSV content into array of objects
 * @param {string} csv - CSV content
 * @returns {Array<object>}
 */
function parseCSV(csv) {
  const lines = csv.trim().split('\n')
  if (lines.length < 2) return []

  // Parse header row
  const headers = parseCSVRow(lines[0])

  // Parse data rows
  const data = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVRow(lines[i])
    if (values.length === headers.length) {
      const row = {}
      headers.forEach((header, idx) => {
        row[header.trim()] = values[idx]?.trim() || ''
      })
      data.push(row)
    }
  }

  return data
}

/**
 * Parse a single CSV row handling quoted values
 * @param {string} row - CSV row
 * @returns {Array<string>}
 */
function parseCSVRow(row) {
  const values = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < row.length; i++) {
    const char = row[i]

    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"'
        i++ // Skip escaped quote
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
    } else {
      current += char
    }
  }

  values.push(current)
  return values
}

/**
 * Format date from LinkedIn format (e.g., "Jan 2020" or "2020")
 * @param {string} dateStr - LinkedIn date string
 * @returns {string}
 */
function formatDate(dateStr) {
  if (!dateStr) return ''
  return dateStr.trim()
}

/**
 * Extract structured resume data from LinkedIn data export ZIP
 * @param {File} file - LinkedIn ZIP file
 * @returns {Promise<{data: object, text: string}>}
 */
export async function extractFromLinkedIn(file) {
  const zip = await JSZip.loadAsync(file)

  // Find and parse relevant CSV files
  const files = {}
  const fileNames = [
    'Profile.csv',
    'Positions.csv',
    'Education.csv',
    'Skills.csv',
    'Certifications.csv',
    'Languages.csv',
  ]

  for (const name of fileNames) {
    // LinkedIn exports might have files in root or subdirectories
    let content = null

    // Try direct path
    if (zip.files[name]) {
      content = await zip.files[name].async('string')
    } else {
      // Search for file in any directory
      for (const [path, zipFile] of Object.entries(zip.files)) {
        if (path.endsWith(name) && !zipFile.dir) {
          content = await zipFile.async('string')
          break
        }
      }
    }

    if (content) {
      files[name] = parseCSV(content)
    }
  }

  // Build structured resume data
  const resume = {
    personalInfo: {},
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
  }

  // Parse Profile
  if (files['Profile.csv']?.[0]) {
    const profile = files['Profile.csv'][0]
    resume.personalInfo = {
      name: [profile['First Name'], profile['Last Name']].filter(Boolean).join(' '),
      email: profile['Email Address'] || '',
      location: [profile['Geo Location'], profile['Country']].filter(Boolean).join(', '),
      linkedin: profile['Profile URL'] || profile['Public Profile Url'] || '',
    }
    resume.summary = profile['Summary'] || profile['Headline'] || ''
  }

  // Parse Positions (Work Experience)
  if (files['Positions.csv']) {
    resume.experience = files['Positions.csv'].map(pos => ({
      company: pos['Company Name'] || '',
      title: pos['Title'] || '',
      location: pos['Location'] || '',
      startDate: formatDate(pos['Started On']),
      endDate: pos['Finished On'] ? formatDate(pos['Finished On']) : 'Present',
      bullets: pos['Description']
        ? pos['Description'].split(/[•\n]/).map(b => b.trim()).filter(Boolean)
        : [],
    })).filter(exp => exp.company || exp.title)
  }

  // Parse Education
  if (files['Education.csv']) {
    resume.education = files['Education.csv'].map(edu => ({
      school: edu['School Name'] || '',
      degree: edu['Degree Name'] || '',
      field: edu['Field Of Study'] || edu['Notes'] || '',
      dates: [edu['Start Date'], edu['End Date']].filter(Boolean).join(' - '),
    })).filter(edu => edu.school)
  }

  // Parse Skills
  if (files['Skills.csv']) {
    resume.skills = files['Skills.csv']
      .map(skill => skill['Name'] || skill['Skill'])
      .filter(Boolean)
  }

  // Parse Certifications
  if (files['Certifications.csv']) {
    resume.certifications = files['Certifications.csv'].map(cert => ({
      name: cert['Name'] || '',
      issuer: cert['Authority'] || cert['Organization'] || '',
      date: cert['Started On'] || cert['License Number'] ? formatDate(cert['Started On']) : '',
    })).filter(cert => cert.name)
  }

  // Build plain text representation for AI parsing fallback
  const textParts = []

  if (resume.personalInfo.name) {
    textParts.push(resume.personalInfo.name)
  }
  if (resume.personalInfo.email) {
    textParts.push(resume.personalInfo.email)
  }
  if (resume.personalInfo.location) {
    textParts.push(resume.personalInfo.location)
  }
  if (resume.summary) {
    textParts.push('\n' + resume.summary)
  }

  if (resume.experience.length) {
    textParts.push('\n\nEXPERIENCE')
    for (const exp of resume.experience) {
      textParts.push(`\n${exp.title} at ${exp.company}`)
      textParts.push(`${exp.startDate} - ${exp.endDate}`)
      if (exp.location) textParts.push(exp.location)
      if (exp.bullets.length) {
        textParts.push(exp.bullets.map(b => `• ${b}`).join('\n'))
      }
    }
  }

  if (resume.education.length) {
    textParts.push('\n\nEDUCATION')
    for (const edu of resume.education) {
      textParts.push(`\n${edu.school}`)
      if (edu.degree) textParts.push(edu.degree + (edu.field ? ` in ${edu.field}` : ''))
      if (edu.dates) textParts.push(edu.dates)
    }
  }

  if (resume.skills.length) {
    textParts.push('\n\nSKILLS')
    textParts.push(resume.skills.join(', '))
  }

  if (resume.certifications?.length) {
    textParts.push('\n\nCERTIFICATIONS')
    for (const cert of resume.certifications) {
      textParts.push(`${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}`)
    }
  }

  return {
    data: resume,
    text: textParts.join('\n'),
  }
}

/**
 * Check if a file is a LinkedIn data export ZIP
 * @param {File} file - File to check
 * @returns {Promise<boolean>}
 */
export async function isLinkedInExport(file) {
  if (!file.name.endsWith('.zip')) return false

  try {
    const zip = await JSZip.loadAsync(file)
    const fileNames = Object.keys(zip.files)

    // Check for LinkedIn-specific files
    const linkedInFiles = ['Profile.csv', 'Positions.csv', 'Connections.csv']
    return linkedInFiles.some(name =>
      fileNames.some(f => f.endsWith(name))
    )
  } catch {
    return false
  }
}
