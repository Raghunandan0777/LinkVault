import supabase from '../config/supabase.js';

/**
 * Link Health Checker
 * Pings saved URLs and flags broken ones (404, 5xx, timeouts).
 * Adds `is_broken` and `last_checked_at` fields to links.
 * 
 * Run modes:
 *   - As cron: called every 6 hours via setInterval
 *   - Manual:  GET /api/links/health-check (checks user's links)
 */

const BATCH_SIZE = 50;
const TIMEOUT_MS = 8000;
const CHECK_INTERVAL_HOURS = 6;

/**
 * Check a single URL's health
 * Returns { alive: boolean, status: number|null, error: string|null }
 */
async function checkUrl(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'HEAD', // lightweight — no body
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'LinkVault-HealthChecker/1.0',
      },
    });
    clearTimeout(timeout);

    // Some servers reject HEAD, retry with GET
    if (res.status === 405) {
      const getRes = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(TIMEOUT_MS),
        redirect: 'follow',
        headers: { 'User-Agent': 'LinkVault-HealthChecker/1.0' },
      });
      return { alive: getRes.ok, status: getRes.status, error: null };
    }

    return { alive: res.ok, status: res.status, error: null };
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      return { alive: false, status: null, error: 'timeout' };
    }
    return { alive: false, status: null, error: err.message };
  }
}

/**
 * Check health for a batch of links
 */
async function checkBatch(links) {
  const results = [];

  for (const link of links) {
    const result = await checkUrl(link.url);
    results.push({ id: link.id, ...result });

    // Update the link in database
    await supabase
      .from('links')
      .update({
        is_broken: !result.alive,
        last_checked_at: new Date().toISOString(),
        health_status: result.alive ? 'healthy' : result.error || `HTTP ${result.status}`,
      })
      .eq('id', link.id);

    // Small delay between checks to avoid rate limiting
    await new Promise(r => setTimeout(r, 200));
  }

  return results;
}

/**
 * Run health check for all links that haven't been checked recently
 */
export async function runHealthCheck() {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - CHECK_INTERVAL_HOURS);

  const { data: links, error } = await supabase
    .from('links')
    .select('id, url')
    .or(`last_checked_at.is.null,last_checked_at.lt.${cutoff.toISOString()}`)
    .limit(BATCH_SIZE);

  if (error || !links?.length) {
    console.log('[Health Check] No links to check');
    return { checked: 0, broken: 0 };
  }

  console.log(`[Health Check] Checking ${links.length} links...`);
  const results = await checkBatch(links);
  const broken = results.filter(r => !r.alive).length;
  console.log(`[Health Check] Done: ${results.length} checked, ${broken} broken`);

  return { checked: results.length, broken };
}

/**
 * Check health for a specific user's links
 */
export async function checkUserLinks(userId) {
  const { data: links, error } = await supabase
    .from('links')
    .select('id, url')
    .eq('user_id', userId)
    .limit(100);

  if (error || !links?.length) return { checked: 0, broken: 0, results: [] };

  const results = await checkBatch(links);
  const broken = results.filter(r => !r.alive).length;

  return { checked: results.length, broken, results };
}

/**
 * Start the background cron (call once at server startup)
 */
export function startHealthCheckCron() {
  console.log(`[Health Check] Cron started — runs every ${CHECK_INTERVAL_HOURS}h`);

  // Run first check after 1 minute to let server stabilize
  setTimeout(() => runHealthCheck(), 60_000);

  // Then every 6 hours
  setInterval(() => runHealthCheck(), CHECK_INTERVAL_HOURS * 60 * 60 * 1000);
}
