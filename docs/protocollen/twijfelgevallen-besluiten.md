# Besluitprotocol dubbelingen/ruis mogelijk-bak (na akkoord Robert, 21-08-2026)

Je zet kwaliteitsbevindingen om in machinaal toepasbare besluiten per documentnummer.
Robert (de opdrachtgever) heeft de volgende besluiten genomen; die zijn bindend:

1. Zelfevaluaties en zelfrapportages BLIJVEN op de kaart (als monitor).
2. Onderzoek van of in opdracht van de Tweede Kamer zelf BLIJFT.
3. Onderzoek in opdracht van branche-, belangen- of private organisaties ZONDER
   rijksopdracht VERVALT. Nuances: (a) wettelijke vergunninghouder-rapportages van
   NAM/Gasunie/GTS BLIJVEN (aparte beslissing); (b) opdrachten van decentrale overheden
   (gemeente, provincie) blijven ALLEEN als het onderzoek aantoonbaar landelijk
   rijksbeleid dient (staat dan in twf); anders vervallen.
4. De Woo-dump van UWV-accountantsrapportages, de NAM/GTS-rapportages en de
   CBS-kwartaalmonitors BLIJVEN.
5. Harde dubbelingen en harde schrappingen worden toegepast; opgeknipte rapporten
   worden samengevoegd tot een kaartitem.

## Wat je krijgt

Een pakket met items. Per item: dn, taken (bevindingen uit de kwaliteitscontrole:
dup-hard, dup-nazien, dedupe-identiek, broncheck, schrappen, branche), de rijgegevens
(tit, dat, reg, min, aut, opdr, typ, s, twf) en kaartMatches (beste titelmatches tegen
de bestaande kaart, met score, datum, bron en auteur).

## Beslisregels

- **Staat al op de kaart** (kaartMatch die hetzelfde rapport is: zelfde onderzoek,
  jaar past, auteur strookt) -> actie "vervallen", reden "al op kaart via <bron>".
  LET OP reeksen: een jaarlijkse of periodieke editie met een ANDER jaar of ANDERE
  periode is een ANDER rapport -> "behouden". Kijk naar datum en volgnummers in de
  titel (Voortgangsrapportage 21 vs 23 = verschillende rapporten!).
- **Dubbel binnen de set** (zelfde rapport onder twee dn's): het meest complete dn
  blijft ("behouden"), het andere "vervallen", reden "dubbel met <dn>". Kies de versie
  met samenvatting/colofon of de meest complete tekst (staat vaak in twf).
- **Opgeknipt rapport** (deel 1/2/..., hoofdrapport+bijlagendeel dat geen zelfstandige
  inhoud heeft): het hoofddeel (met titelpagina/samenvatting) krijgt "behouden", de
  overige delen "samenvoegen" met hoofdDn = het hoofddeel. Een bijlage MET eigen
  onderzoeksinhoud (eigen methode en bevindingen) mag "behouden" blijven.
- **Basisrapport + samenvattend rapport/factsheet/infographic van dezelfde meting**:
  basisrapport "behouden", de rest "vervallen".
- **Vertaalduplicaat** (EN+NL van hetzelfde rapport): de Nederlandse versie blijft.
- **Schrappen-bevindingen**: alleen echte ruis vervalt (notitie zonder onderzoek,
  losse tabel, brief, achterhaald concept). Twijfel -> "behouden".
- **Branche/privaat**: volg besluit 3 hierboven strikt.
- Bij echte twijfel: "behouden" met zekerheid "laag" en een korte reden; liever een
  dubbel op de kaart die later opgeruimd wordt dan een goed rapport weggegooid.

## Uitvoer

Schrijf naar het opgegeven pad een JSON-array, EEN object per item uit het pakket
(zelfde volgorde, geen items overslaan):

[{"dn": "...", "actie": "behouden|vervallen|samenvoegen",
  "hoofdDn": "alleen bij samenvoegen",
  "reden": "max 15 woorden",
  "zekerheid": "hoog|middel|laag"}]

Rapporteer als eindtekst alleen: aantallen per actie en de opvallendste twijfelgevallen.
