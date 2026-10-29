// News Diary: shows the data from the data/*.js files on the page.
// This file never changes the data. Claude updates the data files.

var picks = window.picks || { date: "", articles: [] };
var library = window.library || [];
var diary = window.diary || [];

// Make text safe to put inside the page.
function esc(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Only allow normal web links.
function safeLink(url) {
  return /^https?:\/\//i.test(url || "") ? esc(url) : "#";
}

// "2026-10-29" -> "Thursday, October 29, 2026"
function niceDate(isoDate) {
  if (!isoDate) return "";
  var d = new Date(isoDate + "T12:00:00");
  if (isNaN(d)) return esc(isoDate);
  return d.toLocaleDateString(undefined, {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });
}

function emptyBox(message, command) {
  return '<div class="empty">' + message +
    (command ? '<br>Ask Claude: <code>' + esc(command) + '</code>' : '') + '</div>';
}

// ---------- Today's Picks ----------
function showPicks() {
  var box = document.getElementById("picks");
  var list = picks.articles || [];
  if (list.length === 0) {
    box.innerHTML = emptyBox("No picks yet.", "morning update");
    return;
  }
  var html = '<p class="panel-intro">Top ' + list.length + ' for ' + niceDate(picks.date) + '</p>';
  list.forEach(function (a, i) {
    html +=
      '<article class="card">' +
        '<div class="card-top">' +
          '<span class="rank">' + (i + 1) + '</span>' +
          '<span>' + esc(a.source) + '</span>' +
          (a.kind ? '<span class="badge">' + esc(a.kind) + '</span>' : '') +
        '</div>' +
        '<h3><a href="' + safeLink(a.link) + '" target="_blank" rel="noopener">' + esc(a.title) + '</a></h3>' +
        (a.summary ? '<p class="summary">' + esc(a.summary) + '</p>' : '') +
        (a.reason ? '<p class="reason"><strong>Why this pick:</strong> ' + esc(a.reason) + '</p>' : '') +
      '</article>';
  });
  box.innerHTML = html;
}

// ---------- Library ----------
function libraryCards(items) {
  if (items.length === 0) return emptyBox("Nothing matches your search.");
  return items.map(function (a) {
    return '<article class="card">' +
        '<div class="card-top">' +
          '<span>' + esc(a.source) + '</span>' +
          (a.topic ? '<span class="badge">' + esc(a.topic) + '</span>' : '') +
          '<span>Saved ' + esc(a.saved) + '</span>' +
        '</div>' +
        '<h3><a href="' + safeLink(a.link) + '" target="_blank" rel="noopener">' + esc(a.title) + '</a></h3>' +
        (a.summary ? '<p class="summary">' + esc(a.summary) + '</p>' : '') +
        (a.note ? '<p class="note">My note: ' + esc(a.note) + '</p>' : '') +
      '</article>';
  }).join("");
}

function showLibrary() {
  var box = document.getElementById("library");
  if (library.length === 0) {
    box.innerHTML = emptyBox("Your library is empty.", "save this: [link], note: [your note]");
    return;
  }
  box.innerHTML =
    '<p class="panel-intro">' + library.length + ' saved article' + (library.length === 1 ? '' : 's') + '</p>' +
    '<input class="search" type="search" placeholder="Search your library..." aria-label="Search your library">' +
    '<div class="results">' + libraryCards(library) + '</div>';

  box.querySelector(".search").addEventListener("input", function (e) {
    var words = e.target.value.toLowerCase();
    var found = library.filter(function (a) {
      return [a.title, a.summary, a.note, a.source, a.topic].join(" ").toLowerCase().indexOf(words) !== -1;
    });
    box.querySelector(".results").innerHTML = libraryCards(found);
  });
}

// ---------- Diary ----------
function showDiary() {
  var box = document.getElementById("diary");
  if (diary.length === 0) {
    box.innerHTML = emptyBox("No diary entries yet.", "update my diary");
    return;
  }
  box.innerHTML = diary.map(function (entry) {
    var topics = (entry.topics || []).map(function (t) {
      var links = (t.links || []).map(function (l) {
        return '<li><a href="' + safeLink(l.link) + '" target="_blank" rel="noopener">' + esc(l.title) + '</a></li>';
      }).join("");
      return '<div class="topic">' +
          '<h3>' + esc(t.name) + '</h3>' +
          '<dl>' +
            '<dt>What\'s developing</dt><dd>' + esc(t.developing) + '</dd>' +
            '<dt>Where sources disagree</dt><dd>' + esc(t.disagree) + '</dd>' +
            '<dt>What changed since last time</dt><dd>' + esc(t.changed) + '</dd>' +
          '</dl>' +
          (links ? '<ul>' + links + '</ul>' : '') +
        '</div>';
    }).join("");
    return '<article class="entry">' +
        '<h2>' + niceDate(entry.date) + '</h2>' +
        (entry.intro ? '<p class="entry-intro">' + esc(entry.intro) + '</p>' : '') +
        topics +
      '</article>';
  }).join("");
}

// ---------- Tabs ----------
function openTab(name) {
  if (["picks", "library", "diary"].indexOf(name) === -1) name = "picks";
  document.querySelectorAll(".tabs button").forEach(function (btn) {
    btn.setAttribute("aria-selected", btn.dataset.tab === name ? "true" : "false");
  });
  document.querySelectorAll(".panel").forEach(function (panel) {
    panel.hidden = panel.id !== name;
  });
}

document.querySelectorAll(".tabs button").forEach(function (btn) {
  btn.addEventListener("click", function () {
    location.hash = btn.dataset.tab; // so the tab stays open after a refresh
  });
});
window.addEventListener("hashchange", function () { openTab(location.hash.slice(1)); });

showPicks();
showLibrary();
showDiary();
openTab(location.hash.slice(1));
