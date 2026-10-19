# Datamodel

De open dataset bevat elk rapport dat de Rijksmap kent, één regel per rapport. Je vindt hem als [`rijksmap-rapporten.csv`](https://www.rijksmap.nl/rijksmap-rapporten.csv) (puntkomma-gescheiden, UTF-8 met BOM, opent direct in Excel) en als [`rijksmap-rapporten.json`](https://www.rijksmap.nl/rijksmap-rapporten.json). Beide vallen onder [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).

Het JSON-bestand heeft een korte kop:

```json
{
  "naam": "Rapporten over de rijksoverheid per ministerie (Rijksmap)",
  "beschrijving": "…welke velden officieel zijn en welke met AI zijn opgesteld…",
  "licentie": "https://creativecommons.org/publicdomain/zero/1.0/",
  "bron": "https://www.rijksmap.nl/",
  "aantal": 9116,
  "rapporten": [ … ]
}
```

## Herkomst in één oogopslag

Elk veld valt in een van drie categorieën:

- 🟢 **Officieel:** overgenomen van de publicatiepagina van de uitgever
- 🔵 **Afgeleid:** tijdens de verwerking vastgesteld uit de rapporttekst of de bronmetadata, en gecontroleerd (zie [pijplijn-en-kwaliteit.md](pijplijn-en-kwaliteit.md))
- 🟣 **AI:** geschreven of toegekend door een AI-model; welk model staat per regel in `model_risicolabels`

## Velden

| Veld | | Betekenis | Voorbeeld / waarden |
| --- | --- | --- | --- |
| `datum` | 🟢 | Publicatiedatum, `JJJJ-MM-DD`. | `2026-07-24` |
| `datum_precisie` | 🔵 | Hoe precies `datum` is. `dag`: exacte dag. `maand`: alleen de maand is bekend en de dag is een plaatsvervanger. `jaar`: alleen het jaar is bekend. De site toont nooit meer precisie dan er is. | `dag` (7.604) · `maand` (1.428) · `jaar` (84) |
| `titel` | 🟢 | Titel zoals gepubliceerd; bij Kamerbijlagen de echte titel van de titelpagina. | |
| `ministerie` | 🔵 | Het ministerie waar het **onderzochte** onderdeel of beleid onder valt, of `Rijksbreed`. | 12 ministeries + `Rijksbreed` |
| `onderdeel` | 🔵 | Organisatieonderdeel (directoraat-generaal, dienst, …), in één canonieke schrijfwijze. Valt terug op `Kerndepartement` als de tekst geen eenduidig onderdeel aanwijst. | `DGVB`, `Belastingdienst` |
| `bron` | 🔵 | Bronsoort, ingedeeld op auteur. | `Auditdienst Rijk` · `Algemene Rekenkamer` · `Rijksinspecties en andere toezichthouders` · `Onderzoeken en evaluaties` |
| `auteur` | 🟢 | Auteur of uitgevende organisatie uit het colofon. | `Auditdienst Rijk`, `CPB`, `PBL` |
| `documenttype` | 🔵 | Opdrachttype, vooral bij auditrapporten. | `auditrapport` · `interim-auditrapport` · `onderzoeksrapport` · `controleverklaring/review` · `assurance-rapport` · `privacy-onderzoek` |
| `standaard` | 🔵 | De **methodische** standaard of het kader waaronder het onderzoek is gedaan. Een onderzochte wet is geen standaard. | `Comptabiliteitswet` · `ISSAI` · `NBA 4400` · `NOREA 3000D` · `IIA (non-assurance)` · `RPE` · `Rijkstoezicht` · `Extern onderzoek` |
| `risicolabels` | 🟣 | De categorieën uit Risk in Focus 2026 die *wezenlijk* aan de orde zijn, gescheiden door `; `. | `Governance en verslaggeving; Veranderende wet- en regelgeving` |
| `primair_risico` | 🟣 | De ene categorie die de kern van het rapport vormt. | |
| `onderzochte_dienst` | 🔵 | De specifiek onderzochte dienst, als die afwijkt van het onderdeel. | `Dienst Toeslagen` |
| `tags` | 🟣 | Zoektags, gescheiden door `;`. | `energietransitie;isolatie` |
| `samenvatting` | 🟢/🟣 | Samenvatting. Officieel als `samenvatting_officieel` = `ja`, anders door AI geschreven uit de rapporttekst. | |
| `toelichting_risicolabels` | 🟣 | Onderbouwing waarom elk label van toepassing is, zodat het tegen het rapport te controleren valt. | "Waarom deze labels: …" |
| `samenvatting_officieel` | 🔵 | `ja` als `samenvatting` de tekst van de uitgever is, `nee` als die door AI is geschreven. | `ja` (6.693) · `nee` (2.423) |
| `niet_openbaar` | 🟢 | `ja` als het rapport bekend is (bijvoorbeeld via een Woo-besluit) maar niet gepubliceerd. Zulke rapporten tellen mee, maar krijgen geen labels. | `ja` (64) |
| `model_risicolabels` | 🟣 | Het model dat de AI-velden van deze regel opstelde. Leeg als het rapport niet te classificeren was. | `Opus 5` (7.682) · `Fable 5` (1.242) · `Opus 4.8` (104) |
| `url` | 🟢 | Officiële publicatiepagina. | |
| `url_bestand` | 🟢 | Directe link naar het documentbestand, waar beschikbaar. | `https://open.overheid.nl/documenten/…/file` |

## De zestien risicocategorieën

De labels gebruiken de zestien categorieën van [Risk in Focus 2026](https://www.iia.nl/bijlagen/7cd962d0-655b-443b-b735-3be9dbfd98b4/download), het jaarlijkse Europese risicokader van IIA/ECIIA. Intern heeft elke categorie een vaste sleutel. Het aantal is het aantal rapporten met dat label:

| Sleutel | Categorie | Rapporten |
| --- | --- | ---: |
| `governance` | Governance en verslaggeving | 5.585 |
| `financial` | Financiële, liquiditeits- en insolventierisico's | 3.770 |
| `laws` | Veranderende wet- en regelgeving | 3.517 |
| `hse` | Gezondheid, veiligheid en beveiliging | 1.871 |
| `humancap` | Personeel, diversiteit en behoud van talent | 1.835 |
| `continuity` | Bedrijfscontinuïteit en operationele weerbaarheid | 1.524 |
| `climate` | Klimaat, biodiversiteit en milieu | 1.403 |
| `digital` | Digitale disruptie, nieuwe technologie en AI | 1.134 |
| `comms` | Communicatie, reputatie en stakeholders | 1.120 |
| `market` | Marktverandering en concurrentie | 879 |
| `cyber` | Cybersecurity en gegevensbeveiliging | 799 |
| `supplychain` | Toeleveringsketen, uitbesteding en derden | 756 |
| `fraud` | Fraude, omkoping en criminele uitbuiting | 563 |
| `culture` | Organisatiecultuur | 517 |
| `macro` | Macro-economische en geopolitieke onzekerheid | 461 |
| `ma` | Fusies en overnames | 18 |

Het kader is geschreven voor organisaties in het algemeen, niet specifiek voor de overheid. De Rijksmap gebruikt het als gemeenschappelijke lens om rapporten uit verschillende bronnen te vergelijken. Het zegt welke thema's een rapport raakt, niet hoe ernstig de bevindingen zijn.

## Sleutels

Een rapport wordt geïdentificeerd door **`datum|titel`**. Dezelfde sleutel wordt gebruikt voor favorieten, voor deeplinks in de kaart (`#min=SZW&ga=rap:<datum>|<titel>`, URL-gecodeerd) en voor het onderbouwingenbestand `rijksmap-rfo.json`. Rapportpagina's staan onder `rapport/<jaar>-<titel-slug>/`.

## Verantwoord gebruik

- **Controleer de bron.** Volg `url` voordat je op een label of samenvatting bouwt.
- **AI-velden zijn indicatief.** `risicolabels`, `primair_risico`, `tags`, `toelichting_risicolabels` en AI-samenvattingen zijn niet stelselmatig door mensen gevalideerd.
- **Aantallen zijn volume, geen dekking.** Veel rapporten over een onderwerp betekent niet dat het goed geregeld is, en weinig rapporten niet dat het verwaarloosd wordt.
