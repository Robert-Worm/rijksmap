// rijksmap-data.mjs: leest de datastructuren EN de indelingslogica uit rijksmap.html.
// dirOf() wordt niet nagebouwd maar letterlijk uit de kaart overgenomen (met zijn aliassen),
// zodat een rapport op een statische pagina onder exact hetzelfde onderdeel valt als in de kaart.
import fs from "node:fs";

const html = fs.readFileSync("rijksmap.html", "utf8");

function grab(decl) {
  const i = html.indexOf(decl);
  if (i < 0) throw new Error("niet gevonden: " + decl);
  const s1 = html.indexOf("[", i), s2 = html.indexOf("{", i);
  const start = (s1 < 0) ? s2 : (s2 < 0) ? s1 : Math.min(s1, s2);
  let depth = 0, j = start, inStr = false, q = "";
  for (; j < html.length; j++) { const c = html[j];
    if (inStr) { if (c === "\\") j++; else if (c === q) inStr = false; continue; }
    if (c === '"' || c === "'" || c === "`") { inStr = true; q = c; continue; }
    if (c === "[" || c === "{") depth++; else if (c === "]" || c === "}") { depth--; if (depth === 0) break; } }
  return eval("(" + html.slice(start, j + 1) + ")");
}
// broncode van een functie uit rijksmap.html (accolades tellend, strings overslaand)
function fnSrc(naam) {
  const i = html.indexOf("function " + naam + "(");
  if (i < 0) throw new Error("functie niet gevonden: " + naam);
  let depth = 0, j = html.indexOf("{", i), inStr = false, q = "", start = j;
  for (; j < html.length; j++) { const c = html[j];
    if (inStr) { if (c === "\\") j++; else if (c === q) inStr = false; continue; }
    if (c === '"' || c === "'" || c === "`") { inStr = true; q = c; continue; }
    if (c === "{") depth++; else if (c === "}") { depth--; if (depth === 0) break; } }
  return html.slice(i, j + 1);
}

export const M = grab("const M =");
export const BESTUURSRAAD = grab("const BESTUURSRAAD");
export const AGENCY_TYPE = grab("const AGENCY_TYPE");
export const AGENCY_SITE = grab("const AGENCY_SITE");
export const AGENCY_DETAIL = grab("const AGENCY_DETAIL");
export const DG_DIRS = grab("const DG_DIRS");
export const REPORTS = grab("const REPORTS = ");
/* Sinds 24-08 draagt rijksmap.html de risico-onderbouwingen niet meer zelf: ze staan in
   rijksmap-rfo.json omdat de kaart anders boven het compressieplafond van de host uitkwam
   (zie tk-rfo-splitsen.mjs). Ook ud is weggelaten waar hij uit u af te leiden was (dl:1/dl:2).
   De statische paginas en de databestanden verwachten volledige records, dus zetten we beide
   hier terug - alles wat dit bestand importeert merkt niets van de splitsing. */
{
  const p = "rijksmap-rfo.json";
  const RFO = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : null;
  if (!RFO) throw new Error(p + " ontbreekt; zonder dat bestand missen de rapportpaginas hun onderbouwing");
  let mis = 0;
  for (const mid of Object.keys(REPORTS)) for (const r of REPORTS[mid]) {
    if (r.rfx && !r.rfo) { const t = RFO[r.d + "|" + r.t]; if (t) r.rfo = t; else mis++; }
    if (!r.ud && r.dl) r.ud = (r.dl === 1) ? r.u : String(r.u).replace("/details/", "/documenten/");
  }
  if (mis) throw new Error(p + " mist " + mis + " onderbouwing(en) die de kaart wel aankondigt (rfx)");
}
export const FTE = grab("const FTE");
export const MIN_INTRO = grab("const MIN_INTRO");
export const PERSON_URL = grab("const PERSON_URL");
export const BODY_LABEL = grab("const BODY_LABEL");
export const DIR_ALIAS = grab("const DIR_ALIAS");
export const OPDRACHT = grab("const OPDRACHT");
export const RISKS = grab("const RISKS");
export const INTRO_URL = grab("const INTRO_URL");        // introductiedossier per ministerie (editie feb 2026)
export const ADR_UPDATED = grab("const ADR_UPDATED");    // stand van de ADR-index per ministerie
export const ADR_BASE = (html.match(/const ADR_BASE = "([^"]+)"/) || [])[1];
export const AR_DOCS = (html.match(/const AR_DOCS="([^"]+)"/) || [])[1];
export const RO_DOCS = (html.match(/const RO_DOCS="([^"]+)"/) || [])[1];
export const OO_DOCS = (html.match(/OO_DOCS\s*=\s*"([^"]+)"/) || [])[1] || "https://open.overheid.nl/zoeken";
export const DATA_UPDATED = (html.match(/const DATA_UPDATED = "([^"]+)"/) || [])[1];
if (!DATA_UPDATED) throw new Error("DATA_UPDATED niet gevonden");

export const CATLABEL = Object.fromEntries(OPDRACHT);
export const RISKBYK = Object.fromEntries(RISKS.map(r => [r.k, r]));
export const RISKLABEL = k => (RISKBYK[k] ? RISKBYK[k].l : k);

// dirOf + catOf letterlijk uit de kaart, met hun afhankelijkheden
const MO_URLS = grab("const MO_URLS = new Set");   // rapporten die handmatig als 'monitoring' zijn getypeerd
const logica = new Function(`
  const MO_URLS = new Set(${JSON.stringify(MO_URLS)});
  const BODY_LABEL = ${JSON.stringify(BODY_LABEL)};
  const DIR_ALIAS = ${JSON.stringify(DIR_ALIAS)};
  const DIR_ALIAS_LC = Object.fromEntries(Object.entries(DIR_ALIAS).map(([k, v]) => [k.toLowerCase(), v]));
  const blabel = b => BODY_LABEL[b] || b;
  ${fnSrc("dirOf")}
  ${fnSrc("catOf")}
  return { dirOf, catOf, blabel };
`)();
export const dirOf = r => logica.dirOf({ ...r });   // kopie: dirOf cachet in r._dir
export const catOf = logica.catOf;
export const blabel = logica.blabel;

// bron-labels, gelijk aan de kaart (optie B, 02-08-2026; hoofdletters gelijkgetrokken met
// rijksmap.html op 07-08-2026, panelbevinding: drift tussen de drie kopieen)
export const SRC_FULL = { ADR: "Auditdienst Rijk", AR: "Algemene Rekenkamer", INSP: "Rijksinspecties en andere toezichthouders", EXT: "Onderzoeken en evaluaties" };
export const srcOf = r => (["ADR", "AR", "INSP", "EXT"].includes(r.src) ? r.src : "ADR");
