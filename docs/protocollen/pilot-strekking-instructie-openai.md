# Instructie OpenAI-leesronde (strekking/B1-pilot Rijksmap)

Dit pakket bevat alles wat de lezer nodig heeft en niets meer. De lezing is BLIND:
gebruik uitsluitend pilot-strekking.md (de rubriek) en de bestanden in
rapporten/. Raadpleeg tijdens het lezen geen andere bronnen: niet rijksmap.nl, geen
werkboek, geen uitvoer van andere modellen, geen webzoekopdrachten. Het oordeel moet
volledig op de rapporttekst rusten, anders is de betrouwbaarheidsmeting waardeloos.

## Werkwijze

1. Lees pilot-strekking.md volledig (versie 2.1, 25 velden per rapport).
2. Lees per rapport het VOLLEDIGE tekstbestand (conclusies staan vaak achterin) en vul
   alle velden. De kopregels (#) geven titel, ministerie, datum, bron en URL.
3. Werk in batches van 10 op volgorde: batch 1 = 001-010, batch 2 = 011-020, ... tot
   batch 10 = 091-100.
4. Lever per batch een JSON-bestand aan met de naam oordeel-openai-batch<N>.json, exact
   in de vorm van uitvoerschema.json. Verplicht in de kop: protocol "v2.1" en
   modelversie (de exacte modelnaam waarmee gelezen is).
5. tkn per rapport = de bestandsgrootte in bytes; die staat per bestand in
   manifest.json (veld bytes). manifest.json bevat ook SHA-256-hashes zodat naderhand
   aantoonbaar is dat beide modellen identieke teksten lazen.

## Harde regels (uit de rubriek, hier herhaald omdat ze vaak misgaan)

- Categoriale velden gebruiken UITSLUITEND de exacte Nederlandse waarden uit de
  rubriek (stk, sto, opv, oorc, typ, rct, lak, stdc, mtd). Elke afwijking wordt door
  de validator afgekeurd.
- Bij weggelakte kernpassages: stk "niet vaststelbaar", nooit raden; lak "ja".
- GEEN em-dashes (het teken -- als lang streepje) in welk veld dan ook.
- Nederlands, neutrale en onafhankelijke toon; B1-regels en reikwijdte-regels uit de
  rubriek zijn verplicht bij controleverklaringen en assurancerapporten.
- stz en bsm moeten consistent zijn met stk.
