const quoteDisplay = document.getElementById("quoteDisplay");
const quoteInput = document.getElementById("quoteInput");
const startBtn = document.getElementById("startBtn");
const endBtn = document.getElementById("endBtn");
const resetBtn = document.getElementById("resetBtn");
const speed = document.getElementById("speed");
const accuracy = document.getElementById("accuracy");
const timeDisplay = document.getElementById("timeDisplay");
const progressBar = document.getElementById("progressBar");
const difficultySelect = document.getElementById("difficulty");
const timeSelect = document.getElementById("time");

let startTime, interval, timerDuration, charIndex = 0;
let totalTyped = 0, correctTyped = 0;
let isRunning = false;

const sounds = {
  correct: new Audio("sounds/correct.mp3"),
  error: new Audio("sounds/error.mp3"),
  done: new Audio("sounds/done.mp3"),
};

const quotes = {
  easy: ["I love typing.", "Coding is fun.", "The cat sat.", "Sun is hot."],
  medium: [
    "Typing fast helps you become a better coder.",
    "Always test your code after writing.",
    "Practice makes perfect.",
    "HTML and CSS build beautiful websites.",
  ],
  hard: [
    "The quick brown fox jumps over the lazy dog while barking at the full moon.",
    "JavaScript is a powerful language used in web development and beyond.",
    "Consistency in learning leads to long-term success in programming.",
  ]
};

function getRandomQuote(level) {
  const q = quotes[level];
  return q[Math.floor(Math.random() * q.length)];
}

function renderQuote(quote) {
  quoteDisplay.innerHTML = "";
  quote.split("").forEach(char => {
    const span = document.createElement("span");
    span.innerText = char;
    quoteDisplay.appendChild(span);
  });
  quoteInput.value = "";
  quoteInput.disabled = false;
  quoteInput.focus();
  charIndex = 0;
  totalTyped = 0;
  correctTyped = 0;
  updateMetrics();
}

function updateMetrics() {
  const elapsed = (Date.now() - startTime) / 60000;
  const wpm = Math.round((totalTyped / 5) / elapsed);
  const acc = totalTyped === 0 ? 100 : Math.round((correctTyped / totalTyped) * 100);
  speed.textContent = wpm || 0;
  accuracy.textContent = acc;
}

quoteInput.addEventListener("input", () => {
  const quoteSpans = quoteDisplay.querySelectorAll("span");
  const value = quoteInput.value.split("");
  totalTyped++;
  if (charIndex >= quoteSpans.length) return;

  if (value[charIndex] === quoteSpans[charIndex].innerText) {
    quoteSpans[charIndex].classList.add("correct");
    quoteSpans[charIndex].classList.remove("incorrect");
    correctTyped++;
    sounds.correct.play();
  } else {
    quoteSpans[charIndex].classList.add("incorrect");
    quoteSpans[charIndex].classList.remove("correct");
    sounds.error.play();
  }
  charIndex++;
  updateMetrics();
});

function updateTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const remaining = timerDuration - elapsed;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  timeDisplay.textContent = `${mins}:${secs.toString().padStart(2, "0")}`;
  progressBar.style.width = `${((elapsed / timerDuration) * 100).toFixed(2)}%`;

  if (remaining <= 0) {
    endTest();
  }
}

function startTest() {
  const level = difficultySelect.value;
  timerDuration = parseInt(timeSelect.value);
  startTime = Date.now();
  renderQuote(getRandomQuote(level));
  interval = setInterval(updateTimer, 1000);
  isRunning = true;
}

function endTest() {
  quoteInput.disabled = true;
  clearInterval(interval);
  sounds.done.play();
  isRunning = false;
}

function resetTest() {
  clearInterval(interval);
  quoteInput.value = "";
  quoteDisplay.innerHTML = "";
  timeDisplay.textContent = "0:00";
  progressBar.style.width = "0%";
  speed.textContent = "0";
  accuracy.textContent = "0";
  quoteInput.disabled = true;
  isRunning = false;
}

startBtn.addEventListener("click", startTest);
endBtn.addEventListener("click", endTest);
resetBtn.addEventListener("click", resetTest);

// 🔑 ENTER KEY FEATURE
document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault(); // Prevent newline in textarea
    if (!isRunning) {
      startTest();
    } else {
      endTest();
    }
  }
});
