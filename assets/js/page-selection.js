/**
 * page-selection.js
 * Handles the Dynamic Dashboard Logic
 */

let state = {
    mode: localStorage.getItem('upsc_quiz_mode') || 'test',
    paper: 'gs1', // 'gs1' or 'csat'
    selectedSubject: null,
    qCount: 10
};

document.addEventListener('DOMContentLoaded', () => {
    updateModeUI();
    updatePaperUI();
    renderDashboard();
});

/* ============================
   1. STATE MANAGEMENT
   ============================ */

function setMode(mode) {
    state.mode = mode;
    localStorage.setItem('upsc_quiz_mode', mode);
    updateModeUI();
}

function updateModeUI() {
    const t = document.getElementById('card-test');
    const l = document.getElementById('card-learn');
    
    if (state.mode === 'test') {
        t.className = "glass-card p-4 rounded-2xl cursor-pointer border-2 border-slate-800 bg-white shadow-lg transition-all";
        l.className = "glass-card p-4 rounded-2xl cursor-pointer border-2 border-transparent opacity-60 hover:opacity-100 transition-all";
    } else {
        l.className = "glass-card p-4 rounded-2xl cursor-pointer border-2 border-emerald-500 bg-emerald-50 shadow-lg transition-all";
        t.className = "glass-card p-4 rounded-2xl cursor-pointer border-2 border-transparent opacity-60 hover:opacity-100 transition-all";
    }
}

function setPaper(paper) {
    state.paper = paper;
    updatePaperUI();
    renderDashboard(); // Re-render everything below
}

function updatePaperUI() {
    const btn1 = document.getElementById('btn-gs1');
    const btn2 = document.getElementById('btn-csat');
    
    const activeClass = "flex-1 py-3 rounded-lg text-xs font-bold transition-all shadow-md bg-slate-800 text-white transform scale-105";
    const inactiveClass = "flex-1 py-3 rounded-lg text-xs font-bold transition-all text-slate-500 hover:bg-white/40";

    if (state.paper === 'gs1') {
        btn1.className = activeClass;
        btn2.className = inactiveClass;
    } else {
        btn1.className = inactiveClass;
        btn2.className = activeClass;
    }
}

/* ============================
   2. DASHBOARD RENDERING
   ============================ */

function renderDashboard() {
    const container = document.getElementById('dashboard-content');
    const subjects = state.paper === 'gs1' ? subjectsGS1 : subjectsCSAT;
    const themeColor = state.paper === 'gs1' ? 'blue' : 'purple';
    
    // HTML Template
    container.innerHTML = `
        <div onclick="openModal('modal-mock')" class="glass-card relative overflow-hidden rounded-2xl p-5 cursor-pointer group active:scale-98 transition-all border border-white/50">
            <div class="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-${themeColor}-100/50 to-transparent"></div>
            <div class="relative z-10">
                <div class="flex items-center gap-2 mb-1">
                    <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-${themeColor}-100 text-${themeColor}-700">Exam Simulation</span>
                </div>
                <h2 class="text-lg font-bold text-slate-800">Attempt Mock Test</h2>
                <p class="text-xs text-slate-500 mt-1">Full syllabus test with negative marking.</p>
                <div class="mt-3 flex items-center gap-2 text-xs font-bold text-${themeColor}-600 group-hover:underline">
                    <span>Configure & Start</span> <i class="fa-solid fa-arrow-right"></i>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
            <div onclick="startQuickQuiz('random')" class="glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:bg-white/80 active:scale-95 transition-all">
                <div class="w-10 h-10 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center text-lg"><i class="fa-solid fa-bolt"></i></div>
                <div>
                    <h3 class="text-xs font-bold text-slate-800">Random 10</h3>
                    <p class="text-[9px] text-slate-400">Quick Revision</p>
                </div>
            </div>
            <div onclick="startQuickQuiz('mistakes')" class="glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:bg-white/80 active:scale-95 transition-all">
                <div class="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-lg"><i class="fa-solid fa-triangle-exclamation"></i></div>
                <div>
                    <h3 class="text-xs font-bold text-slate-800">Mistakes</h3>
                    <p class="text-[9px] text-slate-400">Review Weakness</p>
                </div>
            </div>
        </div>

        <div>
            <h3 class="font-bold text-slate-800 text-sm mb-3 px-1 uppercase tracking-wide opacity-70">Subject Wise</h3>
            <div class="grid grid-cols-2 gap-3">
                ${subjects.map(sub => createSubjectCard(sub)).join('')}
            </div>
        </div>
    `;
}

function createSubjectCard(sub) {
    let icon = 'fa-book';
    let color = 'bg-slate-100 text-slate-500';

    if (sub.name.includes('Polity')) { icon = 'fa-landmark'; color = 'bg-orange-100 text-orange-600'; }
    else if (sub.name.includes('History')) { icon = 'fa-scroll'; color = 'bg-amber-100 text-amber-600'; }
    else if (sub.name.includes('Geo')) { icon = 'fa-earth-asia'; color = 'bg-emerald-100 text-emerald-600'; }
    else if (sub.name.includes('Math')) { icon = 'fa-calculator'; color = 'bg-pink-100 text-pink-600'; }
    else if (sub.name.includes('Science')) { icon = 'fa-flask'; color = 'bg-purple-100 text-purple-600'; }

    // NOTE: Passing subject name to openSubjectModal
    return `
        <div onclick="openSubjectModal('${sub.name}')" class="glass-card p-4 rounded-2xl flex flex-col items-start gap-3 cursor-pointer hover:bg-white/90 active:scale-95 transition-all h-32 justify-between">
            <div class="w-10 h-10 rounded-xl ${color} flex items-center justify-center text-lg shadow-sm">
                <i class="fa-solid ${icon}"></i>
            </div>
            <div>
                <h3 class="text-xs font-bold text-slate-800 leading-tight mb-0.5 line-clamp-2">${sub.name}</h3>
                <span class="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Setup Quiz</span>
            </div>
        </div>
    `;
}

/* ============================
   3. MODAL & QUIZ LOGIC
   ============================ */

// Generic Modal Helpers
window.openModal = function(id) { document.getElementById(id).classList.remove('hidden'); }
window.closeModal = function(id) { document.getElementById(id).classList.add('hidden'); }

// Mock Logic
window.startMock = function(length) {
    const count = length === 'half' ? 50 : 100;
    // Calculate time: 1.2 mins per question for GS, 1.5 for CSAT ?
    // Standard: GS=2hrs(100q), CSAT=2hrs(80q).
    // Let's simplify: 
    let time = 0;
    if (state.mode === 'test') {
        const mins = state.paper === 'gs1' ? (length === 'half' ? 60 : 120) : (length === 'half' ? 60 : 120);
        time = mins * 60;
    }

    const config = {
        paper: state.paper,
        subject: 'Mix',
        mode: state.mode,
        count: count,
        timeLimit: time,
        quickType: 'mock'
    };
    saveQuizConfig(config);
    window.location.href = 'quiz_interface.html';
}

// Quick Quiz Logic
window.startQuickQuiz = function(type) {
    if (type === 'mistakes') {
        const m = JSON.parse(localStorage.getItem('upsc_mistakes') || '[]');
        if (m.length === 0) { alert("No mistakes recorded yet!"); return; }
    }
    const config = {
        paper: state.paper,
        subject: 'Mix',
        mode: state.mode,
        count: 10,
        timeLimit: state.mode === 'test' ? 600 : 0,
        quickType: type
    };
    saveQuizConfig(config);
    window.location.href = 'quiz_interface.html';
}

// Subject Modal Logic
window.openSubjectModal = function(subName) {
    state.selectedSubject = subName;
    document.getElementById('modal-sub-title').innerText = subName;
    
    // Reset Q Count to 10
    state.qCount = 10;
    updateQCountUI();
    
    openModal('modal-subject');
}

window.setQCount = function(val) {
    state.qCount = val;
    updateQCountUI();
}

function updateQCountUI() {
    const btns = document.querySelectorAll('.q-btn');
    btns.forEach(btn => {
        if (parseInt(btn.dataset.val) === state.qCount) {
            btn.className = "q-btn py-2 rounded-lg border border-slate-200 text-xs font-bold hover:bg-blue-50 hover:border-blue-500 transition-all bg-slate-800 text-white shadow-md transform scale-105";
        } else {
            btn.className = "q-btn py-2 rounded-lg border border-slate-200 text-xs font-bold hover:bg-blue-50 hover:border-blue-500 transition-all text-slate-500";
        }
    });
}

window.launchSubjectQuiz = function() {
    // Determine time limit
    // Approx 1 min per Q for standard test logic
    let time = 0;
    if (state.mode === 'test') {
        time = state.qCount * 60; // 60 seconds per question
    }

    const config = {
        paper: state.paper,
        subject: state.selectedSubject,
        mode: state.mode,
        count: state.qCount,
        timeLimit: time,
        quickType: 'standard'
    };
    
    saveQuizConfig(config);
    window.location.href = 'quiz_interface.html';
}

