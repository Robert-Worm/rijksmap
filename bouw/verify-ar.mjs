import fs from "node:fs"; import vm from "node:vm";
const h=fs.readFileSync("rijksmap.html","utf8");
console.log("em-dashes:",(h.match(/\u2014/g)||[]).length);
// JS syntax check on all script blocks except ld+json
let m,re=/<script([^>]*)>([\s\S]*?)<\/script>/g,ok=0,bad=0;
while((m=re.exec(h))){ if(/ld\+json/.test(m[1]))continue; try{new vm.Script(m[2]);ok++;}catch(e){bad++;console.log("JS FOUT:",e.message.slice(0,120));} }
console.log("script-blokken OK:",ok,"fout:",bad);
const a=h.indexOf("const REPORTS = ");
let i0=h.indexOf("{",a),d=0,inS=false,q="",e=-1;
for(let p=i0;p<h.length;p++){const c=h[p];
  if(inS){ if(c==="\\")p++; else if(c===q)inS=false; continue;}
  if(c==='"'||c==="'"||c==="`"){inS=true;q=c;continue;}
  if(c==="{")d++; else if(c==="}"){d--; if(d===0){e=p;break;}}}
const R=eval("("+h.slice(i0,e+1)+")");
let ar=0,arOg=0,arNoOg=0,adrOg=0,total=0;
for(const arr of Object.values(R))for(const r of arr){ total++;
  if(r.src==="AR"){ ar++; if(r.og)arOg++; else arNoOg++; } else if(r.og)adrOg++; }
console.log(`totaal rapporten:${total} | AR:${ar} (og:${arOg} zonder-og:${arNoOg}) | ADR og:${adrOg}`);
