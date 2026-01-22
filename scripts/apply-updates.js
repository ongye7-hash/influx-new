const https = require('https');

const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kamVseW5rcHhmZm1hcG5kbmp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY1Nzk3OCwiZXhwIjoyMDg0MjMzOTc4fQ.WDrHEZC3KyE7Dmq8rnDvGjt0V1aTM6GVEX93_lchF-I';
const BASE_URL = 'ndjelynkpxffmapndnjx.supabase.co';

const updates = [
  {
    id: 'eee92d4e-6087-4858-a211-c024ab67c982',
    data: {
      name: '틱톡 조회수 [실제 시청]',
      description: 'TikTok Views | Instant Start | Day 1M | No Refill',
      price: 1,
      rate: 0.44,
      min_quantity: 100,
      max_quantity: 10000000
    }
  },
  {
    id: '3e1db3f2-4c63-44f3-9247-827fc1b032a5',
    data: {
      name: '틱톡 팔로워 [글로벌]',
      description: 'TikTok Followers | Bot Accounts | Instant Start | Day 100K | No Refill',
      price: 251,
      rate: 167,
      min_quantity: 10,
      max_quantity: 5000000
    }
  },
  {
    id: 'd2ec27dd-1b80-427b-8e47-d52ea51da1c3',
    data: {
      name: '틱톡 좋아요',
      description: 'TikTok Likes | Max 5M | MQ | Speed 100K/Day | No Refill',
      price: 26,
      rate: 17,
      min_quantity: 100,
      max_quantity: 5000000
    }
  },
  {
    id: 'c9c46eac-cd24-46c0-9ee9-4d1713338dc3',
    data: {
      name: '유튜브 조회수 [한국/SEO]',
      description: 'YouTube Korea Views | Suggest/Search/Browse | 7-10분 리텐션 | Speed 10K/Day | No Refill',
      price: 4548,
      rate: 3032,
      min_quantity: 1000,
      max_quantity: 100000
    }
  },
  {
    id: '243c5d79-c40a-47dd-a558-7a9582edb9fc',
    data: {
      name: '유튜브 구독자',
      description: 'YouTube Subscribers | Max 500K | LQ | Speed 100K/Day | No Refill',
      price: 192,
      rate: 128,
      min_quantity: 10,
      max_quantity: 1000000
    }
  },
  {
    id: '3a8236ec-6466-4ceb-b4c8-9d75b8a69c6c',
    data: {
      name: '유튜브 좋아요',
      description: 'YouTube Likes | Max 500K | HQ | Speed 500K/Day | No Refill',
      price: 1414,
      rate: 943,
      min_quantity: 20,
      max_quantity: 500000
    }
  },
  {
    id: '9c065f57-23e4-40d0-9929-88c983551f79',
    data: {
      name: '인스타그램 팔로워',
      description: 'Instagram Followers | HQ Accounts | Cancel Enable | Drop 40% | No Refill',
      price: 668,
      rate: 445,
      min_quantity: 100,
      max_quantity: 1000000
    }
  },
  {
    id: 'aa507608-c08b-485a-8c93-734060b5170e',
    data: {
      name: '인스타그램 좋아요',
      description: 'Instagram Likes | Max 1M | HQ | Speed 200K/Day | No Refill',
      price: 38,
      rate: 25,
      min_quantity: 10,
      max_quantity: 1000000
    }
  },
  {
    id: 'd0e84984-e464-4fa0-a2ff-f9b49c719d8c',
    data: {
      name: '인스타그램 릴스 조회수',
      description: 'Instagram Views | Video/Reels/TV | Max Unlimited | Speed 1M/Day',
      price: 2,
      rate: 1.3,
      min_quantity: 100,
      max_quantity: 10000000
    }
  },
  {
    id: '1a702d23-a32d-41ff-a4fb-7d94648341d4',
    data: {
      name: 'X(트위터) 팔로워',
      description: 'Twitter Followers | Max 100K | HQ | Speed 100K/Day | No Refill',
      price: 2273,
      rate: 1515,
      min_quantity: 10,
      max_quantity: 20000
    }
  },
  {
    id: 'ba130786-17f8-4ced-9e38-9831bb5dbd73',
    data: {
      name: 'X(트위터) 리트윗',
      description: 'Twitter Retweet + Impressions | Max 1M | HQ | Speed 10K/Day | 30 Days Refill',
      price: 1485,
      rate: 990,
      min_quantity: 50,
      max_quantity: 1000
    }
  }
];

async function updateService(update) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(update.data);

    const options = {
      hostname: BASE_URL,
      port: 443,
      path: `/rest/v1/services?id=eq.${update.id}`,
      method: 'PATCH',
      headers: {
        'apikey': API_KEY,
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Prefer': 'return=minimal'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 204 || res.statusCode === 200) {
          resolve({ success: true, name: update.data.name });
        } else {
          resolve({ success: false, name: update.data.name, error: data });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('=== 서비스 업데이트 시작 ===\n');

  for (const update of updates) {
    try {
      const result = await updateService(update);
      if (result.success) {
        console.log(`✅ ${result.name}`);
      } else {
        console.log(`❌ ${result.name}: ${result.error}`);
      }
    } catch (err) {
      console.log(`❌ ${update.data.name}: ${err.message}`);
    }
  }

  console.log('\n=== 완료 ===');
}

main();
