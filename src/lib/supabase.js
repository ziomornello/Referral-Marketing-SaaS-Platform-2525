import { createClient } from '@supabase/supabase-js'

// Verifica che le credenziali siano presenti
const SUPABASE_URL = 'https://wdqxhujrlciczoszpsfp.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkcXhodWpybGNpY3pvc3pwc2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyODA3NDUsImV4cCI6MjA2NDg1Njc0NX0.KoG9Tbikm7SkrrH1pWNklVNPgWXM8MWs-Q085VtCcIs'

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Configurazione client Supabase senza cache per evitare problemi di schema
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'x-my-custom-header': 'efallmo-app',
      'cache-control': 'no-cache' // Disabilita cache
    }
  },
  db: {
    schema: 'public'
  }
});

// Test di connessione
supabaseClient.from('users_rh847').select('count', { count: 'exact', head: true })
  .then(({ error, count }) => {
    if (error) {
      console.error('❌ Errore connessione Supabase:', error);
    } else {
      console.log('✅ Connesso a Supabase! Utenti trovati:', count || 0);
    }
  })
  .catch(err => {
    console.error('❌ Errore di rete Supabase:', err);
  });

export default supabaseClient;