// =====================================
// WM26 GROUPS
// einfache Gruppen-Datenbank
// =====================================

const groups = [
  {
    id: "A",
    name: "Gruppe A",
    teams: ["Mexiko", "Südafrika", "Südkorea", "Tschechien"],
  },
  {
    id: "B",
    name: "Gruppe B",
    teams: ["Kanada", "Bosnien & Herzegowina", "Katar", "Schweiz"],
  },
  {
    id: "C",
    name: "Gruppe C",
    teams: ["Brasilien", "Marokko", "Haiti", "Schottland"],
  },
  {
    id: "D",
    name: "Gruppe D",
    teams: ["USA", "Paraguay", "Australien", "Türkei"],
  },
  {
    id: "E",
    name: "Gruppe E",
    teams: ["Deutschland", "Curaçao", "Elfenbeinküste", "Ecuador"],
  },
  {
    id: "F",
    name: "Gruppe F",
    teams: ["Niederlande", "Japan", "Schweden", "Tunesien"],
  },
  {
    id: "G",
    name: "Gruppe G",
    teams: ["Belgien", "Ägypten", "Iran", "Neuseeland"],
  },
  {
    id: "H",
    name: "Gruppe H",
    teams: ["Spanien", "Kap Verde", "Saudi-Arabien", "Uruguay"],
  },
  {
    id: "I",
    name: "Gruppe I",
    teams: ["Frankreich", "Senegal", "Irak", "Norwegen"],
  },
  {
    id: "J",
    name: "Gruppe J",
    teams: ["Argentinien", "Algerien", "Österreich", "Jordanien"],
  },
  {
    id: "K",
    name: "Gruppe K",
    teams: ["Portugal", "DR Kongo", "Usbekistan", "Kolumbien"],
  },
  {
    id: "L",
    name: "Gruppe L",
    teams: ["England", "Kroatien", "Ghana", "Panama"],
  },
];

// =====================================
// HELPER
// =====================================

function getAllTeams() {
  return groups.flatMap(group => group.teams);
}

function getGroupById(groupId) {
  return groups.find(group => group.id === groupId);
}