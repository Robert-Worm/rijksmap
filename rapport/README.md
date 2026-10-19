# Rapportpagina's

Elke submap is één rapport, met een eigen pagina op de Rijksmap: `rapport/<jaar>-<titel>/`.

Een rapportpagina toont:

- titel, datum, bron en auteur
- het ministerie en organisatieonderdeel waar het rapport over gaat
- de samenvatting (de officiële omschrijving van de uitgever, of een AI-samenvatting als die ontbreekt)
- de risicothema's met hun onderbouwing
- een link naar het rapport bij de officiële bron, en naar dezelfde plek in de interactieve kaart

Alle rapporten samen staan ook in de open data: [`rijksmap-rapporten.csv`](../rijksmap-rapporten.csv) en [`rijksmap-rapporten.json`](../rijksmap-rapporten.json). Hoe de gegevens tot stand komen, staat in [pijplijn en kwaliteitsborging](../docs/pijplijn-en-kwaliteit.md).

Deze pagina's worden gegenereerd uit de kaartdata; wijzigingen gaan via de bron, niet met de hand. Zie [CONTRIBUTING.md](../CONTRIBUTING.md).
