// Houdt de werkvolgorde bij op GitHub, uit .github/backlog/volgorde.mjs:
// - zet op elke open story de prioriteit (P1-P3) en het werklabel uit de volgorde;
// - zet `klaar` op een story waarvan alle voorgangers gesloten zijn, en haalt het weg als dat niet zo is
//   (een story met bezig, wacht-op-beheerder, wacht-op-ander of gepauzeerd krijgt nooit `klaar`);
// - werkt het issue "Werkvolgorde" bij: per fase de stories op volgorde, met stand en reden.
// Met DROOG=1 schrijft het niets en drukt het alleen af wat het zou doen.
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { controleerVolgorde, bepaalStand, labelWijzigingen, isBacklogBestand, WERKLABELS } from "./backlog-lib.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const repo = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;
const droog = process.env.DROOG === "1";
if (!repo || !token) throw new Error("GITHUB_REPOSITORY en GITHUB_TOKEN zijn nodig.");

async function gh(path, options = {}) {
  const res = await fetch(`https://api.github.com/repos/${repo}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", ...(options.headers || {}) },
  });
  if (!res.ok) throw new Error(`GitHub ${options.method || "GET"} ${path}: ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}
const schrijf = (path, options) => (droog ? (console.log(`[droog] ${options.method} ${path} ${options.body ?? ""}`), null) : gh(path, options));

// Backlog en volgorde inlezen en controleren.
const dir = join(root, ".github", "backlog");
const backlogs = [];
for (const f of readdirSync(dir).filter(isBacklogBestand).sort()) backlogs.push((await import(pathToFileURL(join(dir, f)))).default);
const volgorde = (await import(pathToFileURL(join(dir, "volgorde.mjs")))).default;
const stappen = controleerVolgorde(volgorde, backlogs);
const stories = new Map();
for (const b of backlogs) for (const e of b.epics) for (const s of e.stories) stories.set(s.id, s);

// Issues van de backlog ophalen (open en gesloten).
const issues = new Map();
for (let page = 1; ; page++) {
  const batch = await gh(`/issues?labels=story&state=all&per_page=100&page=${page}`);
  for (const i of batch) {
    const m = (i.body || "").match(/<!-- backlog:([\w-]+) -->/);
    if (m) issues.set(m[1], { number: i.number, state: i.state, title: i.title, labels: i.labels.map((l) => l.name) });
  }
  if (batch.length < 100) break;
}

// Labels gelijktrekken.
const regels = bepaalStand(stappen, stories, issues);
let gewijzigd = 0;
for (const r of regels) {
  const { erbij, eraf } = labelWijzigingen(r);
  if (erbij.length) await schrijf(`/issues/${r.issue.number}/labels`, { method: "POST", body: JSON.stringify({ labels: erbij }) });
  for (const l of eraf) await schrijf(`/issues/${r.issue.number}/labels/${encodeURIComponent(l)}`, { method: "DELETE" });
  if (erbij.length || eraf.length) { gewijzigd++; console.log(`#${r.issue.number} ${r.id}: +[${erbij}] -[${eraf}]`); }
}

// Overzicht opbouwen.
const nr = (id) => (issues.get(id) ? `#${issues.get(id).number}` : id);
const STAND = {
  "klaar en gesloten": "✅ afgerond", klaar: "🟢 klaar om op te pakken", wacht: "⏳ wacht op voorganger",
  bezig: "🔵 bezig", "wacht-op-beheerder": "👤 wacht op beheerder", "wacht-op-ander": "⏳ wacht op andere assistent",
  gepauzeerd: "⏸️ gepauzeerd", "nog geen issue": "· nog geen issue",
};
const cel = (t) => String(t).replace(/\|/g, "\\|").replace(/\n/g, " ");
const titel = (r) => (r.issue ? r.issue.title.replace(/^\[[^\]]+\]\s*/, "") : stories.get(r.id)?.titel ?? r.id);
const regel = (r) => `- ${nr(r.id)} ${cel(titel(r))}`;

const open = regels.filter((r) => r.issue?.state !== "closed");
const regelsUit = [
  "<!-- werkvolgorde -->",
  `**Werkvolgorde van de Rijksmap** · herbeoordeeld op ${volgorde.herbeoordeeld} · automatisch bijgewerkt`,
  "",
  "Werk de lijst van boven naar beneden af. Pak de bovenste story met **jouw werklabel** en **🟢 klaar**, en zet hem op `bezig`. Een story wordt pas klaar als alles waar hij op wacht gesloten is. De volgorde en de redenen staan in [`.github/backlog/volgorde.mjs`](../blob/main/.github/backlog/volgorde.mjs); een nieuwe story moet daar een plek krijgen, anders faalt de controle.",
  "",
  "### Nu op te pakken",
  ...WERKLABELS.map((w) => {
    const lijst = open.filter((r) => r.klaar && r.werk === w).slice(0, 3);
    return `- **${w}:** ${lijst.length ? lijst.map((r) => `${nr(r.id)} ${cel(titel(r))}`).join(" · ") : "niets klaar; wacht op voorgangers"}`;
  }),
  `- **Beheerder:** ${open.filter((r) => r.stand === "wacht-op-beheerder").map((r) => `${nr(r.id)} ${cel(titel(r))}`).join(" · ") || "niets"}`,
  "",
  `Voortgang: ${regels.length - open.length} van ${regels.length} stories afgerond.`,
];
for (const f of volgorde.fasen) {
  const inFase = regels.filter((r) => r.fase === f.fase);
  const af = inFase.filter((r) => r.issue?.state === "closed").length;
  regelsUit.push("", `### Fase ${f.fase} · ${f.naam} (${af}/${inFase.length})`, `*${f.doel}*`, "",
    "| Nr | Story | Werk | Prio | Stand | Wacht op | Waarom hier |", "| ---: | --- | --- | --- | --- | --- | --- |");
  for (const r of inFase)
    regelsUit.push(`| ${r.nr} | ${nr(r.id)} ${cel(titel(r))} | ${r.werk ?? ""} | ${r.prio} | ${STAND[r.stand] ?? r.stand} | ${r.wachtOp.map(nr).join(", ")} | ${cel(r.waarom)} |`);
}
const body = regelsUit.join("\n");

// Het overzichtsissue maken of bijwerken.
const bestaand = (await gh("/issues?labels=werkvolgorde&state=open&per_page=10")).find((i) => (i.body || "").includes("<!-- werkvolgorde -->"));
if (!bestaand) {
  const nieuw = await schrijf("/issues", { method: "POST", body: JSON.stringify({ title: "Werkvolgorde", body, labels: ["werkvolgorde"] }) });
  console.log(`Overzicht aangemaakt${nieuw ? ` als #${nieuw.number}` : ""}.`);
} else if (bestaand.body !== body) {
  await schrijf(`/issues/${bestaand.number}`, { method: "PATCH", body: JSON.stringify({ body }) });
  console.log(`Overzicht #${bestaand.number} bijgewerkt.`);
} else console.log(`Overzicht #${bestaand.number} was al actueel.`);
console.log(`${gewijzigd} issues kregen andere labels.`);
if (droog) console.log("\n" + body);
