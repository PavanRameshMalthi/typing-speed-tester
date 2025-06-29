const paragraphDisplay = document.getElementById("paragraphDisplay");
const typingInput = document.getElementById("typingInput");
const startBtn = document.getElementById("startBtn");
const endBtn = document.getElementById("endBtn");
const timeDisplay = document.getElementById("timeDisplay");
const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");
const correctWordsDisplay = document.getElementById("correctWords");
const wrongWordsDisplay = document.getElementById("wrongWords");
const mistakeWordsDisplay = document.getElementById("mistakeWords");
const testDurationInput = document.getElementById("testDuration");
const retestBtn = document.getElementById("retestBtn");
const themeSelect = document.getElementById("themeSelect");
const calendarContainer = document.getElementById("calendarContainer");
const historyList = document.getElementById("historyList");

let timer;
let totalTime = 60;
let startTime;
let typedText = "";
let correctWords = 0;
let wrongWords = 0;
let chart;
let typedWordArray = [];
let mistakeMap = {};

function generateParagraph() {
  const sampleText = "Start typing anything you like here. The system will calculate speed, accuracy, and errors.";
  paragraphDisplay.innerText = sampleText;
}

function startTest() {
  generateParagraph();
  typedWordArray = [];
  mistakeMap = {};
  typingInput.value = "";
  typingInput.disabled = false;
  typingInput.focus();
  totalTime = parseInt(testDurationInput.value) || 60;
  timeDisplay.textContent = `${totalTime}s`;
  startTime = Date.now();
  correctWords = 0;
  wrongWords = 0;

  clearInterval(timer);
  timer = setInterval(updateTimer, 1000);
}

function endTest() {
  clearInterval(timer);
  typingInput.disabled = true;
  const timeUsed = (Date.now() - startTime) / 60000;
  const typedWords = typingInput.value.trim().split(/\s+/);
  correctWords = 0;
  wrongWords = 0;

  typedWords.forEach(word => {
    if (word !== "") {
      typedWordArray.push(word);
      // You can optionally compare against correct paragraph if you want
      // Here, we're just counting wrongs for simplicity
      if (/^[a-zA-Z]+$/.test(word)) correctWords++;
      else {
        wrongWords++;
        mistakeMap[word] = (mistakeMap[word] || 0) + 1;
      }
    }
  });

  const wpm = Math.round(correctWords / timeUsed);
  const totalTyped = correctWords + wrongWords;
  const accuracy = totalTyped ? Math.round((correctWords / totalTyped) * 100) : 0;

  wpmDisplay.textContent = wpm;
  accuracyDisplay.textContent = `${accuracy}%`;
  correctWordsDisplay.textContent = correctWords;
  wrongWordsDisplay.textContent = wrongWords;

  // Show most frequent mistake
  let maxMistake = "";
  let maxCount = 0;
  for (let word in mistakeMap) {
    if (mistakeMap[word] > maxCount) {
      maxCount = mistakeMap[word];
      maxMistake = word;
    }
  }
  mistakeWordsDisplay.textContent = maxMistake || "-";

  saveHistory(wpm, accuracy, correctWords, wrongWords);
  updateChart(wpm, accuracy);
  markLogin();
}

function updateTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const remaining = totalTime - elapsed;
  if (remaining <= 0) {
    timeDisplay.textContent = "0s";
    endTest();
  } else {
    timeDisplay.textContent = `${remaining}s`;
  }
}

function resetTest() {
  clearInterval(timer);
  typingInput.value = "";
  paragraphDisplay.innerText = "";
  typingInput.disabled = false;
  timeDisplay.textContent = `${testDurationInput.value}s`;
  correctWordsDisplay.textContent = "0";
  wrongWordsDisplay.textContent = "0";
  wpmDisplay.textContent = "0";
  accuracyDisplay.textContent = "0%";
  mistakeWordsDisplay.textContent = "-";
}

function saveHistory(wpm, accuracy, correct, wrong) {
  const history = JSON.parse(localStorage.getItem("typingHistory") || "[]");
  const now = new Date();
  history.push({
    time: now.toLocaleTimeString(),
    wpm,
    accuracy,
    correct,
    wrong
  });
  localStorage.setItem("typingHistory", JSON.stringify(history));
  displayHistory();
}

function displayHistory() {
  const history = JSON.parse(localStorage.getItem("typingHistory") || "[]");
  historyList.innerHTML = "";
  history.slice(-10).reverse().forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `⏰ ${entry.time} – ✅ ${entry.wpm} WPM, 🎯 ${entry.accuracy}%, ✅ ${entry.correct}, ❌ ${entry.wrong}`;
    historyList.appendChild(li);
  });
}

function setupChart() {
  const ctx = document.getElementById("wpmChart").getContext("2d");
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "WPM",
          borderColor: "#007bff",
          data: [],
          fill: false
        },
        {
          label: "Accuracy",
          borderColor: "#28a745",
          data: [],
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: getComputedStyle(document.body).getPropertyValue("--text-color")
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: getComputedStyle(document.body).getPropertyValue("--text-color")
          }
        },
        y: {
          ticks: {
            color: getComputedStyle(document.body).getPropertyValue("--text-color")
          }
        }
      }
    }
  });
}

function updateChart(wpm, accuracy) {
  const label = new Date().toLocaleTimeString();
  chart.data.labels.push(label);
  chart.data.datasets[0].data.push(wpm);
  chart.data.datasets[1].data.push(accuracy);
  chart.update();
}

function markLogin() {
  const now = new Date();
  const dateKey = now.toISOString().split("T")[0];
  const days = JSON.parse(localStorage.getItem("loginDays") || "[]");
  if (!days.includes(dateKey)) {
    days.push(dateKey);
    localStorage.setItem("loginDays", JSON.stringify(days));
  }
  showCalendar(days);
}

function showCalendar(days) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();

  calendarContainer.innerHTML = "";
  for (let i = 1; i <= totalDays; i++) {
    const date = new Date(year, month, i);
    const dateKey = date.toISOString().split("T")[0];
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("calendar-day");
    dayDiv.textContent = `${i}`;
    if (days.includes(dateKey)) {
      dayDiv.classList.add("highlighted");
    }
    calendarContainer.appendChild(dayDiv);
  }
}

function applyTheme(theme) {
  document.body.classList.remove("dark", "blue", "classic");
  if (theme === "dark") document.body.classList.add("dark");
  else if (theme === "blue") document.body.classList.add("blue");
  else if (theme === "classic") document.body.classList.add("classic");
  else if (theme === "system") {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.body.classList.add("dark");
    }
  }
}

themeSelect.addEventListener("change", () => {
  const selectedTheme = themeSelect.value;
  localStorage.setItem("theme", selectedTheme);
  applyTheme(selectedTheme);
  chart.options.plugins.legend.labels.color = getComputedStyle(document.body).getPropertyValue("--text-color");
  chart.update();
});

startBtn.addEventListener("click", startTest);
endBtn.addEventListener("click", endTest);
retestBtn.addEventListener("click", startTest);
testDurationInput.addEventListener("change", resetTest);

// Start/End by Enter key
typingInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    if (!timer) startTest();
    else endTest();
  }
});

// Initialize on load
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "system";
  themeSelect.value = savedTheme;
  applyTheme(savedTheme);
  setupChart();
  displayHistory();
  markLogin();
});
