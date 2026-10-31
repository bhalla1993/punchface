const face = document.querySelector(".face");
const note = document.querySelector(".note");
const list = document.querySelector(".board ol");
const pops = document.querySelector(".stage");
const soundBtn = document.querySelector(".sound");
const tabs = [...document.querySelectorAll(".tabs button")];

let soundOn = false;
let mode = "weekly";
const session = { punches: 0 };

soundBtn.addEventListener("click", () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "Sound on" : "Sound off";
  soundBtn.setAttribute("aria-pressed", String(soundOn));
});

face.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  punch();
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    mode = tab.dataset.mode;
    tabs.forEach((item) => item.classList.toggle("on", item === tab));
    render();
  });
});

function punch() {
  session.punches += 1;
  face.classList.remove("hit");
  void face.offsetWidth;
  face.classList.add("hit");
  const pop = document.createElement("span");
  pop.className = "pop";
  pop.textContent = `+${session.punches}`;
  pops.appendChild(pop);
  pop.addEventListener("animationend", () => pop.remove());
  if (soundOn) beep();
  render();
}

function render() {
  const row = document.createElement("li");
  row.className = "you";
  row.innerHTML = `<span>1</span><span>You</span><span class="score">${session.punches}</span>`;
  list.replaceChildren(row);
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

render();
