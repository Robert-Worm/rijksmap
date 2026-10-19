# Triageprotocol Tweede Kamer-bijlagen (TK-veegactie, fase 2)

Je beoordeelt titels van bijlagen die bij Kamerbrieven aan de Tweede Kamer zijn
meegestuurd (2019-nu). Per rij besluit je of de bijlage een KANDIDAAT is voor de
Rijksmap (rijksmap.nl): de kaart van de rijksoverheid met openbare onderzoeksrapporten.

## Wat WEL kandidaat is (besluit "opnemen")

Openbare rapporten van onderzoek, audit, evaluatie, toezicht of monitoring dat gaat
OVER (het functioneren, beleid of de uitvoering van) een rijksoverheidsorganisatie:
ministeries, directies, uitvoeringsdiensten (Belastingdienst, DJI, IND, RWS, politie...),
inspecties, agentschappen en ZBO's. Auteurs kunnen zijn: Auditdienst Rijk, Algemene
Rekenkamer, rijksinspecties, WODC, adviescolleges met een onderzoeksrapport, kennisinstellingen
(RIVM, TNO, SCP, CPB, PBL) en externe bureaus (KPMG, Berenschot, AEF, SEO, Panteia...)
in opdracht van het Rijk. Ook: beleidsdoorlichtingen, DPIA's/GEB's van rijksdiensten,
"Stand van de uitvoering"-rapportages, incidentonderzoeken, ICT-toetsen (AcICT).

## Wat NIET (besluit "afwijzen" + korte reden)

- Wetgevingsproces: consultatie-adviezen op wetsvoorstellen, Raad van State, memories,
  nota's, uitvoeringstoetsen op een wetsvoorstel.
- Kabinetsstukken zelf: beleidsnota's, visiestukken, actieplannen, Kamerbrieven,
  convenanten, bestuurlijke reacties op een rapport (het rapport zelf is apart).
- EU/internationaal proces: raadsdocumenten, verklaringen, fiches, non-papers.
- Niet-rijk: rapporten die uitsluitend over gemeenten, provincies, bedrijven,
  scholen/zorginstellingen of het buitenland gaan zonder rijksorganisatie als onderwerp.
- Procesbijlagen: agenda's, verslagen van overleggen, factsheets, infographics,
  organogrammen, deelnemerslijsten, jaarplannen/werkprogramma's (voornemens, geen onderzoek).
- Puur wetenschappelijk/algemeen onderzoek zonder link met een rijksorganisatie of
  rijksbeleid-evaluatie.

## Twijfel

Bij echte twijfel (titel te vaag, scope onduidelijk, zou beide kunnen): besluit
"onzeker" + wat je zou moeten weten. Liever onzeker dan gokken.

## Werkwijze

1. Lees het batchbestand tk-bron/triage/batch-NNN.json: rijen {dn, d (datum), ow (titel)}.
2. Beoordeel ALLEEN op de titel en datum; je hoeft niets op te zoeken.
3. Schrijf tk-bron/triage/oordeel-batch-NNN.json: een JSON-array met per rij
   {"dn": "...", "besluit": "opnemen|afwijzen|onzeker", "reden": "max 12 woorden",
    "aut": "vermoedelijke auteur of leeg", "org": "vermoedelijk onderzocht onderdeel of leeg"}
4. Het aantal uitvoerrijen MOET gelijk zijn aan het aantal invoerrijen; zelfde volgorde.
5. Bij "afwijzen" is de reden verplicht; bij "opnemen" vul aut/org zo mogelijk in.
