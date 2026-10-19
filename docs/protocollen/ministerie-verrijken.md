# Prompt: verrijk één ministerie tot "J&V-niveau" in de Rijksmap

**Gebruik:** plak deze prompt en vul bij `[MINISTERIE]` één ministerie in. Werk telkens
**één ministerie tegelijk** en borg juistheid + volledigheid met officiële bronnen.

KLAAR: alle twaalf ministeries zijn verrijkt — J&V · FIN · BZK · VWS · OCW · IW · LVVN · EZK · AZ · BZ · DEF · SZW. Elk heeft een tabblad in Rijksmap-verbeteringen.xlsx.

> Let op (I&W-les): niet elke DG-organogrampagina noemt de directies. Als de HTML-pagina's
> alleen thematische beleidsvelden geven, zoek dan het **gedateerde organogram-PDF** van het
> ministerie (rijksoverheid.nl heeft per ministerie een `...organogram-<ministerie>-<mm-jjjj>.pdf`).
> WebFetch kan de tekst er niet uithalen, maar slaat de PDF lokaal op — lees díe met de Read-tool
> (rendert als afbeelding) en lees directies + directeuren af. Zet de directeur (met de
> organogram-datum) in het `d`-omschrijvingsveld van elke directie; I&W-directeuren hebben
> zelden losse ABD-benoemingsberichten, dus geen chip-paren maar de datum-gebronde tooltip.

> Tip 2 (OCW-les): de organogram-pagina kan **verouderd** zijn. Bij OCW noemde die
> nog Ruth Clabbers (OPO), maar ABD toonde dat ze vertrok en Brigitte Zonneveld de
> nieuwe directeur is. Kruis de organogram-naam dus altijd met ABD (zoek ook op de
> naam zelf om een recent vertrek/opvolging te vangen).

> Tip (BZK-les): de **rijksoverheid.nl DG-organogram-subpagina's** noemen vaak de
> directeuren per directie *én* de DG. Haal die eerst op (WebFetch) voor de actuele
> namen, en zoek dan per naam het ABD-benoemingsbericht — zo verifieer je actualiteit
> en vind je de `du` in één slag. Werkt beter dan alleen op functie zoeken in ABD.

---

Verrijk het ministerie **[MINISTERIE, bv. Financiën / FIN]** in `rijksmap.html` tot dezelfde
diepte en kwaliteit als Justitie en Veiligheid. Volg exact onderstaande werkwijze.

## Bronnen (in volgorde van gezag)
1. Officieel organogram op rijksoverheid.nl: `.../ministeries/ministerie-van-<slug>/organisatie/organogram` en de DG-subpagina's daaronder.
2. Algemene Bestuursdienst (algemenebestuursdienst.nl/actueel) voor benoemingen van SG/DG's (naam + datum + link).
3. De eigen organisatiestructuur-/organogrampagina van elke uitvoeringsdienst (voor de directies EN de leiding).

**Kernregel:** link altijd naar de *specifieke sub-pagina* waar de informatie staat
(organisatiestructuur / organogram / directie / dienstleiding), nooit naar een algemene
homepage of menu. Voeg nooit een naam toe die je niet in een bron kunt bevestigen -> markeer die als "verifieren".

## Wat per laag moet gebeuren

### 1. Bewindspersonen -- `M[].people`
Controleer minister(s) en staatssecretaris(sen) op de volledige, officiele titel
(specifieke portefeuille). Generiek "Staatssecretaris" wordt automatisch
"Staatssecretaris van <ministerie>" via `roleFull`; wijk alleen af bij een specifieke portefeuille.

### 2. Ambtelijke top -- `BESTUURSRAAD[<code>]`
SG, plv-SG en alle DG's met naam + ABD-link. Vul lege namen aan. Check op **actualiteit**
(recente benoemingen) en **structuurwijzigingen** (samengevoegde of nieuwe DG's). Bij een
fusie: een gecombineerde DG-entry met de juiste rol + nieuwe leider; verwijder de oude losse entries.

### 3. Directoraten -- `M[].dg` + `DG_SLUG[<code>]`
De DG-lijst moet de **actuele** structuur weerspiegelen (fusies doorvoeren: een DG-code,
aangepaste naam/omschrijving; slug van oude DG's verwijderen; bestaat er nog geen officiele
pagina, dan geen slug -> valt terug op het algemene organogram).
Leiding per DG hoeft niet apart: `dgLeader` matcht de DG-naam automatisch tegen de
Bestuursraad -- zorg dus dat de Bestuursraad-rol de DG-kernnaam bevat.

### 4. Directies per DG -- `DG_DIRS[<code>][<DG-code>]`
Voor **elke** DG die directies heeft: de volledige lijst uit de officiele DG-organogrampagina,
elk als `{"n":"...","d":"korte officiele omschrijving","u":"...specifieke pagina/anker..."}`.
Ontbreekt een anker per directie, gebruik de DG-organogrampagina als `u` (dat is de
specifieke DG-pagina, geen menu). DG's met alleen thematische taken (bv. een coordinator)
krijgen GEEN directies -- dat is correct, niet "ontbrekend". **Controleer volledigheid**:
vergelijk aantal en namen met het organogram.

### 5. Uitvoeringsdiensten -- `M[].ag` + `AGENCY_DETAIL[<code>]`
Per dienst in `AGENCY_DETAIL`:
- `desc`: korte, feitelijke omschrijving.
- `scale`: omvang (medewerkers/locaties) waar publiek bevestigd.
- `lead`: de werkelijke leiding als `[{"r":"functie","n":"naam","u":"specifieke pagina"}]`; link naar de dienstleiding-/college-/directiepagina, niet de homepage.
- `units`: de **feitelijke directies/organisatieonderdelen** uit de organisatiestructuur-pagina -- GEEN processtromen of operationele categorieen. Elk als string of `{"n":"...","u":"specifieke sub-pagina"}` (met `u` linkt de chip naar de eigen sub-pagina, zonder `u` valt hij terug op `org`).
  - **Deep-link waar mogelijk:** geef elk onderdeel een eigen `u` als de dienst-site een sub-pagina of `#anker` per onderdeel heeft (anders valt alles terug op de algemene org-pagina). Controleren kan met `agency-unit-audit.mjs` (welke units geen eigen link hebben) en `dienst-links-check.mjs` (fetcht elke org-pagina en toont per-onderdeel ankers/sub-links). Zelfde principe voor de DG-directies in `DG_DIRS`; rijksoverheid-DG-pagina's hebben soms per-directie hex-ankers (`link-audit.mjs`/`anchor-fetch.mjs`). Sites die scraping blokkeren (politie/cjib/coa) of alleen een PDF-organogram hebben: geen deep-link mogelijk -> org-pagina is het beste.
  - **Benoemingsbericht per directie (optioneel):** is er een vindbaar benoemingsbericht, voeg dan `"dir":"Naam directeur"` + `"du":"...benoemingsbericht-URL..."` toe. De render toont dan een aangehecht teal 'benoemd'-pilletje (chip-paar variant A) dat naar het bericht linkt; zonder `dir`/`du` blijft het een gewone chip. Framing = *benoemd*, niet 'huidige directeur' (directeuren wisselen). Nooit een naam gokken -> geen bericht = geen `dir`/`du`. **Gebruik hiervoor `benoemingen-zoeken.md`:** de ABD-nieuwspagina is een JS-SPA die losse websearch mist; open in de preview-browser `algemenebestuursdienst.nl/actueel/nieuws?q=directeur+<Dienstnaam>` en lees de resultaten-DOM uit. "plaatsvervangend"/"afdelingshoofd" tellen niet als directeur.
- `org`: de **specifieke** organisatiestructuur-/organogrampagina van de dienst.
- Sites die geautomatiseerd ophalen blokkeren (403, bv. politie.nl/coa.nl/cjib.nl): neem de rijksoverheid.nl-organisatiepagina als bron/`org` en markeer niet-uitleesbare leiding als "verifieren". Het organogram in een screenshot van de gebruiker is een geldige bron.

## Data-hygiene
- **Geen em-dashes** ("—"); gebruik "-" of "·". Straight quotes in JSON.
- Alle teksten worden bij het renderen ge-escHtml'd -> lever gewone tekst.
- Voeg niets toe dat je niet uit een bron kunt staven.

## Verificatie en oplevering (verplicht, per ministerie)
1. `node verify-ar.mjs` -> "script-blokken OK: 2 fout: 0" en "em-dashes: 0".
2. Live check in de preview: open het ministerie, klap DG's + diensten uit, controleer namen, leiding, directies, en dat links naar de juiste sub-pagina wijzen.
3. Synchroniseren: `cp rijksmap.html rijksmap-updated.html && cp rijksmap.html index.html`.
4. Verbeteringen vastleggen in `Rijksmap-verbeteringen.xlsx`, **tabblad per ministerie**, kolommen: Status (TOEGEPAST / OP LIJST / VERIFIEREN), Laag, Onderdeel, Type verbetering, Voorstel/directie/onderdelen, Beste organisatie-/structuurlink, Bron gecontroleerd, Betrouwbaarheid.
5. Pas de "Hoog"-betrouwbare verbeteringen meteen toe; zet "verifieren"-punten alleen op de lijst.

## Werkwijze
Doe **een ministerie tegelijk**. Meld per laag wat je vond en wijzigde, en vraag bevestiging
voordat je naar het volgende ministerie gaat.
