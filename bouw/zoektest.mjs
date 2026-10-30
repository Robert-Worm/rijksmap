// zoektest.mjs: speelt de chip-matching van rijksmap.html exact na in Node, met per treffer
// de reden (welk veld matchte). Voor precisie-onderzoek: geeft een zoekterm te generieke
// resultaten? Gebruik:
//   node bouw/zoektest.mjs "toeslagen"       samenvatting + voorbeelden
//   node bouw/zoektest.mjs "toeslagen" --alles  alle treffers (datum | veld | titel)
// De matcher is een letterlijke port van zoekVouw/zoekStam/zoekKort/zoekUitgang/yqTermMatch/
// yqChipMatch (stand 06-08-2026) incl. jaartal- en bereik-chips en de hooi-velden
// [titel, tags, samenvatting, dienst, auteur, bak-label, bronlabels, ministerie].
import fs from "node:fs";

const html=fs.readFileSync(new URL("../bron/rijksmap.html",import.meta.url),"utf8");
function pak(anker,open,dicht){
  const i=html.indexOf(anker); if(i<0) throw new Error("anker niet gevonden: "+anker);
  const vs=html.indexOf(open,i);
  let d=0,s=false,e=false,end=-1;
  for(let j=vs;j<html.length;j++){const c=html[j];
    if(e){e=false;continue} if(c==="\\"){e=true;continue} if(c==='"'){s=!s;continue} if(s)continue;
    if(c===open)d++; else if(c===dicht){d--; if(!d){end=j+1;break}}}
  return html.slice(vs,end);
}
const REPORTS=JSON.parse(pak("const REPORTS = ","{","}"));
const M=JSON.parse(pak("const M = ","[","]"));
if(!M.some(m=>m.id==="RB")) M.push({id:"RB",abbr:"RB",name:"Rijksbreed"});
const BODY_LABEL=JSON.parse(pak("const BODY_LABEL=","{","}"));
const SRC_FULL={ADR:"Auditdienst Rijk",AR:"Algemene Rekenkamer",INSP:"Rijksinspecties en andere toezichthouders",EXT:"Onderzoeken en evaluaties"};
const SRC_PILL={ADR:"ADR",AR:"AR",INSP:"Toezicht",EXT:"Onderzoek"};
const byId=Object.fromEntries(M.map(m=>[m.id,m]));
const blabel=b=>BODY_LABEL[b]||b;
const srcOf=r=>r.src||"ADR";

// ---- letterlijke port van de matchers ----
const zoekVouw=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
const zoekStam=s=>{const v=zoekVouw(s);return v.length>5?v.replace(/(?:en|s)$/,""):v;};
const esc=t=>t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
const zoekKort=t=>new RegExp("(^|[^a-z0-9])"+esc(t)+"($|[^a-z0-9])");   // heel woord (stand 06-08-2026)
const _uit={};
const zoekUitgang=t=>_uit[t]||(_uit[t]=new RegExp(esc(t)+"(?:(?:en|e|s)?(?![a-z0-9])|[a-z0-9]{3})"));
const _kort={};
const yqTermMatch=(h,t)=>{ if(t.length<5){const re=_kort[t]||(_kort[t]=zoekKort(t));return re.test(h);}
 if(zoekUitgang(t).test(h)) return true; const st=zoekStam(t); return st!==t&&st.length>=4&&zoekUitgang(st).test(h); };
function chipMatch(hooi,c){
  const s=String(c).trim();
  if(/^\d{4}$/.test(s)) return hooi.jaar===s;
  const jb=s.match(/^(\d{4})\s*-\s*(\d{4})$/);
  if(jb){const y=+hooi.jaar;return !!y&&y>=Math.min(+jb[1],+jb[2])&&y<=Math.max(+jb[1],+jb[2]);}
  if(hooi.bx.has(zoekVouw(s))) return true;   // bron/ministerie: hele term exact (stand 06-08-2026)
  const ts=zoekVouw(s).split(/[\s\-]+/).filter(t=>t.length>=2);
  if(!ts.length) return false;
  return ts.every(t=>yqTermMatch(hooi.alles,t));
}
// veld-attributie: EERSTE veld (in deze volgorde) waarin alle termen samen matchen
const VELDEN=["titel","tag","dienst","bak","auteur","samenvatting"];
function waarom(hooi,c){
  const s=String(c).trim();
  if(/^\d{4}(\s*-\s*\d{4})?$/.test(s)) return "publicatiejaar";
  const ts=zoekVouw(s).split(/[\s\-]+/).filter(t=>t.length>=2);
  for(const v of VELDEN) if(ts.length&&ts.every(t=>yqTermMatch(hooi[v],t))) return v;
  if(hooi.bx.has(zoekVouw(s))) return "bron_of_ministerie (exact)";
  return "combinatie van velden";   // termen verspreid over meerdere velden
}

const rijen=[];
for(const mid in REPORTS) for(const r of REPORTS[mid]){
  const m=byId[mid]||{name:mid,abbr:mid}, src=srcOf(r);
  const h={
    titel:zoekVouw(r.t), tag:zoekVouw(r.tg||""), dienst:zoekVouw(r.dd||""),
    bak:zoekVouw(blabel(r.b)), auteur:zoekVouw(r.org||""), samenvatting:zoekVouw(r.sm||""),
    bx:new Set([src,SRC_PILL[src],SRC_FULL[src],m.name,m.abbr].filter(Boolean).map(zoekVouw)),
    jaar:String(r.d||"").slice(0,4)
  };
  h.alles=[h.titel,h.tag,h.samenvatting,h.dienst,h.auteur,h.bak].join(" ");
  rijen.push({d:r.d,t:r.t,mid,h});
}

const term=process.argv[2];
if(!term){ console.log("gebruik: node zoektest.mjs \"term\" [--alles]"); process.exit(1); }
const treffers=rijen.filter(x=>chipMatch(x.h,term)).map(x=>({d:x.d,mid:x.mid,t:x.t,veld:waarom(x.h,term)}));
treffers.sort((a,b)=>b.d.localeCompare(a.d));
const perVeld={}; treffers.forEach(x=>perVeld[x.veld]=(perVeld[x.veld]||0)+1);
console.log(JSON.stringify({term,aantal:treffers.length,perVeld},null,1));
if(process.argv.includes("--alles")){
  treffers.forEach(x=>console.log(`${x.d} | ${x.veld.padEnd(20)} | ${x.mid.padEnd(4)} | ${x.t.slice(0,95)}`));
}else{
  const stap=Math.max(1,Math.floor(treffers.length/12));
  console.log("\nVoorbeelden (gespreid):");
  for(let i=0;i<treffers.length;i+=stap) console.log(`${treffers[i].d} | ${treffers[i].veld.padEnd(20)} | ${treffers[i].t.slice(0,90)}`);
  const smOnly=treffers.filter(x=>x.veld==="samenvatting").slice(0,8);
  if(smOnly.length){ console.log("\nAlleen-samenvatting-treffers (het kanaal met de meeste bijvangst):");
    smOnly.forEach(x=>console.log(`${x.d} | ${x.t.slice(0,90)}`)); }
}
