# Instructies voor AI-agents en bijdragers

Dit bestand beschrijft de vaste afspraken voor iedereen die aan de Rijksmap werkt, met of zonder AI-agent (Claude, ChatGPT of vergelijkbaar). De regels gelden net zo goed voor mensen. De werkwijze komt uit [Omnibus](https://github.com/Robert-Worm/omnibus) ([besluit B-002](docs/beheer/besluiten.md#b-002)).

Lees bij het begin van een sessie:

1. het issue **Werkvolgorde** (label `werkvolgorde`): wat er nu klaar is om op te pakken;
2. [samenwerking tussen de AI-assistenten](docs/beheer/samenwerking-ai.md): labels, overdracht en vaste afspraken;
3. de [besluiten](docs/beheer/besluiten.md): wat al is vastgelegd.

## De live site is heilig

- **www.rijksmap.nl publiceert de branch `pages`** via GitHub Pages ([B-007](docs/beheer/besluiten.md#b-007)). Werk nooit op `pages` zonder uitdrukkelijk akkoord van de beheerder.
- **Raak niets aan dat de live site of het domein bepaalt** zonder akkoord: het bestand `CNAME`, de instellingen van Pages, de DNS bij Hostnet en de domeinen bij Sliplane.
- **`main` rolt automatisch uit** naar de testservice `rijksmap-site` op Sliplane ([hosting/site](hosting/site/README.md)). Omnibus draait op dezelfde server; raak die service niet aan.
- **Nieuwe services, aankopen en uitrol naar productie** doet de beheerder, of jij alleen met zijn akkoord.

## Bron en gegenereerde bestanden

- De bron van de site staat in [`bron/`](bron/); de bouwscripts in [`bouw/`](bouw/README.md). `node bouw/bouw.mjs` bouwt de site in de werkmap `.bouw/`.
- De sitebestanden in de hoofdmap (`index.html`, `rapport/`, de ministeriemappen, de open data, `sitemap.xml`) zijn **gegenereerd**. Wijzig ze niet met de hand; pas de bron of een script aan en bouw opnieuw.
- Werkt een build een register bij (`slugregister.json`, `lastmod-register.json`), zet het dan terug met `node bouw/bouw.mjs --bijwerken` en commit het mee. Een vast adres verandert nooit.

## Testen

Draai vóór elke push de tests van wat je hebt geraakt, en bij twijfel alles:

```text
node --test .github/scripts/backlog.test.mjs hosting/site/server.test.mjs
node bouw/bouw.mjs --controleer        bij elke wijziging in bron/ of bouw/
```

`--controleer` vergelijkt elk gebouwd bestand met de gepubliceerde site. Een verschil is alleen goed als het precies de wijziging is die je bedoelde; noem het dan in de pull request.

## Backlog en volgorde

- Werk alleen aan een story met jouw werklabel en status `klaar`, en zet hem op `bezig`.
- Een nieuwe story krijgt een plek in [`.github/backlog/volgorde.mjs`](.github/backlog/volgorde.mjs); zonder plek faalt de test. Voeg je een epic toe, herbeoordeel dan de hele volgorde.
- **Noem in elke commitboodschap het issuenummer**, bijvoorbeeld `(#9)`.

## Inhoud en schrijfstijl

- **Nederlands, B1, zakelijk en neutraal.** Geen em-dashes: de build weigert ze.
- **De officiële bron beslist.** Verzin niets; wat niet in de bron staat, blijft leeg. Datum, titel, auteur en link komen altijd uit de officiële publicatie.
- **Rapportteksten blijven van hun uitgevers.** De Rijksmap linkt naar de openbare publicatie en neemt geen rapporten over.
- **AI-velden blijven herkenbaar** als AI, met het model dat ze opstelde.

## Privacy en geheimen

- Geen tracking, geen cookies, geen derde partijen. De server logt geen bezoekers ([B-008](docs/beheer/besluiten.md#b-008)).
- Alleen zakelijke, openbare functiegegevens van ambtsdragers. Geen privé-adressen of persoonlijke e-mailadressen in de repository; een controle in de build zoekt naar Gmail-adressen.
- Geen wachtwoorden, sleutels, tokens of 2FA-codes in code, issues of commits. Beveiligingsinstellingen op GitHub zet de beheerder.
- De werkmap van de beheerder (met eenmalige scripts, werkbestanden en back-ups) gaat nooit integraal de repository in. Neem alleen over wat een story vraagt, na controle op geheimen en persoonsgegevens.

## Versiebeheer

- Werk op een eigen branch en lever via een pull request. De beheerder voegt samen.
- Kleine commits met één onderwerp. Geen force-push op `main` of `pages`.
- **Beschrijf wat er is.** Een plan hoort in een story, niet in de documentatie.
