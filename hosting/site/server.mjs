// Kleine webserver voor de huidige, statische Rijksmap (story R2-2).
// Doet wat GitHub Pages doet: bestanden uit één map serveren, mappen met index.html,
// een doorverwijzing naar de schuine streep, en vooraf gecomprimeerde .gz-bestanden.
// Geen pakketten van buiten. Logt geen bezoeken en geen IP-adressen (privacybelofte).
//
//   node hosting/site/server.mjs                     serveert de huidige map op poort 8080
//   SITE_ROOT=/app/site PORT=8080 node server.mjs    zoals in de container
//
// Instellingen (omgevingsvariabelen):
//   PORT            poort, standaard 8080
//   SITE_ROOT       map met de site, standaard de huidige map
//   REDIRECT_HOSTS  hostnamen die naar PUBLIC_ORIGIN doorverwijzen, gescheiden door komma's
//                   (bijvoorbeeld rijksmap.nl)
//   PUBLIC_ORIGIN   het openbare adres, bijvoorbeeld https://www.rijksmap.nl (zonder / aan het eind)
import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

export const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".cff": "text/plain; charset=utf-8",
  ".yml": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".woff2": "font/woff2",
};
const TYPE_ZONDER_EXTENSIE = "application/octet-stream";

/** Vaste headers op elk antwoord. */
const BASIS = { "X-Content-Type-Options": "nosniff" };

async function bestand(pad) {
  try { const s = await stat(pad); return s; } catch { return null; }
}

/**
 * Maakt de request-handler. Los van het luisteren, zodat de tests hem kunnen starten.
 * @param {{ root: string, redirectHosts?: string[], publicOrigin?: string }} opties
 */
export function maakHandler({ root, redirectHosts = [], publicOrigin = "" }) {
  const wortel = resolve(root);
  const doorverwijzen = new Set(redirectHosts.map((h) => h.trim().toLowerCase()).filter(Boolean));

  return async function handler(req, res) {
    try {
      const host = String(req.headers.host || "").split(":")[0].toLowerCase();
      if (publicOrigin && doorverwijzen.has(host)) {
        res.writeHead(301, { ...BASIS, Location: publicOrigin + (req.url || "/") });
        return res.end();
      }
      if (req.method !== "GET" && req.method !== "HEAD") {
        res.writeHead(405, { ...BASIS, Allow: "GET, HEAD", "Content-Type": "text/plain; charset=utf-8" });
        return res.end("Methode niet toegestaan\n");
      }

      const url = new URL(req.url || "/", "http://x");
      let pad;
      try { pad = decodeURIComponent(url.pathname); } catch { return nietGevonden(res); }
      if (pad.includes("\0")) return nietGevonden(res);
      const doel = resolve(join(wortel, pad));
      if (doel !== wortel && !doel.startsWith(wortel + sep)) return nietGevonden(res);
      if (doel.split(sep).includes(".git")) return nietGevonden(res);

      let info = await bestand(doel);
      let bestandspad = doel;
      if (info?.isDirectory()) {
        if (!url.pathname.endsWith("/")) {
          res.writeHead(301, { ...BASIS, Location: url.pathname + "/" + url.search });
          return res.end();
        }
        bestandspad = join(doel, "index.html");
        info = await bestand(bestandspad);
      }
      if (!info?.isFile()) return nietGevonden(res);

      const type = TYPES[extname(bestandspad).toLowerCase()] || TYPE_ZONDER_EXTENSIE;
      const etag = `"${info.size.toString(16)}-${Math.floor(info.mtimeMs).toString(16)}"`;
      const headers = { ...BASIS, "Content-Type": type, "Cache-Control": "max-age=600", ETag: etag, "Last-Modified": info.mtime.toUTCString() };

      if (req.headers["if-none-match"] === etag) { res.writeHead(304, headers); return res.end(); }

      let lees = bestandspad, lengte = info.size;
      const gz = await bestand(bestandspad + ".gz");
      if (gz?.isFile()) {
        headers.Vary = "Accept-Encoding";
        if (/\bgzip\b/.test(String(req.headers["accept-encoding"] || ""))) {
          lees = bestandspad + ".gz"; lengte = gz.size; headers["Content-Encoding"] = "gzip";
        }
      }
      headers["Content-Length"] = lengte;
      res.writeHead(200, headers);
      if (req.method === "HEAD") return res.end();
      createReadStream(lees).on("error", () => res.destroy()).pipe(res);
    } catch (fout) {
      // Alleen de soort fout, nooit het adres of de bezoeker.
      console.error(JSON.stringify({ event: "site_error", error: fout?.code || fout?.name || "onbekend" }));
      if (!res.headersSent) { res.writeHead(500, { ...BASIS, "Content-Type": "text/plain; charset=utf-8" }); res.end("Er ging iets mis\n"); }
      else res.destroy();
    }
  };
}

function nietGevonden(res) {
  res.writeHead(404, { ...BASIS, "Content-Type": "text/html; charset=utf-8" });
  res.end('<!doctype html><html lang="nl"><meta charset="utf-8"><title>Pagina niet gevonden · Rijksmap</title>'
    + '<p>Deze pagina bestaat niet. <a href="/">Naar de Rijksmap</a></p></html>\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const port = Number(process.env.PORT || 8080);
  const handler = maakHandler({
    root: process.env.SITE_ROOT || process.cwd(),
    redirectHosts: (process.env.REDIRECT_HOSTS || "").split(","),
    publicOrigin: (process.env.PUBLIC_ORIGIN || "").replace(/\/+$/, ""),
  });
  createServer(handler).listen(port, "0.0.0.0", () => console.log(JSON.stringify({ event: "site_ready", port })));
  for (const sig of ["SIGTERM", "SIGINT"]) process.on(sig, () => process.exit(0));
}
