/*
  # Initial BugSpot Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password_hash` (text)
      - `api_key` (text, unique)
      - `plan` (text, default 'free')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `projects`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `name` (text)
      - `domain` (text)
      - `api_key` (text, unique)
      - `settings` (jsonb)
      - `created_at` (timestamp)
    
    - `bug_reports`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key)
      - `title` (text)
      - `description` (text)
      - `severity` (text)
      - `status` (text)
      - `screenshot` (text)
      - `environment` (jsonb)
      - `user_email` (text)
      - `user_agent` (text)
      - `url` (text)
      - `steps` (jsonb)
      - `tags` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `analytics`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key)
      - `event_type` (text)
      - `event_data` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for API key access to bug reports
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  api_key text UNIQUE NOT NULL,
  plan text DEFAULT 'free',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  domain text,
  api_key text UNIQUE NOT NULL,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create bug_reports table
CREATE TABLE IF NOT EXISTS bug_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  severity text DEFAULT 'medium',
  status text DEFAULT 'open',
  screenshot text,
  environment jsonb,
  user_email text,
  user_agent text,
  url text,
  steps jsonb DEFAULT '[]',
  tags jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can read own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Bug reports policies
CREATE POLICY "Users can read bug reports from own projects"
  ON bug_reports
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "API key access for bug report submission"
  ON bug_reports
  FOR INSERT
  TO anon
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE api_key = current_setting('request.headers')::json->>'x-api-key'
    )
  );

CREATE POLICY "Users can update bug reports from own projects"
  ON bug_reports
  FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete bug reports from own projects"
  ON bug_reports
  FOR DELETE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Analytics policies
CREATE POLICY "Users can read analytics from own projects"
  ON analytics
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "API key access for analytics"
  ON analytics
  FOR INSERT
  TO anon
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE api_key = current_setting('request.headers')::json->>'x-api-key'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_api_key ON projects(api_key);
CREATE INDEX IF NOT EXISTS idx_bug_reports_project_id ON bug_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_severity ON bug_reports(severity);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON bug_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_project_id ON analytics(project_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);