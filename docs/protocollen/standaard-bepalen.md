# Standaard-oogst: gebruikte standaard of kader destilleren uit passages

Je krijgt rapporten van de Rijksmap waarvoor het veld "standaard" nog leeg is. Per rapport
staan er maximaal 6 passages uit de rapporttekst waarin een signaalwoord voorkomt
(standaard, kader, leidraad, protocol, ISSAI, NBA, enzovoort). Jouw taak: bepalen of het
rapport een METHODISCHE standaard of beoordelingskader noemt waaraan het onderzoek zelf
zich bindt, en zo ja welke.

## Wat WEL telt als standaard

- Audit- en assurancestandaarden: ISSAI, NBA-COS (bijv. NBA 4400, NBA 3000A), NOREA
  (3000D e.d.), IIA-standaarden, Nederlandse controlestandaarden, ISAE.
- Wettelijke onderzoekskaders die de aanpak normeren: Comptabiliteitswet (bij audits),
  CW 3.1 / artikel 3.1 CW (bij beleidsdoorlichtingen en evaluaties die dat expliciet
  als kader noemen), Regeling Periodiek Evaluatieonderzoek (RPE).
- Methodische leidraden die het onderzoek stuurt: Algemene MKBA-leidraad, Werkwijzer
  (bijv. Werkwijzer voor kosten-batenanalyse), Aanwijzingen voor de Planbureaus,
  visitatie- of peer-reviewprotocollen (bijv. OESO/EU-peer-reviewkader), ISO/NEN-normen
  als toetsnorm, EN 301 549 (toegankelijkheid).

## Wat NIET telt

- De wet of regeling die ONDERZOCHT wordt (Participatiewet, Klimaatwet als object).
- Beleidsdoelen of akkoorden (Klimaatakkoord als onderwerp).
- Terloopse verwijzingen naar andermans richtlijnen zonder dat het rapport ze zelf
  als eigen kader gebruikt.
- Modellen of datasets (Saffier, WLO-scenario's) - dat zijn instrumenten, geen standaard.

## Uitvoerlabel

Kort en conform het bestaande kaartvocabulaire waar mogelijk: "ISSAI", "NBA 4400",
"NOREA 3000D", "IIA (non-assurance)", "Comptabiliteitswet", "CW 3.1", "RPE",
"Algemene MKBA-leidraad", "Aanwijzingen voor de Planbureaus", "ISO 27001",
"EN 301 549". Meerdere kaders: de belangrijkste, plus de tweede alleen als beide
echt dragend zijn ("NBA 4400 + NOREA 4400"). Twijfel of niets dragends: label leeg.

## Werkwijze

1. Lees het batchbestand (pad krijg je opgegeven): per rapport {u, t, mid, src, passages}.
2. Beoordeel ALLEEN op de passages; niets opzoeken.
3. Schrijf naar het opgegeven uitvoerpad een JSON-array met per rapport
   {"u": "...", "standaard": "..." of "", "bewijs": "kortste citaat (max 20 woorden) dat het label draagt, of leeg", "zeker": "hoog|middel|laag"}
4. Evenveel rijen als de invoer, zelfde volgorde. Wees streng: liever leeg dan een
   gezocht label; een leeg label is een geldig antwoord.
