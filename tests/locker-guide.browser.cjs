/* Run against local Vite with Playwright available via NODE_PATH; see docs/locker-guide.md. */
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const { chromium } = require('playwright')

const baseURL = process.env.GUIDE_TEST_URL || 'http://127.0.0.1:4173'
assert.match(baseURL, /^http:\/\/(127\.0\.0\.1|localhost):\d+$/, 'Use a local test server')
const output = process.env.GUIDE_TEST_OUTPUT || '/tmp/subak-guide-verification'
const key = (id) => `subak:locker-guide:v1:user:${id}`
const user = (id, rented = false) => ({
  userId: id, name: `Test ${id}`, email: `test${id}@example.test`,
  coin: 0, penaltyDays: 0, monthlyLogtime: 0,
  myItems: [{ itemHistoryId: 1, itemType: 'LENT', itemName: '대여권' }],
  ...(rented ? { lentCabinetId: 1, visibleNum: 2045, section: '섹션 1' } : {}),
})
const cabinet = { cabinetId: 1, visibleNum: 2045, floor: 2, section: '섹션 1', status: 'AVAILABLE' }

async function main() {
  await fs.mkdir(output, { recursive: true })
  const browser = await chromium.launch({ headless: true, channel: 'chrome', args: [
    '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream',
  ] })
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, permissions: ['camera'] })
  // Fail closed if Vite was started with a remote API base URL by mistake.
  await context.route('**/*', (route) => {
    const url = new URL(route.request().url())
    return url.origin === baseURL ? route.continue() : route.abort()
  })
  let me = null
  let failImageCheck = false
  const posts = []
  const pageErrors = []
  context.on('page', (p) => p.on('pageerror', (e) => pageErrors.push(e.message)))
  // Every API is fulfilled locally. No request reaches the production backend.
  await context.route(`${baseURL}/api/**`, async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    let status = 200
    let data = {}
    if (request.method() === 'POST') {
      posts.push({ path, body: request.postData() || '' })
      if (path.endsWith('/check-image') && failImageCheck) status = 400
      data = { message: status === 200 ? '요청 완료' : '사물함이 비어 있지 않습니다.' }
    } else if (path.endsWith('/users/me')) {
      status = me ? 200 : 401
      data = me || {}
    } else if (path.endsWith('/status-summary')) {
      data = [{ section: '섹션 1', total: 1, availableCount: 1 }]
    } else if (path.endsWith('/cabinets')) data = [cabinet]
    else if (/\/cabinets\/\d+$/.test(path)) data = cabinet
    else if (path.endsWith('/status-summary/all')) data = { totalCounts: 1, totalAvailable: 1 }
    await route.fulfill({ status, json: { data } })
  })
  await context.route('**/oauth2/authorization/**', (route) => route.fulfill({ body: 'OAuth navigation verified' }))
  await context.route('https://www.42gyeongsan.kr/**', (route) => route.fulfill({ body: 'Official link navigation verified' }))
  const page = await context.newPage()
  const stored = (id) => page.evaluate((k) => localStorage.getItem(k), key(id))
  const rentalPosts = () => posts.filter((p) => /\/lent\/cabinets\//.test(p.path))
  const dialog = () => page.getByRole('dialog')
  const button = (name) => dialog().getByRole('button', { name, exact: true })
  const guide = () => page.getByRole('dialog', { name: /대여 전 SUBAK 이용안내/ })
  async function openCabinet() {
    await page.goto(`${baseURL}/lockers`)
    await page.getByRole('button', { name: /섹션 1 \(1클러스터 앞\)/ }).click()
    await page.getByText('2045', { exact: true }).click()
    await page.getByRole('button', { name: '이 사물함 대여하기', exact: true }).waitFor()
  }
  async function noGuide() { await guide().waitFor({ state: 'hidden' }) }
  async function screenshot(name, fullPage = false) {
    await page.waitForFunction(() => document.querySelectorAll('.chakra-toast').length === 0)
    await page.waitForFunction(() => [...document.querySelectorAll('[role="dialog"]')]
      .filter((el) => !el.closest('[aria-hidden="true"]'))
      .every((el) => Number(getComputedStyle(el).opacity) === 1))
    await page.screenshot({ path: `${output}/${name}.png`, fullPage, animations: 'disabled' })
  }
  async function noOverflow() {
    const bounds = await dialog().evaluate((el) => ({
      left: el.getBoundingClientRect().left, right: el.getBoundingClientRect().right,
      width: window.innerWidth, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth,
    }))
    assert.ok(bounds.left >= -1 && bounds.right <= bounds.width + 1, JSON.stringify(bounds))
    assert.ok(bounds.scrollWidth <= bounds.clientWidth + 1, JSON.stringify(bounds))
  }
  try {
    await page.goto(`${baseURL}/login`)
    await page.getByRole('button', { name: '선택하기', exact: true }).first().waitFor()
    assert.equal(await page.getByRole('button', { name: '선택하기', exact: true }).count(), 3)
    const link = page.getByRole('link', { name: /42경산 교육생이 아니신가요/ })
    assert.equal(await link.getAttribute('href'), 'https://www.42gyeongsan.kr/ko/page.do?mnu_uid=227')
    assert.equal(await link.getAttribute('target'), '_blank')
    assert.equal(await link.getAttribute('rel'), 'noopener noreferrer')
    const popupWait = page.waitForEvent('popup')
    await link.click()
    const popup = await popupWait
    await popup.waitForLoadState()
    assert.equal(popup.url(), 'https://www.42gyeongsan.kr/ko/page.do?mnu_uid=227')
    assert.equal(await popup.evaluate(() => window.opener), null)
    await popup.close()
    await page.setViewportSize({ width: 390, height: 844 })
    await screenshot('login-mobile', true)
    for (const [index, provider] of ['42', 'kakao', 'google'].entries()) {
      await page.goto(`${baseURL}/login`)
      await page.getByRole('button', { name: '선택하기', exact: true }).nth(index).click()
      await page.waitForURL(`**/oauth2/authorization/${provider}`)
    }
    console.log('PASS login link attributes, popup, mobile and all 3 OAuth destinations')

    me = user(101)
    await openCabinet()
    await dialog().getByRole('button', { name: '사물함 대여 이용안내' }).click()
    await page.getByRole('heading', { name: '사물함 위치 확인' }).waitFor()
    await button('다음').click()
    await button('다음').click()
    await button('안내 확인').click()
    assert.equal(await stored(101), null, 'Section help must not complete onboarding')
    await dialog().getByRole('button', { name: '이 사물함 대여하기' }).click()
    await guide().waitFor()
    assert.equal(await button('이전').isDisabled(), true)
    await button('다음').click()
    await page.keyboard.press('Escape')
    await noGuide()
    assert.equal(await stored(101), null)
    assert.equal(posts.length, 0, 'No reservation or rental before guide confirmation')
    await dialog().getByRole('button', { name: '이 사물함 대여하기' }).click()
    await page.getByRole('heading', { name: '사물함 위치 확인' }).waitFor()
    const images = new Set()
    for (let index = 0; index < 7; index++) {
      await page.setViewportSize({ width: index % 2 ? 1280 : 320, height: 900 })
      await noOverflow()
      await dialog().locator('img').evaluateAll(async (imgs) => {
        await Promise.all(imgs.map((img) => img.decode()))
        if (imgs.some((img) => !img.complete || img.naturalWidth === 0)) throw new Error('Image failed')
        if (imgs.some((img) => img.closest('a'))) throw new Error('Guide images must not be links')
      })
      for (const src of await dialog().locator('img').evaluateAll((imgs) => imgs.map((i) => i.src))) images.add(src)
      if ([0, 1, 4, 6].includes(index)) await screenshot(`guide-step-${index + 1}-${index % 2 ? 'desktop' : 'mobile'}`)
      assert.equal(posts.length, 0)
      assert.equal(await stored(101), null)
      if (index < 6) await button('다음').click()
    }
    assert.equal(images.size, 8)
    await button('이전').click()
    await page.getByRole('heading', { name: '비밀번호 확인 및 반납' }).waitFor()
    await button('다음').click()
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab')
      assert.equal(await dialog().evaluate((el) => el.contains(document.activeElement)), true)
    }
    const firstRental = page.waitForResponse((r) => r.url().includes('/lent/cabinets/'))
    await button('안내 확인 후 대여하기').click()
    await noGuide()
    await firstRental
    assert.equal(rentalPosts().length, 1)
    assert.equal(await stored(101), 'completed')
    assert.equal(posts.some((p) => p.path.includes('/reservation/')), false)
    await openCabinet()
    const nextRental = page.waitForResponse((r) => r.url().includes('/lent/cabinets/'))
    await dialog().getByRole('button', { name: '이 사물함 대여하기' }).click()
    await nextRental
    await noGuide()
    assert.equal(rentalPosts().length, 2, 'Same account skips onboarding after reload')
    me = user(202)
    await openCabinet()
    await dialog().getByRole('button', { name: '이 사물함 대여하기' }).click()
    await guide().waitFor()
    await button('닫기').click()
    assert.equal(await stored(202), null)
    assert.equal(rentalPosts().length, 2)
    console.log('PASS 8 original images, 7 steps, previous/next, Escape, focus trap, 320/1280px, cancellation, account storage and API ordering')

    me = user(101, true)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`${baseURL}/my/lockers`)
    await page.getByRole('button', { name: '사물함 반납 이용안내' }).click()
    await page.getByRole('heading', { name: '반납 시작' }).waitFor()
    await button('닫기').click()
    await page.getByRole('button', { name: '반납하기', exact: true }).click()
    await button('사물함 반납 이용안내').click()
    await page.getByRole('heading', { name: '반납 시작' }).waitFor()
    await page.keyboard.press('Escape')
    await button('사진 찍기').click()
    await button('다음 (AI 검증)').click()
    const normalPassword = page.getByLabel('사용 중 설정했던 비밀번호 (4자리)')
    await normalPassword.fill('1234')
    await button('사물함 반납 이용안내').click()
    await button('닫기').click()
    assert.equal(await normalPassword.inputValue(), '1234')
    const normalResponse = page.waitForResponse((r) => r.url().endsWith('/lent/return'))
    await button('반납 요청').click()
    await normalResponse
    const normalPost = posts.filter((p) => p.path.endsWith('/lent/return')).at(-1).body
    assert.match(normalPost, /name="previousPassword"\r\n\r\n1234/)
    assert.match(normalPost, /name="forceReturn"\r\n\r\nfalse/)
    console.log('PASS return photo camera, Section B help, password preservation and original normal-return payload')

    failImageCheck = true
    await page.getByRole('button', { name: '반납하기', exact: true }).click()
    await button('사진 찍기').click()
    assert.equal(await dialog().getByRole('button', { name: '수동 제출하기' }).count(), 0)
    for (let count = 1; count <= 2; count++) {
      const checked = page.waitForResponse((r) => r.url().endsWith('/check-image'))
      await button('다음 (AI 검증)').click()
      await checked
      await dialog().getByText(count === 1 ? '수동 반납 신청 버튼 활성화까지 1회 남았습니다' : '수동 반납 신청 버튼이 활성화 되었습니다.').waitFor()
    }
    await button('수동 제출하기').click()
    const initialPassword = page.getByLabel('설정 전 초기 비밀번호 (4자리)')
    await initialPassword.fill('0000')
    await page.getByLabel('수동 반납 사유').fill('사물함을 비웠으나 AI 검증 실패')
    await button('수동 반납 이용안내').click()
    await page.getByRole('heading', { name: '수동 반납 방법' }).waitFor()
    await noOverflow()
    await screenshot('manual-help-mobile')
    await page.keyboard.press('Escape')
    assert.equal(await initialPassword.inputValue(), '0000')
    assert.equal(await page.getByLabel('수동 반납 사유').inputValue(), '사물함을 비웠으나 AI 검증 실패')
    const manualResponse = page.waitForResponse((r) => r.url().endsWith('/lent/return'))
    await button('반납 요청').click()
    await manualResponse
    const manualPost = posts.filter((p) => p.path.endsWith('/lent/return')).at(-1).body
    assert.match(manualPost, /name="previousPassword"\r\n\r\n0000/)
    assert.match(manualPost, /name="forceReturn"\r\n\r\ntrue/)
    assert.match(manualPost, /name="reason"/)
    // Storage failure must neither block renting nor repeat the guide in this session.
    await page.addInitScript(() => {
      const original = Storage.prototype.setItem
      Storage.prototype.setItem = function (key, value) {
        if (key.startsWith('subak:locker-guide:')) throw new DOMException('Storage unavailable', 'SecurityError')
        return original.call(this, key, value)
      }
    })
    me = user(303)
    await openCabinet()
    await dialog().getByRole('button', { name: '이 사물함 대여하기' }).click()
    await guide().waitFor()
    for (let step = 0; step < 6; step++) await button('다음').click()
    const storageFailureRental = page.waitForResponse((r) => r.url().includes('/lent/cabinets/'))
    await button('안내 확인 후 대여하기').click()
    await storageFailureRental
    await noGuide()
    assert.equal(await stored(303), null)
    const sessionRental = page.waitForResponse((r) => r.url().includes('/lent/cabinets/'))
    await dialog().getByRole('button', { name: '이 사물함 대여하기' }).click()
    await sessionRental
    await noGuide()
    assert.deepEqual(pageErrors, [])
    console.log('PASS manual return after 2 failures, Section C, input preservation and original manual-return payload; no browser errors')
    console.log('PASS localStorage write failure still permits rental and remembers acknowledgement for this session')
  } finally {
    await browser.close()
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
