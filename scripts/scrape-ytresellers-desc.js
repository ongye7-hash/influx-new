// YTResellers 웹사이트에서 서비스 Description 스크래핑
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

async function scrapeDescriptions() {
  console.log('🚀 YTResellers Description 스크래핑 시작\n');

  // DB에서 우리 서비스 ID 목록 가져오기
  const { data: dbServices, error } = await supabase
    .from('services')
    .select('id, provider_service_id, name')
    .eq('is_active', true);

  if (error) {
    console.error('DB 에러:', error);
    return;
  }

  const serviceIds = dbServices.map(s => s.provider_service_id);
  console.log('DB 서비스 수:', serviceIds.length);

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1400, height: 900 }
  });

  const page = await browser.newPage();
  const descriptions = {};

  try {
    // 서비스 페이지로 이동
    console.log('서비스 페이지 로딩...');
    await page.goto('https://ytresellers.com/services', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    await delay(3000);

    // 테스트: 8142 검색
    console.log('\n8142 검색 테스트...');

    // 검색창 클리어 후 입력
    const searchInput = await page.$('input[placeholder="Search"]');
    if (searchInput) {
      await searchInput.click({ clickCount: 3 });
      await searchInput.type('8142');
      await delay(1000);

      // 엔터키로 검색
      await page.keyboard.press('Enter');
      await delay(3000);
    }

    // View 버튼 클릭 (텍스트로 찾기)
    console.log('View 버튼 찾는 중...');

    const clicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const viewBtn = buttons.find(btn => btn.innerText.trim() === 'View');
      if (viewBtn) {
        viewBtn.click();
        return true;
      }
      return false;
    });

    if (clicked) {
      console.log('View 버튼 클릭됨');
      await delay(3000);

      // 모달 스크린샷
      await page.screenshot({ path: path.join(__dirname, 'ytresellers-view-modal.png'), fullPage: true });
      console.log('모달 스크린샷 저장');

      // Description 추출
      const desc = await page.evaluate(() => {
        // 모달/다이얼로그 찾기
        const modal = document.querySelector('[role="dialog"], .modal, .modal-content, [class*="modal"]');
        if (modal) {
          return modal.innerText;
        }
        // 전체 페이지
        return document.body.innerText;
      });

      console.log('\n=== 추출된 내용 ===');
      console.log(desc.substring(0, 1000));

      descriptions['8142'] = desc;
    } else {
      console.log('View 버튼을 찾지 못함');
    }

    // 결과 저장
    fs.writeFileSync(
      path.join(__dirname, 'ytresellers-descriptions.json'),
      JSON.stringify(descriptions, null, 2)
    );

    console.log('\n5초 대기...');
    await delay(5000);

  } catch (error) {
    console.error('에러:', error.message);
    await page.screenshot({ path: path.join(__dirname, 'ytresellers-error.png') });
  } finally {
    await browser.close();
    console.log('\n브라우저 종료');
  }
}

scrapeDescriptions().catch(console.error);
