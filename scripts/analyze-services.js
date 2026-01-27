const { createClient } = require('@supabase/supabase-js');

// Use service role key to bypass RLS
const supabase = createClient(
  'https://ndjelynkpxffmapndnjx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kamVseW5rcHhmZm1hcG5kbmp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY1Nzk3OCwiZXhwIjoyMDg0MjMzOTc4fQ.WDrHEZC3KyE7Dmq8rnDvGjt0V1aTM6GVEX93_lchF-I'
);

async function analyze() {
  // First get categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*');

  console.log('Categories count:', categories?.length || 0);
  if (catError) console.log('Category error:', catError);

  const categoryMap = {};
  if (categories) {
    categories.forEach(c => {
      categoryMap[c.id] = { name: c.name, platform: c.platform };
    });
  }

  // Try different queries
  const { data, error, count } = await supabase
    .from('services')
    .select('*', { count: 'exact' });

  console.log('Services count:', count, 'Data length:', data?.length || 0);
  if (error) {
    console.log('Error:', error);
    return;
  }

  // Log first service to see structure
  if (data && data.length > 0) {
    console.log('Sample service columns:', Object.keys(data[0]));
  }

  // Group by platform and category
  const grouped = {};
  data.forEach(s => {
    const catInfo = categoryMap[s.category_id];
    const platform = catInfo ? catInfo.platform : 'Unknown';
    const cat = catInfo ? catInfo.name : 'Uncategorized';
    if (!grouped[platform]) grouped[platform] = {};
    if (!grouped[platform][cat]) grouped[platform][cat] = [];
    grouped[platform][cat].push({ name: s.name, active: s.is_active, id: s.id, category_id: s.category_id });
  });

  // Print report
  console.log('\n===========================================');
  console.log('       서비스 분석 보고서');
  console.log('===========================================\n');

  let totalServices = 0;
  let activeServices = 0;

  for (const [platform, categories] of Object.entries(grouped)) {
    console.log('\n╔══════════════════════════════════════════');
    console.log('║ ' + platform.toUpperCase());
    console.log('╚══════════════════════════════════════════');

    for (const [cat, services] of Object.entries(categories)) {
      console.log('\n  📁 [' + cat + '] (' + services.length + '개)');
      services.forEach(s => {
        totalServices++;
        if (s.active) activeServices++;
        const status = s.active ? '✅' : '❌';
        const name = s.name.length > 55 ? s.name.substring(0, 55) + '...' : s.name;
        console.log('     ' + status + ' ' + name);
      });
    }
  }

  console.log('\n\n===========================================');
  console.log('       통계');
  console.log('===========================================');
  console.log('총 서비스: ' + totalServices);
  console.log('활성 서비스: ' + activeServices);
  console.log('비활성 서비스: ' + (totalServices - activeServices));
}

analyze();
