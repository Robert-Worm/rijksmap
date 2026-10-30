// maak-slugregister.mjs (fase 1 van het URL-plan): legt voor elk onderdeel en elk rapport een
// vaste, unieke URL vast in slugregister.json. Dit register is vanaf nu de bron van waarheid:
// een eenmaal vastgelegde slug wordt NOOIT meer gewijzigd (anders breken geindexeerde URL's).
// Nieuwe entiteiten krijgen er bij een volgende ronde een slug bij; bestaande blijven staan.
//
//   node maak-slugregister.mjs           vult aan en rapporteert
//   node maak-slugregister.mjs --check   rapporteert alleen, schrijft niets
import fs from "node:fs";

const CHECK = process.argv.includes("--check");
const REGISTER = "slugregister.json";
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
const M = grab("const M ="), REPORTS = grab("const REPORTS = "), AGENCY_TYPE = grab("const AGENCY_TYPE"), DG_DIRS = grab("const DG_DIRS");

// ---------- slugregels ----------
// kleine letters, diakrieten weg, & -> en, alles wat geen letter/cijfer is wordt een koppelteken.
const slug = s => String(s)
  .toLowerCase()
  .normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/&/g, " en ")
  .replace(/['’]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "")
  .replace(/-{2,}/g, "-");
// rapportslug: jaar + titel, afgekapt op hele woorden (URL's blijven zo leesbaar en kort genoeg)
function rapportSlug(r) {
  const jaar = (r.d || "").slice(0, 4);
  let t = slug(r.t).split("-").filter(Boolean);
  const uit = [];
  for (const w of t) { if ((uit.join("-") + "-" + w).length > 72) break; uit.push(w); }
  return `${jaar}-${uit.join("-") || "rapport"}`;
}

// ---------- entiteiten verzamelen ----------
const nieuw = { ministeries: {}, onderdelen: {}, rapporten: {} };
const dubbeleDiensten = {};   // dienstcode -> ministeries waar hij voorkomt

for (const m of M) {
  nieuw.ministeries[m.id] = { slug: m.slug, naam: "Ministerie van " + m.name, url: `/${m.slug}/` };
  for (const d of m.dg) {
    const key = `${m.id}|dg|${d[0]}`;
    // "DG Fiscale Zaken" -> dg-fiscale-zaken; onderdelen die geen DG zijn (AZ-directies, SG-cluster, NCTV)
    // houden hun eigen naam als slug, anders zou er een misleidende dg-voorvoegsel voor staan
    const isDG = /^DG\s|directoraat-generaal/i.test(String(d[1]));
    nieuw.onderdelen[key] = { mid: m.id, soort: isDG ? "dg" : "onderdeel", code: d[0], naam: d[1],
      slug: isDG ? "dg-" + slug(String(d[1]).replace(/^DG\s+/i, "").replace(/^directoraat-generaal\s*/i, "")) : slug(d[1]) };
  }
  for (const a of m.ag) {
    const key = `${m.id}|ag|${a[0]}`;
    nieuw.onderdelen[key] = { mid: m.id, soort: AGENCY_TYPE[a[0]] || "dienst", code: a[0], naam: a[1], slug: slug(a[1]) };
    (dubbeleDiensten[a[0]] = dubbeleDiensten[a[0]] || []).push(m.id);
  }
}
for (const [mid, arr] of Object.entries(REPORTS)) {
  for (const r of arr) nieuw.rapporten[`${mid}|${r.d}|${r.t}`] = { mid, datum: r.d, titel: r.t, src: r.src || "ADR", slug: rapportSlug(r) };
}

// ---------- botsingen oplossen ----------
// onderdelen: uniek binnen hun ministerie; rapporten: uniek over de hele site (/rapport/<slug>/)
// De volgorde is bewust gesorteerd op de sleutel: bij een botsing krijgt altijd dezelfde entiteit
// het volgnummer, ongeacht de volgorde in de data. Anders zou een herschikking in REPORTS de URL's omwisselen.
function ontdubbel(items, sleutelVanGroep) {
  const gezien = new Map(), botsingen = [];
  for (const [key, it] of Object.entries(items).sort((a, b) => a[0].localeCompare(b[0]))) {
    const groep = sleutelVanGroep(it);
    let s = it.slug, n = 1;
    while (gezien.has(groep + "/" + s)) { n++; s = `${it.slug}-${n}`; }
    if (s !== it.slug) botsingen.push({ key, van: it.slug, naar: s });
    it.slug = s;
    gezien.set(groep + "/" + s, key);
  }
  return botsingen;
}
// Een DG en een dienst kunnen dezelfde organisatie zijn (DG Belastingdienst = de Belastingdienst,
// DG NVWA = de NVWA). Dan zou dezelfde entiteit twee URL's krijgen. De dienstpagina wint (dat is de
// naam waarop mensen zoeken) en het DG verwijst ernaar via 'alias'; het krijgt geen eigen pagina.
const samengevoegd = [];
for (const m of M) {
  const rd = (DG_DIRS[m.id] || {})._repdir || {};
  for (const [code, ruw] of Object.entries(rd)) {
    const label = String(ruw).split("|")[0].trim();
    const dgKey = `${m.id}|dg|${code}`, agKey = `${m.id}|ag|${label}`;
    if (nieuw.onderdelen[dgKey] && nieuw.onderdelen[agKey]) {
      nieuw.onderdelen[dgKey].alias = agKey;
      samengevoegd.push(`${m.abbr}: ${nieuw.onderdelen[dgKey].naam} -> ${nieuw.onderdelen[agKey].naam}`);
    }
  }
}
const botsOnderdelen = ontdubbel(nieuw.onderdelen, it => it.mid);
const botsRapporten = ontdubbel(nieuw.rapporten, () => "rapport");

// ---------- samenvoegen met het bestaande register (bestaande slugs blijven staan) ----------
const oud = fs.existsSync(REGISTER) ? JSON.parse(fs.readFileSync(REGISTER, "utf8")) : { ministeries: {}, onderdelen: {}, rapporten: {} };
let behouden = 0, toegevoegd = 0, vervallen = 0;
const reg = { ministeries: {}, onderdelen: {}, rapporten: {} };
for (const soort of ["ministeries", "onderdelen", "rapporten"]) {
  for (const [key, it] of Object.entries(nieuw[soort])) {
    if (oud[soort] && oud[soort][key]) { reg[soort][key] = { ...it, slug: oud[soort][key].slug }; behouden++; }
    else { reg[soort][key] = it; toegevoegd++; }
  }
  for (const key of Object.keys(oud[soort] || {})) if (!reg[soort][key]) vervallen++;
}

// ---------- eindcontrole op de SAMENGEVOEGDE set ----------
// ontdubbel() hierboven werkt alleen op de verse set; de samenvoegstap zet daarna oude slugs
// terug zonder hercontrole. Zo bleven 16 historische botsingen staan (panelreview 23-08-2026):
// twee rapporten deelden een URL, de tweede pagina overschreef de eerste. Deze pas loopt
// over het eindresultaat met dezelfde deterministische regel (sleutelvolgorde): de eerste
// sleutel houdt de slug, latere krijgen een volgnummer. Dit is de ENIGE toegestane
// uitzondering op "een vastgelegde slug wijzigt nooit" - een slug die twee entiteiten
// aanwijst, wijst er feitelijk nul aan.
const gemigreerd = [];
for (const [soort, groepVan] of [["onderdelen", it => it.mid], ["rapporten", () => "rapport"]]) {
  const gezien = new Map();
  for (const [key, it] of Object.entries(reg[soort]).sort((a, b) => a[0].localeCompare(b[0]))) {
    const groep = groepVan(it);
    let s = it.slug, n = 1;
    const basis = it.slug.replace(/-\d+$/, "");
    while (gezien.has(groep + "/" + s)) { n++; s = `${basis}-${n}`; }
    if (s !== it.slug) { gemigreerd.push({ soort, key, van: it.slug, naar: s }); it.slug = s; }
    gezien.set(groep + "/" + s, key);
  }
}

// ---------- rapport ----------
const nOnd = Object.keys(reg.onderdelen).length, nRap = Object.keys(reg.rapporten).length;
console.log(`ministeries : ${Object.keys(reg.ministeries).length}`);
const nDG = Object.values(reg.onderdelen).filter(o => o.soort === "dg").length;
const nOverig = Object.values(reg.onderdelen).filter(o => o.soort === "onderdeel").length;
console.log(`onderdelen  : ${nOnd}  (${nDG} DG's, ${nOverig} overige organisatieonderdelen, ${nOnd - nDG - nOverig} diensten/ZBO's)`);
console.log(`rapporten   : ${nRap}`);
const nAlias = Object.values(reg.onderdelen).filter(o => o.alias).length;
console.log(`   waarvan samengevoegd met een dienstpagina (geen eigen URL): ${nAlias}`);
if (samengevoegd.length) samengevoegd.forEach(x => console.log("      " + x));
console.log(`totaal URL's: ${Object.keys(reg.ministeries).length + (nOnd - nAlias) + nRap + 1} (inclusief de homepage)`);
console.log(`\nbestaande slugs behouden: ${behouden} | nieuw toegevoegd: ${toegevoegd} | in het register maar niet meer in de data: ${vervallen}`);

if (botsOnderdelen.length) { console.log(`\nnaambotsingen bij onderdelen (${botsOnderdelen.length}), opgelost met een volgnummer:`); botsOnderdelen.slice(0, 10).forEach(b => console.log(`   ${b.key}  ${b.van} -> ${b.naar}`)); }
if (botsRapporten.length) { console.log(`\nnaambotsingen bij rapporten (${botsRapporten.length}), opgelost met een volgnummer:`); botsRapporten.slice(0, 10).forEach(b => console.log(`   ${b.van} -> ${b.naar}`)); }
if (gemigreerd.length) {
  console.log(`\nLET OP - historische slugbotsingen gemigreerd (${gemigreerd.length}); deze URL's zijn gewijzigd:`);
  gemigreerd.forEach(b => console.log(`   [${b.soort}] ${b.key.slice(0, 70)}\n      ${b.van} -> ${b.naar}`));
}

const meerdere = Object.entries(dubbeleDiensten).filter(([, mids]) => new Set(mids).size > 1);
if (meerdere.length) {
  console.log(`\ndiensten die onder meerdere ministeries staan (${meerdere.length}) - krijgen straks EEN pagina onder het eerste ministerie, de andere linken ernaartoe:`);
  meerdere.slice(0, 10).forEach(([code, mids]) => console.log(`   ${code}: ${[...new Set(mids)].join(", ")}`));
}

const langste = Object.values(reg.rapporten).sort((a, b) => b.slug.length - a.slug.length)[0];
console.log(`\nlangste rapport-URL: /rapport/${langste.slug}/ (${langste.slug.length} tekens)`);
console.log("voorbeelden:");
for (const o of Object.values(reg.onderdelen).filter(o => o.mid === "FIN").slice(0, 3)) console.log(`   ${o.naam.padEnd(34)} -> /${reg.ministeries.FIN.slug}/${o.slug}/`);
for (const o of Object.values(reg.onderdelen).filter(o => o.mid === "AZ" && o.soort === "onderdeel").slice(0, 2)) console.log(`   ${o.naam.padEnd(34)} -> /${reg.ministeries.AZ.slug}/${o.slug}/`);
for (const r of Object.values(reg.rapporten).slice(0, 3)) console.log(`   ${r.titel.slice(0, 34).padEnd(34)} -> /rapport/${r.slug}/`);

if (CHECK) { console.log("\n--check: niets weggeschreven"); process.exit(0); }
fs.writeFileSync(REGISTER, JSON.stringify(reg, null, 1));
console.log(`\n${REGISTER} geschreven (${(fs.statSync(REGISTER).size / 1024 / 1024).toFixed(2)} MB)`);
