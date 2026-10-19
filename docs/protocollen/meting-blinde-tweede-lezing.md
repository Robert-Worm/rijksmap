# Blinde risicoclassificatie voor de IRR-meting (Fable 5)

Je beoordeelt Nederlandse overheidsrapporten voor de Rijksmap. Dit is een BLINDE tweede beoordeling
voor een inter-rater-betrouwbaarheidsmeting: er bestaat al een eerdere classificatie, maar die krijg
je bewust niet te zien en je mag er niet naar zoeken. Oordeel uitsluitend op de rapporttekst.

## Invoer
Per rapport een bestand `irr/texts/<id>.txt`: een kop met TITEL/DATUM/BRON, daarna de volledige
rapporttekst. Lees de hele tekst. Raadpleeg NIETS anders: geen rijksmap.html, geen review-mappen,
geen web.

## Uitvoer
Per rapport één bestand `irr/fable/<id>.json`:

```json
{
  "id": "I0001",
  "rf": ["…","…"],   // 0-4 Risk-in-Focus keys, meest relevant eerst; alleen keys met score >= 7
  "rfp": "…",        // = rf[0], of "" als rf leeg is
  "rfs": {"…": 9},   // per rf-key een score 1-10: hoe sterk dit risico centraal staat in de tekst
  "rfv": "…",        // zekerheid van de classificatie als geheel: "Hoog", "Midden" of "Laag"
  "rfo": "…",        // 1-3 zinnen onderbouwing, herleidbaar naar concrete passages
  "min": "…",        // ministerie waar het ONDERZOCHTE onderwerp onder valt (zie Plaatsing)
  "dienst": "…",     // de onderzochte dienst/organisatie zoals de tekst die noemt, of "" (zie Plaatsing)
  "model": "Fable 5"
}
```

## Plaatsing (min en dienst)
Bepaal uit de tekst waar dit rapport organisatorisch thuishoort. Dit is een onafhankelijke controle
op de indeling van de kaart, dus oordeel uitsluitend op wat het document zelf zegt.
- `min`: een van AZ, BZ, JV, BZK, OCW, FIN, DEF, IW, EZK, LVVN, SZW, VWS, of RB als het onderwerp
  rijksbreed is of meerdere ministeries gelijkwaardig raakt. Leidend is het ministerie waar de
  ONDERZOCHTE organisatie of het geevalueerde beleid onder valt, NIET wie het rapport schreef of
  publiceerde. (Een ADR-audit van het CJIB hoort bij JV, ook als hij elders gepubliceerd staat.)
- `dienst`: de naam van de onderzochte dienst, inspectiedienst-onderdeel, ZBO of directie zoals de
  tekst die noemt (bijvoorbeeld "Centraal Justitieel Incassobureau" of "IND"). Gaat het rapport over
  het kerndepartement, over beleid of over een sector zonder een aanwijsbare dienst: lege string.
  NOOIT de opdrachtgever of de auteur invullen; alleen wat onderzocht wordt.

GEEN samenvatting (sm) schrijven: de omschrijvingen in de kaart zijn officiele teksten of bewust
gekozen; die raakt deze meting niet aan.

## De 16 Risk-in-Focus-sleutels (exact deze, niets anders; identiek aan RISKS in rijksmap.html)
- `cyber` (cybersecurity en gegevensbeveiliging)
- `humancap` (personeel, diversiteit en behoud van talent)
- `digital` (digitale disruptie, nieuwe technologie en AI)
- `laws` (veranderende wet- en regelgeving)
- `macro` (macro-economische en geopolitieke onzekerheid)
- `continuity` (bedrijfscontinuiteit en operationele weerbaarheid)
- `market` (marktverandering en concurrentie)
- `supplychain` (toeleveringsketen, uitbesteding en derden)
- `financial` (financiele, liquiditeits- en insolventierisico's, rechtmatigheid, financieel beheer)
- `climate` (klimaat, biodiversiteit en milieu)
- `governance` (governance en verslaggeving, sturing, verantwoording)
- `culture` (organisatiecultuur)
- `fraud` (fraude, omkoping en criminele uitbuiting)
- `comms` (communicatie, reputatie en stakeholders)
- `hse` (gezondheid, veiligheid en beveiliging)
- `ma` (fusies en overnames; bij de rijksoverheid zeldzaam, denk aan fusies of splitsingen van organisaties)

## Regels
1. **Score >= 7 of niet opnemen.** rfs geeft per label hoe sterk het thema in DIT rapport centraal
   staat (10 = de kern, 7 = duidelijk aanwezig en onderbouwd). Labels onder de 7 laat je weg.
   Liever 1 sterk label dan 3 zwakke. Geen enkel thema >= 7: `rf: []`, `rfp: ""`, en leg dat uit
   in rfo.
2. **rfv is je zekerheid over de classificatie als geheel**: "Hoog" als de tekst het oordeel
   rechtstreeks draagt, "Midden" bij interpretatieruimte, "Laag" als de tekst dun of ontoegankelijk
   is (bijvoorbeeld een scan met OCR-fouten).
3. **rfo verwijst naar de tekst**, niet naar de titel: noem concrete bevindingen, bedragen of
   oordelen die de labels dragen. Nederlands, professioneel, geen em-dashes (gebruik komma's).
4. Bij een controleverklaring of assurancerapport zonder inhoudelijke bevindingen is `financial`
   met een lage score vaak al het maximum; forceer geen tweede label.
5. Schrijf elk JSON-bestand met de Write-tool, geldig JSON, exact de velden hierboven.

## Afronding
Meld per id kort: gelezen (ja/geheel), aantal labels, rfv. Niets anders wijzigen dan je eigen
uitvoerbestanden in irr/fable/.
