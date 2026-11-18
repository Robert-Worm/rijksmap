// Alleen-lezen gelijkheidscontrole voor issue #17. Node 24, geen externe pakketten.
import { createHash } from 'node:crypto';
import { mkdir, open, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

export const USER_AGENT = 'Rijksmap-gelijkheidscontrole/1.0 (info@rijksmap.nl)';
// Publicatiebestanden buiten de sitemap, gecontroleerd tegen de bronversie.
// .well-known/README.md is repositorydocumentatie, geen publicatiebestand.
export const FIXED_PATHS = [
  '/', '/index.html', '/sitemap.xml', '/robots.txt', '/checksum.txt',
  '/rijksmap-rapporten.json', '/rijksmap-rapporten.csv', '/rijksmap-rfo.json',
  '/.well-known/security.txt', '/favicon.ico', '/favicon.png', '/favicon.svg',
  '/apple-touch-icon.png', '/og-image.png',
];
export const DEFAULTS = {
  pages: 'https://www.rijksmap.nl',
  sliplane: 'https://rijksmap-site.sliplane.app',
  canonical: 'https://www.rijksmap.nl',
  delayMs: 250, timeoutMs: 15000, maxBytes: 32 * 1024 * 1024,
  maxTotalBytes: 4 * 1024 ** 3, maxUrls: 15000, maxDurationMs: 4 * 60 * 60 * 1000,
  maxRedirects: 3, limit: 0,
};
const REDIRECTS = new Set([301, 302, 303, 307, 308]);
const iso = () => new Date().toISOString();
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

export function origin(value) {
  const url = new URL(value);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if ((url.protocol !== 'https:' && !(local && url.protocol === 'http:')) ||
      url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('Geef een HTTPS-origin zonder pad, inlog, query of fragment (HTTP alleen lokaal).');
  }
  return url.origin;
}

function xmlText(text) {
  if (/[<>]/.test(text) || /&(?!(?:amp|lt|gt|apos|quot|#\d+|#x[\da-fA-F]+);)/.test(text)) {
    throw new Error('Ongeldige XML-tekst in sitemap.');
  }
  return text.replace(/&(amp|lt|gt|apos|quot|#\d+|#x[\da-fA-F]+);/g, (_, entity) => {
    const named = { amp: '&', lt: '<', gt: '>', apos: "'", quot: '"' };
    if (entity in named) return named[entity];
    return String.fromCodePoint(entity.startsWith('#x') ? parseInt(entity.slice(2), 16) : Number(entity.slice(1)));
  });
}

// Bewust een strikte parser voor de urlset die Rijksmap publiceert. Onbekende
// XML-vormen (ook sitemapindex/DTD/CDATA) stoppen de controle, nooit stil overslaan.
export function parseSitemap(xml, canonical, maxUrls = DEFAULTS.maxUrls) {
  const clean = xml.replace(/^\uFEFF/, '').replace(/^\s*<\?xml\s+[^?]*\?>/, '').trim();
  const root = clean.match(/^<urlset\s+xmlns=["']http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9["']\s*>([\s\S]*)<\/urlset>$/);
  if (!root) throw new Error('Sitemap is geen ondersteunde urlset.');
  const urls = new Set();
  const rest = root[1].replace(/<url>\s*([\s\S]*?)\s*<\/url>/g, (_, body) => {
    const locs = [...body.matchAll(/<loc>([^<]*)<\/loc>/g)];
    if (locs.length !== 1) throw new Error('Elke sitemapregel moet precies één loc hebben.');
    const remainder = body.replace(/<(loc|lastmod|changefreq|priority)>[^<]*<\/\1>/g, '').trim();
    if (remainder) throw new Error('Onbekende inhoud in sitemapregel.');
    const raw = xmlText(locs[0][1].trim());
    const url = new URL(raw);
    if (url.origin !== canonical || url.username || url.password || url.hash || url.search ||
        /[\u0000-\u0020\\]/.test(raw) || url.pathname.startsWith('//')) {
      throw new Error('Sitemap bevat een adres buiten de toegestane canonical-origin of met query/fragment.');
    }
    if (urls.has(url.pathname)) throw new Error(`Dubbel adres in sitemap: ${url.pathname}`);
    urls.add(url.pathname);
    if (urls.size > maxUrls) throw new Error('Sitemap overschrijdt maxUrls.');
    return '';
  });
  if (rest.trim() || !urls.size) throw new Error('Sitemap is leeg of ongeldig.');
  return [...urls].sort();
}

export function compare(left, right) {
  const reasons = [];
  if (left.error || right.error) reasons.push('ophalen-mislukt');
  if (left.status !== right.status) reasons.push('status');
  if (JSON.stringify(left.redirects) !== JSON.stringify(right.redirects)) reasons.push('doorverwijzing');
  if (left.sha256 && right.sha256 && left.sha256 !== right.sha256) reasons.push('inhoud');
  if (left.status !== 200 || right.status !== 200) reasons.push('niet-beschikbaar');
  return { equal: reasons.length === 0, reasons };
}

export function makeClient(options, signal) {
  let totalBytes = 0;
  let requests = 0;
  let stopReason = null;
  const nextAt = new Map();
  return {
    stats: () => ({ requests, totalBytes, stopReason }),
    async get(base, path, capture = false) {
      const started = Date.now();
      const result = { url: base + path, checkedAt: iso(), status: null, redirects: [], sha256: null, bytes: 0 };
      const chunks = [];
      const hash = createHash('sha256');
      let url = new URL(path, base);
      try {
        for (let hop = 0; ; hop++) {
          if (stopReason) throw new Error(stopReason);
          await sleep(Math.max(0, (nextAt.get(base) || 0) - Date.now()), undefined, { signal });
          signal.throwIfAborted();
          nextAt.set(base, Date.now() + options.delayMs);
          requests++;
          const response = await fetch(url, {
            redirect: 'manual', signal: AbortSignal.any([signal, AbortSignal.timeout(options.timeoutMs)]),
            headers: { 'User-Agent': USER_AGENT, 'Accept-Encoding': 'gzip, br, deflate' },
          });
          result.status = response.status;
          result.finalUrl = url.href;
          if (response.status === 429 || response.status === 503) {
            stopReason = `host-vraagt-rust-${response.status}`;
            result.retryAfter = response.headers.get('retry-after');
          }
          if (REDIRECTS.has(response.status)) {
            const location = response.headers.get('location');
            await response.body?.cancel();
            if (!location) throw new Error('redirect-zonder-location');
            const target = new URL(location, url);
            const sameOrigin = target.origin === base && !target.username && !target.password;
            result.redirects.push({ status: response.status, location: sameOrigin ? target.pathname + target.search + target.hash : target.href });
            if (!sameOrigin) throw new Error('redirect-naar-andere-host');
            if (hop >= options.maxRedirects) throw new Error('te-veel-redirects');
            url = target;
            continue;
          }
          result.contentType = response.headers.get('content-type');
          result.contentEncoding = response.headers.get('content-encoding');
          // fetch pakt transportcompressie uit. Hash die bytes zonder HTML-normalisatie.
          if (response.body) for await (const chunk of response.body) {
            totalBytes += chunk.length;
            result.bytes += chunk.length;
            if (totalBytes > options.maxTotalBytes) {
              stopReason = 'totaal-bytebudget-bereikt';
              throw new Error(stopReason);
            }
            if (result.bytes > options.maxBytes) throw new Error('antwoord-te-groot');
            hash.update(chunk);
            if (capture) chunks.push(chunk);
          }
          result.sha256 = hash.digest('hex');
          if (capture) result.text = Buffer.concat(chunks).toString('utf8');
          break;
        }
      } catch (error) {
        result.error = signal.aborted ? 'controle-afgebroken' : (error.cause?.code || error.message);
        result.sha256 = null;
      }
      result.durationMs = Date.now() - started;
      return result;
    },
  };
}

function validate(options) {
  for (const key of ['pages', 'sliplane', 'canonical']) options[key] = origin(options[key]);
  if (options.pages === options.sliplane) throw new Error('De twee hosts moeten verschillen.');
  const ranges = {
    delayMs: [250, 60000], timeoutMs: [100, 60000], maxBytes: [1, 64 * 1024 ** 2],
    maxTotalBytes: [1, 8 * 1024 ** 3], maxUrls: [1, 50000],
    maxDurationMs: [100, 8 * 60 * 60 * 1000], maxRedirects: [0, 5], limit: [0, 50000],
  };
  for (const [key, [min, max]] of Object.entries(ranges)) {
    if (!Number.isSafeInteger(options[key]) || options[key] < min || options[key] > max) {
      throw new Error(`Ongeldige ${key}: verwacht een geheel getal tussen ${min} en ${max}.`);
    }
  }
}

export async function run(input, { signal = new AbortController().signal, progress = () => {} } = {}) {
  const options = { ...DEFAULTS, ...input };
  validate(options);
  if (!options.output) throw new Error('Een nieuwe uitvoermap is verplicht.');
  const output = resolve(options.output);
  // Een bestaande run nooit overschrijven of met nieuwe metingen mengen.
  await mkdir(output);
  const log = await open(resolve(output, 'resultaten.jsonl'), 'wx');
  const write = data => log.write(JSON.stringify(data) + '\n');
  const startedAt = iso();
  const deadline = AbortSignal.timeout(options.maxDurationMs);
  const combined = AbortSignal.any([signal, deadline]);
  const client = makeClient(options, combined);
  let sourceCommit = null;
  try { sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: new URL('../..', import.meta.url), encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch {}
  const scriptSha256 = sha256(await (await import('node:fs/promises')).readFile(new URL(import.meta.url)));
  const summary = {
    schemaVersion: 1, startedAt, sourceCommit, scriptSha256, node: process.version,
    options, userAgent: USER_AGENT, complete: false, verdict: 'onvolledig',
    planned: 0, checked: 0, equal: 0, different: 0, differences: [], inventoryDifferences: [],
  };
  try {
    await write({ type: 'start', ...summary });
    const maps = await Promise.all([client.get(options.pages, '/sitemap.xml', true), client.get(options.sliplane, '/sitemap.xml', true)]);
    for (let i = 0; i < maps.length; i++) {
      const { text, ...metadata } = maps[i];
      await write({ type: 'sitemap', host: i === 0 ? 'pages' : 'sliplane', ...metadata });
      if (text !== undefined) await writeFile(resolve(output, i === 0 ? 'pages-sitemap.xml' : 'sliplane-sitemap.xml'), text, { flag: 'wx' });
    }
    if (maps.some(x => x.error || x.status !== 200)) throw new Error('Sitemap niet op beide hosts beschikbaar.');
    const lists = maps.map(x => parseSitemap(x.text, options.canonical, options.maxUrls));
    summary.sitemapCounts = { pages: lists[0].length, sliplane: lists[1].length };
    const sets = lists.map(list => new Set(list));
    summary.inventoryDifferences = [...new Set(lists.flat())].filter(path => sets[0].has(path) !== sets[1].has(path))
      .map(path => ({ path, onlyIn: sets[0].has(path) ? 'pages' : 'sliplane' }));
    // Eerst vaste bestanden, daarna een stabiele volgorde van alle sitemapadressen.
    const paths = [...new Set([...FIXED_PATHS, ...lists.flat().sort()])];
    if (paths.length > options.maxUrls) throw new Error('Totale adressenlijst overschrijdt maxUrls.');
    summary.planned = paths.length;
    await writeFile(resolve(output, 'adressen.json'), JSON.stringify(paths, null, 2) + '\n', { flag: 'wx' });
    await write({ type: 'inventory', counts: summary.sitemapCounts, differences: summary.inventoryDifferences, planned: paths.length });
    let failedPairs = 0;
    for (const path of paths.slice(0, options.limit || paths.length)) {
      combined.throwIfAborted();
      const pair = path === '/sitemap.xml' ? maps.map(({ text, ...rest }) => rest) :
        await Promise.all([client.get(options.pages, path), client.get(options.sliplane, path)]);
      const comparison = compare(...pair);
      const row = { type: 'result', path, ...comparison, pages: pair[0], sliplane: pair[1] };
      await write(row);
      summary.checked++;
      if (comparison.equal) summary.equal++;
      else { summary.different++; summary.differences.push({ path, reasons: comparison.reasons }); }
      progress({ checked: summary.checked, planned: summary.planned, different: summary.different });
      if (client.stats().stopReason) throw new Error(client.stats().stopReason);
      failedPairs = pair.some(x => x.error || x.status >= 500) ? failedPairs + 1 : 0;
      if (failedPairs >= 5) throw new Error('Vijf opeenvolgende ophaalfouten; controle gestopt.');
    }
    summary.complete = summary.checked === summary.planned;
    summary.verdict = summary.complete ? (summary.different || summary.inventoryDifferences.length ? 'verschillen' : 'gelijk') : 'steekproef';
  } catch (error) {
    summary.stopReason = combined.aborted ? (signal.aborted ? 'onderbroken' : 'tijdslimiet') : error.message;
  } finally {
    summary.finishedAt = iso();
    summary.network = client.stats();
    summary.exitCode = !summary.complete ? 2 : summary.verdict === 'gelijk' ? 0 : 1;
    await write({ type: 'summary', ...summary });
    await log.close();
    await writeFile(resolve(output, 'samenvatting.json'), JSON.stringify(summary, null, 2) + '\n', { flag: 'wx' });
  }
  return summary;
}

export function parseArgs(args) {
  const options = {};
  const keys = {
    '--pages': 'pages', '--sliplane': 'sliplane', '--canonical': 'canonical', '--output': 'output',
    '--delay-ms': 'delayMs', '--timeout-ms': 'timeoutMs', '--max-bytes': 'maxBytes',
    '--max-total-bytes': 'maxTotalBytes', '--max-urls': 'maxUrls', '--max-duration-ms': 'maxDurationMs',
    '--max-redirects': 'maxRedirects', '--limit': 'limit',
  };
  for (let i = 0; i < args.length; i += 2) {
    const key = keys[args[i]];
    if (!key || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Onbekende of onvolledige optie: ${args[i]}`);
    if (key in options) throw new Error(`Dubbele optie: ${args[i]}`);
    options[key] = typeof DEFAULTS[key] === 'number' ? Number(args[i + 1]) : args[i + 1];
  }
  validate({ ...DEFAULTS, ...options });
  return options;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const controller = new AbortController();
  process.once('SIGINT', () => controller.abort());
  process.once('SIGTERM', () => controller.abort());
  try {
    const summary = await run(parseArgs(process.argv.slice(2)), {
      signal: controller.signal,
      progress: ({ checked, planned, different }) => {
        if (checked % 100 === 0) console.log(`${checked}/${planned} gecontroleerd; ${different} afwijkingen`);
      },
    });
    console.log(JSON.stringify({ verdict: summary.verdict, checked: summary.checked, planned: summary.planned, different: summary.different, stopReason: summary.stopReason, output: summary.options.output }));
    process.exitCode = summary.exitCode;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
  }
}
