const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // 3.1: Abrir la página de Trello y extraer la lista de tareas
  await page.goto('https://trello.com/b/QvHVksDa/personal-work-goals', { timeout: 600000 });
  const tasks = await page.evaluate(() => {
    const taskElements = document.querySelectorAll('.list-card-title');
    console.log(taskElements)
    return Array.from(taskElements, element => element.textContent.trim());
  });

  // 3.2: Iniciar sesión en todoist.com (necesitarás tus credenciales)
  await page.goto('https://todoist.com/auth/login', { timeout: 600000 }); 
  //await page.waitForSelector('a.ga-get-started-button');
  //await page.click('a.ga-get-started-button');
  await page.waitForSelector('#element-0');
  await page.type('#element-0', 'carlosespherrera@hotmail.com');
  await page.type('#element-3', 'ironman43');
  await page.click('button[type="submit"]');
  await page.waitForNavigation();

  // 3.3: Agregar 5 tareas de la lista obtenida en el paso 3.1 a Todoist
  const tasksToAdd = tasks.slice(0, 5);
  for (const task of tasksToAdd) {
    await page.goto('https://todoist.com', { timeout: 600000 });

    // Esperar a que el botón "Añadir tarea" esté presente y sea interactuable
    await page.waitForSelector('button[data-track="navigation|quick_add"]', { timeout: 10000 });

    // Esperar un momento antes de hacer clic
    await page.waitForTimeout(1000);

    const addButton = await page.$('button[data-track="navigation|quick_add"]');
    if (addButton) {
      try {
        await addButton.click();
        await page.waitForSelector('div[aria-label="Nombre de la tarea"]');
        const taskInput = await page.$('div[aria-label="Nombre de la tarea"]');
        if (taskInput) {
          await taskInput.click();
          await page.type('div[aria-label="Nombre de la tarea"]', task, { delay: 100 });
          await page.keyboard.press('Enter');
          await page.waitForTimeout(10000); // Esperar un segundo antes de agregar la siguiente tarea
        } else {
          console.error('No se encontró el campo de entrada de tarea.');
        }
      } catch (error) {
        console.error('Error al hacer clic en el botón "Añadir tarea":', error);
      }
    } else {
      console.error('No se encontró el botón "Añadir tarea".');
    }
  }

  await browser.close();
})();





