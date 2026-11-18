# Pages en Sliplane vergelijken

`vergelijk-hosts.mjs` controleert de gepubliceerde Rijksmap met alleen GET-verzoeken.
Het script heeft Node 24 nodig, zonder extra pakketten. Het wijzigt geen site,
hostinginstelling, DNS of repositorybestand. Dit is de controle voor [#17](https://github.com/Robert-Worm/rijksmap/issues/17).

## Uitvoeren

Vanuit de hoofdmap van de repository, met een **nieuwe** uitvoermap waarvan de
bovenliggende map al bestaat:

```text
node hosting/site/vergelijk-hosts.mjs --output D:/Workfolder/rijksmap-vergelijking-20261118
```

Standaard vergelijkt dit `https://www.rijksmap.nl` **rechtstreeks via GitHub Pages**
met `https://rijksmap-site.sliplane.app`. Voor de Pages-verbinding gebruikt het
script de DNS-adressen van `robert-worm.github.io`. Het gepubliceerde adres in de
HTTP Host-header, TLS SNI en certificaatcontrole blijft `www.rijksmap.nl`.
Zo werkt de vergelijking ook nadat de openbare DNS van www naar Sliplane wijst.
De DNS zelf wordt niet gewijzigd. Het script leest beide gepubliceerde sitemaps.
Het gebruikt de unie van hun adressen en meldt welke adressen maar in één sitemap
staan. Er wordt geen lokaal bestand als bewijs voor een online pagina gebruikt.

Een korte proef, inclusief alle vaste bestanden en de eerste sitemapadressen:

```text
node hosting/site/vergelijk-hosts.mjs --limit 20 --output D:/Workfolder/rijksmap-proef-20261118
```

Een proef geeft altijd exitcode 2 zolang niet alle adressen zijn gecontroleerd.
Een bestaande uitvoermap wordt geweigerd. Kies voor een nieuwe meting een nieuwe
map; oude en nieuwe metingen worden niet gemengd. Een afgebroken run wordt niet
hervat, omdat beide hosts intussen een andere versie kunnen hebben gekregen.

Andere hosts geef je expliciet op:

```text
node hosting/site/vergelijk-hosts.mjs --pages https://pages-voorbeeld.invalid --sliplane https://sliplane-voorbeeld.invalid --canonical https://www.rijksmap.nl --output D:/Workfolder/nieuwe-meting
```

Deze voorbeeldhosts bestaan niet. Gebruik bij een werkelijke controle twee
afzonderlijk bereikbare hosts. De canonical-origin is het adres dat in de
`loc`-velden van beide sitemaps staat, ook als je die via een ander adres ophaalt.
Origins moeten HTTPS gebruiken en mogen geen pad, query of inlog bevatten.
Alleen lokale testservers mogen HTTP gebruiken.

Bij een andere `--pages`-origin gebruikt het script standaard diens eigen DNS.
Met `--pages-connect-host` kun je de verbindingshost expliciet kiezen, bijvoorbeeld
`robert-worm.github.io`. Alleen een DNS-hostnaam is toegestaan, zonder poort of pad.
Deze keuze geldt ook voor redirects binnen de Pages-origin. De HTTP Host-header
en TLS SNI blijven altijd bij de gepubliceerde URL. Certificaatcontrole blijft aan;
als Pages het custom domein of zijn certificaat niet meer heeft, faalt de controle.

Controleer in het verslag steeds `connectHost`, `remoteAddress`, `server` en
`tlsAuthorized`. Twee verschillende openbare hostnamen bewijzen op zichzelf niet
dat je twee verschillende hostingomgevingen meet. Op 18 november 2026 bleek
`www.rijksmap.nl` al naar `rijksmap-site.sliplane.app` te verwijzen, anders dan de
eerdere beschrijving in #19. De rechtstreekse Pages-verbinding voorkomt dat beide
kanten daardoor ongemerkt Sliplane meten. Een redirect naar de andere host wordt
nog steeds geweigerd.

## Wat wordt vergeleken?

Per adres worden HTTP-status, SHA-256 van de uitgepakte inhoud en de
doorverwijzingen vergeleken. Een gelijk resultaat vereist op beide hosts status
200, zonder ophaalfout. Twee identieke 404- of 500-antwoorden zijn dus geen succes.
HTML, JSON en andere bestanden worden niet inhoudelijk genormaliseerd: ook een
verschil in witruimte blijft zichtbaar. Transportcompressie zoals gzip telt niet
als inhoudsverschil. De inhoudstypen en compressie staan wel in het verslag.

De vaste lijst in `FIXED_PATHS` bevat naast de sitemap:

- `/` en `/index.html`;
- `robots.txt` en `checksum.txt`;
- `rijksmap-rapporten.json`, `rijksmap-rapporten.csv` en `rijksmap-rfo.json`;
- `.well-known/security.txt`;
- de drie favicons, `apple-touch-icon.png` en `og-image.png`.

Dit zijn publicatiebestanden. Repositorydocumentatie zoals
`.well-known/README.md`, `CNAME`, `.nojekyll` en scripts horen niet bij deze lijst.
Voeg nieuwe publicatiebestanden buiten de sitemap expliciet aan de lijst toe.
`/_headers` is hostconfiguratie en wordt door Pages en deze Sliplane-server niet
gebruikt. Willekeurige foutadressen, niet-canonieke aliassen, browserscripts en
beveiligingsheaders vallen buiten deze inhoudscontrole. De privacy- en
headercontrole hoort bij [#16](https://github.com/Robert-Worm/rijksmap/issues/16).

De sitemapparser ondersteunt de `urlset` die Rijksmap genereert. Onbekende XML,
een sitemapindex, lege lijsten, dubbele adressen, vreemde origins en adressen met
query of fragment stoppen de controle. Zo wordt een onvolledig gelezen sitemap
niet als een volledige controle gepresenteerd.

Doorverwijzingen blijven binnen de eigen host en worden per stap vergeleken.
Absolute verwijzingen binnen dezelfde host worden naar een relatief pad vertaald,
zodat alleen het verschil in hostname geen afwijking geeft. Verwijzingen naar een
andere host worden vastgelegd maar niet gevolgd, ook niet tussen Pages en Sliplane.

## Grenzen en belasting

| Grens | Standaard | Optie |
| --- | --- | --- |
| Gelijktijdige verzoeken | Maximaal 2, één per host | Vast |
| Tijd tussen verzoekstarts per host, ook redirects | Minimaal 250 ms | `--delay-ms`, 250 tot 60.000 |
| Wachttijd per verzoek, inclusief inhoud | 15 seconden | `--timeout-ms`, maximaal 60.000 |
| Uitgepakte bytes per antwoord | 32 MiB | `--max-bytes`, maximaal 64 MiB |
| Uitgepakte bytes in totaal | 4 GiB | `--max-total-bytes`, maximaal 8 GiB |
| Unieke adressen inclusief vaste bestanden | 15.000 | `--max-urls`, maximaal 50.000 |
| Totale looptijd, inclusief pauzes | 4 uur | `--max-duration-ms`, maximaal 8 uur |
| Redirects per verzoek | 3 | `--max-redirects`, maximaal 5 |

Met het standaardtempo duurt 9.394 adressen controleren minimaal circa 40 minuten,
en langer bij trage antwoorden. De controle vraagt alleen bestanden op beide
hosts op en volgt geen externe rapportlinks. De User-Agent is
`Rijksmap-gelijkheidscontrole/1.0 (info@rijksmap.nl)`.

Er zijn geen automatische herpogingen. HTTP 429 of 503 stopt nieuwe verzoeken
voor de hele controle. Een eventueel `Retry-After` staat in het verslag. Ook vijf
opeenvolgende paren met een ophaalfout of HTTP 5xx stoppen de run. Een lopend
verzoek op de andere host kan dan nog afronden. Bytegrenzen worden tijdens het
lezen gecontroleerd; de laatste ontvangen blokken kunnen de grens iets passeren.

Ctrl+C of SIGTERM bewaart waar mogelijk de tot dan toe gemeten resultaten en een
onvolledige samenvatting. Een harde processtop of schijffout kan een samenvatting
verhinderen; zonder afsluitende samenvatting is een verslag nooit volledig.

## Bewijs en uitslag

Elke uitvoermap bevat:

| Bestand | Inhoud |
| --- | --- |
| `resultaten.jsonl` | Startgegevens, sitemapmetingen, inventaris, één regel per adres met serveradres en TLS-uitkomst, en een afsluitende samenvatting |
| `samenvatting.json` | Volledigheid, aantallen, afwijkingen, stopreden, grenzen, Node-versie, broncommit en SHA-256 van het script |
| `adressen.json` | De volledige, vaste volgorde voor deze meting |
| `pages-sitemap.xml`, `sliplane-sitemap.xml` | De opgehaalde sitemaps, als ophalen is gelukt |

Sitemaps worden eenmalig aan het begin opgehaald en voor hun eigen vergelijkingsrij
hergebruikt. Een run meet een tijdvak, geen gelijktijdige momentopname. Draai de
controle na een uitrol als beide hosts stabiel zijn; herhaal hem als tijdens de
meting is uitgerold. De broncommit in het verslag is de lokale codebasis, niet
een bewijs van de deploymentversie. Het scriptcontrolegetal identificeert ook
lokale, nog niet gecommitte wijzigingen.

| Exitcode | Betekenis |
| --- | --- |
| 0 | Alle adressen gecontroleerd, geen verschillen of ophaalfouten |
| 1 | Alle adressen gecontroleerd, wel verschillen of niet-beschikbare adressen |
| 2 | Onvolledig: proef, invoerfout, stopgrens, ongeldige sitemap of onderbreking |

Een verschil wordt niet automatisch goedgekeurd. Bekijk de betreffende JSONL-regel
voor status, controlegetal, redirects en foutcode. Leg per afwijking oorzaak en
vervolg vast bij het issue. Het script heeft geen lijst waarmee verschillen stil
kunnen worden genegeerd.

## Testen

```text
node --test .github/scripts/backlog.test.mjs hosting/site/server.test.mjs hosting/site/vergelijk-hosts.test.mjs
```

De vergelijkingstests draaien op tijdelijke lokale HTTP-servers. Ze controleren
onder meer compressie, status- en inhoudsverschillen, ontbrekende pagina's,
sitemapverschillen, redirects, een vastlopend antwoord, bytegrenzen, 429/503,
begrensd tempo, rapportage, een steekproef en onderbreking. Ze vragen niets bij de
echte hosts op.

[Terug naar de hostingdocumentatie](README.md)
