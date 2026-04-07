import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Fetches and parses Open Graph + meta tags from a URL
 */
export async function enrichUrl(url) {
  const result = {
    url,
    title: null,
    description: null,
    thumbnail_url: null,
    favicon_url: null,
    domain: null,
  };

  try {
    const parsedUrl = new URL(url);
    result.domain = parsedUrl.hostname;
    result.favicon_url = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=64`;

    const response = await axios.get(url, {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkVaultBot/1.0)',
        Accept: 'text/html',
      },
      maxRedirects: 5,
    });

    const $ = cheerio.load(response.data);

    // Open Graph
    result.title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text().trim() ||
      parsedUrl.hostname;

    result.description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      '';

    const ogImage =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content');

    if (ogImage) {
      // Make absolute if relative
      result.thumbnail_url = ogImage.startsWith('http')
        ? ogImage
        : `${parsedUrl.origin}${ogImage}`;
    }

    // Trim
    if (result.title) result.title = result.title.slice(0, 200);
    if (result.description) result.description = result.description.slice(0, 500);
  } catch (err) {
    console.error(`Enrichment failed for ${url}:`, err.message);
    try {
      const parsedUrl = new URL(url);
      result.domain = parsedUrl.hostname;
      result.title = parsedUrl.hostname;
      result.favicon_url = `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=64`;
    } catch {}
  }

  return result;
}

export function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
