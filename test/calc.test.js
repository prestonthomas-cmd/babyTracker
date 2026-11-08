// Run with: node --test test/
const test = require("node:test");
const assert = require("node:assert");
require("../js/data.js");
require("../js/calc.js");
const C = globalThis.BabyCalc, D = globalThis.BabyData;

test("week counting from due date", () => {
  const s = C.babyStatus({ dueDate: "2027-01-01" }, "2026-10-01"); // 92 days left
  assert.strictEqual(s.stage, "expecting");
  assert.strictEqual(s.daysLeft, 92);
  assert.strictEqual(s.gestDays, 188);
  assert.strictEqual(s.week, 26);
  assert.strictEqual(s.day, 6);
  assert.strictEqual(s.trimester, 2);
});

test("overdue babies", () => {
  const s = C.babyStatus({ dueDate: "2026-11-01" }, "2026-11-05");
  assert.strictEqual(s.overdue, true);
  assert.strictEqual(s.daysLeft, -4);
  assert.strictEqual(s.progress, 1);
});

test("due date from weeks along round-trips", () => {
  const due = C.dueDateFromProgress(12, 3, "2026-11-08");
  const s = C.babyStatus({ dueDate: due }, "2026-11-08");
  assert.strictEqual(s.week, 12);
  assert.strictEqual(s.day, 3);
});

test("born babies report age", () => {
  const s = C.babyStatus({ born: true, birthDate: "2026-08-01", dueDate: "2026-08-10" }, "2026-11-08");
  assert.deepStrictEqual(s, { stage: "born", ageDays: 99 });
  assert.strictEqual(C.formatAge(5), "5 days");
  assert.strictEqual(C.formatAge(20), "2 weeks");
  assert.strictEqual(C.formatAge(99), "3 months");
  assert.strictEqual(C.formatAge(800), "2 years 2 months");
});

test("every theme covers every week", () => {
  for (const key of Object.keys(D.THEMES)) {
    for (let w = D.FIRST_WEEK; w <= D.LAST_WEEK; w++) {
      const s = D.sizeForWeek(key, w);
      assert.ok(s && s.name && s.emoji, key + " week " + w);
    }
    assert.strictEqual(D.sizeForWeek(key, 3), null);
    assert.strictEqual(D.sizeForWeek(key, 42).week, 40);
  }
});

test("unit formatting", () => {
  assert.strictEqual(C.formatWeight(3462, "metric"), "3.46 kg");
  assert.strictEqual(C.formatWeight(3462, "imperial"), "7 lb 10 oz");
  assert.strictEqual(C.formatWeight(453.4, "imperial"), "1 lb 0 oz");
  assert.strictEqual(C.formatLength(0.5, "metric"), "5 mm");
  assert.strictEqual(C.formatLength(51.2, "imperial"), "20.2 in");
});
