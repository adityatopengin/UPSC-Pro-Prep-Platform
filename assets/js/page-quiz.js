/**
 * page-quiz.js
 * Updated to handle Missing Files Gracefully
 */

let quizState = {
    quiz: [],
    currentIdx: 0,
    answers: {},
    bookmarks: [],
    eliminated: {},
    startTime: null,
    lastActiveTime: null,
    timerInterval: null,
    timeSpent: {},
    paused: false
};

let config = { mode: 'test', count: 10, timeLimit: 600 };

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const saved = loadQuizConfig(); // from core.js
        if (saved) config = saved;

        // 1. Load Questions
        let loadedQuestions = [];
        
        if (config.quickType === 'mistakes') {
            const mistakes = JSON.parse(localStorage.getItem('upsc_mistakes') || '[]');
            loadedQuestions = mistakes.sort(() => Math.random() - 0.5).slice(0, config.count);
        } else {
            // Determine filename based on config
            // Note: Use the filenameMap from subjects.js logic
            let filename = '';
            
            // Check mapping
            if (config.paper === 'csat' && config.subject === 'Mix') filename = 'csat_math.json'; // fallback for mix
            else if (config.subject === 'Mix') filename = 'polity.json'; // fallback
            else {
                // Find filename from subject name
                // We need to implement a simple lookup or pass it via config
                // For now, let's try to find it in APP_DATA if available, else standard naming
                const foundSub = subjectsGS1.concat(subjectsCSAT).find(s => s.name === config.subject);
                if (foundSub) {
                    // Reverse lookup or use the map defined in subjects.js
                     filename = filenameMap[config.subject] + '.json';
                }
            }
            
            if(!filename || filename === 'undefined.json') {
                 // Try standard mix fetch if specific failed
                 filename = config.paper === 'csat' ? 'csat_math.json' : 'ancient_history.json';
            }

            console.log(`Attempting to load: ${filename}`);
            loadedQuestions = await appData.fetchQuestions(filename);
        }

        // 2. ERROR HANDLING: Check if questions loaded
        if (!loadedQuestions || loadedQuestions.length === 0) {
            showErrorScreen("No questions found.", "The file for this subject might be missing (e.g., polity.json) or has no questions.");
            return;
        }

        quizState.quiz = loadedQuestions.slice(0, config.count);
        
        // 3. Start Quiz
        quizState.startTime = Date.now();
        quizState.lastActiveTime = Date.now();
        if (!config.timeLimit) config.timeLimit = config.paper === 'gs1' ? (config.count * 72) : (config.count * 90);

        startTimer();
        loadQuestion(0);
        setupVisibilityListener();
        setupAutoSave();

    } catch (e) {
        console.error("Quiz Init Error:", e);
        showErrorScreen("Critical Error", e.message);
    }
});

function showErrorScreen(title, msg) {
    const container = document.getElementById('quiz-viewport');
    if(container) {
        container.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center p-6 text-center">
                <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <i class="fa-solid fa-triangle-exclamation text-2xl text-red-500"></i>
                </div>
                <h2 class="text-xl font-bold text-slate-800 mb-2">${title}</h2>
                <p class="text-sm text-slate-500 mb-6">${msg}</p>
                <button onclick="window.location.href='quiz_selection.html'" class="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm">
                    Go Back
                </button>
            </div>
        `;
    }
    document.getElementById('header-subject').innerText = "Error";
    document.getElementById('timer-display').innerText = "--:--";
}

// ... (Rest of the functions loadQuestion, selectOption, etc. remain EXACTLY the same as previous batch) ...
// For brevity, I am not pasting the identical logic functions again, 
// just ensure you keep the loadQuestion logic from Batch 5.
// I will include loadQuestion below just to be safe.

function loadQuestion(idx) {
    if (!quizState.quiz[idx]) return;
    const now = Date.now();
    if (quizState.lastActiveTime && quizState.quiz[quizState.currentIdx]) {
        const diff = Math.round((now - quizState.lastActiveTime) / 1000);
        const prevId = quizState.quiz[quizState.currentIdx].id;
        quizState.timeSpent[prevId] = (quizState.timeSpent[prevId] || 0) + diff;
    }
    quizState.lastActiveTime = now;
    quizState.currentIdx = idx;
    const q = quizState.quiz[idx];

    document.getElementById('header-subject').innerText = `${q.subject}`;
    document.getElementById('q-num').innerText = `${idx + 1}/${quizState.quiz.length}`;
    document.getElementById('progress-bar').style.width = `${((idx + 1) / quizState.quiz.length) * 100}%`;
    document.getElementById('q-text').innerText = q.text;

    const tagContainer = document.getElementById('q-tags');
    if (tagContainer) {
        tagContainer.innerHTML = '';
        if (q.tags && q.tags.length > 0) {
            q.tags.forEach(tag => {
                const span = document.createElement('span');
                span.className = 'px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-500 border border-slate-200';
                span.innerText = tag;
                tagContainer.appendChild(span);
            });
        }
    }
    
    const imgSlot = document.getElementById('img-slot');
    if(q.imgUrl) {
        imgSlot.classList.remove('hidden');
        document.getElementById('q-image').src = q.imgUrl;
    } else {
        imgSlot.classList.add('hidden');
    }

    const passageContainer = document.getElementById('passage-container');
    const questionContainer = document.getElementById('question-container');
    if(q.parentText) { 
        passageContainer.classList.remove('hidden');
        document.getElementById('passage-text').innerText = q.parentText;
        questionContainer.classList.remove('h-full');
        questionContainer.classList.add('h-3/5'); 
    } else {
        passageContainer.classList.add('hidden');
        questionContainer.classList.remove('h-3/5');
        questionContainer.classList.add('h-full');
    }

    const optList = document.getElementById('options-list');
    optList.innerHTML = '';

    q.options.forEach((opt, i) => {
        const isSelected = quizState.answers[q.id] === i;
        const isEliminated = quizState.eliminated[q.id]?.includes(i);
        let statusClass = 'border-slate-200 bg-white hover:border-blue-300';
        
        if (config.mode === 'learning' && quizState.answers[q.id] !== undefined) {
            if (i === q.correct) statusClass = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-sm';
            else if (isSelected) statusClass = 'bg-red-50 border-red-500 text-red-800 font-bold shadow-sm';
        } else if (isSelected) {
            statusClass = 'bg-blue-50 border-blue-600 border-2 shadow-sm';
        }

        const eliminatedClass = isEliminated ? 'opacity-40 grayscale' : '';
        const div = document.createElement('div');
        div.className = `option-card card p-4 rounded-xl border-2 cursor-pointer flex items-start gap-3 transition-all active:scale-98 ${statusClass} ${eliminatedClass}`;
        div.onclick = () => {
            if (!isEliminated) {
                if (config.mode === 'test' || quizState.answers[q.id] === undefined) {
                    selectOption(q.id, i);
                }
            }
        };

        div.innerHTML = `
            <div class="w-6 h-6 rounded-full border-2 border-slate-300 flex-none flex items-center justify-center text-xs font-bold text-slate-400 mt-0.5">${String.fromCharCode(65 + i)}</div>
            <p class="text-sm text-slate-700 leading-snug select-none flex-1 font-medium dark:text-slate-800">${opt}</p>
            <button onclick="event.stopPropagation(); eliminateOption(event, ${q.id}, ${i})" class="text-slate-300 hover:text-slate-500 p-2 z-10 transition-colors flex-none"><i class="fa-regular ${isEliminated ? 'fa-eye' : 'fa-eye-slash'}"></i></button>
        `;
        optList.appendChild(div);
    });

    const expBox = document.getElementById('explanation-box');
    const expText = document.getElementById('exp-text');
    
    if (config.mode === 'learning' && quizState.answers[q.id] !== undefined) {
        let html = `<p class="mb-3">${q.explanation}</p>`;
        if (q.notes) html += `<div class="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex gap-3 mb-3"><i class="fa-solid fa-note-sticky text-yellow-600 mt-0.5 text-xs"></i><p class="text-xs text-yellow-800 font-medium italic">"${q.notes}"</p></div>`;
        if (q.linkedConcepts && q.linkedConcepts.length > 0) html += `<div class="pt-3 border-t border-emerald-200"><span class="text-[10px] font-bold text-emerald-600 uppercase tracking-wide block mb-2"><i class="fa-solid fa-link mr-1"></i> Related Topics</span><div class="flex flex-wrap gap-2">${q.linkedConcepts.map(c => `<span class="px-2 py-1 bg-white border border-emerald-200 rounded text-[10px] font-bold text-emerald-700 shadow-sm">${c}</span>`).join('')}</div></div>`;
        expText.innerHTML = html;
        expBox.classList.remove('hidden');
    } else {
        expBox.classList.add('hidden');
    }

    document.getElementById('btn-prev').disabled = idx === 0;
    document.getElementById('btn-next').innerHTML = idx === quizState.quiz.length - 1 ? 'Finish <i class="fa-solid fa-flag-checkered ml-1"></i>' : 'Next <i class="fa-solid fa-arrow-right ml-1"></i>';
    
    const bmBtn = document.getElementById('btn-bookmark');
    bmBtn.innerHTML = quizState.bookmarks.includes(q.id) ? '<i class="fa-solid fa-star text-amber-400 text-xl"></i>' : '<i class="fa-regular fa-star text-slate-300 text-xl"></i>';
}

function selectOption(qId, optIdx) {
    if (quizState.answers[qId] === optIdx) delete quizState.answers[qId];
    else quizState.answers[qId] = optIdx;
    loadQuestion(quizState.currentIdx);
}
function eliminateOption(e, qId, optIdx) {
    e.stopPropagation();
    if (!quizState.eliminated[qId]) quizState.eliminated[qId] = [];
    const idx = quizState.eliminated[qId].indexOf(optIdx);
    if (idx > -1) quizState.eliminated[qId].splice(idx, 1);
    else quizState.eliminated[qId].push(optIdx);
    loadQuestion(quizState.currentIdx);
}
function toggleBookmark() {
    const qId = quizState.quiz[quizState.currentIdx].id;
    const idx = quizState.bookmarks.indexOf(qId);
    if (idx > -1) quizState.bookmarks.splice(idx, 1);
    else quizState.bookmarks.push(qId);
    loadQuestion(quizState.currentIdx);
}
function nextQ() { if (quizState.currentIdx < quizState.quiz.length - 1) loadQuestion(quizState.currentIdx + 1); else submitQuiz(); }
function prevQ() { if (quizState.currentIdx > 0) loadQuestion(quizState.currentIdx - 1); }
function startTimer() {
    const display = document.getElementById('timer-display');
    let elapsed = 0;
    quizState.timerInterval = setInterval(() => {
        if (quizState.paused) return;
        elapsed++;
        if (config.mode === 'test') {
            const remaining = config.timeLimit - elapsed;
            if (remaining <= 0) { clearInterval(quizState.timerInterval); alert("Time's Up!"); submitQuiz(); return; }
            display.innerText = formatTime(remaining); 
            if(remaining < 60) display.classList.add('text-red-500');
        } else { display.innerText = formatTime(elapsed); }
    }, 1000);
}
function setupVisibilityListener() { document.addEventListener('visibilitychange', () => { quizState.paused = document.hidden; }); }
function setupAutoSave() { setInterval(() => { if (quizState.quiz.length > 0) { localStorage.setItem('upsc_quiz_progress', JSON.stringify({ answers: quizState.answers, currentIdx: quizState.currentIdx, timeSpent: quizState.timeSpent })); } }, 10000); }
function submitQuiz() {
    clearInterval(quizState.timerInterval);
    const now = Date.now();
    if (quizState.lastActiveTime) {
        const diff = Math.round((now - quizState.lastActiveTime) / 1000);
        const qId = quizState.quiz[quizState.currentIdx].id;
        quizState.timeSpent[qId] = (quizState.timeSpent[qId] || 0) + diff;
    }
    const scoreData = calculateScore(quizState.quiz, quizState.answers, config.paper); 
    if (confirm(`Submit Quiz?\n\nAnswered: ${scoreData.attempted}/${quizState.quiz.length}`)) {
        const mistakes = quizState.quiz.filter(q => quizState.answers[q.id] !== undefined && quizState.answers[q.id] !== q.correct);
        saveMistakes(mistakes); 
        const totalTime = Object.values(quizState.timeSpent).reduce((a,b)=>a+b, 0);
        const resultData = { score: scoreData.score, total: quizState.quiz.length, correct: scoreData.correct, wrong: scoreData.wrong, skipped: scoreData.skipped, subject: config.subject, paper: config.paper, accuracy: scoreData.attempted > 0 ? Math.round((scoreData.correct/scoreData.attempted)*100) : 0, timeSpent: totalTime, quiz: quizState.quiz.map(q => ({ ...q, userSel: quizState.answers[q.id] })), timestamp: new Date().toISOString() };
        appData.saveResult(resultData);
        localStorage.setItem('upsc_last_result', JSON.stringify(resultData));
        localStorage.removeItem('upsc_quiz_progress');
        window.location.href = 'analysis.html';
    } else { startTimer(); }
}
function exitQuiz() { if(confirm("Exit quiz? Progress will be lost.")) { clearInterval(quizState.timerInterval); window.location.href = 'quiz_selection.html'; } }
function toggleMap() {
    const modal = document.getElementById('map-modal');
    const grid = document.getElementById('map-grid');
    if (modal.classList.contains('hidden')) {
        grid.innerHTML = '';
        quizState.quiz.forEach((q, i) => {
            let color = 'bg-slate-100 text-slate-500';
            if (i === quizState.currentIdx) color = 'bg-blue-600 text-white';
            else if (quizState.answers[q.id] !== undefined) color = 'bg-slate-800 text-white';
            else if (quizState.bookmarks.includes(q.id)) color = 'bg-amber-100 text-amber-600';
            const btn = document.createElement('button');
            btn.className = `w-10 h-10 rounded-lg text-sm font-bold ${color}`;
            btn.innerText = i + 1;
            btn.onclick = () => { loadQuestion(i); toggleMap(); };
            grid.appendChild(btn);
        });
        modal.classList.remove('hidden');
    } else { modal.classList.add('hidden'); }
}

