import type { Page } from 'puppeteer';

import { delay } from './delay.js';

export async function scrollAllOver(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight || totalHeight >= 100000) {
          clearInterval(timer);
          window.scrollBy(0, 0);
          resolve();
        }
      }, 300);
    });
  });
  await delay(500);
}
