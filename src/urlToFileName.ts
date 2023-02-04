import { removeAuth } from './removeAuth.js';

/**
 * Convert an URL to the string that is available as a file name
 *
 * @param url
 * @returns A file name
 */
export function urlToFileName(url: string) {
  const urlWithoutAuth = removeAuth(url);
  const fileName = urlWithoutAuth
    .replace(/\[ID: ([a-z0-9][a-z0-9_-]*)\]/gi, '[$1]')
    .replace(/https?:\/\//i, '')
    .replace(/\s+/i, '')
    .replace(/\?/gi, '+')
    .replace(/\/+/gi, '_');
  return fileName;
}
