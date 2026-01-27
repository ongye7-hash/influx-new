const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://ndjelynkpxffmapndnjx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kamVseW5rcHhmZm1hcG5kbmp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY1Nzk3OCwiZXhwIjoyMDg0MjMzOTc4fQ.WDrHEZC3KyE7Dmq8rnDvGjt0V1aTM6GVEX93_lchF-I'
);

async function searchYouTubeComments() {
  const { data: providers } = await supabase.from('api_providers').select('*').eq('is_active', true);

  console.log('YouTube 댓글 서비스 검색 중...');
  console.log('================================================================\n');

  for (const provider of providers) {
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
      if (Array.isArray(services) === false) continue;

      // YouTube Comment 서비스 찾기 (Comment Likes 제외)
      const ytComments = services.filter(s => {
        const name = s.name.toLowerCase();
        const isYouTube = name.includes('youtube') || name.includes('yt ');
        const isComment = name.includes('comment');
        const isNotLikes = name.includes('likes') === false && name.includes('like ') === false;
        return isYouTube && isComment && isNotLikes;
      }).slice(0, 5);

      if (ytComments.length > 0) {
        console.log('[' + provider.name + ']');
        ytComments.forEach(s => {
          const type = s.type || 'Default';
          const isCustom = type.toLowerCase().includes('custom') || s.name.toLowerCase().includes('custom');
          console.log('  #' + s.service + ' - ' + s.name.substring(0, 70));
          console.log('    Rate: $' + s.rate + ' | Min: ' + s.min + ' | Custom: ' + (isCustom ? 'YES' : 'NO'));
        });
        console.log('');
      }
    } catch (err) {
      // skip
    }
  }
}

searchYouTubeComments();
