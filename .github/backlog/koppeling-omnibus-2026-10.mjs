// Backlog: de Rijksmap klaar maken voor een koppeling met Omnibus.
// Uit de herbeoordeling van Omnibus-issue #151 (story R7-1, 30 oktober 2026). Omnibus koppelt pas
// als de Rijksmap aan zes eisen voldoet (Omnibus-besluit B-020). Drie eisen hadden nog geen story;
// die staan hier, met de toets door de beheerder.
// Het script .github/scripts/backlog.mjs maakt hiervan GitHub-issues.

const BRON = "Eisen uit Omnibus-issue #151 (https://github.com/Robert-Worm/omnibus/issues/151) en Omnibus-besluit B-020: de koppeling komt pas op de routekaart van Omnibus als de Rijksmap aan alle zes eisen voldoet. Uitgewerkt in story R7-1.";

export default {
  id: "koppeling-omnibus-2026-10",
  labels: ["transitie"],
  epics: [
    {
      id: "EP-R11",
      titel: "Klaar voor de koppeling met Omnibus",
      onderdeel: "Koppeling Omnibus",
      doel: "De Rijksmap voldoet aan de zes eisen die Omnibus stelt (Omnibus-issue #151), zodat Omnibus de rapporten en relaties van de Rijksmap veilig kan gebruiken.",
      dod: [
        "**Klaar wanneer**",
        "- Alle user stories hieronder zijn afgerond.",
        "- De beheerder heeft getoetst dat alle zes eisen uit Omnibus-issue #151 zijn gehaald.",
        "- De documentatie beschrijft alleen wat er werkelijk is.",
      ].join("\n"),
      stories: [
        { id: "R11-1", titel: "Relaties tussen rapporten met een eigen ID",
          verhaal: "Als gebruiker van Omnibus wil ik zien welke rapporten dubbel zijn en welke managementreactie bij welk rapport hoort, zodat ik niet twee keer hetzelfde gebruik.",
          bron: `${BRON} Eis 6. Omnibus houdt dubbelingen nu zelf bij in \`.github/voortgang/dubbelingen.json\`.`,
          waar: ["`data/` (relaties)", "`docs/datamodel.md`"],
          aanpak: ["Leg de soorten relaties vast: dubbel van, managementreactie op, vervolg op", "Elke relatie heeft een eigen ID en herkomst", "Neem de dubbelingen uit Omnibus over als startpunt, na controle"],
          criteria: ["Relaties staan in de databestanden en in de open data", "Een test bewaakt dat elke relatie naar twee bestaande rapporten wijst"],
          labels: ["ChatGPT Astra", "P2"] },
        { id: "R11-2", titel: "Databaserelease met versie, datum, inhoudsopgave en controlegetal",
          verhaal: "Als Omnibus wil ik een vaste versie van de Rijksmap-data kunnen ophalen, zodat mijn koppeling niet stilletjes verandert.",
          bron: `${BRON} Eisen 2 en 3 (per release). Voorbeeld: de databasereleases van Omnibus, met \`SHA256SUMS.txt\`.`,
          waar: ["GitHub-releases van de Rijksmap", "`docs/beheer/` (database publiceren)"],
          aanpak: ["Maak bij elke datarelease een zip met de databestanden, een inhoudsopgave en `SHA256SUMS.txt`", "Geef elke release een datum en versienummer", "Neem de werkwijze over van Omnibus (`docs/beheer/database-publiceren.md`)"],
          criteria: ["Er staat een release met datum, inhoudsopgave en SHA-256 per bestand", "Een script controleert een gedownloade release tegen de controlegetallen", "Beschreven in `docs/beheer/`"],
          labels: ["ChatGPT Astra", "P2"] },
        { id: "R11-3", titel: "Controlegetal per document",
          verhaal: "Als Omnibus wil ik weten dat een rapport bij de Rijksmap precies dezelfde pdf is als bij mij, zodat claims op het goede document rusten.",
          bron: `${BRON} Eis 3 (per document).`,
          waar: ["`data/` (veld voor het controlegetal per rapport)", "Een script dat de openbare pdf ophaalt"],
          aanpak: ["Haal per rapport het openbare bestand op (`url_bestand`), rustig en met een herkenbare User-Agent", "Leg SHA-256, bestandsgrootte en datum van ophalen vast; bewaar het bestand zelf niet", "Wijkt een latere ophaalronde af, dan krijgt het rapport een melding in plaats van een stille wijziging"],
          criteria: ["Elk rapport met een openbaar bestand heeft een controlegetal en ophaaldatum", "Het controlegetal staat in de open data", "Rapportteksten blijven bij hun uitgever; de Rijksmap bewaart geen kopieën"],
          labels: ["ChatGPT Astra", "P3"] },
        { id: "R11-4", titel: "Twijfelgevallen markeren (HOLD)",
          verhaal: "Als gebruiker wil ik zien welke gegevens nog twijfelachtig zijn, zodat ik er niet op bouw zonder te controleren.",
          bron: `${BRON} Eis 5: dezelfde kwaliteitsregels als Omnibus, waaronder HOLD bij twijfel.`,
          waar: ["`docs/datamodel.md`", "`data/`"],
          aanpak: ["Voeg een status toe per gegeven of per rapport: vastgesteld of HOLD, met reden", "Neem de regels voor HOLD over van Omnibus", "HOLD-gegevens blijven zichtbaar, maar herkenbaar"],
          criteria: ["Elk HOLD-gegeven heeft een reden en datum", "De open data en de API tonen de status", "Een test bewaakt dat HOLD nooit stil verdwijnt"],
          labels: ["Opus 5.5", "P2"] },
        { id: "R11-5", titel: "De beheerder toetst de zes eisen",
          verhaal: "Als beheerder van beide projecten wil ik de zes eisen één voor één toetsen, zodat de koppeling pas op de routekaart van Omnibus komt als het echt kan.",
          bron: `${BRON} Toets volgens Omnibus-besluit B-020.`,
          waar: ["Omnibus-issue #151 en de routekaart van Omnibus", "`docs/beheer/besluiten.md` van beide projecten"],
          aanpak: ["Opus zet per eis het bewijs op een rij: story, pull request, test", "De beheerder beslist per eis; bij akkoord op alle zes komt de koppeling op de routekaart van Omnibus"],
          criteria: ["Per eis een besluit met bewijs", "Vastgelegd in de besluitenlog van beide projecten"],
          labels: ["Opus 5.5", "P3", "wacht-op-beheerder"] },
      ],
    },
  ],
};
