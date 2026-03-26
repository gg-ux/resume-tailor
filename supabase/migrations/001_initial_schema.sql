-- Resume Tailor Database Schema
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Base resumes table (one per user for MVP)
create table if not exists resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text default 'My Resume',
  data jsonb not null default '{}',
  raw_text text, -- Original extracted text for reference
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create index for user lookups
create index if not exists resumes_user_id_idx on resumes(user_id);

-- Job applications with tailored resumes
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  resume_id uuid references resumes(id) on delete cascade not null,
  company text,
  title text,
  url text, -- Job listing URL
  description text not null,
  tailored_data jsonb, -- Modified resume for this job
  analysis jsonb, -- Match results, suggestions from AI
  status text default 'draft' check (status in ('draft', 'applied', 'interviewing', 'offered', 'rejected', 'withdrawn')),
  applied_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for job lookups
create index if not exists jobs_user_id_idx on jobs(user_id);
create index if not exists jobs_resume_id_idx on jobs(resume_id);
create index if not exists jobs_status_idx on jobs(status);

-- Enable Row Level Security
alter table resumes enable row level security;
alter table jobs enable row level security;

-- RLS Policies for resumes
create policy "Users can view own resumes"
  on resumes for select
  using (auth.uid() = user_id);

create policy "Users can insert own resumes"
  on resumes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own resumes"
  on resumes for update
  using (auth.uid() = user_id);

create policy "Users can delete own resumes"
  on resumes for delete
  using (auth.uid() = user_id);

-- RLS Policies for jobs
create policy "Users can view own jobs"
  on jobs for select
  using (auth.uid() = user_id);

create policy "Users can insert own jobs"
  on jobs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own jobs"
  on jobs for update
  using (auth.uid() = user_id);

create policy "Users can delete own jobs"
  on jobs for delete
  using (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_resumes_updated_at
  before update on resumes
  for each row
  execute function update_updated_at_column();

create trigger update_jobs_updated_at
  before update on jobs
  for each row
  execute function update_updated_at_column();

-- Example resume data structure (for reference):
-- {
--   "personalInfo": {
--     "name": "John Doe",
--     "email": "john@example.com",
--     "phone": "555-1234",
--     "location": "San Francisco, CA",
--     "linkedin": "linkedin.com/in/johndoe",
--     "website": "johndoe.com"
--   },
--   "summary": "Experienced software engineer...",
--   "experience": [
--     {
--       "company": "TechCorp",
--       "title": "Senior Engineer",
--       "location": "SF",
--       "startDate": "Jan 2020",
--       "endDate": "Present",
--       "bullets": ["Led team of 5", "Increased performance by 40%"]
--     }
--   ],
--   "education": [
--     {
--       "school": "UC Berkeley",
--       "degree": "BS",
--       "field": "Computer Science",
--       "dates": "2012-2016",
--       "gpa": "3.8"
--     }
--   ],
--   "skills": ["JavaScript", "Python", "AWS"],
--   "certifications": [
--     {
--       "name": "AWS Solutions Architect",
--       "issuer": "Amazon",
--       "date": "2023"
--     }
--   ]
-- }

-- Example analysis structure (for reference):
-- {
--   "matchScore": 72,
--   "matchedKeywords": ["React", "TypeScript", "Node.js"],
--   "missingKeywords": ["GraphQL", "AWS", "Docker"],
--   "suggestions": [
--     {
--       "type": "bullet_improvement",
--       "section": "experience",
--       "index": 0,
--       "bulletIndex": 1,
--       "original": "Built web applications",
--       "suggested": "Built scalable web applications using React and TypeScript",
--       "reason": "Adds specific technologies mentioned in job description"
--     }
--   ],
--   "overallFeedback": "Strong match for the technical requirements..."
-- }
