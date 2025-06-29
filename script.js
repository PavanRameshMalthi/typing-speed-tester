let isRunning = false;
let startTime, timer, testDuration = 60;
let loginDays = JSON.parse(localStorage.getItem("loginDays") || "[]");
let history = JSON.parse(localStorage.getItem("typingHistory") || "[]");

const testInput = document.getElementById("testInput");
const wpmEl = document.getElementById("wpm");
const accEl = document.getElementById("accuracy");
const wrongEl = document.getElementById("wrong");

const missedMsg = document.getElementById("missedMsg");
const calendarBox = document.getElementById("calendarBox");
const loginDaysCount = document.getElementById("loginDaysCount");
const historyBody = document.getElementById("historyBody");
const themeSelect = document.getElementById("themeSelect");
const graphCtx = document.getElementById("graph").getContext("2d");

const chart = new Chart(graphCtx, {
  type: "line",
  data: { labels: [], datasets: [
      { label: "WPM", data: [], borderColor: "#007bff", fill: false },
      { label: "Accuracy%", data: [], borderColor: "#28a745", fill: false }
  ] },
  options: { responsive: true, scales: { y: { beginAtZero: true } } }
});

themeSelect.addEventListener("change", switchColorTheme);

document.getElementById("timeSelect").addEventListener("change", (e) => {
  testDuration = +e.target.value;
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    if (!isRunning) startTest();
    else endTest();
  }
});

function startTest() {
  isRunning = true;
  testInput.disabled = false;
  testInput.value = "";
  startTime = Date.now();
  timer = setTimeout(endTest, testDuration * 1000);
}

function endTest() {
  if (!isRunning) return;
  isRunning = false;
  clearTimeout(timer);
  testInput.disabled = true;

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  const words = testInput.value.trim().split(/\s+/).filter(Boolean);
  const wpm = Math.round(words.length / (elapsed / 60));
  const wrong = words.filter(w => !/^[a-zA-Z]+$/.test(w)).length;
  const acc = words.length
    ? Math.round(((words.length - wrong) / words.length) * 100)
    : 100;

  wpmEl.textContent = wpm;
  accEl.textContent = acc + "%";
  wrongEl.textContent = wrong;

  chart.data.labels.push(new Date().toLocaleTimeString());
  chart.data.datasets[0].data.push(wpm);
  chart.data.datasets[1].data.push(acc);
  chart.update();

  saveLogin();
  saveHistory(elapsed, wpm, acc, wrong);
  renderCalendar();
  renderHistory();
  checkMissed();
}

function resetTest() {
  clearTimeout(timer);
  isRunning = false;
  testInput.disabled = true;
  testInput.value = "";
  wpmEl.textContent = "0";
  accEl.textContent = "0%";
  wrongEl.textContent = "0";
}

function saveLogin() {
  const key = new Date().toISOString().split("T")[0];
  if (!loginDays.includes(key)) {
    loginDays.push(key);
    localStorage.setItem("loginDays", JSON.stringify(loginDays));
  }
}

function renderCalendar() {
  const now = new Date(), month = now.getMonth(), year = now.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  calendarBox.innerHTML = "";
  let count = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${month + 1}-${d}`;
    const div = document.createElement("div");
    div.textContent = d;
    if (loginDays.includes(key)) {
      div.classList.add("marked");
      count++;
    }
    calendarBox.appendChild(div);
  }
  loginDaysCount.textContent = count;
}

function saveHistory(elapsed, wpm, acc, wrong) {
  const entry = {
    timestamp: new Date().toLocaleString(),
    duration: elapsed,
    wpm, acc, wrong
  };
  history.push(entry);
  localStorage.setItem("typingHistory", JSON.stringify(history));
}

function renderHistory() {
  historyBody.innerHTML = "";
  history.forEach(h => {
    historyBody.innerHTML += `
      <tr>
        <td>${h.timestamp}</td>
        <td>${h.duration}</td>
        <td>${h.wpm}</td>
        <td>${h.acc}%</td>
        <td>${h.wrong}</td>
      </tr>`;
  });
}

function checkMissed() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const key = yesterday.toISOString().split("T")[0];
  missedMsg.textContent = loginDays.includes(key)
    ? ""
    : "🔔 You missed yesterday!";
}

function toggleTheme() {
  const body = document.body;
  if (body.className === "light") body.className = "dark";
  else if (body.className === "dark") body.className = "colorful";
  else body.className = "light";
  themeSelect.value = body.className;
}

function switchColorTheme() {
  document.body.className = themeSelect.value;
}

// Initial render
renderCalendar();
renderHistory();
checkMissed();
