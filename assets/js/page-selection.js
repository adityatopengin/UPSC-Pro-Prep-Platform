/**
 * page-selection.js
 * Controls Selection Menu, Mode Switching & Config Saving
 */

let selectionState = {
    mode: 'test' // 'test' or 'learning'
};

document.addEventListener('DOMContentLoaded', () => {
    // Render Subject Lists (Fallback if cards aren't enough)
    renderList('gs1');
    renderList('csat');
    
    // Restore previous mode if set
    const savedConfig = localStorage.getItem('upsc_quiz_config');
    if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        selectMode(parsed.mode || 'test');
    }
});

function selectMode(mode) {
    selectionState.mode = mode;
    
    // Update UI Buttons
    const testBtn = document.getElementById('mode-test');
    const learnBtn = document.getElementById('mode-learning');
    
    if (mode === 'test') {
        testBtn.className = 'px-3 py-1 text-xs font-bold rounded-md bg-slate-800 text-white shadow-md transition-all';
        learnBtn.className = 'px-3 py-1 text-xs font-bold rounded-md text-slate-500 hover:text-slate-700 transition-all';
    } else {
        learnBtn.className = 'px-3 py-1 text-xs font-bold rounded-md bg-blue-100 text-blue-700 shadow-md transition-all';
        testBtn.className = 'px-3 py-1 text-xs font-bold rounded-md text-slate-500 hover:text-slate-700 transition-all';
    }
}

// Helper to launch specific types
function startQuickQuiz(paper, type) {
    const config = {
        mode: selectionState.mode,
        paper: paper,
        subject: 'Mix',
        topic: 'All Topics',
        count: 10,
        quickType: type // 'random' or 'mistakes'
    };
    
    if (type === 'mistakes') {
        const bank = JSON.parse(localStorage.getItem('upsc_mistakes') || '[]');
        if (bank.length === 0) {
            alert("No mistakes saved yet! Go make some errors first. 😉");
            return;
        }
    }
    
    saveQuizConfig(config);
    window.location.href = 'quiz_interface.html';
}

function openMockModal(paper) {
    // Uses ui-common.js helper
    // Logic to select 50 or 100 Qs would go here if we built the full modal.
    // For now, launch a standard mock.
    const config = {
        mode: selectionState.mode,
        paper: paper,
        subject: 'Mix',
        topic: 'Mock Test',
        count: paper === 'gs1' ? 100 : 80
    };
    
    if(confirm(`Start Full Length Mock (${config.count} Qs)?\nTime: 2 Hours`)) {
        saveQuizConfig(config);
        window.location.href = 'quiz_interface.html';
    }
}

function renderList(paper) {
    const container = document.getElementById(`${paper}-subjects`);
    const subjects = paper === 'gs1' ? subjectsGS1 : subjectsCSAT;
    
    container.innerHTML = '';
    
    subjects.forEach(sub => {
        const btn = document.createElement('button');
        btn.className = 'w-full text-left bg-white border border-slate-200 p-3 rounded-xl flex items-center gap-3 hover:border-blue-300 transition-all active:scale-95';
        
        btn.onclick = () => {
             window.currentMode = selectionState.mode;
             window.currentPaper = paper;
             openTopicModal(sub, paper);
        };
        
        const iconColor = sub.color ? `text-${sub.color}-500 bg-${sub.color}-50` : 'text-blue-500 bg-blue-50';
        
        btn.innerHTML = `
            <div class="w-8 h-8 rounded-lg ${iconColor} flex items-center justify-center">
                <i class="fa-solid ${sub.icon}"></i>
            </div>
            <span class="text-xs font-bold text-slate-700">${sub.name}</span>
            <i class="fa-solid fa-chevron-right ml-auto text-slate-300 text-xs"></i>
        `;
        container.appendChild(btn);
    });
}

