// linkify.mjs: zet organisatienamen die in een beschrijving voorkomen om in een interne link naar
// de pagina van die organisatie. Werkt op AL GEESCAPETE html-tekst en raakt nooit iets binnen een
// tag of binnen een bestaande <a>. Elk doel wordt hooguit een keer per tekstblok gelinkt, zodat er
// geen linkbrij ontstaat. Verwijzingen naar de pagina zelf worden overgeslagen.
import { esc } from "./pagina-shell.mjs";

export function maakLinker(reg, HOST) {
  const items = [];
  const zien = new Set();
  const voegToe = (tekst, url, key, gevoelig) => {
    if (!tekst || tekst.length < 3) return;
    const k = (gevoelig ? "A|" : "a|") + tekst;
    if (zien.has(k)) return;            // eerste voorkomen wint (RVO staat bij EZK en LVVN)
    zien.add(k);
    items.push({ tekst: esc(tekst), url, key, gevoelig });
  };
  for (const [key, o] of Object.entries(reg.onderdelen)) {
    if (o.alias) continue;
    const url = `${HOST}/${reg.ministeries[o.mid].slug}/${o.slug}/`;
    voegToe(o.naam, url, key, false);
    // afkorting/code als losse ingang (RWS, ILT, DUO, CBR); alleen hoofdlettergevoelig, anders
    // matcht "om" in gewone tekst op het Openbaar Ministerie
    if (o.code && o.code !== o.naam && /^[A-Z][A-Za-z&.-]+$/.test(o.code)) voegToe(o.code, url, key, true);
  }
  for (const [mid, m] of Object.entries(reg.ministeries)) voegToe(m.naam, `${HOST}/${m.slug}/`, "min|" + mid, false);
  // langste eerst: "Inspectie Leefomgeving en Transport" moet voor "ILT" komen
  items.sort((a, b) => b.tekst.length - a.tekst.length);

  const escRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return function linkify(html, eigenKey) {
    if (!html) return html;
    const delen = String(html).split(/(<[^>]+>)/);   // even indexen = tekst, oneven = tag
    let inAnchor = 0;
    const gedaan = new Set();
    for (let i = 0; i < delen.length; i++) {
      const deel = delen[i];
      if (i % 2 === 1) {                              // een tag
        if (/^<a[\s>]/i.test(deel)) inAnchor++;
        else if (/^<\/a>/i.test(deel)) inAnchor = Math.max(0, inAnchor - 1);
        continue;
      }
      if (inAnchor || !deel.trim()) continue;
      let tekst = deel;
      for (const it of items) {
        if (it.key === eigenKey || gedaan.has(it.key)) continue;
        const re = new RegExp(`(^|[^\\w-])(${escRegex(it.tekst)})(?![\\w-])`, it.gevoelig ? "" : "i");
        if (!re.test(tekst)) continue;
        tekst = tekst.replace(re, (_, voor, gevonden) => `${voor}<a href="${it.url}">${gevonden}</a>`);
        gedaan.add(it.key);
      }
      delen[i] = tekst;
    }
    return delen.join("");
  };
}
