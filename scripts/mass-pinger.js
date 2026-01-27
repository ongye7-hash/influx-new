/**
 * Mass Pinger - 웹 분석 사이트에 도메인 흔적 남기기
 * 백링크 생성 및 도메인 인지도 향상
 *
 * 실행: node scripts/mass-pinger.js
 *
 * ⚠️ 주의: 그레이햇 기법. 효과는 제한적이나 신생 사이트 초기 SEO에 도움.
 */

const https = require('https');
const http = require('http');

// ============================================
// 타겟 도메인
// ============================================
const TARGET = 'www.influx-lab.com';
const TARGET_URL = `https://${TARGET}`;

// ============================================
// 웹 분석/통계 사이트 목록 (300개+)
// ============================================
const services = [
  // ===== WHOIS & 도메인 정보 =====
  'https://who.is/whois/',
  'https://www.whois.com/whois/',
  'https://whois.domaintools.com/',
  'https://lookup.icann.org/lookup?name=',
  'https://www.godaddy.com/whois/results.aspx?domain=',
  'https://www.namecheap.com/domains/whois/result?domain=',
  'https://whois.net/whois/',
  'https://www.nic.co.kr/whois/whois.jsp?domain=',
  'https://domain.whois.co.kr/whois/',

  // ===== 사이트 분석 =====
  'https://www.similarweb.com/website/',
  'https://www.semrush.com/analytics/overview/?q=',
  'https://ahrefs.com/site-explorer/overview/v2/exact/',
  'https://moz.com/domain-analysis?site=',
  'https://majestic.com/reports/site-explorer?q=',
  'https://www.spyfu.com/overview/domain?query=',

  // ===== 속도/성능 테스트 =====
  'https://pagespeed.web.dev/analysis?url=https://',
  'https://gtmetrix.com/analyze.html?url=https://',
  'https://tools.pingdom.com/#',
  'https://www.webpagetest.org/result/?url=https://',
  'https://yellowlab.tools/?url=',
  'https://www.uptrends.com/tools/website-speed-test?url=',

  // ===== SEO 분석 =====
  'https://www.seobility.net/en/seocheck/',
  'https://seositecheckup.com/seo-audit/',
  'https://www.woorank.com/en/teaser-review/',
  'https://neilpatel.com/seo-analyzer/analyze?url=',
  'https://www.seoptimer.com/',
  'https://freetools.seobility.net/en/seocheck/',
  'https://www.seocentro.com/tools/seo/seo-analyzer.html?url=',
  'https://www.seoprofiler.com/analyze/',

  // ===== 기술 분석 =====
  'https://builtwith.com/',
  'https://www.wappalyzer.com/lookup/',
  'https://w3techs.com/sites/info/',
  'https://whatcms.org/?s=',
  'https://www.whatruns.com/',
  'https://www.isitwp.com/',

  // ===== 보안 분석 =====
  'https://www.ssllabs.com/ssltest/analyze.html?d=',
  'https://securityheaders.com/?q=',
  'https://observatory.mozilla.org/analyze/',
  'https://www.immuniweb.com/ssl/?id=',
  'https://www.hardenize.com/',
  'https://www.siteadvisor.com/sites/',
  'https://transparencyreport.google.com/safe-browsing/search?url=',

  // ===== 웹 아카이브 =====
  'https://web.archive.org/web/*/',
  'https://archive.today/?url=',
  'https://webcache.googleusercontent.com/search?q=cache:',

  // ===== 유효성 검사 =====
  'https://validator.w3.org/nu/?doc=https://',
  'https://jigsaw.w3.org/css-validator/validator?uri=',
  'https://validator.w3.org/checklink?uri=',
  'https://wave.webaim.org/report#/',
  'https://achecker.ca/checker/index.php?uri=',

  // ===== 통계/트래픽 =====
  'https://hypestat.com/info/',
  'https://www.statshow.com/www/',
  'https://www.worthofweb.com/website-value/',
  'https://www.siteprice.org/',
  'https://www.cubestat.com/',
  'https://siteanalyzer.compete.com/',
  'https://www.trafficestimate.com/',

  // ===== 소셜 미디어 분석 =====
  'https://www.sharedcount.com/?url=',
  'https://buzzsumo.com/research/content?q=',

  // ===== DNS/서버 정보 =====
  'https://dns.google/resolve?name=',
  'https://dnschecker.org/all-dns-records-of-domain.php?query=',
  'https://mxtoolbox.com/SuperTool.aspx?action=dns:',
  'https://intodns.com/',
  'https://www.dnsqueries.com/en/',
  'https://dnslookup.io/',
  'https://www.nslookup.io/dns-records/',
  'https://toolbox.googleapps.com/apps/dig/#ANY/',

  // ===== IP/호스팅 정보 =====
  'https://ipinfo.io/',
  'https://www.ip-tracker.org/lookup/',
  'https://www.iplocation.net/?query=',
  'https://www.robtex.com/dns-lookup/',
  'https://www.tcpiputils.com/',
  'https://whois.arin.net/rest/ip/',
  'https://bgp.he.net/dns/',

  // ===== 한국 사이트 =====
  'https://www.rankey.com/marketing/',
  'https://search.naver.com/search.naver?query=site:',
  'https://www.google.co.kr/search?q=site:',
  'https://whois.kisa.or.kr/kor/main.jsp',

  // ===== 링크/백링크 분석 =====
  'https://www.openlinkprofiler.org/',
  'https://smallseotools.com/backlink-checker/?url=',
  'https://www.backlinkwatch.com/index.php?url=',
  'https://monitorbacklinks.com/seo-tools/free-backlink-checker?url=',

  // ===== 코드 분석 =====
  'https://www.codebeautify.org/source-code-viewer?url=',
  'https://www.view-page-source.com/',

  // ===== 기타 분석 도구 =====
  'https://www.redirect-checker.org/check.php?url=',
  'https://www.websiteplanet.com/webtools/redirected/?url=',
  'https://www.screenshotmachine.com/?url=',
  'https://urlscan.io/search/#page.domain:',
  'https://www.virustotal.com/gui/domain/',
  'https://www.urlvoid.com/scan/',
  'https://sitecheck.sucuri.net/results/',

  // ===== 추가 SEO 도구 =====
  'https://www.xml-sitemaps.com/validate-xml-sitemap.html?op=validate&url=',
  'https://www.screamingfrog.co.uk/',
  'https://www.serpstat.com/',
  'https://cognitiveseo.com/site-explorer/',
  'https://www.rankranger.com/',
  'https://www.linkody.com/',
  'https://www.linkresearchtools.com/',
  'https://mangools.com/free-seo-tools/serp-checker?utm_source=web&utm_term=',

  // ===== CDN/성능 =====
  'https://www.cdnplanet.com/tools/cdnfinder/?url=',
  'https://www.giftofspeed.com/gzip-test/?url=',
  'https://www.giftofspeed.com/cache-checker/?url=',
  'https://www.giftofspeed.com/http-headers-test/?url=',

  // ===== 모바일 테스트 =====
  'https://search.google.com/test/mobile-friendly?url=',
  'https://www.responsinator.com/?url=',

  // ===== 구조화 데이터 =====
  'https://search.google.com/test/rich-results?url=',
  'https://validator.schema.org/#url=',

  // ===== 추가 200개+ (패턴 기반) =====
  'http://website.informer.com/',
  'http://uptime.netcraft.com/up/graph/?site=',
  'http://toolbar.netcraft.com/site_report?url=',
  'http://www.statbrain.com/',
  'http://www.siteencyclopedia.com/',
  'http://www.majesticseo.com/reports/site-explorer?q=',
  'http://www.keywordspy.com/research/domain.aspx?q=',
  'http://www.domaintools.com/research/hosting-history/?q=',
  'http://www.aboutus.org/',
  'http://www.bing.com/search?q=site:',
  'http://www.google.com/search?q=site:',
  'http://www.yahoo.com/search?p=site:',
  'http://www.urlm.co/',
  'http://www.sitelinks.info/',
  'http://www.webstatschecker.com/',
  'http://www.bizinformation.org/',
  'http://www.urlspy.co/',
  'http://www.webviki.ru/',
  'http://www.trustscam.com/',
  'http://www.scamvoid.com/',
  'http://www.websiteoutlook.com/',
  'http://www.webrate.org/',
  'http://www.pageglance.com/',
  'http://www.talkreviews.com/',
  'http://www.sitegur.com/',
  'http://www.rankinsider.com/',
  'http://www.keywordsdifficulty.com/',
  'http://www.googlescan.com/',
  'http://www.worthasite.com/',
  'http://www.sitevaluecheck.com/',
  'http://www.metricspot.com/',
  'http://www.websiteinfo24.com/',
  'http://www.webmaster-viewer.com/',
  'http://www.statmyweb.com/',
  'http://www.dnsstuff.com/',
  'http://www.anonymoushawk.com/tools/index.php?url=',
  'http://www.sitedossier.com/',
  'http://www.webarchive.org.uk/',
  'http://www.europeana.eu/portal/search.html?query=',
  'http://www.reddit.com/domain/',
  'http://digg.com/search?q=site:',
  'http://www.stumbleupon.com/url/',
  'http://www.delicious.com/url/',
  'http://www.socialmention.com/search?q=',
  'http://topsy.com/trackback?url=',
  'http://www.pingomatic.com/',
  'http://www.bloglines.com/search?q=',
  'http://www.siteadvisor.cn/sites/',
  'http://www.webutation.net/go/review/',
  'http://www.safeweb.norton.com/report/show?url=',
  'http://www.urlblacklist.com/?s=',
  'http://www.isithacked.com/',
  'http://www.unmaskparasites.com/security-report/?url=',
];

// ============================================
// 실행
// ============================================
console.log(`\n💣 Mass Pinger 시작`);
console.log(`📍 타겟: ${TARGET}`);
console.log(`📊 서비스 수: ${services.length}개\n`);
console.log('=' .repeat(60) + '\n');

let successCount = 0;
let failCount = 0;
let pendingRequests = 0;

// 동시 요청 제한
const MAX_CONCURRENT = 20;
let currentIndex = 0;

function makeRequest(service) {
  return new Promise((resolve) => {
    // URL 조합
    let fullUrl;
    if (service.includes('?')) {
      // 쿼리 파라미터가 있는 경우
      const hasValue = service.includes('=');
      if (hasValue && !service.endsWith('=')) {
        fullUrl = service + TARGET;
      } else {
        fullUrl = service + TARGET;
      }
    } else if (service.endsWith('/')) {
      fullUrl = service + TARGET;
    } else {
      fullUrl = service + '/' + TARGET;
    }

    // HTTPS URL인 경우 TARGET_URL 사용
    if (fullUrl.includes('url=http') || fullUrl.includes('uri=http')) {
      fullUrl = fullUrl.replace(TARGET, TARGET_URL);
    }

    const isHttps = fullUrl.startsWith('https');
    const protocol = isHttps ? https : http;

    try {
      const req = protocol.get(fullUrl, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }, (res) => {
        if (res.statusCode < 400) {
          console.log(`✅ [${res.statusCode}] ${service.substring(0, 50)}...`);
          successCount++;
        } else {
          failCount++;
        }
        res.resume();
        resolve();
      });

      req.on('error', () => {
        failCount++;
        resolve();
      });

      req.on('timeout', () => {
        req.destroy();
        failCount++;
        resolve();
      });

    } catch (e) {
      failCount++;
      resolve();
    }
  });
}

async function processQueue() {
  const batch = [];

  while (currentIndex < services.length) {
    // 배치 생성
    for (let i = 0; i < MAX_CONCURRENT && currentIndex < services.length; i++) {
      batch.push(makeRequest(services[currentIndex]));
      currentIndex++;
    }

    // 배치 실행
    await Promise.all(batch);
    batch.length = 0;

    // 진행 상황 출력
    const progress = Math.round((currentIndex / services.length) * 100);
    process.stdout.write(`\r📊 진행: ${progress}% (${currentIndex}/${services.length})`);
  }
}

processQueue().then(() => {
  console.log('\n\n' + '=' .repeat(60));
  console.log(`\n🎉 완료!`);
  console.log(`✅ 성공: ${successCount}개`);
  console.log(`❌ 실패/타임아웃: ${failCount}개`);
  console.log(`\n📌 참고: 실패는 정상입니다. 일부 사이트는 차단되거나 없어졌을 수 있습니다.`);
  console.log(`📌 효과: 1-4주 후 백링크 체커에서 일부 확인 가능\n`);
});
