# Bouwen (`bouw/`)

> **In het kort:** `node bouw/bouw.mjs` bouwt de huidige Rijksmap uit de bronbestanden in [`bron/`](../bron/). Het resultaat staat in `.bouw/werk/dist`. Op 30 oktober 2026 leverde de build alle 9.394 bestanden precies gelijk aan de gepubliceerde site.

## Bouwen

Je hebt alleen [Node.js](https://nodejs.org/) nodig (getest met versie 22 en 24); er zijn geen pakketten te installeren.

```text
node bouw/bouw.mjs                 bouwt de site in .bouw/werk/dist
node bouw/bouw.mjs --zip           idem, plus .bouw/werk/rijksmap-dist.zip
node bouw/bouw.mjs --controleer    bouwt en vergelijkt elk bestand met de gepubliceerde site
node bouw/bouw.mjs --bijwerken     zet registers die de build bijwerkte terug in bron/
```

Een build duurt ongeveer een halve minuut.

## Wat er gebeurt

1. `bouw.mjs` zet de inhoud van `bron/` in een lege werkmap `.bouw/werk`. De vorige open data (CSV en JSON) komt uit de gepubliceerde site. `bron/` zelf verandert niet.
2. `maak-dist.mjs` draait daar de keten:
   - **Controle:** `verify-ar.mjs` stopt de build bij een em-dash of een JavaScript-fout in `rijksmap.html`.
   - **Pagina's:** `maak-slugregister.mjs` (vaste adressen), `sync-versietekst.mjs`, `maak-databestand.mjs` (open data), `maak-subpaginas.mjs` (ministeries), `maak-detailpaginas.mjs` (onderdelen en rapporten) en `maak-sitemap.mjs`.
   - **Pakket:** alles naar `dist/`, met samenhangcontroles: dode verwijzingen, dubbele adressen, em-dashes en Gmail-adressen breken de build.
3. Werkte de build een register bij (`slugregister.json`, `lastmod-register.json` of `rijksmap.html`), dan meldt `bouw.mjs` dat. Met `--bijwerken` komen ze terug in `bron/`, zodat je ze kunt committen.

## De bestanden

| Bestand | Rol |
| --- | --- |
| `bouw.mjs` | Werkmap klaarzetten, keten draaien, vergelijken met de gepubliceerde site |
| `maak-dist.mjs` | De keten: controleren, pagina's maken, `dist/` opbouwen, inpakken |
| `verify-ar.mjs` | Em-dashes en JavaScript-fouten in `rijksmap.html` |
| `maak-slugregister.mjs` | Vaste adressen voor onderdelen en rapporten, in `slugregister.json` |
| `sync-versietekst.mjs` | Het paginatotaal in de versiegeschiedenis van de kaart |
| `maak-databestand.mjs` | `rijksmap-rapporten.csv` en `.json` |
| `maak-subpaginas.mjs` | De twaalf ministeriepagina's |
| `maak-detailpaginas.mjs` | De pagina's per onderdeel en per rapport |
| `maak-sitemap.mjs` | `sitemap.xml`, met een eigen datum per pagina uit `lastmod-register.json` |
| `pagina-shell.mjs`, `linkify.mjs`, `rijksmap-data.mjs` | Gedeelde opmaak, interne links, en het uitlezen van de data uit `rijksmap.html` |
| `maak-zip.mjs` | Het zip-pakket voor de releases |
| `zoektest.mjs` | Speelt de zoekfunctie van de kaart na: `node bouw/zoektest.mjs "toeslagen"` |

## In `bron/`

| Bestand | Wat |
| --- | --- |
| `rijksmap.html` | De kaart: data, stijl en logica in één bestand |
| `slugregister.json` | Register van vaste adressen; zorgt dat een pagina zijn adres houdt |
| `lastmod-register.json` | Per pagina de datum van de laatste echte wijziging, voor de sitemap |
| `rijksmap-rfo.json` | Onderbouwingen bij de risicothema's |
| `favicon.*`, `apple-touch-icon.png`, `og-image.png`, `robots.txt`, `security.txt`, `_headers` | Vaste bestanden |

## Herkomst

De scripts komen uit de werkmap van de beheerder, waar de site tot oktober 2026 werd gebouwd. Overgenomen is alleen de set die nodig is om de site te bouwen; de eenmalige scripts voor het ophalen, lezen en beoordelen van rapporten bleven daar. Aanpassingen bij het overnemen:

- de scripts worden aangeroepen vanuit `bouw/`, ook als de werkmap elders staat;
- `certutil` (alleen Windows) is vervangen door een controlegetal in Node;
- de controle op een persoonlijk e-mailadres is een algemene controle op Gmail-adressen geworden;
- em-dashes in de controles zelf staan als `\u2014`, zodat de scripts door hun eigen huisstijlcontrole komen.

---

[↑ README](../README.md) · [Architectuur](../docs/architectuur.md) · [Routekaart](../docs/routekaart.md)
