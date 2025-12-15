/**
 * page-notes.js
 * Logic for the "Bento Grid" Notes Page
 */

function openNote(type) {
    // In a real app, this would fetch content from a database.
    // For now, we simulate "Opening a Window".
    
    // Create Modal on the fly
    const modalId = 'note-modal';
    let content = '';

    if (type === 'fact') {
        content = `
            <div class="bg-amber-50 p-6 rounded-t-3xl border-b border-amber-100">
                <span class="px-2 py-1 bg-white text-amber-700 rounded text-[10px] font-bold uppercase shadow-sm">Daily Fact</span>
                <h2 class="text-2xl font-serif font-bold text-slate-900 mt-3">The 42nd Amendment</h2>
            </div>
            <div class="p-6 text-sm text-slate-700 leading-relaxed space-y-4">
                <p>Often called the <strong>"Mini Constitution"</strong>, it was enacted in 1976.</p>
                <ul class="list-disc pl-5 space-y-2">
                    <li>Added "Socialist, Secular, Integrity" to Preamble.</li>
                    <li>Added Fundamental Duties (Part IV-A).</li>
                    <li>Made the President bound by the advice of the Cabinet.</li>
                </ul>
                <div class="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-4">
                    <p class="text-xs text-blue-800 font-bold">💡 High Yield Point:</p>
                    <p class="text-xs text-blue-600 mt-1">It attempted to reduce the power of the Supreme Court and High Courts.</p>
                </div>
            </div>
        `;
    } else if (type === 'formula') {
        content = `
            <div class="bg-slate-900 p-6 rounded-t-3xl text-white">
                <h2 class="text-xl font-bold">Speed, Distance, Time</h2>
            </div>
            <div class="p-6 space-y-6">
                <div class="bg-slate-100 p-4 rounded-xl text-center">
                    <p class="text-3xl font-mono font-bold text-slate-800">S = D / T</p>
                </div>
                <div>
                    <h4 class="font-bold text-sm text-slate-800 mb-2">Derived Formulas:</h4>
                    <p class="text-sm text-slate-600 border-b border-slate-100 py-2">Distance = Speed × Time</p>
                    <p class="text-sm text-slate-600 border-b border-slate-100 py-2">Time = Distance / Speed</p>
                </div>
                <div class="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <p class="text-xs text-emerald-800 font-bold">🚀 Trick:</p>
                    <p class="text-xs text-emerald-600 mt-1">To convert km/h to m/s, multiply by <strong>5/18</strong>.</p>
                </div>
            </div>
        `;
    }

    showFloatingWindow(content);
}

function showFloatingWindow(htmlContent) {
    // Check if modal exists
    let modal = document.getElementById('floating-window');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'floating-window';
        modal.className = 'fixed inset-0 z-[60] hidden flex items-end sm:items-center justify-center pointer-events-none';
        modal.innerHTML = `
            <div class="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity opacity-0 pointer-events-auto" onclick="closeFloatingWindow()"></div>
            <div class="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl transform translate-y-full transition-transform duration-300 pointer-events-auto flex flex-col max-h-[85vh] m-0 sm:m-4" id="fw-content">
                <div id="fw-body" class="overflow-y-auto"></div>
                <button onclick="closeFloatingWindow()" class="absolute top-4 right-4 w-8 h-8 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center text-slate-700 transition-colors">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    document.getElementById('fw-body').innerHTML = htmlContent;
    
    // Animate In
    modal.classList.remove('hidden');
    // Force Reflow
    void modal.offsetWidth; 
    
    modal.querySelector('.bg-black\\/20').classList.remove('opacity-0');
    document.getElementById('fw-content').classList.remove('translate-y-full');
}

window.closeFloatingWindow = function() {
    const modal = document.getElementById('floating-window');
    if (!modal) return;
    
    modal.querySelector('.bg-black\\/20').classList.add('opacity-0');
    document.getElementById('fw-content').classList.add('translate-y-full');
    
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}
