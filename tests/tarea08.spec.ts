import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

test.describe('Reto 1: Suite serial con página compartida', () => {
  test.describe.configure({ mode: 'serial' });

  let sharedPage: Page;

  test.beforeAll(async ({ browser }) => {
    sharedPage = await browser.newPage();
    console.log('🌐 Página compartida creada en beforeAll');
  });

  test.afterAll(async () => {
    await sharedPage.close();
    console.log('🔒 Página compartida cerrada en afterAll');
  });

  test('1.1 - Navegar y hacer login en la página compartida', async () => {
    const loginPage = new LoginPage(sharedPage);
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    
    await expect(sharedPage).toHaveURL(/inventory/);
    console.log('✅ Login exitoso en página compartida');
  });

  test('1.2 - Verificar que la sesión se mantiene (misma página)', async () => {
    const inventoryPage = new InventoryPage(sharedPage);
    await inventoryPage.expectToBeOnInventoryPage();
    
    const titulo = await sharedPage.locator('.title').textContent();
    expect(titulo).toBe('Products');
    console.log('✅ Sesión mantenida: estamos en InventoryPage');
  });

  test('1.3 - Agregar producto usando la misma sesión', async () => {
    await sharedPage.locator('.btn_inventory').first().click();
    
    const badge = sharedPage.locator('.shopping_cart_badge');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('1');
    
    await sharedPage.screenshot({ 
      path: './evidencias/clase08/reto1-pagina-compartida.png', 
      fullPage: true 
    });
    console.log('✅ Producto agregado usando página compartida');
  });
});

test.describe('Reto 2: test.slow()', () => {

  test('2.1 - Test marcado como lento (triplica el timeout)', async ({ page }) => {
    test.slow();
    
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.expectToBeOnInventoryPage();

    const botones = page.locator('.btn_inventory');
    const cantidad = await botones.count();

    for (let i = 0; i < 3; i++) {
      await botones.nth(i).click();
      await page.waitForTimeout(300);
    }

    const badge = page.locator('.shopping_cart_badge');
    await expect(badge).toHaveText('3');

    await page.screenshot({ 
      path: './evidencias/clase08/reto2-test-slow.png', 
      fullPage: true 
    });
    console.log('✅ Test slow() completado - timeout triplicado');
  });

  test('2.2 - Test normal (sin slow)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    
    await expect(page).toHaveURL(/inventory/);
    console.log('✅ Test normal completado (timeout estándar)');
  });
});

test.describe('Reto 3: test.skip() dinámico', () => {

  test('3.1 - Omitir test según condición (navegador)', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 
      `Test omitido: solo se ejecuta en Chromium, actual: ${browserName}`);
    
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    
    await expect(page).toHaveURL(/inventory/);
    console.log(`✅ Test ejecutado en: ${browserName}`);
  });

  test('3.2 - Omitir test según condición (viewport)', async ({ page }) => {
    const viewport = page.viewportSize();
    const esMovil = viewport && viewport.width < 768;
    
    test.skip(esMovil === true, 
      'Test omitido: funcionalidad solo para desktop (viewport < 768px)');
    
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    
    const badge = page.locator('.shopping_cart_badge');
    await page.locator('.btn_inventory').first().click();
    await expect(badge).toBeVisible();
    
    await page.screenshot({ 
      path: './evidencias/clase08/reto3-skip-viewport.png', 
      fullPage: true 
    });
    console.log(`✅ Test ejecutado en viewport: ${viewport?.width}x${viewport?.height}`);
  });

  test('3.3 - Omitir test según variable de entorno', async ({ page }) => {
    const esCI = process.env.CI === 'true';
    
    test.skip(esCI, 
      'Test omitido: no se ejecuta en entorno de CI/CD');
    
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    
    console.log('✅ Test ejecutado localmente (no en CI)');
  });
});