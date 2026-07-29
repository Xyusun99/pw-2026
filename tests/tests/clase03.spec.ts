import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';


test.describe('Clase 03 - Locators en DemoBlaze', () => {

        test('Locator por texto: verificar elementos del menú', async ({ page }) => {
        await page.goto('/');

        // getByText encuentra cualquier elemento que contenga el texto.
        // Por eso limitamos la búsqueda al navbar.
        const nav = page.locator('#navbarExample');

        await expect(nav.getByText('Home')).toBeVisible();
        await expect(nav.getByText('Contact')).toBeVisible();
        await expect(nav.getByText('About us')).toBeVisible();

        // Para buscar un texto exacto usamos { exact: true }
        await expect(
        nav.getByText('Cart', { exact: true })
        ).toBeVisible();

        await page.screenshot({ 
  path: './evidencias/clase3/Test1-Locator por texto.png', 
  fullPage: true 
});
    });
 
    test('Locator por CSS: productos en la página principal', async ({ page }) => {
        await page.goto('/');

        await page.waitForSelector('.card-title');

        const tarjetas = page.locator('.card');
        const cantidad = await tarjetas.count();

        expect(cantidad).toBeGreaterThan(0);

        const primerProducto = page.locator('.card-title a').first();
        const nombreProducto = await primerProducto.textContent();

        expect(nombreProducto).not.toBeNull();

              await page.screenshot({ 
  path: './evidencias/clase3/Test2-Locator por CSS.png', 
  fullPage: true 
});
    });

    test('Locator por ID: campos del modal de login', async ({ page }) => {
        await page.goto('/');

        // "Log in" también aparece en el título y botón del modal.
        // Limitamos la búsqueda al navbar y seleccionamos el enlace.
        await page
            .locator('#navbarExample')
            .getByRole('link', { name: 'Log in', exact: true })
            .click();

        await page.waitForSelector('#logInModal', {
            state: 'visible'
        });

        await expect(page.locator('#loginusername')).toBeVisible();
        await expect(page.locator('#loginpassword')).toBeVisible();
      await page.screenshot({ 
  path: './evidencias/clase3/Test3-Locator por ID.png', 
  fullPage: true 
});
        
     });


      test('Locator por atributo: imagen del primer producto', async ({ page }) => {
        await page.goto('/');

        await page.waitForSelector('.card-title');

        // Abrir el primer producto
        await page.locator('.card-title a').first().click();
        await page.waitForLoadState('domcontentloaded');

        // Localizar la imagen del producto
        const imagenProducto = page.locator('.product-image img');

        await expect(imagenProducto).toBeVisible();

        // Obtener y verificar el atributo src
        const srcImagen = await imagenProducto.getAttribute('src');

        expect(srcImagen).not.toBeNull();

      await page.screenshot({ 
  path: './evidencias/clase3/Test4-Locator por atributo.png', 
  fullPage: true 
});

    });

    test('Locators encadenados: precio dentro de una tarjeta', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card-title');

    // .locator() sobre otro locator = buscar SOLO dentro de él
    const primeraTarjeta = page.locator('.card').first();
    const precio = primeraTarjeta.locator('h5');
    await expect(precio).toBeVisible();

          await page.screenshot({ 
  path: './evidencias/clase3/Test5-Locators encadenados.png', 
  fullPage: true 
});
    });

    test('Verificar que NO existe un elemento (negación)', async ({ page }) => {
    await page.goto('/');
    const mensajeVacio = page.getByText('No products found');
    await expect(mensajeVacio).not.toBeVisible();
      await page.screenshot({ 
  path: './evidencias/clase3/Test6-Verificar que NO existe un elemento.png', 
  fullPage: true 
});

    });

  test('RETO 1: Verificar botón "Place Order" por rol', async ({ page }) => {
    await page.goto('https://www.demoblaze.com/cart.html');
    await page.waitForLoadState('domcontentloaded');
    
    const placeOrderBtn = page.getByRole('button', { name: 'Place Order' });
    await expect(placeOrderBtn).toBeVisible();
    await expect(placeOrderBtn).toHaveText('Place Order');
    
    await page.screenshot({
      path: './evidencias/clase03/reto01-place-order.png',
      fullPage: true
    });
  });

test('RETO 2: Encontrar producto por nombre y leer su precio', async ({ page }) => {
  await page.goto('https://www.demoblaze.com');
  await page.waitForLoadState('domcontentloaded');

  // Buscar la tarjeta del producto por nombre exacto
  const producto = page.locator('.card').filter({ hasText: 'Samsung galaxy s6' });
  await expect(producto).toBeVisible();

  // Evidencia de la tarjeta
  await producto.screenshot({
    path: './evidencias/clase03/reto02-producto-filtrado.png'
  });

  // Ir al detalle del producto
  await producto.locator('.card-title a').click();
  await page.waitForLoadState('domcontentloaded');

  // Capturar el precio en la página de detalle
  const precioElement = page.locator('.price-container');
  await expect(precioElement).toBeVisible();

  const precioTexto = await precioElement.textContent();
  console.log(`💰 Precio: ${precioTexto?.trim()}`);
  expect(precioTexto).toMatch(/\d+/);

  // Evidencia del detalle
  await page.screenshot({
    path: './evidencias/clase03/reto02-detalle-producto.png',
    fullPage: true
  });
});

  test('RETO 3: Verificar categorías por atributo parcial', async ({ page }) => {
    await page.goto('https://www.demoblaze.com');
    await page.waitForLoadState('domcontentloaded');
    
    const categorias = page.locator('[onclick*="byCat"]');
    await expect(categorias).toHaveCount(3);
    
    const textos = await categorias.allTextContents();
    console.log('📋 Categorías encontradas:', textos);
    
    const categoriasEsperadas = ['Phones', 'Laptops', 'Monitors'];
    for (const categoria of categoriasEsperadas) {
      const existe = textos.some(texto => texto.trim() === categoria);
      expect(existe).toBeTruthy();
    }
    
    await page.screenshot({
      path: './evidencias/clase03/reto03-categorias.png',
      fullPage: true
    });
    
    // Verificar categorías individualmente
    const phones = page.locator('[onclick*="phone"]');
    const laptops = page.locator('[onclick*="notebook"]');
    const monitors = page.locator('[onclick*="monitor"]');
    
    await expect(phones).toBeVisible();
    await expect(laptops).toBeVisible();
    await expect(monitors).toBeVisible();
    
    await expect(phones).toHaveText('Phones');
    await expect(laptops).toHaveText('Laptops');
    await expect(monitors).toHaveText('Monitors');
  });


});