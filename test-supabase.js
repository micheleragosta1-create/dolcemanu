require('dotenv').config({ path: '.env.local' });
const { getSupabase } = require('./lib/supabase.ts');

async function testSupabaseConnection() {
  console.log('Attempting to connect to Supabase...');
  const supabase = getSupabase();

  if (!supabase) {
    console.error('Supabase client could not be initialized. Check your .env.local file.');
    return;
  }

  console.log('Supabase client initialized. Fetching products...');

  try {
    const { data, error } = await supabase.from('products').select('*').limit(1);
    if (error) {
      console.error('Error fetching products:', error);
    } else {
      console.log('Successfully fetched data:', data);
    }
  } catch (e) {
    console.error('An unexpected error occurred:', e);
  }
}

testSupabaseConnection();
