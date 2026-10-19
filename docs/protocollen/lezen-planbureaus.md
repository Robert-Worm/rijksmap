# Reviewprotocol planbureau-kandidaten (volledige rapporten)

Je vult per rapport ALLE kaartvelden van de Rijksmap in. Je LEEST HET VOLLEDIGE RAPPORT:
het tekstbestand in pb-bron/corpus/NNNN.txt bevat de complete publicatie (alle pagina's).
Lees het bestand helemaal; baseer je oordeel op de inhoud, niet alleen op de titel of de
samenvatting in de kop.

## Uitvoer

Schrijf per batch een JSON-array naar het opgegeven pad, met per rapport:

```
{
 "nr": "0123",                       // uit de bestandsnaam
 "dat": "2019-11",                   // publicatiedatum VOLGENS HET COLOFON van het rapport
                                     //   (JJJJ-MM of JJJJ-MM-DD). LET OP: de datum in de
                                     //   batchlijst is bij SCP vaak de registratiedatum en
                                     //   dus fout. Niet te vinden? Laat leeg.
 "min": "FIN",                       // ministeriecode, zie lijst; "RB" = rijksbreed
 "ond": "Belastingdienst",           // onderzocht onderdeel/dienst, of "" als het het kerndepartement betreft
 "aut": "Centraal Planbureau",       // auteur uit het colofon (het planbureau, of samenwerkingspartner)
 "opdr": "Ministerie van Financien", // opdrachtgever als die genoemd wordt, anders ""
 "typ": "beleidsevaluatie",          // rapporttype: beleidsevaluatie | doorrekening | verkenning |
                                     //   monitor | certificering | advies | onderzoeksrapport | raming
 "rf": ["laws","financial"],         // 1 tot 3 risicocodes uit de lijst hieronder, belangrijkste eerst
 "rft": "Waarom deze labels: ...",   // toelichting op de risicolabels, 1 tot 3 zinnen, verankerd in de tekst
 "s": "...",                         // samenvatting 400-900 tekens: onderwerp, aanpak, kernbevinding
 "per": "2019-2023",                 // onderzochte periode als die blijkt, anders ""
 "tg": ["toeslagen","koopkracht"],   // 4 tot 8 zoektags, kleine letters, geen generieke woorden
 "wet": "Participatiewet",           // centrale wet/regeling als die er is, anders ""
 "twf": ""                           // twijfel of opmerking voor Robert; leeg als alles duidelijk is
}
```

## Ministeriecodes

AZ Algemene Zaken | BZ Buitenlandse Zaken | JV Justitie en Veiligheid | BZK Binnenlandse
Zaken en Koninkrijksrelaties | OCW Onderwijs, Cultuur en Wetenschap | FIN Financien |
DEF Defensie | IW Infrastructuur en Waterstaat | EZK Economische Zaken en Klimaat |
LVVN Landbouw, Visserij, Voedselzekerheid en Natuur | SZW Sociale Zaken en Werkgelegenheid |
VWS Volksgezondheid, Welzijn en Sport | RB Rijksbreed (meerdere ministeries of het Rijk als geheel)

Kies het ministerie dat verantwoordelijk is voor het ONDERZOCHTE beleid, niet het bureau
zelf. Bij twijfel tussen twee: kies de belangrijkste en noem de andere in "twf".

## Risicocodes (Risk in Focus)

cyber (Cybersecurity en gegevensbeveiliging) | humancap (Personeel, diversiteit en behoud
van talent) | digital (Digitale disruptie, nieuwe technologie en AI) | laws (Veranderende
wet- en regelgeving) | macro (Macro-economische en geopolitieke onzekerheid) | continuity
(Bedrijfscontinuiteit en operationele weerbaarheid) | market (Marktverandering en
concurrentie) | supplychain (Toeleveringsketen, uitbesteding en derden) | financial
(Financiele, liquiditeits- en insolventierisico's) | climate (Klimaat, biodiversiteit en
milieu) | governance (Governance en verslaggeving) | culture (Organisatiecultuur) | fraud
(Fraude, omkoping en criminele uitbuiting) | comms (Communicatie, reputatie en
stakeholders) | hse (Gezondheid, veiligheid en beveiliging) | ma (Fusies en overnames)

## Regels

- Verzin niets. Wat niet in het rapport staat, blijft leeg.
- De samenvatting is feitelijk en neutraal, geen aanbeveling van jou, geen "dit rapport".
  Begin met het onderwerp. Nederlands, geen jargon zonder uitleg, geen em-dashes.
- Als het bestand vrijwel leeg is, alleen een foutmelding bevat of duidelijk niet het
  rapport is: vul "twf" met "tekst onbruikbaar" en laat de inhoudelijke velden leeg.
- Als bij lezing blijkt dat het TOCH geen rapport over rijksbeleid of een rijksorganisatie
  is (triage zat ernaast): zet "twf" op "buiten scope: <reden>" en laat rf/s leeg.
- Aantal uitvoerrijen = aantal opgegeven bestanden, zelfde volgorde.
- Vul "dat" altijd in als het colofon of de titelpagina een publicatiedatum noemt, ook als
  die gelijk lijkt aan de datum in de batchlijst. Wijkt hij af, meld dat dan ook in "twf".
