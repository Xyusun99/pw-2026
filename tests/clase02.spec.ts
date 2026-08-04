import { test, expect } from '@playwright/test';
import * as fs from 'fs';

// Crear carpeta para evidencias si no existe
test.beforeAll(() => {
  if (!fs.existsSync('./evidencias')) {
    fs.mkdirSync('./evidencias');
  }
});

test.describe('Clase 02 - Navegación y esperas en DemoBlaze', () => {

  test('Navegar al carrito y regresar al inicio', async ({ page }) => {
    await page.goto('https://www.demoblaze.com');

    await expect(page).toHaveURL(/demoblaze/);

    await page.screenshot({
      path: './evidencias/01-pagina-inicio.png',
      fullPage: true
    });

    await page.getByText('Cart', { exact: true }).click();

    await page.waitForURL('**/cart.html');

    await expect(page).toHaveURL(/cart/);

    await page.screenshot({
      path: './evidencias/02-carrito-vacio.png',
      fullPage: true
    });

    await page.goBack();

    await expect(page).toHaveURL(/demoblaze\.com\/?$/);
  });

  test('Navegar a la categoría Phones y ver un producto', async ({ page }) => {
    // Usar la URL completa
    await page.goto('https://www.demoblaze.com');

    // IMPORTANTE: No usar 'networkidle' porque nunca se completa
    // Usar 'domcontentloaded' que es más rápido y suficiente
    await page.waitForLoadState('domcontentloaded');

    // Hacer clic en Phones
    await page.getByText('Phones', { exact: true }).click();

    // Esperar a que aparezcan los productos
    await page.waitForSelector('.card-title a', { timeout: 10000 });

    const productos = page.locator('.card-title a');

    // Verificar que hay productos
    const count = await productos.count();
    expect(count).toBeGreaterThan(0);

    // Hacer clic en el primer producto
    await productos.first().click();

    // Esperar a que cargue el detalle del producto
    await page.waitForLoadState('domcontentloaded');

    await page.screenshot({
      path: './evidencias/03-detalle-producto.png',
      fullPage: true
    });

    // Verificar que el botón "Add to cart" está visible
    await expect(
      page.getByText('Add to cart', { exact: true })
    ).toBeVisible({ timeout: 10000 });
  });

 test('Capturar el navbar y el footer por separado', async ({ page }) => {
  await page.goto('https://www.demoblaze.com');
  await page.waitForLoadState('domcontentloaded');

  // Capturar navbar
  const navbar = page.locator('#navbarExample');
  await expect(navbar).toBeVisible();
  await navbar.screenshot({
    path: './evidencias/04-navbar.png'
  });

  // Capturar el footer
  // Hacer scroll al final de la página
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  
  // Capturar la vista actual que incluye el footer
  await page.screenshot({
    path: './evidencias/05-footer.png'
  });
});

  test('Verificar tiempo de carga de la página', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('https://www.demoblaze.com');
    await page.waitForLoadState('load');

    const loadTime = Date.now() - startTime;

    console.log(`Tiempo de carga: ${loadTime}ms`);

    await test.info().attach('tiempo-de-carga', {
      body: Buffer.from(`Tiempo de carga: ${loadTime}ms`),
      contentType: 'text/plain'
    });

    // La página debería cargar en menos de 10 segundos
    expect(loadTime).toBeLessThan(10000);
  });

});