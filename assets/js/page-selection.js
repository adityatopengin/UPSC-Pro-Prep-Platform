/**
 * page-selection.js
 * Controls Topic Selection
 */

// Force render immediately when file loads, then again when DOM is ready
// This fixes the "Blank List" issue
if (typeof renderSubjectList === 'function') renderSubjectList();

document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure HTML ID elements exist
    setTimeout(() => {
        renderSubjectList();
        setupModeToggle();
    }, 50);
});

function renderSubjectList() {
    const gsContainer = document.getElementById('gs1-subjects');
    const csatContainer = document.getElementById('csat-subjects');

    // Safety check: if subjects.js didn't load, stop
    if (typeof subjectsGS1 === 'undefined') {
        console.error("subjectsGS1 is missing. Check subjects.js");
        return;
    }

    if (gsContainer) {
        gsContainer.innerHTML = subjectsGS1.map(sub => createSubjectRow(sub, 'gs1')).join('');
    }
    
    // Auto-render CSAT below GS1 if the container exists
    if (csatContainer) {
        csatContainer.innerHTML = subjectsCSAT.map(sub => createSubjectRow(sub, 'csat')).join('');
    }
}

function createSubjectRow(sub, paper) {
    let icon = 'fa-book';
    let colorClass = 'bg-slate-100 text-slate-500';

    if (sub.name.includes('Polity')) { icon = 'fa-landmark'; colorClass = 'bg-orange-100 text-orange-600'; }
    else if (sub.name.includes('History')) { icon = 'fa-scroll'; colorClass = 'bg-amber-100 text-amber-600'; }
    else if (sub.name.includes('Geo')) { icon = 'fa-earth-asia'; colorClass = 'bg-emerald-100 text-emerald-600'; }
    else if (sub.name.includes('Economy')) { icon = 'fa-coins'; colorClass = 'bg-blue-100 text-blue-600'; }
    else if (sub.name.includes('Science')) { icon = 'fa-flask'; colorClass = 'bg-purple-100 text-purple-600'; }
    else if (sub.name.includes('Environment')) { icon = 'fa-leaf'; colorClass = 'bg-green-100 text-green-600'; }
    else if (sub.name.includes('Math')) { icon = 'fa-calculator'; colorClass = 'bg-pink-100 text-pink-600'; }

    return `
        <div onclick="startQuiz('${paper}', '${sub.name}')" class="group flex items-center gap-4 p-3 rounded-xl bg-white/80 border border-slate-100 shadow-sm cursor-pointer hover:border-blue-300 hover:shadow-md hover:bg-white transition-all active:scale-98 mb-2">
            <div class="w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform">
                <i class="fa-solid ${icon}"></i>
            </div>
            <div class="flex-1">
                <h3 class="text-sm font-bold text-slate-800 leading-tight group-hover:text-blue-700">${sub.name}</h3>
                <p class="text-[10px] text-slate-400 font-medium">Topic-wise Practice</p>
            </div>
            <div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <i class="fa-solid fa-chevron-right text-xs"></i>
            </div>
        </div>
    `;
}

// Navigation Logic
function startQuiz(paper, subject) {
    const mode = localStorage.getItem('upsc_quiz_mode') || 'test';
    const config = { paper, subject, mode, count: 10, timeLimit: mode === 'test' ? 600 : 0, quickType: 'standard' };
    saveQuizConfig(config);
    window.location.href = 'quiz_interface.html';
}

function startQuickQuiz(paper, type) {
    const mode = localStorage.getItem('upsc_quiz_mode') || 'test';
    const config = { paper, subject: 'Mix', mode, count: 10, timeLimit: mode === 'test' ? 600 : 0, quickType: type };
    if (type === 'mistakes') {
        const mistakes = JSON.parse(localStorage.getItem('upsc_mistakes') || '[]');
        if (mistakes.length === 0) { alert("No mistakes recorded yet!"); return; }
    }
    saveQuizConfig(config);
    window.location.href = 'quiz_interface.html';
}

function openMockModal(paper) {
    const mode = localStorage.getItem('upsc_quiz_mode') || 'test';
    const config = { paper, subject: 'Mix', mode, count: 20, timeLimit: mode === 'test' ? 1200 : 0, quickType: 'mock' };
    saveQuizConfig(config);
    window.location.href = 'quiz_interface.html';
}

function selectMode(mode) {
    localStorage.setItem('upsc_quiz_mode', mode);
    setupModeToggle();
}

function setupModeToggle() {
    const currentMode = localStorage.getItem('upsc_quiz_mode') || 'test';
    const btnTest = document.getElementById('mode-test');
    const btnLearn = document.getElementById('mode-learning');

    if (btnTest && btnLearn) {
        if (currentMode === 'test') {
            btnTest.className = "px-3 py-1 text-xs font-bold rounded-md bg-slate-800 text-white shadow-sm transition-all";
            btnLearn.className = "px-3 py-1 text-xs font-bold rounded-md text-slate-500 hover:text-slate-700 transition-all";
        } else {
            btnLearn.className = "px-3 py-1 text-xs font-bold rounded-md bg-emerald-600 text-white shadow-sm transition-all";
            btnTest.className = "px-3 py-1 text-xs font-bold rounded-md text-slate-500 hover:text-slate-700 transition-all";
        }
    }
}

