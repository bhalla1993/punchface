const COUNTRIES = [
  ["AR", "Argentina"], ["AU", "Australia"], ["BD", "Bangladesh"], ["BR", "Brazil"],
  ["CA", "Canada"], ["CN", "China"], ["FR", "France"], ["DE", "Germany"],
  ["IN", "India"], ["ID", "Indonesia"], ["IT", "Italy"], ["JP", "Japan"],
  ["MX", "Mexico"], ["NG", "Nigeria"], ["PK", "Pakistan"], ["PH", "Philippines"],
  ["RU", "Russia"], ["SA", "Saudi Arabia"], ["ZA", "South Africa"], ["KR", "South Korea"],
  ["TR", "Türkiye"], ["GB", "United Kingdom"], ["US", "United States"], ["XX", "Rest of world"],
];

const FLAGS = {
  AR: "🇦🇷", AU: "🇦🇺", BD: "🇧🇩", BR: "🇧🇷", CA: "🇨🇦", CN: "🇨🇳", FR: "🇫🇷", DE: "🇩🇪",
  IN: "🇮🇳", ID: "🇮🇩", IT: "🇮🇹", JP: "🇯🇵", MX: "🇲🇽", NG: "🇳🇬", PK: "🇵🇰", PH: "🇵🇭",
  RU: "🇷🇺", SA: "🇸🇦", ZA: "🇿🇦", KR: "🇰🇷", TR: "🇹🇷", GB: "🇬🇧", US: "🇺🇸", XX: "🌍",
};

const CONTINENTS = [
  { id: "north-america", name: "North America", codes: ["US", "CA", "MX"] },
  { id: "south-america", name: "South America", codes: ["BR", "AR"] },
  { id: "europe", name: "Europe", codes: ["GB", "FR", "DE", "IT", "RU"] },
  { id: "asia", name: "Asia", codes: ["IN", "CN", "JP", "ID", "PK", "BD", "PH", "KR", "SA", "TR"] },
  { id: "africa", name: "Africa", codes: ["NG", "ZA"] },
  { id: "oceania", name: "Oceania", codes: ["AU"] },
];

const names = Object.fromEntries(COUNTRIES);
const tracked = new Map(CONTINENTS.flatMap((item) => item.codes.map((code) => [code, item.id])));
const frame = document.querySelector("#map-frame");
const continentBoxes = document.querySelector("#continent-boxes");
const countryBoxes = document.querySelector("#country-boxes");
const boxTitle = document.querySelector("#box-title");
const statTotal = document.querySelector("#stat-total");
const statLead = document.querySelector("#stat-lead");
const statYou = document.querySelector("#stat-you");
const statYouLabel = document.querySelector("#stat-you-label");
const tabs = [...document.querySelectorAll(".tabs button")];
const punchLink = document.querySelector("a.menu-btn");
const local = location.hostname === "localhost" || location.hostname === "127.0.0.1";
const params = new URLSearchParams(location.search);
let country = params.get("country") || sessionStorage.getItem("country") || "CA";
let mode = "weekly";
let selected = "all";
let chose = false;
let board = null;
let earth = null;

if (local) {
  const back = new URL("/", location.origin);
  back.searchParams.set("country", country);
  punchLink.href = `${back.pathname}${back.search}`;
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    mode = tab.dataset.mode;
    tabs.forEach((item) => item.classList.toggle("on", item === tab));
    render();
  });
});

function scoreOf(code) {
  return board[mode].find((row) => row.code === code)?.score || 0;
}

function mixColor(share) {
  const from = [255, 214, 120];
  const to = [226, 59, 47];
  const channel = (index) => Math.round(from[index] + (to[index] - from[index]) * share);
  return `rgb(${channel(0)} ${channel(1)} ${channel(2)})`;
}

function render() {
  if (!board) return;
  const totals = CONTINENTS.map((item) => ({
    ...item,
    score: item.codes.reduce((sum, code) => sum + scoreOf(code), 0),
  }));
  const total = board[mode].reduce((sum, row) => sum + row.score, 0);
  const lead = totals.reduce((best, item) => (item.score > best.score ? item : best), totals[0]);
  statTotal.textContent = String(total);
  statLead.textContent = lead.score > 0 ? lead.name : "None yet";
  statYou.textContent = String(scoreOf(country));
  statYouLabel.textContent = names[country] || "Your country";

  const max = Math.max(...[...tracked.keys()].map(scoreOf), 1);
  if (earth) {
    earth.querySelectorAll("#lands path").forEach((path) => {
      const code = path.dataset.code;
      const group = tracked.get(code);
      const score = group ? scoreOf(code) : 0;
      const active = selected === "all" || selected === group || (selected === "rest" && !group);
      path.classList.toggle("scored", Boolean(group));
      path.classList.toggle("dim", Boolean(selected !== "all" && group && !active));
      path.classList.toggle("picked", Boolean(group && selected === group));
      path.style.fill = group && score ? mixColor(0.28 + 0.72 * (score / max)) : "";
    });
  }

  const groups = [
    { id: "all", name: "All countries", score: total - scoreOf("XX") },
    ...totals,
    { id: "rest", name: "Rest of world", score: scoreOf("XX") },
  ];
  continentBoxes.replaceChildren(...groups.map((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `box${item.id === selected ? " on" : ""}`;
    const strong = document.createElement("strong");
    strong.textContent = String(item.score);
    const label = document.createElement("span");
    label.textContent = item.name;
    button.append(strong, label);
    button.addEventListener("click", () => {
      selected = item.id;
      render();
    });
    return button;
  }));

  const picked = totals.find((item) => item.id === selected);
  const rows = selected === "rest"
    ? [{ code: "XX", name: "Rest of world", score: scoreOf("XX") }]
    : (picked ? picked.codes : [...tracked.keys()])
      .map((code) => board[mode].find((row) => row.code === code))
      .filter(Boolean)
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  boxTitle.textContent = picked ? picked.name : selected === "rest" ? "Rest of world" : "Countries";
  countryBoxes.replaceChildren(...rows.map((row) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `box${row.code === country ? " you" : ""}`;
    const strong = document.createElement("strong");
    strong.textContent = String(row.score);
    const label = document.createElement("span");
    label.textContent = `${FLAGS[row.code] || "🌍"} ${row.name}`;
    button.append(strong, label);
    button.addEventListener("click", () => {
      const group = tracked.get(row.code);
      if (group) {
        selected = group;
        render();
        const land = earth && earth.querySelector(`#lands path[data-code="${row.code}"]`);
        if (land) land.classList.add("picked");
      }
    });
    return button;
  }));
}

frame.addEventListener("click", (event) => {
  const path = event.target.closest("path[data-code]");
  if (!path) return;
  const group = tracked.get(path.dataset.code);
  if (!group) return;
  selected = group;
  render();
});

async function load() {
  const response = await fetch(`/api/board?country=${encodeURIComponent(country)}`, {
    headers: { "x-country": country },
  });
  if (!response.ok) return;
  const data = await response.json();
  country = data.country || country;
  board = { weekly: data.weekly, alltime: data.alltime };
  if (!chose) {
    chose = true;
    const home = tracked.get(country);
    if (home) selected = home;
  }
  render();
}

const markup = await fetch("/earth.svg").then((response) => response.text());
frame.innerHTML = markup;
frame.removeAttribute("aria-busy");
earth = frame.querySelector("svg");
load();
setInterval(load, 5000);
