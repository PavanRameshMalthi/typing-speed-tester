let isRunning = false;
let startTime, timer, testDuration = 60;
let loginDays = JSON.parse(localStorage.getItem('loginDays') || '[]');

const testInput = document.getElementById("testInput");
const wpmEl = document.getElementById("wpm");
const accEl = document.getElementById("accuracy");
const wrongEl = document.getElementById("wrong");

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    if (!isRunning) startTest();
    else endTest();
  }
});

function startTest() {
  isRunning = true;
  testInput.disabled = false;
  testInput.focus();
  testInput.value = "";
  startTime = new Date();
  timer = setTimeout(endTest, testDuration * 1000);
}

function endTest() {
  isRunning = false;
  clearTimeout(timer);
  testInput.disabled = true;
  calculateResults();
  saveLogin();
  renderCalendar();
  updateLeaderboard();
}

function resetTest() {
  testInput.value = "";
  wpmEl.textContent = "0";
  accEl.textContent = "0%";
  wrongEl.textContent = "0";
  document.getElementById("missedMsg").textContent = "";
}

function calculateResults() {
  const words = testInput.value.trim().split(/\s+/);
  const totalChars = testInput.value.length;
  const minutes = testDuration / 60;
  const wpm = Math.round((words.length / minutes));
  let wrong = 0;

  for (let word of words) {
    if (!/^[a-zA-Z]+$/.test(word)) wrong++;
  }

  const accuracy = Math.max(0, Math.round(((words.length - wrong) / words.length) * 100));

  wpmEl.textContent = wpm;
  accEl.textContent = accuracy + "%";
  wrongEl.textContent = wrong;

  updateGraph(wpm, accuracy);
  updateLeaderboard(wpm, accuracy);
}

function updateGraph(wpm, acc) {
  const ctx = document.getElementById("graph").getContext("2d");
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['WPM', 'Accuracy'],
      datasets: [{
        label: 'Performance',
        data: [wpm, acc],
        borderColor: '#007bff',
        backgroundColor: 'rgba(0,123,255,0.1)',
        tension: 0.3
      }]
    },
    options: { responsive: true }
  });
}

function updateLeaderboard(wpm = 0, acc = 0) {
  const lb = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  if (wpm && acc) lb.push({ time: new Date().toLocaleTimeString(), wpm, acc });
  localStorage.setItem("leaderboard", JSON.stringify(lb.slice(-10)));

  const body = document.getElementById("leaderboardBody");
  body.innerHTML = "";
  lb.slice(-10).reverse().forEach(entry => {
    body.innerHTML += `<tr><td>${entry.time}</td><td>${entry.wpm}</td><td>${entry.acc}%</td></tr>`;
  });
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
}

function switchColorTheme() {
  const value = document.getElementById("themeSelect").value;
  document.body.className = value;
}

document.getElementById("timeSelect").addEventListener("change", function() {
  testDuration = parseInt(this.value);
});

function saveLogin() {
  const now = new Date();
  const key = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
  if (!loginDays.includes(key)) loginDays.push(key);
  localStorage.setItem("loginDays", JSON.stringify(loginDays));
}

function renderCalendar() {
  const box = document.getElementById("calendarBox");
  box.innerHTML = "";
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  let count = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${now.getFullYear()}-${now.getMonth() + 1}-${d}`;
    const div = document.createElement("div");
    div.textContent = d;
    if (loginDays.includes(key)) {
      div.classList.add("marked");
      count++;
    }
    box.appendChild(div);
  }
  document.getElementById("loginDaysCount").textContent = count;

  const lastLogin = loginDays[loginDays.length - 1];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const missed = `${yesterday.getFullYear()}-${yesterday.getMonth()+1}-${yesterday.getDate()}`;
  if (lastLogin !== missed) {
    document.getElementById("missedMsg").textContent = "🔔 You missed a day!";
  }
}

renderCalendar();
updateLeaderboard();
