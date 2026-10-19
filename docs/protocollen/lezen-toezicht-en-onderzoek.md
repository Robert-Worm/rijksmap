# Reviewprotocol toezicht- en extern-onderzoeksrapporten (INSP/EXT)

Je beoordeelt rapporten voor de Rijksmap (rijksmap.nl): een kaart van de rijksoverheid met per organisatieonderdeel de onderzoeksrapporten die erover verschenen. Bestaande bronnen: ADR (interne auditor) en Algemene Rekenkamer (externe auditor). Deze ronde voegt twee bronnen toe: **rijksinspecties** (INSP) en **externe onderzoeksbureaus** (EXT).

## Invoer
Per rapport een tekstbestand `tz-review/chunks/rNNNN.txt` met een metadata-kop (titel, datum, kandidaat-organisatie(s), bronpagina, auteur-signaal) gevolgd door de volledige rapporttekst. Lees het hele bestand.

## Stap 1: scope-oordeel (eerst!)
Een rapport is IN scope als aan ALLE drie voldaan is:
1. **Het is een onderzoeks-, evaluatie- of toezichtsrapport** (geen brief, jaarplan, werkprogramma, folder, formulier, wetstekst, Woo-inventarislijst). HUF-toetsen, uitvoeringstoetsen en uitvoerbaarheidstoetsen op wet- en regelgeving zijn adviezen, geen onderzoeksrapporten: ALTIJD uit scope, ook als ze uitgebreid zijn.
2. **De kandidaat-organisatie is de auteur/uitvoerder** van het onderzoek (niet slechts genoemd, geciteerd of onderwerp). Bij meerdere kandidaat-organisaties: kies de werkelijke auteur. Is de echte auteur een ANDERE inspectie of een ander gerenommeerd bureau dan de kandidaat, noteer die dan als `org` en ga door.
3. **Het onderwerp raakt de rijksoverheid**: een rijksorganisatie (ministerie, dienst, ZBO, RWT) wordt onderzocht, ÓF het is een evaluatie van rijksbeleid (beleidsevaluatie, wetsevaluatie, subsidieregeling-evaluatie in opdracht van een ministerie). NIET in scope: toezichtrapporten over individuele private instellingen/bedrijven/scholen/zorginstellingen, gemeentelijke onderwerpen zonder rijkscomponent, buitenlandstudies zonder link met Nederlands rijksbeleid.

UIT scope → schrijf alleen `{"scope":"uit","reden":"<één zin>"}` en klaar.

## Stap 2: classificatie (alleen bij IN scope)
Velden:
- `org`: de auteur-organisatie (canonieke naam, bv. "ILT", "Inspectie JenV", "KPMG", "SEO Economisch Onderzoek").
- `srcCat`: "INSP" (rijksinspectie) of "EXT" (extern bureau).
- `min`: het ministerie waar het onderzochte onderwerp primair onder valt. Sleutels: AZ, BZ, JV (Justitie en Veiligheid), BZK, OCW, FIN, DEF, IW (Infrastructuur en Waterstaat), EZK, LVVN, SZW, VWS, RB (rijksbreed/meerdere ministeries).
- `dd`: het onderzochte directoraat-generaal, de dienst of het onderdeel, zo specifiek als de tekst toelaat (bv. "IND", "Belastingdienst", "DG Migratie", "Rijkswaterstaat"). Bij beleidsevaluaties: het beleidsverantwoordelijke DG als dat blijkt, anders "Kerndepartement <ministerie>".
- `sm`: samenvatting, 2-3 zinnen, uitkomst/oordeel eerst, feitelijk, geen em-dashes (gebruik komma's of " - ").
- `rf`: risicoscores. Score 0-10 per relevante categorie; neem ALLEEN categorieën op met score >= 7. Sleutels (exact deze): cyber, humancap, digital, laws, macro, continuity, market, supplychain, financial, climate, governance, culture, fraud, comms, hse, ma.
- `rfp`: de primaire risicocategorie (één sleutel uit rf).
- `rfv`: betrouwbaarheid van je classificatie: "Hoog" / "Midden" / "Laag".
- `rfo`: één zin onderbouwing waarom rfp het primaire risico is, verankerd in de rapporttekst.

## Uitvoer
Schrijf per opgedragen reeks één bestand `tz-review/narr/<eerste-id>-<laatste-id>.json`:
```json
{
  "r0001": {"scope":"in","org":"ILT","srcCat":"INSP","min":"IW","dd":"ProRail","sm":"...","rf":{"continuity":8,"hse":7},"rfp":"continuity","rfv":"Hoog","rfo":"..."},
  "r0002": {"scope":"uit","reden":"Kamerbrief, geen onderzoeksrapport."}
}
```
Regels: geldige JSON, geen em-dashes in welk veld dan ook, geen velden verzinnen die de tekst niet draagt. Bij een leeg of onleesbaar chunk-bestand: `{"scope":"uit","reden":"tekst ontbreekt"}` met rfv weggelaten.
