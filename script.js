// Typing Test Logic
const typingArea = document.getElementById("typingArea");
const timeDisplay = document.getElementById("timeDisplay");
const speedDisplay = document.getElementById("speed");
const accuracyDisplay = document.getElementById("accuracy");
const errorsDisplay = document.getElementById("errors");

let isTyping = false;
let startTime, timerInterval;
let totalTyped = 0, errorCount = 0;

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    if (!isTyping) {
      startTyping();
    } else {
      stopTyping();
    }
  }
});

function startTyping() {
  isTyping = true;
  typingArea.disabled = false;
  typingArea.focus();
  typingArea.value = "";
  totalTyped = 0;
  errorCount = 0;
  updateStats(0, 0, 0);
  startTime = new Date();
  timerInterval = setInterval(updateTime, 1000);
}

function stopTyping() {
  isTyping = false;
  clearInterval(timerInterval);
  typingArea.disabled = true;
  logLoginDay(); // log to calendar
}

function updateTime() {
  const elapsedSec = Math.floor((new Date() - startTime) / 1000);
  timeDisplay.textContent = `${elapsedSec}s`;
  const words = typingArea.value.trim().split(/\s+/);
  const chars = typingArea.value.trim().length;
  totalTyped = chars;

  const speed = Math.round((chars / 5) / (elapsedSec / 60));
  const accuracy = totalTyped === 0 ? 0 : Math.round(((totalTyped - errorCount) / totalTyped) * 100);

  updateStats(speed, accuracy, errorCount);
}

typingArea.addEventListener("input", () => {
  const value = typingArea.value;
  const wrongChars = value.match(/[^a-zA-Z0-9\s.,!?'"-]/g);
  errorCount = wrongChars ? wrongChars.length : 0;
});

function updateStats(wpm, acc, errors) {
  speedDisplay.textContent = wpm;
  accuracyDisplay.textContent = acc;
  errorsDisplay.textContent = errors;
}

// Calendar Logic
const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
const calendarWrapper = document.getElementById("calendarWrapper");
const toggleModeBtn = document.getElementById("toggleMode");

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
const visitedDays = getVisitedDays();

function getVisitedDays() {
  const stored = localStorage.getItem("visitedDays");
  const today = formatDate(new Date());
  const all = stored ? JSON.parse(stored) : [];
  if (!all.includes(today)) {
    all.push(today);
    localStorage.setItem("visitedDays", JSON.stringify(all));
  }
  return all;
}

function logLoginDay() {
  const today = formatDate(new Date());
  if (!visitedDays.includes(today)) {
    visitedDays.push(today);
    localStorage.setItem("visitedDays", JSON.stringify(visitedDays));
    renderCalendar(currentMonth, currentYear);
  }
}

function formatDate(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function renderCalendar(month, year) {
  calendar.innerHTML = "";
  const firstDay = new Date(year, month).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  monthYear.textContent = `${new Date(year, month).toLocaleString("default", { month: "long" })} ${year}`;

  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement("div");
    calendar.appendChild(blank);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${month}-${day}`;
    const cell = document.createElement("div");
    cell.className = "calendar-day";
    cell.textContent = day;
    if (visitedDays.includes(dateKey)) {
      cell.classList.add("marked");
    }
    calendar.appendChild(cell);
  }
}

function prevMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar(currentMonth, currentYear);
}

function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar(currentMonth, currentYear);
}

let startX = 0;

calendarWrapper.addEventListener("mousedown", (e) => startX = e.clientX);
calendarWrapper.addEventListener("mouseup", (e) => handleSwipe(e.clientX - startX));
calendarWrapper.addEventListener("touchstart", (e) => startX = e.touches[0].clientX);
calendarWrapper.addEventListener("touchend", (e) => handleSwipe(e.changedTouches[0].clientX - startX));

function handleSwipe(deltaX) {
  const threshold = 50;
  if (deltaX > threshold) prevMonth();
  else if (deltaX < -threshold) nextMonth();
}

// Theme toggle
toggleModeBtn.onclick = () => document.body.classList.toggle("light");

// Init
renderCalendar(currentMonth, currentYear);
