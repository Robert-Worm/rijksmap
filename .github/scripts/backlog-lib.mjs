// Regels voor backlog-items, los van de GitHub-aanroepen zodat ze te testen zijn.
// Overgenomen uit Omnibus (.github/scripts/backlog-lib.mjs), aangepast voor de Rijksmap.

/** De twee labels voor de werkverdeling, zoals Omnibus-besluit B-019. */
export const WERKLABELS = ["Opus 5.5", "ChatGPT Astra"];
export const PRIORITEITEN = ["P1", "P2", "P3"];
export const STATUSLABELS = ["klaar", "bezig", "wacht-op-ander", "wacht-op-beheerder", "gepauzeerd"];
const TOEGESTAAN = new Set([...WERKLABELS, ...PRIORITEITEN, ...STATUSLABELS, "story", "transitie", "huisstijl"]);

/**
 * Een nieuwe story moet een werklabel en precies één prioriteit hebben, criteria bevatten
 * en geen em-dash gebruiken (huisstijl van de Rijksmap).
 * Bestaande issues vallen hier niet onder: die hebben hun labels al op GitHub.
 */
export function controleerNieuweStory(story) {
  const labels = story.labels ?? [];
  if (!labels.some((l) => WERKLABELS.includes(l)))
    throw new Error(`Story ${story.id} mist een werklabel: geef ${WERKLABELS.join(" of ")} mee (B-019 van Omnibus).`);
  const onbekend = labels.filter((l) => !TOEGESTAAN.has(l));
  if (onbekend.length) throw new Error(`Story ${story.id} heeft een onbekend label: ${onbekend.join(", ")}.`);
  if (labels.filter((l) => PRIORITEITEN.includes(l)).length !== 1)
    throw new Error(`Story ${story.id} moet precies één prioriteit hebben (${PRIORITEITEN.join(", ")}).`);
  if (labels.filter((l) => STATUSLABELS.includes(l)).length > 1)
    throw new Error(`Story ${story.id} heeft meer dan één statuslabel.`);
  if (!Array.isArray(story.criteria) || story.criteria.length === 0)
    throw new Error(`Story ${story.id} heeft geen acceptatiecriteria.`);
  if (JSON.stringify(story).includes("\u2014"))
    throw new Error(`Story ${story.id} bevat een em-dash; de huisstijl verbiedt die.`);
}

/** De werklabels van een epic: alle werklabels die zijn stories gebruiken (B-019). */
export function werklabelsVan(epic) {
  return WERKLABELS.filter((w) => epic.stories.some((s) => (s.labels ?? []).includes(w)));
}

// ---------- Werkvolgorde (.github/backlog/volgorde.mjs) ----------

/** Bestanden in .github/backlog/ die een backlog zijn (niet de volgorde zelf). */
export const isBacklogBestand = (f) => f.endsWith(".mjs") && f !== "volgorde.mjs";

/** Alle stappen op volgorde, met fase, prioriteit en werk ingevuld. */
export function stappenOpVolgorde(volgorde) {
  const uit = [];
  for (const f of volgorde.fasen) for (const s of f.stappen)
    uit.push({ ...s, na: s.na ?? [], fase: f.fase, faseNaam: f.naam, prio: s.prio ?? f.prio, nr: uit.length + 1 });
  return uit;
}

/**
 * Controleert de volgorde tegen de backlogs. Gooit een fout met uitleg als er iets niet klopt:
 * een story ontbreekt of staat dubbel, een `na` verwijst naar iets onbekends of naar iets dat later komt.
 */
export function controleerVolgorde(volgorde, backlogs) {
  const stories = new Map();
  for (const b of backlogs) for (const e of b.epics) for (const s of e.stories) stories.set(s.id, s);
  const stappen = stappenOpVolgorde(volgorde);
  const positie = new Map();
  for (const s of stappen) {
    if (!stories.has(s.id)) throw new Error(`Volgorde noemt ${s.id}, maar die story bestaat niet.`);
    if (positie.has(s.id)) throw new Error(`Story ${s.id} staat twee keer in de volgorde.`);
    if (!PRIORITEITEN.includes(s.prio)) throw new Error(`Story ${s.id} heeft een onbekende prioriteit ${s.prio}.`);
    if (s.werk && !WERKLABELS.includes(s.werk)) throw new Error(`Story ${s.id} heeft een onbekend werklabel ${s.werk}.`);
    if (!s.waarom) throw new Error(`Story ${s.id} mist een reden (waarom) in de volgorde.`);
    positie.set(s.id, s.nr);
  }
  for (const id of stories.keys())
    if (!positie.has(id)) throw new Error(`Story ${id} staat niet in .github/backlog/volgorde.mjs. Geef hem een plek en herbeoordeel de volgorde.`);
  for (const s of stappen) for (const n of s.na) {
    if (!positie.has(n)) throw new Error(`Story ${s.id} wacht op ${n}, maar die bestaat niet.`);
    if (positie.get(n) >= s.nr) throw new Error(`Story ${s.id} wacht op ${n}, maar ${n} staat later in de volgorde.`);
  }
  if (JSON.stringify(volgorde).includes("\u2014")) throw new Error("De volgorde bevat een em-dash; de huisstijl verbiedt die.");
  return stappen;
}

/** Statuslabels die betekenen: nu niet oppakken. */
export const BLOKKEREND = ["bezig", "wacht-op-beheerder", "wacht-op-ander", "gepauzeerd"];

/**
 * Bepaalt per stap de stand en de gewenste labels.
 * @param stappen uit stappenOpVolgorde
 * @param stories Map id -> story uit de backlog (voor het standaard werklabel)
 * @param issues Map id -> { number, state, labels: string[] }
 */
export function bepaalStand(stappen, stories, issues) {
  const dicht = (id) => issues.get(id)?.state === "closed";
  return stappen.map((s) => {
    const issue = issues.get(s.id);
    const werk = s.werk ?? (stories.get(s.id)?.labels ?? []).find((l) => WERKLABELS.includes(l));
    const wachtOp = s.na.filter((n) => !dicht(n));
    const labels = issue?.labels ?? [];
    const blokkade = labels.find((l) => BLOKKEREND.includes(l));
    // Volgorde van wegen: gesloten, actief bezig of gepauzeerd, wacht op voorganger,
    // wacht op beheerder of andere assistent, anders klaar.
    let stand;
    if (!issue) stand = "nog geen issue";
    else if (issue.state === "closed") stand = "klaar en gesloten";
    else if (blokkade === "bezig" || blokkade === "gepauzeerd") stand = blokkade;
    else if (wachtOp.length) stand = "wacht";
    else if (blokkade) stand = blokkade;
    else stand = "klaar";
    return { ...s, issue, werk, wachtOp, stand, klaar: stand === "klaar" };
  });
}

/** Welke labels erbij en eraf moeten om een open issue gelijk te trekken met de volgorde. */
export function labelWijzigingen(regel) {
  if (!regel.issue || regel.issue.state === "closed") return { erbij: [], eraf: [] };
  const nu = new Set(regel.issue.labels);
  const gewenst = new Set([regel.prio, ...(regel.werk ? [regel.werk] : [])]);
  if (regel.klaar) gewenst.add("klaar");
  const beheerd = [...PRIORITEITEN, ...WERKLABELS, "klaar"];
  return {
    erbij: [...gewenst].filter((l) => !nu.has(l)),
    eraf: [...nu].filter((l) => beheerd.includes(l) && !gewenst.has(l)),
  };
}
