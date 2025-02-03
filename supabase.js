import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://vtliewlajtjeqsuqmfdn.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bGlld2xhanRqZXFzdXFtZmRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1OTc5MzUsImV4cCI6MjA1NDE3MzkzNX0.QG-WYLjZTsKF67RNMlz6byk0icy2RH0jXpU7fh3wRC4"

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
