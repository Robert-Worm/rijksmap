// bouw.mjs: bouwt de huidige Rijksmap uit de bronbestanden in bron/, zonder die aan te raken (story #9).
//
//   node bouw/bouw.mjs                 bouwt de site in .bouw/werk/dist
//   node bouw/bouw.mjs --zip           idem, plus .bouw/werk/rijksmap-dist.zip
//   node bouw/bouw.mjs --controleer    bouwt en vergelijkt elk bestand met de gepubliceerde site;
//                                      stopt met een fout bij een verschil
//   node bouw/bouw.mjs --bijwerken     zet registers die de build bijwerkte terug in bron/
//
// Hoe het werkt: de inhoud van bron/ gaat naar een lege werkmap .bouw/werk. Daar draait
// maak-dist.mjs, met de scripts uit bouw/. De vorige open data (CSV en JSON) komt uit de
// gepubliceerde site, zodat maak-databestand.mjs kan zien of de data veranderde.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const BOUW = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(BOUW, "..");
const BRON = path.join(ROOT, "bron");
const WERK = path.join(ROOT, ".bouw", "werk");
// De gepubliceerde site: straks site/ (story #20), nu nog de hoofdmap van de repository.
const SITE = fs.existsSync(path.join(ROOT, "site", "index.html")) ? path.join(ROOT, "site") : ROOT;
// Bestanden die de build maakt maar die de gepubliceerde site bewust niet heeft.
const NIET_GEPUBLICEERD = { "_headers": "alleen voor hosts als Netlify; GitHub Pages en Sliplane gebruiken het niet" };
// Registers die de build mag bijwerken; ze horen dan terug in bron/.
const REGISTERS = ["rijksmap.html", "slugregister.json", "lastmod-register.json"];

const args = process.argv.slice(2);
const stop = (msg) => { console.error("\nAFGEBROKEN: " + msg); process.exit(1); };
const hash = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");

if (!fs.existsSync(path.join(BRON, "rijksmap.html"))) stop("bron/rijksmap.html ontbreekt.");

// 1. Lege werkmap met de bronbestanden en de vorige open data.
fs.rmSync(WERK, { recursive: true, force: true });
fs.mkdirSync(WERK, { recursive: true });
fs.cpSync(BRON, WERK, { recursive: true });
for (const f of ["rijksmap-rapporten.csv", "rijksmap-rapporten.json"])
  if (fs.existsSync(path.join(SITE, f))) fs.copyFileSync(path.join(SITE, f), path.join(WERK, f));
console.log(`Werkmap: ${path.relative(ROOT, WERK)} (bron: bron/, vorige open data: ${path.relative(ROOT, SITE) || "hoofdmap"})\n`);

// 2. De bestaande bouwketen draaien.
try {
  execFileSync(process.execPath, [path.join(BOUW, "maak-dist.mjs"), ...args.filter((a) => a === "--zip" || a === "--snel")],
    { cwd: WERK, stdio: "inherit" });
} catch { stop("maak-dist.mjs faalde; zie de melding hierboven."); }

// 3. Heeft de build registers bijgewerkt?
const bijgewerkt = REGISTERS.filter((f) => hash(path.join(WERK, f)) !== hash(path.join(BRON, f)));
if (bijgewerkt.length) {
  if (args.includes("--bijwerken")) {
    for (const f of bijgewerkt) fs.copyFileSync(path.join(WERK, f), path.join(BRON, f));
    console.log(`\nBijgewerkt in bron/: ${bijgewerkt.join(", ")}. Commit deze bestanden mee.`);
  } else console.log(`\nLET OP: de build werkte ${bijgewerkt.join(", ")} bij. Draai met --bijwerken om ze in bron/ te zetten.`);
}

// 4. Optioneel: vergelijken met de gepubliceerde site.
if (args.includes("--controleer")) {
  const DIST = path.join(WERK, "dist");
  const bestanden = [];
  const loop = (dir) => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name); e.isDirectory() ? loop(p) : bestanden.push(path.relative(DIST, p)); } };
  loop(DIST);
  const anders = [], ontbreekt = [];
  for (const rel of bestanden) {
    const gepubliceerd = path.join(SITE, rel);
    if (!fs.existsSync(gepubliceerd)) { if (!NIET_GEPUBLICEERD[rel]) ontbreekt.push(rel); continue; }
    if (hash(gepubliceerd) !== hash(path.join(DIST, rel))) anders.push(rel);
  }
  console.log(`\nControle tegen de gepubliceerde site: ${bestanden.length} bestanden gebouwd, ${anders.length} anders, ${ontbreekt.length} niet gepubliceerd.`);
  for (const [f, reden] of Object.entries(NIET_GEPUBLICEERD)) if (bestanden.includes(f)) console.log(`   (${f} niet vergeleken: ${reden})`);
  for (const f of anders.slice(0, 20)) console.log("   anders: " + f);
  for (const f of ontbreekt.slice(0, 20)) console.log("   niet gepubliceerd: " + f);
  if (anders.length || ontbreekt.length) stop("de gebouwde site wijkt af van de gepubliceerde site.");
  console.log("   Gelijk: de build levert precies de gepubliceerde site.");
}
