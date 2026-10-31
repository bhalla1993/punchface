const COUNTRIES = [
  ["AR", "Argentina"], ["AU", "Australia"], ["BD", "Bangladesh"], ["BR", "Brazil"],
  ["CA", "Canada"], ["CN", "China"], ["FR", "France"], ["DE", "Germany"],
  ["IN", "India"], ["ID", "Indonesia"], ["IT", "Italy"], ["JP", "Japan"],
  ["MX", "Mexico"], ["NG", "Nigeria"], ["PK", "Pakistan"], ["PH", "Philippines"],
  ["RU", "Russia"], ["SA", "Saudi Arabia"], ["ZA", "South Africa"], ["KR", "South Korea"],
  ["TR", "Türkiye"], ["GB", "United Kingdom"], ["US", "United States"], ["XX", "Rest of world"],
];

const face = document.querySelector(".face");
const note = document.querySelector(".note");
const list = document.querySelector(".board ol");
const stage = document.querySelector(".stage");
const soundBtn = document.querySelector(".sound");
const status = document.querySelector(".status");
const tabs = [...document.querySelectorAll(".tabs button")];
const dev = document.querySelector(".dev");
const countrySelect = document.querySelector("#country");

const local = location.hostname === "localhost" || location.hostname === "127.0.0.1";
const params = new URLSearchParams(location.search);
let country = params.get("country") || sessionStorage.getItem("country") || "CA";
let soundOn = false;
let mode = "weekly";
let pending = 0;
let board = null;
let paused = false;
let flushTimer = 0;

if (local) {
  dev.hidden = false;
  countrySelect.innerHTML = COUNTRIES.map(([code, name]) => `<option value="${code}">${name}</option>`).join("");
  countrySelect.value = country;
  countrySelect.addEventListener("change", () => {
    country = countrySelect.value;
    sessionStorage.setItem("country", country);
    const next = new URL(location.href);
    next.searchParams.set("country", country);
    location.href = next;
  });
}

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

function hit() {
  face.classList.remove("hit");
  void face.offsetWidth;
  face.classList.add("hit");
  const pop = document.createElement("span");
  pop.className = "pop";
  pop.textContent = "+1";
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
  const row = board[mode].find((item) => item.code === country) || board.weekly.find((item) => item.code === country);
  if (!row) return;
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
    const data = await response.json();
    apply(data);
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
  render();
}

function render() {
  if (!board) {
    list.replaceChildren();
    return;
  }
  const rows = [...board[mode]].sort((a, b) => b.score - a.score);
  const top = rows.filter((row) => row.score > 0).slice(0, 10);
  if (!top.some((row) => row.code === country)) {
    const mine = rows.find((row) => row.code === country);
    if (mine) top.push(mine);
  }
  if (!top.length) {
    const mine = rows.find((row) => row.code === country);
    if (mine) top.push(mine);
  }
  list.replaceChildren(...top.map((row, index) => {
    const item = document.createElement("li");
    if (row.code === country) item.className = "you";
    item.innerHTML = `<span>${index + 1}</span><span>${row.name}</span><span class="score">${row.score}</span>`;
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
