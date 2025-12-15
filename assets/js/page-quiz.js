/**
 * page-quiz.js
 * Quiz Interface Logic
 * Features: Timer, Map, Rich Explanation (Notes/Tags), Auto-Save
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

let config = {
    mode: 'test',
    count: 10,
    timeLimit: 600
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const saved = loadQuizConfig(); // from core.js
        if (saved) config = saved;

        // 1. Load Questions
        // We use the new Core API or fallback to fetch
        let loadedQuestions = [];
        
        // MISTAKE MODE
        if (config.quickType === 'mistakes') {
            const mistakes = JSON.parse(localStorage.getItem('upsc_mistakes') || '[]');
            // Shuffle mistakes
            loadedQuestions = mistakes.sort(() => Math.random() - 0.5).slice(0, config.count);
        }
        // STANDARD MODE
        else {
            // Using APP_DATA from core.js if available, otherwise fetch
            if (window.APP_DATA && window.APP_DATA.questions.length > 0) {
                // Filter from memory
                loadedQuestions = window.getFilteredQuestions({
                    paper: config.paper,
                    subject: config.subject,
                    topic: config.topic,
                    count: config.count
                }); // You might need to expose this function in core.js or implement filtering here
                
                // If getFilteredQuestions isn't exposed in core.js, implement simple filter here:
                 if (!window.getFilteredQuestions) {
                     loadedQuestions = APP_DATA.questions.filter(q => {
                        if (config.paper && q.paper !== config.paper) return false;
                        if (config.subject && config.subject !== 'Mix' && q.subject !== config.subject) return false;
                        if (config.topic && config.topic !== 'All Topics' && q.topic !== config.topic) return false;
                        return true;
                     });
                     // Shuffle
                     loadedQuestions.sort(() => Math.random() - 0.5).slice(0, config.count);
                 }
            } else {
                // Fallback: Fetch directly using DataManager
                const filename = (config.paper === 'csat') ? 'csat_math.json' : 'polity.json'; // fallback
                loadedQuestions = await appData.fetchQuestions(filename);
            }
        }

        // Safety Check
        if (!loadedQuestions || loadedQuestions.length === 0) {
            alert("No questions found for this selection. Try 'All Topics'.");
            window.location.href = 'quiz_selection.html';
            return;
        }

        quizState.quiz = loadedQuestions.slice(0, config.count);
        
        // 2. Start Quiz
        quizState.startTime = Date.now();
        quizState.lastActiveTime = Date.now();
        
        // Calculate dynamic time limit if not set (1.2m per Q for GS)
        if (!config.timeLimit) {
            config.timeLimit = config.paper === 'gs1' ? (config.count * 72) : (config.count * 90);
        }

        startTimer();
        loadQuestion(0);
        setupVisibilityListener();
        setupAutoSave();

    } catch (e) {
        console.error("Quiz Init Error:", e);
    }
});

function loadQuestion(idx) {
    if (!quizState.quiz[idx]) return;

    // Time Tracking
    const now = Date.now();
    if (quizState.lastActiveTime && quizState.quiz[quizState.currentIdx]) {
        const diff = Math.round((now - quizState.lastActiveTime) / 1000);
        const prevId = quizState.quiz[quizState.currentIdx].id;
        quizState.timeSpent[prevId] = (quizState.timeSpent[prevId] || 0) + diff;
    }
    quizState.lastActiveTime = now;
    quizState.currentIdx = idx;

    const q = quizState.quiz[idx];

    // Header Updates
    document.getElementById('header-subject').innerText = `${q.subject} • ${q.year || 'Model'}`;
    document.getElementById('q-num').innerText = `${idx + 1}/${quizState.quiz.length}`;
    document.getElementById('progress-bar').style.width = `${((idx + 1) / quizState.quiz.length) * 100}%`;

    // Render Text
    document.getElementById('q-text').innerText = q.text;

    // Render Tags (NEW)
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
    
    // Image Handling
    const imgSlot = document.getElementById('img-slot');
    if(q.imgUrl) {
        imgSlot.classList.remove('hidden');
        document.getElementById('q-image').src = q.imgUrl;
    } else {
        imgSlot.classList.add('hidden');
    }

    // Passage Handling (Split Screen)
    const passageContainer = document.getElementById('passage-container');
    const questionContainer = document.getElementById('question-container'); // Ensure this ID exists in HTML
    if(q.parentText) { // CSAT Passage
        passageContainer.classList.remove('hidden');
        document.getElementById('passage-text').innerText = q.parentText;
        questionContainer.classList.remove('h-full');
        questionContainer.classList.add('h-3/5'); // Shrink question area
    } else {
        passageContainer.classList.add('hidden');
        questionContainer.classList.remove('h-3/5');
        questionContainer.classList.add('h-full');
    }

    // Render Options
    const optList = document.getElementById('options-list');
    optList.innerHTML = '';

    q.options.forEach((opt, i) => {
        const isSelected = quizState.answers[q.id] === i;
        const isEliminated = quizState.eliminated[q.id]?.includes(i);
        
        let statusClass = 'border-slate-200 bg-white hover:border-blue-300';
        
        // Feedback Logic (Learning Mode)
        if (config.mode === 'learning' && quizState.answers[q.id] !== undefined) {
            if (i === q.correct) statusClass = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-sm';
            else if (isSelected) statusClass = 'bg-red-50 border-red-500 text-red-800 font-bold shadow-sm';
        } 
        // Test Mode Selection
        else if (isSelected) {
            statusClass = 'bg-blue-50 border-blue-600 border-2 shadow-sm';
        }

        const eliminatedClass = isEliminated ? 'opacity-40 grayscale' : '';

        const div = document.createElement('div');
        div.className = `option-card card p-4 rounded-xl border-2 cursor-pointer flex items-start gap-3 transition-all active:scale-98 ${statusClass} ${eliminatedClass}`;
        
        div.onclick = () => {
            if (!isEliminated) {
                // In Test mode, allow changing. In Learning mode, lock after answer.
                if (config.mode === 'test' || quizState.answers[q.id] === undefined) {
                    selectOption(q.id, i);
                }
            }
        };

        div.innerHTML = `
            <div class="w-6 h-6 rounded-full border-2 border-slate-300 flex-none flex items-center justify-center text-xs font-bold text-slate-400 mt-0.5">
                ${String.fromCharCode(65 + i)}
            </div>
            <p class="text-sm text-slate-700 leading-snug select-none flex-1 font-medium dark:text-slate-800">${opt}</p>
            <button onclick="event.stopPropagation(); eliminateOption(event, ${q.id}, ${i})" 
                class="text-slate-300 hover:text-slate-500 p-2 z-10 transition-colors flex-none" title="Eliminate">
                <i class="fa-regular ${isEliminated ? 'fa-eye' : 'fa-eye-slash'}"></i>
            </button>
        `;
        optList.appendChild(div);
    });

    // Explanation (Rich Metadata Upgrade)
    const expBox = document.getElementById('explanation-box');
    const expText = document.getElementById('exp-text');
    
    // Show explanation if: Learning Mode AND Answered
    if (config.mode === 'learning' && quizState.answers[q.id] !== undefined) {
        
        let html = `<p class="mb-3">${q.explanation}</p>`;
        
        // Add Notes
        if (q.notes) {
            html += `
            <div class="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex gap-3 mb-3">
                <i class="fa-solid fa-note-sticky text-yellow-600 mt-0.5 text-xs"></i>
                <p class="text-xs text-yellow-800 font-medium italic">"${q.notes}"</p>
            </div>`;
        }

        // Add Linked Concepts
        if (q.linkedConcepts && q.linkedConcepts.length > 0) {
            html += `
            <div class="pt-3 border-t border-emerald-200">
                <span class="text-[10px] font-bold text-emerald-600 uppercase tracking-wide block mb-2">
                    <i class="fa-solid fa-link mr-1"></i> Related Topics
                </span>
                <div class="flex flex-wrap gap-2">
                    ${q.linkedConcepts.map(c => `<span class="px-2 py-1 bg-white border border-emerald-200 rounded text-[10px] font-bold text-emerald-700 shadow-sm">${c}</span>`).join('')}
                </div>
            </div>`;
        }

        expText.innerHTML = html;
        expBox.classList.remove('hidden');
        
        // Auto-scroll to explanation on mobile
        if(window.innerWidth < 768) {
             setTimeout(() => expBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
        }
        
    } else {
        expBox.classList.add('hidden');
    }

    // Nav Buttons
    document.getElementById('btn-prev').disabled = idx === 0;
    const nextBtn = document.getElementById('btn-next');
    nextBtn.innerHTML = idx === quizState.quiz.length - 1 ? 
        'Finish <i class="fa-solid fa-flag-checkered ml-1"></i>' : 
        'Next <i class="fa-solid fa-arrow-right ml-1"></i>';

    // Bookmark Icon
    const bmBtn = document.getElementById('btn-bookmark');
    bmBtn.innerHTML = quizState.bookmarks.includes(q.id) ? 
        '<i class="fa-solid fa-star text-amber-400 text-xl"></i>' : 
        '<i class="fa-regular fa-star text-slate-300 text-xl"></i>';
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

function nextQ() {
    if (quizState.currentIdx < quizState.quiz.length - 1) loadQuestion(quizState.currentIdx + 1);
    else submitQuiz();
}

function prevQ() {
    if (quizState.currentIdx > 0) loadQuestion(quizState.currentIdx - 1);
}

function startTimer() {
    const display = document.getElementById('timer-display');
    let elapsed = 0;
    
    quizState.timerInterval = setInterval(() => {
        if (quizState.paused) return;
        elapsed++;
        
        // Test Mode: Count Down
        if (config.mode === 'test') {
            const remaining = config.timeLimit - elapsed;
            if (remaining <= 0) {
                clearInterval(quizState.timerInterval);
                alert("Time's Up!");
                submitQuiz();
                return;
            }
            display.innerText = formatTime(remaining); // core.js
            if(remaining < 60) display.classList.add('text-red-500');
        } 
        // Learning Mode: Count Up
        else {
            display.innerText = formatTime(elapsed);
        }
    }, 1000);
}

function setupVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
        quizState.paused = document.hidden;
    });
}

function setupAutoSave() {
    // Save progress every 10s
    setInterval(() => {
        if (quizState.quiz.length > 0) {
            localStorage.setItem('upsc_quiz_progress', JSON.stringify({
                answers: quizState.answers,
                currentIdx: quizState.currentIdx,
                timeSpent: quizState.timeSpent
            }));
        }
    }, 10000);
}

function submitQuiz() {
    clearInterval(quizState.timerInterval);
    
    // Final Time Save
    const now = Date.now();
    if (quizState.lastActiveTime) {
        const diff = Math.round((now - quizState.lastActiveTime) / 1000);
        const qId = quizState.quiz[quizState.currentIdx].id;
        quizState.timeSpent[qId] = (quizState.timeSpent[qId] || 0) + diff;
    }

    // Calculate using Core Logic
    const scoreData = calculateScore(quizState.quiz, quizState.answers, config.paper); // core.js
    
    if (confirm(`Submit Quiz?\n\nAnswered: ${scoreData.attempted}/${quizState.quiz.length}`)) {
        
        // Save Mistakes
        const mistakes = quizState.quiz.filter(q => 
            quizState.answers[q.id] !== undefined && quizState.answers[q.id] !== q.correct
        );
        saveMistakes(mistakes); // core.js

        // Prepare Result Data
        const totalTime = Object.values(quizState.timeSpent).reduce((a,b)=>a+b, 0);
        const resultData = {
            score: scoreData.score,
            total: quizState.quiz.length,
            correct: scoreData.correct,
            wrong: scoreData.wrong,
            skipped: scoreData.skipped,
            subject: config.subject,
            paper: config.paper,
            accuracy: scoreData.attempted > 0 ? Math.round((scoreData.correct/scoreData.attempted)*100) : 0,
            timeSpent: totalTime,
            quiz: quizState.quiz.map(q => ({
                ...q,
                userSel: quizState.answers[q.id]
            })),
            timestamp: new Date().toISOString()
        };

        appData.saveResult(resultData);
        localStorage.setItem('upsc_last_result', JSON.stringify(resultData));
        localStorage.removeItem('upsc_quiz_progress');
        
        window.location.href = 'analysis.html';
    } else {
        startTimer(); // Resume if cancel
    }
}

function exitQuiz() {
    if(confirm("Exit quiz? Progress will be lost.")) {
        clearInterval(quizState.timerInterval);
        window.location.href = 'quiz_selection.html';
    }
}

// Map Modal Logic
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
            btn.onclick = () => {
                loadQuestion(i);
                toggleMap();
            };
            grid.appendChild(btn);
        });
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
}

