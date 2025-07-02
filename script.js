const paragraph = document.getElementById('paragraph');
const inputBox = document.getElementById('inputBox');
const startBtn = document.getElementById('startBtn');
const endBtn = document.getElementById('endBtn');
const retestBtn = document.getElementById('retestBtn');
const timeInput = document.getElementById('timeInput');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const correctWordsDisplay = document.getElementById('correctWords');
const wrongWordsDisplay = document.getElementById('wrongWords');
const mistakenWordDisplay = document.getElementById('mistakenWord');
const themeToggle = document.getElementById('themeToggle');
const languageSelect = document.getElementById('languageSelect');
const historyList = document.getElementById('historyList');
const calendarContainer = document.getElementById('calendarContainer');

let timer = null, startTime = null, testDuration = 60, testEnded = false;
let wordMistakes = {}, history = [];

function startTest() {
  inputBox.disabled = false;
  inputBox.focus();
  testEnded = false;
  startTime = Date.now();
  testDuration = parseInt(timeInput.value);
  inputBox.value = '';
  timer = setTimeout(endTest, testDuration * 1000);
}

function endTest() {
  if (testEnded) return;
  clearTimeout(timer);
  testEnded = true;
  const typedText = inputBox.value.trim();
  const originalWords = paragraph.innerText.trim().split(/\s+/);
  const typedWords = typedText.split(/\s+/);
  let correct = 0, wrong = 0;
  wordMistakes = {};
  for (let i = 0; i < typedWords.length; i++) {
    if (typedWords[i] === originalWords[i]) {
      correct++;
    } else {
      wrong++;
      const wrongWord = originalWords[i];
      wordMistakes[wrongWord] = (wordMistakes[wrongWord] || 0) + 1;
    }
  }

  const totalTimeMinutes = testDuration / 60;
  const wpm = Math.round(correct / totalTimeMinutes);
  const accuracy = Math.round((correct / originalWords.length) * 100);

  wpmDisplay.textContent = wpm;
  accuracyDisplay.textContent = `${accuracy}%`;
  correctWordsDisplay.textContent = correct;
  wrongWordsDisplay.textContent = wrong;

  let mostMistaken = Object.keys(wordMistakes).sort((a, b) => wordMistakes[b] - wordMistakes[a])[0];
  mistakenWordDisplay.textContent = mostMistaken || "None";

  updateChart(wpm, accuracy);
  updateHistory(wpm, accuracy, correct, wrong);
  updateCalendar();
}
