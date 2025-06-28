const editor = document.getElementById("editor");
const speedEl = document.getElementById("speed");
const accEl = document.getElementById("accuracy");
const wrongEl = document.getElementById("wrongWords");
const timeEl = document.getElementById("timeDisplay");
const progressBar = document.getElementById("progressBar");
const timeSel = document.getElementById("time");
const startBtn = document.getElementById("startBtn");
const endBtn = document.getElementById("endBtn");
const resetBtn = document.getElementById("resetBtn");
const daysTypedEl = document.getElementById("daysTyped");
const calendar = document.getElementById("calendar");
const toggleModeBtn = document.getElementById("toggleMode");

const monthYearLabel = document.getElementById("monthYear");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let startTime, timerDur, intervalId;
let isRunning = false;

function updateTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const remaining = timerDur - elapsed;
  const min = Math.floor(remaining / 60);
  const sec = remaining % 60;
  timeEl.textContent = `${min}:${String(sec).padStart(2, "0")}`;
  progressBar.style.width = `${(elapsed / timerDur) * 100}%`;
  if (remaining <= 0) endTest();
}

function updateMetrics() {
  const text = editor.innerText.trim();
  const words = text.split(/\s+/).filter(w => w);
  const wrongWords = words.filter(word => /[^a-zA-Z]/.test(word)).length;
  const totalChars = text.length;
  const mins = (Date.now() - startTime) / 60000;
  const wpm = Math.round(words.length / mins) || 0;
  const accuracy = totalChars
    ? Math.max(0, Math.round(((totalChars - wrongWords * 5) / totalChars) * 100))
    : 100;

  speedEl.textContent = wpm;
  accEl.textContent = accuracy;
  wrongEl.textContent = wrongWords;
}

function startTest() {
  timerDur = parseInt(timeSel.value);
  startTime = Date.now();
  editor.innerText = "";
  editor.contentEditable = true;
  editor.focus();
  intervalId = setInterval(() => {
    updateTimer();
    updateMetrics();
  }, 1000);
  isRunning = true;
}

function endTest() {
  clearInterval(intervalId);
  editor.contentEditable = false;
  updateMetrics();
  isRunning = false;
  saveTypingDay();
}

function resetTest() {
  clearInterval(intervalId);
  editor.innerText = "";
  editor.contentEditable = false;
  progressBar.style.width = "0%";
  speedEl.textContent = accEl.textContent = wrongEl.textContent = "0";
  timeEl.textContent = "0:00";
  isRunning = false;
}

function saveTypingDay() {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  let storedDays = JSON.parse(localStorage.getItem("typingDays")) || [];

  if (!storedDays.includes(dateStr)) {
    storedDays.push(dateStr);
    localStorage.setItem("typingDays", JSON.stringify(storedDays));
  }

  daysTypedEl.textContent = storedDays.length;
  renderCalendar(currentMonth, currentYear);
}

function renderCalendar(month, year) {
  calendar.innerHTML = "";
  const storedDays = JSON.parse(localStorage.getItem("typingDays")) || [];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  monthYearLabel.textContent = `${new Date(year, month).toLocaleString("default", { month: "long" })} ${year}`;

  for (let i = 0; i < firstDay; i++) {
    calendar.innerHTML += `<div></div>`;
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const dayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    const div = document.createElement("div");
    div.className = "calendar-day";
    div.innerText = i;
    if (storedDays.includes(dayStr)) div.classList.add("marked");
    calendar.appendChild(div);
  }
}

toggleModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
});

startBtn.onclick = startTest;
endBtn.onclick = endTest;
resetBtn.onclick = resetTest;

prevMonthBtn.onclick = () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar(currentMonth, currentYear);
};

nextMonthBtn.onclick = () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar(currentMonth, currentYear);
};

editor.addEventListener("input", updateMetrics);
document.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    isRunning ? endTest() : startTest();
  }
});

window.onload = () => {
  const storedDays = JSON.parse(localStorage.getItem("typingDays")) || [];
  daysTypedEl.textContent = storedDays.length;
  renderCalendar(currentMonth, currentYear);
};
