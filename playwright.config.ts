import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000, // tiempo máximo por test
  retries: 1,     // reintentar tests fallidos 1 vez
  
  use: {
    baseURL: 'https://www.demoblaze.com',
    headless: false,  // ¡CAMBIO! false para ver el navegador mientras se ejecuta
    

    // CONFIGURACIÓN DE EVIDENCIAS
    screenshot: 'on',      // siempre tomar capturas
    video: {
      mode: 'on',          // grabar video de cada test
      size: { width: 1280, height: 720 }  // tamaño del video
    },
    trace: 'on',           // guardar trazas
    
    // ¡CONFIGURACIÓN PARA HACER EL VIDEO MÁS LENTO!
    launchOptions: {
      slowMo: 500  // 500ms de pausa entre acciones - ¡más fácil de seguir!
    }
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
});