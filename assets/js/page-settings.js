/**
 * page-settings.js
 * Controls Preferences, Sync, and Data Management
 */

document.addEventListener('DOMContentLoaded', () => {
    // Init Theme Toggle State
    const isDark = localStorage.getItem('upsc_theme') === 'dark';
    const toggle = document.getElementById('dark-toggle');
    if (toggle) toggle.checked = isDark;

    // Check Cloud Status
    if (!window.isOffline()) {
        const statusEl = document.getElementById('sync-status');
        if (statusEl) {
            statusEl.innerHTML = '<i class="fa-solid fa-cloud text-blue-500"></i> Cloud Ready';
            statusEl.classList.replace('text-slate-500', 'text-blue-600');
        }
    }
});

function toggleDark(el) {
    const mode = el.checked ? 'dark' : 'light';
    localStorage.setItem('upsc_theme', mode);
    document.documentElement.setAttribute('data-theme', mode);
}

function triggerSync() {
    if (window.isOffline()) {
        alert("Offline Mode: Data is saved locally on this device.");
        return;
    }
    // Placeholder for future Cloud Sync logic
    const btn = event.currentTarget;
    const oldText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Syncing...';
    setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Done';
        setTimeout(() => btn.innerHTML = oldText, 2000);
    }, 1500);
}

function logout() {
    if (confirm("Log out? Local data will remain safely on this device.")) {
        // Just reload for now as we are mostly local
        window.location.reload();
    }
}

function exportData() {
    const history = JSON.parse(localStorage.getItem('upsc_history') || '[]');
    const mistakes = JSON.parse(localStorage.getItem('upsc_mistakes') || '[]');
    
    const data = {
        date: new Date().toISOString(),
        history,
        mistakes
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `upsc-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function clearHistory() {
    if (confirm("Permanently delete quiz history?")) {
        localStorage.removeItem('upsc_history');
        localStorage.removeItem('upsc_last_result');
        alert("History cleared.");
        window.location.reload();
    }
}

function factoryReset() {
    if (confirm("⚠️ FACTORY RESET: This will wipe ALL app data, settings, and mistakes.\n\nAre you sure?")) {
        localStorage.clear();
        alert("App Reset. Reloading...");
        window.location.href = 'index.html';
    }
}

