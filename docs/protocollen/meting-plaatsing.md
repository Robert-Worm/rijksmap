# Naoogst plaatsing (voor lezingen van voor batch 13)

De eerste honderdtwintig blinde lezingen zijn gedaan voordat het protocol de plaatsingsvelden kende.
Jij vult die twee velden alsnog, per rapport, uitsluitend op basis van de rapporttekst.

## Invoer
`irr/texts/<id>.txt`: kop met TITEL/DATUM/BRON, daarna de volledige rapporttekst. Voor plaatsing is
meestal het begin voldoende (titelblad, colofon, inleiding, onderzoeksvraag): lees minstens de eerste
driehonderd regels, en lees verder zodra het onderzochte onderwerp daar niet eenduidig uit blijkt.
Open NIETS anders dan de teksten die je zijn toegewezen.

## Uitvoer
Het bestand `irr/fable/<id>.json` BESTAAT al (de risico-oordelen staan erin). Lees het, voeg alleen
de velden `min` en `dienst` toe (voor het veld `model`), en schrijf het volledige bestand terug.
Verander NIETS aan de bestaande velden.

- `min`: een van AZ, BZ, JV, BZK, OCW, FIN, DEF, IW, EZK, LVVN, SZW, VWS, of RB als het onderwerp
  rijksbreed is of meerdere ministeries gelijkwaardig raakt. Leidend is het ministerie waar de
  ONDERZOCHTE organisatie of het geevalueerde beleid onder valt, NIET wie het rapport schreef,
  publiceerde of ervoor opdracht gaf. (Een audit van het CJIB hoort bij JV; een verantwoordings-
  onderzoek van de Rekenkamer naar begrotingshoofdstuk III hoort bij AZ.)
- `dienst`: de naam van de onderzochte dienst, ZBO of directie zoals de tekst die noemt. Gaat het
  rapport over het kerndepartement, over beleid of over een sector zonder aanwijsbare dienst: lege
  string. NOOIT de opdrachtgever of de auteur.

Geen em-dashes. Meld ter afronding per id: min en dienst (of "kern").
