// Werkvolgorde van de hele backlog: welke story eerst, en waarom.
// Herbeoordeeld op 30 oktober 2026 met de beheerder.
//
// Regels:
// - Elke story uit .github/backlog/*.mjs staat hier precies één keer. Een nieuwe story die hier
//   ontbreekt, laat de test falen. Zo krijgt elke nieuwe story bewust een plek.
// - Voeg je een epic toe, herbeoordeel dan de hele volgorde, niet alleen de nieuwe stories.
// - `na` noemt stories die eerst af moeten zijn. Een story staat altijd ná alles in zijn `na`.
// - `werk` overschrijft het werklabel uit de backlog, als de herbeoordeling dat vraagt.
// - `prio` overschrijft de prioriteit van de fase.
// Het script .github/scripts/werkvolgorde.mjs zet hiermee de labels P1-P3, het werklabel en
// `klaar`, en houdt het issue "Werkvolgorde" bij. Astra en Opus pakken daar steeds de bovenste
// story op met hun eigen werklabel en `klaar`.

export default {
  herbeoordeeld: "2026-10-30",
  fasen: [
    {
      fase: 0, naam: "Fundament op orde", prio: "P1",
      doel: "De site is uit de repository te bouwen en elke wijziging wordt getest, zoals bij Omnibus.",
      stappen: [
        { id: "R1-2", waarom: "De besluitenlog ligt klaar in #69; alleen nog samenvoegen." },
        { id: "R1-1", waarom: "Eerst de afspraken, zodat iedereen veilig aan `main` werkt." },
        { id: "R1-4", werk: "Opus 5.5", waarom: "Zonder bouwscripts kan niemand bouwen of testen. De bestanden staan op de computer van de beheerder; alleen Opus kan daarbij." },
        { id: "R2-7", na: ["R1-4"], waarom: "Pages publiceert sinds B-007 de branch `pages`, dus de sitebestanden kunnen nu al naar `site/`. Zo is `main` schoon voordat er app-code komt." },
        { id: "R1-5", na: ["R1-4", "R2-7"], waarom: "Controles op de nieuwe indeling; daarna is elke pull request getest." },
        { id: "R1-3", waarom: "Klein; maakt meldingen meteen compleet." },
        { id: "R1-6", waarom: "De beheerder zet beveiliging en de bescherming van `pages` aan." },
      ],
    },
    {
      fase: 1, naam: "Huidige site op Sliplane en in de gedeelde huisstijl", prio: "P1",
      doel: "www.rijksmap.nl draait vanaf Sliplane, met Pages als terugval, en ziet eruit als familie van Omnibus. Bezoekers kunnen al rapporten aandragen.",
      stappen: [
        { id: "R2-2", waarom: "Gedaan: container voor de huidige site." },
        { id: "R2-5", waarom: "Gedaan: service `rijksmap-site` op de bestaande server." },
        { id: "R2-1", waarom: "Grotendeels gedaan; de geheugenberekening voor de app nog vastleggen." },
        { id: "R2-3", waarom: "Privacy en headers moeten kloppen voordat bezoekers op Sliplane komen. Werkt op de container, dus Astra kan meteen beginnen." },
        { id: "R2-4", waarom: "Het bewijs dat Sliplane gelijk is aan Pages, vóór de DNS-overstap. Ook zonder de bouwscripts te doen." },
        { id: "R2-6", na: ["R2-3", "R2-4"], waarom: "www.rijksmap.nl naar Sliplane; de beheerder zet de DNS om." },
        { id: "R1-7", na: ["R2-6"], prio: "P2", waarom: "Beheerdocumentatie zodra de hosting vaststaat." },
        { id: "R8-1", waarom: "Snelle winst: bezoekers kunnen nu al rapporten aandragen via GitHub." },
        { id: "R8-3", na: ["R8-1"], waarom: "Vaste labels, zodat elke bijdrage zichtbaar wordt verwerkt." },
        { id: "R10-1", prio: "P2", waarom: "Eerst zien waar Omnibus en de Rijksmap afwijken; klein en zonder code." },
        { id: "R10-2", na: ["R10-1"], prio: "P2", waarom: "De beheerder kiest de gedeelde huisstijl: Omnibus als basis, het lichtere blauw van de Rijksmap." },
        { id: "R10-3", na: ["R10-2"], prio: "P2", waarom: "De gids is nodig vóór de app een kop en voet krijgt." },
        { id: "R10-4", na: ["R2-7", "R10-3"], prio: "P2", waarom: "Snel zichtbaar resultaat: de tools verwijzen naar elkaar." },
        { id: "R10-5", na: ["R1-4", "R2-7", "R10-3"], prio: "P2", waarom: "De huidige site al in de huisstijl, via de bouwscripts." },
      ],
    },
    {
      fase: 2, naam: "Datamodel met eigen identiteit", prio: "P1",
      doel: "Alle gegevens staan als databestanden met vaste ID's en herkomst, en leveren dezelfde tellingen als de live site.",
      stappen: [
        { id: "R3-1", waarom: "Besloten (B-004): elke wijziging wordt een commit. Sluit met #69." },
        { id: "R4-1", waarom: "De stack van Omnibus vastleggen vóór de eerste regel code." },
        { id: "R7-1", prio: "P1", waarom: "De eisen van Omnibus (#151) bepalen mee hoe ID's en velden eruitzien; daarom vóór het datamodel." },
        { id: "R3-2", na: ["R7-1"], waarom: "Soorten items en vaste ID's: het fundament van alles daarna." },
        { id: "R3-3", na: ["R3-2"], waarom: "Herkomst per veld, zodat AI en handwerk herkenbaar blijven." },
        { id: "R3-4", na: ["R1-4", "R3-2", "R3-3"], waarom: "De echte gegevens naar databestanden met ID's." },
        { id: "R3-5", na: ["R3-4"], waarom: "Poort: zonder gelijke tellingen gaat er niets verder." },
        { id: "R3-6", na: ["R3-4"], prio: "P1", waarom: "Oude adressen en favorieten aan ID's koppelen; nodig voor pagina's en overstap." },
        { id: "R3-7", na: ["R3-4"], prio: "P2", waarom: "Verhuizen met geschiedenis; nodig voor beheer." },
        { id: "R8-2", na: ["R3-2"], prio: "P2", waarom: "Het correctieformulier vraagt om een ID zodra die bestaan." },
      ],
    },
    {
      fase: 3, naam: "Applicatie leest uit de database", prio: "P2",
      doel: "De nieuwe Rijksmap toont uit de database dezelfde kaart, pagina's en open data als nu, sneller, als testversie online.",
      stappen: [
        { id: "R9-1", waarom: "Eerst vastleggen wanneer de nieuwe site goed genoeg is; daar bouwt de app naartoe." },
        { id: "R4-2", na: ["R3-5", "R4-1"], waarom: "De lees-API is de basis van kaart, pagina's en AI-koppeling." },
        { id: "R5-2", na: ["R4-2"], waarom: "Vroeg een Dockerfile, zodat elke stap meteen online te testen is." },
        { id: "R5-3", na: ["R5-2"], waarom: "De beheerder maakt de service voor de testversie aan." },
        { id: "R4-3", na: ["R4-2", "R3-6"], waarom: "Pagina's op dezelfde adressen en identieke open data: vindbaarheid blijft." },
        { id: "R10-6", na: ["R4-1", "R10-3"], waarom: "Kop en voet als gedeeld onderdeel met Omnibus, vóór de kaart wordt gebouwd." },
        { id: "R4-5", na: ["R4-2", "R10-6"], waarom: "De kaart laadt per ministerie: de grootste snelheidswinst." },
        { id: "R4-4", na: ["R4-3", "R4-5"], waarom: "Vanuit de kaart altijd naar de vaste pagina." },
        { id: "R4-6", na: ["R4-5"], waarom: "Toegankelijkheid en privacy minstens gelijk." },
        { id: "R5-1", na: ["R5-3"], waarom: "Geheugen meten met de echte app naast Omnibus en de site." },
        { id: "R5-4", na: ["R5-3"], prio: "P3", waarom: "Zien welke versie online staat." },
        { id: "R4-7", na: ["R4-3", "R4-4", "R4-5"], waarom: "Vergelijkingstest oud tegen nieuw: toetst de criteria uit R9-1." },
        { id: "R7-2", na: ["R4-2"], waarom: "AI-koppeling om te lezen, op dezelfde API." },
        { id: "R10-7", na: ["R10-3", "R1-5"], prio: "P3", waarom: "Automatisch afwijkingen in de huisstijl vinden, zodat de tools niet weer uit elkaar groeien." },
      ],
    },
    {
      fase: 4, naam: "Beheren en schrijven", prio: "P2",
      doel: "De beheerder en AI passen gegevens aan zonder code, met inlog; elke wijziging wordt een commit.",
      stappen: [
        { id: "R6-1", waarom: "Inlog en rollen ontwerpen; de beheerder beslist over de beveiliging." },
        { id: "R6-6", na: ["R6-1", "R3-4"], prio: "P2", waarom: "De schrijfroute eerst: elke schrijffunctie (beheer, AI, bijdragen) gebruikt die." },
        { id: "R6-2", na: ["R6-6", "R4-3"], waarom: "De pop-up per item: daar gebeurt het meeste beheer." },
        { id: "R6-3", na: ["R6-2", "R3-7"], waarom: "Verhuizen: eerst ministerie, dan directie." },
        { id: "R6-4", na: ["R6-2"], waarom: "Onderdelen en personen toevoegen of verwijderen." },
        { id: "R6-5", na: ["R6-2"], waarom: "Ontkoppelde rapporten met log." },
        { id: "R7-5", na: ["R6-6"], prio: "P2", waarom: "De controlepoort moet er zijn vóór AI mag schrijven." },
        { id: "R7-3", na: ["R7-2", "R6-6", "R7-5"], waarom: "AI schrijft via dezelfde route en autorisatie." },
        { id: "R6-7", na: ["R6-6"], waarom: "Bulkwijzigingen, bijvoorbeeld de rapporten op Kerndepartement." },
        { id: "R7-4", na: ["R7-3"], prio: "P3", waarom: "AI vult metadata aan, met herkomst." },
      ],
    },
    {
      fase: 5, naam: "Community", prio: "P3",
      doel: "Bijdragen via GitHub worden automatisch gecontroleerd en in bulk verwerkt.",
      stappen: [
        { id: "R8-4", na: ["R8-2", "R8-3", "R3-6"], waarom: "Een bot controleert bijdragen op link, dubbelingen en ID." },
        { id: "R8-5", na: ["R8-4", "R6-7"], waarom: "Goedgekeurde bijdragen via de bulkwijziging." },
        { id: "R8-6", na: ["R8-3"], waarom: "Werklijst en overdracht; het issue Werkvolgorde is daar al een begin van." },
        { id: "R10-8", na: ["R10-3", "R1-1"], waarom: "Startpakket, zodat een volgende tool meteen dezelfde huisstijl en werkwijze heeft." },
      ],
    },
    {
      fase: 6, naam: "Overstap en opruimen", prio: "P3",
      doel: "www.rijksmap.nl draait op de nieuwe applicatie; de oude site is uit de repository.",
      stappen: [
        { id: "R9-3", na: ["R4-3", "R3-6"], waarom: "Elke oude link blijft werken." },
        { id: "R9-2", na: ["R9-1", "R5-3"], waarom: "Draaiboek met terugweg, geoefend op de testversie." },
        { id: "R9-4", na: ["R9-2", "R9-3", "R4-7"], waarom: "De overstap zelf; de beheerder voert hem uit." },
        { id: "R9-5", na: ["R9-4"], waarom: "Oude site en bouwscripts uit de repository." },
      ],
    },
  ],
};
