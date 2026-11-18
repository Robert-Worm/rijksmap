# Overstappen naar de nieuwe Rijksmap

Uitwerking van [#64](https://github.com/Robert-Worm/rijksmap/issues/64), onderdeel van [epic #63](https://github.com/Robert-Worm/rijksmap/issues/63). Bijgesteld op 18 november 2026 naar de praktische werkwijze van de beheerder.

## Eerst rustig testen op Sliplane

De nieuwe versie draait op een eigen Sliplane-testadres. Dat kan op de bestaande Rijksmap-testservice of op een aparte service, terwijl de huidige publieke website beschikbaar blijft. Controleer bij het kiezen van de service welk domein eraan hangt, zodat een testuitrol de publieke versie niet vervangt.

We testen, verbeteren en testen opnieuw totdat de beheerder tevreden is. Daarna zetten we de publieke website in één keer over. Er is geen verplichte testweek, beschikbaarheidspercentage, uitgebreide belastingproef of aparte goedkeuringsronde voor iedere test nodig.

Deze checklist helpt om niets belangrijks te vergeten. De beheerder beslist over de daadwerkelijke overstap. Dit document voert geen uitrol of domeinwijziging uit.

## Korte checklist

Noteer bij een testronde het testadres, de versie, de datum en de uitkomst. Een korte reactie in #64 of een verwijzing naar een bestaande testuitslag is genoeg.

| Wat controleren we? | Hoe testen we dat? | Wanneer is het voldoende? | Wat bewaren we? |
| --- | --- | --- | --- |
| Gegevens en tellingen | Draai de bestaande gelijkheidstest op dezelfde gegevens als de oude versie. Vergelijk ook de JSON- en CSV-export. | Nul onverklaarde ontbrekende of dubbele gegevens en gelijke tellingen. Bewust gewijzigde gegevens zijn verklaard. | Uitslag van [#26](https://github.com/Robert-Worm/rijksmap/issues/26) en de exportvergelijking uit [#32](https://github.com/Robert-Worm/rijksmap/issues/32). |
| Kaart, zoeken en pagina's | Open een ministerie en onderdeel, zoek met en zonder resultaat, gebruik filters en open een rapport. Probeer dit op een computer en telefoon, ook met het toetsenbord. | Alle genoemde handelingen werken. Het getal op de kaart klopt met de treffers na klikken. Geen fout die normaal gebruik verhindert. | Korte afvinklijst; bij een fout een voorbeeld of schermafbeelding. Gebruik de tests uit [#34](https://github.com/Robert-Worm/rijksmap/issues/34), [#35](https://github.com/Robert-Worm/rijksmap/issues/35) en [#36](https://github.com/Robert-Worm/rijksmap/issues/36). |
| Oude links en favorieten | Controleer de oude sitemap automatisch. Open daarnaast enkele oude deeplinks en een bewaarde favoriet in de browser. | De sitemapcontrole geeft geen onverklaarde kapotte interne links; de geteste deeplinks en favorieten openen het juiste item. | Linkcontrole en de gebruikte voorbeelden uit [#27](https://github.com/Robert-Worm/rijksmap/issues/27) en [#66](https://github.com/Robert-Worm/rijksmap/issues/66). |
| Snelheid en stabiel gebruik | Gebruik de testversie tijdens het gewone uitproberen. Meet een keer de eerste download en de laadtijd van kaart, ministerie en zoekresultaat, op dezelfde manier als bij de oude versie. Bekijk bij problemen de Sliplane-status en het geheugen. | De beheerder vindt de bediening vlot genoeg. Er zijn geen onopgeloste, herhaalbare vastlopers of storingen bij deze handelingen. Metingen helpen bij verbeteren; er geldt geen extra harde seconden- of geheugengrens vanuit #64. | Een paar meetwaarden en eventuele bevindingen. Bestaande metingen uit [#38](https://github.com/Robert-Worm/rijksmap/issues/38) kunnen worden hergebruikt. |
| Beschikbare beheerfuncties en privacy | Test de functies die bij deze versie meegaan, met testgegevens: wijzig iets, bekijk de geschiedenis en draai de wijziging terug. Controleer dat een bezoeker niet kan wijzigen en dat de publieke site geen tracking toevoegt. | De aangeboden functies werken, wijzigingen zijn herleidbaar en onbevoegd wijzigen lukt niet. Nog niet aangeboden functies hoeven de overstap niet tegen te houden; noteer wat wel en niet meegaat. | Korte testnotitie en verwijzingen naar de bestaande beheer- en privacycontroles. |
| Juiste versie en terugweg | Controleer welke versie op het testadres draait. Bewaar het huidige werkende Docker-image en de bijbehorende gegevens. Probeer één keer het starten van de vorige versie. | De geteste versie is herkenbaar en de vorige versie kan weer worden gestart. De stappen om terug te schakelen zijn bekend. | Versienummer of commit, vindplaats van het oude image en een kort verslag van de herstelproef, met de werkelijk gemeten tijd. [#41](https://github.com/Robert-Worm/rijksmap/issues/41) en [#65](https://github.com/Robert-Worm/rijksmap/issues/65). |

De uitvoerende stories blijven eigenaar van hun controles. Deze checklist voegt geen tweede volledige toegankelijkheidsaudit of beveiligingsonderzoek toe. Bestaande afspraken over gegevenskwaliteit, toegankelijkheid en privacy blijven gelden.

Kleine bekende punten, zoals opmaak of een minder handige tekst, kunnen op de verbeterlijst blijven staan. Noteer ze en laat de beheerder bepalen of ze de overstap hinderen. Na een aanpassing testen we de geraakte onderdelen opnieuw; de hele testperiode begint niet telkens opnieuw.

## Overzetten en zo nodig terug

Als de beheerder tevreden is met de testversie en de bekende punten, geeft hij aan dat deze versie naar het publieke domein mag. Noteer dat kort bij [#67](https://github.com/Robert-Worm/rijksmap/issues/67), met de versie en het testadres. [#65](https://github.com/Robert-Worm/rijksmap/issues/65) beschrijft de concrete stappen, passend bij de dan gekozen Sliplane-services.

Na het overzetten openen we de kaart, doen we een zoekopdracht en controleren we een rapport en een oude link op het publieke domein.

| Wat gaat er mis? | Wat doen we? |
| --- | --- |
| Een kernhandeling werkt bij opnieuw proberen nog steeds niet, of de site blijft onbereikbaar. | De beheerder kiest tussen direct herstellen en terugzetten naar de vorige werkende versie. |
| Er blijken gegevens verloren of verkeerd gekoppeld, of onbevoegden kunnen wijzigen. | Stop de betreffende schrijfacties en herstel het probleem of zet terug. Bewaar nieuwe geaccepteerde wijzigingen zodat die niet verloren gaan. |
| Een losse link, opmaakdetail of klein gebruiksprobleem valt op. | Leg het vast en herstel het gericht. Dit vraagt niet automatisch om terugzetten van de hele website. |

Er is geen vaste hersteltermijn van tien minuten en geen verplichte week observatie na de overstap. We houden de vorige versie beschikbaar totdat de beheerder vindt dat die niet meer nodig is. Daarna kan [#68](https://github.com/Robert-Worm/rijksmap/issues/68) het archief en opruimen verzorgen. Pages uitzetten is alleen aan de orde als Pages dan nog in gebruik is.

## Korte testnotitie

- Testadres, versie en datum:
- Uitgevoerde controles en uitslagen:
- Bekende punten: eerst oplossen / later verbeteren:
- Vorige versie en terugweg:
- Beheerder tevreden met overstap: nog niet beoordeeld / ja, met datum:

De controles in dit document zijn nog niet uitgevoerd voor de nieuwe applicatie. De actuele uitkomsten komen in de testnotities bij de uitvoering.
