import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nqouehuzbsdibfhqhqsx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xb3VlaHV6YnNkaWJmaHFocXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NDgyOTcsImV4cCI6MjA3NjAyNDI5N30.BEYAfwvsiAnvTWH0MHWG27AwwqoKmj33BdJ8wvKG0kY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

