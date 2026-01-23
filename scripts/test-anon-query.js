const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length) envVars[key.trim()] = values.join('=').trim();
});

// anon key 사용 (브라우저와 동일)
const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  console.log('Testing with ANON key (same as browser)...\n');

  // providers 조회
  const { data: providers, error: provError } = await supabase
    .from('providers')
    .select('*')
    .eq('is_active', true);

  if (provError) {
    console.log('Providers Error:', provError);
  } else {
    console.log('Providers OK:', providers?.length, 'items');
  }

  // services 조회
  const { data: services, error: servError } = await supabase
    .from('services')
    .select(`
      *,
      category:categories(*),
      provider:providers(*)
    `)
    .order('provider_service_id', { ascending: true })
    .range(0, 999);

  if (servError) {
    console.log('Services Error:', JSON.stringify(servError, null, 2));
  } else {
    console.log('Services OK:', services?.length, 'items');
  }
}

test();
