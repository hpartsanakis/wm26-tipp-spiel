// =====================================
// INDEX PAGE
// Gruppen + Tabellen aus Ergebnissen berechnen
// =====================================

// LocalStorage Key für Ergebnisse
const RESULTS_KEY = "wm26-results";

// Container für Gruppen-Tabellen
const groupsContainer = document.getElementById("groupsContainer");

// Ergebnisse aus localStorage laden
const results = JSON.parse(localStorage.getItem(RESULTS_KEY)) || {};

// =====================================
// TABELLE PRO GRUPPE BERECHNEN
// =====================================

function calculateGroupTable(group) {
  // Startwerte für jede Mannschaft
  const table = group.teams.map((team) => ({
    team: team,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDiff: 0,
    points: 0,
  }));

  // Nur Spiele dieser Gruppe holen
  const groupMatches = matches.filter((match) => match.group === group.id);

  groupMatches.forEach((match) => {
    const result = results[match.id];

    // Wenn kein Ergebnis gespeichert ist, Spiel ignorieren
    if (!result) return;

    const homeTeam = table.find((row) => row.team === match.home);
    const awayTeam = table.find((row) => row.team === match.away);

    if (!homeTeam || !awayTeam) return;

    // Spiele zählen
    homeTeam.played++;
    awayTeam.played++;

    // Tore zählen
    homeTeam.goalsFor += result.home;
    homeTeam.goalsAgainst += result.away;

    awayTeam.goalsFor += result.away;
    awayTeam.goalsAgainst += result.home;

    // Sieg / Unentschieden / Niederlage
    if (result.home > result.away) {
      homeTeam.wins++;
      awayTeam.losses++;
      homeTeam.points += 3;
    } else if (result.home < result.away) {
      awayTeam.wins++;
      homeTeam.losses++;
      awayTeam.points += 3;
    } else {
      homeTeam.draws++;
      awayTeam.draws++;
      homeTeam.points += 1;
      awayTeam.points += 1;
    }
  });

  // Tordifferenz berechnen
  table.forEach((row) => {
    row.goalDiff = row.goalsFor - row.goalsAgainst;
  });

  // Tabelle sortieren
  table.sort((a, b) => {
    return (
      b.points - a.points ||
      b.goalDiff - a.goalDiff ||
      b.goalsFor - a.goalsFor ||
      a.team.localeCompare(b.team)
    );
  });

  return table;
}

// =====================================
// GRUPPEN RENDERN
// =====================================

function renderGroups() {
  if (!groupsContainer) return;

  groupsContainer.innerHTML = "";

  groups.forEach((group) => {
    const table = calculateGroupTable(group);

    const card = document.createElement("article");
    card.className = "group-card";

    card.innerHTML = `
      <h3>${group.name}</h3>

      <table class="group-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Team</th>
            <th>Sp</th>
            <th>S</th>
            <th>U</th>
            <th>N</th>
            <th>Tore</th>
            <th>Diff</th>
            <th>Pkt</th>
          </tr>
        </thead>

        <tbody>
          ${table
            .map(
              (row, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${row.team}</td>
              <td>${row.played}</td>
              <td>${row.wins}</td>
              <td>${row.draws}</td>
              <td>${row.losses}</td>
              <td>${row.goalsFor}:${row.goalsAgainst}</td>
              <td>${row.goalDiff}</td>
              <td><strong>${row.points}</strong></td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    `;

    groupsContainer.appendChild(card);
  });
}

// =====================================
// DASHBOARD
// =====================================

function calculateTipPoints(matchId) {
  const tips = JSON.parse(localStorage.getItem("wm26-tips")) || {};
  const results = JSON.parse(localStorage.getItem("wm26-results")) || {};

  const tip = tips[matchId];
  const result = results[matchId];

  if (!tip || !result) return 0;

  if (tip.home === result.home && tip.away === result.away) return 3;

  const tipDiff = tip.home - tip.away;
  const resultDiff = result.home - result.away;

  if (tipDiff === resultDiff) return 2;

  if (Math.sign(tipDiff) === Math.sign(resultDiff)) return 1;

  return 0;
}

function renderDashboard() {
  const totalGroupsEl = document.getElementById("totalGroups");
  const totalTeamsEl = document.getElementById("totalTeams");
  const totalMatchesEl = document.getElementById("totalMatches");
  const totalPointsEl = document.getElementById("totalPoints");

  let totalPoints = 0;

  allMatches.forEach((match) => {
    totalPoints += calculateTipPoints(match.id);
  });

  if (totalGroupsEl) totalGroupsEl.textContent = groups.length;
  if (totalTeamsEl) totalTeamsEl.textContent = getAllTeams().length;
  if (totalMatchesEl) totalMatchesEl.textContent = matches.length;
  if (totalPointsEl) totalPointsEl.textContent = totalPoints;
}

// =====================================
// START
// =====================================

renderDashboard();
renderGroups();
