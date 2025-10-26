import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://pddzngkxfsskkdujchxt.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkZHpuZ2t4ZnNza2tkdWpjaHh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3ODg2MzEsImV4cCI6MjA3NjM2NDYzMX0.dFlf8WAxg9iKjZxPr0z4jTHafNiMIiC-UKhu9kSD2KI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 100,
    },
    timeout: 10000,
    heartbeatIntervalMs: 15000,
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'x-client-info': 'supabase-js-realtime',
    },
  },
});