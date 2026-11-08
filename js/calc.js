/* Pure date / pregnancy math. No DOM access, so it can be unit-tested in Node. */
(function (global) {
  "use strict";

  var DAY_MS = 86400000;
  var FULL_TERM_DAYS = 280; // 40 weeks

  // Convert "YYYY-MM-DD" (or a Date) to a whole day number, ignoring time zones.
  function toDayNumber(value) {
    if (value instanceof Date) {
      return Math.floor(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()) / DAY_MS);
    }
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
    if (!m) return null;
    return Math.floor(Date.UTC(+m[1], +m[2] - 1, +m[3]) / DAY_MS);
  }

  function fromDayNumber(n) {
    var d = new Date(n * DAY_MS);
    var mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    var dd = String(d.getUTCDate()).padStart(2, "0");
    return d.getUTCFullYear() + "-" + mm + "-" + dd;
  }

  // Due date from how far along someone is today.
  function dueDateFromProgress(weeks, days, today) {
    var gest = (Number(weeks) || 0) * 7 + (Number(days) || 0);
    return fromDayNumber(toDayNumber(today || new Date()) + (FULL_TERM_DAYS - gest));
  }

  function trimesterFor(week) {
    if (week < 14) return 1;
    if (week < 28) return 2;
    return 3;
  }

  // Everything the UI needs to know about a baby's progress today.
  function babyStatus(baby, today) {
    var t = toDayNumber(today || new Date());
    if (baby.born && baby.birthDate) {
      var birth = toDayNumber(baby.birthDate);
      return { stage: "born", ageDays: Math.max(0, t - birth) };
    }
    var due = toDayNumber(baby.dueDate);
    if (due === null) return { stage: "unknown" };
    var gestDays = FULL_TERM_DAYS - (due - t);
    if (gestDays < 0) return { stage: "unknown" };
    var week = Math.floor(gestDays / 7);
    return {
      stage: "expecting",
      gestDays: gestDays,
      week: week,
      day: gestDays % 7,
      trimester: trimesterFor(week),
      daysLeft: due - t,
      overdue: due - t < 0,
      progress: Math.min(1, gestDays / FULL_TERM_DAYS)
    };
  }

  function plural(n, word) { return n + " " + word + (n === 1 ? "" : "s"); }

  // Friendly age: "4 days", "6 weeks", "5 months", "1 year 3 months".
  function formatAge(days) {
    if (days < 14) return plural(days, "day");
    if (days < 91) return plural(Math.floor(days / 7), "week");
    var months = Math.floor(days / 30.4375);
    if (months < 24) return plural(months, "month");
    var years = Math.floor(months / 12), rem = months % 12;
    return plural(years, "year") + (rem ? " " + plural(rem, "month") : "");
  }

  function formatLength(cm, units) {
    if (units === "imperial") {
      var inches = cm / 2.54;
      return (inches < 1 ? inches.toFixed(2) : inches.toFixed(1)) + " in";
    }
    return (cm < 1 ? (cm * 10).toFixed(0) + " mm" : cm.toFixed(1) + " cm");
  }

  function formatWeight(g, units) {
    if (g < 1) return units === "imperial" ? "< 0.04 oz" : "< 1 g";
    if (units === "imperial") {
      var oz = g / 28.3495;
      if (oz < 15.95) return oz.toFixed(oz < 1 ? 2 : 1) + " oz";
      var totalOz = Math.round(oz);
      return Math.floor(totalOz / 16) + " lb " + (totalOz % 16) + " oz";
    }
    return g < 1000 ? Math.round(g) + " g" : (g / 1000).toFixed(2) + " kg";
  }

  global.BabyCalc = {
    FULL_TERM_DAYS: FULL_TERM_DAYS,
    toDayNumber: toDayNumber,
    fromDayNumber: fromDayNumber,
    dueDateFromProgress: dueDateFromProgress,
    trimesterFor: trimesterFor,
    babyStatus: babyStatus,
    formatAge: formatAge,
    formatLength: formatLength,
    formatWeight: formatWeight
  };
})(typeof window !== "undefined" ? window : globalThis);
