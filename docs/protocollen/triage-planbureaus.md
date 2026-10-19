# Triageprotocol planbureau-publicaties (CPB / SCP / PBL)

Je beoordeelt publicaties van de drie planbureaus (2019-nu) op geschiktheid voor de
Rijksmap (rijksmap.nl): de kaart van de rijksoverheid met openbare onderzoeksrapporten
over (het functioneren, beleid of de uitvoering van) rijksorganisaties.

Elke rij heeft: pb (bureau), d (datum), t (titel), s (samenvatting, kan leeg zijn),
soms type. Beoordeel op titel + samenvatting samen.

## Wat WEL kandidaat is (besluit "opnemen")

- Evaluaties en doorlichtingen van rijksbeleid of regelingen (ook ex-ante en ex-durante):
  toeslagenstelsel, Participatiewet, studiefinanciering, klimaatbeleid, woningmarktbeleid.
- Onderzoek naar het functioneren van rijksorganisaties of stelsels die het Rijk aanstuurt
  (Belastingdienst, uitvoeringsorganisaties, jeugdzorgstelsel, politie-domein).
- Doorrekeningen van kabinetsbeleid en beleidsopties (doorrekening coalitieakkoord,
  ombuigings- en intensiveringslijsten, alternatief toeslagenstelsel, Klimaat- en
  Energieverkenning, doorrekening pakketten).
- Vaste rapportages op verzoek van een ministerie: Risicorapportage financiele markten,
  monitors van rijksbeleid (bijvoorbeeld Monitor Brede Welvaart-achtig werk in opdracht).
- Certificeringen van budgettaire ramingen van ministeries (CPB-certificering).
- Wettelijk verankerde beleidsverkenningen die het kabinet direct voeden.

## Wat NIET (besluit "afwijzen" + korte reden)

- Periodieke macro-ramingen als cijferpublicatie: CEP, MEV, juniraming,
  (middellange)termijnverkenningen zonder beleidsevaluatief karakter.
- Doorrekeningen van verkiezingsprogramma's van POLITIEKE PARTIJEN (Keuzes in Kaart):
  gaat over partijen, niet over de rijksoverheid.
- Wetenschappelijke discussion papers, methodologische stukken, modelbeschrijvingen,
  datapublicaties (bijv. "Het human capital model van het CPB", "Naar een nieuw TIGRIS XL?").
- Onderzoek naar de samenleving zonder rijksbeleid als onderwerp (opiniepeilingen,
  leefstijlonderzoek, cultuurmonitors) - tenzij het expliciet een rijksregeling of
  rijksbeleid evalueert.
- Internationaal of decentraal gericht werk zonder rijkscomponent (EU-analyses,
  gemeentelijk niveau, buitenland).
- Columns, position papers, jaarverslagen van het bureau zelf, conceptadviezen SDE++
  en andere technisch-instrumentele reeksen zonder evaluatie van rijksbeleid.

## Twijfel

Bij echte twijfel: besluit "onzeker" + wat onduidelijk is. Liever onzeker dan gokken.
Let op: de grens "onderzoekt dit rijksbeleid of beschrijft dit de samenleving" is bij
SCP vaak subtiel; gebruik de samenvatting.

## Werkwijze

1. Lees het batchbestand pb-bron/triage/batch-NNN.json.
2. Beoordeel ALLEEN op de gegeven metadata; niets opzoeken.
3. Schrijf pb-bron/triage/oordeel-batch-NNN.json: JSON-array met per rij
   {"u": "...(de URL, als sleutel)", "besluit": "opnemen|afwijzen|onzeker",
    "reden": "max 12 woorden", "org": "vermoedelijk betrokken ministerie/onderdeel of leeg"}
4. Evenveel rijen als de invoer, zelfde volgorde. Reden verplicht bij afwijzen.
