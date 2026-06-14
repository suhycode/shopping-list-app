// [테스트] 쇼핑 리스트 앱 자동 기능 테스트 (Playwright + Chromium)
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_URL = pathToFileURL(join(__dirname, 'index.html')).href;

let passed = 0;
let failed = 0;

// [헬퍼] 단언 함수
function assert(cond, name) {
  if (cond) {
    console.log(`  ✅ PASS  ${name}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL  ${name}`);
    failed++;
  }
}

const browser = await chromium.launch();
const page = await browser.newPage();

// localStorage를 깨끗한 상태로 시작 (최초 1회만 비우고, 이후 새로고침에는 영향 없음)
await page.goto(APP_URL);
await page.evaluate(() => localStorage.clear());
await page.reload();

console.log('\n=== 1. 초기 상태 ===');
assert(await page.locator('.empty').isVisible(), '항목 없을 때 빈 안내 문구 표시');
assert((await page.locator('#status').textContent()) === '0개 항목', '상태 표시가 "0개 항목"');

console.log('\n=== 2. 아이템 추가 기능 ===');
// 버튼 클릭으로 추가
await page.fill('#item-input', '우유');
await page.click('#add-btn');
assert((await page.locator('.item').count()) === 1, '버튼 클릭으로 항목 1개 추가됨');
assert((await page.locator('.item .label').first().textContent()) === '우유', '추가된 항목 텍스트가 "우유"');
assert(!(await page.locator('.empty').isVisible().catch(() => false)), '항목 추가 후 빈 안내 문구 사라짐');

// 엔터 키로 추가
await page.fill('#item-input', '계란');
await page.press('#item-input', 'Enter');
assert((await page.locator('.item').count()) === 2, 'Enter 키로 항목 2개째 추가됨');

// 입력창이 정상 추가 후 비워지는지 (직전 '계란' 추가 직후 검사)
assert((await page.inputValue('#item-input')) === '', '정상 추가 후 입력창이 비워짐');

// 빈 값은 추가되지 않아야 함
await page.fill('#item-input', '   ');
await page.click('#add-btn');
assert((await page.locator('.item').count()) === 2, '공백만 입력 시 추가되지 않음');

console.log('\n=== 3. 체크(완료) 기능 ===');
await page.fill('#item-input', '빵');
await page.click('#add-btn');
// 총 3개: 우유, 계란, 빵
// "우유"를 찾아 체크 (정렬 때문에 텍스트로 지정)
const milk = page.locator('.item', { hasText: '우유' });
await milk.locator('.check').click();
assert((await page.locator('.item.done', { hasText: '우유' }).count()) === 1, '체크 시 done 클래스 적용됨');
assert((await page.locator('#status').textContent()).includes('1개 완료'), '상태 표시에 "1개 완료" 반영');

// 라벨 클릭으로 체크 해제(토글)
await page.locator('.item', { hasText: '우유' }).locator('.label').click();
assert((await page.locator('.item.done', { hasText: '우유' }).count()) === 0, '라벨 클릭으로 체크 해제(토글)됨');

console.log('\n=== 4. 삭제 기능 ===');
const beforeDelete = await page.locator('.item').count();
await page.locator('.item', { hasText: '계란' }).locator('.delete').click();
const afterDelete = await page.locator('.item').count();
assert(afterDelete === beforeDelete - 1, '삭제 버튼(×) 클릭 시 항목 1개 줄어듦');
assert((await page.locator('.item', { hasText: '계란' }).count()) === 0, '"계란" 항목이 목록에서 사라짐');

console.log('\n=== 5. 완료 항목 비우기 ===');
// 빵을 체크한 뒤 "완료 항목 비우기"
await page.locator('.item', { hasText: '빵' }).locator('.check').click();
await page.click('#clear-done');
assert((await page.locator('.item', { hasText: '빵' }).count()) === 0, '체크된 "빵"이 완료 비우기로 삭제됨');
assert((await page.locator('.item', { hasText: '우유' }).count()) === 1, '체크 안 된 "우유"는 남아있음');

console.log('\n=== 6. localStorage 영속성 ===');
// 페이지 새로고침 후에도 데이터 유지 확인
await page.reload();
assert((await page.locator('.item', { hasText: '우유' }).count()) === 1, '새로고침 후에도 "우유" 항목 유지됨');

await browser.close();

console.log(`\n========================================`);
console.log(`결과: ${passed}개 통과 / ${failed}개 실패`);
console.log(`========================================`);
process.exit(failed === 0 ? 0 : 1);
