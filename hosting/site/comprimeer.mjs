// Maakt naast elk tekstbestand groter dan 1 kB een .gz-versie, voor de webserver (story R2-2).
// Draait tijdens het bouwen van de container, nooit in de repository zelf.
//   node hosting/site/comprimeer.mjs <map>
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { gzipSync, constants } from "node:zlib";

export const TEKST = new Set([".html", ".css", ".js", ".mjs", ".json", ".csv", ".xml", ".txt", ".md", ".svg", ".cff", ".yml"]);

export function comprimeer(map) {
  let aantal = 0, voor = 0, na = 0;
  const loop = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const pad = join(dir, e.name);
      if (e.isDirectory()) { if (e.name !== ".git") loop(pad); continue; }
      if (!e.isFile() || !TEKST.has(extname(e.name).toLowerCase()) || statSync(pad).size <= 1024) continue;
      const bron = readFileSync(pad);
      const gz = gzipSync(bron, { level: constants.Z_BEST_COMPRESSION });
      writeFileSync(pad + ".gz", gz);
      aantal++; voor += bron.length; na += gz.length;
    }
  };
  loop(map);
  return { aantal, voor, na };
}

if (process.argv[2]) {
  const r = comprimeer(process.argv[2]);
  console.log(`${r.aantal} bestanden gecomprimeerd: ${(r.voor / 1e6).toFixed(1)} MB naar ${(r.na / 1e6).toFixed(1)} MB`);
}
