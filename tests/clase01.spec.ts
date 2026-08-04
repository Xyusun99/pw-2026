import { test, expect } from '@playwright/test';

// Test 1: Verificar título de la página
test('homepage has correct title', async ({ page }) => {
  await page.goto('https://www.demoblaze.com');
  await expect(page).toHaveTitle(/STORE/);
});

// Test 2: Navegar a categoría "Phones"
test('navigate to Phones category', async ({ page }) => {
  await page.goto('https://www.demoblaze.com');
  await page.click('text=Phones');
  // Verifica que aparezcan productos en la categoría
  await expect(page.locator('.card-title')).toHaveCount(7);
});

// Test 3: Abrir modal de login
test('login modal opens', async ({ page }) => {
  await page.goto('https://www.demoblaze.com');
  await page.click('#login2'); // botón Login
  await expect(page.locator('#logInModal')).toBeVisible();
});
