
import { test, expect } from '@playwright/test';

const BASE_URL = 'https://practice.expandtesting.com';

test('Reto 1 - Medir frecuencia de errores en Typos', async ({ page }, testInfo) => {
  test.setTimeout(90000);

  let errores = 0;
  const totalRecargas = 12;
  const textoEsperado = "Sometimes you'll see a typo, other times you won't.";

  await page.goto(`${BASE_URL}/typos`, {
    waitUntil: 'domcontentloaded'
  });

  for (let i = 1; i <= totalRecargas; i++) {
    await page.reload({
      waitUntil: 'domcontentloaded'
    });

    const contenido = await page.locator('main').innerText();
    const textoCorrecto = contenido.includes(textoEsperado);

    if (!textoCorrecto) {
      errores++;
      console.log(`Recarga ${i}: typo detectado`);
    } else {
      console.log(`Recarga ${i}: texto correcto`);
    }
  }

  const porcentaje = (errores / totalRecargas) * 100;

  const resultado = [
    'RETO 1 - DEFECTO INTERMITENTE',
    `Página: ${BASE_URL}/typos`,
    `Recargas realizadas: ${totalRecargas}`,
    `Errores detectados: ${errores}`,
    `Frecuencia: ${porcentaje.toFixed(2)}%`
  ].join('\n');

  console.log(resultado);

  await testInfo.attach('frecuencia-typos', {
    body: resultado,
    contentType: 'text/plain'
  });

  testInfo.annotations.push({
    type: 'frecuencia',
    description: `${errores} de ${totalRecargas} recargas`
  });

  expect(errores).toBeGreaterThanOrEqual(0);
  expect(errores).toBeLessThanOrEqual(totalRecargas);
});


test.fixme(
  'Reto 2 - Verificar que Typos no contiene errores',
  {
    annotation: {
      type: 'issue',
      description: 'Defecto intermitente en /typos'
    }
  },
  async ({ page }) => {
    await page.goto(`${BASE_URL}/typos`);

    await expect(
      page.locator('main')
    ).toContainText(
      "Sometimes you'll see a typo, other times you won't."
    );
  }
);


test.describe('Reto 3 - Reporte automático de defecto', () => {

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.errors.length > 0) {
      const errores = testInfo.errors
        .map(error => error.message)
        .join('\n\n');

      const reporte = [
        '# Borrador de reporte de defecto',
        '',
        `## Título`,
        testInfo.title,
        '',
        '## Ambiente',
        `Navegador: ${testInfo.project.name}`,
        `Aplicación: ${BASE_URL}`,
        '',
        '## URL',
        page.url(),
        '',
        '## Resultado obtenido',
        'La validación detectó imágenes que no cargaron.',
        '',
        '## Detalle del error',
        '```text',
        errores,
        '```'
      ].join('\n');

      await testInfo.attach('borrador-bug-report.md', {
        body: reporte,
        contentType: 'text/markdown'
      });

      console.log('Borrador Markdown adjuntado al reporte');
    }
  });

  test('Reto 3 - Detectar imágenes rotas y documentar error', async ({ page }) => {
    test.fail(true, 'BUG-001: imágenes rotas en /broken-images');

    await page.goto(`${BASE_URL}/broken-images`, {
      waitUntil: 'domcontentloaded'
    });

    const imagenes = page.locator('main img');

    await expect(imagenes.first()).toBeVisible();

    await expect.poll(async () => {
      return imagenes.evaluateAll(imgs =>
        imgs.every(img => (img as HTMLImageElement).complete)
      );
    }, {
      timeout: 15000
    }).toBe(true);

    const anchos = await imagenes.evaluateAll(imgs =>
      imgs.map(img => (img as HTMLImageElement).naturalWidth)
    );

    expect(anchos.length).toBeGreaterThan(0);

    for (const ancho of anchos) {
      expect(ancho).toBeGreaterThan(0);
    }
  });

});
