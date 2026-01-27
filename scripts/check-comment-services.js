const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://ndjelynkpxffmapndnjx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kamVseW5rcHhmZm1hcG5kbmp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY1Nzk3OCwiZXhwIjoyMDg0MjMzOTc4fQ.WDrHEZC3KyE7Dmq8rnDvGjt0V1aTM6GVEX93_lchF-I'
);

async function checkServices() {
  // 댓글 상품 정보 조회
  const { data: commentProducts } = await supabase
    .from('admin_products')
    .select('*, admin_categories(*)')
    .ilike('name', '%댓글%');

  // 프로바이더 정보 조회
  const { data: providers } = await supabase.from('api_providers').select('*');
  const providerMap = new Map(providers.map(p => [p.id, p]));

  console.log('댓글 상품 서비스 정보 확인:');
  console.log('================================================================\n');

  for (const product of commentProducts) {
    const provider = providerMap.get(product.primary_provider_id);
    if (!provider) continue;

    console.log('상품: ' + product.name);
    console.log('플랫폼: ' + product.admin_categories?.platform);
    console.log('프로바이더: ' + provider.name);
    console.log('서비스 ID: ' + product.primary_service_id);

    // 프로바이더 API에서 서비스 정보 조회
    try {
      const formData = new URLSearchParams();
      formData.append('key', provider.api_key);
      formData.append('action', 'services');

      const response = await fetch(provider.api_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      const services = await response.json();
      const service = services.find(s => String(s.service) === String(product.primary_service_id));

      if (service) {
        console.log('서비스명: ' + service.name);
        console.log('타입: ' + (service.type || 'N/A'));
        // custom 키워드 확인
        const isCustom = service.name.toLowerCase().includes('custom') || 
                        service.name.toLowerCase().includes('커스텀') ||
                        service.type === 'Custom Comments';
        console.log('커스텀 댓글 여부: ' + (isCustom ? 'YES - link_comments 필요' : 'NO - link 유지'));
      } else {
        console.log('서비스 정보 없음');
      }
    } catch (err) {
      console.log('API 에러: ' + err.message);
    }
    console.log('----------------------------------------------------------------\n');
  }
}

checkServices();
