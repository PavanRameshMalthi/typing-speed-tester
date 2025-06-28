const quoteDisplay = document.getElementById("quoteDisplay");
const quoteInput = document.getElementById("quoteInput");
const speedEl = document.getElementById("speed");
const accEl = document.getElementById("accuracy");
const timeEl = document.getElementById("timeDisplay");
const progressBar = document.getElementById("progressBar");
const diffSel = document.getElementById("difficulty");
const timeSel = document.getElementById("time");
const startBtn = document.getElementById("startBtn");
const endBtn = document.getElementById("endBtn");
const resetBtn = document.getElementById("resetBtn");
const lbBody = document.querySelector("#leaderboard tbody");
const daysDisplay = document.getElementById("typingDaysDisplay");

let startTime, timerDur, intervalId, charIdx=0, totalTyped=0, corrTyped=0;
let isRunning=false;

const sounds = {
  correct:new Audio("sounds/correct.mp3"),
  error:new Audio("sounds/error.mp3"),
  done:new Audio("sounds/done.mp3")
};

const quotes = {
  easy:["I love typing.","Coding is fun.","The cat sat.","Sun is hot."],
  medium:["Typing fast helps you become a better coder.","Always test your code after writing.","Practice makes perfect.","HTML and CSS build beautiful websites."],
  hard:["The quick brown fox jumps over the lazy dog while barking at the full moon.","JavaScript is a powerful language used in web development and beyond.","Consistency in learning leads to long-term success in programming."]
};

function pickQuote() {
  const arr=quotes[diffSel.value];
  return arr[Math.floor(Math.random()*arr.length)];
}

function renderQuote(txt){
  quoteDisplay.innerHTML="";
  txt.split("").forEach(ch=>{
    const sp=document.createElement("span");
    sp.innerText=ch;
    quoteDisplay.appendChild(sp);
  });
  quoteInput.value=""; quoteInput.disabled=false; quoteInput.focus();
  charIdx=0; totalTyped=0; corrTyped=0;
  updateMetrics();
}

function updateMetrics(){
  const mins=(Date.now()-startTime)/60000;
  const wpm= Math.round((totalTyped/5)/mins)||0;
  const acc= totalTyped?Math.round(corrTyped/totalTyped*100):100;
  speedEl.textContent=wpm;
  accEl.textContent=acc;
}

quoteInput.addEventListener("input",()=>{
  const spans=quoteDisplay.querySelectorAll("span"), val=quoteInput.value;
  totalTyped++;
  if(charIdx<spans.length){
    if(val[charIdx]===spans[charIdx].innerText){
      spans[charIdx].classList.add("correct");
      corrTyped++; sounds.correct.play();
    } else {
      spans[charIdx].classList.add("incorrect");
      sounds.error.play();
    }
    charIdx++;
  }
  updateMetrics();
});

function updateTimer(){
  const elapsedSec=Math.floor((Date.now()-startTime)/1000);
  const rem=timerDur-elapsedSec;
  const m=Math.floor(rem/60), s=rem%60;
  timeEl.textContent=`${m}:${String(s).padStart(2,"0")}`;
  progressBar.style.width=`${(elapsedSec/timerDur*100).toFixed(2)}%`;
  if(rem<=0) endTest();
}

function startTest(){
  timerDur=parseInt(timeSel.value);
  startTime=Date.now();
  renderQuote(pickQuote());
  intervalId=setInterval(updateTimer,1000);
  isRunning=true;
}

function endTest(){
  quoteInput.disabled=true;
  clearInterval(intervalId);
  sounds.done.play();
  updateLeaderboard(parseInt(speedEl.textContent),parseInt(accEl.textContent));
  updateTypingDays(); // 🔄 track total practice days
  isRunning=false;
}

function resetTest(){
  clearInterval(intervalId);
  quoteInput.disabled=true;
  quoteDisplay.innerHTML="";
  progressBar.style.width="0%";
  speedEl.textContent=accEl.textContent="0";
  timeEl.textContent="0:00";
  isRunning=false;
}

document.addEventListener("keydown",e=>{
  if(e.key==="Enter"){
    e.preventDefault();
    isRunning? endTest() : startTest();
  }
});
startBtn.onclick=startTest;
endBtn.onclick=endTest;
resetBtn.onclick=resetTest;

// 🏆 Leaderboard
function loadLB(){
  const data=JSON.parse(localStorage.getItem("leaderboard"))||[];
  return data.sort((a,b)=>b.wpm-a.wpm).slice(0,5);
}
function updateLeaderboard(wpm,acc){
  const data=loadLB();
  data.push({date:new Date().toLocaleString(),wpm,acc});
  data.sort((a,b)=>b.wpm-a.wpm);
  localStorage.setItem("leaderboard",JSON.stringify(data.slice(0,5)));
  renderLB();
}
function renderLB(){
  lbBody.innerHTML="";
  loadLB().forEach(r=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${r.date}</td><td>${r.wpm}</td><td>${r.acc}%</td>`;
    lbBody.appendChild(tr);
  });
}

// 🗓️ Total Typing Days
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
