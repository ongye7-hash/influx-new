// YTResellers 전체 서비스 Description 스크래핑
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// .env.local 로드
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length) envVars[key.trim()] = values.join('=').trim();
});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 결과 파일 경로
const RESULTS_FILE = path.join(__dirname, 'scraped-descriptions.json');

async function scrapeAllDescriptions() {
  console.log('🚀 YTResellers 전체 Description 스크래핑 시작\n');

  // 기존 결과 로드
  let results = {};
  if (fs.existsSync(RESULTS_FILE)) {
    results = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8'));
    console.log('기존 결과 로드:', Object.keys(results).length, '개');
  }

  // DB에서 우리 서비스 ID 목록 가져오기 (페이지네이션으로 전체 가져오기)
  let dbServices = [];
  let page = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('services')
      .select('id, provider_service_id, name')
      .eq('is_active', true)
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('DB 에러:', error);
      return;
    }

    if (!data || data.length === 0) break;

    dbServices = dbServices.concat(data);
    console.log(`DB 페이지 ${page + 1} 로드: ${data.length}개 (총 ${dbServices.length}개)`);

    if (data.length < pageSize) break;
    page++;
  }

  // 아직 스크래핑 안 된 서비스만 필터링
  const pendingServices = dbServices.filter(s => !results[s.provider_service_id]);
  console.log('총 서비스:', dbServices.length);
  console.log('스크래핑 대기:', pendingServices.length);
  console.log('예상 시간:', Math.ceil(pendingServices.length * 3 / 60), '분');

  if (pendingServices.length === 0) {
    console.log('\n✅ 모든 서비스 스크래핑 완료!');
    return;
  }

  const browser = await puppeteer.launch({
    headless: 'new', // headless 모드
    defaultViewport: { width: 1400, height: 900 }
  });

  const page = await browser.newPage();

  try {
    // 서비스 페이지로 이동
    console.log('\n서비스 페이지 로딩...');
    await page.goto('https://ytresellers.com/services', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    await delay(3000);

    let processed = 0;
    let success = 0;
    let failed = 0;

    for (const service of pendingServices) {
      const serviceId = service.provider_service_id;

      try {
        process.stdout.write(`\r[${processed + 1}/${pendingServices.length}] ${serviceId} 처리 중...`);

        // 검색창 클리어 후 입력
        await page.evaluate(() => {
          const input = document.querySelector('input[placeholder="Search"]');
          if (input) input.value = '';
        });

        await page.type('input[placeholder="Search"]', serviceId);
        await delay(500);
        await page.keyboard.press('Enter');
        await delay(2000);

        // 해당 서비스의 View 버튼 찾아서 클릭
        const clicked = await page.evaluate((id) => {
          // 해당 ID가 포함된 행 찾기
          const rows = document.querySelectorAll('tr');
          for (const row of rows) {
            if (row.innerText.includes(id)) {
              const viewBtn = row.querySelector('button, a');
              if (viewBtn && viewBtn.innerText.includes('View')) {
                viewBtn.click();
                return true;
              }
            }
          }
          // 첫 번째 View 버튼 클릭
          const buttons = Array.from(document.querySelectorAll('button, a'));
          const viewBtn = buttons.find(btn => btn.innerText.trim() === 'View');
          if (viewBtn) {
            viewBtn.click();
            return true;
          }
          return false;
        }, serviceId);

        if (clicked) {
          await delay(1500);

          // 모달에서 Description 추출 (더 정확한 로직)
          const desc = await page.evaluate(() => {
            const body = document.body.innerText;

            // Description 시작 패턴들
            const startPatterns = [
              '✅ Example Link',
              '✅ Example',
              '- Example Link:',
              '- Example Link',
              '- Link:'
            ];

            let startIdx = -1;
            for (const p of startPatterns) {
              const idx = body.indexOf(p);
              if (idx > 0 && (startIdx === -1 || idx < startIdx)) {
                startIdx = idx;
              }
            }

            if (startIdx === -1) {
              // 대안: 서비스 이름 바로 다음 줄
              const viewIdx = body.lastIndexOf('View\n');
              if (viewIdx > 0) {
                // View 버튼 이후 첫 번째 ✅ 또는 - 찾기
                const afterView = body.substring(viewIdx);
                const checkIdx = afterView.indexOf('✅');
                const dashIdx = afterView.indexOf('- ');
                if (checkIdx > 0) startIdx = viewIdx + checkIdx;
                else if (dashIdx > 0 && dashIdx < 200) startIdx = viewIdx + dashIdx;
              }
            }

            if (startIdx > 0) {
              // Create order 전까지 추출
              let endIdx = body.indexOf('Create order', startIdx);
              if (endIdx === -1) endIdx = startIdx + 2000; // 최대 2000자

              let content = body.substring(startIdx, endIdx).trim();

              // 불필요한 페이지 헤더 제거
              const headerPatterns = ['YtResellers\n', 'Log in\n', 'Services\n', 'API\n', 'Terms\n', 'Sign up\n', 'USD $'];
              for (const h of headerPatterns) {
                if (content.includes(h)) {
                  // 헤더가 포함되어 있으면 ✅ 이후만 추출
                  const cleanIdx = content.indexOf('✅ Example');
                  if (cleanIdx > 0) {
                    content = content.substring(cleanIdx);
                  }
                }
              }

              return content.trim();
            }

            return null;
          });

          console.log(`\n[${serviceId}] 추출:`, desc ? desc.substring(0, 150) + '...' : 'null');

          if (desc && desc.length > 10) {
            results[serviceId] = desc;
            success++;
          } else {
            failed++;
          }

          // 모달 닫기 (ESC 또는 X 버튼)
          await page.keyboard.press('Escape');
          await delay(500);
        } else {
          failed++;
        }

        processed++;

        // 50개마다 저장
        if (processed % 50 === 0) {
          fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
          console.log(`\n💾 ${processed}개 처리됨, ${success}개 성공`);
        }

      } catch (err) {
        failed++;
        processed++;
      }
    }

    // 최종 저장
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));

    console.log('\n\n✅ 스크래핑 완료!');
    console.log('처리:', processed);
    console.log('성공:', success);
    console.log('실패:', failed);
    console.log('저장 위치:', RESULTS_FILE);

  } catch (error) {
    console.error('\n에러:', error.message);
  } finally {
    // 최종 저장
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
    await browser.close();
    console.log('\n브라우저 종료');
  }
}

scrapeAllDescriptions().catch(console.error);
