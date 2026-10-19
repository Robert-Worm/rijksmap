# Routekaart

De Rijksmap begon als één zelfstandige webpagina, en dat werkte goed zolang die groeide van een paar honderd ADR-rapporten naar ruim 9.000 rapporten uit vier soorten bronnen. De volgende fase gaat over schaal, en over het project zo openen dat anderen erop kunnen voortbouwen.

Dit zijn voornemens, geen beloftes. Volgorde en details kunnen veranderen. Ideeën en hulp zijn welkom; zie [CONTRIBUTING.md](../CONTRIBUTING.md).

## Fase 1 · Het project openen

*Het proces even inzichtelijk maken als de data.*

- [x] Openbare repository met de gepubliceerde site, gehost op GitHub Pages
- [x] Documentatie van architectuur, datamodel, pijplijn en kwaliteitsborging
- [x] Leesprotocollen gepubliceerd in [`docs/protocollen/`](protocollen/)
- [x] Issue-formulieren voor datacorrecties, zodat elke correctie herleidbaar is
- [ ] Bouw- en controlescripts toevoegen (`maak-dist.mjs`, `maak-detailpaginas.mjs`, `bijwerken*.mjs`, `zoektest.mjs`, de controlescripts), opgeschoond tot een reproduceerbare set
- [ ] De bronversie `rijksmap.html` en de data als aparte bestanden in de repository, zodat wijzigingen te reviewen zijn

## Fase 2 · Labelkwaliteit aantoonbaar maken

*Weten hoe betrouwbaar elk label is, niet alleen dat het een onderbouwing heeft.*

- [ ] **Menselijk anker:** 20 tot 30 rapporten blind beoordeeld door een mens, gestratificeerd over bronnen en jaren, als ijkpunt voor de modellen
- [ ] **Tweede cross-vendormeting** op 50 rapporten uit 2019 tot en met 2025, met een protocol dat mechanisch wordt afgedwongen (schemacontrole vooraf, weigeren bij schending)
- [ ] Rubriek aanscherpen waar de modellen uiteenlopen (`continuity`, `digital`)
- [ ] Overeenstemming per categorie en per bron publiceren, en de zekerheid per label tonen in kaart en open data
- [ ] Strekking per rapport (geruststellend, gemengd, zorgelijk, …) landen voor de 100 pilotrapporten, smal en met herkomstlabel, zoals het eindpanel adviseerde

## Fase 3 · Applicatie en database

*Het ene bestand van 10 MB vervangen door een echte applicatie.*

Nu zit alle data in `index.html` (zie [architectuur](architectuur.md#waarom-één-bestand-en-waarom-dat-moet-veranderen)). Het plan:

- [ ] **Database** als enige bron van waarheid voor rapporten, organisaties, personen en labels, met een geschiedenis van elke wijziging
- [ ] **API**, zodat de kaart alleen laadt wat hij toont en bijwerken geen herbouw meer vraagt
- [ ] **Lichte voorkant** die de huidige interface behoudt, werkt op trage verbindingen en toegankelijk blijft
- [ ] **Doorlopend bijwerken:** nieuwe rapporten (circa 50 per maand) per bron binnen laten komen, met dezelfde lees- en controlepoorten, zonder volledige herbouw
- [ ] Statische rapport- en organisatiepagina's die uit de database worden gegenereerd, zodat vaste adressen en vindbaarheid blijven
- [ ] De privacybelofte overeind houden: geen tracking, geen cookies, geen derde partijen

## Fase 4 · Toegang voor AI-agents

*Iedereen een eigen AI-agent op de data laten loslaten.*

De dataset leent zich goed voor AI-agents: duizenden rapporten, elk met gestructureerde metadata, een officiële samenvatting en een onderbouwde classificatie. Het plan is de data te ontsluiten via een open standaard, het [Model Context Protocol (MCP)](https://modelcontextprotocol.io), met tools als:

- rapporten zoeken op ministerie, onderdeel, bron, periode, risicocategorie of zoekwoord
- een rapport ophalen met samenvatting, labels, onderbouwing en bronlink
- de organisatieboom verkennen: wie leidt welk onderdeel, en wat is erover gerapporteerd
- risicothema's vergelijken tussen ministeries of door de tijd

Onderzoekers, journalisten, auditors en ambtenaren kunnen dan in hun eigen omgeving vragen stellen ("welke ADR-bevindingen over IT General Controls komen bij meer dan drie ministeries terug?") en krijgen antwoorden die naar de officiële bronnen verwijzen. Dezelfde regels gelden: elk antwoord herleidbaar, AI-velden als zodanig herkenbaar.

## Buiten scope

- De Rijksmap beoordeelt of rangschikt geen organisaties. Aantallen tonen volume, niet de kwaliteit van beheersing.
- Geen privégegevens: alleen zakelijke, openbaar gemaakte functiegegevens.
- De rechterlijke macht en de Hoge Colleges van Staat krijgen geen eigen kaarten.
