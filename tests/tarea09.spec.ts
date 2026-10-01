
import {
  test as base,
  expect,
  type Page
} from '@playwright/test';

import { mkdir } from 'node:fs/promises';


const carpetaEvidencias = './evidencias/tarea09';

async function guardarEvidencia(
  page: Page,
  nombre: string
) {

  await mkdir(carpetaEvidencias, {
    recursive: true
  });

  await page.screenshot({
    path: `${carpetaEvidencias}/${nombre}.png`,
    fullPage: true
  });

  console.log(`Evidencia guardada: ${nombre}.png`);
}

// RETO 1: FIXTURE CON TEARDOWN

type CronometroFixture = {
  cronometro: string;
};

const testTiempo = base.extend<CronometroFixture>({

  cronometro: async ({}, use) => {

    const inicio = Date.now();

    console.log('Cronómetro iniciado');

    try {

      await use('Cronómetro activo');

    } finally {

      const duracion = Date.now() - inicio;

      console.log(
        `Tiempo de ejecución: ${duracion} ms`
      );
    }
  }
});


testTiempo(
  'Reto 1 - Fixture con teardown',
  async ({ page, cronometro }) => {

    console.log(cronometro);

    await page.goto('https://www.saucedemo.com');

    await expect(
      page.locator('#login-button')
    ).toBeVisible();

    await guardarEvidencia(
      page,
      'reto1-teardown'
    );


    console.log('Prueba ejecutada correctamente');
  }
);

// RETO 2: FIXTURE CON ALCANCE WORKER

type WorkerFixtures = {
  contadorWorker: {
    valor: number;
  };
};

const testWorker = base.extend<{}, WorkerFixtures>({

  contadorWorker: [
    async ({}, use) => {

      const contador = {
        valor: 0
      };

      console.log('Fixture de worker inicializado');

      await use(contador);

      console.log(
        `Valor final del contador: ${contador.valor}`
      );
    },
    {
      scope: 'worker'
    }
  ]
});


testWorker.describe(
  'Reto 2 - Contador compartido por worker',
  () => {

    testWorker.describe.configure({
      mode: 'serial'
    });

    testWorker(
      'Contador aumenta a 1',
      async ({ page, contadorWorker }) => {

        contadorWorker.valor++;

        expect(contadorWorker.valor).toBe(1);

        console.log(
          `Contador: ${contadorWorker.valor}`
        );

        await page.setContent(`
          <html>
            <body style="
              font-family: Arial;
              text-align: center;
              margin-top: 100px;
            ">

              <h1>Reto 2: Fixture Worker</h1>

              <h2>Primera ejecución</h2>

              <h1>Contador: ${contadorWorker.valor}</h1>

              <p>Resultado: correcto</p>

            </body>
          </html>
        `);

        await guardarEvidencia(
          page,
          'reto2-contador-1'
        );
      }
    );

    testWorker(
      'Contador aumenta a 2',
      async ({ page, contadorWorker }) => {

        contadorWorker.valor++;

        expect(contadorWorker.valor).toBe(2);

        console.log(
          `Contador: ${contadorWorker.valor}`
        );


        await page.setContent(`
          <html>
            <body style="
              font-family: Arial;
              text-align: center;
              margin-top: 100px;
            ">

              <h1>Reto 2: Fixture Worker</h1>

              <h2>Segunda ejecución</h2>

              <h1>Contador: ${contadorWorker.valor}</h1>

              <p>Estado compartido correctamente</p>

            </body>
          </html>
        `);

        await guardarEvidencia(
          page,
          'reto2-contador-2'
        );
      }
    );

  }
);

// RETO 3: TEST.USE + PARAMETRIZACIÓN

const viewports = [
  {
    nombre: 'Movil',
    width: 375,
    height: 667,
    evidencia: 'reto3-movil'
  },
  {
    nombre: 'Escritorio',
    width: 1366,
    height: 768,
    evidencia: 'reto3-escritorio'
  }
];


for (const dispositivo of viewports) {

  base.describe(
    `Reto 3 - Vista ${dispositivo.nombre}`,
    () => {

      base.use({
        viewport: {
          width: dispositivo.width,
          height: dispositivo.height
        }
      });


      base(
        `Verificar login en ${dispositivo.nombre}`,
        async ({ page }) => {

          await page.goto('https://www.saucedemo.com');


          // Verificar resolución
          const tamaño = page.viewportSize();

          expect(
            tamaño?.width
          ).toBe(dispositivo.width);

          expect(
            tamaño?.height
          ).toBe(dispositivo.height);

          await expect(
            page.locator('#user-name')
          ).toBeVisible();

          await expect(
            page.locator('#password')
          ).toBeVisible();

          await expect(
            page.locator('#login-button')
          ).toBeVisible();

          await guardarEvidencia(
            page,
            dispositivo.evidencia
          );


          console.log(
            `Vista ${dispositivo.nombre} verificada`
          );
        }
      );

    }
  );

}
