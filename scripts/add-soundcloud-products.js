// SoundCloud 상품 추가 스크립트
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) envVars[m[1].trim()] = m[2].trim();
});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function addSoundCloudProducts() {
  console.log('🎧 SoundCloud 상품 추가 시작...\n');

  // 1. SoundCloud 카테고리 가져오기
  const { data: scCategories } = await supabase
    .from('admin_categories')
    .select('*')
    .eq('platform', 'soundcloud');

  console.log('=== SoundCloud 카테고리 ===');
  scCategories.forEach(c => console.log(`  ${c.slug}: ${c.name}`));

  // 2. Spotify 상품 가져오기 (복사할 원본)
  const { data: spotifyProducts } = await supabase
    .from('admin_products')
    .select('*, category:admin_categories(platform, slug)')
    .not('category', 'is', null);

  // Spotify 플랫폼 상품만 필터
  const spProducts = spotifyProducts.filter(p => p.category?.platform === 'spotify');

  console.log(`\n=== Spotify 상품 (복사 원본): ${spProducts.length}개 ===`);
  spProducts.forEach(p => console.log(`  ${p.name} -> ${p.category?.slug}`));

  // 3. SoundCloud 카테고리 맵
  const scCategoryMap = {};
  scCategories.forEach(c => { scCategoryMap[c.slug] = c.id; });

  // 4. SoundCloud 상품 생성
  let created = 0;
  for (const sp of spProducts) {
    const slug = sp.category?.slug;
    const scCategoryId = scCategoryMap[slug];

    if (!scCategoryId) {
      console.log(`\n❌ SoundCloud 카테고리 없음: ${slug}`);
      continue;
    }

    // SoundCloud용 상품명 변경
    let newName = sp.name;
    if (newName.includes('스트리밍')) {
      newName = '🎧 [SoundCloud] 재생수';
    } else if (newName.includes('팔로워') || newName.includes('리스너')) {
      newName = '👤 [SoundCloud] 팔로워';
    }

    // SoundCloud용 상품 생성
    const newProduct = {
      category_id: scCategoryId,
      name: newName,
      description: sp.description?.replace(/Spotify/gi, 'SoundCloud') || null,
      price_per_1000: sp.price_per_1000,
      min_quantity: sp.min_quantity,
      max_quantity: sp.max_quantity,
      primary_provider_id: sp.primary_provider_id,
      primary_service_id: sp.primary_service_id,
      fallback1_provider_id: sp.fallback1_provider_id,
      fallback1_service_id: sp.fallback1_service_id,
      fallback2_provider_id: sp.fallback2_provider_id,
      fallback2_service_id: sp.fallback2_service_id,
      input_type: sp.input_type,
      refill_days: sp.refill_days,
      avg_speed: sp.avg_speed,
      sort_order: sp.sort_order,
      is_active: true,
      is_recommended: false,
    };

    const { data, error } = await supabase
      .from('admin_products')
      .insert(newProduct)
      .select()
      .single();

    if (error) {
      console.log(`\n❌ 생성 실패: ${error.message}`);
    } else {
      console.log(`\n✅ SoundCloud 상품 생성: ${data.name}`);
      created++;
    }
  }

  // 5. 결과 확인
  const { data: allSC } = await supabase
    .from('admin_products')
    .select('name, category:admin_categories(platform, name)')
    .not('category', 'is', null);

  const scProducts = allSC.filter(p => p.category?.platform === 'soundcloud');

  console.log('\n=============================');
  console.log(`✅ 생성된 SoundCloud 상품: ${created}개`);
  console.log('\n=== SoundCloud 상품 목록 ===');
  scProducts.forEach(p => console.log(`  - ${p.name}`));
}

addSoundCloudProducts();
