# Onderdeel-toewijzingsprotocol (opdracht Robert, 21-08-2026)

Je wijst rapporten toe aan het juiste organisatieonderdeel binnen een ministerie op de
Rijksmap (rijksmap.nl). De opdrachtgever wil nadrukkelijk voorkomen dat rapporten
onterecht op "Kern" (kerndepartement) blijven hangen; accuratesse gaat boven gemak.

## Wat je krijgt

Een pakket voor EEN ministerie met:
- `register`: alle geldige onderdelen van dat ministerie: code, naam, omschrijving en
  soort ("dg" = directoraat-generaal, "dienst" = dienst/agentschap/zbo, "bestaand" =
  bak die al op de kaart in gebruik is). Onderdelen zonder eerdere rapporten zijn even
  geldig als de rest.
- `items`: rapporten. Per item: dn (of bij kaartrijen een lege dn en een `u`-url),
  tit (titel), ond (onderzocht onderdeel volgens de lezer, vrije tekst), aut (auteur),
  opdr (opdrachtgever), s (samenvatting, ingekort), en eventueel `mech` (een
  mechanische naamtreffer als hint; kan fout zijn, volg hem alleen als hij klopt).
- Items met soort "kaart-tk1" staan al op de kaart op Kern; jij hercontroleert of dat
  terecht is.

## De regel

De bak is het onderdeel waar het rapport OVER gaat (de onderzochte dienst of het
onderzochte DG), niet wie het schreef. Voorbeelden van de kaartpraktijk:
- een inspectierapport over de NVWA -> NVWA
- een evaluatie van de Belastingdienst -> Belastingdienst
- een audit van het hele ministerie -> Kern
- een beleidsevaluatie van een regeling die onder een specifiek DG valt -> dat DG,
  als dat uit ond/samenvatting blijkt
- gaat het over een uitvoeringsorganisatie die als onderdeel in het register staat
  (UWV, DUO, RWS, DJI, COA, RVO...) -> dat onderdeel, ook al is de opdrachtgever het
  kerndepartement

"Kern" is een geldige uitkomst, maar alleen als het rapport echt het ministerie als
geheel, generiek beleid zonder aanwijsbaar onderdeel, of een departementsbrede functie
betreft. Kies NOOIT Kern uit gemak; kies wel Kern als elke andere keuze geraden zou zijn.

Beleidsevaluaties zonder duidelijk onderdeel: kijk of het beleidsterrein herkenbaar bij
een DG hoort (de omschrijvingen in het register helpen). Herkenbaar -> dat DG;
niet herkenbaar -> Kern.

Gebruik UITSLUITEND codes uit het register (of "Kern"). Verzin geen nieuwe codes.

## Uitvoer

Schrijf naar het opgegeven pad een JSON-array, EEN object per item, zelfde volgorde:

[{"id": "<dn, of bij kaartrijen de u-url>",
  "bak": "<code uit register of Kern>",
  "zekerheid": "hoog|middel|laag",
  "reden": "alleen bij zekerheid laag of bij afwijking van mech, max 12 woorden"}]

Rapporteer als eindtekst alleen: aantal items, verdeling over de bakken (top 8), hoeveel
op Kern bleef en waarom dat terecht is.
