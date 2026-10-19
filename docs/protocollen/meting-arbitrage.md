# Arbitrage van risicoclassificaties (scheidsrechterprotocol)

Twee beoordelaars hebben onafhankelijk hetzelfde overheidsrapport geclassificeerd op de zestien
Risk-in-Focus-thema's en zijn het oneens. Jij bent de scheidsrechter: je leest de rapporttekst en
bepaalt welke beoordeling de tekst het best dekt. Je weet niet wie de beoordelaars zijn en dat hoort
ook niet mee te wegen; alleen de tekst telt.

## Invoer
- `irr/arbitrage/items.json`: per verschil het id, het pad van de rapporttekst, en de twee
  beoordelingen X en Y (elk: labelset rf, primair risico rfp, onderbouwing).
- `irr/texts/<id>.txt`: de volledige rapporttekst. LEES DIE HELEMAAL; oordeel nooit alleen op de twee
  onderbouwingen, want die kunnen allebei selectief citeren.

## De zestien sleutels
cyber, humancap, digital, laws, macro, continuity, market, supplychain, financial, climate,
governance, culture, fraud, comms, hse, ma
(betekenissen als in het leesprotocol irr/PROMPT-blind.md: financial = financieel beheer en
rechtmatigheid, governance = sturing/verantwoording/verslaggeving, market = marktverandering en
concurrentie, ma = fusies en overnames, enzovoort)

## Beslisregels
1. Een label hoort er alleen in als het thema DUIDELIJK EN CENTRAAL in de tekst staat (dezelfde lat
   als "score 7 of hoger": duidelijk aanwezig en onderbouwd, liever 1 sterk label dan 3 zwakke).
2. Het primaire risico (rfp) is het thema dat de kern van het rapport vormt, niet het thema dat
   toevallig het eerst wordt genoemd.
3. Grensgeval financieel/governance: een auditrapport of verantwoordingsonderzoek waarvan de kern een
   financieel oordeel is (rechtmatigheid, jaarrekening, financieel beheer) heeft financial als kern;
   governance komt er alleen bij als het rapport zelf substantiele sturings- of
   verantwoordingsbevindingen bevat (onvolkomenheden in sturing, P&C-cyclus, taakverdeling), niet
   omdat elk auditrapport "over een organisatie gaat".
4. Je mag ook een MENGVORM kiezen als de tekst dat draagt: een eigen labelset die elementen van X en
   Y combineert. Motiveer dan per afwijking van beide.

## Uitvoer
Per id een bestand `irr/arbitrage/oordeel-<id>.json`:

```json
{
  "id": "I0031",
  "keuze": "X",            // "X", "Y" of "meng"
  "rf": ["…"],             // de labelset die jij juist acht (bij X of Y: letterlijk die set)
  "rfp": "…",              // = rf[0], of "" bij lege set
  "motivatie": "…"         // 2-4 zinnen: welke passages geven de doorslag, waarom wint deze lezing
}
```

Nederlands, professioneel, geen em-dashes. Verander niets anders dan je eigen oordeel-bestanden.

## Afronding
Meld per id kort: keuze en de kern van de doorslag (1 zin).
