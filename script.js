const testArea = document.getElementById('testArea'),
      wpmEl = document.getElementById('wpm'),
      accEl = document.getElementById('accuracy'),
      wrongEl = document.getElementById('wrong'),
      lbBody = document.getElementById('leaderboardBody'),
      calBox = document.getElementById('calendarBox'),
      missedMsg = document.getElementById('missedMsg'),
      timerSelect = document.getElementById('timerSelect');

let timerDur = 60, timer, isRunning = false, startTS;
let labels = [], wpmData = [], accData = [], loginDays = JSON.parse(localStorage.getItem('loginDays') || '[]');

const ctx = document.getElementById('chart').getContext('2d');
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels,
    datasets: [
      { label: 'WPM', data: wpmData, borderColor: '#66d9ef', backgroundColor: 'rgba(102,217,239,0.2)', fill: true },
      { label: 'Accuracy%', data: accData, borderColor: '#33cc33', backgroundColor: 'rgba(51,204,51,0.2)', fill: true }
    ]
  },
  options: { responsive: true, scales: { y: { beginAtZero: true } } }
});

timerSelect.addEventListener('change', () => timerDur = +timerSelect.value);

function startTest() {
  if (isRunning) return;
  isRunning = true;
  testArea.disabled = false;
  testArea.value = '';
  testArea.focus();
  startTS = Date.now();
  timer = setTimeout(endTest, timerDur * 1000);
}

function endTest() {
  if (!isRunning) return;
  isRunning = false;
  testArea.disabled = true;
  clearTimeout(timer);

  const words = testArea.value.trim().split(/\s+/).filter(Boolean);
  const wpm = Math.round(words.length / (timerDur / 60));
  const wrong = Math.floor(words.length / 10);
  const acc = words.length ? Math.round((words.length - wrong) / words.length * 100) : 100;

  wpmEl.textContent = wpm;
  accEl.textContent = acc + '%';
  wrongEl.textContent = wrong;

  const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const sessions = JSON.parse(localStorage.getItem('leaderboard') || '[]');
  sessions.push({ time: t, wpm, acc });
  localStorage.setItem('leaderboard', JSON.stringify(sessions));
  updateLeaderboard();

  const todayKey = new Date().toISOString().split('T')[0];
  if (!loginDays.includes(todayKey)) {
    loginDays.push(todayKey);
    localStorage.setItem('loginDays', JSON.stringify(loginDays));
  }

  labels.push(t);
  wpmData.push(wpm);
  accData.push(acc);
  chart.update();

  renderCalendar();
  checkMissed();
}

function resetTest() {
  clearTimeout(timer);
  isRunning = false;
  testArea.disabled = true;
  testArea.value = '';
  wpmEl.textContent = '0'; accEl.textContent = '0%'; wrongEl.textContent = '0';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    isRunning ? endTest() : startTest();
  }
});

function switchTheme() {
  const themes = ['theme-default', 'theme-light', 'theme-ocean'];
  const cur = document.body.className;
  const i = themes.indexOf(cur);
  document.body.className = themes[(i + 1) % themes.length];
}

function updateLeaderboard() {
  const sessions = JSON.parse(localStorage.getItem('leaderboard') || '[]');
  lbBody.innerHTML = sessions.map(s => `<tr><td>${s.time}</td><td>${s.wpm}</td><td>${s.acc}%</td></tr>`).join('');
}

function renderCalendar() {
  const dt = new Date(), m = dt.getMonth(), y = dt.getFullYear();
  const firstDay = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();

  let html = `<div class="calendar-header">${dt.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>`;
  html += '<div class="calendar-weekdays">';
  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(d => html += `<div>${d}</div>`);
  html += '</div><div class="calendar-days">';

  for (let i = 0; i < firstDay; i++) html += '<div></div>';
  for (let d = 1; d <= days; d++) {
    const key = `${y}-${m + 1}-${d}`;
    html += `<div class="day${loginDays.includes(key) ? ' marked' : ''}">${d}</div>`;
  }
  html += '</div>';

  calBox.innerHTML = html;

  const grid = calBox.querySelector('.calendar-days');
  let sx = 0;
  grid.addEventListener('mousedown', e => sx = e.clientX);
  grid.addEventListener('mouseup', e => {
    const dx = e.clientX - sx;
    grid.style.transform = `translateX(${dx / 3}px)`;
    setTimeout(() => grid.style.transform = 'translateX(0)', 200);
  });
}

function checkMissed() {
  const today = new Date();
  let missed = 0;
  for (let i = 1; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split('T')[0];
    if (!loginDays.includes(key)) missed++;
  }
  missedMsg.textContent = missed ? `🔔 You missed ${missed} day(s) this week.` : '';
}

updateLeaderboard();
renderCalendar();
checkMissed();
