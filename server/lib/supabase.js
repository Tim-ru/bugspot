import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '../..');

// Загружаем .env.local для локальной разработки (если существует)
const envLocalPath = join(projectRoot, '.env.local');
if (existsSync(envLocalPath)) {
  config({ path: envLocalPath });
  console.log('📁 Loaded environment from .env.local');
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Missing Supabase environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).\n' +
    'For local development:\n' +
    '  1. Run `supabase start` to start local Supabase\n' +
    '  2. Create .env.local with keys from `supabase status`\n' +
    'For production: Set environment variables in your deployment platform.'
  );
}

// Server-side client: use secret key with elevated privileges
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

console.log(`🔌 Connected to Supabase: ${supabaseUrl}`);

export { supabase };