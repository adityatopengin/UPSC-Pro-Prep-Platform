/**
 * page-analysis.js
 * Analysis Page Logic
 * Features: Score Calc, Charts, Rich Review, Share-as-Image
 */

let analysisData = {};

document.addEventListener('DOMContentLoaded', () => {
    // Load Data
    const saved = localStorage.getItem('upsc_last_result');
    if (saved) {
        analysisData = JSON.parse(saved);
        initAnalysis();
    } else {
        // Redirect if no data
        window.location.href = 'index.html'; 
    }
});

function initAnalysis() {
    // 1. Populate Scorecard
    document.getElementById('final-score').innerText = analysisData.score || 0;
    
    // Max Marks: GS=200, CSAT=200 (approx logic)
    const maxMarks = analysisData.paper === 'csat' ? 200 : 200; 
    document.getElementById('total-marks').innerText = maxMarks;

    document.getElementById('accuracy-text').innerText = (analysisData.accuracy || 0) + '%';
    document.getElementById('total-time-taken').innerText = formatDuration(analysisData.timeSpent);
    
    // Avg Time
    const avg = analysisData.total > 0 ? Math.round(analysisData.timeSpent / analysisData.total) : 0;
    document.getElementById('avg-time').innerText = avg + 's';
    document.getElementById('center-total').innerText = analysisData.total;

    // 2. Render Charts
    renderCharts();

    // 3. Render Review List
    renderReviewList('all');
}

/* =========================================
   SHARE AS IMAGE (New Feature)
   ========================================= */
function shareResult() {
    const target = document.getElementById('share-target');
    const btn = event.currentTarget;
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
    
    html2canvas(target, {
        scale: 2, // High Res
        backgroundColor: null,
        useCORS: true
    }).then(canvas => {
        // Convert to Image
        const image = canvas.toDataURL("image/png");
        
        // Trigger Download
        const link = document.createElement('a');
        link.download = `upsc-result-${new Date().toISOString().slice(0,10)}.png`;
        link.href = image;
        link.click();
        
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Saved!';
        setTimeout(() => btn.innerHTML = originalText, 2000);
    }).catch(err => {
        console.error("Share failed", err);
        alert("Could not generate image.");
        btn.innerHTML = originalText;
    });
}

/* =========================================
   CHARTS & LISTS
   ========================================= */
function renderCharts() {
    // Accuracy Doughnut
    const ctxAcc = document.getElementById('accuracyChart');
    if (ctxAcc) {
        new Chart(ctxAcc, {
            type: 'doughnut',
            data: {
                labels: ['Correct', 'Wrong', 'Skipped'],
                datasets: [{
                    data: [analysisData.correct, analysisData.wrong, analysisData.skipped],
                    backgroundColor: ['#10b981', '#ef4444', '#e2e8f0'],
                    borderWidth: 0,
                    hoverOffset: 5
                }]
            },
            options: { cutout: '75%', plugins: { legend: { display: false } } }
        });
    }

    // Subject Bar Chart
    const ctxSub = document.getElementById('subjectChart');
    if (ctxSub) {
        // Group by Subject
        const subData = {};
        analysisData.quiz.forEach(q => {
            const s = q.subject || 'Gen';
            if (!subData[s]) subData[s] = { total: 0, correct: 0 };
            subData[s].total++;
            if (q.userSel === q.correct) subData[s].correct++;
        });

        const labels = Object.keys(subData);
        const data = labels.map(s => Math.round((subData[s].correct / subData[s].total) * 100));

        new Chart(ctxSub, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Accuracy %',
                    data: data,
                    backgroundColor: '#3b82f6',
                    borderRadius: 4
                }]
            },
            options: { 
                plugins: { legend: { display: false } },
                scales: { 
                    y: { beginAtZero: true, max: 100, display: false },
                    x: { grid: { display: false }, ticks: { font: { size: 9 } } }
                }
            }
        });
    }
}

function renderReviewList(filter) {
    const container = document.getElementById('review-list');
    container.innerHTML = '';
    
    // Update Filter Buttons logic... (omitted for brevity, same as before)

    // Filter Questions
    const list = analysisData.quiz.filter(q => {
        if (filter === 'wrong') return q.userSel !== undefined && q.userSel !== q.correct;
        return true;
    });

    list.forEach(q => {
        let statusColor = 'bg-slate-100 text-slate-500 border-slate-200';
        let statusText = 'Skipped';
        
        if (q.userSel === q.correct) {
            statusColor = 'bg-emerald-50 text-emerald-600 border-emerald-200';
            statusText = 'Correct';
        } else if (q.userSel !== undefined) {
            statusColor = 'bg-red-50 text-red-600 border-red-200';
            statusText = 'Wrong';
        }

        // Tags Logic
        let tagsHtml = '';
        if (q.tags && q.tags.length) {
            tagsHtml = q.tags.map(t => `<span class="px-1.5 py-0.5 rounded text-[9px] bg-slate-100 text-slate-500 border border-slate-200">${t}</span>`).join('');
        }

        const div = document.createElement('div');
        div.className = 'bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-blue-300 transition-all active:scale-95';
        div.onclick = () => openDetailedModal(q);
        
        div.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${statusColor}">${statusText}</span>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">${q.subject}</span>
                </div>
                <div class="flex gap-1">${tagsHtml}</div>
            </div>
            <p class="text-sm font-medium text-slate-800 line-clamp-2">${q.text}</p>
        `;
        container.appendChild(div);
    });
}

function openDetailedModal(q) {
    // Populate Standard Fields
    document.getElementById('m-subject').innerText = q.subject;
    document.getElementById('m-text').innerText = q.text;
    
    // Image Handling
    const imgBox = document.getElementById('m-img-container');
    if (q.imgUrl) {
        imgBox.classList.remove('hidden');
        document.getElementById('m-image').src = q.imgUrl;
    } else {
        imgBox.classList.add('hidden');
    }

    // Options Logic
    const optContainer = document.getElementById('m-options');
    optContainer.innerHTML = '';
    q.options.forEach((opt, i) => {
        let style = 'p-3 rounded-lg border border-slate-200 text-slate-600 text-sm bg-slate-50';
        let icon = '';
        
        if (i === q.correct) {
            style = 'p-3 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 font-bold text-sm';
            icon = '<i class="fa-solid fa-check float-right text-emerald-600 mt-1"></i>';
        } else if (i === q.userSel) {
            style = 'p-3 rounded-lg border border-red-300 bg-red-50 text-red-800 font-bold text-sm';
            icon = '<i class="fa-solid fa-xmark float-right text-red-600 mt-1"></i>';
        }
        
        const div = document.createElement('div');
        div.className = style;
        div.innerHTML = `${opt} ${icon}`;
        optContainer.appendChild(div);
    });

    // Rich Explanation (Notes + Linked Concepts)
    let expHtml = `<p class="mb-3">${q.explanation}</p>`;
    
    if (q.notes) {
        expHtml += `
        <div class="bg-yellow-50 border border-yellow-200 p-3 rounded-lg flex gap-3 mb-3">
            <i class="fa-solid fa-lightbulb text-yellow-600 mt-0.5 text-xs"></i>
            <p class="text-xs text-yellow-800 font-medium italic">"${q.notes}"</p>
        </div>`;
    }

    if (q.linkedConcepts && q.linkedConcepts.length > 0) {
        expHtml += `
        <div class="pt-3 border-t border-emerald-200">
            <span class="text-[10px] font-bold text-emerald-600 uppercase tracking-wide block mb-2">
                <i class="fa-solid fa-link mr-1"></i> Related Topics
            </span>
            <div class="flex flex-wrap gap-2">
                ${q.linkedConcepts.map(c => `<span class="px-2 py-1 bg-white border border-emerald-200 rounded text-[10px] font-bold text-emerald-700 shadow-sm">${c}</span>`).join('')}
            </div>
        </div>`;
    }

    document.getElementById('m-exp').innerHTML = expHtml;

    openModal('q-modal');
}

// Helper Duration Formatter
function formatDuration(seconds) {
    if (!seconds) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
}

