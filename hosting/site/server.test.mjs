// Tests voor de webserver van de huidige site (story R2-2), met een kleine nepsite.
//   node --test hosting/site/server.test.mjs
import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "node:http";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";
import { maakHandler } from "./server.mjs";
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

const server = createServer(maakHandler({ root, redirectHosts: ["rijksmap.nl"], publicOrigin: "https://www.rijksmap.nl" }));
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
  const status = await new Promise((ok) => request({ host: "127.0.0.1", port: server.address().port, path: "/rapport/?a=1", headers: { host: "rijksmap.nl" } }, (res) => ok([res.statusCode, res.headers.location])).end());
  assert.deepEqual(status, [301, "https://www.rijksmap.nl/rapport/?a=1"]);
});

test("de server logt geen bezoeken", async () => {
  const oud = [console.log, console.error, console.info]; const regels = [];
  console.log = console.error = console.info = (...a) => regels.push(a.join(" "));
  try { await haal("/"); await haal("/bestaat-niet"); } finally { [console.log, console.error, console.info] = oud; }
  assert.deepEqual(regels, []);
});
