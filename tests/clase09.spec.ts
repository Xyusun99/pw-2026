
import { test, expect } from '../fixtures';
import { mkdir } from 'node:fs/promises';

const carpetaEvidencias = './evidencias/clase09';

async function guardarEvidencia(
  page: import('@playwright/test').Page,
  nombre: string
) {

  await mkdir(carpetaEvidencias, {
    recursive: true
  });

  await page.screenshot({
    path: `${carpetaEvidencias}/clase09-${nombre}.png`,
    fullPage: true
  });

  console.log(`Evidencia guardada: clase09-${nombre}.png`);
}


test.describe('Clase 09 - Fixtures y datos de prueba', () => {

  // TEST 1
  test(
    'Usando fixture de login: verificar inventario',
    async ({ inventoryPage, page }) => {

      const count = await inventoryPage.getProductCount();

      expect(count).toBe(6);

      console.log(`Inventario tiene ${count} productos`);

   
      await guardarEvidencia(
        page,
        'inventario'
      );
    }
  );


  // TEST 2
  test(
    'Usando fixture de carrito: verificar que hay 1 item',
    async ({ cartPage, page }) => {

      const count = await cartPage.getItemCount();

      expect(count).toBe(1);

      console.log(`Carrito tiene ${count} item`);

    
      await guardarEvidencia(
        page,
        'carrito'
      );
    }
  );


  // TEST 3
  test(
    'Usando fixture de loginPage: login manual en el test',
    async ({ loginPage, page }) => {

      await loginPage.login(
        'standard_user',
        'secret_sauce'
      );

      await expect(page).toHaveURL(/inventory/);

      await guardarEvidencia(
        page,
        'login-manual'
      );
    }
  );

});


const usuariosDeLogin = [
  {
    username: 'standard_user',
    password: 'secret_sauce',
    esperadoURL: /inventory/,
    descripcion: 'usuario estándar puede ingresar',
    evidencia: 'login-estandar'
  },
  {
    username: 'locked_out_user',
    password: 'secret_sauce',
    esperadoURL: null,
    descripcion: 'usuario bloqueado no puede ingresar',
    evidencia: 'login-bloqueado'
  },
  {
    username: '',
    password: '',
    esperadoURL: null,
    descripcion: 'campos vacíos muestran error',
    evidencia: 'login-vacio'
  }
];


test.describe(
  'Clase 09 - Tests parametrizados de login',
  () => {

    for (const datos of usuariosDeLogin) {

      test(
        `Login: ${datos.descripcion}`,
        async ({ page }) => {

          await page.goto('https://www.saucedemo.com');

          await page
            .locator('#user-name')
            .fill(datos.username);

          await page
            .locator('#password')
            .fill(datos.password);

          await page
            .locator('#login-button')
            .click();


          if (datos.esperadoURL) {

            await expect(page).toHaveURL(
              datos.esperadoURL
            );

            console.log(
              `${datos.descripcion}: acceso correcto`
            );

          } else {

            const error = page.locator(
              '[data-test="error"]'
            );

            await expect(error).toBeVisible();

            console.log(
              `${datos.descripcion}: error mostrado`
            );
          }


          await guardarEvidencia(
            page,
            datos.evidencia
          );
        }
      );
    }

  }
);


const productosAVerificar = [
  {
    nombre: 'Sauce Labs Backpack',
    evidencia: 'producto-backpack'
  },
  {
    nombre: 'Sauce Labs Bike Light',
    evidencia: 'producto-bike-light'
  },
  {
    nombre: 'Sauce Labs Bolt T-Shirt',
    evidencia: 'producto-bolt-tshirt'
  }
];


test.describe(
  'Clase 09 - Agregar productos al carrito (parametrizado)',
  () => {

    test.beforeEach(async ({ page }) => {

      await page.goto('https://www.saucedemo.com');

      await page
        .locator('#user-name')
        .fill('standard_user');

      await page
        .locator('#password')
        .fill('secret_sauce');

      await page
        .locator('#login-button')
        .click();

      await expect(page).toHaveURL(/inventory/);
    });


    for (const datos of productosAVerificar) {

      test(
        `Agregar "${datos.nombre}" al carrito`,
        async ({ page }) => {

          const producto = page.locator(
            '.inventory_item',
            { hasText: datos.nombre }
          );

          await producto
            .locator('.btn_inventory')
            .click();

          await expect(
            page.locator('.shopping_cart_badge')
          ).toBeVisible();

          await page
            .locator('.shopping_cart_link')
            .click();

          await expect(
            page.locator(
              '.inventory_item_name',
              { hasText: datos.nombre }
            )
          ).toBeVisible();

          console.log(
            `"${datos.nombre}" verificado en carrito`
          );

          await guardarEvidencia(
            page,
            datos.evidencia
          );
        }
      );
    }

  }
);
