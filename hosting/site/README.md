# De huidige site in een container (`hosting/site/`)

> **In het kort:** één Dockerfile die de huidige, statische Rijksmap serveert zoals GitHub Pages dat doet. Bedoeld voor Sliplane, als service naast Omnibus op dezelfde server. Zie story R2-2 in de [backlog](../../.github/backlog/transitie-2026-10.mjs).

## Hoe werkt het?

1. **Bouwen.** De host haalt de code op uit deze repository en bouwt met `hosting/site/Dockerfile`, context `.`.
2. **Comprimeren.** `comprimeer.mjs` zet naast elk tekstbestand groter dan 1 kB een `.gz`-versie. De sitebestanden zelf veranderen niet.
3. **Serveren.** `server.mjs` is een kleine webserver zonder pakketten van buiten. Hij serveert mappen met `index.html` en verwijst `/map` door naar `/map/`, zoals Pages. Browsers die gzip aankunnen, krijgen de `.gz`-versie.
4. **Starten.** De image draait als gewone gebruiker (UID 1000), met alle bestanden alleen-lezen.

De basis-image is dezelfde vastgepinde Node-image als in Omnibus.

## Op je eigen computer draaien

Met [Docker](https://www.docker.com/products/docker-desktop/):

```text
docker build -t rijksmap-site -f hosting/site/Dockerfile https://github.com/Robert-Worm/rijksmap.git#main
docker run --rm -p 8080:8080 rijksmap-site
```

Open daarna `http://localhost:8080`.

Zonder Docker kan het ook, vanuit de hoofdmap van de repository:

```text
node hosting/site/server.mjs
```

Dan serveert hij de bestanden ongecomprimeerd, op poort 8080.

## Instellingen bij de host

| Instelling | Waarde |
| --- | --- |
| Bron | `https://github.com/Robert-Worm/rijksmap`, tak `main` |
| Bouwen | Dockerfile `hosting/site/Dockerfile`, context `.` |
| Poort | `PORT`; standaard 8080 |
| `PUBLIC_ORIGIN` | Optioneel. Het openbare adres, bijvoorbeeld `https://www.rijksmap.nl` (zonder `/` aan het eind) |
| `REDIRECT_HOSTS` | Optioneel. Hostnamen die naar `PUBLIC_ORIGIN` doorverwijzen, gescheiden door komma's, bijvoorbeeld `rijksmap.nl`. Werkt alleen als `PUBLIC_ORIGIN` is ingesteld |
| Gezondheidscontrole | `/` (de voorpagina) |
| Geheugen | Gemeten op 30 oktober 2026, lokaal: circa 75 MB in rust, circa 110 MB na 500 verzoeken (20 tegelijk) |

## Privacy

De server logt geen bezoeken en geen IP-adressen. Hij schrijft alleen één regel bij het starten, en bij een fout alleen de soort fout. Een test bewaakt dat. Wat Sliplane zelf logt, staat hier los van; dat zoekt story R2-3 uit.

## Wat er (nog) anders is dan bij Pages

- **404-pagina:** een korte eigen pagina met een link naar de kaart, in plaats van de 404-pagina van GitHub.
- **Compressie:** gzip in plaats van wat Pages gebruikt. De kaart (`index.html`, 9,9 MB) gaat als 2,8 MB over de lijn.
- **Headers:** `X-Content-Type-Options: nosniff` en `Cache-Control: max-age=600`. Extra beveiligingsheaders volgen in story R2-3.

## Testen

```text
node --test hosting/site/server.test.mjs
```

---

[↑ README](../../README.md) · [Architectuur](../../docs/architectuur.md) · [Routekaart](../../docs/routekaart.md)
