// Tests voor de webserver van de huidige site (story R2-2), met een kleine nepsite.
//   node --test hosting/site/server.test.mjs
import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "node:http";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";
import { maakHandler, CSP } from "./server.mjs";
import { comprimeer } from "./comprimeer.mjs";

const groot = "<p>" + "Rijksmap ".repeat(400) + "</p>";
const root = mkdtempSync(join(tmpdir(), "rijksmap-site-"));
writeFileSync(join(root, "index.html"), groot);
mkdirSync(join(root, "rapport", "2024-voorbeeld"), { recursive: true });
writeFileSync(join(root, "rapport", "2024-voorbeeld", "index.html"), "<p>rapport</p>");
mkdirSync(join(root, ".well-known"));
writeFileSync(join(root, ".well-known", "security.txt"), "Contact: mailto:info@rijksmap.nl\n");
writeFileSync(join(root, "CNAME"), "www.rijksmap.nl\n");
writeFileSync(join(root, "rijksmap-rapporten.csv"), "a;b\n".repeat(500));
mkdirSync(join(root, ".git"));
writeFileSync(join(root, ".git", "config"), "geheim");
const resultaat = comprimeer(root);

const server = createServer(maakHandler({ root, redirectHosts: ["rijksmap.nl"], publicOrigin: "https://www.rijksmap.nl", httpsOnly: true }));
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const basis = `http://127.0.0.1:${server.address().port}`;
test.after(() => server.close());

const haal = (pad, opties = {}) => fetch(basis + pad, { redirect: "manual", ...opties });

test("de voorpagina komt uit index.html", async () => {
  const r = await haal("/", { headers: { "accept-encoding": "identity" } });
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("content-type"), "text/html; charset=utf-8");
  assert.equal(r.headers.get("x-content-type-options"), "nosniff");
  assert.equal(await r.text(), groot);
});

test("een map zonder schuine streep verwijst door, met behoud van de zoekvraag", async () => {
  const r = await haal("/rapport/2024-voorbeeld?x=1");
  assert.equal(r.status, 301);
  assert.equal(r.headers.get("location"), "/rapport/2024-voorbeeld/?x=1");
  const r2 = await haal("/rapport/2024-voorbeeld/");
  assert.equal(await r2.text(), "<p>rapport</p>");
});

test("vooraf gecomprimeerde bestanden gaan als gzip, alleen als de browser dat wil", async () => {
  assert.ok(resultaat.aantal >= 2, "index.html en de csv zijn gecomprimeerd");
  const r = await fetch(basis + "/rijksmap-rapporten.csv", { headers: { "accept-encoding": "gzip" } });
  assert.equal(r.headers.get("vary"), "Accept-Encoding");
  assert.equal(r.headers.get("content-type"), "text/csv; charset=utf-8");
  assert.equal(await r.text(), "a;b\n".repeat(500)); // fetch pakt zelf uit
  const ruw = await new Promise((ok) => {
    const http = { host: "127.0.0.1", port: server.address().port, path: "/", headers: { "accept-encoding": "gzip" } };
    import("node:http").then(({ get }) => get(http, (res) => { const d = []; res.on("data", (c) => d.push(c)); res.on("end", () => ok({ res, body: Buffer.concat(d) })); }));
  });
  assert.equal(ruw.res.headers["content-encoding"], "gzip");
  assert.equal(gunzipSync(ruw.body).toString(), groot);
});

test(".well-known en bestanden zonder extensie werken zoals op Pages", async () => {
  const r = await haal("/.well-known/security.txt");
  assert.equal(r.status, 200);
  assert.match(await r.text(), /info@rijksmap\.nl/);
  assert.equal((await haal("/CNAME")).status, 200);
});

test("onbekende paden, .git en uitbreken uit de map geven 404", async () => {
  for (const pad of ["/bestaat-niet", "/.git/config", "/../etc/passwd", "/%2e%2e/%2e%2e/etc/passwd", "/%00", "/%E0%A4%A"]) {
    assert.equal((await haal(pad)).status, 404, pad);
  }
});

test("HEAD geeft geen inhoud; andere methodes worden geweigerd", async () => {
  const h = await haal("/", { method: "HEAD" });
  assert.equal(h.status, 200);
  assert.equal(await h.text(), "");
  assert.equal((await haal("/", { method: "POST", body: "x" })).status, 405);
});

test("een bekende ETag geeft 304", async () => {
  const etag = (await haal("/")).headers.get("etag");
  assert.equal((await haal("/", { headers: { "if-none-match": etag } })).status, 304);
});

test("rijksmap.nl zonder www verwijst door naar het openbare adres", async () => {
  const { request } = await import("node:http");
  const status = await new Promise((ok) => request({ host: "127.0.0.1", port: server.address().port, path: "/rapport/?a=1", headers: { host: "rijksmap.nl" } }, (res) => { res.resume(); ok([res.statusCode, res.headers.location, res.headers["content-security-policy"], res.headers["strict-transport-security"]]); }).end());
  assert.deepEqual(status, [301, "https://www.rijksmap.nl/rapport/?a=1", CSP, "max-age=31536000"]);
});

test("de server logt geen bezoeken", async () => {
  const oud = [console.log, console.error, console.info]; const regels = [];
  console.log = console.error = console.info = (...a) => regels.push(a.join(" "));
  try { await haal("/"); await haal("/bestaat-niet"); } finally { [console.log, console.error, console.info] = oud; }
  assert.deepEqual(regels, []);
});

test("de CSP-header blijft gelijk aan de meta-policy van de kaart", () => {
  const html = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
  const meta = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/);
  assert.ok(meta, "de kaart heeft een CSP-meta");
  assert.equal(CSP, meta[1]);
});

test("beveiligingsheaders blijven aanwezig bij succes, redirects, cache en fouten", async () => {
  const etag = (await haal("/")).headers.get("etag");
  const gevallen = [
    ["/", {}, 200], ["/rapport/2024-voorbeeld/", {}, 200],
    ["/rapport/2024-voorbeeld", {}, 301],
    ["/", { headers: { "if-none-match": etag } }, 304],
    ["/", { method: "HEAD" }, 200],
    ["/bestaat-niet", {}, 404], ["/%E0%A4%A", {}, 404],
    ["/", { method: "POST" }, 405],
  ];
  for (const [pad, opties, status] of gevallen) {
    const r = await haal(pad, opties);
    assert.equal(r.status, status, pad);
    assert.equal(r.headers.get("content-security-policy"), CSP, pad);
    assert.equal(r.headers.get("strict-transport-security"), "max-age=31536000", pad);
    await r.arrayBuffer();
  }
});

test("lokale HTTP krijgt geen HSTS, ook niet via een meegegeven proxyheader", async (t) => {
  const lokaal = createServer(maakHandler({ root }));
  t.after(() => lokaal.close());
  await new Promise((r) => lokaal.listen(0, "127.0.0.1", r));
  const r = await fetch(`http://127.0.0.1:${lokaal.address().port}/`, { headers: { "x-forwarded-proto": "https" } });
  assert.equal(r.headers.get("strict-transport-security"), null);
  assert.equal(r.headers.get("content-security-policy"), CSP);
  await r.arrayBuffer();
});

test("een interne fout logt alleen de foutsoort en behoudt de beveiligingsheaders", async () => {
  const regels = [];
  const oud = console.error;
  let status, headers;
  const res = {
    headersSent: false,
    writeHead(code, waarden) { status = code; headers = waarden; },
    end() {},
  };
  const req = {
    get headers() { throw Object.assign(new Error("bezoek 192.0.2.16 /?zoek=vertrouwelijk"), { code: "EIO" }); },
  };
  console.error = (...a) => regels.push(a.join(" "));
  try { await maakHandler({ root, httpsOnly: true })(req, res); }
  finally { console.error = oud; }
  assert.equal(status, 500);
  assert.equal(headers["Content-Security-Policy"], CSP);
  assert.equal(headers["Strict-Transport-Security"], "max-age=31536000");
  assert.deepEqual(regels.map(JSON.parse), [{ event: "site_error", error: "EIO" }]);
});

test("het serverproces schrijft geen IP-adressen, verzoeken of bezoekersheaders naar stdout/stderr", async (t) => {
  const kind = spawn(process.execPath, [fileURLToPath(new URL("./server.mjs", import.meta.url))], {
    env: { ...process.env, SITE_ROOT: root, PORT: "0", HTTPS_ONLY: "1", PUBLIC_ORIGIN: "", REDIRECT_HOSTS: "" },
    stdio: ["ignore", "pipe", "pipe"], windowsHide: true,
  });
  const gesloten = once(kind, "close");
  t.after(async () => { if (kind.exitCode === null) kind.kill(); await gesloten; });
  let uit = "", fouten = "";
  kind.stdout.on("data", (d) => { uit += d; });
  kind.stderr.on("data", (d) => { fouten += d; });
  const regels = createInterface({ input: kind.stdout });
  const [regel] = await once(regels, "line", { signal: AbortSignal.timeout(5000) });
  const start = JSON.parse(regel);
  assert.equal(start.event, "site_ready");
  for (const pad of ["/?zoek=vertrouwelijk", "/onbekend?ip=192.0.2.16", "/%E0%A4%A"]) {
    const r = await fetch(`http://127.0.0.1:${start.port}${pad}`, { headers: {
      "x-forwarded-for": "192.0.2.16, 2001:db8::16", "user-agent": "prive-bezoeker", cookie: "prive=waarde",
    } });
    assert.equal(r.headers.get("strict-transport-security"), "max-age=31536000");
    await r.arrayBuffer();
  }
  kind.kill();
  await gesloten;
  assert.deepEqual(uit.trim().split(/\r?\n/).map(JSON.parse), [start]);
  assert.equal(fouten, "");
});
