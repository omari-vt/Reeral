import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://dbuonbubzzbpcffvctiq.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRidW9uYnVienpicGNmZnZjdGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MDMyMTAsImV4cCI6MjA5MjE3OTIxMH0.BMt7C7TkzgyuoBjbkuyFody3PNOwNhr3OOQwS_3fkoQ"

export const supabase = createClient(supabaseUrl, supabaseKey)