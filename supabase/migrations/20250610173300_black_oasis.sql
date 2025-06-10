/*
  # Add Analytics Functions

  1. Functions
    - `get_reports_by_status` - Get bug report counts grouped by status
    - `get_reports_by_severity` - Get bug report counts grouped by severity  
    - `get_reports_over_time` - Get bug report counts over time
*/

-- Function to get reports by status
CREATE OR REPLACE FUNCTION get_reports_by_status(user_id uuid, project_id uuid DEFAULT NULL)
RETURNS TABLE(status text, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF project_id IS NOT NULL THEN
    RETURN QUERY
    SELECT br.status, COUNT(*)::bigint
    FROM bug_reports br
    JOIN projects p ON br.project_id = p.id
    WHERE p.user_id = get_reports_by_status.user_id
      AND br.project_id = get_reports_by_status.project_id
    GROUP BY br.status;
  ELSE
    RETURN QUERY
    SELECT br.status, COUNT(*)::bigint
    FROM bug_reports br
    JOIN projects p ON br.project_id = p.id
    WHERE p.user_id = get_reports_by_status.user_id
    GROUP BY br.status;
  END IF;
END;
$$;

-- Function to get reports by severity
CREATE OR REPLACE FUNCTION get_reports_by_severity(user_id uuid, project_id uuid DEFAULT NULL)
RETURNS TABLE(severity text, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF project_id IS NOT NULL THEN
    RETURN QUERY
    SELECT br.severity, COUNT(*)::bigint
    FROM bug_reports br
    JOIN projects p ON br.project_id = p.id
    WHERE p.user_id = get_reports_by_severity.user_id
      AND br.project_id = get_reports_by_severity.project_id
    GROUP BY br.severity;
  ELSE
    RETURN QUERY
    SELECT br.severity, COUNT(*)::bigint
    FROM bug_reports br
    JOIN projects p ON br.project_id = p.id
    WHERE p.user_id = get_reports_by_severity.user_id
    GROUP BY br.severity;
  END IF;
END;
$$;

-- Function to get reports over time
CREATE OR REPLACE FUNCTION get_reports_over_time(user_id uuid, project_id uuid DEFAULT NULL, days_back integer DEFAULT 30)
RETURNS TABLE(date date, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF project_id IS NOT NULL THEN
    RETURN QUERY
    SELECT DATE(br.created_at) as date, COUNT(*)::bigint
    FROM bug_reports br
    JOIN projects p ON br.project_id = p.id
    WHERE p.user_id = get_reports_over_time.user_id
      AND br.project_id = get_reports_over_time.project_id
      AND br.created_at >= NOW() - INTERVAL '1 day' * days_back
    GROUP BY DATE(br.created_at)
    ORDER BY date;
  ELSE
    RETURN QUERY
    SELECT DATE(br.created_at) as date, COUNT(*)::bigint
    FROM bug_reports br
    JOIN projects p ON br.project_id = p.id
    WHERE p.user_id = get_reports_over_time.user_id
      AND br.created_at >= NOW() - INTERVAL '1 day' * days_back
    GROUP BY DATE(br.created_at)
    ORDER BY date;
  END IF;
END;
$$;