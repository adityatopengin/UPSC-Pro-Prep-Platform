/**
 * page-selection.js
 * Controls the Topic Selection UI, Mock Modals, and Quick Actions
 */

document.addEventListener('DOMContentLoaded', () => {
    renderSubjectList();
    setupModeToggle();
});

// 1. Render the List of Subjects (GS1 & CSAT)
function renderSubjectList() {
    const gsContainer = document.getElementById('gs1-subjects');
    const csatContainer = document.getElementById('csat-subjects');

    if (gsContainer) {
        gsContainer.innerHTML = subjectsGS1.map(sub => createSubjectRow(sub, 'gs1')).join('');
    }
    
    // Optional: If you want CSAT subjects listed below GS1, uncomment this
    /* if (csatContainer) {
        csatContainer.innerHTML = subjectsCSAT.map(sub => createSubjectRow(sub, 'csat')).join('');
    } 
    */
}

function createSubjectRow(sub, paper) {
    // Determine icon and color based on subject ID/Name
    let icon = 'fa-book';
    let colorClass = 'bg-slate-100 text-slate-500';

    // Simple mapping for visuals
    if (sub.name.includes('Polity')) { icon = 'fa-landmark'; colorClass = 'bg-orange-100 text-orange-600'; }
    else if (sub.name.includes('History')) { icon = 'fa-scroll'; colorClass = 'bg-amber-100 text-amber-600'; }
    else if (sub.name.includes('Geo')) { icon = 'fa-earth-asia'; colorClass = 'bg-emerald-100 text-emerald-600'; }
    else if (sub.name.includes('Economy')) { icon = 'fa-coins'; colorClass = 'bg-blue-100 text-blue-600'; }
    else if (sub.name.includes('Science')) { icon = 'fa-flask'; colorClass = 'bg-purple-100 text-purple-600'; }
    else if (sub.name.includes('Environment')) { icon = 'fa-leaf'; colorClass = 'bg-green-100 text-green-600'; }

    return `
        <div onclick="startQuiz('${paper}', '${sub.name}')" class="group flex items-center gap-4 p-3 rounded-xl bg-white border border-slate-100 shadow-sm cursor-pointer hover:border-blue-300 hover:shadow-md transition-all active:scale-98">
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

// 2. Navigation Logic
function startQuiz(paper, subject) {
    const mode = localStorage.getItem('upsc_quiz_mode') || 'test';
    
    // Save Configuration
    const config = {
        paper: paper,
        subject: subject,
        mode: mode,
        count: 10,  // Default
        timeLimit: mode === 'test' ? 600 : 0, // 10 mins for test
        quickType: 'standard'
    };
    
    saveQuizConfig(config); // Helper in core.js
    window.location.href = 'quiz_interface.html';
}

function startQuickQuiz(paper, type) {
    const mode = localStorage.getItem('upsc_quiz_mode') || 'test';
    const config = {
        paper: paper,
        subject: 'Mix', // Will load from multiple files or a specific 'mix' file
        mode: mode,
        count: 10,
        timeLimit: mode === 'test' ? 600 : 0,
        quickType: type // 'random' or 'mistakes'
    };
    
    if (type === 'mistakes') {
        const mistakes = JSON.parse(localStorage.getItem('upsc_mistakes') || '[]');
        if (mistakes.length === 0) {
            alert("No mistakes recorded yet! Great job (or start practicing).");
            return;
        }
    }

    saveQuizConfig(config);
    window.location.href = 'quiz_interface.html';
}

function openMockModal(paper) {
    // For now, let's just start a "Full Length" style quiz directly
    // Or you can build a popup here later. 
    // Let's make it start a 20 Question Mix for now.
    const mode = localStorage.getItem('upsc_quiz_mode') || 'test';
    const config = {
        paper: paper,
        subject: 'Mix', 
        mode: mode,
        count: 20,
        timeLimit: mode === 'test' ? 1200 : 0, // 20 mins
        quickType: 'mock'
    };
    saveQuizConfig(config);
    window.location.href = 'quiz_interface.html';
}

// 3. UI Toggles
function selectMode(mode) {
    localStorage.setItem('upsc_quiz_mode', mode);
    setupModeToggle();
}

function setupModeToggle() {
    const currentMode = localStorage.getItem('upsc_quiz_mode') || 'test';
    const btnTest = document.getElementById('mode-test');
    const btnLearn = document.getElementById('mode-learning');

    if (currentMode === 'test') {
        btnTest.className = "px-3 py-1 text-xs font-bold rounded-md bg-slate-800 text-white shadow-sm transition-all";
        btnLearn.className = "px-3 py-1 text-xs font-bold rounded-md text-slate-500 hover:text-slate-700 transition-all";
    } else {
        btnLearn.className = "px-3 py-1 text-xs font-bold rounded-md bg-emerald-600 text-white shadow-sm transition-all";
        btnTest.className = "px-3 py-1 text-xs font-bold rounded-md text-slate-500 hover:text-slate-700 transition-all";
    }
}
