// CLOCK
const digitalClock = document.getElementById("digitalClock");
const analogClock = document.getElementById("analogClock");
const ctx = analogClock.getContext("2d");
const dateEl = document.getElementById("date");
const timezoneEl = document.getElementById("timezone");
const toggleFormat = document.getElementById("toggleFormat");

let is24Hour = false;

function drawAnalogClock(date) {
  const radius = analogClock.width / 2;
  ctx.clearRect(0, 0, analogClock.width, analogClock.height);
  ctx.save();
  ctx.translate(radius, radius);
  ctx.beginPath();
  ctx.arc(0, 0, radius - 5, 0, 2 * Math.PI);
  ctx.stroke();

  const hour = date.getHours() % 12;
  const minute = date.getMinutes();
  const second = date.getSeconds();

  // Hour hand
  ctx.save();
  ctx.rotate((Math.PI / 6) * hour + (Math.PI / 360) * minute);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -radius * 0.5);
  ctx.stroke();
  ctx.restore();

  // Minute hand
  ctx.save();
  ctx.rotate((Math.PI / 30) * minute);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -radius * 0.7);
  ctx.stroke();
  ctx.restore();

  // Second hand
  ctx.save();
  ctx.strokeStyle = "red";
  ctx.rotate((Math.PI / 30) * second);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -radius * 0.9);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();

  let suffix = "";
  if (!is24Hour) {
    suffix = hours >= 12 ? " PM" : " AM";
    hours = hours % 12 || 12;
  }

  digitalClock.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}${suffix}`;
  dateEl.textContent = now.toDateString();
  timezoneEl.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
  drawAnalogClock(now);
}

function pad(num) {
  return num.toString().padStart(2, "0");
}

setInterval(updateClock, 1000);
updateClock();

toggleFormat.addEventListener("change", () => {
  is24Hour = toggleFormat.checked;
  updateClock();
});

// THEME TOGGLE
const toggleTheme = document.getElementById("toggleTheme");
toggleTheme.addEventListener("change", () => {
  document.body.classList.toggle("dark", toggleTheme.checked);
});

const themeColor = document.getElementById("themeColor");
themeColor.addEventListener("change", () => {
  document.documentElement.style.setProperty("--accent-color", themeColor.value);
});

// STOPWATCH
let stopwatchInterval;
let elapsed = 0;
let running = false;
let laps = [];

const stopwatchDisplay = document.getElementById("stopwatch");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const lapBtn = document.getElementById("lapBtn");
const exportBtn = document.getElementById("exportBtn");
const lapsList = document.getElementById("lapsList");
const lapStats = document.getElementById("lapStats");

function formatTime(ms) {
  let sec = Math.floor(ms / 1000);
  let hrs = Math.floor(sec / 3600);
  sec %= 3600;
  let min = Math.floor(sec / 60);
  sec = sec % 60;
  return `${pad(hrs)}:${pad(min)}:${pad(sec)}`;
}

function updateStopwatchDisplay() {
  stopwatchDisplay.textContent = formatTime(elapsed);
}

function startStopwatch() {
  if (!running) {
    running = true;
    const start = Date.now() - elapsed;
    stopwatchInterval = setInterval(() => {
      elapsed = Date.now() - start;
      updateStopwatchDisplay();
      localStorage.setItem("stopwatch", elapsed);
    }, 1000);
  }
}

function pauseStopwatch() {
  clearInterval(stopwatchInterval);
  running = false;
}

function resetStopwatch() {
  pauseStopwatch();
  elapsed = 0;
  laps = [];
  updateStopwatchDisplay();
  lapsList.innerHTML = "";
  lapStats.textContent = "";
  localStorage.removeItem("stopwatch");
}

function addLap() {
  if (!running) return;
  laps.push(elapsed);
  const li = document.createElement("li");
  li.textContent = `Lap ${laps.length}: ${formatTime(elapsed)}`;
  lapsList.appendChild(li);
  updateLapStats();
}

function updateLapStats() {
  if (laps.length < 2) return;
  const times = laps.map((t, i, arr) => i === 0 ? t : t - arr[i - 1]);
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  lapStats.textContent = `Fastest: ${formatTime(min)} | Slowest: ${formatTime(max)} | Avg: ${formatTime(avg)}`;
}

function exportLaps() {
  const text = laps.map((t, i) => `Lap ${i + 1}: ${formatTime(t)}`).join("\n");
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "laps.txt";
  a.click();
  URL.revokeObjectURL(url);
}

startBtn.addEventListener("click", startStopwatch);
pauseBtn.addEventListener("click", pauseStopwatch);
resetBtn.addEventListener("click", resetStopwatch);
lapBtn.addEventListener("click", addLap);
exportBtn.addEventListener("click", exportLaps);

if (localStorage.getItem("stopwatch")) {
  elapsed = parseInt(localStorage.getItem("stopwatch"), 10);
  updateStopwatchDisplay();
}

// COUNTDOWN TIMER
const countdownInput = document.getElementById("countdownInput");
const startCountdown = document.getElementById("startCountdown");
const countdownDisplay = document.getElementById("countdownDisplay");
let countdownInterval;

startCountdown.addEventListener("click", () => {
  const seconds = parseInt(countdownInput.value);
  if (!seconds || seconds <= 0) return;

  let remaining = seconds;
  countdownDisplay.textContent = formatCountdown(remaining);

  clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    remaining--;
    countdownDisplay.textContent = formatCountdown(remaining);
    if (remaining <= 0) {
      clearInterval(countdownInterval);
      alert("⏰ Time's up!");
    }
  }, 1000);
});

function formatCountdown(sec) {
  const min = Math.floor(sec / 60);
  sec %= 60;
  return `${pad(min)}:${pad(sec)}`;
}

// KEYBOARD SHORTCUTS
document.addEventListener("keydown", (e) => {
  switch (e.key.toLowerCase()) {
    case "s": startStopwatch(); break;
    case "p": pauseStopwatch(); break;
    case "r": resetStopwatch(); break;
    case "l": addLap(); break;
  }
});
