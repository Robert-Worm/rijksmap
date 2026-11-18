# Voorstel #43: inlog, rollen en wijzigingsroute

**Status: ter besluitvorming, niet goedgekeurd en niet gebouwd.** Datum: 18 november 2026. Onderdeel van [issue #43](https://github.com/Robert-Worm/rijksmap/issues/43) en [epic #42](https://github.com/Robert-Worm/rijksmap/issues/42). Het label `wacht-op-beheerder` blijft staan. Dit document beschrijft een ontwerp, geen bestaande beveiliging. De eerste onafhankelijke review leverde drie ontwerpbevindingen op: [#80](https://github.com/Robert-Worm/rijksmap/issues/80), [#81](https://github.com/Robert-Worm/rijksmap/issues/81) en [#82](https://github.com/Robert-Worm/rijksmap/issues/82). De correcties zijn onafhankelijk herbeoordeeld en op ontwerpniveau voldoende bevonden; implementatie en activering zijn nog niet getoetst.

## Advies en besluiten die nog nodig zijn

Gebruik een GitHub App voor de inlog van mensen. Geef alleen vooraf toegelaten accounts een Rijksmap-rol. Bewaar ingediende concepten afgeschermd tot de beheerder de exacte inhoud voor openbaarmaking vrijgeeft. Pas daarna legt een schrijfdienst ze als commits en pull requests vast. Toepassen vraagt apart toestemming voor de exacte wijziging en gaat via één gecontroleerde uitvoerder. AI-agents krijgen een eigen identiteit en mogen alleen conceptvoorstellen indienen.

Onderstaande keuzes zijn **allemaal open**. Een advies in deze tabel is geen toestemming om instellingen te wijzigen, gegevens te publiceren of uit te rollen.

| Keuze | Opties | Advies en afweging | Status |
| --- | --- | --- | --- |
| D43-1: inlog | GitHub App; losse OAuth-app; externe identiteitsdienst | GitHub App: sluit aan bij Git en beperkt toegang tot de gekozen repository. OAuth-app is eenvoudiger als alleen identiteit nodig is, maar vraagt daarnaast een aparte schrijfidentiteit. Een externe dienst past beter bij toekomstige organisatieaccounts, maar voegt beheer en mogelijk kosten toe. Eigen wachtwoorden niet starten: herstel, opslag en tweede factor worden dan eigen werk. | Open |
| D43-2: rollen | Alleen beheerder; beheerder plus redacteur; fijnmazige rollen per organisatie | Begin met beheerder. Ontwerp redacteur als rol die alleen voorstellen indient, aanvankelijk uitgeschakeld. Rechten per organisatie pas toevoegen als er een concrete behoefte is. | Open |
| D43-3: AI | Alleen voorstellen; beperkte automatische verwerking; dezelfde rechten als beheerder | Alleen voorstellen. Geen automatische acceptatie in deze versie; uitzonderingen vragen een afzonderlijk besluit bij #55. | Open |
| D43-4: acceptatie | Beheerder keurt elk voorstel goed; vooraf goedgekeurde soorten mogen direct door | Elk voorstel laten beoordelen, ook een voorstel van de beheerder zelf na een zichtbaar voorbeeld. Dit kost een extra bevestiging maar maakt de grens controleerbaar. Zelfbevestiging door de enige beheerder is geen vierogencontrole. | Open |
| D43-5: uitvoeren | Eén gecontroleerde uitvoerder; handmatige GitHub-merge met een afzonderlijk te besluiten beperktere garantie | Eén uitvoerder met actuele autorisatie en een gedeelde vergrendeling voor uitvoering en intrekking, zoals hieronder beschreven. Handmatige merge buiten die poort is geen ondersteunde gegevensroute. Tot deze poort bewezen werkt, alleen concepten/review, geen operationele schrijfroute. Dit vraagt meer bouw in #48 maar voorkomt toepassing met oud akkoord. | Open |
| D43-6: sessies en herstel | Korte sessies met nieuwe bevestiging; langdurige sessies | Voorstel: na 30 minuten inactiviteit uitloggen, maximaal 8 uur per sessie; nieuwe identiteitsbevestiging van maximaal 5 minuten oud voor acceptatie of rolbeheer. Herstel uitsluitend door de beheerder buiten de openbare app. Deze waarden nog toetsen op bruikbaarheid. | Open |
| D43-7: beveiligingsregistratie en concepten | Geen registratie; beperkte afgeschermde opslag; uitgebreide toegangslogs | Beperkte registratie van beheeracties en geweigerde schrijfpogingen; voorstel 30 dagen, alleen voor beheerder. Afgeschermde conceptinhoud maximaal 7 dagen bewaren, daarna verwijderen met alleen een minimale statusregistratie. Openbare datawijzigingen blijven in Git. Opslag, bewaartermijnen en privacyafbakening vragen expliciet akkoord. | Open |

Na het besluit: leg per D43-keuze de gekozen optie, datum, beslisser en link naar diens expliciete akkoord vast in `docs/beheer/besluiten.md`. Kies dan een vrij B-nummer. Deze wijziging reserveert geen B-nummer en maakt de besluitenlog uit PR #69 niet opnieuw aan. Ook een merge van deze ontwerptekst geldt niet als akkoord op alle opties.

## Wat al vaststaat en wat is gecontroleerd

- Bronbasis: `main` op `f3ea38d55a9fe806ac792acc0aa3874436fbd2ae`, gecontroleerd via Git en de GitHub branch-API op 18 november 2026. De eigen branch is `ontwerp/43-rollen-autorisatie`. De checkout voor #25 is uitsluitend gelezen; zijn lokale wijzigingen en code voor #26 zijn niet meegenomen.
- [Issue #22, beheerdersbesluit van 30 oktober](https://github.com/Robert-Worm/rijksmap/issues/22#issuecomment-6525361271) bevestigt: elke gegevenswijziging wordt een commit. De besluiten B-003, B-004 en B-005 staan in de nog open [PR #69](https://github.com/Robert-Worm/rijksmap/pull/69): databestanden in Git, SQLite in de image en beheer plus GitHub-bijdragen als ingangen. Een schrijfbare productiedatabase opnieuw kiezen valt buiten #43.
- De [werkafspraken uit PR #73](https://github.com/Robert-Worm/rijksmap/blob/672297f43a21dcd1194288abbe55e2a23ddc6abc/AGENTS.md) en [samenwerking](https://github.com/Robert-Worm/rijksmap/blob/672297f43a21dcd1194288abbe55e2a23ddc6abc/docs/beheer/samenwerking-ai.md) zijn gelezen. Ze staan nog niet op `main`. De expliciete opdracht voor #43 bepaalt deze ontwerpscope; werklabels zijn niet aangepast. De eigenaar beslist over beveiligingsinstellingen en samenvoegen.
- Er was geen open issue met label `werkvolgorde` of `rood`. De voorgestelde [volgorde in PR #75](https://github.com/Robert-Worm/rijksmap/blob/28ba68aec5c8f6758d4c95d0a1baf22f0393a7df/.github/backlog/volgorde.mjs) zet #43 vóór #48. Het ontbreken van `rood` is geen bewijs dat alle controles groen zijn.
- Open PR's bij start: #69 besluiten, #70 werkvolgorde, #71 privacy en headers, #72 bouwscripts, #73 werkafspraken, #74 formulieren en #75 Omnibus-eisen. #70, #72, #73, #74 en #75 bouwen op eerder werk voort. Geen daarvan is hier overgenomen of samengevoegd. Vooral #69 en #72 raken ook `docs/architectuur.md`; behoud hun tekst bij latere integratie.
- De gecontroleerde bron heeft een statische site en geen beheerinlog. De bestaande workflows rollen deze ontwerpbranch niet uit. B-007 en PR #71 melden automatische uitrol van `main` naar de testservice. Er is in deze taak geen hostinginstelling aangepast of onafhankelijk opnieuw vastgesteld.

## Rollen en rechten

Een GitHub-account bewijst wie iemand is; het geeft op zichzelf geen toegang tot beheer. De server koppelt het vaste numerieke GitHub-account-ID aan een rol. Een naam, e-mailadres, commit-auteur, issuelabel of door de client meegestuurde rol is geen bewijs van bevoegdheid. Nieuwe accounts hebben geen beheertoegang.

| Handeling | Bezoeker | Beheerder | Redacteur, later | AI-agent | Technische schrijfdienst |
| --- | --- | --- | --- | --- | --- |
| Openbare gegevens lezen | Ja | Ja | Ja | Ja | Alleen wat nodig is |
| Openbaar GitHub-voorstel indienen | Via GitHub-account | Ja | Ja | Via eigen bevoegdheid | Geen inhoudelijk oordeel |
| Afgeschermd beheervoorbeeld bekijken en concept indienen | Nee | Ja | Alleen eigen concepten binnen toegekende rechten | Alleen eigen concepten binnen toegekende rechten en opdracht | Na servercontrole afgeschermd vastleggen |
| Concept vrijgeven voor openbare commit en PR | Nee | Ja, exacte openbare inhoud | Nee | Nee | Alleen de vrijgegeven inhoud publiceren |
| Officiële waarde vervangen, verhuizen, ontkoppelen, intrekken | Nee | Voorstel met bron, reden en gevolgen | Voorstel binnen toegekende rechten | Voorstel binnen toegekende rechten | Geen zelfstandige toestemming |
| Voorstel inhoudelijk accepteren of afwijzen | Nee | Ja, exacte versie | Nee | Nee | Nee |
| Voorstel toepassen op publicatiebranch | Nee | Bevestigen via gecontroleerde route | Nee | Nee | Alleen de afzonderlijke uitvoerder, na geldig beheerdersakkoord en actuele controle |
| Rollen, sleutels of beveiligingsbeleid wijzigen | Nee | Via aparte beheerprocedure | Nee | Nee | Nee |
| Hosting, DNS, workflows of uitvoerbare code wijzigen via data-API | Nee | Nee | Nee | Nee | Nee |

De server controleert per verzoek de identiteit, actuele rol, handeling, objectsoort, vaste ID, veld en eventuele organisatiescope. Geen geldige of bereikbare autorisatiebron betekent: schrijven weigeren. Een verborgen knop is geen toegangscontrole. Een beheerrol mag dataregels niet omzeilen.

Openbare GitHub-issues kunnen door iedereen worden ingevuld, maar gaan eerst naar beoordeling. Een label zoals `voorstel-goedgekeurd` is geen uitvoeringsrecht. De server controleert de bevoegde beslisser en de exacte goedgekeurde inhoud. Opmerkingen, rapportteksten en AI-antwoorden zijn invoer, nooit instructies die rechten kunnen vergroten.

## Identiteit, sessies en grenzen

### Mensen

Advies: servergestuurde GitHub App-inlog met een vaste callback, een eenmalige `state` en PKCE. Controleer de identiteit bij GitHub en daarna de eigen rollenlijst. Geen registratie op basis van alleen een e-maildomein, naam of repositorylidmaatschap. GitHub-tokens blijven op de server; de browser krijgt uitsluitend een willekeurige sessie-ID.

Gebruik een `Secure`, `HttpOnly`, `SameSite=Lax` cookie, zonder breed Domain-attribuut. Laat de sessie-ID na inloggen wisselen. Schrijven vraagt daarnaast een CSRF-token en controle op de verwachte oorsprong. GET-verzoeken veranderen geen gegevens. Geen tokens in URL's, `localStorage`, Git, fouten of logs. Beheerpagina's en antwoorden met sessiegegevens worden niet gedeeld gecachet.

Uitloggen trekt de sessie direct in. De server controleert rolversie en intrekking bij elke beheeractie. Een verwijderde rol werkt daardoor ook niet meer met een oude sessie. Een nieuwe GitHub OAuth-doorloop bewijst niet automatisch dat iemand net opnieuw een tweede factor heeft ingevoerd: de technische invulling van de extra bevestiging uit D43-6 moet dat onderscheid expliciet oplossen voordat acceptatie in de pop-up wordt aangezet.

### AI-agents

Een agent krijgt een eigen service-identiteit, met benoemde eigenaar, opdracht, toegestane handelingen/velden, verloopdatum en intrekbare machtiging. Advies voor de eerste versie: een beheerdersuitgifte per opdracht, maximaal 24 uur geldig en alleen `voorstel:maken`. Bewaar een controlewaarde van de sleutel op de server, geen leesbare sleutel. De sleutel gaat alleen over TLS en niet naar het model of in bronmateriaal. De client bewaart hem in een daarvoor bestemde beveiligde opslag.

Bij een intrekkingsverzoek worden nieuwe verzoeken meteen geblokkeerd; bevestiging van de definitieve intrekking wacht op de afhandeling van een eventueel al gestarte uitvoering, volgens de poort hieronder. Een wachtrij controleert de machtiging opnieuw vóór verwerking. Bij een verlopen machtiging krijgt het oorspronkelijke voorstel de eindstatus `verlopen`; bij intrekking `ingetrokken`. Beide zijn niet meer uitvoerbaar, ook niet na opnieuw inloggen of een nieuwe sleutel. Een agent ontvangt nooit het GitHub-installatietoken of de private sleutel van de schrijfdienst. Het lezen via de openbare API/MCP blijft zonder schrijfbevoegdheid mogelijk.

De beheerder kan inhoud uit een verlopen voorstel bewust overnemen als **nieuwe aanvraag op eigen naam**. Bij een ingetrokken voorstel moet hij ook de reden van intrekking en de betrouwbaarheid van de inhoud beoordelen; overname is nooit automatisch. De oude aanvraag blijft gesloten. De nieuwe krijgt een nieuw aanvraag-ID, actuele basis, eigen bevoegdheid, nieuwe validatie, nieuwe vrijgave en nieuw akkoord. De oorspronkelijke actor, AI-herkomst en relatie met de oude aanvraag blijven traceerbaar in de afgeschermde registratie. De oude sleutel of machtiging wordt hierdoor nooit hersteld. Dit is de enige overnameroute; 'opnieuw beoordelen' maakt de oude aanvraag niet uitvoerbaar.

AI-herkomst bevat agent-ID, opdrachtgever/machtiging, modelnaam en zo mogelijk versie. Een modelnaam die de agent aanlevert blijft een verklaring van die agent, geen bewezen identiteit. De geverifieerde service-identiteit staat er apart naast.

### GitHub en de schrijfdienst

Scheid de inlogfunctie, de dienst voor vrijgegeven voorstellen en de uitvoerder. De voorsteldienst krijgt alleen de repository `Robert-Worm/rijksmap` en de rechten die aantoonbaar nodig zijn voor commits op voorstelbranches en pull requests: Metadata lezen, Contents schrijven en Pull requests schrijven. Geen Administration, Actions/Workflows, secrets, deployment- of organisatiebeheer. Geef niet automatisch Issues-schrijfrecht als een PR volstaat. De uitvoerder gebruikt een afzonderlijke identiteit; de voorsteldienst kan diens sleutel niet lezen.

Een installation token kan worden beperkt tot repository en rechten en verloopt na één uur. Het is **geen veld- of mappenslot**. De server accepteert daarom alleen getypeerde datahandelingen en bouwt zelf de bestanden en paden. Geen vrije bestandsnamen, shellcommando's, branchdoelen, Git-patches of willekeurige JSON-velden van de client.

Aanvullend moet GitHub zelf directe updates van `main` en `pages`, force-push en verwijdering blokkeren voor de voorsteldienst. Die mag de regels niet omzeilen. Voor de gekozen gegevenspublicatiebranch is uitsluitend de gecontroleerde uitvoerder de gewone schrijver; menselijke merges via GitHub buiten de poort zijn geblokkeerd. Ook reguliere codewijzigingen naar diezelfde branch moeten worden afgestemd op deze poort en de geldende reviewregels. Vereiste controles en acceptatie gelden voor de actuele PR-versie. De beheerder configureert dit en bewijst met negatieve tests dat een oud akkoord niet via een andere route kan worden gebruikt. Een wijziging van repositorybeveiliging door de eigenaar is een afzonderlijke beheerhandeling met auditspoor, geen normale publicatieroute. Dit ontwerp stelt niet dat deze bescherming nu al goed staat. Als de gekozen accountconfiguratie de scheiding niet afdwingt, blijft operationeel schrijven uit. Een permanente brede bypass voor de uitvoerder geldt niet als oplossing.

Een installatie met schrijfrecht kan ruimere toegang hebben dan de data-API. Beperk de schade bij een gestolen sleutel ook buiten de API: bescherm bestaande workflow- en releasepaden waar technisch mogelijk, geef processen voor onbetrouwbare voorstellen geen productiesleutels en voer geen voorstelcode uit in een bevoorrechte workflow. De beheerder beoordeelt dit bij #11 en de securityreview. Schrijfrecht alleen vormt geen sandbox voor code.

## Eén route voor elke gegevenswijziging

Beheerpop-up, agent en geaccepteerde communitybijdrage leveren dezelfde getypeerde aanvraag aan #48. De live SQLite-database blijft alleen-lezen. Sessie- en intrekkingsgegevens zijn aparte beveiligingsgegevens; hun opslag mag de databaseregel niet stilzwijgend veranderen. Kies hiervoor vóór de bouw een gedeelde, duurzame opslag die intrekkingen bij herstart behoudt. Als die niet beschikbaar is, blijft schrijven uit en vervallen sessies bij herstart; intrekkingen mogen nooit ongedaan worden gemaakt door een oude image.

1. **Authenticeren en toestaan.** Controleer de actuele bevoegdheid. Bind de geverifieerde actor op de server aan de aanvraag. Controleer een idempotentiesleutel per actor: dezelfde sleutel met dezelfde inhoud levert hetzelfde resultaat, met andere inhoud een fout.
2. **Afgeschermd valideren en voorbeeld tonen.** Controleer de hele aanvraag: bestaande ID's, toegestane velden, officiële bron, reden, herkomst, relaties en ingangsdatum. Bewaar het concept in een aparte afgeschermde opslag buiten Git, bouwbestanden en openbare downloads. Alleen de indiener binnen zijn actuele rechten en de beheerder kunnen het zien. Toon oud/nieuw, gevolgen en aantallen. De server bepaalt de basiscommit, het schema en een hash van de genormaliseerde wijziging. Een willekeurige hash uit de browser telt niet. Twijfel blijft afgeschermd of wordt afgewezen; nog geen GitHub-object of notificatie met aanvraaginhoud.
3. **Vrijgeven voor openbaarmaking.** De beheerder bekijkt alle te publiceren inhoud: velden, bron-URL's, zakelijke reden, PR-titel/body, openbare actorvermelding en wijzigingsregistratie. Hij bevestigt expliciet dat deze exacte inhoud openbaar mag worden. Automatische geheimencontrole helpt, maar vervangt deze vrijgave niet. Vrijgave is gebonden aan de hash van het volledige openbare pakket en actuele bevoegdheden. Een inhoudswijziging, intrekking of verval maakt haar ongeldig. Dit is een andere toestemming dan toepassen op de publicatiebranch. Ook de beheerder zelf moet deze stap doorlopen.
4. **Openbaar voorstel vastleggen.** Alleen het vrijgegeven pakket wordt als data plus openbare wijzigingsregistratie in één voorstelcommit en PR gepubliceerd. Vóór de eerste GitHub-write worden vrijgave en bevoegdheden opnieuw gecontroleerd onder dezelfde uitvoeringspoort als hieronder. Publiceer nooit extra vrije tekst vanuit een foutmelding of template. Een fout maakt geen geaccepteerde gedeeltelijke gegevenswijziging. Een openbaar, ondoorzichtig verzoekkenmerk maakt herstel na een time-out mogelijk: eerst zoeken of het verzoek al bestaat, pas daarna opnieuw proberen. Hervat zo nodig de PR-aanmaak voor dezelfde vrijgegeven inhoud. Wat al openbaar is gemaakt kan niet door intrekking weer geheim worden; stop wel alle verdere writes zodra intrekking effectief is.
5. **Controleren en besluiten.** Automatische controles geven advies; alleen de beheerder accepteert in deze versie. Bind zijn akkoord aan voorstel-ID, inhoudshash, huidige PR-head, basiscommit en relevante beleidsversie. Een nieuwe commit, gewijzigde basis, verlopen/ingetrokken machtiging of gewijzigde rechten maakt oud akkoord ongeldig. Opnieuw valideren en opnieuw bevestigen; geen automatisch overschrijven van een gelijktijdige wijziging.
6. **Toepassen via de uitvoeringspoort.** De uitvoerder controleert aanvrager, beslisser, vrijgave, beleidsversie, machtiging, checks en exact akkoord op de actuele basis, volgens de vergrendeling hieronder. Hij maakt uitsluitend de vooraf getoonde commit met die basis als enige ouder en werkt de publicatiebranch alleen vooruit bij. Bij een andere branchstand weigert de Git-update; geen automatische merge of force-push. Afgekeurde, verlopen en ingetrokken voorstellen zijn niet uitvoerbaar. De GitHub-knop voor handmatig samenvoegen is geen alternatieve route.
7. **Bouwen en publiceren volgen.** De bestaande publicatieroute bouwt de database uit de geaccepteerde commit. Toon afzonderlijk `afgeschermd concept`, `wacht op openbare vrijgave`, `openbaar voorstel`, `wacht op acceptatie`, `afgewezen`, `verlopen`, `ingetrokken`, `conflict`, `uitvoering in behandeling`, `geaccepteerd`, `bouwen`, `online` of `bouw/uitrol mislukt`. Pas `online` als de draaiende versie de wijziging aantoonbaar bevat. Een Git-commit is nog geen publicatiebewijs. Bij een mislukte build blijft de vorige werkende versie beschikbaar.

### Beslissend moment van autorisatie en intrekking

De uitvoerder gebruikt één duurzame wachtrij en een exclusieve vergrendeling per repository. Iedere openbare write en toepassing, rolwijziging, beleidswijziging en intrekking loopt via dezelfde poort. Meerdere app-processen delen deze toestand; een proceslokaal slot volstaat niet. Het beslissende autorisatiemoment is de laatste controle onder dit slot, direct vóór de geregistreerde externe operatie. De registratie bevat de exact bedoelde commit/basis en de op dat moment geldige bevoegdheidsversie. Een generieke eerdere groene CI-check is geen uitvoeringsmachtiging.

Een intrekkingsverzoek sluit direct de toegang voor nieuwe aanvragen en komt als prioritaire beheeractie in deze rij. Als het vóór de laatste autorisatiecontrole is geregistreerd, wordt de uitvoering geweigerd. Was de externe operatie al gestart, dan kan die nog afronden. De interface toont dan `intrekking in behandeling` en bevestigt pas `ingetrokken` nadat de uitkomst is vastgesteld en de blokkade duurzaam is vastgelegd. Na die bevestiging kan de oude machtiging niets meer uitvoeren. Rollen en beleid volgen dezelfde volgorderegel. De deadline van een machtiging wordt bij het beslissende moment getoetst; een reeds gestarte operatie kan vlak na die deadline afronden, zonder recht op een nieuwe operatie.

Bij een time-out of crash tijdens de externe write blijft de rij geblokkeerd totdat de uitvoerder de werkelijke Git-stand met de geregistreerde operatie heeft vergeleken. Geen blind herhalen, geen slot vrijgeven op alleen een tijdslimiet en geen succes melden zolang de uitkomst onbekend is. Een andere Git-basis leidt tot conflict en nieuw akkoord. Is de autorisatieopslag onbereikbaar, dan start geen externe write. Een herstart of failover mag nooit twee uitvoerders met geldige schrijfrechten voor dezelfde operatie opleveren; vóór activering moet #48 herstel en uitsluiting van een oude uitvoerder aantonen.

Deze route gebruikt een zakelijke bevestiging in Rijksmap en een aparte technische uitvoerder; geen eis dat de enige beheerder een eigen GitHub-PR als tweede persoon goedkeurt. Alle automatische controles blijven verplicht. De gewone beheerroute krijgt geen permanente bypass. De precieze GitHub-regels en de atomaire Git-update moeten in de gekozen repositoryvorm bewezen werken voordat schrijven aan kan. Handmatig werken met een beperktere garantie vraagt een nieuw expliciet besluit; dit voorstel verleent die uitzondering niet.

Voorstel voor het aanvraagcontract: `request_id`, `base_commit`, `changes[]` met entiteit-ID, getypeerde handeling, toegestane velden, verwachte oude waarden, bron en ingangsdatum, plus `reason` en eventueel `issue_url`. Alleen de server vult actor, rol, machtigings-ID, tijd, beleidsversie en goedkeuringsgegevens. Definitieve nieuwe ID's geeft één schrijver uit bij acceptatie, volgens #23. Een preview reserveert geen vrij gekozen permanent nummer. Een gewijzigde nummeruitgifte vraagt een nieuw voorbeeld en akkoord.

Alleen vrijgegeven publieke zakelijke data en een vrijgegeven zakelijke reden komen in Git. Het openbare pakket bevat wat, wanneer, waarom, bron, AI-herkomst, basiscommit, een ondoorzichtig openbaar verzoekkenmerk en de vooraf vrijgegeven publieke actor- en acceptantvermelding. Git-auteur en e-mailadres worden eveneens uit een vaste goedgekeurde publieke identiteit gekozen, niet uit vrije clientinvoer. De beveiligingsadministratie bewaart afzonderlijk de geverifieerde account-ID's, opdrachtgever, machtigings-ID, rollen en interne aanvraag-ID. Die worden niet automatisch gekopieerd naar Git, PR's, notificaties of logs. De beheerder kan daarmee het openbare kenmerk naar de verantwoordelijke herleiden. De uiteindelijke commit-SHA en PR-link worden bij het resultaat vastgelegd; een commit hoeft zijn eigen nog onbekende SHA niet in zichzelf te bevatten. Vertrouw niet uitsluitend op de vrij invulbare Git-auteur.

Afgeschermde concepten verschijnen nooit in openbare previews, analytics, foutteksten, zoekindexen of berichtinhoud van notificaties. Notificaties aan de bevoegde beheerder bevatten hoogstens een ondoorzichtige verwijzing naar de afgeschermde app. Geheimen en vermoedelijke privégegevens worden geweigerd of afgeschermd voor beoordeling, niet 'opgeschoond' door een agent met automatische publicatie. Back-ups van deze opslag vallen onder dezelfde toegangsgrens en gekozen bewaartermijn. Een reeds openbare GitHub-bijdrage wordt bij overname wel opnieuw getoetst voordat Rijksmap die inhoud verder verspreidt.

### Bijzondere handelingen

| Handeling | Verplichte controle |
| --- | --- |
| Officieel veld wijzigen (#44) | Bron en verschil zichtbaar; geen stille vervanging door AI of handwerk. Bij twijfel geen acceptatie, maar HOLD voor beoordeling. |
| Verhuizen (#45) | Tijdgebonden relaties sluiten/openen; historie en vaste identiteit behouden. Geen kring in de organisatieboom. |
| Verwijderen/intrekken (#46) | Afhankelijkheden eerst tonen en oplossen; geen weesrecords. ID blijft gereserveerd. Privacyverwijdering is een aparte beheerdersprocedure omdat Git oude waarden bewaart. |
| Ontkoppelen (#47) | Reden en datum verplicht, rapport vindbaar houden. Telling afstemmen op #23/#26; zie de open grens hieronder. |
| Bulk (#49) | Limieten op bestandsgrootte en aantal regels, validatie en autorisatie per regel. Eén ongeldige regel weigert het hele pakket. Voorbeeld en akkoord gelden voor de hele lijst; één geaccepteerde commit. |
| Terugdraaien (#48) | Nieuwe compenserende wijziging via dezelfde route, met nieuw akkoord. Geen reset van Git-historie of ID-register. Bij afhankelijke latere wijzigingen eerst een conflict/voorbeeld tonen. |

B-004 noemt circa een halve minuut tot online. Dat is hier een bestaande indicatie, geen gemeten garantie voor de nieuwe beheerroute. De echte doorlooptijd is wachttijd op beoordeling plus controles, bouw en uitrol. #48 moet die fasen meten en een passende verwachting tonen; deze taak voert geen uitrol uit.

## Beveiliging, privacy en herstel vóór activering

De volgende punten zijn voorwaarden voor de uitvoering, geen afgeronde controles:

- Rollen komen uit een beheerde serverconfiguratie met versies. De eerste beheerder wordt buiten de app op vast account-ID ingesteld. Geen 'eerste bezoeker wordt beheerder'. Een rolwijziging of noodherstel gebruikt een aparte procedure en kan niet via rapportvelden of een agentopdracht.
- De beheerder beveiligt zijn GitHub-account, beheert herstelmiddelen, configureert callbacks en branchregels en verstrekt/roteert sleutels. Herstel levert geen verborgen bypass op: noodacties worden vastgelegd en ingetrokken toegang blijft ingetrokken.
- Elke technische dienst heeft alleen zijn eigen GitHub-private sleutel waar nodig. Die staat niet in Git of de image. Roteer bij vermoeden van misbruik en trek ook reeds uitgegeven installatietokens, sessies en machtigingen in; alleen sleutelrotatie is geen bewijs dat alle bestaande tokens weg zijn. Leg vast wie dit doet en test het vóór activering.
- TLS, beperkte verzoekgrootte, snelheidslimieten en veilige foutmeldingen zijn vereist op alle beheer- en agentroutes. Behandel tekst als tekst, voorkom scriptuitvoer in previews. Een bron-URL wordt niet zomaar door een bevoorrechte server opgehaald; blokkeer interne adressen en onveilige redirects als broncontrole later wordt toegevoegd.
- De openbare site blijft zonder inlog werken. De voorgestelde beheerinlog gebruikt functionele cookies en GitHub als derde partij. De bestaande algemene uitspraak 'geen cookies, geen derde partijen' moet daarom vóór activering expliciet worden afgebakend. Geen wijziging aan de privacytekst van de live site in deze taak.
- Scheid wijzigingshistorie van beveiligingsregistratie. Log geen tokens, cookie-inhoud, vrije aanvraagteksten of privégegevens. Registreer alleen gebeurtenis, intern actor-ID waar nodig, resultaat, tijd en aanvraag-ID. Ook proxy- en infrastructuurlogs moeten vóór activering worden beoordeeld; PR #71 heeft daar nog open punten.
- Maak en oefen herstel van brondata, ID-register, rollen en intrekkingen. Terugzetten van een oude appversie mag ingetrokken toegang of eerder uitgegeven ID's niet opnieuw activeren. Bij onzekerheid weigert de schrijfroute dienst; publiek lezen kan doorgaan.

## Securityreview en toetsbare acceptatie

**Onafhankelijke review en hercontrole uitgevoerd:** op 18 november 2026 beoordeelde een aparte AI-reviewer (`security_review_43`) zonder auteursgesprek commit `3f9c7fd43bad9b2bdb13de6f1a8ee94de0a061a4`, dit ontwerp, de architectuur en SECURITY.md, aangevuld met officiële GitHub-bronnen. Drie ontwerpbevindingen zijn vastgelegd als #80 (actuele autorisatie), #81 (openbare vrijgave) en #82 (overname na verval/intrekking). Dezelfde onafhankelijke reviewer heeft de correcties in commit `5e607fd885b7ff7d37b83a045173f1b570e72115` herbeoordeeld: alle drie op ontwerpniveau verholpen, geen nieuwe concrete beveiligingstegenstrijdigheid. De review en hercontrole geven geen akkoord namens de beheerder en zijn geen onderzoek van de werkende site, implementatie of beveiligingsinstellingen. De uitslag staat ook bij #43 en de bevindingen. Concrete kwetsbaarheden in bestaande systemen blijven vertrouwelijk volgens [SECURITY.md](../../SECURITY.md); publiceer daarvan alleen een veilige verwijzing.

| Toets vóór bouw/activering | Verwachte uitkomst | Eigenaar voor uitvoering |
| --- | --- | --- |
| Geen inlog, onbekend account, vervalste rol, gewijzigd object-ID of veld | Geen beheerdata of schrijfactie buiten bevoegdheid | #48 |
| Agent/redacteur accepteert of voert eigen voorstel uit; vervalst goedkeuringslabel | Geweigerd; geen commit op de publicatiebranch | #48, aansluiting #53/#55 |
| Token ingetrokken, rol verwijderd, sessie verlopen, dienst herstart of oude image hersteld | Oude bevoegdheid werkt niet meer, ook niet in wachtrij | #48 |
| CSRF, hergebruikte OAuth-state, verkeerde PKCE-verifier, afwijkende callback | Geweigerd zonder wijziging of tokenlek | #43 naar #48 |
| PR wijzigt na akkoord; twee auteurs wijzigen dezelfde basis; beleid wijzigt | Oud akkoord vervalt, geen verloren update | #48 |
| Na akkoord veranderen rol/machtiging/beleid/basis; tegelijk intrekken en uitvoeren; handmatige GitHub-merge proberen | Geen toepassing met oud akkoord; intrekking vóór laatste controle weigert uitvoering; reeds gestarte operatie zichtbaar afhandelen vóór bevestigde intrekking; geen omweg via GitHub | #48, beheerder/#11, bevinding #80 |
| Crash/time-out onder het uitvoeringsslot; failover terwijl oude uitvoerder nog leeft | Uitkomst eerst vaststellen, nooit twee bevoegde uitvoerders of blind herhalen; geen volgende write bij onzekere toestand | #48, bevinding #80 |
| Niet-openbare tekst of geheim in ieder vrij veld, URL, reden, PR-tekst of actorregistratie | Geen inhoud naar GitHub, notificatie, log of openbaar voorbeeld vóór expliciete vrijgave; twijfel blijft afgeschermd, ook bij bevoegde agent | #48, bevinding #81 |
| Verlopen en ingetrokken voorstel overnemen; oude sleutel opnieuw gebruiken | Oude aanvraag blijft gesloten, nieuwe aanvraag met nieuwe bevoegdheid/basis/vrijgave/akkoord en behouden AI-herkomst | #48, bevinding #82 |
| Zelfde aanvraag tweemaal; time-out na commit maar vóór antwoord/PR | Eén voorstel en één toepassing; herstel vindt bestaand verzoek | #48 |
| Ongeldige regel of bevoegdheid in bulk; onveilige relatie; ID opnieuw gebruikt | Hele pakket geweigerd | #46, #49 |
| Gestolen voorsteldiensttoken probeert rechtstreeks main/pages of workflowcode te wijzigen | Beschermde publicatie geweigerd; grenzen en resterende tokenrisico's bewezen | Beheerder/#11, #48 |
| Build of uitrol faalt; eerdere wijziging wordt teruggedraaid met latere afhankelijkheden | Geen onterechte online-status; oude versie bruikbaar; terugdraaiing opnieuw beoordeeld | #48, hostingverantwoordelijke |
| Privacygegevens, geheimen, scripttekst of interne bron-URL in aanvraag | Geen lek naar openbare Git-historie/logs; geen scriptuitvoer of intern netwerkverzoek | #44, #48, #49 |

Deze tabel is een testplan, geen uitslag. Securityreview van het ontwerp vervangt de tests van de uiteindelijke implementatie niet. Het besluitcriterium van #43 blijft open tot expliciet beheerdersakkoord. Het reviewcriterium kan pas met verwijzing naar review, bevindingen en hercontrole worden afgevinkt; dit document zelf wijzigt geen issuecriteria.

## Afhankelijkheden en afbakening

- Volgende binnen epic #42: #48 implementeert eerst de centrale route, na het besluit bij #43 en de data-import #25. Daarna #44; #45 wacht ook op historie #28. #46 en #47 volgen de pop-up; #49 gebruikt de centrale route. Dit document voltooit geen van deze bouwstories.
- #23 bepaalt vaste ID's, #24 de herkomst, #25/#26 import en gelijkheid, #27 aliassen en #28 historie. Deze onderdelen worden niet aangepast. #26 blijft bij de andere chat.
- **Open inhoudelijke grens:** #47 zegt 'ontkoppelde rapporten tellen niet mee op de kaart'; het goedgekeurde ontwerp in #23 houdt ze eenmaal in het totaal en apart van ministerietellingen. Advies: volg #23 en verduidelijk #47 vóór de bouw. Deze taak neemt geen besluit over tellingen en verandert geen test in #26.
- #53 en #55 vallen onder epic #50. Alleen hun aansluiting is hier beschreven: dezelfde route, agentidentiteit en controlepoort. Geen MCP-schrijffunctie toegevoegd en geen uitzondering op menselijke acceptatie goedgekeurd.
- #59/#61 vallen onder communitybijdragen. Labels en formulieren geven geen schrijfbevoegdheid; verwerking gebruikt straks #48/#49. Geen wijziging aan die epic.
- Integratie met de besluitenlog volgt na #69 en een expliciet beheerdersbesluit. De kleine verwijzing in `docs/architectuur.md` toont alleen waar dit voorstel staat. De oude architectuurtekst wordt niet breed herschreven; die correctie zit al in #69/#72.

## Technische bronnen voor dit voorstel

Geraadpleegd op 18 november 2026. Het ontwerp bovenaan is Rijksmap-advies, geen eis die deze bronnen namens de beheerder vaststellen.

- [GitHub: handelen namens een gebruiker](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-with-a-github-app-on-behalf-of-a-user): user access is beperkt door zowel gebruikersrechten als app-rechten. Inlog en app-installatie zijn verschillende toestemmingen.
- [GitHub: installation access tokens](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app): beperking tot repositories en permissions; verval na één uur.
- [GitHub: PKCE voor OAuth en GitHub Apps](https://github.blog/changelog/2025-07-14-pkce-support-for-oauth-and-github-app-authentication/): ondersteuning van PKCE voor de inlogstroom.
- [GitHub: beschermde branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches): vereiste controles, reviews en de betekenis van bypassrechten. Werkelijke instellingen moeten apart worden getoetst.
- [GitHub: gevoelige gegevens verwijderen](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository): de grenzen van verwijderen na openbare vastlegging.
- [GitHub: een installatietoken intrekken](https://docs.github.com/en/rest/apps/installations#revoke-an-installation-access-token): bestaande tokens afzonderlijk intrekken bij herstel.
- [OWASP: autorisatie](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html): standaard weigeren en rechten bij ieder verzoek controleren.
- [OWASP: transactieautorisatie](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html): toestemming verbinden aan de getoonde handeling en bescherming tegen wijziging na akkoord.
