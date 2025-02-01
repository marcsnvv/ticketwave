import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://vtliewlajtjeqsuqmfdn.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0bGlld2xhanRqZXFzdXFtZmRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MzI3MTEsImV4cCI6MjA1NDAwODcxMX0.g-nu0wtZQwe5ieudMTbo_7B8c5dc7eRafr69xQ0HSpY"

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
