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

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  // 정확히 어드민 페이지와 동일한 쿼리
  const { data, error } = await supabase
    .from('services')
    .select(`
      *,
      category:categories(*),
      provider:providers(*)
    `)
    .order('provider_service_id', { ascending: true })
    .range(0, 999);

  if (error) {
    console.log('Error:', JSON.stringify(error, null, 2));
    return;
  }

  console.log('Success! Got', data.length, 'services');
  console.log('First service keys:', Object.keys(data[0] || {}));
}

test();
