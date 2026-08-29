import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { MenuPage } from '../pages/MenuPage';

test.describe('Clase 06 - Page Object Model en Sauce Demo', () => {

  test('Login exitoso con POM', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.expectToBeOnInventoryPage();

    await page.screenshot({ path: 'evidencias/login-exitoso.png' });
    console.log('Login con POM exitoso');
  });

  test('Login fallido con POM', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('wrong_user', 'wrong_pass');
    await loginPage.expectLoginError('Username and password do not match');

    await page.screenshot({ path: 'evidencias/login-fallido.png' });
    console.log('Error de login capturado con POM');
  });

  test('Flujo completo: login -> agregar 2 productos -> verificar carrito', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.expectToBeOnInventoryPage();

    await inventoryPage.addProductByName('Sauce Labs Backpack');
    await inventoryPage.addProductByName('Sauce Labs Bike Light');

    await expect(inventoryPage.cartBadge).toHaveText('2');
    await inventoryPage.goToCart();
    await cartPage.expectItemCount(2);

    await page.screenshot({ path: 'evidencias/flujo-completo.png' });
    console.log('Flujo completo con POM: 2 productos en carrito');
  });

  test('Verificar que el inventario tiene 6 productos', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    const count = await inventoryPage.getProductCount();
    expect(count).toBe(6);

    await page.screenshot({ path: 'evidencias/inventario-6-productos.png' });
  });

  test('Ordenar productos de mayor a menor precio', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');

    await inventoryPage.sortBy('hilo');

    const precios = page.locator('.inventory_item_price');
    const todosLosPrecios = await precios.allTextContents();
    const numericos = todosLosPrecios.map(p => parseFloat(p.replace('$', '')));
    for (let i = 0; i < numericos.length - 1; i++) {
      expect(numericos[i]).toBeGreaterThanOrEqual(numericos[i + 1]);
    }

    await page.screenshot({ path: 'evidencias/ordenar-precios.png' });
  });

  test('Reto 1 - Completar compra de principio a fin con POM', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.expectToBeOnInventoryPage();
    await inventoryPage.addProductByName('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.expectItemCount(1);
    await cartPage.proceedToCheckout();
    await checkoutPage.fillInformation('Juan', 'Perez', '01001');
    await checkoutPage.finishPurchase();
    await checkoutPage.expectPurchaseComplete();

    await page.screenshot({ path: 'evidencias/reto1-checkout.png' });
    console.log('Reto 1: compra completada correctamente');
  });

  test('Reto 2 - Logout utilizando MenuPage', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const menuPage = new MenuPage(page);

    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.expectToBeOnInventoryPage();
    await menuPage.openMenu();
    await menuPage.logout();
    await menuPage.expectToBeLoggedOut();

    await page.screenshot({ path: 'evidencias/reto2-logout.png' });
    console.log('Reto 2: logout realizado correctamente');
  });

  test('Reto 3 - Quitar producto y verificar que desaparezca el badge', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.expectToBeOnInventoryPage();
    await inventoryPage.addProductByName('Sauce Labs Backpack');
    await expect(inventoryPage.cartBadge).toHaveText('1');
    await inventoryPage.removeProductByName('Sauce Labs Backpack');
    await expect(inventoryPage.cartBadge).toBeHidden();

    await page.screenshot({ path: 'evidencias/reto3-remove.png' });
    console.log('Reto 3: producto eliminado y badge desapareció correctamente');
  });

});
