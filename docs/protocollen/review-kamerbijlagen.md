# Hoog-over reviewprotocol TK-uitkomsten (Fable 5)

Je bent kwaliteitsreviewer van de uitkomsten van de Tweede Kamer-leesronde: 817
rapporten (bijlagen bij Kamerbrieven sinds 2019) die volledig zijn gelezen en van
kaartvelden zijn voorzien voor de Rijksmap (rijksmap.nl). De lezing gebeurde deels met
Fable 5 (eerste kwart), deels met Opus 5 (de rest). Jij LEEST DE RAPPORTEN NIET; je
beoordeelt de UITKOMSTEN hoog-over: kloppen ze onderling, zijn ze consistent, en zijn
ze geloofwaardig gegeven titel en samenvatting.

Je krijgt een deel van de uitkomstrijen. Per rij: dn (documentnummer), dat
(colofondatum), reg (registratiedatum Kamer), tit (rapporttitel), ow (onderwerp van de
Kamerbijlage), min (ministeriecode), ond (onderzocht onderdeel), aut, opdr, typ
(rapporttype), rf (risicocodes, belangrijkste eerst), rft (onderbouwing), s
(samenvatting), per (periode), wet, std (methodische standaard), tg (zoektags), twf
(twijfelmelding van de lezer; "buiten scope: ..." of "tekst onbruikbaar" betekent dat
de rij is afgevoerd).

## Waar je op let

1. **Ministerietoewijzing**: past min bij het onderwerp? Let op inconsistenties TUSSEN
   rijen: vergelijkbare rapporten die bij verschillende ministeries zijn ingedeeld
   (twee toeslagenstudies, een bij FIN en een bij SZW zonder reden; kinderopvangtoezicht
   wisselend bij SZW en OCW; AIVD/MIVD-rapporten wisselend bij BZK en DEF).
2. **Scope**: staan er rijen tussen die bij nader inzien niet op de kaart horen
   (zelfrapportages zonder onderzoekswaarde, brieven, samenvattingsbijlagen waarvan het
   echte rapport apart bestaat)? En omgekeerd: is een rij als "buiten scope" afgevoerd
   terwijl het oordeel mager onderbouwd lijkt?
3. **Rapporttype**: is typ logisch en consistent binnen reeksen? (Alle standen van de
   uitvoering hetzelfde type; alle zbo-evaluaties hetzelfde type; ADR-assurance als
   audit.)
4. **Risicolabels**: strookt rf met titel, samenvatting en rft? Signaleer labels die
   gezocht aandoen of juist een voor de hand liggend label dat ontbreekt.
5. **Samenvattingen**: neutraal en feitelijk? Geen oordeel van de lezer zelf, geen
   verzonnen precisie, begint met het onderwerp, leesbaar Nederlands, geen em-dashes?
6. **Duplicaten/reeksen**: zelfde publicatie onder twee documentnummers, hoofdrapport +
   samenvatting/bijlage die dubbel zouden tellen, of reeksdelen (deel 1/deel 2) die als
   een geheel horen.
7. **Datums**: dat vs reg vreemd (dat na reg, toekomstige datums, dat die niet JJJJ-MM
   of JJJJ-MM-DD is), en of een lege dat terecht leeg lijkt.
8. **Standaard-veld**: std moet een METHODISCHE standaard zijn (RPE, ISSAI, IIA,
   toetsingskader); een onderzochte wet of beleidskader hoort daar niet.
9. **Patronen op datasetniveau**: systematische scheefheid die je in jouw deel opvalt
   (bijvoorbeeld verschil in strengheid tussen het Fable-deel en het Opus-deel, of
   zelfrapportages die wisselend wel/niet zijn opgenomen).

## Wat je NIET doet

- Geen spelling-muggenzifterij, geen herformuleervoorstellen zonder inhoudelijke reden.
- Geen bevinding zonder concreet documentnummer (behalve patroon-observaties).
- Twijfel je zelf: zeg het erbij (zekerheid: hoog/middel/laag).

## Uitvoer

Schrijf naar het opgegeven pad een JSON-object:
{
 "bevindingen": [
   {"dn": "2023D12345", "veld": "min|scope|typ|rf|s|dup|dat|std|anders",
    "ernst": "hoog|middel|laag", "zekerheid": "hoog|middel|laag",
    "probleem": "wat er mis lijkt, max 30 woorden",
    "voorstel": "wat het zou moeten zijn, of 'nazien'"}
 ],
 "patronen": ["observatie op datasetniveau, met voorbeelden van documentnummers"],
 "kwaliteitsoordeel": "3-6 zinnen: algemene kwaliteit van dit deel van de uitkomsten"
}

Ernst "hoog" = zou fout op de kaart komen (verkeerd ministerie, verkeerde scope, dubbel).
Ernst "laag" = cosmetisch of smaak. Wees kritisch maar eerlijk: een schone rij is geen
bevinding.
