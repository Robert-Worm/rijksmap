# Methode: ABD-benoemingsberichten uitlezen (per dienst/ministerie)

Herbruikbaar recept om per uitvoeringsdienst of directie de directeur + het
benoemingsbericht te vinden en als chip-paar (variant A: `dir` + `du`) in de
Rijksmap te zetten. Vervangt het losse web-zoeken, dat de ABD-berichten miste.

## Waarom niet gewoon zoeken / WebFetch
- Generieke websearch is US-geregionaliseerd en rankt de losse, gedateerde
  ABD-berichtpagina's zelden in de top -> je mist ze.
- Het ABD-nieuwsarchief is een **JavaScript-SPA**. `WebFetch` krijgt alleen het
  kale menu + footer terug, niet de resultatenlijst. Je moet de pagina laten
  **renderen in de browser** en dan de DOM uitlezen.

## De bron
Zoeken loopt via een simpele query-parameter (geen klikken nodig):

    https://www.algemenebestuursdienst.nl/actueel/nieuws?q=<zoekterm>

Bv. `?q=directeur+Dienst+Toeslagen`. Elk resultaat is een link
`/actueel/nieuws/JJJJ/MM/DD/slug` met titel + korte samenvatting + datum.

## Stappen (in de preview-browser, niet WebFetch)
1. Open een browser-tab op de zoek-URL met de juiste term. Goede termen:
   - per dienst: `directeur <Dienstnaam>` (bv. "directeur Dienst Toeslagen", "directeur Douane").
   - per ministerie/DG: `directeur-generaal <ministerie>` of `<DG-naam>`.
2. Lees de resultaten uit met dit script (retourneert titel, href, datum):

    ```js
    JSON.stringify([...document.querySelectorAll('a[href*="/actueel/nieuws/20"]')]
      .map(a=>{const t=a.textContent.replace(/\s+/g,' ').trim();
        const d=(t.match(/(\d{2}-\d{2}-\d{4})\s*$/)||[])[1]||"";
        return {titel:t.split('...')[0].slice(0,120), datum:d, href:a.getAttribute('href')};})
      .filter(x=>x.titel), null, 1)
    ```
3. Selecteer per directie het **meest recente** bericht met de functie
   "directeur <directienaam>". Let op:
   - "plaatsvervangend directeur" en "afdelingshoofd" tellen NIET als directeur
     -> als er alleen zo'n bericht is, krijgt de directie geen `dir`/`du`.
   - Nieuwere benoeming verdringt oudere (iemand kan zijn vertrokken).
   - **ACTUALITEIT VERIFIEREN (verplicht bij oudere hits).** De ABD-zoekmachine
     rankt op relevantie, NIET op datum -> je krijgt vaak een verouderde naam
     bovenaan. Werkwijze: haal eerst via de organogram-/organisatiepagina van de
     dienst de **huidige** directeursnaam op, en zoek dán in het ABD-archief het
     benoemingsbericht van díe naam. Voorbeeld (IND): ABD gaf Nijkamp (2022) voor
     Asiel & Bescherming, maar ind.nl-organogram noemt Coert Kleijwegt -> ABD-zoek
     op "Kleijwegt" gaf het juiste, actuele bericht (2025). Staat er geen naam op
     de organogram-pagina en is de enige ABD-hit oud (>~3 jaar), laat de directie
     dan plain (geen gok). Een recente ABD-hit (≈laatste 2 jaar) is doorgaans
     zelfverifiërend.
4. Vul in `AGENCY_DETAIL[...].units` het item aan tot
   `{"n":"...","dir":"Voornaam Achternaam","du":"https://www.algemenebestuursdienst.nl<href>"}`.
   Zet de volledige URL (met domein). Geen bericht gevonden = string laten staan.

## Framing en hygiene
- Toon "benoemd: <naam>", niet "huidige directeur" -> een benoemingsbericht is
  een momentopname; directeuren wisselen.
- Nooit een naam gokken. Geen bericht = geen pilletje.
- Straight quotes, geen em-dashes.

## Verificatie/oplevering
Zoals altijd: `node verify-ar.mjs` -> OK/0 fout/0 em-dashes; live check in de
preview (chip-paar rendert, link klopt); `cp rijksmap.html rijksmap-updated.html
&& cp rijksmap.html index.html`; regel(s) in de ministerie-tab van
`Rijksmap-verbeteringen.xlsx`.

## Voorbeeld: Dienst Toeslagen (7 directies, 6 gevonden)
Toeslagen=Nicole Back (ABD 10-04-2026) · UHT=Judith Elsinghorst (overtoeslagen
17-04-2026) · SR&B=Rens Nissen (ABD 27-06-2023) · C&R=Avinash Nandram (ABD
31-01-2025) · MM&C=Marcel de Graaf (ABD 11-03-2024) · ID=Arie Franke (ABD
30-06-2026). Bureau DG = alleen afdelingshoofd -> geen pilletje.
