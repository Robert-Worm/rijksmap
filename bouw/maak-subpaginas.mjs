// maak-subpaginas.mjs: genereert per ministerie een statische, indexeerbare
// satellietpagina (<slug>/index.html) uit de data in rijksmap.html, plus sitemap.xml.
// Draaien na elke bijwerkronde: node maak-subpaginas.mjs
import fs from "node:fs";
import path from "node:path";

const HOST = "https://www.rijksmap.nl";
const html = fs.readFileSync("rijksmap.html", "utf8");

function grab(decl) {
  const i = html.indexOf(decl);
  if (i < 0) throw new Error("niet gevonden: " + decl);
  const s1 = html.indexOf("[", i), s2 = html.indexOf("{", i);
  const start = (s1 < 0) ? s2 : (s2 < 0) ? s1 : Math.min(s1, s2);
  let depth = 0, j = start, inStr = false, q = "";
  for (; j < html.length; j++) {
    const c = html[j];
    if (inStr) { if (c === "\\") j++; else if (c === q) inStr = false; continue; }
    if (c === '"' || c === "'" || c === "`") { inStr = true; q = c; continue; }
    if (c === "[" || c === "{") depth++;
    else if (c === "]" || c === "}") { depth--; if (depth === 0) break; }
  }
  return eval("(" + html.slice(start, j + 1) + ")");
}

const M = grab("const M =");
const BESTUURSRAAD = grab("const BESTUURSRAAD");
const AGENCY_TYPE = grab("const AGENCY_TYPE");
const AGENCY_SITE = grab("const AGENCY_SITE");
const AGENCY_DETAIL = grab("const AGENCY_DETAIL");   // bevat per dienst een org-URL; vult AGENCY_SITE aan
const PERSON_URL = grab("const PERSON_URL");         // uitzonderingen waar de officiele slug afwijkt
const MIN_INTRO = grab("const MIN_INTRO");
const DG_DIRS = grab("const DG_DIRS");           // bevat _src/_date: het officiele organogram en de stand daarvan
const INTRO_URL = grab("const INTRO_URL");       // introductiedossier per ministerie
const ADR_UPDATED = grab("const ADR_UPDATED");   // stand van de ADR-index per ministerie
const ADR_BASE = (html.match(/const ADR_BASE = "([^"]+)"/) || [])[1];
const AR_DOCS = (html.match(/const AR_DOCS="([^"]+)"/) || [])[1];
const FTE = grab("const FTE");
const REPORTS = grab("const REPORTS = ");
const DATA_UPDATED = (html.match(/const DATA_UPDATED = "([^"]+)"/) || [])[1];
if (!DATA_UPDATED) throw new Error("DATA_UPDATED niet gevonden");
// vaste URL's van alle onderdeel- en rapportpagina's (fase 2); zie maak-slugregister.mjs
if (!fs.existsSync("slugregister.json")) throw new Error("slugregister.json ontbreekt: draai eerst node maak-slugregister.mjs");
const REGISTER = JSON.parse(fs.readFileSync("slugregister.json", "utf8"));
const { maakLinker } = await import("./linkify.mjs");
const linkify = maakLinker(REGISTER, HOST);   // organisatienamen in beschrijvingen worden interne links

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// zelfde persoons-URL als in de kaart: uitzondering uit PERSON_URL, anders de standaard-slug op rijksoverheid.nl
const personSlug = nm => (nm || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/['’.]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const personUrl = nm => PERSON_URL[nm] || ("https://www.rijksoverheid.nl/regering/bewindspersonen/" + personSlug(nm));
const telling = mid => {
  const arr = REPORTS[mid] || [];
  const cnt = s => arr.filter(r => (r.src || "ADR") === s).length;
  return { adr: cnt("ADR"), ar: cnt("AR"), insp: cnt("INSP"), ext: cnt("EXT") };
};

const CSS = `
:root{--blauw:#154273;--teal:#0f6f8e;--ink:#15233b;--ink2:#3d4a5c;--faint:#616b78;--hair:#e3e8ee;--bg:#f4f7fa;--card:#ffffff}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.65 "Segoe UI",system-ui,-apple-system,sans-serif}
a{color:var(--teal)}
.top{background:#fff;border-bottom:1px solid var(--hair);padding:14px 20px}
.top a{font-family:Georgia,"Times New Roman",serif;font-weight:700;font-size:22px;color:var(--blauw);text-decoration:none;border-left:4px solid var(--blauw);padding-left:10px}
.top a b{color:var(--teal)}
main{max-width:880px;margin:0 auto;padding:26px 20px 40px}
.crumb{font-size:13px;color:var(--faint);margin:0 0 14px}
.crumb a{color:var(--faint)}
h1{font-family:Georgia,"Times New Roman",serif;color:var(--blauw);font-size:30px;line-height:1.25;margin:0 0 4px}
.tagline{color:var(--ink2);margin:0 0 6px;font-size:17px}
.meta{color:var(--faint);font-size:13.5px;margin:0 0 18px}
.cta{display:inline-block;background:var(--blauw);color:#fff;text-decoration:none;border-radius:9px;padding:10px 18px;font-weight:600;margin:2px 10px 18px 0}
.cta.sec{background:#fff;color:var(--blauw);border:1px solid var(--hair)}
h2{font-family:Georgia,"Times New Roman",serif;color:var(--blauw);font-size:21px;margin:30px 0 10px}
.card{background:var(--card);border:1px solid var(--hair);border-radius:12px;padding:16px 18px;margin:0 0 12px}
.mifn{margin:8px 0 0;padding-left:20px}
.mifn li{margin:4px 0}
ul.lijst{list-style:none;margin:0;padding:0}
ul.lijst li{padding:9px 0;border-top:1px solid var(--hair)}
ul.lijst li:first-child{border-top:0}
.rol{color:var(--faint);font-size:13px;display:block}
.naam{font-weight:600}
.pil{display:inline-block;font-size:11px;font-weight:600;letter-spacing:.3px;text-transform:uppercase;color:var(--teal);background:#e3eef3;border-radius:20px;padding:1px 8px;margin-left:7px;vertical-align:1px}
.desc{color:var(--ink2);font-size:14.5px;margin:2px 0 0}
.andere{font-size:14px;line-height:2}
footer{border-top:1px solid var(--hair);margin-top:36px;padding-top:16px;font-size:13px;color:var(--faint)}
footer p{margin:6px 0}
`;

const alle = M.map(m => ({ id: m.id, slug: m.slug, name: m.name }));

function pagina(m) {
  const t = telling(m.id);
  const totaal = t.adr + t.ar + t.insp + t.ext;
  const bronParts = [[t.adr, "Auditdienst Rijk", "Auditdienst Rijk"], [t.ar, "Algemene Rekenkamer", "Algemene Rekenkamer"], [t.insp, "toezichtsrapport", "toezichtsrapporten"], [t.ext, "onderzoeksrapport", "onderzoeksrapporten"]].filter(x => x[0] > 0).map(x => x[0] + " " + (x[0] === 1 ? x[1] : x[2])).join(", ");
  const officieel = `https://www.rijksoverheid.nl/ministeries/ministerie-van-${m.slug}`;
  const canoniek = `${HOST}/${m.slug}/`;
  const kaart = `${HOST}/#${m.id}`;
  const fte = FTE[m.id];

  const bewind = [
    ...m.people.map(p => ({ role: p.role, nm: p.nm, pa: p.pa })),
    ...(m.folded || []).flatMap(f => f.min ? [{ role: "Minister van " + f.name, nm: f.min.nm, pa: f.min.pa }] : []),
  ];
  const raad = BESTUURSRAAD[m.id] || [];
  const titel = `Ministerie van ${m.name} (${m.abbr}): organogram, leiding en rapporten | Rijksmap`;
  const beschr = `Wie leidt het ministerie van ${m.name} en hoe is het opgebouwd? Bewindspersonen, bestuursraad, ${m.dg.length} directoraten-generaal en ${m.ag.length} diensten en organisaties, plus ${totaal} onderzoeksrapporten van de Auditdienst Rijk, de Algemene Rekenkamer, toezichthouders en andere onderzoekers sinds 2019.`;

  const jsonld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Rijksmap", "item": HOST + "/" },
          { "@type": "ListItem", "position": 2, "name": "Ministerie van " + m.name, "item": canoniek },
        ],
      },
      {
        "@type": "GovernmentOrganization",
        "@id": canoniek + "#org",
        "name": "Ministerie van " + m.name,
        "alternateName": m.abbr,
        "url": canoniek,
        "sameAs": [officieel],
        "parentOrganization": { "@type": "GovernmentOrganization", "name": "Rijksoverheid", "url": "https://www.rijksoverheid.nl" },
        "subOrganization": m.dg.map(d => ({ "@type": "GovernmentOrganization", "name": d[1] })),
        ...(fte ? { "numberOfEmployees": { "@type": "QuantitativeValue", "value": Number(String(fte).replace(/\./g, "")) } } : {}),
        "employee": bewind.map(p => ({ "@type": "Person", "name": p.nm, "jobTitle": p.role })),
      },
    ],
  };

  const bewindHtml = bewind.map(p => `<li><span class="rol">${esc(p.role)}</span><span class="naam"><a href="${esc(personUrl(p.nm))}" rel="noopener">${esc(p.nm)}</a></span>${p.pa ? `<span class="pil">${esc(p.pa)}</span>` : ""}</li>`).join("\n");
  const raadHtml = raad.map(p => `<li><span class="rol">${esc(p.role)}</span><span class="naam">${p.u ? `<a href="${esc(p.u)}" rel="noopener">${esc(p.nm)}</a>` : esc(p.nm)}</span></li>`).join("\n");
  // elk onderdeel linkt naar zijn eigen pagina uit het slugregister; is een DG samengevoegd met een
  // dienst (DG Belastingdienst), dan wijst de link naar die ene dienstpagina
  const ondUrl = (mid, soort, code) => {
    let it = REGISTER.onderdelen[`${mid}|${soort}|${code}`];
    if (it && it.alias) it = REGISTER.onderdelen[it.alias];
    return it ? `${HOST}/${REGISTER.ministeries[it.mid].slug}/${it.slug}/` : null;
  };
  const dgHtml = m.dg.map(d => {
    const u = ondUrl(m.id, "dg", d[0]);
    return `<li><span class="naam">${u ? `<a href="${u}">${esc(d[1])}</a>` : esc(d[1])}</span>${d[2] ? `<p class="desc">${linkify(esc(d[2]), `${m.id}|dg|${d[0]}`)}</p>` : ""}</li>`;
  }).join("\n");
  const agHtml = m.ag.map(a => {
    const type = AGENCY_TYPE[a[0]];
    const u = ondUrl(m.id, "ag", a[0]);
    // eigen website; ontbreekt die, dan de officiele organisatiepagina uit AGENCY_DETAIL (die de kaart ook gebruikt)
    const site = AGENCY_SITE[a[0]] || (AGENCY_DETAIL[a[0]] && AGENCY_DETAIL[a[0]].org) || "";
    const naam = u ? `<a href="${u}">${esc(a[1])}</a>` : (site ? `<a href="${esc(site)}" rel="noopener">${esc(a[1])}</a>` : esc(a[1]));
    const extra = u && site ? ` <a class="ddsrc" href="${esc(site)}" rel="noopener" style="font-size:13px">officiële site</a>` : "";
    return `<li><span class="naam">${naam}</span>${type ? `<span class="pil">${esc(type)}</span>` : ""}${extra}${a[2] ? `<p class="desc">${linkify(esc(a[2]), `${m.id}|ag|${a[0]}`)}</p>` : ""}</li>`;
  }).join("\n");
  const andere = alle.filter(x => x.id !== m.id)
    .map(x => `<a href="${HOST}/${x.slug}/">${esc(x.name)}</a>`).join(" &middot; ");
  const intro = linkify(MIN_INTRO[m.id] || "", "min|" + m.id);   // intro is al HTML; linkify laat bestaande links met rust
  const vro = (m.folded || []).map(f => f.note ? `<p class="desc"><b>${esc(f.name)}:</b> ${esc(f.note)}</p>` : "").join("");

  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' https://analytics.tiiny.net https://analytics.tiiny.site; style-src 'unsafe-inline'; img-src 'self' data: https://analytics.tiiny.net https://analytics.tiiny.site; font-src data:; connect-src https://analytics.tiiny.net https://analytics.tiiny.site; base-uri 'none'; form-action 'none'; upgrade-insecure-requests" />
<meta name="referrer" content="strict-origin-when-cross-origin" />
<title>${esc(titel)}</title>
<meta name="description" content="${esc(beschr)}" />
<link rel="canonical" href="${canoniek}" />
<meta name="author" content="Robert Worm" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${esc(titel)}" />
<meta property="og:description" content="${esc(beschr)}" />
<meta property="og:url" content="${canoniek}" />
<meta property="og:image" content="${HOST}/og-image.png" />
<meta property="og:locale" content="nl_NL" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="icon" href="/favicon.png" type="image/png" sizes="96x96" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
<style>${CSS}</style>
</head>
<body>
<header class="top"><a href="${HOST}/">Rijks<b>map</b></a></header>
<main>
<p class="crumb"><a href="${HOST}/">Rijksmap</a> &rsaquo; Ministerie van ${esc(m.name)}</p>
<h1>Ministerie van ${esc(m.name)} (${esc(m.abbr)})</h1>
<p class="tagline">${esc(m.en)}</p>
<p class="meta">${fte ? `${esc(fte)} fte &middot; ` : ""}${totaal} onderzoeksrapporten sinds 2019 (${bronParts})</p>
<a class="cta" href="${kaart}">Open in de interactieve Rijksmap</a>
<a class="cta sec" href="${officieel}" rel="noopener">Officiële pagina (rijksoverheid.nl)</a>
${intro ? `<h2>In het kort</h2>\n<div class="card">${intro}${vro}</div>` : ""}
<h2>Bewindspersonen</h2>
<div class="card"><ul class="lijst">
${bewindHtml}
</ul></div>
${raad.length ? `<h2>Ambtelijke top (bestuursraad)</h2>
<div class="card"><ul class="lijst">
${raadHtml}
</ul></div>` : ""}
<h2>Directoraten-generaal</h2>
<div class="card"><ul class="lijst">
${dgHtml}
</ul></div>
<h2>Diensten en organisaties</h2>
<div class="card"><ul class="lijst">
${agHtml}
</ul></div>
<h2>Onderzoeksrapporten</h2>
<div class="card"><p>Over dit ministerie staan <b>${totaal} rapporten</b> sinds 2019 in de Rijksmap: ${bronParts}. Ze komen van de <b>Auditdienst Rijk</b> (de interne auditdienst van het Rijk), de <b>Algemene Rekenkamer</b> (de onafhankelijke externe controleur), de <b>toezichthouders</b> (rijksinspecties en andere wettelijke toezichthouders) en <b>overige onderzoekers</b> (externe bureaus, onderzoekscommissies, evaluatiediensten en zelfevaluaties). Elk rapport is gelezen, per organisatieonderdeel ingedeeld en gelabeld op risicothema.</p>
<a class="cta" href="${kaart}">Bekijk de rapporten per onderdeel</a></div>
<h2>Bronnen</h2>
<div class="card"><dl class="kv">
<dt>Structuur en organogram</dt><dd>${(DG_DIRS[m.id] || {})._src ? `<a href="${esc((DG_DIRS[m.id] || {})._src)}" rel="noopener">officieel organogram op rijksoverheid.nl</a>${(DG_DIRS[m.id] || {})._date ? ` (stand ${esc((DG_DIRS[m.id] || {})._date)})` : ""}` : `<a href="${esc(officieel)}" rel="noopener">rijksoverheid.nl</a>`}</dd>
<dt>Bewindspersonen</dt><dd><a href="https://www.rijksoverheid.nl/regering/bewindspersonen" rel="noopener">rijksoverheid.nl</a></dd>
<dt>Ambtelijke top</dt><dd>benoemingsberichten van de <a href="https://www.algemenebestuursdienst.nl" rel="noopener">Algemene Bestuursdienst</a></dd>
${INTRO_URL[m.id] ? `<dt>Toelichting</dt><dd><a href="${esc(INTRO_URL[m.id])}" rel="noopener">Introductiedossier bewindspersonen</a> (editie 23 feb 2026)</dd>` : ""}
<dt>Rapporten</dt><dd><a href="${esc(ADR_BASE + m.adrslug)}" rel="noopener">ADR-index op rijksoverheid.nl</a>, <a href="${esc(AR_DOCS)}" rel="noopener">rekenkamer.nl</a>, <a href="https://www.rijksoverheid.nl/documenten" rel="noopener">rijksoverheid.nl</a> en <a href="https://open.overheid.nl/zoeken" rel="noopener">open.overheid.nl</a></dd>
<dt>Bijgewerkt</dt><dd>${esc(DATA_UPDATED)}${ADR_UPDATED[m.id] ? `, ADR-index ${esc(ADR_UPDATED[m.id])}` : ""}</dd>
</dl>
<p class="desc">De indeling van rapporten per organisatieonderdeel komt uit de rapportreview van de Rijksmap; de risicolabels zijn met een AI-model toegekend en niet door mensen gevalideerd.</p></div>
<h2>Andere ministeries</h2>
<p class="andere">${andere}</p>
<footer>
<p>De Rijksmap is een onafhankelijk initiatief van Robert Worm en geen officiële uiting van de rijksoverheid. Samengesteld uit openbare bronnen (rijksoverheid.nl, de Algemene Bestuursdienst, rekenkamer.nl en eigen websites van organisaties); overheidsdata: CC0.</p>
<p>De risicolabels horen bij de rapporten en organisatieonderdelen, niet bij personen, en zijn met een AI-model toegekend en niet door mensen gevalideerd. Staat u vermeld en klopt er iets niet, of hebt u bezwaar? U hebt als betrokkene recht op rectificatie, bezwaar of verwijdering (AVG). Verwerkingsverantwoordelijke: Robert Worm, <a href="mailto:info@rijksmap.nl?subject=Rijksmap%3A%20correctie%2C%20bezwaar%20of%20verwijdering&amp;body=Om%20welke%20vermelding%20gaat%20het%20(naam%2C%20onderdeel%20of%20URL)%3A%20%0AWat%20is%20uw%20verzoek%20(rectificatie%20%2F%20bezwaar%20%2F%20verwijdering)%3A%20%0AToelichting%3A%20%0A%0A">info@rijksmap.nl</a>. Reactie zo spoedig mogelijk, uiterlijk binnen vier weken.</p>
<p>Laatst bijgewerkt: ${esc(DATA_UPDATED)} &middot; <a href="${HOST}/">rijksmap.nl</a>, de rijksoverheid in kaart.</p>
</footer>
</main>
</body>
</html>
`;
}

let fouten = 0;
const slugs = [];
for (const m of M) {
  const dir = m.slug;
  const out = pagina(m);
  if (/\u2014/.test(out)) { console.error("EM-DASH in", m.id); fouten++; }
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), out);
  slugs.push(m.slug);
  console.log(`${m.id.padEnd(4)} -> ${dir}/index.html (${(out.length / 1024).toFixed(1)} kB)`);
}
if (fouten) throw new Error("em-dashes gevonden, sitemap niet geschreven");

// sitemap.xml wordt niet meer hier geschreven: die bevat sinds fase 2 ook alle onderdeel- en
// rapportpagina's en komt uit maak-sitemap.mjs (leest slugregister.json).
console.log(`\n${slugs.length} ministeriepagina's; sitemap volgt uit maak-sitemap.mjs`);
