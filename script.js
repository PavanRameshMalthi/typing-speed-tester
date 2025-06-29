let isTestRunning = false;
let timer;
let startTime;
let typedWords = [];
let wrongCount = 0;
let correctCount = 0;
let history = [];
let currentTestNumber = 1;

const textarea = document.getElementById("customInput");
const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");
const wrongDisplay = document.getElementById("wrong");
const correctDisplay = document.getElementById("correct");
const durationSelect = document.getElementById("duration");
const chartCanvas = document.getElementById("performanceChart").getContext("2d");
const historyList = document.getElementById("testHistory");
const calendarBox = document.getElementById("calendarBox");

let chart = new Chart(chartCanvas, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "WPM",
        data: [],
        borderColor: "#007bff",
        borderWidth: 2,
        fill: false,
      },
      {
        label: "Accuracy (%)",
        data: [],
        borderColor: "#28a745",
        borderWidth: 2,
        fill: false,
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: getComputedStyle(document.body).getPropertyValue('--text-color')
        }
      }
    },
    scales: {
      x: {
        ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-color') }
      },
      y: {
        ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-color') }
      }
    }
  }
});

function startTest() {
  if (isTestRunning) return;
  resetStats();
  isTestRunning = true;
  startTime = Date.now();
  const duration = parseInt(durationSelect.value);
  timer = setTimeout(endTest, duration * 1000);
}

function endTest() {
  isTestRunning = false;
  clearTimeout(timer);
  const timeTaken = (Date.now() - startTime) / 1000;
  const totalWords = typedWords.length;
  const wpm = Math.round((totalWords / timeTaken) * 60);
  const accuracy = Math.round(((correctCount - wrongCount) / correctCount) * 100) || 0;

  updateStats(wpm, accuracy, wrongCount, correctCount);
  saveHistory(wpm, accuracy);
  updateChart(wpm, accuracy);
}

function resetStats() {
  typedWords = [];
  wrongCount = 0;
  correctCount = 0;
  textarea.value = "";
  updateStats(0, 100, 0, 0);
}

function updateStats(wpm, accuracy, wrong = 0, correct = 0) {
  wpmDisplay.textContent = wpm;
  accuracyDisplay.textContent = accuracy + "%";
  wrongDisplay.textContent = wrong;
  correctDisplay.textContent = correct;
}

function saveHistory(wpm, accuracy) {
  const now = new Date();
  const time = now.toLocaleTimeString();
  const dateKey = now.toISOString().split("T")[0];

  history.push({
    id: `Test ${history.length + 1}`,
    date: dateKey,
    time,
    wpm,
    accuracy,
    wrong: wrongCount,
  });

  updateHistoryUI();
  updateCalendar(dateKey);
}

function updateHistoryUI() {
  historyList.innerHTML = "";
  history.forEach((h, i) => {
    const li = document.createElement("li");
    li.textContent = `${h.id} - WPM: ${h.wpm}, Accuracy: ${h.accuracy}%, Wrong: ${h.wrong} (${h.time})`;
    historyList.appendChild(li);
  });
}

function updateCalendar(dateKey) {
  const dateElem = document.createElement("div");
  dateElem.textContent = dateKey;
  dateElem.classList.add("highlight-date");
  calendarBox.appendChild(dateElem);
}

function updateChart(wpm, accuracy) {
  chart.data.labels.push(`Test ${chart.data.labels.length + 1}`);
  chart.data.datasets[0].data.push(wpm);
  chart.data.datasets[1].data.push(accuracy);
  chart.update();
}

document.getElementById("startTest").addEventListener("click", startTest);
document.getElementById("resetTest").addEventListener("click", resetStats);
document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
});

textarea.addEventListener("input", () => {
  if (!isTestRunning) return;
  const value = textarea.value.trim();
  typedWords = value.split(/\s+/);
  correctCount = typedWords.length;
  wrongCount = typedWords.filter(word => word === "wrong").length; // Simulated logic
  const accuracy = Math.round(((correctCount - wrongCount) / correctCount) * 100) || 0;
  const wpm = Math.round((correctCount / ((Date.now() - startTime) / 1000)) * 60);
  updateStats(wpm, accuracy, wrongCount, correctCount);
});

document.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    if (!isTestRunning) {
      startTest();
    } else {
      endTest();
    }
  }
});
