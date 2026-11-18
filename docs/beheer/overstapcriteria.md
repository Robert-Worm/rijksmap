# Overstapcriteria voor de nieuwe Rijksmap

**Status: voorstel voor de beheerder, nog niet goedgekeurd.**

Uitwerking van [#64](https://github.com/Robert-Worm/rijksmap/issues/64), onderdeel van [epic #63](https://github.com/Robert-Worm/rijksmap/issues/63). Opgesteld op 18 november 2026. Dit document legt meetbare eisen voor een latere overstap vast. Het bevat geen uitgevoerde acceptatietest of toestemming om over te stappen.

## Wie beslist en wanneer?

1. De beheerder keurt eerst de criteria, grenswaarden en testset goed in #64, met een verwijzing naar de exacte documentversie. Tot dat moment zijn ook de getallen hieronder voorstellen.
2. Uitvoerders verzamelen bewijs voor één vastgelegde kandidaatversie. Een beoordelaar controleert de uitkomsten. Een geslaagde test of samengevoegde PR is geen goedkeuring door de beheerder.
3. De beheerder geeft afzonderlijk een go/no-go voor de overstap in [#67](https://github.com/Robert-Worm/rijksmap/issues/67), op basis van alle criteria en het geoefende draaiboek uit [#65](https://github.com/Robert-Worm/rijksmap/issues/65).
4. Pages uitzetten en opruimen vragen later een apart besluit. Ze horen bij #67 en [#68](https://github.com/Robert-Worm/rijksmap/issues/68).

Een criterium is **open**, **geslaagd** of **gefaald**. Ontbrekend, verlopen of niet reproduceerbaar bewijs betekent open en dus geen overstap. Er zijn geen punten die elkaar compenseren. Alle criteria moeten geslaagd zijn. Een afwijking vraagt een expliciete wijziging van de criteria door de beheerder, met reden en nieuwe toets. Een open gebrek stilzwijgend accepteren mag niet.

## Vaste basis voor iedere meting

Leg vóór de eerste test in het bewijsdossier vast:

- de exacte Git-commit van de kandidaat, het controlegetal van de container, de dataversie en het SHA-256-controlegetal van de bronexport;
- de commit en export van de oude site waarmee wordt vergeleken, inclusief sitemap, oude sleutels, deeplinks en favorieten;
- testadres, datum en tijd met tijdzone, uitvoerder, beoordelaar, testscript en versie van gereedschap, browser en besturingssysteem;
- de vooraf gekozen testgevallen, verwachte uitkomsten, meetinstellingen en aantallen;
- per criterium de ruwe meetuitvoer, een leesbare uitkomst, eventuele bevindingen en een blijvende verwijzing naar het bewijs.

Oud en nieuw gebruiken dezelfde vastgelegde gegevens. Leg verschillen in tijdstip of data eerst gelijk; keur geen verdwenen records goed als een nieuwe publicatie. Voorstellen voor inhoudelijke correcties lopen via hun eigen review. Vergelijk op ID en veldinhoud, niet alleen op totaalaantallen.

Bewaar bewijs als bijlage bij de betreffende issues of bij een versie in de repository. Verwijzingen moeten voor de beheerder toegankelijk blijven. Publiceer geen tokens, sessiecookies, echte bezoekersgegevens of onbewerkte beheersessies. Gebruik fictieve beheeraccounts en testgegevens in een afgescheiden testomgeving.

Een wijziging aan code, data, container of instellingen maakt geraakt bewijs ongeldig. Leg vast welke controles opnieuw nodig zijn. De testweek begint bij zo'n wijziging opnieuw; alleen een documentwijziging zonder effect op de draaiende versie hoeft dat niet. Vóór het go/no-go zijn de korte eindcontroles maximaal 24 uur oud en is de laatste geslaagde testweek maximaal 24 uur geleden geëindigd.

## Criteria

De uitvoerder van de gekoppelde story levert bewijs. De beheerder wijst vóór de uitvoering een persoon aan voor uitvoering en beoordeling. De onderstaande grenzen zijn projectvoorstellen, geen gemeten prestaties of verklaring dat de site aan een norm voldoet.

### C01. De geteste versie is de versie die overgaat

- **Grens:** alle toepasselijke bouw-, data-, server- en vergelijkingstests slagen, zonder overgeslagen verplichte test. De verpakte applicatie meldt precies de verwachte code- en dataversie. Nul onverklaarde versieverschillen.
- **Toets:** bouw vanuit een schone checkout; bewaar, laad en start hetzelfde pakket opnieuw. Controleer health, ready en version. Test ook dat een bewust verkeerde verwachte versie als verschil wordt gemeld. Herhaal versie en readiness vlak vóór en na de overstap.
- **Bewijs:** testuitvoer met aantallen, pakketcontrolegetal, verwachte en gemelde versie, code- en dataversie na herstart. Een groene workflow zonder de vereiste controles is onvoldoende.
- **Bij onvoldoende resultaat:** geen overstap; na overstap geldt terugvalgrens T1 of T3.
- **Levering:** [#10](https://github.com/Robert-Worm/rijksmap/issues/10), [#31](https://github.com/Robert-Worm/rijksmap/issues/31), [#39](https://github.com/Robert-Worm/rijksmap/issues/39), [#41](https://github.com/Robert-Worm/rijksmap/issues/41).

### C02. Gegevens, tellingen en open data zijn gelijk

- **Grens:** nul ontbrekende of dubbele entiteiten, nul onverklaarde veldverschillen en nul verschillen in tellingen per ministerie, onderdeel, bron, jaar en risicolabel. CSV en JSON bevatten dezelfde velden en waarden als de oude export. Volgorde blijft gelijk waar de bestaande uitvoer die bepaalt.
- **Toets:** vergelijk de volledige vastgelegde bronexport met de database én met de export uit de verpakte applicatie. Controleer alle entiteitsoorten, ID's, relaties en herkomstvelden. Controleer voor iedere vooraf vastgelegde combinatie in de filtertest dat het getal op de kaart gelijk is aan het aantal zichtbare treffers. De testset bevat elk ministerie, onderdeel, bron, jaar en risicolabel, plus combinaties met nul en meerdere treffers.
- **Bewijs:** bronexport met controlegetal, volledige tellingentabel, veldvergelijking en lijst van afwijkingen, ook als deze leeg is. Bestaand bewijs uit #26 wordt gekoppeld en op de kandidaatversie herhaald; deze story bouwt die test niet opnieuw.
- **Bij onvoldoende resultaat:** geen overstap; na overstap geldt T2.
- **Levering:** [#25](https://github.com/Robert-Worm/rijksmap/issues/25), [#26](https://github.com/Robert-Worm/rijksmap/issues/26), [#32](https://github.com/Robert-Worm/rijksmap/issues/32), [#36](https://github.com/Robert-Worm/rijksmap/issues/36).

### C03. Oude adressen, deeplinks en favorieten blijven bruikbaar

- **Grens:** 100% van de unieke adressen uit de vastgelegde oude sitemap en koppeltabel komt bij dezelfde entiteit of vaste pagina uit. Leg voor pagina's zonder entiteit, zoals de homepage, de verwachte paginanaam en inhoud vast in plaats van een verzonnen ID. Elk oud adres geeft 200, of 308 naar een werkende pagina; maximaal één doorverwijzing binnen Rijksmap. Nul lussen, 404's, verkeerde entiteiten of verloren favorieten. Het oude testadres volgt de afgesproken doorverwijzing.
- **Toets:** loop alle adressen af en controleer naast de statuscode de verwachte ID. Test oude deeplinks in een browser, omdat het deel na `#` niet naar de server gaat. Test alle koppelingen van oude sleutels naar ID's en per ondersteunde deeplinkvorm minimaal één geval per ministerie. Importeer een vaste set oude localStorage-favorieten, inclusief meerdere rapporten, bijzondere tekens en lege opslag, en herlaad de browser. Een onbekende sleutel geeft een begrijpelijke melding en opent geen andere entiteit.
- **Bewijs:** bevroren adressenlijst en koppeltabel, verwacht/gevonden-ID per adres, redirectketens en browserverslag voor deeplinks en favorieten.
- **Bij onvoldoende resultaat:** geen overstap; een gebroken bestaande link of verkeerde bestemming na de overstap valt onder T2.
- **Levering:** [#27](https://github.com/Robert-Worm/rijksmap/issues/27), #32, [#66](https://github.com/Robert-Worm/rijksmap/issues/66).

### C04. De vaste gebruikstaken werken

- **Grens:** 100% van de vooraf vastgelegde taken slaagt in de op testdatum actuele stabiele Chrome, Firefox, Edge en Safari, met vastgelegde versienummers. Minimaal één Android-toestel en één iOS-toestel doen mee. De zoektest geeft dezelfde treffers en volgorde. Nul open fouten die een taak blokkeren of een verkeerde inhoud tonen.
- **Toets:** open een ministerie en onderdeel; zoek met en zonder resultaat; combineer en wis filters; open een rapport vanuit de kaart; ga terug; volg kruimelpaden; bewaar en heropen een favoriet; download CSV en JSON; druk een geopend ministerie af. Test op 360 en 1280 CSS-pixels breed, licht en donker. Vergelijk dezelfde vaste schermbeelden met oud en noteer ieder inhoudelijk of functioneel verschil.
- **Bewijs:** taakmatrix per browser/apparaat, zoekresultaten, schermbeelden en bevindingen met hertest. Voor een afwijkend uiterlijk legt de beoordelaar vast waarom inhoud en bediening behouden zijn.
- **Bij onvoldoende resultaat:** geen overstap; na overstap T2 voor verkeerde inhoud, T3 voor onbruikbare kerntaken.
- **Levering:** [#33](https://github.com/Robert-Worm/rijksmap/issues/33), [#34](https://github.com/Robert-Worm/rijksmap/issues/34), #36.

### C05. Laden en zoeken zijn aantoonbaar snel genoeg

- **Grens:** bij een lege browsercache maximaal 1.000.000 overgedragen bytes tot de kaart bruikbaar is, inclusief alle aanvragen die daarvoor nodig zijn, en minstens 30% minder dan de oude kaart. De 95e percentielwaarde is maximaal 5 seconden tot bruikbaar overzicht, 2 seconden voor het openen van een ministerie en 1 seconde van zoekactie tot volledig resultaat. Geen van deze tijden is meer dan 10% slechter dan oud onder dezelfde omstandigheden. Alle absolute én relatieve grenzen gelden.
- **Toets:** 30 runs per taak, per versie, afwisselend oud en nieuw, met dezelfde computer en browser. Gebruik 1,6 Mbit/s download, 750 kbit/s upload, 150 ms vertraging en viermaal vertraagde processor. Leg het hulpmiddel en de precieze instellingen vast. De kaart is bruikbaar zodra overzicht en tellingen zichtbaar zijn en een ministerie geopend kan worden. Start de tweede taak pas daarna en zoek pas wanneer dat ministerie geladen is. Meet afzonderlijk ook een herhaalbezoek met warme cache. Sorteer de 30 waarden; p95 is waarde 29, zonder runs weg te laten. Een mislukte run is een fout en vraagt hertest van de hele reeks.
- **Bewijs:** netwerkuitvoer, meetpunten, alle 30 waarden per taak en versie, p95, bytes en vergelijking. Meet op de testservice met de volledige dataset; metingen op een ontwikkelcomputer alleen zijn niet genoeg.
- **Bij onvoldoende resultaat:** geen overstap; na overstap geldt de aanhoudende prestatiegrens T4.
- **Levering:** #34, #36. De genoemde grenzen zijn een voorstel om de kleinere eerste download en bruikbaarheid op een trage verbinding toetsbaar te maken.

### C06. Toegankelijkheid is getoetst

- **Grens:** nul geconstateerde overtredingen van de toepasselijke WCAG 2.1 A- en AA-criteria in de onderzochte pagina's en taken, en nul achteruitgang in bestaande toegankelijkheidsfuncties. Alle taken uit C04 zijn zonder muis uitvoerbaar. Er zijn geen ononderzochte meldingen uit de automatische controle.
- **Toets:** controleer kaart, ministerie, onderdeel, rapport, zoekresultaat en beheerformulier automatisch én handmatig. Test toetsenbord, zichtbare focus, geen toetsenbordval, namen en standen van knoppen, live-meldingen, contrast in beide thema's, 200% zoom en herindeling bij 320 CSS-pixels. Voer de taken uit met NVDA en Firefox op Windows en VoiceOver en Safari op iOS. Leg per toepasselijk succescriterium resultaat en reden vast, ook bij niet van toepassing.
- **Bewijs:** rapport per succescriterium, automatische uitvoer, handmatige stappen, gebruikte hulpmiddelversies en hertests. Dit bewijst alleen de onderzochte scope; een automatische score is geen volledige toegankelijkheidsaudit. De externe rapport-pdf's vallen buiten de applicatietoets.
- **Bij onvoldoende resultaat:** geen overstap; een blokkade in een kerntaak na overstap valt onder T3.
- **Levering:** [#35](https://github.com/Robert-Worm/rijksmap/issues/35) en [de bestaande toegankelijkheidsverklaring](../../ACCESSIBILITY.md).

### C07. Privacy en beveiligingsgrenzen zijn gecontroleerd

- **Grens:** tijdens de publieke taken nul automatische verzoeken naar andere domeinen, nul trackers en nul cookies. Expliciet geopende officiële bronlinks vallen buiten deze meting. Nul open hoge of kritieke beveiligingsbevindingen; nul onbevoegde schrijfacties. De afgesproken beveiligingsheaders zijn aanwezig op de geteste antwoorden. Opslag, toegang en bewaartermijn van infrastructuurlogs zijn aantoonbaar vastgesteld en door de beheerder beoordeeld.
- **Toets:** inspecteer netwerk, opslag en headers met een schoon browserprofiel tijdens alle C04-taken, inclusief foutpagina, redirect, cacheantwoord en downloads. Controleer CSP en HTTPS/HSTS op het echte testadres. Test logging met fictieve herkenbare zoekvragen en headers; onderzoek proceslogs en beschikbare proxylogs. Leg onbekende delen van de hostingketen als open punt vast. Toets de inlog en rollen volgens C08. Classificeer bevindingen met de vastgelegde reviewmethode; niet geclassificeerd betekent open.
- **Bewijs:** geschoonde netwerk- en opslagcontrole, headeruitvoer, beveiligingsreview, bevindingen met hertest en gedateerde hostingbevestiging voor infrastructuurlogs. Voor beheer beschrijft #43 apart of een strikt noodzakelijke sessiecookie nodig is; die keuze moet vóór gebruik goedgekeurd zijn en mag de publieke privacygrens niet stilzwijgend wijzigen.
- **Bij onvoldoende resultaat:** geen overstap; een datalek of onbevoegde wijziging na overstap valt onder T2. Een onverwachte tracker of externe automatische aanvraag vraagt direct stoppen van die functie en terugval als dat niet veilig kan.
- **Levering:** [#16](https://github.com/Robert-Worm/rijksmap/issues/16), #35, [#43](https://github.com/Robert-Worm/rijksmap/issues/43). [PR #71](https://github.com/Robert-Worm/rijksmap/pull/71) bevat nog open controles over uitrol en infrastructuurlogs; lokale headertests sluiten die niet af.

### C08. Beheer en herstel van wijzigingen werken

- **Grens:** alle geldige beheertaken slagen en alle onbevoegde pogingen worden geweigerd zonder datawijziging. Iedere geslaagde wijziging is precies herleidbaar tot ID, wie, wanneer en waarom; AI-bijdragen blijven herkenbaar. Een teruggedraaide wijziging herstelt aantoonbaar de vorige inhoud. Nul verloren gelijktijdige wijzigingen.
- **Toets:** de beheerder doorloopt in de afgescheiden testomgeving inloggen en uitloggen, een rapport/persoon/onderdeel aanpassen, verhuizen, toevoegen en verwijderen, ontkoppelde rapporten behandelen en een bulkwijziging. Controleer de commit en de zichtbare uitkomst na de normale publicatieroute. Draai iedere soort wijziging terug. Test anoniem, verkeerde rol, verlopen sessie, ongeldige invoer en twee gelijktijdige conflicterende wijzigingen. Neem alle ingeschakelde schrijfroutes mee, ook AI en GitHub als die beschikbaar zijn. Niet aangeboden routes moeten aantoonbaar uitgeschakeld zijn; kernbeheer wordt niet als niet van toepassing afgevinkt.
- **Bewijs:** taak- en rollenmatrix, fictieve invoer, commits, versies vóór/na, terugdraaiuitvoer en conflictuitkomst. Noteer welke routes ingeschakeld zijn. Het bewijs toont ook dat testen geen productiegegevens hebben gewijzigd.
- **Bij onvoldoende resultaat:** geen overstap; na overstap schrijfacties stoppen bij gegevensverlies of onbevoegd schrijven, zie T2.
- **Levering:** #43 tot en met [#49](https://github.com/Robert-Worm/rijksmap/issues/49), en waar ingeschakeld [#53](https://github.com/Robert-Worm/rijksmap/issues/53), [#55](https://github.com/Robert-Worm/rijksmap/issues/55) en [#61](https://github.com/Robert-Worm/rijksmap/issues/61).

### C09. De kandidaat draait zeven dagen stabiel en past op de server

- **Grens:** zeven aaneengesloten perioden van 24 uur op dezelfde kandidaat en instellingen. Minstens 99,9% geslaagde meetrondes, nul onverklaarde meetgaten, nul ongeplande herstarts of beëindigingen door geheugentekort en nul incidenten met verkeerde gegevens. De totale server heeft steeds minstens 20% beschikbaar geheugen. Bij normaal gebruik en de afgesproken piek wordt geen van de andere services meer dan 10% trager op p95.
- **Toets:** iedere vijf minuten één ronde met health, ready, version, homepage, een ministerie, een rapport en één vaste zoekvraag; een ronde slaagt alleen als alle controles de juiste status, versie en inhoud geven binnen 5 seconden per controle. Dit levert 2.016 rondes; maximaal twee mogen falen. Een ontbrekende ronde telt als fout en moet worden verklaard. Meet daarnaast elke minuut beschikbaar servergeheugen en gebruik per service. Leg capaciteit in bytes vast, inclusief besturingssysteem en overige processen, niet alleen Node-heap.
- **Piekproef:** na vijf minuten opwarmen gedurende 30 minuten tien gelijktijdige synthetische bezoekers, ieder met één taak per vijf seconden, evenredig verdeeld over overzicht, ministerie, rapport en zoeken. Meet fouten en p95; de tijdgrenzen uit C05 gelden ook hier. Vergelijk de andere services met een aansluitende 30-minutenmeting zonder deze testbelasting bij dezelfde eigen belasting. Iedere verslechtering boven 10%, minder dan 20% beschikbaar geheugen of een fout door overbelasting laat deze proef falen. Uitvoering op de gedeelde server vereist afstemming met de beheerder en de andere service-eigenaar; deze story voert die belasting niet uit.
- **Bewijs:** begin/einde, alle meetrondes en gaten, incidentlog, herstarts, geheugengrafiek met ruwe waarden, capaciteit en piekproef. Een nieuw functioneel of operationeel probleem moet opgelost en opnieuw getoetst zijn; de testweek begint na de wijziging opnieuw.
- **Bij onvoldoende resultaat:** geen overstap; na overstap gelden T3 en T4.
- **Levering:** [#38](https://github.com/Robert-Worm/rijksmap/issues/38), [#40](https://github.com/Robert-Worm/rijksmap/issues/40), #41 en #36. Tien bezoekers is een expliciete voorgestelde proefbelasting, geen voorspelling van het bezoek. De beheerder stelt vóór de proef een hogere belasting vast als verwacht gebruik dat vraagt.

### C10. De terugweg is bewezen en bemenst

- **Grens:** één volledige terugvaloefening met de kandidaat slaagt in maximaal 10 minuten vanaf de beslissing tot de oude versie aantoonbaar bruikbaar is. Nul verlies van vóór het stoppunt geaccepteerde wijzigingen; alle bijbehorende commits zijn veiliggesteld en verantwoord. Een bewezen herstelroute en verantwoordelijke beheerder zijn beschikbaar gedurende de overstap en observatieperiode.
- **Toets:** oefen #65 in een afgescheiden omgeving met het echte pakket en een kopie van de data. Leg de oude versie, het terugvaldoel en de route vast. Stop schrijfacties, stel de laatste geaccepteerde commits veilig, schakel terug en controleer versie, links, zoeken en exports. Noteer welke nieuwe gegevens de oude site tijdelijk nog niet kan tonen en hoe die later gecontroleerd worden verwerkt. Als terugval afhankelijk is van DNS, moet het draaiboek rekening houden met caches en TTL; een lokale simulatie bewijst dan geen herstel binnen 10 minuten. Onbewezen netwerkstappen houden dit criterium open.
- **Bewijs:** draaiboekversie, start- en eindtijd, meting van de hersteltijd, inhoudelijke controles, data-aansluiting en namen van uitvoerder, beslisser en vervanger. Bewaar het oude pakket en de statische bron als controleerbaar herstelpunt.
- **Bij onvoldoende resultaat:** geen overstap. Een ontbrekende of onbereikbare terugweg tijdens de overstap is T1; verdergaan om tijd te winnen mag niet.
- **Levering:** #65. Dit document bevat grenzen voor het draaiboek; de concrete hostingstappen worden daar uitgewerkt en apart geautoriseerd.

## Stoppen en terugvallen

Dit zijn voorgestelde grenzen voor #65 en #67. Ze zijn pas een uitvoeringsmandaat nadat de beheerder het draaiboek en de betreffende handelingen heeft goedgekeurd. Zonder dat mandaat meldt de uitvoerder het incident direct aan de beheerder; hij wijzigt geen hosting of DNS. De beheerder bepaalt vóór de overstap wie mag terugvallen en wie vervangt bij afwezigheid. Zonder bereikbare beslisser en uitvoerder begint de overstap niet.

| Grens | Meetbare aanleiding | Actie in het goedgekeurde draaiboek |
| --- | --- | --- |
| T1. Versie of terugweg klopt niet | Eén bevestigde code-/dataversie wijkt af, readiness faalt bij de eindcontrole, of het afgesproken herstelpunt is niet bereikbaar | Vóór omschakelen stoppen. Na omschakelen meteen terugvallen op het gecontroleerde herstelpunt. |
| T2. Inhoud, links of veiligheid fout | Eén bevestigde verloren/dubbele/verkeerde entiteit, gebroken oude interne link, verkeerd doel, onbevoegde schrijfactie of blootstelling van afgeschermde gegevens | Schrijven direct stoppen waar van toepassing; bewijs en laatste geaccepteerde commits veiligstellen. Direct herstelbesluit door de beheerder, geen observatietermijn afwachten. Een kwetsbare oude versie is geen veilig terugvaldoel; gebruik de vooraf geoefende veilige onderhoudsstand. |
| T3. Kerntaak onbeschikbaar | Health, ready of een vaste kerntaak faalt in drie opeenvolgende controles met één minuut ertussen; of één handmatig bevestigde blokkade voor toetsenbord/schermlezer verhindert die taak | Meteen herstel/terugval starten volgens #65. HTTP-status 200 met verkeerde of ontbrekende inhoud telt als fout. |
| T4. Aanhoudende overbelasting of vertraging | Minder dan 10% beschikbaar servergeheugen gedurende vijf opeenvolgende minuutmetingen, één beëindiging door geheugentekort, of p95 boven een C05-tijdgrens of de 10%-grens voor een andere service in twee aansluitende meetvensters van 15 minuten | Stop de extra belasting en laat de beheerder de herstelroute starten. Start bij een vermoeden van vertraging per taak 30 synthetische metingen per venster, één iedere 30 seconden, onder de vaste C05-omstandigheden. Vergelijk de andere service met haar vastgelegde C09-basis. Log geen verkeer van echte bezoekers. |

Een T2-fout is bevestigd zodra een onafhankelijke herhaling of controle van het record de fout aantoont; wacht bij zichtbare blootstelling of onbevoegd schrijven niet op een tweede meting voordat de betreffende route wordt gestopt. De grens voor herstel is maximaal 10 minuten na het herstelbesluit, zoals geoefend in C10. Noteer detectietijd, beslismoment, start herstel en moment waarop alle herstelcontroles slagen. Overschrijding is een incident, geen reden om de grens achteraf te verruimen.

Na een terugval wordt een nieuwe kandidaat pas voorgesteld na herstel en hertest van alle geraakte criteria, inclusief een nieuwe testweek. Behoud de geaccepteerde wijzigingen in de geschiedenis, ook als de oude site ze tijdelijk niet kan tonen. Een terugval mag geen commits wissen of ID's hergebruiken.

## Observatie na de overstap en vrijgave voor opruimen

- Controleer direct na de overstap versie, readiness, kerntaken, privacyheaders en de volledige oude adressenlijst op het publieke adres. Een mislukte controle activeert de passende T-grens.
- Meet de eerste twee uur elke minuut de C09-kerntaken. Meet daarna iedere vijf minuten, tot minstens zeven aaneengesloten dagen zonder T-incident zijn bereikt. Controleer geheugen iedere minuut. Per periode van zeven dagen moet minstens 99,9% van de geplande rondes slagen; ontbrekende rondes tellen als fout. Leg de verwachte rondetijden vooraf vast om dubbele telling van grensmomenten te voorkomen.
- Houd de oude site, het pakket en de bewezen terugweg gedurende die periode beschikbaar. Een T-incident of relevante wijziging herstart de periode. De beheerder blijft bereikbaar of heeft een aangewezen vervanger.
- Pages uitzetten (#67) mag pas na een expliciet besluit van de beheerder, een geslaagde observatieperiode en een bereikbare, geoefende terugweg die niet meer van Pages afhangt.
- Opruimen (#68) vraagt daarnaast een geverifieerde release-zip van de laatste statische site, met controlegetal en geslaagde herstelproef uit het archief. Verwijder niets voordat de beheerder die vrijgave heeft gegeven. De testuitkomsten en besluiten blijven bewaard.

## Bewijs- en besluitformulier

Maak voor iedere kandidaat een kopie van dit formulier in #67 of een gekoppeld bewijsdossier. Vervang geen oude uitkomsten; leg een nieuwe ronde vast.

| Veld | In te vullen vóór beoordeling |
| --- | --- |
| Criteria goedgekeurd | Naam beheerder, datum, exacte documentcommit, link naar akkoord in #64 |
| Kandidaat | Codecommit, dataversie, pakketcontrolegetal, testadres en instellingen |
| Vergelijkingsbasis | Oude commit, export- en sitemapcontrolegetal |
| Testperiode | Begin, einde, tijdzone, laatste wijziging en laatste eindcontrole |
| Personen | Uitvoerder en beoordelaar per criterium; beslisser, uitvoerder terugval en vervanger |
| Bevindingen | Open punten, impact, hertests en koppelingen naar issues |
| Herstel | Draaiboekversie, herstelpunt, oefening, gemeten tijd en data-aansluiting |

| Criterium | Uitkomst | Bewijs en meetdatum | Beoordelaar |
| --- | --- | --- | --- |
| C01 Versie en controles | open | nog te leveren | nog toe te wijzen |
| C02 Gegevens en open data | open | nog te leveren | nog toe te wijzen |
| C03 Adressen en favorieten | open | nog te leveren | nog toe te wijzen |
| C04 Gebruikstaken | open | nog te leveren | nog toe te wijzen |
| C05 Snelheid | open | nog te leveren | nog toe te wijzen |
| C06 Toegankelijkheid | open | nog te leveren | nog toe te wijzen |
| C07 Privacy en beveiliging | open | nog te leveren | nog toe te wijzen |
| C08 Beheer | open | nog te leveren | nog toe te wijzen |
| C09 Stabiele testweek en capaciteit | open | nog te leveren | nog toe te wijzen |
| C10 Terugval | open | nog te leveren | nog toe te wijzen |

**Besluit criteria (#64): nog niet genomen.**

**Besluit overstap (#67): nog niet genomen.** Vermeld go/no-go, naam, datum, exacte kandidaat, bewijsdossier, afgesproken uitvoeringsmoment en mandaat voor terugval. Een go geldt alleen voor die kandidaat en dat moment. Controleer bij uitstel opnieuw de geldigheid van het bewijs.

**Besluit Pages uitzetten en opruimen (#67/#68): nog niet genomen.** Vermeld afzonderlijk de observatieperiode, archiefcontrole, blijvende herstelroute en toegestane handelingen.

## Afhankelijkheden en geraadpleegde stand

Op 18 november 2026 is `main` gecontroleerd op commit `f3ea38d55a9fe806ac792acc0aa3874436fbd2ae`. #63 en #64 staan open; #64 had nog geen reacties of goedkeuring. De uitvoerende stories blijven eigenaar van hun tests en implementatie. Dit document verandert geen backlog, brongegevens, applicatie, hosting of DNS.

- [PR #69](https://github.com/Robert-Worm/rijksmap/pull/69) bevat de besluitenlog; [PR #70](https://github.com/Robert-Worm/rijksmap/pull/70) zet #64 vooraan in de applicatiefase. #64 wacht daarin niet op implementatie. #65 wacht op #64 en #40; #66 op #32 en #27; #67 op #65, #66 en #36; #68 op #67.
- [PR #73](https://github.com/Robert-Worm/rijksmap/pull/73) bevat de voorgestelde werkafspraken, gelezen op commit `672297f43a21dcd1194288abbe55e2a23ddc6abc`. Die PR en zijn voorgangers #69, #70 en [#72](https://github.com/Robert-Worm/rijksmap/pull/72) zijn nog open. Er is bij controle geen issue met label `werkvolgorde` gevonden. De expliciete opdracht om #64 op te pakken is daarom het vertrekpunt; er wordt geen `klaar`-status verzonnen.
- [PR #74](https://github.com/Robert-Worm/rijksmap/pull/74) betreft formulieren. [PR #75](https://github.com/Robert-Worm/rijksmap/pull/75) bevat aanvullende Omnibus-eisen en bouwt op de eerdere PR's voort. Geen van beide is als geleverde functionaliteit meegeteld.
- De beschikbare check op `main` meldde succes, maar [#76](https://github.com/Robert-Worm/rijksmap/issues/76) meldt een 503 voor de publieke homepage tijdens de linkcontrole. Dat is een bestaande bevinding, geen actuele beschikbaarheidsmeting. Het bewijsdossier moet de bevinding en een hertest bevatten; een groen workflowlabel alleen is geen acceptatiebewijs.
- #26 wordt in een andere chat behandeld. C02 vraagt het bewijs op en wijzigt de test of databestanden daarvan niet. De actieve werkafspraken en afhankelijkheden worden opnieuw gecontroleerd vóór uitvoering van de overstap.

De beheerwegwijzer is op deze bronversie nog niet aanwezig. De wegwijzer uit #69/#73 kan na samenvoegen naar dit document verwijzen; deze wijziging neemt die gedeelde bestanden niet over.
