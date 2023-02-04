import type { Page } from 'puppeteer';

import { delay } from './delay.js';

type Result =
  | {
      success: true;
    }
  | {
      success: false;
      errorLog: string;
    };

export async function gotoPage(
  page: Page,
  url: string,
  listener?: (type: string) => void
): Promise<Result> {
  let retryCount = 0;
  /**
   * @type {Response | Error}
   */
  let res;
  const retryStack = [];
  while (retryCount <= 4) {
    retryCount += 1;
    listener?.(`open%dots%`);
    res = await page.goto(url, { waitUntil: 'networkidle0' }).catch((e) => e);
    if (!(res instanceof Error) && res.status() < 400) {
      break;
    }
    retryStack.push(res);
    const wait = 1000 * Math.pow(2, retryCount - 1);
    const waitSecond = Math.round(wait / 1000);
    const coundDownId = url + '__COUNT_DOWN__' + retryCount;
    const countUnit = `time${retryCount > 1 ? 's' : ''}`;
    listener?.(
      `Retry ${retryCount} ${countUnit}: Wait %countDown(${wait},${coundDownId},s)%/${waitSecond}s`
    );
    await delay(wait);
  }
  if (retryStack.length) {
    const errorLog = retryStack
      .map((res) => {
        if (res instanceof Error) {
          return res.stack ?? res.message;
        }
        let log = `${res.status()} ${res.statusText()}`;
        if (res.headers) {
          log += `\n${Array.from(Object.entries(res.headers()))
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n')}`;
        }
        return log;
      })
      .join('\n\n');

    listener?.(`failed`);
    return {
      success: false,
      errorLog,
    };
  }

  listener?.(`succeed`);
  return {
    success: true,
  };
}
