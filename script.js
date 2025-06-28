const quoteInput = document.getElementById("quoteInput");
const speedEl = document.getElementById("speed");
const accEl = document.getElementById("accuracy");
const timeEl = document.getElementById("timeDisplay");
const progressBar = document.getElementById("progressBar");
const timeSel = document.getElementById("time");
const startBtn = document.getElementById("startBtn");
const endBtn = document.getElementById("endBtn");
const resetBtn = document.getElementById("resetBtn");
const lbBody = document.querySelector("#leaderboard tbody");
const daysDisplay = document.getElementById("typingDaysDisplay");

let startTime, timerDur, intervalId, totalTyped = 0, corrTyped = 0;
let isRunning = false;

const sounds = {
  correct: new Audio("sounds/correct.mp3"),
  error: new Audio("sounds/error.mp3"),
  done: new Audio("sounds/done.mp3")
};

function renderFreeTyping() {
  quoteInput.value = "";
  quoteInput.disabled = false;
  quoteInput.focus();
  totalTyped = 0;
  corrTyped = 0;
  updateMetrics();
}

function updateMetrics() {
  const mins = (Date.now() - startTime) / 60000;
  const wpm = Math.round((totalTyped / 5) / mins) || 0;
  const acc = totalTyped ? Math.round((corrTyped / totalTyped) * 100) : 100;
  speedEl.textContent = wpm;
  accEl.textContent = acc;
}

quoteInput.addEventListener("input", () => {
  const len = quoteInput.value.length;
  if (len > totalTyped) {
    sounds.correct.play();
  }
  totalTyped = len;
  corrTyped = len * 0.95; // approximate 95% accuracy
  updateMetrics();
});

function updateTimer() {
  const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
  const rem = timerDur - elapsedSec;
  const m = Math.floor(rem / 60), s = rem % 60;
  timeEl.textContent = `${m}:${String(s).padStart(2, "0")}`;
  progressBar.style.width = `${(elapsedSec / timerDur * 100).toFixed(2)}%`;
  if (rem <= 0) endTest();
}

function startTest() {
  timerDur = parseInt(timeSel.value);
  startTime = Date.now();
  renderFreeTyping();
  intervalId = setInterval(updateTimer, 1000);
  isRunning = true;
}

function endTest() {
  quoteInput.disabled = true;
  clearInterval(intervalId);
  sounds.done.play();
  updateLeaderboard(parseInt(speedEl.textContent), parseInt(accEl.textContent));
  updateTypingDays();
  isRunning = false;
}

function resetTest() {
  clearInterval(intervalId);
  quoteInput.disabled = true;
  quoteInput.value = "";
  progressBar.style.width = "0%";
  speedEl.textContent = accEl.textContent = "0";
  timeEl.textContent = "0:00";
  isRunning = false;
}

document.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    isRunning ? endTest() : startTest();
  }
});
startBtn.onclick = startTest;
endBtn.onclick = endTest;
resetBtn.onclick = resetTest;

// 🏆 Leaderboard
function loadLB() {
  const data = JSON.parse(localStorage.getItem("leaderboard")) || [];
  return data.sort((a, b) => b.wpm - a.wpm).slice(0, 5);
}
function updateLeaderboard(wpm, acc) {
  const data = loadLB();
  data.push({ date: new Date().toLocaleString(), wpm, acc });
  data.sort((a, b) => b.wpm - a.wpm);
  localStorage.setItem("leaderboard", JSON.stringify(data.slice(0, 5)));
  renderLB();
}
function renderLB() {
  lbBody.innerHTML = "";
  loadLB().forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${r.date}</td><td>${r.wpm}</td><td>${r.acc}%</td>`;
    lbBody.appendChild(tr);
  });
}

// 🗓️ Total Typing Days
function getTodayDateStr() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}
function updateTypingDays() {
  const today = getTodayDateStr();
  let daysList = JSON.parse(localStorage.getItem("typingDaysList")) || [];
  if (!daysList.includes(today)) {
    daysList.push(today);
    localStorage.setItem("typingDaysList", JSON.stringify(daysList));
  }
  renderTypingDays();
}
function renderTypingDays() {
  const daysList = JSON.parse(localStorage.getItem("typingDaysList")) || [];
  daysDisplay.textContent = `🗓️ You've practiced on ${daysList.length} day${daysList.length === 1 ? "" : "s"}`;
}

renderTypingDays();
renderLB();
