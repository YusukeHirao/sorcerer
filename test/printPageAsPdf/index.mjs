import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { jest, describe, beforeAll, afterAll, it, expect } from '@jest/globals';

import { printPageAsPdf } from '../../esm/printPageAsPdf.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

jest.setTimeout(60 * 1000);

describe('Basic', () => {
  const filePath = path.resolve(__dirname, 'd-zero.pdf');

  beforeAll(async () => {
    await page.goto('https://www.d-zero.co.jp');
  });

  afterAll(async () => {
    (await fs.stat(filePath)).isFile() && (await fs.rm(filePath));
  });

  it('creates a PDF file', async () => {
    const messages = [];

    await printPageAsPdf(page, {
      out: filePath,
      listener: (message) => messages.push(message),
    });

    expect(messages).toStrictEqual([
      'Resize the viewport',
      'Reload',
      'Get a page title',
      'Scrolling%dots%',
      'Screenshot',
      'Open the screenshot image%dots%',
      'Create a note space',
      'Print as a PDF%dots%',
      'Remove the screenshot image',
      'Back to the target page',
      'Done',
    ]);
  });
});
