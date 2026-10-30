import assert from "node:assert/strict";
import test from "node:test";
import { readdirSync } from "node:fs";
import { controleerNieuweStory, werklabelsVan } from "./backlog-lib.mjs";

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
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".mjs"))) {
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
