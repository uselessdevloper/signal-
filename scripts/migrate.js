/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applySchema() {
  const sql = fs.readFileSync('supabase-schema.sql', 'utf8');
  
  // Since supabase-js doesn't have a direct query() for multiple statements,
  // we can use the execute_sql rpc if it exists, but the user doesn't have one.
  // Instead, let's just make an HTTP POST request to the Supabase Postgres meta endpoint 
  // or just run a specific SQL query block using fetch.
  
  // Actually, we can just use node-postgres (pg).
  /* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require('child_process');
  const { Client } = require('pg');
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error("Missing DATABASE_URL or POSTGRES_URL environment variable.");
    process.exit(1);
  }
  const client = new Client({
    connectionString: connectionString
  });

  try {
    await client.connect();
    
    // We only need to run the new table creation
    const query = `
      CREATE TABLE IF NOT EXISTS public.match_jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
        job_description TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
        match_score INTEGER,
        gap_analysis TEXT,
        explainable_text TEXT,
        error_message TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE public.match_jobs ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Users can view their own match jobs" ON public.match_jobs;
      CREATE POLICY "Users can view their own match jobs" ON public.match_jobs FOR SELECT TO authenticated USING (profile_id = auth.uid());
      DROP POLICY IF EXISTS "Users can insert their own match jobs" ON public.match_jobs;
      CREATE POLICY "Users can insert their own match jobs" ON public.match_jobs FOR INSERT TO authenticated WITH CHECK (profile_id = auth.uid());
      DROP POLICY IF EXISTS "Service role can update match jobs" ON public.match_jobs;
      CREATE POLICY "Service role can update match jobs" ON public.match_jobs FOR UPDATE TO service_role USING (true);
    `;
    
    await client.query(query);
    console.log("Migration successful");
  } catch (err) {
    console.error("Migration failed", err);
  } finally {
    await client.end();
  }
}

applySchema();
