# Architectuur

De Rijksmap is een statische website. Er draait geen code op een server en er is geen database. Alles wat een bezoeker nodig heeft, staat in bestanden die GitHub Pages ongewijzigd uitserveert.

## Bewuste ontwerpkeuzes

- **Privacy by design.** Geen server die iets logt, geen tracking, geen cookies, geen CDN-verzoeken. Ook de lettertypen zijn gesubset en ingebed. Wat iemand zoekt of bekijkt, verlaat de browser niet.
- **Eén matcher, kloppende tellingen.** Zoekbalk, filterchips, matrixcellen en tellers delen exact dezelfde matching-logica. Elk getal dat de kaart toont, is het aantal dat een klik daarna oplevert. Dat is de kerninvariant van het project, en die wordt bij elke wijziging gecontroleerd.
- **Voorspelbaar boven slim.** Geen fuzzy matching of onnavolgbare relevantiescores. Elke treffer is uitlegbaar (ongevoelig voor accenten, enkelvoud en meervoud, vaste woordgrensregels), zodat een journalist of auditor kan verantwoorden waarom een rapport wel of niet in een selectie zat.
- **Overal te hosten.** De hele site is een map met bestanden. Gecomprimeerd is de homepage circa 1,5 MB.

## Onderdelen

| Onderdeel | Bestanden | Rol |
| --- | --- | --- |
| **Interactieve kaart** | `index.html` (~9,9 MB) | De hele applicatie: opmaak, twee stijlblokken en één scriptblok van ~9,5 MB met interfacelogica én data. |
| **Organisatiepagina's** | `<ministerie>/index.html`, `<ministerie>/<onderdeel>/index.html` (265) | Statische, vindbare pagina per ministerie, directoraat-generaal en dienst, met kruimelpad en gestructureerde data (schema.org). |
| **Rapportpagina's** | `rapport/<jaar>-<slug>/index.html` (9.116) | Eén pagina per rapport: metadata, samenvatting, risicothema's met onderbouwing, link naar de bron, en een sprong naar dezelfde plek in de kaart. |
| **Open data** | `rijksmap-rapporten.csv`, `rijksmap-rapporten.json` | De volledige rapportdataset, CC0. Zie [datamodel.md](datamodel.md). |
| **Onderbouwingen** | `rijksmap-rfo.json` (~5,7 MB) | De toelichting bij de risicolabels per rapport, sleutel `datum|titel`. Staat sinds 24 augustus 2026 los van `index.html` en wordt pas geladen als iemand een toelichting openklapt. |
| **Vindbaarheid** | `sitemap.xml`, `robots.txt`, `og-image.png`, JSON-LD op elke pagina | Zoekmachines en linkvoorbeelden. |
| **Hosting** | `CNAME`, `.nojekyll`, `.well-known/security.txt` | GitHub Pages serveert de hoofdmap op `www.rijksmap.nl`, zonder Jekyll-bewerking. |

## Binnenin `index.html`

Het scriptblok draait om een handvol dataconstanten en circa 165 functies die er weergaven van maken:

| Constante | Omvang | Inhoud |
| --- | --- | --- |
| `REPORTS` | ~8,9 MB | Alle rapporten, per ministeriecode (`AZ`, `BZ`, `JV`, …), in compacte vorm met korte sleutels (`d` datum, `t` titel, `u` adres, `rf` risicolabels, `rfp` primair risico, `sm` samenvatting, `tg` tags, …). |
| `DG_DIRS` | ~160 kB | Directies per directoraat-generaal, uit de officiële organogrammen, met bron-URL en peildatum per ministerie. |
| `AGENCY_DETAIL` | ~115 kB | Beschrijving in gewone taal, omvang en hoofdonderdelen per uitvoeringsorganisatie, met link naar de officiële organisatiepagina. |
| `M`, `BESTUURSRAAD`, `PERSON_URL`, `INTRO_URL` | ~130 kB | Ministeries, politieke leiding, bestuursraden en links naar officiële persoons- en introductiepagina's. |
| `DIR_ALIAS_LC` | ~23 kB | Schrijfwijzen van onderdeelnamen, herleid tot één canonieke naam, zodat "JUSTIS" en "Justis" als één onderdeel tellen. |

De interface is gewoon JavaScript, zonder framework en zonder bouwstap in de browser. Een paar keuzes uit de code:

- **Lijsten in delen renderen.** Lange lijsten (Justitie en Veiligheid alleen al heeft 600+ rijen) tonen eerst de eerste rijen. De rest wacht als tekst tot de bezoeker erom vraagt. Dat was de oplossing voor de invoervertraging (INP) die het reviewpanel van 7 augustus 2026 signaleerde.
- **Meten, niet gokken.** De knop "Hele samenvatting" verschijnt alleen als een samenvatting echt buiten de twee regels valt. Dat wordt per rij gemeten, omdat de beschikbare breedte per weergave verschilt.
- **Toegankelijkheid.** Filterchips melden hun stand aan schermlezers (`aria-pressed`), suggesties worden via een live-regio aangekondigd, en de toetsenbordbediening is getoetst aan WCAG-succescriterium 2.1.1.
- **Afdrukken als dossier.** Een geopend ministerie drukt af als compleet rapportdossier. Ingekorte lijsten worden eerst volledig gemaakt, zodat er niets stil wegvalt.
- **Alleen lokaal geheugen.** Bewaard worden alleen voorkeuren, favorieten en het tijdstip van het vorige bezoek, in `localStorage`. Niets verlaat het apparaat, tenzij de bezoeker zelf exporteert.

## Bouwen en publiceren

De bronversie van de kaart heet `rijksmap.html`: data, stijl en logica in één bestand. De bouwstap `node maak-dist.mjs --zip` maakt daar het publicatiepakket van:

1. **Eerst controleren, dan bouwen.** Het script stopt bij een JavaScript-fout of een stijlfout (zoals een em-dash), zodat er nooit een kapotte build klaarstaat.
2. **Pagina's genereren** met `maak-detailpaginas.mjs`, `maak-subpaginas.mjs` en `pagina-shell.mjs`, plus de sitemap.
3. **Samenhang bewaken.** Dode verwijzingen, verouderde kopieën en ontbrekende bestanden breken de build.
4. **Schoon opbouwen.** `dist/` wordt elke keer volledig opnieuw gemaakt, zodat een verwijderd bestand niet kan blijven rondslingeren.
5. **Inpakken** als `rijksmap-dist.zip`, het pakket dat ook bij de [releases](../../../releases) staat.

## Waarom één bestand, en waarom dat moet veranderen

Alle data in `index.html` stoppen was een bewuste vroege keuze. Daardoor is de site:

- **eenvoudig te hosten:** elke statische host werkt, zonder database of API om in de lucht te houden
- **snel na het laden:** filteren over 9.000+ rapporten gebeurt direct in het geheugen
- **robuust:** de kaart werkt ook offline en vanaf schijf

Maar het schaalt niet meer:

1. **De eerste download groeit mee met de data.** Elke bezoeker haalt ~10 MB op voordat de kaart bruikbaar is, en elk nieuw rapport komt daarbij. Het eindpanel van augustus 2026 rekende voor dat de volledige leesrubriek voor alle rapporten er nog eens 10 MB bij zou zetten. Binnen één bestand past dat niet.
2. **Bijwerken betekent herbouwen.** Eén label verbeteren vraagt een nieuw bestand van 10 MB en tot 9.000 nieuwe pagina's.
3. **De data zit opgesloten in de pagina.** Onderzoekers en tools kunnen geen gerichte vraag stellen, alleen alles downloaden.
4. **Samenwerken is lastig.** Een gegenereerd bestand van 10 MB is niet te reviewen in een pull request.

De [routekaart](routekaart.md) beschrijft de overstap naar een applicatie met database en API, inclusief toegang voor AI-agents.

## Hosting

GitHub Pages publiceert de hoofdmap van de `main`-branch. `CNAME` koppelt die aan `www.rijksmap.nl`, en `rijksmap.nl` stuurt door naar het www-adres. `.nojekyll` zorgt dat bestanden ongewijzigd worden geserveerd, ook `.well-known/`. GitHub verzorgt de HTTPS-certificaten.

GitHub Pages ondersteunt geen eigen HTTP-headers. Het Content Security Policy van de site staat daarom als `<meta http-equiv>` in de pagina zelf.
