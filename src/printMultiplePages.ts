import type { Browser } from 'puppeteer';

import { Dealer } from '@yusukehirao/dealer';
import c from 'ansi-colors';

import { delay } from './delay.js';
import { gotoPage } from './gotoPage.js';
import { printPageAsPdf } from './printPageAsPdf.js';

const FPS = 12;
const HEADER_PROGRESS_ICON = c.bold.blueBright('-');
const HEADER_COMPLETE_ICON = c.blueBright('✔');
const PROGRESS_ICON = '%propeller%';
const SUCCEED_ICON = c.greenBright('✔');
const FAILED_ICON = c.red('✘');
const URL_BEFORE_SPACE = ' '.repeat(2);
const INDENT = ' '.repeat(2);

interface Options {
  outDir?: string;
  sizes?: {
    name: string;
    width?: number;
    height?: number;
    resolution?: number;
  }[];
}

export async function printMultiplePages(
  browser: Browser,
  urlList: string[],
  options?: Options
) {
  const dealer = new Dealer({
    fps: FPS,
    indent: INDENT,
  });

  const urlMaxLength = urlList.reduce((a, b) => Math.max(a, b.length), 0);

  const sizes = options?.sizes ?? [
    {
      name: 'Desktop',
    },
    {
      name: 'Mobile',
      width: 320,
      resolution: 2,
    },
  ];

  const nextFrame = () => delay(1000 / FPS);

  dealer.header(`${HEADER_PROGRESS_ICON} Print pages%dots%`);

  await Promise.all(
    urlList.map(async (url, id) => {
      const displayUrl = url.padEnd(urlMaxLength);

      const page = await browser.newPage();

      const res = await gotoPage(page, url, (type) => {
        dealer.push(
          id,
          `${PROGRESS_ICON} ${displayUrl}${URL_BEFORE_SPACE}${type}`
        );
      });
      if (!res.success) {
        const errorMsgFirstLine = res.errorLog.split(/\n+/m)[0];
        const displayError = c.red(errorMsgFirstLine);
        dealer.push(
          id,
          `${FAILED_ICON} ${displayUrl}${URL_BEFORE_SPACE}${displayError}`
        );
        return;
      }

      for (const size of sizes) {
        const sizeName = c.bold.black.bgBlueBright(` ${size.name} `);
        await printPageAsPdf(page, {
          id,
          fileNameSuffix: `__${size.name.toLowerCase()}`,
          outDir: options?.outDir,
          width: size.width,
          height: size.height,
          resolution: size.resolution,
          listener(type) {
            const icon = type === 'Done' ? SUCCEED_ICON : PROGRESS_ICON;
            dealer.push(
              id,
              `${icon} ${displayUrl}${URL_BEFORE_SPACE}${sizeName} ${type}`
            );
          },
        });
      }

      await nextFrame();

      const sizeList = sizes
        .map((s) => c.bold.black.bgBlueBright(` ${s.name} `))
        .join(', ');
      dealer.push(
        id,
        `${SUCCEED_ICON} ${displayUrl}${URL_BEFORE_SPACE}${sizeList} Complete`
      );

      await nextFrame();
    })
  );
  dealer.header(`${HEADER_COMPLETE_ICON} Print pages: complete`);
  await nextFrame();
}
