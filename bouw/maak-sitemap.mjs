// maak-sitemap.mjs: schrijft sitemap.xml met ALLE statische URL's uit slugregister.json
// (homepage, 12 ministeries, onderdelen, rapporten). Onderdelen met een alias krijgen geen eigen
// URL en staan er dus ook niet in. Draaien na maak-slugregister.mjs en maak-detailpaginas.mjs.
import fs from "node:fs";
import crypto from "node:crypto";
import { HOST } from "./pagina-shell.mjs";
import { DATA_UPDATED } from "./rijksmap-data.mjs";

const reg = JSON.parse(fs.readFileSync("slugregister.json", "utf8"));
const vandaag = new Date().toISOString().slice(0, 10);

/* Echte lastmod per pagina (herreview 23-08: een uniforme dagstempel voor 9.381 URL's is
   voor crawlers een waardeloos signaal). Per pagina wordt de INHOUD gehasht en vergeleken
   met de vorige ronde (lastmod-register.json): ongewijzigd -> de oude lastmod blijft staan,
   gewijzigd of nieuw -> vandaag. De pagina's dragen zelf alleen een maand-stempel
   ("bijgewerkt: augustus 2026"), dus de hash is stabiel binnen de maand. */
const LMREG = "lastmod-register.json";
const oud = fs.existsSync(LMREG) ? JSON.parse(fs.readFileSync(LMREG, "utf8")) : {};
const nieuw = {};
let vers = 0, behouden = 0;
const lastmodVoor = rel => {
  const pad = rel ? `${rel}/index.html` : "rijksmap.html";
  /* Ontbreekt de pagina, dan tóch registreren met een vaste hash. Zonder die registratie viel
     de URL elke run buiten het register en stempelde hij zich eeuwig "vers" (bughunt 23-08).
     In de dist-keten kan dit niet gebeuren (de build breekt af op een ontbrekende pagina),
     maar maak-sitemap.mjs wordt ook los gedraaid. */
  if (!fs.existsSync(pad)) {
    const vorige = oud[rel || "/"];
    const lm = (vorige && vorige.hash === "ontbreekt") ? vorige.lastmod : vandaag;
    if (vorige && vorige.hash === "ontbreekt") behouden++; else vers++;
    nieuw[rel || "/"] = { hash: "ontbreekt", lastmod: lm };
    return lm;
  }
  const hash = crypto.createHash("md5").update(fs.readFileSync(pad)).digest("hex");
  const vorige = oud[rel || "/"];
  const lm = (vorige && vorige.hash === hash) ? vorige.lastmod : vandaag;
  if (vorige && vorige.hash === hash) behouden++; else vers++;
  nieuw[rel || "/"] = { hash, lastmod: lm };
  return lm;
};

const url = (loc, rel, prio, freq) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmodVoor(rel)}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${prio}</priority>\n  </url>`;
const urls = [url(HOST + "/", "", "1.0", "monthly")];

for (const m of Object.values(reg.ministeries)) urls.push(url(`${HOST}/${m.slug}/`, m.slug, "0.8", "monthly"));
let nOnd = 0, nRap = 0;
for (const o of Object.values(reg.onderdelen)) {
  if (o.alias) continue;
  urls.push(url(`${HOST}/${reg.ministeries[o.mid].slug}/${o.slug}/`, `${reg.ministeries[o.mid].slug}/${o.slug}`, "0.7", "monthly"));
  nOnd++;
}
for (const r of Object.values(reg.rapporten)) { urls.push(url(`${HOST}/rapport/${r.slug}/`, `rapport/${r.slug}`, "0.5", "yearly")); nRap++; }
fs.writeFileSync(LMREG, JSON.stringify(nieuw));
console.log(`lastmod: ${vers} pagina's vers gestempeld, ${behouden} behouden uit de vorige ronde`);

fs.writeFileSync("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`);
const kb = (fs.statSync("sitemap.xml").size / 1024).toFixed(0);
console.log(`sitemap.xml: ${urls.length} URL's (1 homepage + ${Object.keys(reg.ministeries).length} ministeries + ${nOnd} onderdelen + ${nRap} rapporten), ${kb} kB, lastmod ${vandaag}, data ${DATA_UPDATED}`);
