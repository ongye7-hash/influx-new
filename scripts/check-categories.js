const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ndjelynkpxffmapndnjx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kamVseW5rcHhmZm1hcG5kbmp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY1Nzk3OCwiZXhwIjoyMDg0MjMzOTc4fQ.WDrHEZC3KyE7Dmq8rnDvGjt0V1aTM6GVEX93_lchF-I'
);

async function check() {
  // Get categories with all columns
  const { data: categories, error } = await supabase.from('categories').select('*');

  if (error) {
    console.log('Error:', error);
    return;
  }

  console.log('카테고리 전체 데이터:');
  console.log(JSON.stringify(categories, null, 2));

  // Get sample services
  console.log('\n\n서비스 샘플:');
  const { data: services } = await supabase.from('services').select('*').limit(5);
  console.log(JSON.stringify(services, null, 2));
}

check();
