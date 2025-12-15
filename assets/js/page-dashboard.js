/**
 * page-dashboard.js
 * Dashboard Logic - Now Data-Driven
 */

let dashboardState = {
    currentTab: 'gs1'
};

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Wait for Core to Load Data
    // We check every 100ms if data is ready
    const checkData = setInterval(() => {
        if (APP_DATA && APP_DATA.questions.length > 0) {
            clearInterval(checkData);
            initDashboard();
        }
    }, 100);
    
    // Fallback: If core takes too long, init anyway after 2s
    setTimeout(() => { clearInterval(checkData); initDashboard(); }, 2000);
});

function initDashboard() {
    updateRealStats();
    renderSubjectGrid('gs1');
}

function updateRealStats() {
    // 1. Get History
    const history = JSON.parse(localStorage.getItem('upsc_history') || '[]');
    const totalAttempts = history.reduce((acc, h) => acc + (h.total || 0), 0);
    
    // 2. Get Total Questions from Core
    const totalAvailable = APP_DATA.meta.total || 2000; // Fallback to 2000 if 0
    
    // 3. Update UI
    const percent = Math.min(100, Math.round((totalAttempts / totalAvailable) * 100));
    
    document.getElementById('total-attempts').innerText = totalAttempts.toLocaleString();
    document.getElementById('syllabus-percent').innerText = percent + '%';
    document.getElementById('progress-fraction').innerText = `${totalAttempts} / ${totalAvailable} Qs`;
    
    const bar = document.getElementById('main-progress-bar');
    if (bar) bar.style.width = `${percent}%`;
}

function switchTab(tab) {
    dashboardState.currentTab = tab;
    
    // Update Tab Styles
    ['gs1', 'csat'].forEach(t => {
        const el = document.getElementById(`tab-${t}`);
        if (t === tab) {
            el.className = 'pb-2 text-sm font-bold text-slate-900 border-b-2 border-blue-600 transition-colors';
        } else {
            el.className = 'pb-2 text-sm text-slate-500 transition-colors hover:text-slate-700';
        }
    });

    renderSubjectGrid(tab);
}

function renderSubjectGrid(tab) {
    const container = document.getElementById('subject-grid');
    container.innerHTML = '';
    
    const subjects = tab === 'gs1' ? subjectsGS1 : subjectsCSAT;
    const history = JSON.parse(localStorage.getItem('upsc_history') || '[]');

    subjects.forEach((sub, index) => {
        // Calculate Subject-Specific Stats
        const subAttempts = history.filter(h => h.subject === sub.name).reduce((a, b) => a + b.total, 0);
        // Estimate total per subject (approx 200 per subject)
        const subTotal = 200; 
        const subPercent = Math.min(100, Math.round((subAttempts / subTotal) * 100));
        
        const card = document.createElement('div');
        card.className = 'card bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-95 animate-fade-up';
        card.style.animationDelay = `${index * 50}ms`;
        
        // On Click -> Open Topic Modal (Using the NEW Dynamic Topic Logic)
        card.onclick = () => {
            // Set global context
            window.currentMode = 'test';
            window.currentPaper = tab;
            openTopicModal(sub, tab); 
        };

        const barColor = sub.color ? `bg-${sub.color}-500` : 'bg-blue-500';
        const iconColor = sub.color ? `text-${sub.color}-500 bg-${sub.color}-50` : 'text-blue-500 bg-blue-50';

        card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div class="w-8 h-8 rounded-lg ${iconColor} flex items-center justify-center">
                    <i class="fa-solid ${sub.icon}"></i>
                </div>
                <span class="text-[10px] font-bold text-slate-400 uppercase">${tab.toUpperCase()}</span>
            </div>
            <h4 class="font-bold text-sm text-slate-800 truncate">${sub.name}</h4>
            <div class="mt-3 flex items-center gap-2">
                <div class="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full ${barColor}" style="width: ${subPercent}%"></div>
                </div>
                <span class="text-[9px] font-bold text-slate-400">${subAttempts} Qs</span>
            </div>
        `;
        container.appendChild(card);
    });
}

