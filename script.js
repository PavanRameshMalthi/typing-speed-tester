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
const lbBody = document.querySelector("#leaderboard tbody");
const daysDisplay = document.getElementById("typingDaysDisplay");

let startTime, timerDur, intervalId;
let totalChars = 0, correctChars = 0, wrongWords = 0;
let isRunning = false;
let checkedWords = {};

function updateTimer() {
  const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
  const rem = timerDur - elapsedSec;
  const m = Math.floor(rem / 60), s = rem % 60;
  timeEl.textContent = `${m}:${String(s).padStart(2, "0")}`;
  progressBar.style.width = `${(elapsedSec / timerDur * 100).toFixed(2)}%`;
  if (rem <= 0) endTest();
}

function validateWord(word) {
  word = word.toLowerCase().replace(/[^a-z]/gi, '');
  if (!word || checkedWords[word] !== undefined) return;
  fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    .then(res => {
      checkedWords[word] = res.ok;
      highlightWords();
    }).catch(() => {
      checkedWords[word] = false;
      highlightWords();
    });
}

function highlightWords() {
  const text = editor.innerText.trim();
  const words = text.split(/\s+/);
  wrongWords = 0;
  const highlighted = words.map(word => {
    const clean = word.toLowerCase().replace(/[^a-z]/gi, '');
    if (!clean) return "";
    if (checkedWords[clean] === false) {
      wrongWords++;
      return `<span class="wrong">${word}</span>`;
    } else {
      validateWord(clean);
      return word;
    }
  }).join(" ");
  editor.innerHTML = highlighted + " ";
  updateCaret();
  updateMetrics();
}

function updateCaret() {
  editor.focus();
  const range = document.createRange();
  range.selectNodeContents(editor);
  range.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

function updateMetrics() {
  const text = editor.innerText.trim();
  totalChars = text.length;
  correctChars = totalChars - wrongWords * 5;
  const mins = (Date.now() - startTime) / 60000;
  const wpm = Math.round((totalChars / 5) / mins) || 0;
  const acc = totalChars ? Math.max(0, Math.round((correctChars / totalChars) * 100)) : 100;
  speedEl.textContent = wpm;
  accEl.textContent = acc;
  wrongEl.textContent = wrongWords;
}

function startTest() {
  timerDur = parseInt(timeSel.value);
  startTime = Date.now();
  editor.innerHTML = "";
  editor.contentEditable = true;
  editor.focus();
  checkedWords = {};
  intervalId = setInterval(() => {
    updateTimer();
    updateMetrics();
  }, 1000);
  isRunning = true;
}

function endTest() {
  editor.contentEditable = false;
  clearInterval(intervalId);
  updateMetrics();
  updateLeaderboard(parseInt(speedEl.textContent), parseInt(accEl.textContent));
  updateTypingDays();
  isRunning = false;
}

function resetTest() {
  clearInterval(intervalId);
  editor.innerHTML = "";
  editor.contentEditable = false;
  progressBar.style.width = "0%";
  speedEl.textContent = accEl.textContent = wrongEl.textContent = "0";
  timeEl.textContent = "0:00";
  isRunning = false;
}

// Keyboard Control
document.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    isRunning ? endTest() : startTest();
  }
});

editor.addEventListener("input", highlightWords);
startBtn.onclick = startTest;
endBtn.onclick = endTest;
resetBtn.onclick = resetTest;

// Leaderboard
function loadLB() {
  return JSON.parse(localStorage.getItem("leaderboard") || "[]");
}
function updateLeaderboard(wpm, acc) {
  const data = loadLB();
  data.push({ date: new Date().toLocaleString(), wpm, acc });
  data.sort((a, b) => b.wpm - a.wpm);
  localStorage.setItem("leaderboard", JSON.stringify(data.slice(0, 5)));
  renderLB();
}
function renderLB() {
  const data = loadLB();
  lbBody.innerHTML = "";
  data.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${r.date}</td><td>${r.wpm}</td><td>${r.acc}%</td>`;
    lbBody.appendChild(tr);
  });
}

// Daily practice
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
