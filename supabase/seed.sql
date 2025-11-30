-- Seed data for local development
-- This file is executed after migrations when running `supabase db reset`

-- Create test user (password: test123)
INSERT INTO users (id, email, password_hash, api_key, plan)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'test@bugspot.dev',
  '$2a$10$rqLQbzQ7.MJgvqVv7vqz8eLw/kHKvqpzWPqX8LgJM3nP5qP5qP5qP', -- bcrypt hash of 'test123'
  'bs_test_api_key_12345',
  'pro'
) ON CONFLICT (email) DO NOTHING;

-- Create test project
INSERT INTO projects (id, user_id, name, domain, api_key, settings)
VALUES (
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Demo Project',
  'localhost',
  'bs_project_demo_key_67890',
  '{"theme": "light", "notifications": true}'::jsonb
) ON CONFLICT DO NOTHING;

-- Create sample bug reports
INSERT INTO bug_reports (id, project_id, title, description, severity, status, environment, user_email, url, tags, steps)
VALUES 
  (
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Login button not responding',
    'When clicking the login button, nothing happens. The button appears clickable but no action is triggered.',
    'high',
    'open',
    '{"browser": "Chrome 120", "os": "macOS 14.0", "viewport": "1920x1080"}'::jsonb,
    'user@example.com',
    'http://localhost:5173/login',
    '["auth", "ui", "critical"]'::jsonb,
    '["Go to login page", "Enter credentials", "Click login button", "Nothing happens"]'::jsonb
  ),
  (
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Dashboard chart not loading',
    'The analytics chart on the dashboard shows a loading spinner indefinitely.',
    'medium',
    'in-progress',
    '{"browser": "Firefox 121", "os": "Windows 11", "viewport": "1440x900"}'::jsonb,
    'qa@example.com',
    'http://localhost:5173/dashboard',
    '["dashboard", "charts", "performance"]'::jsonb,
    '["Login to dashboard", "Navigate to analytics", "Chart shows spinner forever"]'::jsonb
  ),
  (
    'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Mobile navigation overlap',
    'On mobile devices, the navigation menu overlaps with the main content area.',
    'low',
    'open',
    '{"browser": "Safari Mobile", "os": "iOS 17", "viewport": "375x667"}'::jsonb,
    'mobile-tester@example.com',
    'http://localhost:5173/',
    '["mobile", "navigation", "ui"]'::jsonb,
    '["Open site on mobile", "Tap hamburger menu", "Menu overlaps content"]'::jsonb
  ),
  (
    'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'Form validation error not clearing',
    'After fixing a validation error in a form, the error message remains visible.',
    'medium',
    'resolved',
    '{"browser": "Chrome 120", "os": "Ubuntu 22.04", "viewport": "1920x1080"}'::jsonb,
    'dev@example.com',
    'http://localhost:5173/settings',
    '["forms", "validation", "ux"]'::jsonb,
    '["Open settings", "Submit with invalid data", "Fix the error", "Error message persists"]'::jsonb
  ),
  (
    'a6eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'API timeout on large datasets',
    'The API returns a timeout error when fetching more than 1000 records.',
    'critical',
    'open',
    '{"browser": "Chrome 120", "os": "macOS 14.0", "viewport": "1920x1080"}'::jsonb,
    'backend@example.com',
    'http://localhost:5173/reports',
    '["api", "performance", "backend"]'::jsonb,
    '["Navigate to reports", "Apply no filters", "Click export all", "Request times out"]'::jsonb
  )
ON CONFLICT DO NOTHING;

-- Create sample analytics events
INSERT INTO analytics (id, project_id, event_type, event_data)
VALUES
  (
    'b7eebc99-9c0b-4ef8-bb6d-6bb9bd380a88',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'widget_opened',
    '{"page": "/", "session_id": "sess_123"}'::jsonb
  ),
  (
    'c8eebc99-9c0b-4ef8-bb6d-6bb9bd380a99',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'report_submitted',
    '{"report_id": "c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33", "session_id": "sess_123"}'::jsonb
  ),
  (
    'd9eebc99-9c0b-4ef8-bb6d-6bb9bd380aaa',
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'widget_opened',
    '{"page": "/dashboard", "session_id": "sess_456"}'::jsonb
  )
ON CONFLICT DO NOTHING;

