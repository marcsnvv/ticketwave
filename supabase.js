import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://vtliewlajtjeqsuqmfdn.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bGlld2xhanRqZXFzdXFtZmRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0NDA0MjIsImV4cCI6MjA1NDAxNjQyMn0.fdyjkZM2Uj3iwMwV2qQlsKnmq0fpSIozbuUEn2dnlJ0"

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
