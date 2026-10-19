# Onderbouwing schrijven bij vaststaande labels

Voor 29 rapporten uit corpus 2 staan de risicolabels vast: die zijn na een tekstcontrole bevestigd en
veranderen niet. Wat ontbreekt is een onderbouwing van de huidige kwaliteit. Jij leest het rapport en
schrijft die onderbouwing.

## Invoer
- `irr/kaart-wint2.json`: per rapport het id, de titel, de vaste labelset `rf`, het hoofdlabel `rfp`
  en de zekerheid `rfv`. Die vier velden liggen vast en neem je letterlijk over.
- `irr/texts2/<id>.txt`: de volledige rapporttekst. Lees die helemaal; grote teksten in blokken van
  hooguit 900 regels. Oordeel alleen op de tekst, raadpleeg verder niets.

## Uitvoer
Per rapport een bestand `irr/rfo2/<id>.json`:

```json
{
  "id": "J0040",
  "rfo": "…"
}
```

## Hoe de onderbouwing eruit moet zien
Dit is de vaste vorm in de kaart, houd je daaraan:
- **2 tot 4 zinnen, ongeveer 400 tot 900 tekens.** Mediaan in de kaart is 600 tekens.
- **Beschrijvend en feitelijk**, in de derde persoon, geen aanbevelingen aan de lezer, geen
  waardeoordeel over het rapport zelf.
- **Concreet**: noem bevindingen, bedragen, percentages, aantallen, jaartallen of oordelen die
  daadwerkelijk in de tekst staan. Nooit iets verzinnen of afronden wat er niet staat.
- **Leg de labels uit zonder ze op te sommen als lijstje.** Laat uit de beschreven bevindingen
  blijken waarom die thema's centraal staan. Je mag een thema bij naam noemen als dat natuurlijk
  loopt, bijvoorbeeld "en raakt daarmee de sturing en verantwoording".
- **Begin met waar het rapport over gaat en wat het onderzoekt**, daarna de bevindingen die de
  labels dragen.
- Nederlands, professioneel, geen em-dashes (gebruik komma's), geen aanhalingstekens rond hele
  zinnen.

## Wat er NIET in mag
- Geen enkele verwijzing naar beoordelingen, beoordelaars, labels die zijn afgevallen, arbitrage,
  modellen of naar dit proces. De lezer van de kaart ziet alleen een risicobeschrijving bij een
  rapport en hoort niets te merken van hoe die tot stand kwam.
- Geen zinnen als "het label governance is terecht" of "de labelset dekt".
- Geen samenvatting van de opdrachtgever of de onderzoeksmethode als dat de bevindingen verdringt.

## Afronding
Meld per id kort: gelezen, en de eerste zes woorden van je onderbouwing.
