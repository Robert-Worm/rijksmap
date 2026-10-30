// maak-zip.mjs: zip-schrijver in pure Node (zlib), voor het publicatiepakket.
//
// WAAROM NIET Compress-Archive: PowerShell 5.1 schrijft de padnamen in de zip met BACKSLASHES
// (algemene-zaken\index.html). De zip-standaard schrijft forward slashes voor. Uitpakkers die zich
// aan de standaard houden - zoals die van de hosting - zien dan geen mappen maar bestandsnamen met
// een rare letter erin, en houden alleen de echte rootbestanden over. Precies dat gebeurde op
// rijksmap.nl: index.html, sitemap.xml en de favicons stonden er wel, alle 2441 subpagina's niet.
//
// Gebruik: import { schrijfZip } from "./maak-zip.mjs"; schrijfZip("dist", "rijksmap-dist.zip");
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const TABEL = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = TABEL[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

// MS-DOS tijd/datum: seconden in stappen van 2, jaar geteld vanaf 1980
function dosTijd(d) {
  const jaar = Math.max(1980, d.getFullYear());
  return {
    tijd: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
    datum: ((jaar - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
  };
}

function alleBestanden(map, prefix = "") {
  const uit = [];
  for (const item of fs.readdirSync(map, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const vol = path.join(map, item.name);
    const naam = prefix ? prefix + "/" + item.name : item.name;   // ALTIJD forward slash
    if (item.isDirectory()) uit.push(...alleBestanden(vol, naam));
    else uit.push({ vol, naam });
  }
  return uit;
}

export function schrijfZip(bronMap, doelZip) {
  const bestanden = alleBestanden(bronMap);
  const lokaal = [], centraal = [];
  let offset = 0;

  for (const b of bestanden) {
    const ruw = fs.readFileSync(b.vol);
    const ingepakt = zlib.deflateRawSync(ruw, { level: 9 });
    const gebruikDeflate = ingepakt.length < ruw.length;
    const data = gebruikDeflate ? ingepakt : ruw;
    const methode = gebruikDeflate ? 8 : 0;
    const naam = Buffer.from(b.naam, "utf8");
    const crc = crc32(ruw);
    const { tijd, datum } = dosTijd(fs.statSync(b.vol).mtime);
    const vlaggen = 0x800;                                    // namen zijn UTF-8

    const kop = Buffer.alloc(30);
    kop.writeUInt32LE(0x04034b50, 0);
    kop.writeUInt16LE(20, 4); kop.writeUInt16LE(vlaggen, 6); kop.writeUInt16LE(methode, 8);
    kop.writeUInt16LE(tijd, 10); kop.writeUInt16LE(datum, 12);
    kop.writeUInt32LE(crc, 14); kop.writeUInt32LE(data.length, 18); kop.writeUInt32LE(ruw.length, 22);
    kop.writeUInt16LE(naam.length, 26); kop.writeUInt16LE(0, 28);
    lokaal.push(kop, naam, data);

    const cd = Buffer.alloc(46);
    cd.writeUInt32LE(0x02014b50, 0);
    cd.writeUInt16LE(20, 4); cd.writeUInt16LE(20, 6); cd.writeUInt16LE(vlaggen, 8); cd.writeUInt16LE(methode, 10);
    cd.writeUInt16LE(tijd, 12); cd.writeUInt16LE(datum, 14);
    cd.writeUInt32LE(crc, 16); cd.writeUInt32LE(data.length, 20); cd.writeUInt32LE(ruw.length, 24);
    cd.writeUInt16LE(naam.length, 28);
    cd.writeUInt32LE(0x81a40000, 38);                         // externe attributen: gewoon bestand, 0644
    cd.writeUInt32LE(offset, 42);
    centraal.push(cd, naam);

    offset += kop.length + naam.length + data.length;
  }

  const cdBuf = Buffer.concat(centraal);
  const eind = Buffer.alloc(22);
  eind.writeUInt32LE(0x06054b50, 0);
  eind.writeUInt16LE(bestanden.length, 8); eind.writeUInt16LE(bestanden.length, 10);
  eind.writeUInt32LE(cdBuf.length, 12); eind.writeUInt32LE(offset, 16);

  fs.writeFileSync(doelZip, Buffer.concat([Buffer.concat(lokaal), cdBuf, eind]));
  return bestanden.length;
}
