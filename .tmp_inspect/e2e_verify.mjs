import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { chromium } from '/usr/local/share/bun-global/node_modules/playwright-core/index.mjs';

const DIST_DIR = path.resolve('dist');
const SUBPATH = '/kak-zone';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

function startSubpathServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = (req.url || '/').split('?')[0];
      if (!urlPath.startsWith(SUBPATH)) {
        res.writeHead(404);
        res.end('Not found outside subpath');
        return;
      }
      let rel = urlPath.slice(SUBPATH.length);
      if (rel === '' || rel === '/') rel = '/index.html';
      const filePath = path.join(DIST_DIR, rel);
      if (!filePath.startsWith(DIST_DIR) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404);
        res.end('404 Not Found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      resolve({ server, port: addr.port });
    });
  });
}

async function main() {
  const { server, port } = await startSubpathServer();
  const baseUrl = `http://127.0.0.1:${port}${SUBPATH}/`;
  const browser = await chromium.launch();

  try {
    // 1. Desktop check: direct load + reload under /kak-zone/
    const context = await browser.newContext({ viewport: { width: 1280, height: 860 } });
    const page = await context.newPage();

    const failedResponses = [];
    const consoleErrors = [];
    const pageErrors = [];
    page.on('response', (res) => {
      if (res.url().startsWith('http://127.0.0.1') && res.status() >= 400) {
        failedResponses.push(`${res.status()} ${res.url()}`);
      }
    });
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    // Skip intro quickly if visible
    const skipBtn = page.getByRole('button', { name: 'تخطي' });
    if (await skipBtn.isVisible().catch(() => false)) {
      await skipBtn.click();
      await page.waitForTimeout(350);
    }

    // Check reload preserves session & 200 status for all local resources
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(400);

    // Verify all rendered images loaded properly (naturalWidth > 0)
    const imgStatus = await page.evaluate(async () => {
      const imgs = Array.from(document.querySelectorAll('img'));
      imgs.forEach((img) => { img.loading = 'eager'; img.scrollIntoView(); });
      await new Promise((r) => setTimeout(r, 350));
      return imgs.map((img) => ({
        src: img.getAttribute('src'),
        complete: img.complete,
        naturalWidth: img.naturalWidth,
      }));
    });
    const brokenImgs = imgStatus.filter((i) => !i.complete || i.naturalWidth === 0);
    assert.strictEqual(brokenImgs.length, 0, `Broken images found: ${JSON.stringify(brokenImgs)}`);
    assert.strictEqual(failedResponses.length, 0, `Failed responses: ${failedResponses.join(', ')}`);
    assert.strictEqual(pageErrors.length, 0, `Page errors: ${pageErrors.join(', ')}`);

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    await page.screenshot({ path: '.tmp_inspect/e2e_desktop_hero.png' });

    // Scroll to Old School in MenuSection for screenshot
    const menuHeading = page.locator('#menu h2');
    await menuHeading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await page.screenshot({ path: '.tmp_inspect/e2e_desktop_menu.png' });

    // 2. Mobile 360x800 Viewport Audit + Full E2E Cart -> Edit -> WhatsApp Flow
    const mContext = await browser.newContext({ viewport: { width: 360, height: 800 } });
    const mPage = await mContext.newPage();
    mPage.on('response', (res) => {
      if (res.url().startsWith('http://127.0.0.1') && res.status() >= 400) {
        failedResponses.push(`MOBILE ${res.status()} ${res.url()}`);
      }
    });
    mPage.on('pageerror', (err) => pageErrors.push(`MOBILE ${err.message}`));

    await mPage.goto(baseUrl, { waitUntil: 'networkidle' });
    const mSkip = mPage.getByRole('button', { name: 'تخطي' });
    if (await mSkip.isVisible().catch(() => false)) {
      await mSkip.click();
      await mPage.waitForTimeout(350);
    }

    const overflowCheck = await mPage.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    assert.ok(
      overflowCheck.scrollWidth <= overflowCheck.innerWidth,
      `Mobile horizontal overflow detected: ${JSON.stringify(overflowCheck)}`
    );

    // Inspect Old School card in FeaturedShowcase / MenuSection on 360px
    const oldSchoolCard = mPage.locator('#menu article', { hasText: 'أولد سكول' }).first();
    await oldSchoolCard.scrollIntoViewIfNeeded();
    await mPage.waitForTimeout(250);
    await oldSchoolCard.screenshot({ path: '.tmp_inspect/e2e_mobile_old_school_card.png' });
    await mPage.screenshot({ path: '.tmp_inspect/e2e_mobile_360.png' });

    // Verify ingredients text & 'كل المكونات' modal trigger on multi-line item (e.g. فاير هاوس or كاك زون)
    const allIngredientsBtn = mPage.locator('#menu article', { hasText: 'فاير هاوس' }).first().getByRole('button', { name: 'كل المكونات' });
    assert.ok(await allIngredientsBtn.isVisible(), 'Expected كل المكونات button on multi-line description');

    // E2E Step A: Click "+ أضف" on أولد سكول -> opens modal because it has S / D sizes
    await oldSchoolCard.getByRole('button', { name: /أضف/ }).click();
    const dialog = mPage.getByRole('dialog');
    await dialog.waitFor({ state: 'visible' });

    // Verify ingredients, sizes, extras, notes sections present
    await dialog.getByText('المكونات الأساسية').waitFor();
    await dialog.getByText('الأحجام المتاحة').waitFor();
    await dialog.getByText('إضافات اختيارية').waitFor();
    await dialog.getByLabel(/ملاحظات للمطعم/).waitFor();

    // Select D (دبل) = 139 + رانش = 15 -> 154 ج.م
    await dialog.getByRole('button', { name: /D \(دبل\)/ }).click();
    await dialog.getByRole('button', { name: /رانش/ }).click();

    const addBtn = dialog.getByRole('button', { name: /أضف للسلة · 154 ج\.م/ });
    assert.ok(await addBtn.isVisible(), 'Modal CTA should display أضف للسلة · 154 ج.م');
    await addBtn.click();

    // E2E Step B: Open CartDrawer -> check 154 ج.م & رانش & D (دبل)
    await mPage.getByRole('button', { name: /عرض السلة|فتح سلة الطلبات/ }).first().click();
    const cartDialog = mPage.getByRole('dialog', { name: 'سلة الطلبات' });
    await cartDialog.waitFor({ state: 'visible' });
    assert.ok(await cartDialog.getByText(/154 ج\.م/).first().isVisible(), 'Cart should show 154 ج.م');
    assert.ok(await cartDialog.getByText(/رانش/).first().isVisible(), 'Cart should show رانش');

    // E2E Step C: Proceed to Checkout -> check WhatsApp preview 154 ج.م & 201105658806
    await cartDialog.getByRole('button', { name: 'إتمام الطلب عبر واتساب' }).click();
    const checkoutDialog = mPage.getByRole('dialog');
    await checkoutDialog.getByText('معاينة رسالة واتساب الطلب').waitFor();
    const waTextBefore = await checkoutDialog.locator('pre').textContent();
    assert.ok(waTextBefore?.includes('أولد سكول') && waTextBefore?.includes('رانش') && waTextBefore?.includes('154 ج.م'),
      `WhatsApp preview missing 154 details: ${waTextBefore}`);

    // Submit form to verify exact wa.me link
    await checkoutDialog.locator('#cust-name').fill('أحمد محمد');
    await checkoutDialog.locator('#cust-phone').fill('01012345678');
    await checkoutDialog.locator('#cust-address').fill('شارع النيل');
    await checkoutDialog.getByRole('button', { name: 'تجهيز رسالة واتساب' }).click();
    const waAnchor = checkoutDialog.locator('a[href^="https://wa.me/201105658806"]');
    assert.ok(await waAnchor.isVisible(), 'WhatsApp link must target 201105658806');

    // Close checkout, reopen CartDrawer, click "تعديل"
    await checkoutDialog.getByRole('button', { name: 'إغلاق نافذة إتمام الطلب' }).click();
    await mPage.getByRole('button', { name: /عرض السلة|فتح سلة الطلبات/ }).first().click();
    await cartDialog.waitFor({ state: 'visible' });

    // E2E Step D: Click "تعديل" -> remove رانش -> save -> verify 139 ج.م everywhere
    await cartDialog.getByRole('button', { name: 'تعديل' }).first().click();
    const editModal = mPage.getByRole('dialog');
    await editModal.getByRole('button', { name: /حفظ التعديلات · 154 ج\.م/ }).waitFor();

    // Uncheck رانش
    await editModal.getByRole('button', { name: /رانش/ }).click();
    const saveEditBtn = editModal.getByRole('button', { name: /حفظ التعديلات · 139 ج\.م/ });
    assert.ok(await saveEditBtn.isVisible(), 'Edit CTA should update to حفظ التعديلات · 139 ج.م');
    await saveEditBtn.click();

    // Cart should automatically reopen with updated 139 ج.م
    await cartDialog.waitFor({ state: 'visible' });
    assert.ok(await cartDialog.getByText(/139 ج\.م/).first().isVisible(), 'Cart should show updated 139 ج.م');
    assert.strictEqual(await cartDialog.getByText(/إضافات:.*رانش/).count(), 0, 'رانش should be removed');

    await cartDialog.getByRole('button', { name: 'إتمام الطلب عبر واتساب' }).click();
    const waTextAfter = await mPage.getByRole('dialog').locator('pre').textContent();
    assert.ok(waTextAfter?.includes('139 ج.م') && !waTextAfter?.includes('رانش'),
      `WhatsApp preview after edit should be 139 without رانش: ${waTextAfter}`);

    assert.strictEqual(failedResponses.length, 0, `HTTP errors: ${failedResponses.join(', ')}`);
    assert.strictEqual(pageErrors.length, 0, `Runtime errors: ${pageErrors.join(', ')}`);

    console.log(JSON.stringify({
      ok: true,
      subpathUrl: baseUrl,
      totalImgsChecked: imgStatus.length,
      failedResponses,
      consoleErrorsCount: consoleErrors.length,
      mobileOverflow: overflowCheck,
      e2eFlow: 'PASS (139 + 15 = 154 -> edit -> 139 in Modal, CartDrawer, and WhatsApp wa.me/201105658806)'
    }, null, 2));
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error('E2E VERIFICATION FAILED:', err);
  process.exit(1);
});
