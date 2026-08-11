import { test, expect } from '@playwright/test';

test.describe('Clase 05 - Assertions y técnicas de diseño de pruebas en Sauce Demo', () => {
  

  test('CE válida: login con credenciales correctas', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    await expect(page).toHaveURL(/inventory/);
    await expect(page.locator('.inventory_container')).toBeVisible();

    await page.screenshot({ path: 'screenshots/CE_valida_login.png' });
    console.log('CE válida: login exitoso');
  });

  test('CE inválida: usuario no existe', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.locator('#user-name').fill('usuario_inexistente');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    const errorMsg = page.locator('[data-test="error"]');
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText('Username and password do not match');
    await expect(page).not.toHaveURL(/inventory/);

    await page.screenshot({ path: 'screenshots/CE_invalida_usuario_no_existe.png' });
    console.log('CE inválida: usuario no existe');
  });

  test('CE inválida: usuario bloqueado', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.locator('#user-name').fill('locked_out_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    const errorMsg = page.locator('[data-test="error"]');
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText('locked out');

    await page.screenshot({ path: 'screenshots/CE_invalida_usuario_bloqueado.png' });
    console.log('CE usuario bloqueado: mensaje correcto mostrado');
  });

  test('Valor en frontera: campos vacíos (frontera de longitud mínima)', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.locator('#login-button').click();

    const errorMsg = page.locator('[data-test="error"]');
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText('Username is required');

    await page.screenshot({ path: 'screenshots/frontera_campos_vacios.png' });
    console.log('Valor frontera: campo vacío maneja error correctamente');
  });


  test('Verificar que el inventario tiene exactamente 6 productos', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    await expect(page).toHaveURL(/inventory/);
    const productos = page.locator('.inventory_item');
    await expect(productos).toHaveCount(6);

    await page.screenshot({ path: 'screenshots/inventario_6_productos.png' });
    console.log('El inventario tiene exactamente 6 productos');
  });

  test('Verificar precio del primer producto con regex', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    await expect(page).toHaveURL(/inventory/);
    const textoPrecio = await page.locator('.inventory_item_price').first().textContent();
    expect(textoPrecio?.trim()).toMatch(/^\$\d+\.\d{2}$/);

    await page.screenshot({ path: 'screenshots/precio_primer_producto.png' });
    console.log('Precio del primer producto verificado con regex');
  });

  test('Verificar atributos y estados de los elementos del inventario', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    await expect(page).toHaveURL(/inventory/);
    const primerBoton = page.locator('.btn_inventory').first();
    await expect(primerBoton).toBeEnabled();
    await expect(primerBoton).toHaveText('Add to cart');

    await primerBoton.click();
    await expect(primerBoton).toHaveText('Remove');

    const badgeCarrito = page.locator('.shopping_cart_badge');
    await expect(badgeCarrito).toBeVisible();
    await expect(badgeCarrito).toHaveText('1');

    await page.screenshot({ path: 'screenshots/atributos_inventario.png' });
    console.log('El botón cambia de estado y el carrito se actualiza');
  });

  test('Verificar múltiples propiedades del primer producto con soft assertions', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    const primerProducto = page.locator('.inventory_item').first();

    await expect.soft(primerProducto.locator('.inventory_item_name')).toBeVisible();
    await expect.soft(primerProducto.locator('.inventory_item_desc')).toBeVisible();
    await expect.soft(primerProducto.locator('.inventory_item_price')).toBeVisible();
    await expect.soft(primerProducto.locator('.btn_inventory')).toBeEnabled();
    await expect.soft(primerProducto.locator('img')).toBeVisible();

    await page.screenshot({ path: 'screenshots/soft_assertions_primer_producto.png' });
    console.log('Soft assertions del primer producto completadas');
  });

  test('Tabla de decisión - Regla 1: logueado con items -> puede pagar', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    await page.locator('.btn_inventory').first().click();
    await page.locator('.shopping_cart_link').click();
    await expect(page).toHaveURL(/cart/);

    const btnCheckout = page.getByText('Checkout');
    await expect(btnCheckout).toBeVisible();
    await expect(btnCheckout).toBeEnabled();

    await page.screenshot({ path: 'screenshots/tabla_decision_regla1.png' });
    console.log('Tabla de decisión - Regla 1: checkout visible y habilitado');
  });

  test('Tabla de decisión - Regla 2: logueado sin items - carrito vacío', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    await page.locator('.shopping_cart_link').click();
    const itemsCarrito = page.locator('.cart_item');
    await expect(itemsCarrito).toHaveCount(0);

    await page.screenshot({ path: 'screenshots/tabla_decision_regla2.png' });
    console.log('Tabla de decisión - Regla 2: carrito vacío');
  });


  test('Reto 1 - toHaveValue() - Ordenar por precio', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    const sortSelect = page.locator('[data-test="product-sort-container"]');
    await sortSelect.selectOption('lohi');

    await expect(sortSelect).toHaveValue('lohi');

    const primerPrecio = page.locator('.inventory_item_price').first();
    await expect(primerPrecio).toHaveText('$7.99');

    await page.screenshot({ path: 'screenshots/reto1_toHaveValue.png' });
    console.log('Reto 1: ordenamiento por precio verificado');
  });

  test('Reto 2 - toBeFocused() - Campo de usuario recibe foco', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    const userInput = page.locator('#user-name');

    await userInput.click();

    await expect(userInput).toBeFocused();

    await page.screenshot({ path: 'screenshots/reto2_toBeFocused.png' });
    console.log('Reto 2: campo de usuario tiene el foco');
  });

  test('Reto 3 - toHaveCSS() - Botón Add to cart tiene cursor: pointer', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    const btnAddToCart = page.locator('.btn_inventory').first();

    await expect(btnAddToCart).toHaveCSS('cursor', 'pointer');

    await page.screenshot({ path: 'screenshots/reto3_toHaveCSS.png' });
    console.log('Reto 3: cursor del botón es pointer');
  });
});