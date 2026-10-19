# Leesprotocol samenvattingsronde (Opus 5)

Je schrijft samenvattingen voor rapporten op de Rijksmap (rijksmap.nl) waarvan de huidige
samenvatting onbruikbaar is: te kort, alleen de titel herhaald, ontbrekend, of halverwege
afgekapt. Je krijgt de **volledige tekst van het rapport zelf**; schrijf op basis daarvan.

## Wat je krijgt

Per rapport één tekstbestand `sm-ronde/txt/<nr>.txt` met een kop:

```
TITEL: ...
DATUM: ... | MINISTERIE: ... | BRON: ADR|AR|INSP|EXT
HERKOMST-BESTAND: <url> (pdf, N pagina's)
HUIDIGE SAMENVATTING (<reden>): ...

--- TEKST ---
<de rapporttekst, eerste 40 pagina's>
```

## Wat je schrijft

Eén samenvatting per rapport, **3 tot 5 zinnen (60–110 woorden)**, in het Nederlands.

Inhoudelijke eisen, op volgorde van belang:

1. **Wat is onderzocht en door wie** — de onderzoeksvraag of opdracht, en de onderzochte
   organisatie (dienst, directie, regeling). Noem de opdrachtgever alleen als het rapport dat
   zelf expliciet doet.
2. **Wat de belangrijkste bevindingen zijn** — mét concrete gegevens uit het rapport: aantallen,
   bedragen, percentages, jaartallen, oordelen ("goedkeurend", "onvoldoende", "voldoet niet aan").
   Dit is het punt waarop de huidige samenvattingen falen; een samenvatting zonder één concreet
   gegeven uit de tekst is afgekeurd werk.
3. **Wat de conclusie of aanbeveling is**, als het rapport die geeft.

Vormeisen:

- Zakelijk en neutraal. Geen waardeoordeel dat het rapport zelf niet uitspreekt.
- **Herhaal de titel niet** als openingszin. Begin met de inhoud.
- Geen aanhef als "Dit rapport beschrijft…" of "In dit onderzoek…" — schrijf direct.
- Geen opsommingstekens, geen kopjes: lopende tekst.
- Schrijf zinnen die een geïnteresseerde lezer zonder vakkennis kan volgen. Gemiddeld
  **onder de 20 woorden per zin**; vermijd stapelingen van beleidsjargon. Vaktermen die
  onmisbaar zijn mag je gebruiken, maar leg ze kort uit als dat in één bijzin kan.
- Geen aanhalingstekens rond de hele samenvatting, geen markdown.
- Eindig met een punt. Nooit halverwege afbreken.

## Bijzondere gevallen

- **Assurance-/controleverklaringen en auditrapporten**: noem het oordeel (goedkeurend, met
  beperking, afkeurend of oordeelonthouding), waarover het gaat (jaarrekening, DigiD-assessment,
  Wpg-audit, subsidieverantwoording) en over welk jaar of welke periode. Noem als het rapport
  ze geeft: het aantal bevindingen, of de belangrijkste tekortkoming.
- **Managementreacties/bijlagen**: als de tekst vooral een reactie is op een ander rapport,
  zeg dat en vat de kern van de reactie samen.
- **De tekst is onbruikbaar** (gescand zonder tekstlaag, verkeerd document, alleen een
  omslagpagina, of onleesbare tekenbrij): schrijf GEEN samenvatting. Zet
  `"sm": null` en `"probleem": "<wat je zag>"`. Verzin nooit inhoud op basis van de titel —
  dat is precies wat deze ronde moet repareren.
- **Twijfel** over een cijfer of oordeel: laat het weg. Liever een samenvatting zonder dat
  gegeven dan een samenvatting met een verkeerd gegeven.

## Hoe je oplevert

Lees de bestanden met Read. Schrijf per batch één JSON-bestand met Write naar
`sm-ronde/uit/<batchnaam>.json`:

```json
[
 {"nr": 12, "sm": "De Auditdienst Rijk heeft ... vastgesteld. In 2022 ging het om 1,4 miljoen euro ... De dienst voldoet niet aan drie van de tien normen ...", "probleem": null},
 {"nr": 13, "sm": null, "probleem": "gescand document zonder tekstlaag, alleen ruis"}
]
```

Regels voor de oplevering:

- **Schrijf per 10 rapporten weg**, niet pas aan het eind. Een afgebroken run mag geen werk
  verliezen; een bestaand batchbestand wordt bij hervatten overgeslagen.
- Neem elk `nr` uit je toegewezen reeks precies één keer op.
- Gebruik alleen Read en Write. Start geen subagents.
- Geen toelichting in je eindantwoord: meld alleen hoeveel je er hebt gedaan en hoeveel
  problemen je tegenkwam.
