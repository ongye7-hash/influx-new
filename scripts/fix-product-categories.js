const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ndjelynkpxffmapndnjx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kamVseW5rcHhmZm1hcG5kbmp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY1Nzk3OCwiZXhwIjoyMDg0MjMzOTc4fQ.WDrHEZC3KyE7Dmq8rnDvGjt0V1aTM6GVEX93_lchF-I'
);

// 각 카테고리별 올바른 상품 정보 (소스 파일에서 찾은 데이터)
const CATEGORY_PRODUCTS = {
  // YouTube [조회수] 빠른 유입 - Adwords Views
  'b41065ee-71b6-4f13-a953-9f4c90a1dfad': {
    name: '⚡ [조회수] 빠른 유입',
    description: 'Youtube Views | Adwords - Non Drop | Google Ads를 통한 빠른 조회수 유입, Min 10K ~ Max 10M, 속도 1M/Day',
    min_quantity: 10000,
    max_quantity: 10000000,
    price_per_1000: 400,
  },

  // YouTube [시청시간] 4000시간 - WatchTime
  '293437be-691c-42f2-8544-82a889854f7d': {
    name: '⏳ [시청시간] 4000시간',
    description: 'YouTube WatchTime | 30일 리필 보장, 60분+ 영상 전용, 4000시간 달성용, 속도 300H/Day',
    min_quantity: 10,
    max_quantity: 4000,
    price_per_1000: 35000,
  },

  // YouTube [좋아요/싫어요] - Video Likes (not Live)
  '319df4b3-0814-470b-bbfa-b6253dcfa065': {
    name: '👍 [좋아요/싫어요]',
    description: 'Youtube Video Likes | 15일 리필 보장, 일반 동영상 좋아요, Max 100K, 속도 30K/Day',
    min_quantity: 50,
    max_quantity: 100000,
    price_per_1000: 150,
  },

  // Twitter [리트윗] - Retweets
  '366e82fe-fd36-48a8-ae17-a02b978927b9': {
    name: '🔄 [리트윗]',
    description: 'Twitter Retweets | 리필 없음, Max 50K, 시작 0-2시간, 속도 10K/Day',
    min_quantity: 10,
    max_quantity: 50000,
    price_per_1000: 200,
  },

  // TikTok [좋아요] - Likes (not Live)
  '7bb7fb9d-ead2-4984-a199-eb057a0c5519': {
    name: '❤️ [좋아요] 하트',
    description: 'TikTok Likes | 30일 리필 보장, Max 1M, 시작 0-1시간, 속도 50K/Day',
    min_quantity: 10,
    max_quantity: 1000000,
    price_per_1000: 50,
  },

  // Threads [좋아요] - Likes
  'a7dbaf21-4c3c-4e3f-8af8-6195a8e83577': {
    name: '❤️ [좋아요]',
    description: 'Threads Likes | 리필 없음, Max 10K, 시작 0-3시간, 속도 1K/Day',
    min_quantity: 10,
    max_quantity: 10000,
    price_per_1000: 200,
  },
};

async function fixProductCategories() {
  console.log('===============================================================');
  console.log('           카테고리별 상품 정보 수정');
  console.log('===============================================================\n');

  // 현재 admin_products 조회
  const { data: products, error } = await supabase
    .from('admin_products')
    .select('*, admin_categories(name, platform)');

  if (error) {
    console.log('조회 에러:', error.message);
    return;
  }

  console.log('현재 상품 수:', products.length);
  console.log('');

  let updatedCount = 0;

  for (const product of products) {
    const categoryId = product.category_id;
    const newData = CATEGORY_PRODUCTS[categoryId];

    if (newData) {
      console.log('\n수정 중:', product.admin_categories?.name || categoryId);
      console.log('  기존:', product.name);
      console.log('  신규:', newData.name);
      console.log('  설명:', newData.description);

      const { error: updateError } = await supabase
        .from('admin_products')
        .update({
          name: newData.name,
          description: newData.description,
          min_quantity: newData.min_quantity,
          max_quantity: newData.max_quantity,
          price_per_1000: newData.price_per_1000,
        })
        .eq('id', product.id);

      if (updateError) {
        console.log('  X 에러:', updateError.message);
      } else {
        console.log('  V 완료!');
        updatedCount++;
      }
    }
  }

  console.log('\n===============================================================');
  console.log('수정 완료:', updatedCount, '개 상품');
  console.log('===============================================================');
}

fixProductCategories().catch(console.error);
