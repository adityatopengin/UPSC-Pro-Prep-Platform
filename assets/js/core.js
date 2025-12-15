/**
 * core.js
 * Central Logic for Data Fetching, Storage, and Configuration
 */

// Global State
window.appData = {
    
    // FETCH: Load Questions from JSON file
    async fetchQuestions(filename) {
        try {
            // Prevent caching issues by adding a timestamp
            const url = `data/${filename}?t=${new Date().getTime()}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                console.error(`Failed to load ${filename}: ${response.status}`);
                return [];
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching ${filename}:`, error);
            return [];
        }
    },

    // SAVE: Store Quiz Result
    saveResult(resultData) {
        // 1. Get existing history
        const history = JSON.parse(localStorage.getItem('upsc_history') || '[]');
        
        // 2. Add new result
        history.unshift(resultData); // Add to top
        
        // 3. Limit history to last 50 attempts to save space
        if (history.length > 50) history.pop();
        
        // 4. Save back
        localStorage.setItem('upsc_history', JSON.stringify(history));
        
        // 5. Update Streak (Simple logic)
        const today = new Date().toDateString();
        const lastDate = localStorage.getItem('upsc_last_active_date');
        
        if (lastDate !== today) {
            let streak = parseInt(localStorage.getItem('upsc_streak') || '0');
            // If yesterday was active, increment. Else reset.
            // For simplicity, we just increment if it's a new day
            streak++; 
            localStorage.setItem('upsc_streak', streak.toString());
            localStorage.setItem('upsc_last_active_date', today);
        }
    }
};

/* =========================================
   HELPER FUNCTIONS (Global)
   ========================================= */

// Save Quiz Settings (Paper, Subject, Mode)
function saveQuizConfig(config) {
    localStorage.setItem('upsc_quiz_config', JSON.stringify(config));
}

// Load Quiz Settings
function loadQuizConfig() {
    const data = localStorage.getItem('upsc_quiz_config');
    return data ? JSON.parse(data) : null;
}

// Save Mistakes for Review
function saveMistakes(mistakeList) {
    let existing = JSON.parse(localStorage.getItem('upsc_mistakes') || '[]');
    
    // Add new mistakes, avoiding duplicates based on Question ID
    mistakeList.forEach(q => {
        if (!existing.find(e => e.id === q.id)) {
            existing.push(q);
        }
    });
    
    localStorage.setItem('upsc_mistakes', JSON.stringify(existing));
}

// Check Offline Status
window.isOffline = function() {
    return !navigator.onLine;
};

// Format Seconds to MM:SS
window.formatTime = function(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

