// maak-dist.mjs: bouwt het complete publicatiepakket in dist/.
//
//   node maak-dist.mjs            regenereert de subpagina's + sitemap en bouwt dist/
//   node maak-dist.mjs --zip      idem, en maakt er rijksmap-dist.zip van (zie maak-zip.mjs)
//   node maak-dist.mjs --snel     slaat het regenereren over (alleen kopieren; voor een snelle hercontrole)
//
// Volgorde is bewust: eerst controleren, dan pas bouwen. Bij em-dashes of een JS-fout stopt het script,
// zodat er nooit een kapotte of stijl-onjuiste build klaarstaat. dist/ wordt elke keer volledig opnieuw
// opgebouwd, dus een bestand dat uit het pakket verdwijnt kan niet blijven rondslingeren.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { schrijfZip } from "./maak-zip.mjs";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

// De scripts staan in bouw/; de werkmap (met rijksmap.html) is de huidige map. Zie bouw/bouw.mjs.
const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const node = (script) => `"${process.execPath}" "${path.join(SCRIPTS, script)}"`;

const args = process.argv.slice(2);
const WIL_ZIP = args.includes("--zip");
const SNEL = args.includes("--snel");
const DIST = "dist";

const kB = n => (n / 1024).toFixed(1) + " kB";
const MB = n => (n / 1024 / 1024).toFixed(2) + " MB";
const stop = msg => { console.error("\nAFGEBROKEN: " + msg); process.exit(1); };

// ---------- 1. controle vooraf ----------
if (!fs.existsSync("rijksmap.html")) stop("rijksmap.html niet gevonden (draai dit script in de projectmap).");

/* Compressiepoort (24-08). De host comprimeert responses tot circa 10 MB wel en daarboven
   niet: bij 14,7 MB haalde elke bezoeker de kaart ONgecomprimeerd op. Daarom is de
   risico-onderbouwing naar rijksmap-rfo.json verhuisd (tk-rfo-splitsen.mjs). Groeit de kaart
   door een nieuwe ronde weer richting dat plafond, dan moet dit script dat melden - niet de
   bezoeker. Waarschuwing vanaf 9,5 MB, afbreken boven 10 MiB. */
{
  const b = fs.statSync("rijksmap.html").size, PLAFOND = 10 * 1024 * 1024;
  if (b > PLAFOND) stop(`rijksmap.html is ${MB(b)} en valt daarmee buiten de compressie van de host; splits eerst een veld af (zie tk-rfo-splitsen.mjs).`);
  if (b > 9.5 * 1024 * 1024) console.log(`   LET OP: rijksmap.html is ${MB(b)}, nog ${kB(PLAFOND - b)} onder het compressieplafond.`);
}

console.log("1. Kwaliteitscontrole (verify-ar.mjs)");
let vOut = "";
try { vOut = execSync(node("verify-ar.mjs"), { encoding: "utf8" }); }
catch (e) { stop("verify-ar.mjs kon niet draaien: " + e.message.slice(0, 120)); }
process.stdout.write(vOut.split("\n").map(l => l ? "   " + l : l).join("\n"));
const emDash = +(vOut.match(/em-dashes:\s*(\d+)/) || [0, 0])[1];
const jsFout = +(vOut.match(/fout:\s*(\d+)/) || [0, 0])[1];
if (emDash > 0) stop(`${emDash} em-dash(es) in rijksmap.html.`);
if (jsFout > 0) stop(`${jsFout} script-blok(ken) met een JS-fout in rijksmap.html.`);

// ---------- 2. subpagina's + sitemap opnieuw genereren ----------
if (SNEL) {
  console.log("\n2. Pagina's NIET geregenereerd (--snel); dist kan verouderde tellingen bevatten.");
} else {
  console.log("\n2. Alle statische pagina's genereren");
  const stappen = [
    ["maak-slugregister.mjs", "URL's vastleggen/aanvullen"],
    ["sync-versietekst.mjs", "paginatotaal in de versiegeschiedenis"],
    ["maak-databestand.mjs", "dataset-bestanden (CSV/JSON)"],
    ["maak-subpaginas.mjs", "12 ministeriepagina's"],
    ["maak-detailpaginas.mjs", "onderdeel- en rapportpagina's"],
    ["maak-sitemap.mjs", "sitemap.xml"],
  ];
  // rel-links.mjs draait NIET meer: Robert bekijkt de pagina's ook rechtstreeks vanaf schijf (file://),
  // en dan wijst een root-relatieve link naar C:\... in plaats van naar de site. Links zijn daarom weer
  // absoluut (https://www.rijksmap.nl/...); een klein scriptje in elke pagina maakt ze lokaal relatief.
  for (const [script, wat] of stappen) {
    let uit = "";
    try { uit = execSync(node(script), { encoding: "utf8", stdio: "pipe" }); }
    catch (e) { stop(`${script} faalde: ` + (e.stdout || e.message).toString().slice(-300)); }
    const laatste = uit.trim().split("\n").filter(Boolean).slice(-1)[0] || "";
    console.log(`   ${wat.padEnd(34)} ${laatste.slice(0, 90)}`);
  }
}

// ---------- 3. paden uit de sitemap halen (dist bevat exact wat de sitemap belooft) ----------
if (!fs.existsSync("sitemap.xml")) stop("sitemap.xml ontbreekt.");
const sitemap = fs.readFileSync("sitemap.xml", "utf8");
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const slugs = locs.map(u => u.replace(/^https?:\/\/[^/]+\/?/, "").replace(/\/$/, "")).filter(Boolean);
if (!slugs.length) stop("geen pagina-URL's in sitemap.xml gevonden.");
// poort (panelreview 23-08-2026): een dubbele URL betekent dat twee pagina's elkaar overschrijven
// en de sitemap iets belooft dat er niet staat. Zestien van die botsingen hebben maandenlang
// onopgemerkt bestaan; vanaf nu breekt de build erop af.
{ const g = new Set(), dup = new Set();
  for (const s of slugs) { if (g.has(s)) dup.add(s); g.add(s); }
  if (dup.size) stop(`sitemap bevat ${dup.size} dubbele URL('s): ${[...dup].slice(0, 5).join(", ")}`); }

// ---------- 4. dist/ opnieuw opbouwen ----------
console.log(`\n3. dist/ opbouwen (${slugs.length + 1} pagina's + vaste bestanden)`);
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

const gekopieerd = [];
const kopieer = (van, naar) => {
  if (!fs.existsSync(van)) return { van, ontbreekt: true };
  fs.mkdirSync(path.dirname(naar), { recursive: true });
  fs.copyFileSync(van, naar);
  const s = fs.statSync(naar);
  gekopieerd.push({ naam: path.relative(DIST, naar).replace(/\\/g, "/"), bytes: s.size });
  return { van, bytes: s.size };
};

// de kaart zelf wordt de homepage
kopieer("rijksmap.html", path.join(DIST, "index.html"));
// de twaalf ministeriepagina's
const missendeSubs = [];
for (const s of slugs) {
  const bron = path.join(s, "index.html");
  if (!fs.existsSync(bron)) { missendeSubs.push(s); continue; }
  kopieer(bron, path.join(DIST, s, "index.html"));
}
if (missendeSubs.length) stop("subpagina ontbreekt voor: " + missendeSubs.join(", "));

// vaste bestanden; VERPLICHT = build stopt als ze ontbreken
const VERPLICHT = ["sitemap.xml", "robots.txt", "favicon.svg", "favicon.png", "favicon.ico", "apple-touch-icon.png", "og-image.png", "rijksmap-rapporten.csv", "rijksmap-rapporten.json", "rijksmap-rfo.json"];
const OPTIONEEL = ["_headers"];   // security-headers; werkt op Cloudflare Pages/Netlify, wordt elders genegeerd
const ontbreekt = [];
for (const f of [...VERPLICHT, ...OPTIONEEL]) {
  const r = kopieer(f, path.join(DIST, f));
  if (r.ontbreekt && VERPLICHT.includes(f)) ontbreekt.push(f);
}
if (ontbreekt.length) stop("verplicht bestand ontbreekt: " + ontbreekt.join(", "));
// security.txt (RFC 9116) hoort onder /.well-known/
if (fs.existsSync("security.txt")) {
  fs.mkdirSync(path.join(DIST, ".well-known"), { recursive: true });
  fs.copyFileSync("security.txt", path.join(DIST, ".well-known", "security.txt"));
}
// integriteit: SHA-256 van de homepage per release, voor wie het bestand wil verifieren
{
  const crypto = await import("node:crypto");
  const sha = crypto.createHash("sha256").update(fs.readFileSync(path.join(DIST, "index.html"))).digest("hex");
  fs.writeFileSync(path.join(DIST, "checksum.txt"), "SHA-256 van index.html (deze release):\r\n" + sha + "\r\n");
  console.log("   checksum.txt: sha256 " + sha.slice(0, 16) + "...");
}

// ---------- 5. samenhangcontroles ----------
console.log("\n4. Samenhangcontroles");
const home = fs.readFileSync(path.join(DIST, "index.html"), "utf8");
const problemen = [];

// a. verwijst de homepage naar bestanden die niet in het pakket zitten?
const verwezen = [...home.matchAll(/(?:href|content|src)="(?:https:\/\/www\.rijksmap\.nl)?\/([a-z0-9._-]+\.(?:png|svg|ico|xml|txt|webmanifest))"/gi)].map(m => m[1].toLowerCase());
for (const v of [...new Set(verwezen)]) {
  if (!fs.existsSync(path.join(DIST, v))) problemen.push(`homepage verwijst naar /${v}, maar dat bestand zit niet in dist/`);
}
// b. staan de sync-kopieen in de projectmap gelijk aan de master?
const md5 = f => { try { return crypto.createHash("md5").update(fs.readFileSync(f)).digest("hex"); } catch { return null; } };
const masterHash = md5("rijksmap.html");
for (const kopie of ["index.html", "rijksmap-updated.html"]) {
  if (fs.existsSync(kopie) && masterHash && md5(kopie) !== masterHash) problemen.push(`${kopie} in de projectmap wijkt af van rijksmap.html (sync-kopie niet bijgewerkt)`);
}
// c. bevat een pagina nog een em-dash of een oud e-mailadres?
let emd = 0, mail = 0;
for (const s of slugs) {
  const t = fs.readFileSync(path.join(DIST, s, "index.html"), "utf8");
  if (/\u2014/.test(t)) { if (emd < 3) problemen.push(`em-dash in ${s}/index.html`); emd++; }
  if (/[a-z0-9._%+-]+@gmail\.com/i.test(t)) { if (mail < 3) problemen.push(`Gmail-adres in ${s}/index.html`); mail++; }
}
if (emd > 3) problemen.push(`... en nog ${emd - 3} pagina's met een em-dash`);
if (mail > 3) problemen.push(`... en nog ${mail - 3} pagina's met een Gmail-adres`);
if (/[a-z0-9._%+-]+@gmail\.com/i.test(home)) problemen.push("Gmail-adres in index.html");

if (problemen.length) { problemen.forEach(p => console.log("   LET OP: " + p)); }
else console.log("   alle verwijzingen kloppen, sync-kopieen gelijk, geen em-dashes of Gmail-adressen");

// ---------- 6. manifest ----------
const totaal = gekopieerd.reduce((n, f) => n + f.bytes, 0);
console.log(`\n5. Pakket klaar: ${gekopieerd.length} bestanden, ${MB(totaal)}\n`);
const rest = gekopieerd.filter(f => !f.naam.endsWith("index.html"));
const groep = (naam, filter) => {
  const g = gekopieerd.filter(filter);
  if (g.length) console.log(`   ${String(g.length).padStart(4)} ${naam}`.padEnd(46) + kB(g.reduce((n, f) => n + f.bytes, 0)));
};
groep("homepage (de kaart zelf)", f => f.naam === "index.html");
groep("ministeriepagina's", f => f.naam.endsWith("index.html") && f.naam.split("/").length === 2 && f.naam !== "index.html");
groep("onderdeelpagina's", f => f.naam.endsWith("index.html") && f.naam.split("/").length === 3 && !f.naam.startsWith("rapport/"));
groep("rapportpagina's", f => f.naam.startsWith("rapport/"));
for (const f of rest) console.log("   " + ("     " + f.naam).padEnd(46) + kB(f.bytes));

// ---------- 7. optioneel inpakken ----------
if (WIL_ZIP) {
  const zip = "rijksmap-dist.zip";
  try {
    fs.rmSync(zip, { force: true });
    const n = schrijfZip(DIST, zip);
    console.log(`\n6. ${zip} gemaakt (${n} bestanden, ${MB(fs.statSync(zip).size)}, mappen met forward slashes)`);
  } catch (e) { console.log("\n6. Inpakken mislukt: " + e.message.slice(0, 160)); }
}

console.log(`\nUploaden: de INHOUD van ${path.resolve(DIST)} naar de webroot (index.html moet in de root komen, niet in een submap).`);
