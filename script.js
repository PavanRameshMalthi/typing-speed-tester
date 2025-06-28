// =======================
// 🌙 Dark/Light Mode Toggle
// =======================
const body = document.body;
const toggleBtn = document.getElementById('toggleMode');
const savedMode = localStorage.getItem('theme') || 'dark';
body.classList.add(savedMode);

toggleBtn.addEventListener('click', () => {
  body.classList.toggle('dark');
  body.classList.toggle('light');
  const mode = body.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('theme', mode);
});

// =======================
// ✍️ Typing Test Setup
// =======================
const typingArea = document.getElementById('typingArea');
const timeDisplay = document.getElementById('timeDisplay');
const speedDisplay = document.getElementById('speed');
const accuracyDisplay = document.getElementById('accuracy');
const errorDisplay = document.getElementById('errors');
const missedAlert = document.getElementById('missedAlert');

let startTime, interval, started = false;
let errorCount = 0, totalTyped = 0;

// Load or initialize login dates
let loginDates = JSON.parse(localStorage.getItem('loginDates')) || [];

// Start or End Typing Test on Enter
document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && !started) {
    e.preventDefault();
    startTyping();
  } else if (e.key === 'Enter' && started) {
    e.preventDefault();
    endTyping();
  }
});

typingArea.addEventListener('input', () => {
  const words = typingArea.value.trim().split(/\s+/);
  const totalWords = words.length;
  totalTyped++;

  const wrongWords = words.filter(w => !dictionary.includes(w.toLowerCase()));
  errorCount = wrongWords.length;

  const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
  const wpm = Math.round(totalWords / timeElapsed);
  const accuracy = Math.round(((totalTyped - errorCount) / totalTyped) * 100);

  speedDisplay.textContent = isFinite(wpm) ? wpm : 0;
  accuracyDisplay.textContent = isFinite(accuracy) ? accuracy : 100;
  errorDisplay.textContent = errorCount;

  updateGraph(wpm, accuracy);
});

function startTyping() {
  started = true;
  typingArea.disabled = false;
  typingArea.focus();
  typingArea.value = '';
  startTime = Date.now();
  errorCount = 0;
  totalTyped = 0;
  interval = setInterval(updateTime, 1000);
  updateTime();

  recordLoginDay();
}

function endTyping() {
  started = false;
  clearInterval(interval);
  typingArea.disabled = true;

  const date = new Date().toLocaleDateString();
  const speed = parseInt(speedDisplay.textContent);
  const accuracy = parseInt(accuracyDisplay.textContent);
  updateLeaderboard(date, speed, accuracy);
}

function updateTime() {
  const seconds = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(seconds / 60);
  timeDisplay.textContent = `${minutes}m ${seconds % 60}s`;
}

// =======================
// 📅 Calendar
// =======================
const calendar = document.getElementById('calendar');
const monthYear = document.getElementById('monthYear');
const prevMonth = document.getElementById('prevMonth');
const nextMonth = document.getElementById('nextMonth');

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function generateCalendar(month, year) {
  calendar.innerHTML = '';
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = Array(firstDay).fill('').concat([...Array(daysInMonth).keys()].map(d => d + 1));

  daysArray.forEach(day => {
    const div = document.createElement('div');
    div.className = 'calendar-day';
    if (day) {
      div.textContent = day;

      const dateKey = `${year}-${month + 1}-${day}`;
      if (loginDates.includes(dateKey)) {
        div.classList.add('marked');
      }
    }
    calendar.appendChild(div);
  });

  const dateText = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });
  monthYear.textContent = dateText;
}

function recordLoginDay() {
  const now = new Date();
  const today = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  if (!loginDates.includes(today)) {
    loginDates.push(today);
    localStorage.setItem('loginDates', JSON.stringify(loginDates));
    checkMissedDays();
  }
  generateCalendar(currentMonth, currentYear);
}

prevMonth.onclick = () => {
  currentMonth = (currentMonth - 1 + 12) % 12;
  if (currentMonth === 11) currentYear--;
  generateCalendar(currentMonth, currentYear);
};

nextMonth.onclick = () => {
  currentMonth = (currentMonth + 1) % 12;
  if (currentMonth === 0) currentYear++;
  generateCalendar(currentMonth, currentYear);
};

function checkMissedDays() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;
  if (!loginDates.includes(yesterdayKey)) {
    missedAlert.textContent = "🔔 You missed a day!";
  } else {
    missedAlert.textContent = "";
  }
}

// =======================
// 📈 Chart.js: Graph Display
// =======================
const ctx = document.getElementById('trendChart').getContext('2d');
let trendChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Speed (WPM)',
        data: [],
        borderColor: '#007bff',
        fill: false
      },
      {
        label: 'Accuracy (%)',
        data: [],
        borderColor: '#28a745',
        fill: false
      }
    ]
  }
});

function updateGraph(speed, accuracy) {
  const now = new Date().toLocaleTimeString();
  trendChart.data.labels.push(now);
  trendChart.data.datasets[0].data.push(speed);
  trendChart.data.datasets[1].data.push(accuracy);
  trendChart.update();
}

// =======================
// 🏆 Leaderboard
// =======================
function updateLeaderboard(date, wpm, accuracy) {
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
  leaderboard.push({ date, wpm, accuracy });
  leaderboard.sort((a, b) => b.wpm - a.wpm);
  const top5 = leaderboard.slice(0, 5);
  localStorage.setItem('leaderboard', JSON.stringify(top5));
  displayLeaderboard(top5);
}

function displayLeaderboard(entries) {
  const tbody = document.querySelector('#leaderboard tbody');
  tbody.innerHTML = '';
  entries.forEach(e => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${e.date}</td><td>${e.wpm}</td><td>${e.accuracy}%</td>`;
    tbody.appendChild(row);
  });
}



// Initialize everything
generateCalendar(currentMonth, currentYear);
displayLeaderboard(JSON.parse(localStorage.getItem('leaderboard')) || []);
checkMissedDays();
