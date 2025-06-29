const testArea = document.getElementById('test-area'),
  wpmEl = document.getElementById('wpm'),
  accEl = document.getElementById('accuracy'),
  wrongEl = document.getElementById('wrong-words'),
  leaderboardBody = document.getElementById('leaderboard-body'),
  calBox = document.getElementById('calendar-box'),
  missedMsg = document.getElementById('missed-days-msg'),
  timerSelect = document.getElementById('timer-select');

let isRunning = false, startTime, timerDur = 60, timerHandle;
let labels = [], wpmData = [], accData = [], loginDays = JSON.parse(localStorage.getItem('loginDays')||'[]');

const ctx = document.getElementById('performanceChart').getContext('2d');
const chart = new Chart(ctx, { type:'line', data:{labels, datasets:[
  {label:'WPM', data:wpmData, borderColor:'#66d9ef', backgroundColor:'rgba(102,217,239,0.2)', fill:true},
  {label:'Accuracy%', data:accData, borderColor:'#33cc33', backgroundColor:'rgba(51,204,51,0.2)', fill:true}
]}, options:{responsive:true, scales:{y:{beginAtZero:true}}}});

timerSelect.addEventListener('change', ()=> timerDur = +timerSelect.value);

function startTest() {
  if(isRunning) return;
  isRunning = true;
  testArea.disabled = false; testArea.focus(); testArea.value = '';
  startTime = Date.now();
  timerHandle = setTimeout(endTest, timerDur*1000);
}

function endTest() {
  if(!isRunning) return;
  isRunning = false; testArea.disabled = true;
  clearTimeout(timerHandle);

  const text = testArea.value.trim(), words = text?text.split(/\s+/):[];
  const wpm = Math.round(words.length / (timerDur/60)),
    wrong = Math.floor(words.length/10),
    acc = words.length ? Math.round((words.length-wrong)/words.length*100):100;

  wpmEl.textContent = wpm; accEl.textContent = acc+'%'; wrongEl.textContent = wrong;

  const t = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const sessions = JSON.parse(localStorage.getItem('leaderboard')||'[]');
  sessions.push({t,w: wpm, a:acc});
  localStorage.setItem('leaderboard', JSON.stringify(sessions)); updateLeaderboard();

  const today = new Date().toISOString().split('T')[0];
  if(!loginDays.includes(today)) { loginDays.push(today); localStorage.setItem('loginDays',JSON.stringify(loginDays)); }
  labels.push(t); wpmData.push(wpm); accData.push(acc); chart.update();
  renderCalendar(); checkMissed();
}

function resetTest() {
  clearTimeout(timerHandle);
  isRunning=false;
  testArea.disabled=true;
  testArea.value='';
  wpmEl.textContent='0'; accEl.textContent='0%'; wrongEl.textContent='0';
}

document.addEventListener('keydown', e=> {
  if(e.key==='Enter'){ e.preventDefault(); isRunning?endTest(): startTest(); }
});

function toggleTheme(){
  const themes = ['theme-default','theme-light','theme-ocean'];
  const el = document.body;
  const idx = themes.indexOf(el.className);
  el.className = themes[(idx+1)%themes.length];
}

function updateLeaderboard(){
  const sessions = JSON.parse(localStorage.getItem('leaderboard')||'[]');
  leaderboardBody.innerHTML = sessions.map(s=>`<tr><td>${s.t}</td><td>${s.w}</td><td>${s.a}%</td></tr>`).join('');
}

function renderCalendar(){
  calBox.innerHTML='';
  const dt = new Date(), m = dt.getMonth(), y = dt.getFullYear(), firstDay = new Date(y,m,1).getDay(), days = new Date(y,m+1,0).getDate();
  let html = `<div class="month">${dt.toLocaleString('default',{month:'long',year:'numeric'})}</div><div class="days-grid">`;
  for(let i=0;i<firstDay;i++) html += '<div></div>';
  for(let d=1; d<=days; d++){
    const key=`${y}-${m+1}-${d}`;
    html += `<div class="day${loginDays.includes(key)?' marked':''}">${d}</div>`;
  }
  calBox.innerHTML = html + '</div>';
}

function checkMissed(){
  const today = new Date(), daysAgo = [...Array(7).keys()].slice(1), miss = daysAgo.reduce((c,i)=> {
    const d = new Date(today); d.setDate(today.getDate()-i);
    return !loginDays.includes(d.toISOString().split('T')[0])?c+1:c;
  }, 0);
  missedMsg.textContent = miss?`🔔 You missed ${miss} day(s) this week.`:'';
}

updateLeaderboard(); renderCalendar(); checkMissed();
