import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://vtliewlajtjeqsuqmfdn.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bGlld2xhanRqZXFzdXFtZmRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg1NzE0NjUsImV4cCI6MjA0NDE0NzQ2NX0.0K62vq4imXFurfQZJSh8Di0FSC7Ixgs7MJbDr8ga1GQ"

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
