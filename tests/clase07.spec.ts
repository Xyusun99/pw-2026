import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

test.describe('Clase 07 -Evidencias de pruebas', () => {

  test('Login exitoso -evidencia completa', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.navigate();

    await page.screenshot({
      path: './evidencias/clase07/clase07-antes-login.png',
      fullPage: true,
    });

    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.expectToBeOnInventoryPage();

    await page.screenshot({
      path: './evidencias/clase07/clase07-despues-login.png',
      fullPage: true,
    });

    console.log('Login documentado con screenshots');
  });

  test('Documentar el flujo de compra completo', async ({ page }) => {
const loginPage = new LoginPage(page);
await loginPage.navigate();
await loginPage.login('standard_user', 'secret_sauce');
await expect(page).toHaveURL(/inventory/);
await page.screenshot({ path: './evidencias/clase07/clase07-inventario.png' });
await page.locator('.btn_inventory').first().click();
const nombreProducto = await page.locator('.inventory_item_name')

.first().textContent();
await page.screenshot({ path: './evidencias/clase07/clase07-producto-agregado.png' });
await page.locator('.shopping_cart_link').click();
await expect(page).toHaveURL(/cart/);
await page.screenshot({ path: './evidencias/clase07/clase07-carrito.png', fullPage: true });
await expect(page.locator('.cart_item')).toHaveCount(1);
await expect(page.locator('.inventory_item_name')).toContainText(nombreProducto!);
console.log(`Flujo documentado. Producto: ${nombreProducto}`);
});

test('Capturar el momento exacto de un defecto esperado', async ({ page }) => {
const loginPage = new LoginPage(page);
await loginPage.navigate();
await loginPage.login('locked_out_user', 'secret_sauce');
const errorElement = page.locator('[data-test="error"]');
await expect(errorElement).toBeVisible();
await errorElement.screenshot({
path: './evidencias/clase07/clase07-error-usuario-bloqueado.png' });
const textoError = await errorElement.textContent();
console.log(`Error capturado: ${textoError}`);
});

test('Comparar estados antes y después de una acción', async ({ page }) => {
const loginPage = new LoginPage(page);
await loginPage.navigate();
await loginPage.login('standard_user', 'secret_sauce');
const estadoAntes = await page.locator('.shopping_cart_badge').isVisible();
await page.screenshot({ path: './evidencias/clase07/clase07-estado-antes.png' });
await page.locator('.btn_inventory').first().click();
const badgeDespues = page.locator('.shopping_cart_badge');

await expect(badgeDespues).toBeVisible();
await expect(badgeDespues).toHaveText('1');
await page.screenshot({ path: './evidencias/clase07/clase07-estado-despues.png' });
console.log('Estado antes y después documentados correctamente');
});

test('RETO 1: Estructurar test con test.step()', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await test.step('1. Navegar a la página de login', async () => {
      await loginPage.navigate();
      await page.screenshot({ 
        path: './evidencias/clase07/reto1-paso1-navegacion.png', 
        fullPage: true 
      });
    });

    await test.step('2. Iniciar sesión con credenciales válidas', async () => {
      await loginPage.login('standard_user', 'secret_sauce');
      await page.screenshot({ 
        path: './evidencias/clase07/reto1-paso2-login.png', 
        fullPage: true 
      });
    });

    await test.step('3. Verificar que el login fue exitoso', async () => {
      await inventoryPage.expectToBeOnInventoryPage();
      await page.screenshot({ 
        path: './evidencias/clase07/reto1-paso3-verificacion.png', 
        fullPage: true 
      });
      console.log('✅ RETO 1: Test estructurado con test.step() completado');
    });
  });

test('RETO 2: Adjuntar datos al reporte con testInfo.attach()', async ({ page }, testInfo) => {
    const loginPage = new LoginPage(page);
    
    const testData: {
      fecha: string;
      usuario: string;
      url: string;
      cantidadProductos: number;
      productos: string[];
    } = {
      fecha: new Date().toISOString(),
      usuario: 'standard_user',
      url: 'https://www.saucedemo.com',
      cantidadProductos: 0,
      productos: []
    };

    await test.step('1. Navegar y hacer login', async () => {
      await loginPage.navigate();
      await loginPage.login('standard_user', 'secret_sauce');
    });

    await test.step('2. Capturar información de productos', async () => {
      const productos = page.locator('.inventory_item');
      testData.cantidadProductos = await productos.count();
    
      const nombres = await page.locator('.inventory_item_name').allTextContents();
      testData.productos = nombres.slice(0, 5); // Solo los primeros 5
    });

    await testInfo.attach('datos-capturados', {
      body: Buffer.from(JSON.stringify(testData, null, 2)),
      contentType: 'application/json'
    });

    const textoReporte = `
      === REPORTE DE EJECUCIÓN ===
      Fecha: ${testData.fecha}
      Usuario: ${testData.usuario}
      URL: ${testData.url}
      Total Productos: ${testData.cantidadProductos}
      Primeros 5 productos: ${testData.productos.join(', ')}
    `;
    
    await testInfo.attach('reporte-ejecucion', {
      body: Buffer.from(textoReporte),
      contentType: 'text/plain'
    });

    await page.screenshot({ 
      path: './evidencias/clase07/reto2-verificacion.png', 
      fullPage: true 
    });

    console.log('✅ RETO 2: Datos adjuntados al reporte');
  });

  test('RETO 3: Comparación visual con toHaveScreenshot()', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.expectToBeOnInventoryPage();
    const logo = page.locator('.app_logo');
    await logo.waitFor({ state: 'visible' });

    await expect(logo).toHaveScreenshot('reto3-logo-baseline.png', {
      maxDiffPixels: 100, 
      maxDiffPixelRatio: 0.1  
    });

    const inventorySection = page.locator('.inventory_list');
    await expect(inventorySection).toHaveScreenshot('reto3-inventario-baseline.png', {
      maxDiffPixels: 500
    });

    await page.screenshot({ 
      path: './evidencias/clase07/reto3-comparacion-visual.png', 
      fullPage: true 
    });

    console.log('✅ RETO 3: Comparación visual completada');
  });

});
