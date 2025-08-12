import { createClient } from '@supabase/supabase-js';


const supabaseUrl = "https://allnswfxyynneybpbbfi.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4YnBrcnRqaGdycXBsZ2VvamZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTc1NjMwNiwiZXhwIjoyMDY1MzMyMzA2fQ.l-VSAqLXk_NE5MXMya3Ri2DxnkseEI1zxylKtfFsLos";

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});