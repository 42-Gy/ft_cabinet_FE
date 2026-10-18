/* Local, stateful integration tests. No production API requests are permitted. */
const assert = require('node:assert/strict')
const { chromium } = require('playwright')
const base = process.env.GUIDE_TEST_URL || 'http://127.0.0.1:4173'
assert.match(base, /^http:\/\/(127\.0\.0\.1|localhost):\d+$/)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
async function until(check, label, timeout = 10000) {
  const start = Date.now()
  while (!(await check())) {
    if (Date.now() - start > timeout) throw new Error(`Timed out: ${label}`)
    await sleep(25)
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome', args: [
    '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream',
  ] })
  const state = { reserved: null, deadline: 0, rented: true, first: false,
    omitFirst: false, meError: false, redisNull: false, holdZero: false,
    nextReserve: null, nextCancel: null, cancelDelay: 0 }
  const requests = []
  const errors = []
  const counts = (method, part) => requests.filter((r) => r.method === method && r.path.includes(part)).length
  const reserve = (number, seconds = 900) => { state.reserved = number; state.deadline = Date.now() + seconds * 1000 }
  function snapshot() {
    if (state.reserved != null && Date.now() >= state.deadline && !state.holdZero) state.reserved = null
    const remaining = state.reserved == null ? null : Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000))
    return {
      userId: 707, name: 'Reservation test', email: 'test@example.test', coin: 0,
      penaltyDays: 0, monthlyLogtime: 0,
      ...(!state.omitFirst ? { isFirstRental: state.first } : {}),
      ...(state.rented ? { lentCabinetId: 999, visibleNum: 99, section: '섹션 1' } : {}),
      myItems: [{ itemHistoryId: 1, itemType: 'SWAP', itemName: '이사권' }, { itemHistoryId: 2, itemType: 'LENT', itemName: '대여권' }],
      reservedVisibleNum: state.redisNull ? null : state.reserved,
      reservationRemainingSeconds: state.redisNull ? null : remaining,
    }
  }
  function cabinet(number) {
    snapshot()
    return { cabinetId: number + 100, visibleNum: number, floor: 2, section: '섹션 1', status: 'AVAILABLE',
      isReserved: state.reserved === number || number === 18,
      isReservedByMe: state.reserved === number,
      reservationRemainingSeconds: state.reserved === number ? snapshot().reservationRemainingSeconds : null }
  }
  async function newContext() {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, permissions: ['camera'] })
    context.on('page', (p) => p.on('pageerror', (e) => errors.push(e.message)))
    await context.route('**/*', (route) => new URL(route.request().url()).origin === base ? route.continue() : route.abort())
    await context.route(`${base}/api/**`, async (route) => {
      const request = route.request()
      const path = new URL(request.url()).pathname
      const method = request.method()
      requests.push({ path, method, body: request.postData() || '' })
      let status = 200
      let data = {}
      let message = '요청 완료'
      if (method === 'GET' && path.endsWith('/users/me')) {
        status = state.meError ? 500 : 200
        data = snapshot()
      } else if (method === 'GET' && path.endsWith('/status-summary')) {
        data = [{ section: '섹션 1', total: 3, availableCount: 3 }]
      } else if (method === 'GET' && path.endsWith('/cabinets')) data = [12, 15, 18].map(cabinet)
      else if (method === 'GET' && /\/cabinets\/\d+$/.test(path)) {
        const id = Number(path.split('/').at(-1))
        if (![112, 115, 118].includes(id)) { status = 404; message = 'Expected a database cabinet ID' }
        else data = cabinet(id - 100)
      } else if (method === 'POST' && path.includes('/lent/reservation/')) {
        const num = Number(path.split('/').at(-1))
        const plan = state.nextReserve
        state.nextReserve = null
        if (plan) {
          if (plan.commit) reserve(num)
          if (plan.network) return route.abort('failed')
          status = plan.status
          message = plan.message
        } else if (state.reserved === num) { status = 400; message = '이미 예약 중인 사물함이 있습니다.' }
        else if (num === 18) { status = 400; message = '다른 사용자가 예약 중입니다.' }
        else reserve(num)
        data = { message }
      } else if (method === 'DELETE' && path.endsWith('/lent/reservation')) {
        await sleep(state.cancelDelay)
        status = state.nextCancel || (state.reserved == null ? 404 : 200)
        state.nextCancel = null
        message = status === 404 ? '취소할 예약이 없습니다.' : status === 200 ? '예약이 취소되었습니다.' : '취소 요청 실패'
        if ([200, 404].includes(status)) state.reserved = null
        data = { message }
      } else if (method === 'POST' && path.includes('/lent/cabinets/')) {
        state.first = false; state.rented = true; state.reserved = null
        data = { message: '대여 완료' }
      } else if (method === 'POST' && path.includes('/lent/swap/')) {
        assert.equal(Number(path.split('/').at(-1)), state.reserved)
        state.reserved = null
        data = { message: '이사 완료' }
      } else data = { message }
      await route.fulfill({ status, json: { success: status < 400, status, message, data: status < 400 ? data : null } })
    })
    return context
  }
  const context = await newContext()
  const page = await context.newPage()
  const dialog = () => page.getByRole('dialog')
  const button = (name) => dialog().getByRole('button', { name, exact: true })
  const panel = (number) => page.getByText(`진행 중인 이사 예약 · #${number}`, { exact: true })
  async function showCabinet(number) {
    await page.goto(`${base}/lockers`)
    await page.getByRole('button', { name: /섹션 1 \(1클러스터 앞\)/ }).click()
    await page.getByText(String(number), { exact: true }).click()
    await dialog().getByText(`#${number} · 2F`, { exact: true }).waitFor()
  }
  async function confirmSwap(number) {
    await showCabinet(number)
    await button('이사하기').click()
    await page.getByRole('dialog', { name: '이사 예약', exact: true }).waitFor()
  }
  async function freshPage() {
    await page.goto(`${base}/lockers`)
    await page.getByRole('heading', { name: '섹션별 사물함' }).waitFor()
    await until(() => page.getByRole('button', { name: '예약 상태 새로고침' }).count().then((n) => n === 0 || page.getByRole('button', { name: '예약 상태 새로고침' }).first().isEnabled()), 'fresh me')
  }
  try {
    // New reservation, distinct cabinetId/visibleNum, and interrupted process recovery.
    await confirmSwap(12)
    await button('이사 예약하기').click()
    await page.getByRole('dialog', { name: '사물함 반납 후 이사', exact: true }).waitFor()
    assert.equal(counts('POST', '/reservation/12'), 1)
    const originalDeadline = state.deadline
    await page.reload()
    await panel(12).waitFor()
    await page.getByRole('button', { name: '진행 중인 이사 이어하기' }).click()
    await page.getByRole('dialog', { name: '사물함 반납 후 이사', exact: true }).waitFor()
    assert.equal(state.deadline, originalDeadline)
    assert.equal(counts('POST', '/reservation/12'), 1)
    await button('닫기').click()
    console.log('PASS reserve 12, reload recovery without POST or TTL reset; DB ID 112 used only for detail')

    // Server atomically replaces 12 with 15; the client must never DELETE first.
    await confirmSwap(15)
    await dialog().getByText('기존 예약이 취소되고 새로운 사물함으로 변경됩니다.').waitFor()
    await button('예약 변경하기').click()
    await page.getByRole('dialog', { name: '사물함 반납 후 이사', exact: true }).waitFor()
    assert.equal(state.reserved, 15)
    assert.equal(counts('DELETE', '/reservation'), 0)
    const beforeSame = counts('POST', '/reservation/')
    await showCabinet(15)
    await button('진행 중인 이사 이어하기').click()
    await page.getByRole('dialog', { name: '사물함 반납 후 이사', exact: true }).waitFor()
    assert.equal(counts('POST', '/reservation/'), beforeSame)
    console.log('PASS atomic 12 -> 15 change and same-number resume without duplicate reservation')

    const stableDeadline = state.deadline
    for (const [status, message, expected] of [
      [400, '이미 예약 중인 사물함이 있습니다.', '이미 예약 중인 사물함이 있습니다.'],
      [400, '다른 사용자가 예약 중입니다.', '다른 사용자가 예약 중입니다.'],
      [400, '이사권이 부족합니다.', '이사권이 부족합니다.'],
      [400, '사용할 수 없는 사물함입니다.', '사용할 수 없는 사물함입니다.'],
      [403, '사용자 자격을 확인해주세요.', '사용자 자격을 확인해주세요.'],
      [409, 'Conflict', '현재 처리 중인 요청입니다. 잠시 후 다시 시도해주세요.'],
      [429, 'Too many requests', '예약 요청이 많습니다. 잠시 후 다시 시도해주세요.'],
    ]) {
      await confirmSwap(12)
      state.nextReserve = { status, message }
      const before = counts('POST', '/reservation/')
      await button('예약 변경하기').click()
      await page.getByText(expected, { exact: true }).last().waitFor()
      await until(() => button('예약 변경하기').isEnabled(), `settled ${status}`)
      assert.equal(state.reserved, 15)
      assert.equal(state.deadline, stableDeadline)
      assert.equal(counts('POST', '/reservation/'), before + 1, 'Do not retry reservation POST')
    }
    console.log('PASS 400 same/other/ticket/unavailable, 403, 409, 429 messages and preservation after failed replacement')

    await showCabinet(18)
    assert.equal(await button('이사하기').isDisabled(), true)
    await dialog().getByText('다른 사용자가 예약 중이므로 대여하거나 예약할 수 없습니다.').waitFor()
    await confirmSwap(12)
    state.nextReserve = { network: true, commit: true }
    await button('예약 변경하기').click()
    await page.getByText('요청 결과를 확인할 수 없습니다. 최신 예약 상태를 확인한 후 다시 시도해주세요.', { exact: true }).waitFor()
    await until(() => counts('GET', '/users/me') > 0 && state.reserved === 12, 'uncertain POST refresh')
    await button('닫기').click()
    await panel(12).waitFor()
    console.log('PASS other-user reservation blocked and uncertain network result recovered from /me')

    state.cancelDelay = 250
    const cancelBefore = counts('DELETE', '/reservation')
    await page.getByRole('button', { name: '예약 취소', exact: true }).dblclick()
    await until(() => state.reserved == null, 'cancel')
    await panel(12).waitFor({ state: 'hidden' })
    assert.equal(counts('DELETE', '/reservation'), cancelBefore + 1)
    assert.equal(requests.filter((r) => r.method === 'DELETE').at(-1).body, '')
    state.cancelDelay = 0
    reserve(12); state.nextCancel = 404
    await freshPage(); await panel(12).waitFor()
    await page.getByRole('button', { name: '예약 취소', exact: true }).click()
    await panel(12).waitFor({ state: 'hidden' })
    reserve(12); state.nextCancel = 500
    await freshPage(); await panel(12).waitFor()
    await page.getByRole('button', { name: '예약 취소', exact: true }).click()
    await page.getByText('취소 요청 실패', { exact: true }).waitFor()
    await until(() => page.getByRole('button', { name: '예약 취소', exact: true }).isEnabled(), 'cancel error refresh')
    assert.equal(state.reserved, 12)
    await panel(12).waitFor()
    console.log('PASS cancel 200, 404-as-success, failed cancel retained, no duplicate DELETE and no request body')

    reserve(12, 2)
    await freshPage(); await panel(12).waitFor()
    const expiryReads = counts('GET', '/users/me')
    const expiryPosts = counts('POST', '/reservation/')
    await panel(12).waitFor({ state: 'hidden', timeout: 7000 })
    assert.ok(counts('GET', '/users/me') > expiryReads)
    assert.equal(counts('POST', '/reservation/'), expiryPosts)
    state.holdZero = true; reserve(12, 0)
    await freshPage()
    await page.getByText('남은 시간 00:00', { exact: true }).waitFor()
    const zeroReads = counts('GET', '/users/me')
    await sleep(1200)
    assert.ok(counts('GET', '/users/me') <= zeroReads + 1, 'Zero-TTL response must not create a refetch loop')
    state.holdZero = false
    reserve(12, 742)
    await freshPage(); await panel(12).waitFor()
    state.deadline = Date.now() + 610000
    const visibleReads = page.waitForResponse((r) => r.url().endsWith('/users/me'))
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
    await visibleReads
    await until(async () => /10:0[89]|10:10/.test(await page.getByRole('timer').innerText()), 'background countdown sync')
    console.log('PASS expiry refetch, no zero-TTL loop, and background visibility resynchronization')

    // A separate browser context has no shared localStorage, but recovers the same server reservation.
    const secondContext = await newContext()
    const secondPage = await secondContext.newPage()
    const recoveryPosts = counts('POST', '/reservation/')
    await secondPage.goto(`${base}/my/lockers`)
    await secondPage.getByRole('button', { name: '진행 중인 이사 이어하기' }).click()
    await secondPage.getByRole('dialog', { name: '사물함 반납 후 이사', exact: true }).waitFor()
    assert.equal(counts('POST', '/reservation/'), recoveryPosts)
    await secondContext.close()
    state.redisNull = true
    await showCabinet(12)
    assert.equal(await button('진행 중인 이사 이어하기').isDisabled(), true)
    await button('예약 상태 확인').click()
    assert.equal(counts('POST', '/reservation/'), recoveryPosts)
    state.redisNull = false
    console.log('PASS separate browser and My Lockers -> swap photo recovery; Redis-null snapshot never auto-reserves')

    await freshPage()
    await page.setViewportSize({ width: 320, height: 844 })
    await page.waitForFunction(() => document.documentElement.scrollWidth <= innerWidth)
    await page.getByRole('button', { name: '진행 중인 이사 이어하기' }).click()
    const bounds = await dialog().evaluate((el) => ({ width: el.clientWidth, scroll: el.scrollWidth }))
    assert.ok(bounds.scroll <= bounds.width + 1)
    await button('사진 찍기').click()
    await button('다음 (AI 검증)').click()
    await page.getByLabel('이전 비밀번호 (4자리)').fill('1234')
    const swapped = page.waitForResponse((r) => r.url().endsWith('/lent/swap/12'))
    await button('이사하기').click()
    await swapped
    await page.getByRole('dialog', { name: '사물함 반납 후 이사', exact: true }).waitFor({ state: 'hidden' })
    assert.equal(counts('POST', '/lent/return'), 0, 'Do not separately return the original locker during swap')
    const payload = requests.find((r) => r.path.endsWith('/swap/12')).body
    assert.match(payload, /name="previousPassword"\r\n\r\n1234/)
    assert.match(payload, /name="forceReturn"\r\n\r\nfalse/)
    assert.match(payload, /name="file"/)
    console.log('PASS recovered swap completes using existing photo, AI, password, multipart and final swap transaction')

    state.rented = false; state.first = true; state.reserved = null
    await showCabinet(12)
    await page.evaluate(() => localStorage.setItem('subak:locker-guide:v1:user:707', 'completed'))
    const beforeGuidePosts = requests.filter((r) => r.method !== 'GET').length
    await button('이 사물함 대여하기').click()
    await page.getByRole('heading', { name: '사물함 위치 확인' }).waitFor()
    await button('닫기').click()
    assert.equal(requests.filter((r) => r.method !== 'GET').length, beforeGuidePosts)
    await button('이 사물함 대여하기').click()
    for (let step = 0; step < 6; step++) await button('다음').click()
    const rentDone = page.waitForResponse((r) => r.url().endsWith('/lent/cabinets/12'))
    await button('안내 확인 후 대여하기').click()
    await rentDone
    const actions = requests.filter((r) => r.method === 'POST').slice(-2)
    assert.deepEqual(actions.map((r) => r.path), ['/api/v4/lent/reservation/12', '/api/v4/lent/cabinets/12'])
    assert.equal(state.first, false)
    state.rented = false
    const thirdContext = await newContext()
    const thirdPage = await thirdContext.newPage()
    await thirdPage.goto(`${base}/lockers`)
    await thirdPage.getByRole('button', { name: /섹션 1 \(1클러스터 앞\)/ }).click()
    await thirdPage.getByText('12', { exact: true }).click()
    const experienced = thirdPage.waitForResponse((r) => r.url().endsWith('/lent/cabinets/12'))
    await thirdPage.getByRole('button', { name: '이 사물함 대여하기' }).click()
    await experienced
    assert.equal(await thirdPage.getByRole('dialog', { name: /대여 전 SUBAK 이용안내/ }).count(), 0)
    await thirdContext.close()
    state.rented = false; state.first = true
    reserve(12, 742)
    await page.goto(`${base}/my/lockers`)
    await page.getByText('진행 중인 대여 예약 · #12', { exact: true }).waitFor()
    await page.getByRole('button', { name: '예약 사물함 확인' }).click()
    const existingRentalReservations = counts('POST', '/reservation/')
    await page.getByRole('button', { name: '예약 사물함 대여하기' }).click()
    for (let step = 0; step < 6; step++) await button('다음').click()
    const resumedRent = page.waitForResponse((r) => r.url().endsWith('/lent/cabinets/12'))
    await button('안내 확인 후 대여하기').click()
    await resumedRent
    assert.equal(counts('POST', '/reservation/'), existingRentalReservations)
    console.log('PASS 320px reservation and swap UI; general rental reservation is distinguished and resumed without a reservation POST')
    state.rented = false; state.omitFirst = true
    await showCabinet(12)
    assert.equal(await button('이 사물함 대여하기').isDisabled(), true)
    await button('사물함 대여 이용안내').click()
    await page.getByRole('heading', { name: '사물함 위치 확인' }).waitFor()
    await button('닫기').click()
    state.meError = true
    const beforeMeError = counts('POST', '/reservation/')
    await page.reload()
    await page.getByText('사용자 대여 정보를 확인할 수 없습니다. 새로고침 후 다시 시도해주세요.').waitFor()
    assert.equal(counts('POST', '/reservation/'), beforeMeError)
    assert.deepEqual(errors, [])
    console.log('PASS server first-rental flag across browsers, old localStorage ignored, cancel/no APIs, guide before reservation, missing field and /me failure blocked; help available')
  } catch (error) {
    await page.screenshot({ path: '/tmp/subak-reservation-failure.png', fullPage: true }).catch(() => {})
    throw error
  } finally {
    await browser.close()
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1 })
