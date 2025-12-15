/**
 * layout.js
 * UI Manager: Injects Header, Navigation, and Disclaimer
 */

// 1. Google Analytics Setup (Add your ID here)
const GA_MEASUREMENT_ID = ""; // e.g., "G-XXXXXXXXXX"

document.addEventListener('DOMContentLoaded', () => {
    initAnalytics();
    injectHeader();
    injectNavigation();
    checkDisclaimer();
});

function initAnalytics() {
    if (!GA_MEASUREMENT_ID) return;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
    
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);
}

/* =========================================
   1. HEADER INJECTION (Corrected Links)
   ========================================= */
function injectHeader() {
    const headerPlaceholder = document.getElementById('app-header');
    if (!headerPlaceholder) return;

    const isHome = window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/');
    
    // Logic: Gear Icon ONLY on Home Page.
    let rightContent = '';
    if (isHome) {
        rightContent = `
            <button onclick="window.location.href='settings.html'" class="w-9 h-9 rounded-full bg-white/50 border border-white/60 text-slate-500 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-sm backdrop-blur-md">
                <i class="fa-solid fa-gear"></i>
            </button>
        `;
    } else {
        // Status Badge for other pages
        rightContent = `
            <div class="bg-white/50 border border-white/60 px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-md">
                <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span class="text-[9px] font-bold text-slate-500 uppercase">Active</span>
            </div>
        `;
    }

    // Clicking Profile goes to HOME now (not Settings)
    headerPlaceholder.innerHTML = `
        <header class="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50 
                       bg-white/60 backdrop-blur-xl border border-white/50 shadow-lg shadow-blue-900/5 
                       rounded-full px-4 py-2 flex items-center justify-between transition-all duration-300">
            
            <div class="flex items-center gap-3 cursor-pointer group" onclick="window.location.href='index.html'">
                <div class="w-10 h-10 rounded-full p-0.5 border border-white/50 shadow-sm relative overflow-hidden group-hover:scale-105 transition-transform">
                    <img src="assets/images/Omg.jpg" alt="Profile" class="w-full h-full object-cover rounded-full">
                </div>
                <div class="flex flex-col">
                    <h1 class="text-xs font-bold text-slate-800 leading-tight">Hello, Aspirant</h1>
                    <span class="text-[9px] font-bold text-blue-600 uppercase tracking-wider">Target: CSE 2026</span>
                </div>
            </div>

            ${rightContent}
        </header>
    `;
}

/* =========================================
   2. NAVIGATION INJECTION
   ========================================= */
function injectNavigation() {
    const navPlaceholder = document.getElementById('app-nav');
    if (!navPlaceholder) return;

    const path = window.location.pathname;
    const p = (page) => path.includes(page);
    const active = "text-blue-600 scale-110";
    const inactive = "text-slate-400 hover:text-slate-600";

    navPlaceholder.innerHTML = `
        <nav class="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50 
                    bg-white/70 backdrop-blur-2xl border border-white/40 shadow-2xl shadow-blue-900/10 
                    rounded-3xl px-6 py-3 flex justify-between items-center transition-all duration-300">
            
            <button onclick="window.location.href='index.html'" class="flex flex-col items-center w-12 transition-all duration-300 ${p('index') || path.endsWith('/') ? active : inactive}">
                <i class="fa-solid fa-house text-xl mb-1"></i>
                <span class="text-[9px] font-bold">Home</span>
            </button>
            
            <button onclick="window.location.href='quiz_selection.html'" class="relative -top-6 group">
                <div class="w-14 h-14 bg-gradient-to-tr from-blue-600 to-blue-500 rounded-full shadow-lg shadow-blue-500/40 
                            flex items-center justify-center text-white border-4 border-white/80 transition-transform group-active:scale-95">
                    <i class="fa-solid fa-play text-lg ml-1"></i>
                </div>
            </button>
            
            <button onclick="window.location.href='notes.html'" class="flex flex-col items-center w-12 transition-all duration-300 ${p('notes') ? active : inactive}">
                <i class="fa-solid fa-newspaper text-xl mb-1"></i>
                <span class="text-[9px] font-bold">Notes</span>
            </button>

            <button onclick="window.location.href='stats.html'" class="flex flex-col items-center w-12 transition-all duration-300 ${p('stats') || p('analysis') ? active : inactive}">
                <i class="fa-solid fa-chart-pie text-xl mb-1"></i>
                <span class="text-[9px] font-bold">Stats</span>
            </button>
        </nav>
    `;
}

/* =========================================
   3. DISCLAIMER POPUP
   ========================================= */
function checkDisclaimer() {
    // Logic to show disclaimer (same as before)
    if (localStorage.getItem('upsc_disclaimer_accepted') === 'true') return;
    
    showDisclaimerModal();
}

// Exposed function to re-open via Settings
function showDisclaimerModal() {
    const modal = document.createElement('div');
    modal.id = 'disclaimer-modal';
    modal.className = 'fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in';
    
    modal.innerHTML = `
        <div class="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
            <div class="h-32 bg-blue-600 relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/30"></div>
                <div class="absolute bottom-4 left-6 text-white">
                    <h2 class="text-xl font-bold">Welcome, Aspirant</h2>
                    <p class="text-xs opacity-90">Please listen to the guidelines</p>
                </div>
            </div>
            <div class="p-6 space-y-4">
                <div class="bg-blue-50 rounded-xl p-4 flex items-center gap-4 border border-blue-100">
                    <button onclick="toggleAudio(this)" class="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                        <i class="fa-solid fa-play"></i>
                    </button>
                    <div class="flex-1">
                        <div class="h-1 bg-blue-200 rounded-full overflow-hidden">
                            <div id="audio-bar" class="h-full bg-blue-600 w-0 transition-all duration-[30s]"></div>
                        </div>
                        <p class="text-[10px] text-blue-500 mt-1 font-bold uppercase">Listen to Instructions</p>
                    </div>
                    <audio id="disclaimer-audio" src="assets/audio/disclaimer.mp3"></audio>
                </div>
                <div class="text-sm text-slate-600 leading-relaxed max-h-32 overflow-y-auto pr-2 space-y-2">
                    <p><strong>1. Integrity:</strong> This app is designed for serious UPSC aspirants. Use the 'Test Mode' honestly.</p>
                    <p><strong>2. Consistency:</strong> Daily practice is key.</p>
                    <p><strong>3. Just Relax:</strong> Load mat lo kuch nahi dhara, ye disclaimer suno, kya bol rahe hain <strong>PRADEEP TRIPATHI</strong>.</p>
                </div>
                <button onclick="acceptDisclaimer()" class="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-slate-800 transition-colors">
                    I Understand & Accept
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

window.toggleAudio = function(btn) {
    const audio = document.getElementById('disclaimer-audio');
    const bar = document.getElementById('audio-bar');
    if (audio.paused) { audio.play(); btn.innerHTML = '<i class="fa-solid fa-pause"></i>'; bar.style.width = '100%'; } 
    else { audio.pause(); btn.innerHTML = '<i class="fa-solid fa-play"></i>'; bar.style.width = '50%'; }
}

window.acceptDisclaimer = function() {
    const modal = document.getElementById('disclaimer-modal');
    modal.style.opacity = '0';
    setTimeout(() => { modal.remove(); localStorage.setItem('upsc_disclaimer_accepted', 'true'); }, 300);
}

