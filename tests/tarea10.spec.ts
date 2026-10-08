import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Tarea 10 - Tags, Soft Assertions y Cross-Browser', () => {

  // RETO 1: Tags múltiples + --grep-invert
  test('RETO 1: Test con múltiples tags', 
    { tag: ['@regression', '@ui', '@tarea10'] }, 
    async ({ page }) => {
      await loginAs(page, 'standard_user');
      
      await expect(page.locator('.inventory_list')).toBeVisible();
      await expect(page.locator('.shopping_cart_link')).toBeVisible();
      
      console.log('✅ RETO 1: Test con múltiples tags ejecutado');
    });

  test('RETO 1b: Test solo con @regression', 
    { tag: '@regression' }, 
    async ({ page }) => {
      await loginAs(page, 'standard_user');
      await expect(page).toHaveURL(/inventory/);
      console.log('✅ RETO 1b: Test solo con @regression');
    });

  // RETO 2: expect.soft()
  test('RETO 2: Verificar varios atributos con expect.soft()', 
    { tag: '@tarea10' }, 
    async ({ page }, testInfo) => {
      await loginAs(page, 'standard_user');
      
      const primerProducto = page.locator('.inventory_item').first();
      
      await expect.soft(primerProducto.locator('.inventory_item_name')).toBeVisible();
      await expect.soft(primerProducto.locator('.inventory_item_desc')).toBeVisible();
      await expect.soft(primerProducto.locator('.inventory_item_price')).toBeVisible();
      await expect.soft(primerProducto.locator('.btn_inventory')).toBeVisible();
      
      await expect.soft(primerProducto.locator('.btn_inventory')).toHaveText('Add to cart');
      
      if (testInfo.errors.length > 0) {
        console.log(`⚠️ Se encontraron ${testInfo.errors.length} fallos suaves`);
      } else {
        console.log('✅ RETO 2: Todas las verificaciones suaves pasaron');
      }
    });

  // RETO 3: fixture browserName
  test('RETO 3: Ajustar aserción según el motor del navegador', 
    { tag: '@tarea10' }, 
    async ({ page, browserName }) => {
      await loginAs(page, 'standard_user');
      
      if (browserName === 'chromium') {
        console.log('🌐 Ejecutando en Chromium (Blink)');
        await expect(page.locator('.inventory_item')).toHaveCount(6);
      } else if (browserName === 'firefox') {
        console.log('🦊 Ejecutando en Firefox (Gecko)');
        await expect(page.locator('.inventory_item')).toHaveCount(6);
      } else if (browserName === 'webkit') {
        console.log('🧭 Ejecutando en WebKit (Safari)');
        await expect(page.locator('.inventory_item')).toHaveCount(6);
      }
      
      const titulo = await page.locator('.title').textContent();
      expect(titulo).toBe('Products');
      
      console.log(`✅ RETO 3: Test ejecutado correctamente en ${browserName}`);
    });

  test('RETO 3b: Verificación específica por motor', 
    { tag: '@tarea10' }, 
    async ({ page, browserName }) => {
      await loginAs(page, 'standard_user');
      
      const viewport = page.viewportSize();
      
      if (browserName === 'webkit') {
        console.log(`🧭 WebKit - Viewport: ${viewport?.width}x${viewport?.height}`);
      }
      
      await expect(page.locator('.inventory_list')).toBeVisible();
      
      console.log(`✅ RETO 3b: Completado en ${browserName}`);
    });

});