#!/usr/bin/env node

import { Dealer } from '@yusukehirao/dealer';
import meow from 'meow';
import puppeteer from 'puppeteer';

import { delay } from '../esm/delay.js';
import { printMultiplePages } from '../esm/printMultiplePages.js';

const result = meow(
  `Options:
    --print, -p    It accepts an URL then it prints the site to PDF.
    --outDir, -o   Output destination.
    --headless     Headless mode of Puppeteer.
`,
  {
    importMeta: import.meta,
    flags: {
      print: {
        type: 'string',
        alias: 'p',
        isMultiple: true,
      },
      headless: {
        type: 'boolean',
        default: true,
      },
    },
  }
);

if (result.flags.print) {
  const dealer = new Dealer();
  dealer.push(0, 'Browser is booting%dots%');
  const browser = await puppeteer.launch({ headless: result.flags.headless });
  dealer.push(0, 'Browser is running🏃');
  dealer.close();
  await delay(300);

  await printMultiplePages(browser, result.flags.print);

  process.exit(0);
}

result.showHelp(1);
