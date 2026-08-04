import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

// --- Configuración inicial: Crear carpeta de evidencias ---
test.beforeAll(() => {
  const folders = ['./evidencias', './evidencias/clase04'];
  folders.forEach(folder => {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  });
});

// --- Datos de usuario dinámicos ---
const usuario = {
  username: `testuser_${Date.now().toString().slice(-6)}`,
  password: 'Password123'
};

// --- Función Auxiliar: loginConReintento SIMPLIFICADA ---
async function loginConReintento(page: Page, username: string, password: string, intentos = 3) {
  for (let i = 0; i < intentos; i++) {
    try {
      console.log(`🔍 Intento ${i + 1}/${intentos} de login...`);

      // 1. Hacer clic en "Log in"
      await page.locator('#navbarExample')
        .getByRole('link', { name: 'Log in', exact: true })
        .click();

      // 2. Esperar a que el modal esté visible
      await page.waitForSelector('#logInModal', { state: 'visible', timeout: 5000 });
      
      // 3. Esperar a que el contenido del modal esté listo
      await page.waitForSelector('#loginusername', { state: 'visible', timeout: 3000 });
      await page.waitForSelector('#loginpassword', { state: 'visible', timeout: 3000 });
      
      console.log('✅ Modal de login visible y campos disponibles');

      // 4. Llenar credenciales
      await page.locator('#loginusername').fill(username);
      await page.locator('#loginpassword').fill(password);
      console.log('✅ Credenciales ingresadas');

      // 5. Método 1: Buscar por texto exacto
      const botonPorTexto = page.getByRole('button', { name: 'Log in' });
      
      // 6. Método 2: Buscar por selector CSS (cualquier botón dentro del modal con texto "Log in")
      const botonPorSelector = page.locator('#logInModal button:has-text("Log in")');
      
      // 7. Intentar con ambos métodos
      let loginButton = null;
      
      try {
        // Intentar con getByRole primero
        await botonPorTexto.waitFor({ state: 'visible', timeout: 2000 });
        loginButton = botonPorTexto;
        console.log('✅ Botón "Log in" encontrado por getByRole');
      } catch {
        try {
          // Si falla, intentar con selector CSS
          await botonPorSelector.waitFor({ state: 'visible', timeout: 2000 });
          loginButton = botonPorSelector;
          console.log('✅ Botón "Log in" encontrado por selector CSS');
        } catch {
          console.log('❌ No se encontró el botón "Log in"');
          throw new Error('Botón "Log in" no encontrado');
        }
      }

      // 8. Hacer clic en el botón
      await loginButton.click({ force: true });
      console.log('✅ Click en Log in realizado');

      // 9. Esperar el resultado
      try {
        await page.waitForSelector('#nameofuser', { state: 'visible', timeout: 5000 });
        console.log(`✅ Login exitoso en intento ${i + 1}`);
        return; // ¡Login exitoso!
      } catch {
        console.log(`⚠️ Login intento ${i + 1}/${intentos} falló`);
        // Cerrar el modal si está abierto
        try {
          await page.keyboard.press('Escape');
          await page.waitForTimeout(1000);
        } catch (e) {
          // Ignorar
        }
      }
    } catch (error : any) {
      console.log(`❌ Error en intento ${i + 1}: ${error.message}`);
      // Intentar cerrar el modal
      try {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
      } catch (e) {
        // Ignorar
      }
    }
  }
  throw new Error(`No se pudo iniciar sesión con ${username} tras ${intentos} intentos`);
}

// --- BLOQUE DE TESTS ---
test.describe.serial('Clase 04 - Flujo completo de usuario en DemoBlaze', () => {

  // 1. TEST: Registrar un nuevo usuario
  test('Registrar un nuevo usuario', async ({ page }) => {
    console.log(`📝 Registrando usuario: ${usuario.username}`);
    
    await page.goto('https://www.demoblaze.com');
    await page.waitForLoadState('domcontentloaded');

    // Abrir modal de registro
    await page.locator('#navbarExample')
      .getByRole('link', { name: 'Sign up', exact: true })
      .click();
    await page.waitForSelector('#signInModal', { state: 'visible', timeout: 5000 });

    // Llenar formulario
    await page.locator('#sign-username').fill(usuario.username);
    await page.locator('#sign-password').fill(usuario.password);

    // Evidencia: Formulario lleno
    await page.locator('#signInModal')
      .screenshot({ path: './evidencias/clase04/registro-llenado.png' });

    // Manejar el alert de confirmación
    const dialogPromise = new Promise<void>((resolve) => {
      page.once('dialog', async (dialog) => {
        console.log(`✅ Alert de registro: ${dialog.message()}`);
        await dialog.accept();
        resolve();
      });
    });

    // Click en "Sign up"
    await page.locator('#signInModal')
      .getByRole('button', { name: 'Sign up' })
      .click();

    await dialogPromise;
    console.log(`✅ Usuario ${usuario.username} registrado correctamente.`);
    
    // Esperar a que el modal de registro se cierre automáticamente
    await page.waitForSelector('#signInModal', { state: 'hidden', timeout: 5000 });
    console.log('✅ Modal de registro cerrado automáticamente');
    
    // Espera para propagación del usuario
    console.log('⏳ Esperando 5 segundos para que el usuario se propague...');
    await page.waitForTimeout(5000);
  });

  // 2. TEST: Login con el usuario registrado
  test('Login con el usuario registrado', async ({ page }) => {
    console.log(`🔑 Intentando login con: ${usuario.username}`);
    
    // Manejador para posibles alerts
    page.on('dialog', async (dialog) => {
      console.log(`⚠️ Dialog: ${dialog.message()}`);
      await dialog.accept();
    });

    await page.goto('https://www.demoblaze.com');
    await page.waitForLoadState('domcontentloaded');
    
    await loginConReintento(page, usuario.username, usuario.password);

    // Verificar que el login fue exitoso
    const nombreUsuario = await page.locator('#nameofuser').textContent();
    expect(nombreUsuario).toContain(usuario.username);
    console.log(`✅ Login exitoso como: ${nombreUsuario}`);
    
    // Evidencia: Login exitoso
    await page.screenshot({ path: './evidencias/clase04/login-exitoso.png', fullPage: true });
  });

  // 3. TEST: Flujo completo: login -> agregar producto -> verificar carrito
  test('Flujo completo: login -> agregar producto -> verificar carrito', async ({ page }) => {
    console.log('🛒 Iniciando flujo completo de compra...');
    
    // Manejador para el alert "Product added"
    page.on('dialog', async (dialog) => {
      console.log(`✅ Alert: ${dialog.message()}`);
      await dialog.accept();
    });

    await page.goto('https://www.demoblaze.com');
    await page.waitForLoadState('domcontentloaded');
    
    await loginConReintento(page, usuario.username, usuario.password);

    // Seleccionar primer producto
    await page.waitForSelector('.card-title a', { timeout: 10000 });
    const primerProducto = page.locator('.card-title a').first();
    const nombreProducto = await primerProducto.textContent();
    console.log(`📱 Producto seleccionado: ${nombreProducto}`);
    
    await primerProducto.click();
    await page.waitForLoadState('domcontentloaded');

    // Agregar al carrito
    await page.getByText('Add to cart').click();
    console.log('🛒 Producto agregado al carrito');
    await page.waitForTimeout(2000);

    // Ir al carrito
    await page.locator('#navbarExample')
      .getByRole('link', { name: 'Cart', exact: true })
      .click();
    await page.waitForURL('**/cart.html');
    await page.waitForTimeout(1500);

    // Verificar
    const itemsCarrito = page.locator('#tbodyid tr');
    const cantidadItems = await itemsCarrito.count();
    expect(cantidadItems).toBeGreaterThanOrEqual(1);

    console.log(`✅ Flujo completo exitoso. Producto "${nombreProducto}" en carrito.`);
    console.log(`   Items en carrito: ${cantidadItems}`);

    await page.screenshot({
      path: './evidencias/clase04/carrito-con-producto.png',
      fullPage: true
    });
  });

  // 4. TEST: Login con credenciales incorrectas
  test('Intentar login con credenciales incorrectas', async ({ page }) => {
    console.log('🔑 Intentando login con credenciales incorrectas...');
    
    await page.goto('https://www.demoblaze.com');
    await page.waitForLoadState('domcontentloaded');

    // Abrir modal de login
    await page.locator('#navbarExample')
      .getByRole('link', { name: 'Log in', exact: true })
      .click();
    await page.waitForSelector('#logInModal', { state: 'visible', timeout: 5000 });
    await page.waitForSelector('#loginusername', { state: 'visible', timeout: 3000 });

    // Ingresar credenciales incorrectas
    await page.locator('#loginusername').fill('usuario_que_no_existe');
    await page.locator('#loginpassword').fill('password_incorrecta');

    // Manejar alert de error
    const dialogPromise = new Promise<string>((resolve) => {
      page.once('dialog', async (dialog) => {
        await dialog.accept();
        resolve(dialog.message());
      });
    });

    // Buscar y hacer clic en "Log in" - usando múltiples estrategias
    try {
      await page.getByRole('button', { name: 'Log in' }).click({ force: true });
    } catch {
      await page.locator('#logInModal button:has-text("Log in")').click({ force: true });
    }

    const mensajeAlert = await dialogPromise;
    expect(mensajeAlert).toBeTruthy();
    console.log(`❌ Error mostrado: ${mensajeAlert}`);

    // Verificar que NO se inició sesión
    const usuarioLogueado = page.locator('#nameofuser');
    await expect(usuarioLogueado).not.toBeVisible();
    console.log('✅ Verificado: No hay usuario logueado');
  });

  // --- TESTS RETO (Tarea 04) ---

  // RETO 1: Formulario "Place Order"
  test('RETO 1: Llenar formulario Place Order y verificar botón Purchase', async ({ page }) => {
    console.log('📝 Probando formulario Place Order...');
    
    await page.goto('https://www.demoblaze.com/cart.html');
    await page.waitForLoadState('domcontentloaded');

    // Verificar que hay productos en el carrito
    const itemsExistentes = await page.locator('#tbodyid tr').count();
    if (itemsExistentes === 0) {
      console.log('⚠️ Carrito vacío, agregando un producto...');
      await page.goto('https://www.demoblaze.com');
      await page.waitForLoadState('domcontentloaded');
      await page.locator('.card-title a').first().click();
      await page.waitForLoadState('domcontentloaded');
      
      page.on('dialog', async (dialog) => {
        await dialog.accept();
      });
      
      await page.getByText('Add to cart').click();
      await page.waitForTimeout(2000);
      await page.locator('#navbarExample')
        .getByRole('link', { name: 'Cart', exact: true })
        .click();
      await page.waitForURL('**/cart.html');
    }

    // Hacer clic en "Place Order"
    await page.getByRole('button', { name: 'Place Order' }).click();
    await page.waitForSelector('#orderModal', { state: 'visible', timeout: 5000 });

    // Llenar el formulario con fill()
    await page.locator('#name').fill('Bagner Ojeda');
    await page.locator('#country').fill('Guatemala');
    await page.locator('#city').fill('Ciudad de Guatemala');
    await page.locator('#card').fill('4111111111111111');
    await page.locator('#month').fill('12');
    await page.locator('#year').fill('2028');

    // Evidencia del formulario lleno
    await page.screenshot({ path: './evidencias/clase04/reto1-place-order-llenado.png', fullPage: true });

    // Verificar que el botón "Purchase" está visible
    const purchaseBtn = page.getByRole('button', { name: 'Purchase' });
    await expect(purchaseBtn).toBeVisible();
    console.log('✅ RETO 1: Formulario Place Order llenado y botón Purchase visible.');
  });

  // RETO 2: Cerrar un modal
  test('RETO 2: Cerrar el modal de login con su botón Close (.last())', async ({ page }) => {
    console.log('🔚 Probando cierre de modal...');
    
    await page.goto('https://www.demoblaze.com');
    await page.waitForLoadState('domcontentloaded');

    // Abrir modal de login
    await page.locator('#navbarExample')
      .getByRole('link', { name: 'Log in', exact: true })
      .click();
    await page.waitForSelector('#logInModal', { state: 'visible', timeout: 5000 });
    await page.waitForSelector('#loginusername', { state: 'visible', timeout: 3000 });

    // Evidencia del modal abierto
    await page.screenshot({ path: './evidencias/clase04/reto2-modal-abierto.png', fullPage: true });

    // Buscar el botón "Close". Usamos .last() para seleccionar el del footer
    const closeButton = page.locator('#logInModal').getByRole('button', { name: 'Close' }).last();
    await closeButton.click();

    // Verificar que el modal se cerró
    await expect(page.locator('#logInModal')).not.toBeVisible();
    console.log('✅ RETO 2: Modal de login cerrado correctamente con .last().');
  });

  // RETO 3: clear()
  test('RETO 3: Usar clear() para limpiar un campo y verificar con inputValue()', async ({ page }) => {
    console.log('🧹 Probando clear()...');
    
    await page.goto('https://www.demoblaze.com');
    await page.waitForLoadState('domcontentloaded');

    // Abrir modal de login
    await page.locator('#navbarExample')
      .getByRole('link', { name: 'Log in', exact: true })
      .click();
    await page.waitForSelector('#logInModal', { state: 'visible', timeout: 5000 });
    await page.waitForSelector('#loginusername', { state: 'visible', timeout: 3000 });

    const usernameField = page.locator('#loginusername');
    
    // 1. Llenar el campo
    await usernameField.fill('texto de prueba');
    let valor = await usernameField.inputValue();
    expect(valor).toBe('texto de prueba');
    console.log(`✅ Campo llenado con: "${valor}"`);

    // Evidencia: Campo lleno
    await page.screenshot({ path: './evidencias/clase04/reto3-campo-lleno.png', fullPage: true });

    // 2. Usar clear() para borrar
    await usernameField.clear();
    
    // 3. Verificar que quedó vacío con inputValue()
    valor = await usernameField.inputValue();
    expect(valor).toBe('');
    console.log(`✅ Campo vaciado con clear(). Valor actual: "${valor}"`);

    // Evidencia: Campo vacío
    await page.screenshot({ path: './evidencias/clase04/reto3-campo-vacio.png', fullPage: true });
  });

});