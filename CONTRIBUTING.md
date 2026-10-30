# Bijdragen aan de Rijksmap

Dank voor je hulp om de Rijksmap nauwkeuriger te maken. Het project wordt door één persoon onderhouden, dus duidelijke bijdragen met bron worden het snelst verwerkt.

## Een fout in de data melden

Dit is de waardevolste bijdrage. Bijvoorbeeld:

- een rapport bij het verkeerde ministerie of onderdeel
- een risicolabel dat niet past, of een label dat ontbreekt
- een verouderde bewindspersoon, directeur-generaal of organisatie-indeling
- een ontbrekend rapport, of een rapport dat er niet hoort

**Hoe:** [open een datacorrectie](../../issues/new?template=data-correction.yml). Vermeld de titel of het adres van de pagina, wat er mis is, wat het moet zijn, en **een link naar de officiële bron** die dat laat zien. Voor een onjuiste classificatie kun je ook de meldknop bij het rapport in de kaart gebruiken; die opent een vooraf ingevulde mail aan [info@rijksmap.nl](mailto:info@rijksmap.nl).

Vuistregel: **de officiële bron beslist.** Spreken bronnen elkaar tegen, dan wint de meest recente officiële publicatie.

## Een rapport aandragen

Mist er een openbaar audit-, toezicht- of onderzoeksrapport over de rijksoverheid? [Draag het aan](../../issues/new?template=rapport-aandragen.yml) met de link naar de officiële publicatie, de titel, de uitgever en de datum. De beheerder controleert of het openbaar is en binnen de Rijksmap valt. De Rijksmap neemt het rapport niet over, maar linkt naar de publicatie van de uitgever.

## Een fout in de site melden

[Open een foutmelding](../../issues/new?template=bug-report.yml) met het adres van de pagina, wat je deed, wat je verwachtte, en je browser en apparaat. Een schermafbeelding helpt.

## Persoonsgegevens

Sta je zelf op de Rijksmap en wil je iets laten corrigeren of verwijderen, mail dan naar [info@rijksmap.nl](mailto:info@rijksmap.nl) in plaats van een openbaar issue te maken. Je krijgt binnen vier weken een inhoudelijk antwoord.

## Code en pull requests

Werk je met een AI-agent, of wil je weten welke regels gelden voor code en data? Lees dan eerst [AGENTS.md](AGENTS.md).

De meeste bestanden in deze repository zijn **gegenereerd**. `index.html` en de ruim 9.000 statische pagina's worden gebouwd uit de bronbestanden in [`bron/`](bron/) met de scripts in [`bouw/`](bouw/README.md). Handmatige wijzigingen in gegenereerde bestanden worden bij de volgende build overschreven.

- Pull requests op `README.md`, `docs/`, `bouw/` en dit bestand zijn welkom.
- Voor wijzigingen aan de gegevens open je een issue; de wijziging wordt dan in de bron doorgevoerd.
- De live site www.rijksmap.nl publiceert de branch `pages` (zie [besluit B-007](docs/beheer/besluiten.md#b-007)).

## Werken met de leesprotocollen

Wil je een eigen lees- of controleronde doen, bijvoorbeeld als onafhankelijke tweede lezer? Gebruik de protocollen in [docs/protocollen/](docs/protocollen/) letterlijk, lees blind (zonder de bestaande labels te raadplegen), en lever per rapport een JSON-regel in het opgegeven schema. Zo blijft je uitkomst vergelijkbaar.

## Huisstijl

- Nederlands, zakelijk en neutraal.
- Geen em-dashes: de build weigert ze.
- Verzin niets. Wat niet in de bron staat, blijft leeg.

## Omgangsvormen

Wees precies, wees vriendelijk en noem je bronnen. De Rijksmap beschrijft publieke organisaties en ambtsdragers in hun publieke rol. Houd discussies over het werk, niet over personen.
