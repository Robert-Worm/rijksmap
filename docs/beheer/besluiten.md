# Besluiten

Belangrijke keuzes over de Rijksmap, met datum en reden. Nieuwste bovenaan. Een besluit verandert alleen met een nieuw besluit dat ernaar verwijst.

| Nr. | Datum | Besluit | Waarom | Gevolg |
| --- | --- | --- | --- | --- |
| <a id="b-008"></a>B-008 | 2026-10-30 | De huidige site draait in de container op een eigen kleine webserver in Node, op dezelfde vastgepinde Node-image als Omnibus | Eén basis-image voor alle services; geen pakketten van buiten; logt geen bezoekers | Zie [`hosting/site/`](../../hosting/site/README.md) |
| <a id="b-007"></a>B-007 | 2026-10-30 | GitHub Pages publiceert de branch `pages` (de live versie, commit `7d2b101`). `main` rolt automatisch uit naar Sliplane | Zo kan er vrij op `main` gewerkt worden zonder dat www.rijksmap.nl verandert | Een wijziging aan de live site gaat naar `pages` zolang www.rijksmap.nl naar Pages wijst. Na de DNS-overstap ([#19](https://github.com/Robert-Worm/rijksmap/issues/19)) is `pages` alleen terugval |
| <a id="b-006"></a>B-006 | 2026-10-30 | De huidige site en straks de nieuwe applicatie draaien als services op de bestaande Sliplane-server, naast Omnibus | Sliplane rekent per server; extra services kosten niets zolang geheugen en schijf het toelaten | Service `rijksmap-site` sinds 30 oktober. Geheugen van de server daarna circa 0,6 van 1 GB, schijf circa 2 van 21 GB |
| <a id="b-005"></a>B-005 | 2026-10-30 | Er komen twee routes voor wijzigingen: de beheeromgeving in de applicatie (met inlog, ook voor AI via MCP) en bijdragen via GitHub voor iedereen | Beheer moet snel kunnen; bijdragers moeten zonder account bij de applicatie kunnen meedoen | Zie de epics [#42](https://github.com/Robert-Worm/rijksmap/issues/42), [#50](https://github.com/Robert-Worm/rijksmap/issues/50) en [#56](https://github.com/Robert-Worm/rijksmap/issues/56) |
| <a id="b-004"></a>B-004 | 2026-10-30 | Elke wijziging aan de gegevens wordt een commit in GitHub, ook vanuit de beheeromgeving en de AI-koppeling | De geschiedenis van elke wijziging staat dan vanzelf in Git; terugdraaien is eenvoudig; de database kan alleen-lezen in de image blijven | Een wijziging staat online na een nieuwe uitrol (circa een halve minuut). Beantwoordt [#22](https://github.com/Robert-Worm/rijksmap/issues/22) |
| <a id="b-003"></a>B-003 | 2026-10-30 | De database wordt SQLite in de image, gebouwd uit databestanden in Git, zoals bij Omnibus | Past op de bestaande server; geen betaalde databasedienst nodig | Zie epic [#21](https://github.com/Robert-Worm/rijksmap/issues/21) |
| <a id="b-002"></a>B-002 | 2026-10-30 | Zoveel mogelijk overnemen uit Omnibus: stack, werkwijze, kwaliteitscontroles, besluitenlog en backlog. Werklabels zoals Omnibus-besluit B-019: licht werk voor Opus 5.5, zwaar werk voor ChatGPT Astra | Daar is al veel tijd in gestoken; niet het wiel opnieuw uitvinden | Backlog in [`.github/backlog/`](../../.github/backlog/transitie-2026-10.mjs) |
| <a id="b-001"></a>B-001 | 2026-10-30 | De huidige site en de nieuwe applicatie staan in één repository | Eén plek voor issues, community en geschiedenis | De sitebestanden gaan later naar een eigen map `site/` ([#20](https://github.com/Robert-Worm/rijksmap/issues/20)) en na de overstap uit de repository ([#63](https://github.com/Robert-Worm/rijksmap/issues/63)) |

---

[↑ Beheer](README.md) · [Architectuur](../architectuur.md) · [Routekaart](../routekaart.md)
