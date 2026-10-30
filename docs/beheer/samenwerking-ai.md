# Samenwerking tussen de AI-assistenten

> **In het kort:** twee AI-assistenten werken aan de Rijksmap: Claude Opus 5.5 en ChatGPT Astra. Ze praten niet rechtstreeks met elkaar. Ze geven werk aan elkaar door via GitHub: met labels, een vaste overdrachtsnotitie en het issue *Werkvolgorde*. De werkwijze komt uit Omnibus ([B-002](besluiten.md#b-002)).

## Wie doet wat?

| Assistent | Soort werk | Ook |
| --- | --- | --- |
| Claude Opus 5.5 | Pagina's, epics en stories, besluiten, de werkvolgorde, kleine afgebakende scripts, en werk dat bestanden op de computer van de beheerder nodig heeft | Volgt het werk van Astra en stelt regels voor als iets misgaat |
| ChatGPT Astra | Code in de bouwketen en de applicatie, data omzetten, grote reviews, gemeten runs | Meldt als een regel of story niet werkt |

Licht werk krijgt het label `Opus 5.5`, zwaar werk `ChatGPT Astra`, zoals Omnibus-besluit B-019. Een epic met beide soorten werk krijgt beide labels.

## De labels

Elk open issue heeft labels voor wie, prioriteit en status:

| Soort | Labels | Betekenis |
| --- | --- | --- |
| Wie | `Opus 5.5`, `ChatGPT Astra` | Wie het werk oppakt |
| Prioriteit | `P1`, `P2`, `P3` | P1 blokkeert ander werk of de beheerder; P2 is het volgende; P3 komt later |
| Status | `klaar`, `bezig`, `wacht-op-ander`, `wacht-op-beheerder`, `gepauzeerd` | Of het nu op te pakken is, en zo niet, op wie of wat het wacht |
| Rood | `rood` | De tests op `main` falen; dit issue gaat voor alles |

Prioriteit, werklabel en `klaar` zet de workflow *Werkvolgorde* uit [`.github/backlog/volgorde.mjs`](../../.github/backlog/volgorde.mjs). Een story krijgt `klaar` pas als alles waar hij op wacht gesloten is. `bezig`, `wacht-op-ander`, `wacht-op-beheerder` en `gepauzeerd` zet je zelf.

## Het issue Werkvolgorde

Het issue met het label `werkvolgorde` toont alle stories per fase, op volgorde, met waarom ze daar staan. Bovenaan staat per assistent wat nu op te pakken is. GitHub werkt het vanzelf bij als een issue sluit, een label verandert of de volgorde verandert, en elke ochtend.

Je zegt tegen een assistent: *pak de volgende story uit Werkvolgorde*.

De volgorde zelf houdt Opus bij. Komt er een epic bij, of blijkt een volgorde niet te werken, dan herbeoordeelt Opus de hele lijst en legt die aan de beheerder voor.

## Besluiten van de beheerder

Heeft een issue een besluit nodig, dan krijgt het `wacht-op-beheerder`. Opus legt de open besluiten in de chat aan de beheerder voor, met een advies. Na het besluit zet Opus het in de [besluitenlog](besluiten.md) en in het issue, en haalt het label weg. Een assistent neemt nooit zelf een besluit namens de beheerder.

## Zo pak je een story op

1. Zijn de tests op `main` rood (label `rood`), herstel dat dan eerst.
2. Pak in *Werkvolgorde* de bovenste story met jouw label en 🟢 klaar. Zet hem op `bezig`.
3. Haal de nieuwste stand op en lees de laatste overdrachtsnotitie in het issue.
4. Werk op een eigen branch, met kleine commits die het issuenummer noemen. Draai de tests uit [AGENTS.md](../../AGENTS.md#testen) vóór elke push.
5. Lever via een pull request met `Closes #<nummer>`. De beheerder voegt samen.

## De overdrachtsnotitie

Is jouw deel af, zet dan deze notitie als reactie in het issue:

```text
**Overdracht** · <jouw naam> → <de ander, of de beheerder>
- Klaar: <wat er af is, met pull request of commit>
- Volgende: <wat er nog moet gebeuren, en door wie>
- Testen: <hoe je controleert dat het werkt>
- Let op: <een bestand of test die de ander ook raakt; anders "niets">
```

Zet daarna de labels goed: haal `bezig` weg. Wacht het op een besluit, zet dan `wacht-op-beheerder`. Moet de andere assistent verder, zet dan `wacht-op-ander` en vraag Opus het werklabel in de volgorde aan te passen; de workflow zet het werklabel altijd terug naar wat in `volgorde.mjs` staat. Is alles af, sluit dan het issue via de pull request.

## Vaste afspraken

- **Rood eerst.** Wie `main` rood maakt, herstelt dat vóór nieuw werk. De andere assistent past zijn werk niet aan om een rode test te omzeilen.
- **De live site is heilig.** Niets op de branch `pages`, aan `CNAME`, Pages, DNS of de Sliplane-domeinen zonder akkoord van de beheerder (zie [AGENTS.md](../../AGENTS.md#de-live-site-is-heilig)).
- **Eén wijziging tegelijk per bestand.** Raak je een bestand dat de ander net wijzigde, noem dat onder *Let op*.
- **Geen werk van de ander overnemen.** Zie je een fout in het werk van de ander, zet dan een reactie in het issue. Herstel zelf alleen een rode test of een kapotte link.
- **Elke commit noemt zijn issue**, bijvoorbeeld `(#9)`.
- **Beschrijf wat er is.** Een plan hoort in een story, niet in de documentatie.

## Volgen en verbeteren

Bij het begin van een sessie bekijkt Opus het werk van Astra sinds de laatste overdracht: zijn de tests groen, zijn de afspraken gevolgd? Vindt Opus een patroon dat steeds misgaat, dan stelt Opus een nieuwe afspraak voor op deze pagina. De beheerder beslist.

---

[↑ Beheer](README.md) · [Besluiten](besluiten.md) · [AGENTS.md](../../AGENTS.md)
