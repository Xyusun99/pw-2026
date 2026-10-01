
import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';

type AppFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
};

export const test = base.extend<AppFixtures>({

  // Fixture 1: página de login preparada
  loginPage: async ({ page }, use) => {
    const lp = new LoginPage(page);
    await lp.navigate();
    await use(lp);
  },

  // Fixture 2: usuario autenticado e inventario disponible
  inventoryPage: async ({ page }, use) => {
    await page.goto('https://www.saucedemo.com');
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    await expect(page).toHaveURL(/inventory/);

    const ip = new InventoryPage(page);
    await use(ip);
  },

  // Fixture 3: carrito con un producto agregado
  cartPage: async ({ page }, use) => {
    await page.goto('https://www.saucedemo.com');
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    await expect(page).toHaveURL(/inventory/);

    // Agregar el primer producto
    await page.locator('.btn_inventory').first().click();

    // Navegar al carrito
    await page.locator('.shopping_cart_link').click();
    await expect(page).toHaveURL(/cart/);

    // Esperar a que el producto aparezca
    await expect(
      page.locator('.cart_item').first()
    ).toBeVisible();

    const cp = new CartPage(page);
    await use(cp);
  },

});

export { expect } from '@playwright/test';
