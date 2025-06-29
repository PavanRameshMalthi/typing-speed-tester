// Theme toggle
const body = document.body;
const theme = localStorage.getItem('theme') || 'dark';
body.classList.add(theme);

document.getElementById('toggleMode').addEventListener('click', () => {
  body.classList.toggle('dark');
  body.classList.toggle('light');
  localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
});

// Typing Test variables
const typingInput = document.getElementById('typingInput');
const speedEl = document.getElementById('speed');
const accuracyEl = document.getElementById('accuracy');
const wrongCountEl = document.getElementById('wrongCount');
const missedAlert = document.getElementById('missedAlert');

let started = false, startTime = 0;
let loginDates = JSON.parse(localStorage.getItem('loginDates') || '[]');

// Sample dictionary
const dictionary = ['hello', 'world', 'typing', 'test', 'speed', 'accuracy', 'practice', 'code'];

typingInput.addEventListener('input', updateTypingStats);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    started ? endTyping() : startTyping();
  }
});

function startTyping() {
  started = true;
  typingInput.disabled = false;
  typingInput.value = '';
  startTime = Date.now();
  missedAlert.textContent = '';
  updateTypingStats();
}

function endTyping() {
  started = false;
  typingInput.disabled = true;
  recordToday();
  updateLeaderboard();
  updateChart();
  checkMissed();
}

// WPM & accuracy logic
function updateTypingStats() {
  if (!started) return;
  const text = typingInput.value.trim();
  const words = text ? text.split(/\s+/) : [];
  const elapsedMin = (Date.now() - startTime) / 60000;

  let correct = 0;
  words.forEach(w => {
    if (dictionary.includes(w.toLowerCase())) correct++;
  });

  const wpm = elapsedMin > 0 ? Math.round(correct / elapsedMin) : 0;
  const accuracy = words.length > 0 ? Math.round((correct / words.length) * 100) : 0;

  speedEl.textContent = wpm;
  accuracyEl.textContent = accuracy + '%';
  wrongCountEl.textContent = words.length - correct;
}

// Record login-day
function recordToday() {
  const now = new Date();
  const key = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
  if (!loginDates.includes(key)) {
    loginDates.push(key);
    localStorage.setItem('loginDates', JSON.stringify(loginDates));
  }
  renderCalendar(currentMonth, currentYear);
}

// Missed-day alert
function checkMissed() {
  const today = new Date();
  const y = new Date(today);
  y.setDate(y.getDate() - 1);
  const key = `${y.getFullYear()}-${y.getMonth()+1}-${y.getDate()}`;
  missedAlert.textContent = loginDates.includes(key) ? '' : '🔔 You missed yesterday!';
}

// Leaderboard
function updateLeaderboard() {
  let sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
  sessions.push({
    date: new Date().toLocaleDateString(),
    wpm: parseInt(speedEl.textContent),
    acc: parseInt(accuracyEl.textContent)
  });
  sessions.sort((a,b)=>b.wpm - a.wpm);
  sessions = sessions.slice(0,5);
  localStorage.setItem('sessions', JSON.stringify(sessions));

  const tbody = document.getElementById('leaderboardBody');
  tbody.innerHTML = '';
  sessions.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${s.date}</td><td>${s.wpm}</td><td>${s.acc}%</td>`;
    tbody.appendChild(tr);
  });
}

// Chart
const ctx = document.getElementById('trendChart').getContext('2d');
const chart = new Chart(ctx, {
  type: 'line',
  data: { labels: [], datasets: [
    { label: 'WPM', data: [], borderColor: 'var(--primary-dark)', fill: false },
    { label: 'Accuracy', data: [], borderColor: '#28a745', fill: false },
  ]},
  options: { scales: { y: { beginAtZero: true } } }
});

function updateChart() {
  const sessions = JSON.parse(localStorage.getItem('sessions') || '[]').slice().reverse();
  chart.data.labels = sessions.map(s => s.date);
  chart.data.datasets[0].data = sessions.map(s => s.wpm);
  chart.data.datasets[1].data = sessions.map(s => s.acc);
  chart.update();
}

// Calendar
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
const calendarEl = document.getElementById('calendar');

function renderCalendar(m, y) {
  calendarEl.innerHTML = '';
  const firstDay = new Date(y, m, 1).getDay();
  const days = new Date(y, m+1, 0).getDate();
  document.getElementById('monthYear').textContent =
    new Date(y, m).toLocaleString('default',{month:'long',year:'numeric'});

  for (let i = 0; i < firstDay; i++) calendarEl.appendChild(document.createElement('div'));
  for (let d = 1; d <= days; d++) {
    const div = document.createElement('div');
    div.className = 'calendar-day';
    div.textContent = d;
    const key = `${y}-${m+1}-${d}`;
    if (loginDates.includes(key)) div.classList.add('marked');
    calendarEl.appendChild(div);
  }
}

document.getElementById('prevMonth').onclick = () => {
  currentMonth--; if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  renderCalendar(currentMonth, currentYear);
};
document.getElementById('nextMonth').onclick = () => {
  currentMonth++; if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  renderCalendar(currentMonth, currentYear);
};
let sx = 0;
document.getElementById('calendarWrapper').addEventListener('mousedown', e => sx = e.clientX);
document.getElementById('calendarWrapper').addEventListener('mouseup', e => {
  const dx = e.clientX - sx;
  if (dx > 50) document.getElementById('prevMonth').click();
  else if (dx < -50) document.getElementById('nextMonth').click();
});
document.getElementById('calendarWrapper').addEventListener('touchstart', e => sx = e.touches[0].clientX);
document.getElementById('calendarWrapper').addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - sx;
  if (dx > 50) document.getElementById('prevMonth').click();
  else if (dx < -50) document.getElementById('nextMonth').click();
});

// Initialization
renderCalendar(currentMonth, currentYear);
updateLeaderboard();
updateChart();
checkMissed();
