// Typing Test
const typingArea = document.getElementById("typingArea"), timeDisplay = document.getElementById("timeDisplay"),
  speedDisplay = document.getElementById("speed"), accuracyDisplay = document.getElementById("accuracy"),
  errorsDisplay = document.getElementById("errors"), missedAlert = document.getElementById("missedAlert");
let isTyping = false, startTime, timerInterval, totalTyped = 0, errorCount = 0;

document.addEventListener("keydown", e => {
  if (e.key === "Enter") { e.preventDefault(); isTyping ? stopTyping() : startTyping(); }
});

function startTyping() {
  isTyping = true; typingArea.disabled = false; typingArea.value = ""; typingArea.focus();
  totalTyped = 0; errorCount = 0; updateStats(0, 0, 0);
  startTime = Date.now(); timerInterval = setInterval(updateTime, 1000);
  missedAlert.textContent = "";
}
function stopTyping() {
  isTyping = false; clearInterval(timerInterval); typingArea.disabled = true; logLoginDay();
  addSession(); renderLeaderboard(); renderChart(); checkMissedDay();
}
function updateTime() {
  const sec = Math.floor((Date.now() - startTime) / 1000);
  timeDisplay.textContent = sec + "s";
  const text = typingArea.value.trim(), chars = text.length;
  totalTyped = chars; errorCount = (text.match(/[^a-zA-Z0-9\s.,!?'"-]/g) || []).length;
  const wpm = chars ? Math.round((chars / 5) / (sec / 60)) : 0;
  const acc = chars ? Math.round(((chars - errorCount) / chars) * 100) : 0;
  updateStats(wpm, acc, errorCount);
}
function updateStats(wpm, acc, err) {
  speedDisplay.textContent = wpm; accuracyDisplay.textContent = acc; errorsDisplay.textContent = err;
}

// Sessions and Leaderboard
function getSessions() {
  return JSON.parse(localStorage.getItem("sessions") || "[]");
}
function addSession() {
  const now = new Date().toLocaleString();
  const wpm = parseInt(speedDisplay.textContent), acc = parseInt(accuracyDisplay.textContent);
  const arr = getSessions(); arr.push({ date: now, wpm, acc });
  arr.sort((a,b)=>b.wpm - a.wpm); localStorage.setItem("sessions", JSON.stringify(arr.slice(0,5)));
}
function renderLeaderboard() {
  const tbody = document.querySelector("#leaderboard tbody"); tbody.innerHTML = "";
  getSessions().forEach(r => {
    const tr = document.createElement("tr"); tr.innerHTML = `<td>${r.date}</td><td>${r.wpm}</td><td>${r.acc}%</td>`;
    tbody.appendChild(tr);
  });
}

// Login Days & Missing Check
let visitedDays = JSON.parse(localStorage.getItem("visitedDays")||"[]");
function logLoginDay() {
  const d = new Date(), key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  if (!visitedDays.includes(key)) { visitedDays.push(key); localStorage.setItem("visitedDays", JSON.stringify(visitedDays)); }
  renderCalendar(), renderChart(), renderLeaderboard();
}
function checkMissedDay() {
  const today = new Date(), yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (!visitedDays.includes(`${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`)) {
    missedAlert.textContent = "⚠️ You missed yesterday!";
  }
}

// Calendar
const calendar = document.getElementById("calendar"), monthYear = document.getElementById("monthYear"),
  prevBtn = document.getElementById("prevMonth"), nextBtn = document.getElementById("nextMonth"),
  wrapper = document.getElementById("calendarWrapper");
let curMonth = (new Date()).getMonth(), curYear = (new Date()).getFullYear();

function renderCalendar() {
  calendar.innerHTML = "";
  const first = new Date(curYear, curMonth,1).getDay(), daysIn = new Date(curYear,curMonth+1,0).getDate();
  monthYear.textContent = `${new Date(curYear,curMonth).toLocaleString("default",{month:"long"})} ${curYear}`;
  for(let i=0;i<first;i++) calendar.appendChild(document.createElement("div"));
  for(let d=1; d<=daysIn; d++){
    const key = `${curYear}-${curMonth}-${d}`, cell = document.createElement("div");
    cell.className = "calendar-day"; cell.textContent = d;
    if (visitedDays.includes(key)) cell.classList.add("marked");
    calendar.appendChild(cell);
  }
}
prevBtn.onclick = ()=>{curMonth--; if(curMonth<0){curMonth=11;curYear--;} renderCalendar();}
nextBtn.onclick = ()=>{curMonth++; if(curMonth>11){curMonth=0;curYear++;} renderCalendar();}
let x0=0;
wrapper.addEventListener("mousedown",e=>x0=e.clientX);
wrapper.addEventListener("mouseup",e=>{if(e.clientX - x0>50) prevBtn.onclick(); else if(e.clientX-x0< -50) nextBtn.onclick();});
wrapper.addEventListener("touchstart",e=>x0=e.touches[0].clientX);
wrapper.addEventListener("touchend",e=>{const d=e.changedTouches[0].clientX - x0; if(d>50) prevBtn.onclick(); else if(d<-50) nextBtn.onclick();});

// Graph using Chart.js
let chart = null;
function renderChart() {
  const data = getSessions().slice().reverse();
  const labels = data.map(r=>r.date), speeds = data.map(r=>r.wpm), accs = data.map(r=>r.acc);
  if (chart) chart.destroy();
  chart = new Chart(document.getElementById("trendChart"), {
    type: 'line',
    data: { labels, datasets:[
      { label:'WPM', data:speeds, borderColor:'#00e676', fill:false },
      { label:'Accuracy', data:accs, borderColor:'#ffca28', fill:false }
    ]},
    options:{responsive:true, scales:{y:{beginAtZero:true}}}
  });
}

// Theme Toggle
document.getElementById("toggleMode").onclick = ()=>document.body.classList.toggle("light");

// Initialize
renderLeaderboard(); renderCalendar(); renderChart(); checkMissedDay();
