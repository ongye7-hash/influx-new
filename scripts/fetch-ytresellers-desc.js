// YTResellers API에서 서비스 데이터 가져오기 (desc 포함)
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const https = require('https');
const querystring = require('querystring');

// .env.local 로드
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length) envVars[key.trim()] = values.join('=').trim();
});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function fetchServices() {
  console.log('🚀 YTResellers API 서비스 가져오기 시작\n');

  // 새 API 키 사용
  const apiKey = 'f98ad53368979b9381fea5773fbf1806';
  const apiUrl = 'https://ytresellers.com/api/v2';

  console.log('API URL:', apiUrl);
  console.log('API Key:', apiKey.substring(0, 10) + '...');

  // Fetch services
  const postData = querystring.stringify({
    key: apiKey,
    action: 'services'
  });

  const url = new URL(apiUrl);

  const options = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log('\nHTTP Status:', res.statusCode);
        try {
          const services = JSON.parse(data);
          if (services.error) {
            console.log('❌ API Error:', services.error);
            resolve(null);
            return;
          }

          console.log('✅ 총 서비스 수:', services.length);

          // Check for desc field
          const withDesc = services.filter(s => s.desc && s.desc.trim() !== '');
          console.log('설명 있는 서비스:', withDesc.length);

          // Sample service 693
          const svc693 = services.find(s => s.service === '693');
          if (svc693) {
            console.log('\n=== 서비스 693 샘플 ===');
            console.log('service:', svc693.service);
            console.log('name:', svc693.name);
            console.log('desc:', svc693.desc ? svc693.desc.substring(0, 200) + '...' : '(없음)');
          }

          // Save to file
          const outputPath = path.join(__dirname, 'ytresellers_full.json');
          fs.writeFileSync(outputPath, JSON.stringify(services, null, 2));
          console.log('\n✅ 저장됨:', outputPath);

          resolve(services);
        } catch(e) {
          console.log('❌ Parse error:', e.message);
          console.log('Raw response:', data.substring(0, 500));
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.error('❌ Request error:', e.message);
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

fetchServices().catch(console.error);
