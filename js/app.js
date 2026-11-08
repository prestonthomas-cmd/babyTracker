(function () {
  "use strict";

  var D = window.BabyData, C = window.BabyCalc;
  var STORE_KEY = "bumpcrew.v1";

  // ---------- State & storage ----------
  var state = load();
  var view = { filter: "all", search: "", sort: "due" };

  function load() {
    var fallback = { babies: [], theme: "fruit", units: "imperial" };
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return fallback;
      var parsed = JSON.parse(raw);
      return {
        babies: Array.isArray(parsed.babies) ? parsed.babies : [],
        theme: D.THEMES[parsed.theme] ? parsed.theme : "fruit",
        units: parsed.units === "metric" ? "metric" : "imperial"
      };
    } catch (e) {
      return fallback;
    }
  }

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  // ---------- Helpers ----------
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function prettyDate(iso) {
    var n = C.toDayNumber(iso);
    if (n === null) return "";
    return new Date(n * 86400000).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  }

  function themeOf(baby) { return D.THEMES[baby.theme] ? baby.theme : state.theme; }

  function displayName(baby) {
    if (baby.name) return baby.name;
    var last = (baby.parents || "").trim().split(/\s+/).pop();
    return last ? "Baby " + last : "Baby";
  }

  function dueKey(baby) {
    // Born babies sort after everyone still on the way, most recent birthday first.
    if (baby.born) return 1e7 - (C.toDayNumber(baby.birthDate) || 0);
    var n = C.toDayNumber(baby.dueDate);
    return n === null ? 9e6 : n;
  }

  // ---------- Rendering ----------
  function renderThemeChips() {
    $("#themeChips").innerHTML = Object.keys(D.THEMES).map(function (key) {
      var t = D.THEMES[key];
      return '<button type="button" class="chip" role="radio" data-theme="' + key + '" aria-checked="' +
        (key === state.theme) + '">' + t.emoji + " " + esc(t.label) + "</button>";
    }).join("");
    $$(".seg [data-units]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.units === state.units)); });
  }

  function cardHTML(baby) {
    var st = C.babyStatus(baby);
    var head, body;
    var tag = '<span class="tag">' + esc(baby.relation || "Friend") + "</span>";

    if (st.stage === "born") {
      head = '<div class="size-emoji" aria-hidden="true">👶</div>';
      body =
        '<p class="size-line">🎉 <strong>Arrived!</strong> ' + esc(C.formatAge(st.ageDays)) + " old</p>" +
        '<p class="stats">Born ' + esc(prettyDate(baby.birthDate)) + (baby.birthWeight ? " · " + esc(baby.birthWeight) : "") + "</p>";
    } else if (st.stage === "expecting") {
      var size = D.sizeForWeek(themeOf(baby), st.week);
      head = '<div class="size-emoji" aria-hidden="true">' + (size ? size.emoji : "✨") + "</div>";
      var sizeLine = size
        ? 'Size of a <strong>' + esc(size.name.toLowerCase()) + "</strong>"
        : "<strong>Just getting started</strong>";
      var stats = size && size.week >= 8
        ? esc(C.formatLength(size.lengthCm, state.units)) + " · " + esc(C.formatWeight(size.weightG, state.units))
        : "Too tiny to weigh yet";
      var left = st.overdue
        ? '<span class="overdue">' + Math.abs(st.daysLeft) + " days past due</span>"
        : st.daysLeft + " days to go";
      body =
        '<p class="size-line">' + sizeLine + "</p>" +
        '<p class="stats">Week ' + st.week + (st.day ? " + " + st.day + "d" : "") + " · Trimester " + st.trimester + " · " + stats + "</p>" +
        '<div><div class="bar tri-' + st.trimester + '" role="progressbar" aria-valuemin="0" aria-valuemax="40" aria-valuenow="' + st.week +
        '" aria-label="Pregnancy progress"><span style="width:' + (st.progress * 100).toFixed(1) + '%"></span></div>' +
        '<div class="bar-meta"><span>' + left + "</span><span>Due " + esc(prettyDate(baby.dueDate)) + "</span></div></div>";
    } else {
      head = '<div class="size-emoji" aria-hidden="true">❔</div>';
      body = '<p class="stats">Add a due date to see progress.</p>';
    }

    return '<button type="button" class="card" data-id="' + esc(baby.id) + '">' +
      '<div class="card-top">' + head + "<div><h3>" + esc(displayName(baby)) + "</h3>" +
      '<p class="parents">' + esc(baby.parents) + "</p>" + tag + "</div></div>" + body + "</button>";
  }

  function render() {
    renderThemeChips();
    var all = state.babies;
    var counts = {
      all: all.length,
      expecting: all.filter(function (b) { return !b.born; }).length,
      born: all.filter(function (b) { return b.born; }).length
    };
    $$("[data-count]").forEach(function (el) { el.textContent = counts[el.dataset.count] ? "(" + counts[el.dataset.count] + ")" : ""; });
    $$("#filterTabs [data-filter]").forEach(function (b) { b.setAttribute("aria-selected", String(b.dataset.filter === view.filter)); });

    var q = view.search.trim().toLowerCase();
    var list = all.filter(function (b) {
      if (view.filter === "expecting" && b.born) return false;
      if (view.filter === "born" && !b.born) return false;
      if (!q) return true;
      return (displayName(b) + " " + (b.parents || "") + " " + (b.relation || "")).toLowerCase().indexOf(q) !== -1;
    });

    list.sort(function (a, b) {
      if (view.sort === "name") return displayName(a).localeCompare(displayName(b));
      if (view.sort === "added") return (b.createdAt || 0) - (a.createdAt || 0);
      return dueKey(a) - dueKey(b);
    });

    $("#empty").hidden = all.length > 0;
    $("#grid").innerHTML = list.length
      ? list.map(cardHTML).join("")
      : (all.length ? '<p class="muted">No babies match that search.</p>' : "");
  }

  // ---------- Detail dialog ----------
  function openDetail(id) {
    var baby = findBaby(id);
    if (!baby) return;
    var st = C.babyStatus(baby);
    var themeKey = themeOf(baby);
    var size = st.stage === "expecting" ? D.sizeForWeek(themeKey, st.week) : null;
    var html = '<div class="detail-head"><div class="size-emoji" aria-hidden="true">' +
      (st.stage === "born" ? "👶" : size ? size.emoji : "✨") + "</div><div><h2>" + esc(displayName(baby)) +
      '</h2><p class="parents muted" style="margin:0">' + esc(baby.parents) + " · " + esc(baby.relation || "Friend") + "</p></div></div>";

    var facts = [];
    if (st.stage === "born") {
      facts.push(["Age", C.formatAge(st.ageDays)], ["Birthday", prettyDate(baby.birthDate)]);
      if (baby.birthWeight) facts.push(["Birth weight", baby.birthWeight]);
    } else if (st.stage === "expecting") {
      facts.push(["Week", st.week + (st.day ? " + " + st.day + "d" : "")], ["Trimester", String(st.trimester)],
        [st.overdue ? "Past due" : "Days to go", Math.abs(st.daysLeft) + " days"], ["Due date", prettyDate(baby.dueDate)]);
      if (size) {
        facts.push(["Size of a", size.name]);
        if (size.week >= 8) facts.push(["Approx. length", C.formatLength(size.lengthCm, state.units)], ["Approx. weight", C.formatWeight(size.weightG, state.units)]);
      }
    }
    html += '<div class="facts">' + facts.map(function (f) {
      return '<div class="fact"><span>' + esc(f[0]) + "</span><b>" + esc(f[1]) + "</b></div>";
    }).join("") + "</div>";

    if (baby.notes) html += '<p class="notes">' + esc(baby.notes) + "</p>";

    if (st.stage === "expecting") {
      html += '<p class="journey-title">The journey in ' + esc(D.THEMES[themeKey].label) + "</p><div class=\"journey\">";
      for (var w = D.FIRST_WEEK; w <= D.LAST_WEEK; w++) {
        var s = D.sizeForWeek(themeKey, w);
        var cls = w < st.week ? "past" : w === Math.min(st.week, D.LAST_WEEK) ? "now" : "";
        html += '<div class="wk ' + cls + '"' + (cls === "now" ? ' aria-current="step"' : "") + '><span class="w">Wk ' + w +
          '</span><span class="e" aria-hidden="true">' + s.emoji + '</span><span class="n">' + esc(s.name) + "</span></div>";
      }
      html += "</div>";
    }

    html += '<div class="dialog-actions">' +
      '<button class="btn danger" type="button" data-action="delete">Remove</button><span class="spacer"></span>' +
      (st.stage !== "born" ? '<button class="btn" type="button" data-action="born">🎉 Baby arrived!</button>' : "") +
      '<button class="btn" type="button" data-action="edit">Edit</button>' +
      '<button class="btn primary" type="button" data-action="close">Done</button></div>';

    var body = $("#detailBody");
    body.innerHTML = html;
    body.dataset.id = baby.id;
    var dlg = $("#detailDialog");
    if (!dlg.open) dlg.showModal();
    var now = $(".wk.now", body);
    if (now) now.scrollIntoView({ inline: "center", block: "nearest" });
  }

  $("#detailBody").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-action]");
    if (!btn) return;
    var id = $("#detailBody").dataset.id;
    var action = btn.dataset.action;
    if (action === "close") $("#detailDialog").close();
    if (action === "edit") { $("#detailDialog").close(); openForm(id); }
    if (action === "born") { $("#detailDialog").close(); openForm(id, { markBorn: true }); }
    if (action === "delete") {
      var baby = findBaby(id);
      if (baby && confirm("Remove " + displayName(baby) + " from your list?")) {
        state.babies = state.babies.filter(function (b) { return b.id !== id; });
        save(); render();
        $("#detailDialog").close();
      }
    }
  });

  // ---------- Add / edit form ----------
  var form = $("#babyForm");
  form.elements.theme.innerHTML = '<option value="">Use my default</option>' + Object.keys(D.THEMES).map(function (k) {
    return '<option value="' + k + '">' + D.THEMES[k].emoji + " " + esc(D.THEMES[k].label) + "</option>";
  }).join("");

  function findBaby(id) { return state.babies.filter(function (b) { return b.id === id; })[0]; }

  function syncFormVisibility() {
    var born = form.elements.born.value === "yes";
    $('[data-when="expecting"]', form).hidden = born;
    $('[data-when="born"]', form).hidden = !born;
    var byWeeks = form.elements.dating.value === "weeks";
    $('[data-dating="due"]', form).hidden = byWeeks;
    $('[data-dating="weeks"]', form).hidden = !byWeeks;
  }
  form.addEventListener("change", syncFormVisibility);

  function openForm(id, opts) {
    opts = opts || {};
    var baby = id ? findBaby(id) : null;
    form.reset();
    form.dataset.id = baby ? baby.id : "";
    $("#formTitle").textContent = baby ? "Edit " + displayName(baby) : "Add a baby";
    $("#formError").textContent = "";
    if (baby) {
      form.elements.parents.value = baby.parents || "";
      form.elements.name.value = baby.name || "";
      form.elements.relation.value = baby.relation || "Friend";
      form.elements.theme.value = baby.theme || "";
      form.elements.dueDate.value = baby.dueDate || "";
      form.elements.birthDate.value = baby.birthDate || "";
      form.elements.birthWeight.value = baby.birthWeight || "";
      form.elements.notes.value = baby.notes || "";
      form.elements.born.value = baby.born || opts.markBorn ? "yes" : "no";
      if (opts.markBorn && !baby.birthDate) form.elements.birthDate.value = C.fromDayNumber(C.toDayNumber(new Date()));
    }
    syncFormVisibility();
    $("#formDialog").showModal();
    (opts.markBorn ? form.elements.birthDate : form.elements.parents).focus();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = form.elements;
    var err = $("#formError");
    var parents = f.parents.value.trim();
    if (!parents) { err.textContent = "Add at least one parent's name."; f.parents.focus(); return; }

    var born = f.born.value === "yes";
    var dueDate = f.dueDate.value;
    if (!born) {
      if (f.dating.value === "weeks") {
        var wk = parseInt(f.weeks.value, 10), dy = parseInt(f.days.value, 10) || 0;
        if (isNaN(wk) || wk < 0 || wk > 42 || dy < 0 || dy > 6) { err.textContent = "Enter weeks (0–42) and days (0–6)."; f.weeks.focus(); return; }
        dueDate = C.dueDateFromProgress(wk, dy);
      } else if (!dueDate) { err.textContent = "Pick a due date, or switch to “Weeks along”."; f.dueDate.focus(); return; }
    } else if (!f.birthDate.value) { err.textContent = "Pick the birthday."; f.birthDate.focus(); return; }

    var id = form.dataset.id;
    var existing = id ? findBaby(id) : null;
    var record = existing || { id: uid(), createdAt: Date.now() };
    record.parents = parents;
    record.name = f.name.value.trim();
    record.relation = f.relation.value;
    record.theme = f.theme.value;
    record.born = born;
    record.dueDate = dueDate;
    record.birthDate = born ? f.birthDate.value : "";
    record.birthWeight = born ? f.birthWeight.value.trim() : "";
    record.notes = f.notes.value.trim();
    if (!existing) state.babies.push(record);
    save(); render();
    $("#formDialog").close();
  });

  // ---------- Wiring ----------
  $$("[data-close]").forEach(function (b) { b.addEventListener("click", function () { b.closest("dialog").close(); }); });
  $$("dialog").forEach(function (d) {
    d.addEventListener("click", function (e) { if (e.target === d) d.close(); }); // click on backdrop
  });

  $("#addBtn").addEventListener("click", function () { openForm(); });
  $("#emptyAdd").addEventListener("click", function () { openForm(); });
  $("#grid").addEventListener("click", function (e) {
    var card = e.target.closest(".card");
    if (card) openDetail(card.dataset.id);
  });
  $("#themeChips").addEventListener("click", function (e) {
    var chip = e.target.closest("[data-theme]");
    if (!chip) return;
    state.theme = chip.dataset.theme; save(); render();
  });
  $$(".seg [data-units]").forEach(function (b) {
    b.addEventListener("click", function () { state.units = b.dataset.units; save(); render(); });
  });
  $("#filterTabs").addEventListener("click", function (e) {
    var t = e.target.closest("[data-filter]");
    if (t) { view.filter = t.dataset.filter; render(); }
  });
  $("#search").addEventListener("input", function (e) { view.search = e.target.value; render(); });
  $("#sort").addEventListener("change", function (e) { view.sort = e.target.value; render(); });

  $("#sampleBtn").addEventListener("click", function () {
    var today = C.toDayNumber(new Date());
    var due = function (weeksAlong) { return C.fromDayNumber(today + C.FULL_TERM_DAYS - weeksAlong * 7); };
    var samples = [
      { parents: "Maya & Theo Rivera", name: "", relation: "Friend", dueDate: due(9) },
      { parents: "Priya Shah", name: "Little Peanut", relation: "Coworker", dueDate: due(20) },
      { parents: "Jess & Alex Kim", name: "", relation: "Family", dueDate: due(31), theme: "animals" },
      { parents: "Omar & Lena Haddad", name: "", relation: "Neighbor", dueDate: due(38), theme: "sweets" },
      { parents: "Chris & Dana Moore", name: "Rosie", relation: "Friend", born: true, birthDate: C.fromDayNumber(today - 75), birthWeight: "7 lb 2 oz" }
    ];
    samples.forEach(function (s, i) {
      state.babies.push(Object.assign({ id: uid(), createdAt: Date.now() + i, theme: "", born: false, birthDate: "", birthWeight: "", notes: "" }, s));
    });
    save(); render();
  });

  $("#exportBtn").addEventListener("click", function () {
    var blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "bump-crew-backup-" + C.fromDayNumber(C.toDayNumber(new Date())) + ".json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });

  $("#importFile").addEventListener("change", function (e) {
    var file = e.target.files[0];
    if (!file) return;
    file.text().then(function (text) {
      var data = JSON.parse(text);
      if (!data || !Array.isArray(data.babies)) throw new Error("bad file");
      var known = {};
      state.babies.forEach(function (b) { known[b.id] = true; });
      var added = data.babies.filter(function (b) { return b && b.parents && !known[b.id]; });
      added.forEach(function (b) { if (!b.id) b.id = uid(); state.babies.push(b); });
      save(); render();
      alert("Imported " + added.length + " bab" + (added.length === 1 ? "y" : "ies") + ".");
    }).catch(function () {
      alert("That file doesn't look like a Bump Crew backup.");
    }).finally(function () { e.target.value = ""; });
  });

  // Keep "week X" accurate if the tab stays open past midnight.
  document.addEventListener("visibilitychange", function () { if (!document.hidden) render(); });

  render();
})();
