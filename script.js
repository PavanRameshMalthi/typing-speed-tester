const quoteEl = document.getElementById("quote");
const inputEl = document.getElementById("input");
const timerEl = document.getElementById("timer");
const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const bestScoreEl = document.getElementById("best-score");
const durationSelect = document.getElementById("duration");
const startBtn = document.getElementById("start-btn");
const endBtn = document.getElementById("end-btn");
const resetBtn = document.getElementById("reset-btn");
const progressFill = document.getElementById("progress-fill");
const ctx = document.getElementById("resultsChart").getContext("2d");

let chart;
let timer, countdown, timeLimit;
let started = false;
let currentQuote = "";
let bestWPM = localStorage.getItem("bestWPM") || 0;
let statsData = [];

let quotes = [
  "The quick brown fox jumps over the lazy dog.",
  "Typing fast is a valuable skill in many jobs.",
  "Practice every day to improve your typing speed.",
  "JavaScript is a powerful programming language.",
  "Focus and accuracy are key to typing tests."
];

bestScoreEl.textContent = `🏆 Best WPM: ${bestWPM}`;

function getRandomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function startTest() {
  currentQuote = getRandomQuote();
  quoteEl.textContent = currentQuote;
  inputEl.value = "";
  inputEl.disabled = false;
  inputEl.focus();

  timeLimit = parseInt(durationSelect.value);
  countdown = timeLimit;
  started = false;
  statsData = [];

  updateTimerDisplay(countdown);
  updateProgressBar();
  wpmEl.textContent = "0";
  accuracyEl.textContent = "0";
  endBtn.disabled = false;
  resetBtn.disabled = false;
  clearInterval(timer);
}

function startTimer() {
  timer = setInterval(() => {
    countdown--;
    updateTimerDisplay(countdown);
    updateLiveStats();
    updateProgressBar();

    if (countdown <= 0) {
      endTest();
    }
  }, 1000);
}

function updateTimerDisplay(secondsLeft) {
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  timerEl.textContent = `${mins > 0 ? mins + " min " : ""}${secs} sec`;
}

function updateProgressBar() {
  const percent = ((timeLimit - countdown) / timeLimit) * 100;
  progressFill.style.width = `${percent}%`;
}

function updateLiveStats() {
  const typedText = inputEl.value.trim();
  const timePassed = timeLimit - countdown || 1;
  const wordsTyped = typedText.split(/\s+/).filter(w => w !== "").length;
  const wpm = Math.round((wordsTyped / timePassed) * 60);

  let correctChars = 0;
  for (let i = 0; i < typedText.length && i < currentQuote.length; i++) {
    if (typedText[i] === currentQuote[i]) correctChars++;
  }

  const accuracy = Math.round((correctChars / currentQuote.length) * 100);

  wpmEl.textContent = isNaN(wpm) ? 0 : wpm;
  accuracyEl.textContent = isNaN(accuracy) ? 0 : accuracy;

  statsData.push({ second: timeLimit - countdown, wpm, accuracy });
}

function endTest() {
  clearInterval(timer);
  inputEl.disabled = true;
  updateLiveStats();
  endBtn.disabled = true;
  drawChart();

  const finalWPM = parseInt(wpmEl.textContent);
  if (finalWPM > bestWPM) {
    bestWPM = finalWPM;
    localStorage.setItem("bestWPM", bestWPM);
    bestScoreEl.textContent = `🏆 Best WPM: ${bestWPM}`;
  }
}

function resetTest() {
  clearInterval(timer);
  inputEl.value = "";
  inputEl.disabled = true;
  quoteEl.textContent = "Click \"Start Test\" to begin...";
  timerEl.textContent = "0 sec";
  wpmEl.textContent = "0";
  accuracyEl.textContent = "0";
  progressFill.style.width = "0%";
  endBtn.disabled = true;
  resetBtn.disabled = true;
  statsData = [];
  if (chart) chart.destroy();
}

function drawChart() {
  const labels = statsData.map(data => `${data.second}s`);
  const wpmData = statsData.map(data => data.wpm);
  const accuracyData = statsData.map(data => data.accuracy);

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: "WPM",
          data: wpmData,
          borderColor: "#00bfff",
          backgroundColor: "rgba(0,191,255,0.2)",
          fill: true,
        },
        {
          label: "Accuracy (%)",
          data: accuracyData,
          borderColor: "#00ff99",
          backgroundColor: "rgba(0,255,153,0.2)",
          fill: true,
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    }
  });
}

inputEl.addEventListener("input", () => {
  if (!started) {
    started = true;
    startTimer();
  }

  updateLiveStats();

  if (inputEl.value.trim() === currentQuote) {
    endTest();
  }
});

startBtn.addEventListener("click", startTest);
endBtn.addEventListener("click", endTest);
resetBtn.addEventListener("click", resetTest);
