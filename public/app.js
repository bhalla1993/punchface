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

const face = document.querySelector(".face");
const note = document.querySelector(".note");
const list = document.querySelector(".board ol");
const stage = document.querySelector(".stage");
const soundBtn = document.querySelector(".sound");
const status = document.querySelector(".status");
const tabs = [...document.querySelectorAll(".tabs button")];
const dev = document.querySelector(".dev");
const countryBtn = document.querySelector("#country-btn");
const countryMenu = document.querySelector("#country-menu");
const youFlag = document.querySelector("#you-flag");
const youName = document.querySelector("#you-name");
const youWeek = document.querySelector("#you-week");
const youUnit = document.querySelector("#you-unit");
const tapHint = document.querySelector("#tap-hint");
const boardHelp = document.querySelector("#board-help");
const menuBtn = document.querySelector(".menu-btn");
const sheet = document.querySelector("#sheet");

const names = Object.fromEntries(COUNTRIES);
const local = location.hostname === "localhost" || location.hostname === "127.0.0.1";
const params = new URLSearchParams(location.search);
let country = params.get("country") || sessionStorage.getItem("country") || "CA";
let soundOn = false;
let mode = "weekly";
let pending = 0;
let board = null;
let paused = false;
let flushTimer = 0;

paintCountry();

if (local) {
  dev.hidden = false;
  countryMenu.replaceChildren(...COUNTRIES.map(([code, name]) => {
    const button = document.createElement("button");
    button.type = "button";
    if (code === country) button.className = "on";
    button.innerHTML = `<span>${FLAGS[code] || "🌍"}</span><span></span>`;
    button.lastElementChild.textContent = name;
    button.addEventListener("click", () => {
      sessionStorage.setItem("country", code);
      const next = new URL(location.href);
      next.searchParams.set("country", code);
      location.href = next;
    });
    return button;
  }));
  countryBtn.addEventListener("click", () => {
    const open = countryMenu.hidden;
    countryMenu.hidden = !open;
    countryBtn.setAttribute("aria-expanded", String(open));
  });
}

menuBtn.addEventListener("click", () => {
  sheet.showModal();
  menuBtn.setAttribute("aria-expanded", "true");
});
sheet.querySelector("[data-close]").addEventListener("click", () => sheet.close());
sheet.addEventListener("click", (event) => {
  if (event.target === sheet) sheet.close();
});
sheet.addEventListener("close", () => menuBtn.setAttribute("aria-expanded", "false"));

soundBtn.addEventListener("click", () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "Sound on" : "Sound off";
  soundBtn.setAttribute("aria-pressed", String(soundOn));
});

face.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  hit();
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    mode = tab.dataset.mode;
    tabs.forEach((item) => item.classList.toggle("on", item === tab));
    render();
  });
});

function paintCountry() {
  youFlag.textContent = FLAGS[country] || "🌍";
  youName.textContent = names[country] || "Rest of world";
  countryBtn.textContent = `${FLAGS[country] || "🌍"}  ${names[country] || "Rest of world"}`;
}

function hit() {
  tapHint.classList.add("gone");
  face.classList.remove("hit");
  void face.offsetWidth;
  face.classList.add("hit");
  const pop = document.createElement("span");
  pop.className = "pop";
  pop.textContent = "+1";
  pop.style.left = `${42 + Math.random() * 16}%`;
  stage.appendChild(pop);
  pop.addEventListener("animationend", () => pop.remove());
  if (soundOn) beep();
  if (paused || note.dataset.full === "1") return;
  pending += 1;
  bump(1);
  clearTimeout(flushTimer);
  flushTimer = setTimeout(flush, pending >= 15 ? 0 : 700);
}

function bump(count) {
  if (!board) return;
  const weekly = board.weekly.find((item) => item.code === country);
  const alltime = board.alltime.find((item) => item.code === country);
  if (weekly) weekly.score += count;
  if (alltime) alltime.score += count;
  render();
}

async function flush() {
  const count = pending;
  if (!count) return;
  pending = 0;
  try {
    const response = await fetch(`/api/punch?country=${encodeURIComponent(country)}`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-country": country },
      body: JSON.stringify({ count }),
    });
    if (!response.ok) throw new Error("punch failed");
    apply(await response.json());
  } catch {
    bump(-count);
    paused = true;
    status.textContent = "Shared count is paused. You can keep punching.";
  }
}

async function load() {
  try {
    const response = await fetch(`/api/board?country=${encodeURIComponent(country)}`, {
      headers: { "x-country": country },
    });
    if (!response.ok) throw new Error("board failed");
    paused = false;
    status.textContent = "";
    apply(await response.json());
  } catch {
    paused = true;
    status.textContent = "Shared count is paused. You can keep punching.";
  }
}

function apply(data) {
  country = data.country || country;
  board = { weekly: data.weekly, alltime: data.alltime };
  note.dataset.full = data.limited ? "1" : "";
  note.textContent = data.limited
    ? "You can keep punching for fun. These no longer add to the count."
    : "";
  paintCountry();
  render();
}

function render() {
  boardHelp.textContent = mode === "weekly"
    ? "This week resets Monday at midnight UTC. Your country stays on the list."
    : "All time keeps every punch, including after the face changes.";
  const mine = board && board.weekly.find((row) => row.code === country);
  const weekScore = mine ? mine.score : 0;
  youWeek.textContent = String(weekScore);
  youUnit.textContent = weekScore === 1 ? "punch" : "punches";
  if (!board) {
    list.replaceChildren();
    return;
  }
  const rows = [...board[mode]].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  const top = rows.filter((row) => row.score > 0).slice(0, 10);
  if (!top.some((row) => row.code === country)) {
    const own = rows.find((row) => row.code === country);
    if (own) top.push(own);
  }
  const max = Math.max(...top.map((row) => row.score), 1);
  list.replaceChildren(...top.map((row, index) => {
    const item = document.createElement("li");
    if (row.code === country) item.className = "you";
    item.style.setProperty("--w", `${row.score ? (row.score / max) * 100 : 0}%`);
    const bar = document.createElement("span");
    bar.className = "bar";
    const rank = document.createElement("span");
    rank.className = "rank";
    rank.textContent = String(index + 1);
    const flag = document.createElement("span");
    flag.className = "flag";
    flag.textContent = FLAGS[row.code] || "🌍";
    const name = document.createElement("span");
    name.className = "name";
    name.textContent = row.name;
    const score = document.createElement("span");
    score.className = "score";
    score.textContent = String(row.score);
    item.append(bar, rank, flag, name, score);
    return item;
  }));
}

function beep() {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = 180;
  gain.gain.value = 0.04;
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  osc.stop(ctx.currentTime + 0.09);
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    clearTimeout(flushTimer);
    flush();
  }
});

load();
setInterval(() => {
  if (!document.hidden) load();
}, 5000);
