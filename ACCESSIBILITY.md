# Toegankelijkheid

De Rijksmap moet bruikbaar zijn voor iedereen, ook met een schermlezer, alleen een toetsenbord of een vergroot scherm.

## Wat er is gedaan

- **WCAG-pass** op contrast, aria-attributen, toetsenbordnavigatie en landmarks, met [WCAG 2.1](https://www.w3.org/TR/WCAG21/) niveau AA als richtlijn.
- **Toetsenbord:** alles is zonder muis te bedienen. Een link "Direct naar de inhoud" slaat de navigatie over, en de toetsenbordbediening is getoetst aan succescriterium 2.1.1.
- **Schermlezers:** filterchips melden of ze aan of uit staan, uitklapknoppen melden hun stand, en zoeksuggesties worden aangekondigd.
- **Contrast:** licht en donker thema, beide gecontroleerd op leesbaar contrast.
- **Afdrukken:** een geopend ministerie drukt af als leesbaar dossier.
- **Geen afhankelijkheden van buitenaf:** geen trackers, cookies of externe scripts die de pagina vertragen of verstoren.

## Bekende beperkingen

- **Eerste keer laden.** De kaart is één bestand van circa 10 MB (gecomprimeerd circa 1,5 MB). Op een trage verbinding duurt de eerste keer laden langer. De [routekaart](docs/routekaart.md) beschrijft hoe dit kleiner wordt.
- **Kleur in de overzichten.** De jaar- en risico-overzichten gebruiken kleurintensiteit; de getallen staan er altijd bij, zodat de informatie ook zonder kleur te lezen is.
- **Rapporten bij de bron.** De Rijksmap linkt naar rapporten op andere websites. Of die pdf's toegankelijk zijn, ligt bij de uitgever.
- **Geen formele toetsing.** Er is geen externe WCAG-audit gedaan; deze verklaring beschrijft wat zelf is getoetst.

## Een barrière melden

Loop je ergens tegenaan? [Open een issue](../../issues/new/choose) met het label "accessibility", of mail naar [info@rijksmap.nl](mailto:info@rijksmap.nl). Vermeld de pagina, wat er misging, en welk hulpmiddel en welke browser je gebruikt.
