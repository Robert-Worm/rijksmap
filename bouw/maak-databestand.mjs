// maak-databestand.mjs: schrijft de complete rapportendata als open databestand
// (rijksmap-rapporten.csv + rijksmap-rapporten.json) voor de Dataset-distribution in de
// JSON-LD (Google Dataset Search) en voor hergebruikers van de CC0-data. Zonder deze
// bestanden is de CC0-claim alleen op papier waar: de data zit anders alleen in de HTML.
// Draait in maak-dist.mjs; werkt bij een datawijziging ook dateModified in de JSON-LD bij.
import fs from "node:fs";
import { M, REPORTS, RISKLABEL, SRC_FULL, srcOf, blabel } from "./rijksmap-data.mjs";

const KOPIEEN = ["index.html", "rijksmap-updated.html"];
const TY = { I: "interim-auditrapport", A: "auditrapport", O: "onderzoeksrapport", P: "privacy-onderzoek", C: "controleverklaring/review", As: "assurance-rapport" };
// M is een array; RB (rijksbreed) heeft geen eigen kaart
const MIN_NAAM = Object.fromEntries(M.map(m => [m.id, m.name]));
MIN_NAAM.RB = "Rijksbreed";

const rijen = [];
for (const mid of Object.keys(REPORTS)) for (const r of REPORTS[mid]) {
  rijen.push({
    datum: r.d || "",
    // hoe precies de datum is: bij veel bronnen staat dag=01 als plaatsvervanger; dan geldt
    // alleen de maand ("maand") of alleen het jaar ("jaar"). Zie tk-datahygiene.mjs.
    datum_precisie: r.dp === "j" ? "jaar" : r.dp === "m" ? "maand" : "dag",
    titel: r.t || "",
    ministerie: MIN_NAAM[mid] || mid,
    onderdeel: blabel(r.b) || "",
    bron: SRC_FULL[srcOf(r)],
    auteur: r.org || (srcOf(r) === "ADR" ? "Auditdienst Rijk" : srcOf(r) === "AR" ? "Algemene Rekenkamer" : ""),
    documenttype: TY[r.ty] || "",
    standaard: r.s || "",
    risicolabels: (r.rf || []).map(RISKLABEL).join("; "),
    primair_risico: r.rfp ? RISKLABEL(r.rfp) : "",
    onderzochte_dienst: r.dd || "",
    tags: r.tg || "",
    samenvatting: r.sm || "",
    toelichting_risicolabels: r.rfo || "",
    samenvatting_officieel: r.og ? "ja" : "nee",
    niet_openbaar: r.np ? "ja" : "nee",
    model_risicolabels: r.mdl || "",
    url: r.u ? (r.u.startsWith("http") ? r.u : "https://www.rijksoverheid.nl" + r.u) : "",
    // bestandslink: waar url naar een overzichtspagina wijst, staat hier het bestand zelf
    url_bestand: r.ud ? (r.ud.startsWith("http") ? r.ud : "https://www.rijksoverheid.nl" + r.ud) : ""
  });
}
rijen.sort((a, b) => (b.datum || "").localeCompare(a.datum || "") || a.titel.localeCompare(b.titel));

// CSV: zelfde vorm als de in-app export (BOM + puntkomma's voor Excel-NL, formule-guard tegen CSV-injectie)
const cel = v => { let s = String(v == null ? "" : v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
const kolommen = Object.keys(rijen[0]);
const csv = "﻿" + [kolommen.join(";")].concat(rijen.map(r => kolommen.map(k => cel(r[k])).join(";"))).join("\r\n") + "\r\n";

const json = JSON.stringify({
  naam: "Rapporten over de rijksoverheid per ministerie (Rijksmap)",
  beschrijving: "Alle rapporten van de Auditdienst Rijk, de Algemene Rekenkamer, de rijksinspecties en andere toezichthouders en externe onderzoekers over de rijksoverheid sinds 2019, met AI-classificatie op de risicocategorieen van Risk in Focus. De velden samenvatting (tenzij samenvatting_officieel=ja), toelichting_risicolabels, risicolabels en tags zijn door een AI-model opgesteld (zie model_risicolabels); datum, titel, bron en url komen uit de officiele publicaties. Het veld datum_precisie geeft aan of de bron een exacte dag kent, of dat de dag (waarde: maand) dan wel de hele datum (waarde: jaar) een plaatsvervanger is.",
  licentie: "https://creativecommons.org/publicdomain/zero/1.0/",
  bron: "https://www.rijksmap.nl/",
  aantal: rijen.length,
  rapporten: rijen
}, null, 1) + "\n";

// alleen schrijven (en dateModified bijwerken) als de inhoud echt wijzigt
const gelijk = (pad, inhoud) => fs.existsSync(pad) && fs.readFileSync(pad, "utf8") === inhoud;
const csvNieuw = !gelijk("rijksmap-rapporten.csv", csv);
const jsonNieuw = !gelijk("rijksmap-rapporten.json", json);
if (csvNieuw) fs.writeFileSync("rijksmap-rapporten.csv", csv);
if (jsonNieuw) fs.writeFileSync("rijksmap-rapporten.json", json);

if (csvNieuw || jsonNieuw) {
  const vandaag = new Date().toISOString().slice(0, 10);
  const html = fs.readFileSync("rijksmap.html", "utf8");
  const re = /("dateModified":\s*")([\d-]+)(")/;
  if (re.test(html) && html.match(re)[2] !== vandaag) {
    fs.writeFileSync("rijksmap.html", html.replace(re, `$1${vandaag}$3`));
    for (const k of KOPIEEN) if (fs.existsSync(k)) fs.copyFileSync("rijksmap.html", k);
  }
}
console.log(`rijksmap-rapporten.csv (${(csv.length / 1024).toFixed(0)} kB) + .json (${(json.length / 1024).toFixed(0)} kB), ${rijen.length} rapporten${csvNieuw || jsonNieuw ? ", dateModified bijgewerkt" : ", ongewijzigd"}`);
