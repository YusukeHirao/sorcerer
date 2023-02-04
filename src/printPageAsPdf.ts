import type { Page, PDFOptions } from 'puppeteer';

import fs from 'node:fs/promises';
import path from 'node:path';

import dayjs from 'dayjs';

import { delay } from './delay.js';
import { removeAuth } from './removeAuth.js';
import { scrollAllOver } from './scrollAllOver.js';
import { urlToFileName } from './urlToFileName.js';

let globalIncrementalId = 0;

interface Options {
  id?: number;
  fileName?: string;
  fileNamePrefix?: string;
  fileNameSuffix?: string;
  outDir?: string;
  note?: boolean;
  width?: number;
  height?: number;
  resolution?: number;
  listener?(message: string): void;
}

export async function printPageAsPdf(page: Page, options?: Options) {
  const id = options?.id ?? globalIncrementalId++;
  const readableId = id.toString(10).padEnd(3, '0');
  const currentUrl = page.url();
  const urlWithoutAuth = removeAuth(currentUrl);
  const urlAsFileName = urlToFileName(currentUrl);
  const prefix = options?.fileNamePrefix ?? '';
  const suffix = options?.fileNameSuffix ?? '';
  const fileName =
    options?.fileName ?? `${readableId}_${prefix}${urlAsFileName}${suffix}.pdf`;
  const outDir = options?.outDir ?? process.cwd();
  const fullPath = path.resolve(outDir, fileName);

  options?.listener?.('Resize the viewport');

  await page.setViewport({
    width: options?.width ?? 1200,
    height: options?.height ?? 600,
    deviceScaleFactor: options?.resolution ?? 1,
  });

  await delay(1000);

  options?.listener?.('Reload');

  await page.reload({ waitUntil: 'networkidle0' });

  options?.listener?.('Get a page title');

  const title = await page.evaluate(() => document.title);

  options?.listener?.('Scrolling%dots%');

  await scrollAllOver(page);

  options?.listener?.('Screenshot');

  await page.screenshot({
    path: fullPath + '.png',
    fullPage: true,
  });

  options?.listener?.('Open the screenshot image%dots%');

  await page.goto(`file://${fullPath}.png`, { waitUntil: 'networkidle0' });

  let noteSettings: PDFOptions = {};

  if (options?.note ?? true) {
    options?.listener?.('Create a note space');

    await page.evaluate(() => {
      const style = document.createElement('style');
      style.innerText = `
      html, body { height: auto !important; }
      html, body { margin: 0; padding: 0; }
      img { width: 100% !important; height: auto !important; }
    `;
      document.body.setAttribute('style', 'margin: 0; padding: 0;');
      document.head.appendChild(style);
    });

    const datetime = dayjs().format('YYYY-MM-DD HH:mm');

    noteSettings = {
      displayHeaderFooter: true,
      margin: { top: '1.3cm', bottom: '1cm', left: '1cm', right: '5cm' },
      headerTemplate: `
        <div style="font-size: 2mm; width: 100%; display: flex; justify-content: space-between; margin: 0 1cm; font-family: sans-serif;">
          <div>
            <div>Title: ${title}</div>
            <div style="font-size: 0.6em">Printed: ${datetime}</div>
          </div>
          <div>
            <div style="font-size: 3mm; margin-bottom: 1mm; text-align: right;">[ID: ${readableId}]</div>
            <div style="text-align: right;">Note:</div>
          </div>
        </div>`,
      footerTemplate: `
        <div style="font-size: 2mm; width: 100%; display: flex; justify-content: space-between; margin: 0 1cm; font-family: monospace;">
          <div>
            <span>[ID: ${readableId}] ${urlWithoutAuth}</span>
          </div>
          <div>
            <span class="pageNumber"></span>/<span class="totalPages"></span>
          </div>
        </div>`,
    };
  }

  options?.listener?.('Print as a PDF%dots%');

  await page.pdf({
    path: fullPath,
    timeout: 30000 * 10, // Default * 10
    format: 'A4',
    printBackground: true,
    margin: { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' },
    ...noteSettings,
  });

  options?.listener?.('Remove the screenshot image');

  await fs.rm(fullPath + '.png');

  options?.listener?.('Back to the target page');

  await page.goto(currentUrl, { waitUntil: 'networkidle0' });

  options?.listener?.('Done');
}
