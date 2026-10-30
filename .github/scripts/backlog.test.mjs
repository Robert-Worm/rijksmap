import assert from "node:assert/strict";
import test from "node:test";
import { readdirSync } from "node:fs";
import { controleerNieuweStory, werklabelsVan, isBacklogBestand, controleerVolgorde, stappenOpVolgorde, bepaalStand, labelWijzigingen } from "./backlog-lib.mjs";

const story = (id, labels, extra = {}) => ({ id, labels, criteria: ["iets"], ...extra });

test("een story zonder werklabel of met een onbekend label wordt geweigerd", () => {
  assert.throws(() => controleerNieuweStory(story("X-1", ["P1"])), /mist een werklabel/);
  assert.throws(() => controleerNieuweStory(story("X-2", ["Opus 5.5", "Opus", "P1"])), /onbekend label: Opus/);
  assert.doesNotThrow(() => controleerNieuweStory(story("X-3", ["Opus 5.5", "P1"])));
});

test("een story heeft precies één prioriteit, criteria en geen em-dash", () => {
  assert.throws(() => controleerNieuweStory(story("X-4", ["Opus 5.5"])), /precies één prioriteit/);
  assert.throws(() => controleerNieuweStory(story("X-5", ["Opus 5.5", "P1", "P2"])), /precies één prioriteit/);
  assert.throws(() => controleerNieuweStory(story("X-6", ["Opus 5.5", "P1"], { criteria: [] })), /acceptatiecriteria/);
  assert.throws(() => controleerNieuweStory(story("X-7", ["Opus 5.5", "P1"], { titel: "a \u2014 b" })), /em-dash/);
  assert.throws(() => controleerNieuweStory(story("X-8", ["Opus 5.5", "P1", "klaar", "bezig"])), /statuslabel/);
});

test("een epic krijgt de werklabels van zijn stories", () => {
  const epic = { stories: [story("A", ["ChatGPT Astra", "P1"]), story("B", ["Opus 5.5", "P2"])] };
  assert.deepEqual(werklabelsVan(epic), ["Opus 5.5", "ChatGPT Astra"]);
});

test("alle backlogbestanden zijn geldig", async () => {
  const dir = new URL("../backlog/", import.meta.url);
  const ids = new Set();
  for (const f of readdirSync(dir).filter(isBacklogBestand)) {
    const b = (await import(new URL(f, dir))).default;
    for (const e of b.epics) {
      assert.match(e.id, /^EP-[A-Z]\d+$/, `epic-id ${e.id}`);
      assert.ok(!ids.has(e.id), `dubbel id ${e.id}`); ids.add(e.id);
      assert.ok(e.stories.length >= 3 && e.stories.length <= 8, `${e.id} heeft ${e.stories.length} stories (3 tot 8)`);
      assert.ok(!JSON.stringify(e).includes("\u2014"), `${e.id} bevat een em-dash`);
      for (const s of e.stories) {
        assert.ok(!ids.has(s.id), `dubbel id ${s.id}`); ids.add(s.id);
        controleerNieuweStory(s);
      }
    }
  }
});

async function laadAlles() {
  const dir = new URL("../backlog/", import.meta.url);
  const backlogs = [];
  for (const f of readdirSync(dir).filter(isBacklogBestand).sort()) backlogs.push((await import(new URL(f, dir))).default);
  const volgorde = (await import(new URL("volgorde.mjs", dir))).default;
  return { backlogs, volgorde };
}

test("elke story staat precies één keer in de werkvolgorde, na zijn voorgangers", async () => {
  const { backlogs, volgorde } = await laadAlles();
  const stappen = controleerVolgorde(volgorde, backlogs);
  const aantal = backlogs.reduce((n, b) => n + b.epics.reduce((m, e) => m + e.stories.length, 0), 0);
  assert.equal(stappen.length, aantal);
});

test("de volgorde weigert een ontbrekende, dubbele of verkeerd geplaatste story", () => {
  const backlogs = [{ epics: [{ stories: [{ id: "A" }, { id: "B" }] }] }];
  const fase = (stappen) => ({ fasen: [{ fase: 0, naam: "x", prio: "P1", stappen }] });
  const s = (id, extra = {}) => ({ id, waarom: "reden", ...extra });
  assert.throws(() => controleerVolgorde(fase([s("A")]), backlogs), /B staat niet in/);
  assert.throws(() => controleerVolgorde(fase([s("A"), s("B"), s("A")]), backlogs), /twee keer/);
  assert.throws(() => controleerVolgorde(fase([s("A", { na: ["B"] }), s("B")]), backlogs), /later in de volgorde/);
  assert.throws(() => controleerVolgorde(fase([s("A", { na: ["X"] }), s("B")]), backlogs), /bestaat niet/);
  assert.throws(() => controleerVolgorde(fase([s("A"), { id: "B" }]), backlogs), /mist een reden/);
  assert.equal(controleerVolgorde(fase([s("A"), s("B", { na: ["A"] })]), backlogs).length, 2);
});

test("klaar volgt uit de voorgangers; blokkerende labels winnen", () => {
  const stappen = stappenOpVolgorde({ fasen: [{ fase: 0, naam: "x", prio: "P1", stappen: [
    { id: "A", waarom: "r" }, { id: "B", na: ["A"], waarom: "r" }, { id: "C", waarom: "r", prio: "P3", werk: "Opus 5.5" },
  ] }] });
  const stories = new Map([["A", { labels: ["ChatGPT Astra"] }], ["B", { labels: ["ChatGPT Astra"] }], ["C", { labels: ["ChatGPT Astra"] }]]);
  const issues = new Map([
    ["A", { number: 1, state: "open", labels: ["P2", "ChatGPT Astra"] }],
    ["B", { number: 2, state: "open", labels: ["P1", "ChatGPT Astra", "klaar"] }],
    ["C", { number: 3, state: "open", labels: ["P1", "ChatGPT Astra", "wacht-op-beheerder"] }],
  ]);
  const [a, b, c] = bepaalStand(stappen, stories, issues);
  assert.equal(a.stand, "klaar");
  assert.equal(b.stand, "wacht");
  assert.equal(c.stand, "wacht-op-beheerder");
  assert.deepEqual(labelWijzigingen(a), { erbij: ["P1", "klaar"], eraf: ["P2"] });
  assert.deepEqual(labelWijzigingen(b), { erbij: [], eraf: ["klaar"] });
  assert.deepEqual(labelWijzigingen(c), { erbij: ["P3", "Opus 5.5"], eraf: ["P1", "ChatGPT Astra"] });
  issues.get("B").labels.push("wacht-op-beheerder");
  assert.equal(bepaalStand(stappen, stories, issues)[1].stand, "wacht", "eerst de voorganger, dan pas de beheerder");
  issues.get("B").labels.pop();
  issues.get("A").state = "closed";
  const [, b2] = bepaalStand(stappen, stories, issues);
  assert.equal(b2.stand, "klaar");
  assert.deepEqual(labelWijzigingen(bepaalStand(stappen, stories, issues)[0]), { erbij: [], eraf: [] });
});
