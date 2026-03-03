import { createClient } from '@supabase/supabase-js';

// ⚠️ UPDATE THESE with your Supabase project credentials
const SUPABASE_URL = 'https://gfadcoutwferhgstrtjv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmYWRjb3V0d2Zlcmhnc3RydGp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MDY5MTQsImV4cCI6MjA4ODA4MjkxNH0.sk4AZYJP9h0MQlnvGjxxZ9SFm0ewPAYnhg5d7Ny5sVY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
