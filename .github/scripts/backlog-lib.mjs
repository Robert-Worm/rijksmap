// Regels voor backlog-items, los van de GitHub-aanroepen zodat ze te testen zijn.
// Overgenomen uit Omnibus (.github/scripts/backlog-lib.mjs), aangepast voor de Rijksmap.

/** De twee labels voor de werkverdeling, zoals Omnibus-besluit B-019. */
export const WERKLABELS = ["Opus 5.5", "ChatGPT Astra"];
export const PRIORITEITEN = ["P1", "P2", "P3"];
export const STATUSLABELS = ["klaar", "bezig", "wacht-op-ander", "wacht-op-beheerder", "gepauzeerd"];
const TOEGESTAAN = new Set([...WERKLABELS, ...PRIORITEITEN, ...STATUSLABELS, "story", "transitie"]);

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
