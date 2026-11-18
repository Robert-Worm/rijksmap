import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { gzipSync } from 'node:zlib';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DEFAULTS, FIXED_PATHS, USER_AGENT, compare, makeClient, origin, parseArgs, parseSitemap, run } from './vergelijk-hosts.mjs';

const canonical = 'https://www.rijksmap.nl';
const sitemap = (paths = ['/']) => `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path => `<url><loc>${canonical}${path}</loc><lastmod>2026-11-18</lastmod></url>`).join('')}</urlset>`;
async function server(t, handler) {
  const instance = createServer(handler);
  await new Promise(resolve => instance.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => { instance.close(resolve); instance.closeAllConnections(); }));
  return `http://127.0.0.1:${instance.address().port}`;
}
async function output() {
  return join(await mkdtemp(join(tmpdir(), 'rijksmap-hosttest-')), 'run');
}
const client = (options = {}, signal = new AbortController().signal) => makeClient({ ...DEFAULTS, ...options }, signal);

test('sitemap: alle adressen, XML-entiteiten, geen dubbele of vreemde adressen', () => {
  assert.deepEqual(parseSitemap(sitemap(['/b/', '/a/']), canonical), ['/a/', '/b/']);
  assert.deepEqual(parseSitemap(sitemap(['/a&amp;b/']), canonical), ['/a&b/']);
  for (const xml of [
    sitemap([]), sitemap(['/', '/']), sitemap(['/a/', '/b/']).replace('</urlset>', ''),
    sitemap().replace(canonical, 'https://example.org'), sitemap().replace('<loc>', '<loc>&xx;'),
    sitemap().replace('</loc>', '</loc><loc>https://www.rijksmap.nl/x</loc>'),
    sitemap().replace('<url>', '<url><unknown>x</unknown>'), sitemap(['/x?q=1']),
    sitemap(['/x#y']), '<!DOCTYPE x>' + sitemap(), '<sitemapindex/>',
  ]) assert.throws(() => parseSitemap(xml, canonical));
  assert.throws(() => parseSitemap(sitemap(['/a', '/b']), canonical, 1));
});

test('invoer weigert dezelfde host, onbegrensde waarden en ongeldige opties', () => {
  for (const value of ['https://x.test/a', 'http://x.test', 'https://u:p@x.test', 'https://x.test?q=1']) assert.throws(() => origin(value));
  assert.equal(origin('http://127.0.0.1:1234'), 'http://127.0.0.1:1234');
  for (const args of [
    ['--limit'], ['--wat', '2'], ['--limit', 'NaN'], ['--limit', '-1'],
    ['--limit', '1', '--limit', '2'], ['--delay-ms', '0'], ['--max-urls', 'Infinity'],
    ['--max-redirects', '99'], ['--pages', canonical, '--sliplane', canonical],
  ]) assert.throws(() => parseArgs(args));
});

test('gzip en ongecomprimeerde bytes zijn gelijk; herkenbare User-Agent', async t => {
  const body = Buffer.from('Dezelfde inhoud, café.');
  const base = await server(t, (req, res) => {
    assert.equal(req.headers['user-agent'], USER_AGENT);
    if (req.url === '/gzip') { res.writeHead(200, { 'Content-Encoding': 'gzip' }); res.end(gzipSync(body)); }
    else res.end(body);
  });
  const probe = client();
  const a = await probe.get(base, '/gzip');
  const b = await probe.get(base, '/plain');
  assert.equal(a.bytes, body.length);
  assert.equal(compare(a, b).equal, true);
});

test('status en inhoud apart zichtbaar; twee gelijke 404s zijn nooit groen', async t => {
  const base = await server(t, (req, res) => { res.statusCode = req.url === '/missing' ? 404 : 200; res.end(req.url); });
  const probe = client();
  const a = await probe.get(base, '/a');
  const b = await probe.get(base, '/b');
  const missing = await probe.get(base, '/missing');
  assert.deepEqual(compare(a, b).reasons, ['inhoud']);
  assert.ok(compare(a, missing).reasons.includes('status'));
  assert.deepEqual(compare(missing, missing).reasons, ['niet-beschikbaar']);
});

test('redirects worden vastgelegd en begrensd; andere host wordt nooit bezocht', async t => {
  let externalHits = 0;
  const external = await server(t, (_req, res) => { externalHits++; res.end('niet bezoeken'); });
  const base = await server(t, (req, res) => {
    if (req.url === '/ok/') return res.end('ok');
    res.writeHead(301, { Location: req.url === '/external' ? external : req.url === '/ok' ? '/ok/' : '/loop' });
    res.end();
  });
  const probe = client();
  const redirect = await probe.get(base, '/ok');
  assert.equal(redirect.status, 200);
  assert.deepEqual(redirect.redirects, [{ status: 301, location: '/ok/' }]);
  assert.ok(compare(redirect, await probe.get(base, '/ok/')).reasons.includes('doorverwijzing'));
  assert.equal((await probe.get(base, '/external')).error, 'redirect-naar-andere-host');
  assert.equal(externalHits, 0);
  assert.equal((await probe.get(base, '/loop')).error, 'te-veel-redirects');
});

test('deadline geldt ook voor een antwoord dat na de headers blijft hangen', async t => {
  const base = await server(t, (_req, res) => { res.writeHead(200); res.write('begin'); });
  const result = await client({ timeoutMs: 100 }).get(base, '/');
  assert.ok(result.error);
  assert.equal(result.sha256, null);
  assert.ok(result.durationMs < 2000);
});

test('bytegrenzen gelden na decompressie en voor de volledige run', async t => {
  const base = await server(t, (_req, res) => { res.writeHead(200, { 'Content-Encoding': 'gzip' }); res.end(gzipSync(Buffer.alloc(2000))); });
  assert.equal((await client({ maxBytes: 100 }).get(base, '/')).error, 'antwoord-te-groot');
  const probe = client({ maxTotalBytes: 100 });
  assert.equal((await probe.get(base, '/')).error, 'totaal-bytebudget-bereikt');
  assert.equal(probe.stats().stopReason, 'totaal-bytebudget-bereikt');
});

test('429 en 503 stoppen verdere verzoeken zonder retries', async t => {
  for (const status of [429, 503]) {
    let hits = 0;
    const base = await server(t, (_req, res) => { hits++; res.writeHead(status, { 'Retry-After': '60' }); res.end('rust'); });
    const probe = client();
    const result = await probe.get(base, '/');
    assert.equal(result.status, status);
    assert.equal(result.retryAfter, '60');
    assert.ok((await probe.get(base, '/again')).error);
    assert.equal(hits, 1);
  }
});

test('volledige run bewaart inventaris, elke rij en bewijs; tempo is begrensd', async t => {
  const times = [[], []];
  let active = 0;
  let peak = 0;
  const bases = [];
  for (let i = 0; i < 2; i++) bases.push(await server(t, (req, res) => {
    times[i].push(Date.now());
    active++;
    peak = Math.max(active, peak);
    setTimeout(() => {
      active--;
      res.end(req.url === '/sitemap.xml' ? sitemap(['/', '/pagina/']) : 'gelijk');
    }, 5);
  }));
  const dir = await output();
  const summary = await run({ pages: bases[0], sliplane: bases[1], output: dir });
  assert.equal(summary.verdict, 'gelijk');
  assert.equal(summary.exitCode, 0);
  assert.equal(summary.planned, FIXED_PATHS.length + 1);
  assert.equal(summary.checked, summary.planned);
  assert.equal(summary.network.requests, 2 * summary.planned); // sitemap hergebruikt
  assert.ok(peak <= 2);
  // Meet het tempo over de reeks: aankomsttijden van losse HTTP-verzoeken
  // kunnen door de scheduler dichter bij elkaar liggen dan hun starttijden.
  for (const list of times) assert.ok(list.at(-1) - list[0] >= (list.length - 1) * 250 - 150);
  const rows = (await readFile(join(dir, 'resultaten.jsonl'), 'utf8')).trim().split('\n').map(JSON.parse);
  assert.equal(rows.filter(row => row.type === 'result').length, summary.planned);
  assert.equal(rows.at(-1).type, 'summary');
  assert.deepEqual(JSON.parse(await readFile(join(dir, 'samenvatting.json'), 'utf8')), summary);
  await assert.rejects(run({ pages: bases[0], sliplane: bases[1], output: dir }), /EEXIST/);
});

test('unie van sitemaps vindt extra pagina en inhoudsverschil; niets stil overslaan', async t => {
  const bases = [];
  for (let i = 0; i < 2; i++) bases.push(await server(t, (req, res) => {
    if (req.url === '/sitemap.xml') res.end(sitemap(i ? ['/', '/extra/'] : ['/']));
    else if (req.url === '/extra/' && i === 0) { res.statusCode = 404; res.end('ontbreekt'); }
    else res.end('gelijk');
  }));
  const summary = await run({ pages: bases[0], sliplane: bases[1], output: await output() });
  assert.equal(summary.complete, true);
  assert.equal(summary.exitCode, 1);
  assert.deepEqual(summary.inventoryDifferences, [{ path: '/extra/', onlyIn: 'sliplane' }]);
  assert.deepEqual(summary.differences.map(row => row.path), ['/sitemap.xml', '/extra/']);
});

test('steekproef, ongeldige sitemap en afbreken bewaren een onvolledige uitkomst', async t => {
  const good = await server(t, (req, res) => res.end(req.url === '/sitemap.xml' ? sitemap() : 'gelijk'));
  const bad = await server(t, (_req, res) => res.end('geen sitemap'));
  const second = await server(t, (req, res) => res.end(req.url === '/sitemap.xml' ? sitemap() : 'gelijk'));
  const sample = await run({ pages: good, sliplane: second, output: await output(), limit: 2 });
  assert.equal(sample.verdict, 'steekproef');
  assert.equal(sample.exitCode, 2);
  const invalid = await run({ pages: good, sliplane: bad, output: await output() });
  assert.equal(invalid.complete, false);
  assert.equal(invalid.checked, 0);
  assert.match(invalid.stopReason, /urlset/);
  const abort = new AbortController();
  const interrupted = await run({ pages: good, sliplane: second, output: await output() }, {
    signal: abort.signal, progress: () => abort.abort(),
  });
  assert.equal(interrupted.checked, 1);
  assert.equal(interrupted.stopReason, 'onderbroken');
  assert.equal(interrupted.exitCode, 2);
});

test('vijf opeenvolgende serverfouten stoppen de run met de gemeten rijen intact', async t => {
  const bases = [];
  for (let i = 0; i < 2; i++) bases.push(await server(t, (req, res) => {
    if (req.url === '/sitemap.xml') res.end(sitemap());
    else { res.statusCode = 500; res.end('fout'); }
  }));
  const summary = await run({ pages: bases[0], sliplane: bases[1], output: await output() });
  assert.equal(summary.exitCode, 2);
  // De eerder opgehaalde sitemap onderbreekt de eerste reeks van twee fouten.
  assert.equal(summary.checked, 8);
  assert.equal(summary.different, 7);
  assert.match(summary.stopReason, /Vijf opeenvolgende/);
});

test('totale tijd en adressenbudget voorkomen een onterecht volledig resultaat', async t => {
  const bases = [];
  for (let i = 0; i < 2; i++) bases.push(await server(t, (req, res) => res.end(req.url === '/sitemap.xml' ? sitemap() : 'gelijk')));
  const deadline = await run({ pages: bases[0], sliplane: bases[1], output: await output(), maxDurationMs: 150 });
  assert.equal(deadline.exitCode, 2);
  assert.equal(deadline.stopReason, 'tijdslimiet');
  assert.ok(deadline.checked < deadline.planned);
  const budget = await run({ pages: bases[0], sliplane: bases[1], output: await output(), maxUrls: 1 });
  assert.equal(budget.exitCode, 2);
  assert.equal(budget.checked, 0);
  assert.match(budget.stopReason, /maxUrls/);
});
