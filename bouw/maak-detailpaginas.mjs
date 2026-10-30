// maak-detailpaginas.mjs (fase 2 van het URL-plan): genereert een eigen, indexeerbare pagina voor
// elk organisatieonderdeel (<ministerie>/<onderdeel>/) en elk rapport (/rapport/<slug>/).
// De URL's komen uit slugregister.json en liggen daarmee vast. Alles wordt uit rijksmap.html afgeleid,
// dus de pagina's kunnen nooit iets anders beweren dan de kaart.
//
//   node maak-detailpaginas.mjs            genereert alles
//   node maak-detailpaginas.mjs --alleen-onderdelen
import fs from "node:fs";
import path from "node:path";
import { HOST, esc, shell } from "./pagina-shell.mjs";
import { maakLinker } from "./linkify.mjs";
import { M, BESTUURSRAAD, AGENCY_TYPE, AGENCY_SITE, AGENCY_DETAIL, DG_DIRS, REPORTS, MIN_INTRO,
         DATA_UPDATED, CATLABEL, RISKLABEL, dirOf, catOf, srcOf, SRC_FULL,
         INTRO_URL, ADR_UPDATED, ADR_BASE, AR_DOCS, RO_DOCS, OO_DOCS } from "./rijksmap-data.mjs";

const ALLEEN_ONDERDELEN = process.argv.includes("--alleen-onderdelen");
const reg = JSON.parse(fs.readFileSync("slugregister.json", "utf8"));
const rurl = u => (u || "").startsWith("http") ? u : "https://www.rijksoverheid.nl" + (u || "");
const linkify = maakLinker(reg, HOST);   // organisatienamen in beschrijvingen worden interne links
// deeplink naar de plek IN de interactieve kaart, inclusief highlight (zie gaNaarDoel in rijksmap.html)
const kaartLink = (mid, soort, code, naam) => `${HOST}/#min=${mid}&ga=${encodeURIComponent(soort + ":" + code + (naam ? "|" + naam : ""))}`;
const byId = Object.fromEntries(M.map(m => [m.id, m]));
const schrijf = (rel, inhoud) => { fs.mkdirSync(path.dirname(rel), { recursive: true }); fs.writeFileSync(rel, inhoud); };

/* Meta description netjes inkorten (herreview 23-08: de harde slice kapte bijna de helft van
   de descriptions midden in een woord af - "...nationaliteit, etnici"). Eerst proberen op het
   laatste zinseinde binnen de limiet te eindigen; levert dat een te korte romp op, dan op de
   laatste woordgrens met een beletselteken. */
function beschrKort(tekst, max) {
  const s = String(tekst).replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  const stuk = s.slice(0, max);
  // een punt telt alleen als zinseinde na minstens twee letters (dus niet na "o.a.",
  // "bijv." of een opsommingsnummer "1."), en niet als er nog een openstaand haakje is
  const zin = stuk.match(/^[\s\S]*[a-z\u00e0-\u00ff]{2}[.!?](?=["')\]]?(\s|$))/);
  if (zin && zin[0].length >= max * 0.55) return zin[0].trim();
  return stuk.replace(/\s+\S*$/, "").replace(/[,;:]$/, "") + "…";
}

// ---------- index: welk onderdeel hoort bij welk rapportlabel ----------
// dirOf() geeft per rapport een label ("HBWE", "Belastingdienst", "Kerndepartement").
// _repdir koppelt DG-codes aan datzelfde label; diensten matchen op hun eigen code.
// Eerste treffer wint, zodat een label (bv. Kerndepartement bij SG en pSG) nooit twee pagina's vult.
// Diensten staan bewust VOOROP: is een DG dezelfde organisatie als een dienst (DG Belastingdienst),
// dan is de dienstpagina de enige pagina en komen de rapporten daar terecht.
const echt = key => { const o = reg.onderdelen[key]; return o && o.alias ? o.alias : key; };
const labelIndex = {};   // mid -> label -> onderdeelsleutel
for (const m of M) {
  const idx = labelIndex[m.id] = {};
  for (const a of m.ag) {
    const key = `${m.id}|ag|${a[0]}`;
    if (reg.onderdelen[key] && !idx[a[0]]) idx[a[0]] = key;
  }
  const rd = (DG_DIRS[m.id] || {})._repdir || {};
  for (const [code, ruw] of Object.entries(rd)) {
    const label = String(ruw).split("|")[0].trim();
    const key = echt(`${m.id}|dg|${code}`);
    if (reg.onderdelen[key] && !idx[label]) idx[label] = key;
  }
}
const onderdeelVan = (r, mid) => labelIndex[mid] ? labelIndex[mid][dirOf(r)] : undefined;

// rapporten per onderdeel + de onderdeelsleutel per rapport
const rapportenVan = {};   // onderdeelsleutel -> [rapport]
const onderdeelSleutel = new Map();   // rapport-object -> onderdeelsleutel
for (const [mid, arr] of Object.entries(REPORTS)) {
  for (const r of arr) {
    const key = onderdeelVan(r, mid);
    if (!key) continue;
    (rapportenVan[key] = rapportenVan[key] || []).push(r);
    onderdeelSleutel.set(r, key);
  }
}
for (const lijst of Object.values(rapportenVan)) lijst.sort((a, b) => (b.d || "").localeCompare(a.d || ""));

const urlOnderdeel = key => { const o = reg.onderdelen[key]; return `${HOST}/${reg.ministeries[o.mid].slug}/${o.slug}/`; };
const urlRapport = r => { const it = reg.rapporten[`${rapportMid(r)}|${r.d}|${r.t}`]; return it ? `${HOST}/rapport/${it.slug}/` : null; };
const rapportMidCache = new Map();
function rapportMid(r) {
  if (rapportMidCache.has(r)) return rapportMidCache.get(r);
  for (const [mid, arr] of Object.entries(REPORTS)) if (arr.includes(r)) { rapportMidCache.set(r, mid); return mid; }
  return null;
}

// ---------- gedeelde stukjes ----------
// een pil per rapport met de partij zelf (Auditdienst Rijk, Algemene Rekenkamer, de inspectie of het bureau),
// niet het bronsoort ervoor: dat maakte de regels lang en schreeuwerig. Het soort staat in de tooltip.
/* Datum met eerlijke precisie, gelijk aan dvis() op de kaart: bij 1.512 rapporten is de dag
   (dp:"m") of de hele datum (dp:"j") een plaatsvervanger. Zonder dit toonden de statische
   pagina's - en de JSON-LD die Google overneemt - een precisie die de bron niet heeft
   (bughunt 23-08). datumIso levert wat in schema.org datePublished mag: een jaar of
   jaar-maand is daar een geldige waarde. */
const datumTekst = r => r.dp === "j" ? (r.d || "").slice(0, 4) : r.dp === "m" ? (r.d || "").slice(0, 7) : (r.d || "").slice(0, 10);
const datumIso = r => datumTekst(r);
const datumUitleg = r => r.dp === "j" ? " (alleen het jaar is bekend)" : r.dp === "m" ? " (alleen de maand is bekend)" : "";

const bronPil = r => {
  const s = srcOf(r);
  const naam = (s === "ADR" || s === "AR") ? SRC_FULL[s] : (r.org || SRC_FULL[s]);
  const soort = s === "INSP" ? "toezichthouder" : s === "EXT" ? "onderzoek of evaluatie" : SRC_FULL[s];
  return `<span class="pil bron" title="${esc(soort)}: ${esc(naam)}">${esc(naam)}</span>`;
};
function rapportRegel(r) {
  const u = urlRapport(r);
  const titel = esc(r.t);
  return `<li><span class="datum">${esc(datumTekst(r))}</span>${u ? `<a href="${u}">${titel}</a>` : `<span>${titel}</span>`}${bronPil(r)}${r.np ? '<span class="pil">niet openbaar</span>' : ""}</li>`;
}
// verantwoording per pagina: waar komt wat vandaan. Zonder dit blok is een pagina niet controleerbaar,
// en controleerbaarheid is de kern van de Rijksmap.
const bronRij = (label, waarde) => waarde ? `<dt>${esc(label)}</dt><dd>${waarde}</dd>` : "";
const extLink = (u, t) => `<a href="${esc(u)}" rel="noopener">${esc(t)}</a>`;
function rapportBronnen(lijst) {
  const s = new Set(lijst.map(srcOf));
  const d = [];
  if (s.has("ADR")) d.push(extLink(ADR_BASE, "ADR-index op rijksoverheid.nl"));
  if (s.has("AR")) d.push(extLink(AR_DOCS, "rekenkamer.nl"));
  if (s.has("INSP") || s.has("EXT")) d.push(extLink(RO_DOCS, "rijksoverheid.nl") + " en " + extLink(OO_DOCS, "open.overheid.nl"));
  return d.join(", ");
}
const bronTelling = lijst => {
  const c = s => lijst.filter(r => srcOf(r) === s).length;
  return [[c("ADR"), "van de Auditdienst Rijk", "van de Auditdienst Rijk"],
          [c("AR"), "van de Algemene Rekenkamer", "van de Algemene Rekenkamer"],
          [c("INSP"), "toezichtsrapport", "toezichtsrapporten"],
          [c("EXT"), "onderzoeksrapport", "onderzoeksrapporten"]]
    .filter(x => x[0] > 0).map(x => `${x[0]} ${x[0] === 1 ? x[1] : x[2]}`).join(", ");
};

// ---------- onderdeelpagina ----------
function onderdeelPagina(key) {
  const o = reg.onderdelen[key];
  const m = byId[o.mid];
  const minUrl = `${HOST}/${reg.ministeries[o.mid].slug}/`;
  const canoniek = urlOnderdeel(key);
  const isDG = o.soort === "dg" || o.soort === "onderdeel";
  const lijst = rapportenVan[key] || [];
  const det = AGENCY_DETAIL[o.code] || {};

  // beschrijving: DG-blok uit M.dg, of dienstomschrijving uit M.ag / AGENCY_DETAIL
  const dgRij = m.dg.find(d => d[0] === o.code);
  const agRij = m.ag.find(a => a[0] === o.code);
  const omschrijving = isDG ? (dgRij ? dgRij[2] : "") : (det.desc || (agRij ? agRij[2] : ""));
  const type = isDG ? (o.soort === "dg" ? "directoraat-generaal" : "organisatieonderdeel") : (AGENCY_TYPE[o.code] || "dienst");
  const site = !isDG ? (AGENCY_SITE[o.code] || det.org || "") : "";

  // leiding: bij een DG de bijbehorende bestuursraadrol, bij een dienst de lead uit AGENCY_DETAIL
  let leidingHtml = "";
  if (isDG) {
    const kern = String(o.naam).replace(/^DG\s+/i, "").toLowerCase().slice(0, 16);
    const rol = (BESTUURSRAAD[m.id] || []).find(p => p.role && p.role.toLowerCase().includes(kern));
    // de functietitel gaat naar de bestuursraad in de kaart, de naam naar het ABD-benoemingsbericht
    if (rol) leidingHtml = `<li><span class="rol"><a href="${kaartLink(m.id, "amb", rol.nm)}" title="Bekijk in de interactieve Rijksmap">${esc(rol.role)}</a></span><span class="naam">${rol.u ? `<a href="${esc(rol.u)}" rel="noopener">${esc(rol.nm)}</a>` : esc(rol.nm)}</span></li>`;
  } else {
    leidingHtml = (det.lead || []).filter(l => l.n).map(l =>
      `<li><span class="rol"><a href="${kaartLink(m.id, "lead", o.code, l.n)}" title="Bekijk in de interactieve Rijksmap">${esc(l.r || "leiding")}</a></span><span class="naam">${l.u ? `<a href="${esc(l.u)}" rel="noopener">${esc(l.n)}</a>` : esc(l.n)}</span></li>`).join("\n");
  }

  // onderliggende directies (DG) of organisatieonderdelen (dienst)
  let kinderen = [];
  if (isDG) {
    kinderen = ((DG_DIRS[m.id] || {})[o.code] || []).map(raw => (typeof raw === "string" ? { n: raw } : raw)).filter(x => x.n);
  } else {
    kinderen = (det.units || []).map(raw => (typeof raw === "string" ? { n: raw } : raw)).filter(x => x.n);
  }
  // elke directie/unit is klikbaar naar zijn eigen regel in de kaart (opent het ministerie, klapt het
  // onderdeel uit en laat de regel oplichten)
  const kindHtml = kinderen.map(k => {
    const naar = kaartLink(m.id, isDG ? "dir" : "unit", o.code, k.n);
    return `<li><span class="naam"><a href="${naar}" title="Bekijk ${esc(k.n)} in de interactieve Rijksmap">${esc(k.n)}</a></span>${k.dir ? `<span class="rol">${k.du ? `<a href="${esc(k.du)}" rel="noopener">${esc(k.dir)}</a>` : esc(k.dir)}${k.wnd ? " (waarnemend)" : ""}</span>` : ""}${k.d ? `<p class="desc">${linkify(esc(k.d), key)}</p>` : ""}</li>`;
  }).join("\n");

  const zusjes = Object.values(reg.onderdelen).filter(x => x.mid === o.mid && x.slug !== o.slug && !x.alias)
    .map(x => `<a href="${HOST}/${reg.ministeries[x.mid].slug}/${x.slug}/">${esc(x.naam)}</a>`).join(" &middot; ");

  const titel = `${o.naam} (${m.abbr}): taken, leiding en rapporten | Rijksmap`;
  const beschr = `${o.naam}, ${type} van het ministerie van ${m.name}. ${omschrijving ? beschrKort(omschrijving, 150) : `Taken, leiding en ${lijst.length} onderzoeksrapporten sinds 2019.`}`;
  const jsonld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Rijksmap", item: HOST + "/" },
        { "@type": "ListItem", position: 2, name: "Ministerie van " + m.name, item: minUrl },
        { "@type": "ListItem", position: 3, name: o.naam, item: canoniek } ] },
      { "@type": "GovernmentOrganization", "@id": canoniek + "#org", name: o.naam, url: canoniek,
        ...(site ? { sameAs: [site] } : {}),
        parentOrganization: { "@type": "GovernmentOrganization", name: "Ministerie van " + m.name, url: minUrl },
        ...(kinderen.length ? { subOrganization: kinderen.slice(0, 30).map(k => ({ "@type": "GovernmentOrganization", name: k.n })) } : {}) },
    ],
  };

  const body = `<h1>${esc(o.naam)}</h1>
<p class="tagline">${esc(type)} van het ministerie van ${esc(m.name)}</p>
<p class="meta">${lijst.length ? `${lijst.length} onderzoeksrapporten sinds 2019 (${bronTelling(lijst)})` : "geen los geïndexeerde rapporten"}${det.scale ? ` &middot; ${esc(det.scale)}` : ""}</p>
<a class="cta" href="${kaartLink(m.id, isDG ? "dg" : "ag", o.code)}">Bekijk in de interactieve Rijksmap</a>
${site ? `<a class="cta sec" href="${esc(site)}" rel="noopener">Officiële pagina</a>` : ""}
${omschrijving ? `<h2>Over ${esc(o.naam)}</h2>\n<div class="card"><p class="samenvatting">${linkify(esc(omschrijving), key)}</p></div>` : ""}
${leidingHtml ? `<h2>Leiding</h2>\n<div class="card"><ul class="lijst">\n${leidingHtml}\n</ul></div>` : ""}
${kindHtml ? `<h2>${isDG ? "Directies en onderdelen" : "Voornaamste onderdelen"}</h2>\n<div class="card"><ul class="lijst">\n${kindHtml}\n</ul></div>` : ""}
${lijst.length ? `<h2>Onderzoeksrapporten over ${esc(o.naam)}</h2>
<div class="card"><p class="desc">${lijst.length} rapporten sinds 2019: ${bronTelling(lijst)}. Elk rapport is gelezen, ingedeeld en gelabeld op risicothema.</p>
<ul class="lijst rapporten">
${lijst.slice(0, 60).map(rapportRegel).join("\n")}
</ul>${lijst.length > 60 ? `<p class="desc alle">De volledige lijst staat in de <a href="${HOST}/#${m.id}">interactieve kaart</a>.</p>` : ""}</div>` : ""}
<h2>Bronnen</h2>
<div class="card"><dl class="kv">
${bronRij("Structuur en beschrijving", isDG
  ? ((DG_DIRS[m.id] || {})._src ? extLink((DG_DIRS[m.id] || {})._src, "officieel organogram op rijksoverheid.nl") + ((DG_DIRS[m.id] || {})._date ? ` (stand ${esc((DG_DIRS[m.id] || {})._date)})` : "") : "rijksoverheid.nl")
  : [site ? extLink(site, "eigen organisatiepagina") : "", (DG_DIRS[m.id] || {})._src ? extLink((DG_DIRS[m.id] || {})._src, "organogram van het ministerie") : ""].filter(Boolean).join(", "))}
${bronRij("Toelichting", INTRO_URL[m.id] ? extLink(INTRO_URL[m.id], "Introductiedossier bewindspersonen") + " (editie 23 feb 2026)" : "")}
${bronRij("Leiding", "benoemingsberichten van de " + extLink("https://www.algemenebestuursdienst.nl", "Algemene Bestuursdienst"))}
${bronRij("Rapporten", lijst.length ? rapportBronnen(lijst) : "")}
${bronRij("Bijgewerkt", esc(DATA_UPDATED) + (ADR_UPDATED[m.id] ? `, ADR-index ${esc(ADR_UPDATED[m.id])}` : ""))}
</dl>
<p class="desc">De indeling van rapporten bij dit onderdeel komt uit de rapportreview van de Rijksmap; de risicolabels zijn met een AI-model toegekend en niet door mensen gevalideerd.</p></div>
<h2>Binnen hetzelfde ministerie</h2>
<p class="andere"><a href="${minUrl}">Ministerie van ${esc(m.name)}</a>${zusjes ? " &middot; " + zusjes : ""}</p>`;

  return shell({ titel, beschr, canoniek, jsonld, dataUpdated: DATA_UPDATED,
    crumb: `<a href="${HOST}/">Rijksmap</a> &rsaquo; <a href="${minUrl}">Ministerie van ${esc(m.name)}</a> &rsaquo; ${esc(o.naam)}`, body });
}

// ---------- rapportpagina ----------
function rapportPagina(sleutel) {
  const it = reg.rapporten[sleutel];
  const mid = it.mid;
  const r = (REPORTS[mid] || []).find(x => x.d === it.datum && x.t === it.titel);
  if (!r) return null;
  const m = byId[mid];
  const canoniek = `${HOST}/rapport/${it.slug}/`;
  const minUrl = m ? `${HOST}/${reg.ministeries[mid].slug}/` : `${HOST}/`;
  const minNaam = m ? "Ministerie van " + m.name : "Rijksbreed";
  const key = onderdeelSleutel.get(r);
  const ond = key ? reg.onderdelen[key] : null;
  const jaar = (r.d || "").slice(0, 4);
  const risks = (r.rf || []).map(k => RISKLABEL(k));
  const zelfdeOnderdeel = (key ? (rapportenVan[key] || []) : []).filter(x => x !== r).slice(0, 6);

  const titelKort = r.t.length > 70 ? r.t.slice(0, 67).replace(/\s+\S*$/, "") + "..." : r.t;
  const titel = `${titelKort} (${jaar}) | Rijksmap`;
  const beschr = (r.sm ? beschrKort(r.sm, 240) : `Onderzoeksrapport uit ${jaar} over ${ond ? ond.naam : minNaam}, van de ${SRC_FULL[srcOf(r)]}.`);
  const jsonld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Rijksmap", item: HOST + "/" },
        { "@type": "ListItem", position: 2, name: minNaam, item: minUrl },
        ...(ond ? [{ "@type": "ListItem", position: 3, name: ond.naam, item: urlOnderdeel(key) }] : []),
        { "@type": "ListItem", position: ond ? 4 : 3, name: r.t, item: canoniek } ] },
      { "@type": "Report", "@id": canoniek + "#rapport", name: r.t, url: canoniek,
        datePublished: datumIso(r), inLanguage: "nl-NL",
        ...(r.sm ? { abstract: r.sm } : {}),
        author: { "@type": "Organization", name: r.org || SRC_FULL[srcOf(r)] },
        about: { "@type": "GovernmentOrganization", name: ond ? ond.naam : minNaam },
        ...(r.u && !r.np ? { sameAs: [rurl(r.u)] } : {}) },
    ],
  };

  const body = `<h1>${esc(r.t)}</h1>
<p class="meta">${esc(datumTekst(r))} &middot; ${esc(SRC_FULL[srcOf(r)])}${r.org ? ": " + esc(r.org) : ""}${r.s ? ` &middot; standaard ${esc(r.s)}` : ""}${catOf(r) ? ` &middot; ${esc((CATLABEL[catOf(r)] || "").replace(/&amp;/g, "&"))}` : ""}</p>
${r.np ? `<div class="card"><p class="desc">Dit rapport is <b>niet actief openbaar gemaakt</b>; het bestaan ervan blijkt uit een openbare vermelding. ${r.u ? `De overzichtslijst waarin het staat is wel <a href="${esc(rurl(r.u))}" rel="noopener">te raadplegen</a>.` : ""}</p></div>`
  : `<a class="cta" href="${esc(rurl(r.u || ""))}" rel="noopener">Open het rapport bij de bron</a>`}
${/* de kaartknop staat naast de bronknop, niet meer onderaan de pagina: beide bestemmingen zijn
     even relevant zodra je weet welk rapport dit is. Is er geen bron (niet openbaar gemaakt),
     dan is de kaart de enige uitweg en krijgt hij de volle nadruk. */""}
<a class="cta${r.np ? "" : " sec"}" href="${kaartLink(mid, "rap", r.d, r.t)}">Toon dit rapport in de interactieve Rijksmap</a>
${r.sm ? `<h2>Waar gaat dit rapport over?</h2>
<div class="card"><span class="bronlabel">${r.og ? "Officiële omschrijving" : "AI-samenvatting"}</span><p class="samenvatting">${linkify(esc(r.sm), key)}</p></div>` : ""}
${risks.length ? `<h2>Risicothema's</h2>
<div class="card"><p class="pillen">${risks.map(x => `<span class="pil risk">${esc(x)}</span>`).join("")}</p>
${r.rfo ? `<p class="desc"><b>Waarom deze indeling:</b> ${linkify(esc(r.rfo), key)}</p>` : ""}
<p class="desc bronnoot">Toegekend met een AI-model (${esc(r.mdl || "Fable 5")}) op basis van de zestien thema's van Risk in Focus; niet door mensen gevalideerd. Om de labels beter te onderbouwen gaan we ze gefaseerd herbeoordelen met een tweede, onafhankelijk model van een andere aanbieder (OpenAI naast Anthropic); vanwege tokenlimieten gebeurt dat stapsgewijs. Ziet u een fout? <a href="mailto:info@rijksmap.nl?subject=Rijksmap%20-%20mogelijk%20onjuiste%20risicoclassificatie">Laat het weten</a>.</p></div>` : ""}
<h2>Waar hoort dit rapport bij?</h2>
<div class="card"><dl class="kv">
<dt>Ministerie</dt><dd><a href="${minUrl}">${esc(minNaam)}</a></dd>
${ond ? `<dt>Organisatieonderdeel</dt><dd><a href="${urlOnderdeel(key)}">${esc(ond.naam)}</a></dd>` : ""}
${r.dd ? `<dt>Onderdeel volgens het rapport</dt><dd>${linkify(esc(r.dd), key)}</dd>` : ""}
<dt>Bron</dt><dd>${esc(SRC_FULL[srcOf(r)])}${r.org ? ": " + esc(r.org) : ""}</dd>
${r.s ? `<dt>Toegepaste standaard</dt><dd>${esc(r.s)}</dd>` : ""}
<dt>Datum</dt><dd>${esc(datumTekst(r))}${esc(datumUitleg(r))}</dd>
</dl></div>
<h2>Bronnen</h2>
<div class="card"><dl class="kv">
${bronRij("Het rapport zelf", r.u ? extLink(rurl(r.u), r.np ? "overzichtslijst waarin het staat vermeld" : "originele publicatie") : "niet openbaar gemaakt, geen publicatie beschikbaar")}
${bronRij("Omschrijving", r.sm ? (r.og
  ? "officiële omschrijving, overgenomen van de publicatiepagina"
  : `samenvatting door een AI-model (${esc(r.mdl || "Fable 5")}) op basis van de publicatie`) : "")}
${bronRij("Risicolabels", risks.length ? `toegekend met een AI-model (${esc(r.mdl || "Fable 5")}) volgens de zestien thema's van ` + extLink("https://www.eciia.eu/risk-in-focus/", "Risk in Focus") + " (ECIIA), niet door mensen gevalideerd" : "")}
${bronRij("Indeling bij een onderdeel", ond ? "rapportreview van de Rijksmap, op basis van de organisatie die in het rapport wordt genoemd" : "")}
${bronRij("Bijgewerkt", esc(DATA_UPDATED))}
</dl></div>
${zelfdeOnderdeel.length ? `<h2>Andere rapporten over ${esc(ond.naam)}</h2>
<div class="card"><ul class="lijst rapporten">
${zelfdeOnderdeel.map(rapportRegel).join("\n")}
</ul>
${/* "openbaar bekend" en niet "openbaar": 69 van de 2177 rapporten zijn niet actief openbaar gemaakt
     en staan er alleen omdat ze in een openbare lijst worden VERMELD. Die staan ook in deze lijsten,
     met een eigen pil. "Alle openbare rapporten" zou daar dus niet kloppen. */""}
<p class="desc alle"><a href="${urlOnderdeel(key)}">Alle openbaar bekende rapporten over ${esc(ond.naam)}</a></p></div>` : ""}`;

  return shell({ titel, beschr, canoniek, jsonld, dataUpdated: DATA_UPDATED,
    crumb: `<a href="${HOST}/">Rijksmap</a> &rsaquo; <a href="${minUrl}">${esc(minNaam)}</a>${ond ? ` &rsaquo; <a href="${urlOnderdeel(key)}">${esc(ond.naam)}</a>` : ""} &rsaquo; rapport`, body });
}

// ---------- genereren ----------
let nOnd = 0, nRap = 0, emDash = 0, zonder = 0;
for (const key of Object.keys(reg.onderdelen)) {
  const o = reg.onderdelen[key];
  if (o.alias) continue;                       // zelfde organisatie als een dienstpagina, krijgt geen eigen URL
  const html = onderdeelPagina(key);
  if (/\u2014/.test(html)) { console.error("EM-DASH in onderdeel " + key); emDash++; }
  schrijf(path.join(reg.ministeries[o.mid].slug, o.slug, "index.html"), html);
  nOnd++;
}
console.log(`onderdeelpagina's: ${nOnd}`);

if (!ALLEEN_ONDERDELEN) {
  for (const sleutel of Object.keys(reg.rapporten)) {
    const html = rapportPagina(sleutel);
    if (!html) { zonder++; continue; }
    if (/\u2014/.test(html)) { console.error("EM-DASH in rapport " + sleutel); emDash++; }
    schrijf(path.join("rapport", reg.rapporten[sleutel].slug, "index.html"), html);
    nRap++;
  }
  console.log(`rapportpagina's  : ${nRap}${zonder ? ` (${zonder} overgeslagen: rapport niet meer in de data)` : ""}`);
}
if (emDash) throw new Error(`${emDash} pagina's met een em-dash`);

const metOnderdeel = [...onderdeelSleutel.keys()].length;
const totaalRap = Object.values(REPORTS).reduce((n, a) => n + a.length, 0);
console.log(`\nrapporten gekoppeld aan een onderdeelpagina: ${metOnderdeel} van ${totaalRap} (${Math.round(100 * metOnderdeel / totaalRap)}%)`);
console.log(`onderdelen met minstens 1 rapport: ${Object.keys(rapportenVan).length} van ${nOnd}`);
