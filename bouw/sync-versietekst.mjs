// sync-versietekst.mjs: houdt het paginatotaal in de versiegeschiedenis van rijksmap.html gelijk aan
// het slugregister. Zonder dit loopt de zin "2.442 pagina's" stil uit de pas zodra er onderdelen of
// rapporten bijkomen. Het getal staat gewoon in de HTML (geen placeholder), zodat rijksmap.html ook
// zonder buildstap altijd een kloppende tekst toont.
// Draait in maak-dist.mjs direct na maak-slugregister.mjs.
import fs from "node:fs";

const FILE = "rijksmap.html";
const KOPIEEN = ["index.html", "rijksmap-updated.html"];
const reg = JSON.parse(fs.readFileSync("slugregister.json", "utf8"));

const nMin = Object.keys(reg.ministeries).length;
const nOnd = Object.values(reg.onderdelen).filter(o => !o.alias).length;
const nRap = Object.keys(reg.rapporten).length;
const totaal = 1 + nMin + nOnd + nRap;                       // homepage + ministeries + onderdelen + rapporten
const nl = n => n.toLocaleString("nl-NL");                   // 2442 -> 2.442

const html = fs.readFileSync(FILE, "utf8");
const re = /(eigen pagina met een vast webadres<\/b>:\s*)([\d.]+)(\s*pagina's)/;
if (!re.test(html)) {
  console.error("AFGEBROKEN: de zin met het paginatotaal staat niet (meer) in de versiegeschiedenis van " + FILE);
  process.exit(1);
}
const oud = html.match(re)[2];
if (oud === nl(totaal)) { console.log(`versiegeschiedenis: ${oud} pagina's, ongewijzigd`); process.exit(0); }

const nieuw = html.replace(re, `$1${nl(totaal)}$3`);
fs.writeFileSync(FILE, nieuw);
for (const k of KOPIEEN) if (fs.existsSync(k)) fs.copyFileSync(FILE, k);   // sync-kopieen meteen mee
console.log(`versiegeschiedenis: ${oud} -> ${nl(totaal)} pagina's (1 home + ${nMin} ministeries + ${nOnd} onderdelen + ${nRap} rapporten)`);
