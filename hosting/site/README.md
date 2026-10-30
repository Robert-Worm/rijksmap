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
docker run --rm -e HTTPS_ONLY=0 -p 8080:8080 rijksmap-site
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
| `HTTPS_ONLY` | `1` activeert HSTS voor een host die publiek uitsluitend HTTPS serveert. De Sliplane-image zet dit aan. Bij lokaal HTTP-gebruik: `docker run -e HTTPS_ONLY=0 ...`. Rechtstreeks met Node staat het standaard uit. Vertrouwt geen door bezoekers aangeleverde proxyheaders |
| Gezondheidscontrole | `/` (de voorpagina) |
| Geheugen | Gemeten op 30 oktober 2026, lokaal: circa 75 MB in rust, circa 110 MB na 500 verzoeken (20 tegelijk) |

## Privacy

De applicatiecode schrijft geen toegangslog. De eigen logregels bevatten een startmelding (event en poort) of bij een interne fout alleen de foutcode of foutnaam, zonder fouttekst. De procestest controleert stdout en stderr met fictieve IP-adressen, zoekvragen, cookies en bezoekersheaders. Ook ongeldige HTTP-headers (400), te grote headers (431), een onbekende `Expect`-header (417) en een ongeldige absolute URL (500) zijn getest. Bij die laatste fout bevat stderr alleen `site_error` met `ERR_INVALID_URL`, zonder de aangeleverde URL.

Dit onderbouwt het loggedrag van het applicatieproces in de geteste configuratie en foutpaden. Het bewijst niet dat browsers geen externe verzoeken doen of dat de hostingketen geen bezoekersgegevens verwerkt of opslaat.

Onderzoek van de openbare Sliplane-bronnen op 30 oktober 2026:

| Onderdeel | Wat de bron bevestigt | Grens van de conclusie |
| --- | --- | --- |
| [Servicelog](https://docs.sliplane.io/services/logging/) | Procesuitvoer wordt bewaard, maximaal 15.000 regels uit de laatste zeven dagen. | Dit is geen bewaartermijn voor alle proxy- en infrastructuurlogs. Onze server schrijft geen bezoeken naar deze uitvoer. |
| [Reverse proxy](https://docs.sliplane.io/services/reverse-proxy/) | Publieke HTTP-verzoeken lopen via de proxy. Deze vervangt `X-Forwarded-For` door het IP-adres van de verbonden client; IPv6 blijft IPv6. | Het bezoekers-IP wordt dus verwerkt en doorgegeven. De bron zegt niet of de proxy het opslaat. |
| [Servicegebeurtenissen](https://docs.sliplane.io/services/service-events/) | Het platform registreert deployments, domeinwijzigingen, uitval bij gezondheidscontroles en volumeaansluitingen, inclusief fouten. | Dit zijn beheergebeurtenissen; de bron beschrijft geen toegangslog per bezoek of bijbehorende bewaartermijn. |
| [Verwerkersovereenkomst, versie 2.4](https://sliplane.io/legal/dpa) | Loggegevens vallen binnen de beschreven verwerking; bijlage 1 noemt infrastructuurmonitoring. | Dit specificeert niet de logvelden, IP-opslag of bewaartermijn voor de Rijksmap-proxy. De door de beheerder geaccepteerde versie en concrete hostinginstellingen zijn niet gecontroleerd. |

De [HTTPS-documentatie](https://docs.sliplane.io/more/ssl/) bevestigt dat Sliplane TLS afhandelt en de applicatie intern HTTP gebruikt. Geen van de hierboven genoemde bronnen onderbouwt de claim dat de hele hostingketen niets logt.

Nog bij de beheerder of Sliplane te verifiëren voor deze service: bestaan er proxytoegangslogs of beveiligings-/netwerklogs met bezoekers-IP's; welke velden bevatten die (bijvoorbeeld URL of zoekvraag); worden IP's geanonimiseerd; wat zijn bewaartermijn, toegang en uitschakelmogelijkheden? Er is geen supportbericht verstuurd en er zijn geen hostinginstellingen gewijzigd.

## Beveiligingsheaders (issue #16)

Alle antwoorden van de applicatiehandler krijgen `Content-Security-Policy`, ook redirects, cache-antwoorden en foutpagina's. Node kan al vóór de handler antwoorden: de geteste 400-, 417- en 431-antwoorden hebben deze applicatieheaders niet. Ook antwoorden die de Sliplane-proxy zelf maakt vallen buiten deze garantie. Zie de [HTTP-serverdocumentatie van Node](https://nodejs.org/docs/latest-v24.x/api/http.html#event-clienterror).

De policy is gelijk aan de bestaande meta-policy van de kaart; een regressietest vergelijkt beide. De strengere meta-policy op detailpagina's blijft daarnaast gelden. Dit verplaatst de bestaande policy naar een header en maakt haar niet strenger: inline scripts en de bestaande Tiiny-domeinen blijven toegestaan. De policy is dus geen bewijs dat analytics of alle scriptinjecties worden geblokkeerd. Een toestemming in de policy is op zichzelf ook geen uitgaand verzoek. Zie de [uitleg over CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy).

Met `HTTPS_ONLY=1` komt daar `Strict-Transport-Security: max-age=31536000` bij. Browsers onthouden dit alleen na een geldig HTTPS-antwoord; een HTTP-header activeert HSTS niet en de allereerste HTTP-verbinding is hiermee niet beschermd. Sliplane moet HTTP aan de publieke kant naar HTTPS doorsturen; de interne verbinding naar de container mag HTTP zijn. De instelling geldt alleen voor de bezochte host, zonder `includeSubDomains` of preload, zodat andere subdomeinen niet ongemerkt worden vastgelegd. Zie de [uitleg over HSTS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security).

**Controle op 30 oktober 2026, vóór uitrol:** een HEAD-verzoek naar `https://rijksmap-site.sliplane.app/` gaf 200 en `X-Content-Type-Options: nosniff`, maar nog geen CSP- of HSTS-header. Het HTTP-adres gaf 301 naar hetzelfde adres met HTTPS. De nieuwe headers zijn lokaal getest, nog niet op Sliplane uitgerold. Na een afzonderlijk goedgekeurde uitrol moeten deze headers op het Sliplane-adres opnieuw worden gecontroleerd, inclusief een redirect en een foutpagina. Issue #16 is tot die controle en de verificatie van de infrastructuurlogs niet volledig afgerond.

## Wat er (nog) anders is dan bij Pages

- **404-pagina:** een korte eigen pagina met een link naar de kaart, in plaats van de 404-pagina van GitHub.
- **Compressie:** gzip in plaats van wat Pages gebruikt. De kaart (`index.html`, 9,9 MB) gaat als 2,8 MB over de lijn.
- **Headers:** `X-Content-Type-Options: nosniff`, CSP, HSTS bij HTTPS-hosting en `Cache-Control: max-age=600` voor bestanden. Zie de instellingen en uitrolstatus hierboven.

## Testen

```text
node --test hosting/site/server.test.mjs
```

Controle voor #16 op 30 oktober 2026:

- De Dockerfile is lokaal gebouwd met Podman 4.9.3 op Linux/amd64, met de vastgepinde basisimage en Node 24.21.0. Er is niets naar een registry of host gepubliceerd. Docker Engine en de Sliplane-builder zijn hiermee niet afzonderlijk getest.
- De eerste bouwpoging weigerde de symbolische `COPY --chmod=a-w`. Daarom maakt de bouwfase de site nu alleen-lezen met `chmod -R a-w`; het losse serverbestand krijgt `COPY --chmod=0444`. De uiteindelijke bestandsrechten zijn gecontroleerd.
- Alle 18 server- en backlogtests slagen lokaal met Node 24.17.0 en in de gebouwde image. De procestest is bij de review van #71 uitgebreid met echte 400-, 417-, 431- en 500-verzoeken, zodat de grens van de headergarantie en de foutlogging ook buiten mocks worden gecontroleerd.
- De draaiende container is getest als gebruiker `1000:1000`, zonder extern netwerk en met een alleen-lezen rootbestandssysteem. Twaalf HTTP-verzoeken controleren onder meer CSP/HSTS, redirects, 404, 405, 304, HEAD, gzip en fictieve bezoekersheaders.
- De homepage blijft bytegelijk aan het lokale bronbestand, zowel ongecomprimeerd als na gzip-decompressie. `.git` ontbreekt in de image en de sitebestanden zijn niet schrijfbaar. De containerlog bevat na deze verzoeken alleen de startmelding, geen bezoekersgegevens. De tijdelijke testcontainers zijn verwijderd.

De lokale build en de testset zijn te herhalen vanuit de repositoryhoofdmap:

```text
podman build --format docker -t localhost/rijksmap-issue-16:local -f hosting/site/Dockerfile .
podman run --rm --network none --read-only --tmpfs /tmp:rw,nosuid,size=64m --workdir /app/site localhost/rijksmap-issue-16:local node --test .github/scripts/backlog.test.mjs hosting/site/server.test.mjs
```

De controle van de nieuwe headers achter de echte Sliplane-proxy blijft een afzonderlijke stap na goedgekeurde uitrol.

---

[↑ README](../../README.md) · [Architectuur](../../docs/architectuur.md) · [Routekaart](../../docs/routekaart.md)
