const RESULTS_KEY = "wm26-results";
const TIPS_KEY = "wm26-tips";

const groupsContainer = document.getElementById("groupsContainer");

function loadStoredObject(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    return {};
  }
}

function isValidScore(score) {
  return Number.isInteger(score) && score >= 0;
}

function calculateGroupTable(group) {
  const results = loadStoredObject(RESULTS_KEY);

  const table = group.teams.map((team) => ({
    team,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDiff: 0,
    points: 0,
  }));

  matches
    .filter((match) => match.group === group.id)
    .forEach((match) => {
      const result = results[match.id];

      if (!result || !isValidScore(result.home) || !isValidScore(result.away)) return;

      const homeTeam = table.find((row) => row.team === match.home);
      const awayTeam = table.find((row) => row.team === match.away);

      if (!homeTeam || !awayTeam) return;

      homeTeam.played += 1;
      awayTeam.played += 1;

      homeTeam.goalsFor += result.home;
      homeTeam.goalsAgainst += result.away;
      awayTeam.goalsFor += result.away;
      awayTeam.goalsAgainst += result.home;

      if (result.home > result.away) {
        homeTeam.wins += 1;
        awayTeam.losses += 1;
        homeTeam.points += 3;
      } else if (result.home < result.away) {
        awayTeam.wins += 1;
        homeTeam.losses += 1;
        awayTeam.points += 3;
      } else {
        homeTeam.draws += 1;
        awayTeam.draws += 1;
        homeTeam.points += 1;
        awayTeam.points += 1;
      }
    });

  table.forEach((row) => {
    row.goalDiff = row.goalsFor - row.goalsAgainst;
  });

  return table.sort((a, b) => (
    b.points - a.points ||
    b.goalDiff - a.goalDiff ||
    b.goalsFor - a.goalsFor ||
    a.goalsAgainst - b.goalsAgainst ||
    a.team.localeCompare(b.team, "de")
  ));
}

function formatGoalDiff(value) {
  return value > 0 ? `+${value}` : String(value);
}

function renderGroups() {
  if (!groupsContainer) return;

  groupsContainer.innerHTML = "";

  groups.forEach((group) => {
    const table = calculateGroupTable(group);
    const card = document.createElement("article");

    card.className = "group-card";
    card.innerHTML = `
      <h3>${group.name}</h3>
      <div class="table-scroll">
        <table class="group-table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Team</th>
              <th scope="col">Sp</th>
              <th scope="col">S</th>
              <th scope="col">U</th>
              <th scope="col">N</th>
              <th scope="col">Tore</th>
              <th scope="col">Diff</th>
              <th scope="col">Pkt</th>
            </tr>
          </thead>
          <tbody>
            ${table
              .map(
                (row, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <th scope="row">${row.team}</th>
                    <td>${row.played}</td>
                    <td>${row.wins}</td>
                    <td>${row.draws}</td>
                    <td>${row.losses}</td>
                    <td>${row.goalsFor}:${row.goalsAgainst}</td>
                    <td>${formatGoalDiff(row.goalDiff)}</td>
                    <td><strong>${row.points}</strong></td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;

    groupsContainer.appendChild(card);
  });
}

function calculateTipPoints(matchId) {
  const tips = loadStoredObject(TIPS_KEY);
  const results = loadStoredObject(RESULTS_KEY);
  const tip = tips[matchId];
  const result = results[matchId];

  if (!tip || !result) return 0;
  if (!isValidScore(tip.home) || !isValidScore(tip.away)) return 0;
  if (!isValidScore(result.home) || !isValidScore(result.away)) return 0;

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
  const totalPoints = matches.reduce((sum, match) => sum + calculateTipPoints(match.id), 0);

  if (totalGroupsEl) totalGroupsEl.textContent = groups.length;
  if (totalTeamsEl) totalTeamsEl.textContent = getAllTeams().length;
  if (totalMatchesEl) totalMatchesEl.textContent = matches.length;
  if (totalPointsEl) totalPointsEl.textContent = totalPoints;
}

function render() {
  renderDashboard();
  renderGroups();
}

render();
