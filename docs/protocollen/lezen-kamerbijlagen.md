# Reviewprotocol TK-kandidaten (volledige rapporten)

Je vult per rapport ALLE kaartvelden van de Rijksmap in. Je LEEST HET VOLLEDIGE RAPPORT:
het tekstbestand in tk-review/txt/<dn>.txt bevat de complete publicatie (alle pagina's).
Lees het bestand helemaal; baseer je oordeel op de inhoud, niet alleen op de titel of de
samenvatting in de kop. Het "onderwerp" in de batchlijst is de omschrijving van de
Kamerbijlage en is vaak NIET de echte rapporttitel; haal de echte titel uit het rapport.

## Uitvoer

Schrijf per batch een JSON-array naar het opgegeven pad, met per rapport:

```
{
 "dn": "2019D00855",                 // documentnummer uit de batchlijst
 "tit": "Evaluatie van ...",         // echte rapporttitel van de titelpagina (niet het Kamerbijlage-onderwerp)
 "dat": "2019-11",                   // publicatiedatum VOLGENS HET COLOFON of de titelpagina
                                     //   (JJJJ-MM of JJJJ-MM-DD). LET OP: de datum in de
                                     //   batchlijst is de registratiedatum bij de Kamer en
                                     //   loopt vaak maanden achter. Niet te vinden? Laat leeg.
 "min": "FIN",                       // ministeriecode, zie lijst; "RB" = rijksbreed
 "ond": "Belastingdienst",           // onderzocht onderdeel/dienst, of "" als het het kerndepartement betreft
 "aut": "Auditdienst Rijk",          // auteur uit het colofon (organisatie, geen personen)
 "opdr": "Ministerie van Financien", // opdrachtgever als die genoemd wordt, anders ""
 "typ": "beleidsevaluatie",          // rapporttype: beleidsevaluatie | audit | inspectierapport |
                                     //   onderzoeksrapport | advies | monitor | verkenning | doorlichting
 "rf": ["laws","financial"],         // 1 tot 3 risicocodes uit de lijst hieronder, belangrijkste eerst
 "rft": "Waarom deze labels: ...",   // toelichting op de risicolabels, 1 tot 3 zinnen, verankerd in de tekst
 "s": "...",                         // samenvatting 400-900 tekens: onderwerp, aanpak, kernbevinding
 "per": "2019-2023",                 // onderzochte periode als die blijkt, anders ""
 "tg": ["toeslagen","koopkracht"],   // 4 tot 8 zoektags, kleine letters, geen generieke woorden
 "wet": "Participatiewet",           // centrale wet/regeling als die er is, anders ""
 "std": "",                          // METHODISCHE standaard die dragend wordt genoemd (bijv. RPE,
                                     //   ISSAI, Comptabiliteitswet art. 3.1, toetsingskader X); een
                                     //   onderzochte wet is GEEN standaard. Niet genoemd? Laat leeg.
 "twf": ""                           // twijfel of opmerking voor Robert; leeg als alles duidelijk is
}
```

## Ministeriecodes

AZ Algemene Zaken | BZ Buitenlandse Zaken | JV Justitie en Veiligheid | BZK Binnenlandse
Zaken en Koninkrijksrelaties | OCW Onderwijs, Cultuur en Wetenschap | FIN Financien |
DEF Defensie | IW Infrastructuur en Waterstaat | EZK Economische Zaken en Klimaat |
LVVN Landbouw, Visserij, Voedselzekerheid en Natuur | SZW Sociale Zaken en Werkgelegenheid |
VWS Volksgezondheid, Welzijn en Sport | RB Rijksbreed (meerdere ministeries of het Rijk als geheel)

Kies het ministerie dat verantwoordelijk is voor het ONDERZOCHTE beleid of de onderzochte
organisatie. Bij twijfel tussen twee: kies de belangrijkste en noem de andere in "twf".

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
- Als bij lezing blijkt dat het TOCH geen onderzoeksrapport over rijksbeleid of een
  rijksorganisatie is (triage zat ernaast, bijv. wetsproces-stuk, brief, consultatie):
  zet "twf" op "buiten scope: <reden>" en laat rf/s leeg.
- Aantal uitvoerrijen = aantal opgegeven bestanden, zelfde volgorde.
- Vul "dat" altijd in als het colofon of de titelpagina een publicatiedatum noemt; wijkt
  hij meer dan een half jaar af van de registratiedatum in de batchlijst, meld dat in "twf".
