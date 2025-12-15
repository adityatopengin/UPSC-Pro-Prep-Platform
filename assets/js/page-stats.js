/**
 * page-stats.js
 * Logic for Lifetime Statistics & Visualizations
 */

let statsState = {
    data: null
};

document.addEventListener('DOMContentLoaded', async () => {
    // Fetch aggregated stats from DataManager
    statsState.data = await appData.getStats();
    
    if (statsState.data) {
        renderHeroStats();
        renderSWOT();
        renderTrendChart();
        renderSubjectList();
    }
});

function renderHeroStats() {
    const s = statsState.data;
    document.getElementById('total-accuracy').innerText = s.accuracy + '%';
    document.getElementById('total-qs').innerText = s.totalQuestions.toLocaleString();
    
    const h = Math.floor(s.studyHours / 60);
    const m = s.studyHours % 60;
    document.getElementById('study-hours').innerText = `${h}h ${m}m`;
}

function renderSWOT() {
    const subjects = statsState.data.subjects;
    let strong = [], mod = [], weak = [];
    
    for (const [sub, data] of Object.entries(subjects)) {
        if (data.qs < 5) continue; // Ignore if less than 5 Qs attempted
        
        const acc = Math.round((data.correct / data.qs) * 100);
        if (acc > 65) strong.push(sub);
        else if (acc >= 40) mod.push(sub);
        else weak.push(sub);
    }
    
    const format = (list) => list.length ? list.join(', ') : 'No data yet';
    
    document.getElementById('list-strength').innerText = format(strong);
    document.getElementById('list-moderate').innerText = format(mod);
    document.getElementById('list-weak').innerText = format(weak);
}

function renderTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    
    // Fallback if no history
    const history = (statsState.data.history.length > 0) ? statsState.data.history : [0];
    const labels = history.map((_, i) => `Q${i+1}`);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Accuracy %',
                data: history,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 3,
                pointBackgroundColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, max: 100, grid: { borderDash: [4, 4] }, ticks: { display: false } },
                x: { grid: { display: false }, ticks: { display: false } }
            }
        }
    });
}

function renderSubjectList() {
    const container = document.getElementById('subject-list');
    container.innerHTML = '';
    
    const subjects = statsState.data.subjects;
    
    // Sort by Accuracy Descending
    const sorted = Object.entries(subjects).sort((a, b) => {
        const accA = a[1].qs ? (a[1].correct/a[1].qs) : 0;
        const accB = b[1].qs ? (b[1].correct/b[1].qs) : 0;
        return accB - accA;
    });

    if (sorted.length === 0) {
        container.innerHTML = '<p class="text-center text-xs text-slate-400 p-4">Take a quiz to see breakdown.</p>';
        return;
    }

    sorted.forEach(([name, data]) => {
        const acc = Math.round((data.correct / data.qs) * 100);
        let color = acc > 65 ? 'text-emerald-600 bg-emerald-500' : (acc >= 40 ? 'text-amber-600 bg-amber-500' : 'text-red-600 bg-red-500');
        const [textColor, bgColor] = color.split(' ');

        const div = document.createElement('div');
        div.className = 'bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between';
        div.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                    ${name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                    <h4 class="font-bold text-sm text-slate-800">${name}</h4>
                    <p class="text-[10px] text-slate-400">${data.qs} Questions</p>
                </div>
            </div>
            <div class="flex flex-col items-end gap-1">
                <span class="text-sm font-bold ${textColor}">${acc}%</span>
                <div class="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full ${bgColor}" style="width: ${acc}%"></div>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}
