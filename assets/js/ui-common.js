/**
 * ui-common.js
 * Shared UI Behaviors (Modals, Toasts)
 */

let uiState = {
    selectedSubject: null,
    selectedTopic: 'All Topics',
    questionCount: 10
};

// Open Topic Selection Modal
function openTopicModal(subject, paper = 'gs1') {
    uiState.selectedSubject = subject;
    
    // Create if missing
    if (!document.getElementById('topic-modal')) createTopicModalHTML();
    
    const modal = document.getElementById('topic-modal');
    document.getElementById('m-subject-tag').innerText = paper.toUpperCase();
    document.getElementById('m-subject-title').innerText = subject.name;
    
    // DYNAMIC TOPIC LOADING FROM CORE
    // We fetch real topics scanned from JSON
    const topics = getTopicsForSubject(subject.name); // core.js helper
    const container = document.getElementById('m-subtopics');
    container.innerHTML = '';
    
    topics.forEach((topic, i) => {
        const checked = i === 0 ? 'checked' : '';
        const label = document.createElement('label');
        label.className = 'flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors';
        label.innerHTML = `
            <input type="radio" name="subtopic" value="${topic}" ${checked} 
                   onchange="uiState.selectedTopic = this.value" class="w-4 h-4 accent-blue-600">
            <span class="text-sm font-medium text-slate-700">${topic}</span>
        `;
        container.appendChild(label);
    });
    
    // Default to first topic
    uiState.selectedTopic = topics[0] || 'All Topics';
    
    // Reset Count
    selectQuestionCount(10);
    
    // Show Modal
    modal.classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('topic-bg').classList.remove('opacity-0');
        document.getElementById('topic-content').classList.remove('translate-y-full');
    }, 10);
}

function closeTopicModal() {
    document.getElementById('topic-bg').classList.add('opacity-0');
    document.getElementById('topic-content').classList.add('translate-y-full');
    setTimeout(() => document.getElementById('topic-modal').classList.add('hidden'), 300);
}

function selectQuestionCount(n) {
    uiState.questionCount = n;
    document.querySelectorAll('.q-count-btn').forEach(b => {
        if (parseInt(b.innerText) === n) {
            b.className = 'q-count-btn active bg-slate-900 text-white py-2 rounded-lg font-bold text-sm transition-all scale-105';
        } else {
            b.className = 'q-count-btn bg-slate-100 text-slate-600 py-2 rounded-lg font-bold text-sm hover:bg-slate-200 transition-all';
        }
    });
}

function launchQuizFromModal() {
    if (!uiState.selectedSubject) return;
    
    const config = {
        mode: window.currentMode || 'test',
        paper: window.currentPaper || 'gs1',
        subject: uiState.selectedSubject.name,
        topic: uiState.selectedTopic,
        count: uiState.questionCount
    };
    
    localStorage.setItem('upsc_quiz_config', JSON.stringify(config));
    closeTopicModal();
    window.location.href = 'quiz_interface.html';
}

function createTopicModalHTML() {
    const modal = document.createElement('div');
    modal.id = 'topic-modal';
    modal.className = 'fixed inset-0 z-50 hidden flex items-end sm:items-center justify-center pointer-events-none';
    modal.innerHTML = `
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity opacity-0 pointer-events-auto" 
             id="topic-bg" onclick="closeTopicModal()"></div>
        <div class="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl transform translate-y-full 
                    transition-transform duration-300 pointer-events-auto flex flex-col max-h-[85vh]" 
             id="topic-content">
            <div class="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <span class="text-xs font-bold text-blue-600 uppercase tracking-wide" id="m-subject-tag">GS1</span>
                    <h2 class="text-xl font-bold text-slate-900 mt-1" id="m-subject-title">Subject</h2>
                </div>
                <button onclick="closeTopicModal()" class="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="p-6 overflow-y-auto space-y-6">
                <div>
                    <label class="text-xs font-bold text-slate-500 uppercase mb-2 block">Select Topic</label>
                    <div class="space-y-2 max-h-40 overflow-y-auto" id="m-subtopics"></div>
                </div>
                <div>
                    <label class="text-xs font-bold text-slate-500 uppercase mb-2 block">Questions</label>
                    <div class="grid grid-cols-4 gap-2">
                        <button onclick="selectQuestionCount(10)" class="q-count-btn bg-slate-900 text-white py-2 rounded-lg font-bold text-sm">10</button>
                        <button onclick="selectQuestionCount(20)" class="q-count-btn bg-slate-100 text-slate-600 py-2 rounded-lg font-bold text-sm">20</button>
                        <button onclick="selectQuestionCount(50)" class="q-count-btn bg-slate-100 text-slate-600 py-2 rounded-lg font-bold text-sm">50</button>
                        <button onclick="selectQuestionCount(100)" class="q-count-btn bg-slate-100 text-slate-600 py-2 rounded-lg font-bold text-sm">100</button>
                    </div>
                </div>
                <button onclick="launchQuizFromModal()" class="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition-transform flex justify-center items-center gap-2">
                    <span>Start Quiz</span> <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Generic Modal Helpers
function openModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.classList.remove('hidden');
    setTimeout(() => {
        const bg = m.querySelector('[id*="bg"]');
        const content = m.querySelector('[id*="content"]');
        if (bg) bg.classList.remove('opacity-0');
        if (content) content.classList.remove('translate-y-full');
    }, 10);
}

function closeModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    const bg = m.querySelector('[id*="bg"]');
    const content = m.querySelector('[id*="content"]');
    if (bg) bg.classList.add('opacity-0');
    if (content) content.classList.add('translate-y-full');
    setTimeout(() => m.classList.add('hidden'), 300);
}

