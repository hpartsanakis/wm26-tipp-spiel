// =====================================
// SPIELE PAGE
// Spiele nach Spieltagen anzeigen
// Tipps + Ergebnisse speichern
// Dashboard + Punkte berechnen
// =====================================

// LocalStorage Keys
const TIPS_KEY = "wm26-tips";
const RESULTS_KEY = "wm26-results";

// Container
const groupMatchesContainer = document.getElementById("groupMatchesContainer");

// Dashboard Elemente
const totalMatchesEl = document.getElementById("totalMatches");
const totalTipsEl = document.getElementById("totalTips");
const openTipsEl = document.getElementById("openTips");
const totalPointsEl = document.getElementById("totalPoints");

// Daten laden
let tips = JSON.parse(localStorage.getItem(TIPS_KEY)) || {};
let results = JSON.parse(localStorage.getItem(RESULTS_KEY)) || {};

const viewButtons = document.querySelectorAll(".filter-btn");

let activeView = "matchday-1";

viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeView = button.dataset.view;

    viewButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    render();
  });
});

// =====================================
// SPEICHERN
// =====================================

function saveTips() {
  localStorage.setItem(TIPS_KEY, JSON.stringify(tips));
}

function saveResults() {
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
}

// =====================================
// PUNKTE BERECHNEN
// =====================================

function calculatePoints(matchId) {
  const tip = tips[matchId];
  const result = results[matchId];

  if (!tip || !result) return 0;

  const tipHome = tip.home;
  const tipAway = tip.away;
  const resultHome = result.home;
  const resultAway = result.away;

  // Exaktes Ergebnis
  if (tipHome === resultHome && tipAway === resultAway) {
    return 3;
  }

  const tipDiff = tipHome - tipAway;
  const resultDiff = resultHome - resultAway;

  // Richtige Tordifferenz
  if (tipDiff === resultDiff) {
    return 2;
  }

  const tipTrend = Math.sign(tipDiff);
  const resultTrend = Math.sign(resultDiff);

  // Richtiger Sieger / Unentschieden
  if (tipTrend === resultTrend) {
    return 1;
  }

  return 0;
}

// =====================================
// DASHBOARD
// =====================================

function renderDashboard() {
  const allMatches =
    typeof knockoutMatches !== "undefined"
      ? [...matches, ...knockoutMatches]
      : matches;

  const totalMatches = allMatches.length;

  const totalTips = allMatches.filter((match) =>
    Boolean(tips[match.id]),
  ).length;

  const openTips = totalMatches - totalTips;

  let totalPoints = 0;

  allMatches.forEach((match) => {
    totalPoints += calculatePoints(match.id);
  });

  if (totalMatchesEl) totalMatchesEl.textContent = totalMatches;
  if (totalTipsEl) totalTipsEl.textContent = totalTips;
  if (openTipsEl) openTipsEl.textContent = openTips;
  if (totalPointsEl) totalPointsEl.textContent = totalPoints;
}

// =====================================
// SPIELE RENDERN
// =====================================

function renderMatches() {
  if (!groupMatchesContainer) return;

  groupMatchesContainer.innerHTML = "";
  const selectedMatchday = Number(activeView.replace("matchday-", ""));

  if (!activeView.startsWith("matchday-")) {
    return;
  }

  const matchdays = [selectedMatchday];

  matchdays.forEach((matchday) => {
    const dayMatches = matches.filter((match) => match.matchday === matchday);

    const daySection = document.createElement("section");
    daySection.className = "group-matches-section";

    daySection.innerHTML = `
      <h3>Spieltag ${matchday}</h3>
      <div class="group-matches-list"></div>
    `;

    const list = daySection.querySelector(".group-matches-list");

    dayMatches.forEach((match) => {
      const tip = tips[match.id] || {};
      const result = results[match.id] || {};
      const points = calculatePoints(match.id);

      const card = document.createElement("article");
      card.className = "match-card";

      card.innerHTML = `
        <div class="match-top">
          <span>Spiel ${match.id} · Gruppe ${match.group}</span>
          <span>${match.date}</span>
        </div>

        <div class="teams">
          ${match.home}
          <strong>vs</strong>
          ${match.away}
        </div>

        <div class="tip-row">
          <span>Tipp</span>

          <input
            type="number"
            min="0"
            id="tip-home-${match.id}"
            value="${tip.home ?? ""}"
            placeholder="0"
          >

          <span>:</span>

          <input
            type="number"
            min="0"
            id="tip-away-${match.id}"
            value="${tip.away ?? ""}"
            placeholder="0"
          >

          <button onclick="saveTip(${match.id})">
            Tipp speichern
          </button>

          <button onclick="deleteTip(${match.id})">
            Löschen
          </button>
        </div>

        <div class="result-row">
          <span>Ergebnis</span>

          <input
            type="number"
            min="0"
            id="result-home-${match.id}"
            value="${result.home ?? ""}"
            placeholder="0"
          >

          <span>:</span>

          <input
            type="number"
            min="0"
            id="result-away-${match.id}"
            value="${result.away ?? ""}"
            placeholder="0"
          >

          <button onclick="saveResult(${match.id})">
            Ergebnis speichern
          </button>

          <button onclick="deleteResult(${match.id})">
            Löschen
          </button>
        </div>

        <div class="points-row">
          Punkte: ${points}
        </div>
      `;

      list.appendChild(card);
    });

    groupMatchesContainer.appendChild(daySection);
  });
}

// =====================================
// KO-RUNDEN RENDERN
// =====================================
function renderKnockoutMatches() {
  const koContainer = document.getElementById("koMatchesContainer");

  if (!koContainer) return;
  if (typeof knockoutMatches === "undefined") return;

  koContainer.innerHTML = "";
  if (activeView.startsWith("matchday-")) {
    return;
  }

  const phases = [activeView];

  phases.forEach((phase) => {
    const phaseMatches = knockoutMatches.filter(
      (match) => match.phase === phase,
    );

    if (phaseMatches.length === 0) return;

    const phaseSection = document.createElement("section");
    phaseSection.className = "group-matches-section";

    phaseSection.innerHTML = `
      <h3>${phase}</h3>
      <div class="group-matches-list"></div>
    `;

    const list = phaseSection.querySelector(".group-matches-list");

    phaseMatches.forEach((match) => {
      const tip = tips[match.id] || {};
      const result = results[match.id] || {};
      const points = calculatePoints(match.id);

      const card = document.createElement("article");
      card.className =
        match.phase === "Finale" ? "match-card final-card" : "match-card";

      card.innerHTML = `
        <div class="match-top">
          <span>Spiel ${match.id}</span>
          <span>${match.phase}</span>
        </div>

        <div class="teams">
          ${match.home}
          <strong>vs</strong>
          ${match.away}
        </div>

        <div class="ko-note">
            Platzhalter – Teams werden später nach der Gruppenphase ersetzt.
        </div>

        <div class="tip-row">
          <span>Tipp</span>

          <input
            type="number"
            min="0"
            id="tip-home-${match.id}"
            value="${tip.home ?? ""}"
            placeholder="0"
          >

          <span>:</span>

          <input
            type="number"
            min="0"
            id="tip-away-${match.id}"
            value="${tip.away ?? ""}"
            placeholder="0"
          >

          <button onclick="saveTip(${match.id})">
            Tipp speichern
          </button>

          <button onclick="deleteTip(${match.id})">
            Löschen
          </button>
        </div>

        <div class="result-row">
          <span>Ergebnis</span>

          <input
            type="number"
            min="0"
            id="result-home-${match.id}"
            value="${result.home ?? ""}"
            placeholder="0"
          >

          <span>:</span>

          <input
            type="number"
            min="0"
            id="result-away-${match.id}"
            value="${result.away ?? ""}"
            placeholder="0"
          >

          <button onclick="saveResult(${match.id})">
            Ergebnis speichern
          </button>

          <button onclick="deleteResult(${match.id})">
            Löschen
          </button>
        </div>

        <div class="points-row">
          Punkte: ${points}
        </div>
      `;

      list.appendChild(card);
    });

    koContainer.appendChild(phaseSection);
  });
}

// =====================================
// TIPP SPEICHERN
// =====================================

function saveTip(matchId) {
  const homeInput = document.getElementById(`tip-home-${matchId}`);
  const awayInput = document.getElementById(`tip-away-${matchId}`);

  if (homeInput.value === "" || awayInput.value === "") {
    alert("Bitte beide Tippfelder ausfüllen.");
    return;
  }

  tips[matchId] = {
    home: Number(homeInput.value),
    away: Number(awayInput.value),
  };

  saveTips();
  render();
}

// =====================================
// TIPP LÖSCHEN
// =====================================

function deleteTip(matchId) {
  delete tips[matchId];

  saveTips();
  render();
}

// =====================================
// ERGEBNIS SPEICHERN
// =====================================

function saveResult(matchId) {
  const homeInput = document.getElementById(`result-home-${matchId}`);
  const awayInput = document.getElementById(`result-away-${matchId}`);

  if (homeInput.value === "" || awayInput.value === "") {
    alert("Bitte beide Ergebnisfelder ausfüllen.");
    return;
  }

  results[matchId] = {
    home: Number(homeInput.value),
    away: Number(awayInput.value),
  };

  saveResults();
  render();
}

// =====================================
// ERGEBNIS LÖSCHEN
// =====================================

function deleteResult(matchId) {
  delete results[matchId];

  saveResults();
  render();
}

// =====================================
// HAUPT-RENDER
// =====================================

function render() {
  renderDashboard();
  renderMatches();
  renderKnockoutMatches();
}

// =====================================
// START
// =====================================

render();
