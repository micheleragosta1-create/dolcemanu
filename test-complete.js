const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 VERIFICA COMPLETA SISTEMA');
console.log('=============================');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🌍 URL presente:', !!supabaseUrl);
console.log('🔑 Anon key presente:', !!supabaseAnonKey);
console.log('🔐 Service key presente:', !!supabaseServiceKey);
if (supabaseUrl) console.log('🌐 Host:', new URL(supabaseUrl).host);
if (supabaseAnonKey) console.log('🔑 Anon key prefix:', supabaseAnonKey.slice(0, 8));
console.log('');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Chiavi essenziali mancanti in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

(async () => {
  try {
    console.log('🧪 Test SELECT products ...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    if (productsError) {
      console.error('❌ Errore products:', productsError);
    } else {
      console.log('✅ OK products, rows:', products?.length || 0);
    }

    console.log('🧪 Test SELECT orders ...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    if (ordersError) {
      console.error('❌ Errore orders:', ordersError);
    } else {
      console.log('✅ OK orders, rows:', orders?.length || 0);
    }
  } catch (e) {
    console.error('❌ Errore generale:', e);
  }
})();
