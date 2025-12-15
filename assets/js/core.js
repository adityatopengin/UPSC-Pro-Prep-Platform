/**
 * core.js
 * Central Logic for Data Fetching, Storage, and Scoring
 */

window.appData = {
    async fetchQuestions(filename) {
        try {
            const url = `data/${filename}?t=${new Date().getTime()}`;
            const response = await fetch(url);
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${filename}:`, error);
            return [];
        }
    },

    saveResult(resultData) {
        const history = JSON.parse(localStorage.getItem('upsc_history') || '[]');
        history.unshift(resultData);
        if (history.length > 50) history.pop();
        localStorage.setItem('upsc_history', JSON.stringify(history));
    }
};

/* =========================================
   SCORING LOGIC (Was Missing!)
   ========================================= */
function calculateScore(quiz, answers, paper) {
    let correct = 0;
    let wrong = 0;
    let attempted = 0;
    
    quiz.forEach((q, idx) => {
        const userAns = answers[q.id];
        if (userAns !== undefined) {
            attempted++;
            if (userAns === q.correct) {
                correct++;
            } else {
                wrong++;
            }
        }
    });

    // Scoring Rules
    // GS1: +2 for correct, -0.66 for wrong
    // CSAT: +2.5 for correct, -0.83 for wrong
    let score = 0;
    if (paper === 'csat') {
        score = (correct * 2.5) - (wrong * 0.83);
    } else {
        score = (correct * 2) - (wrong * 0.66);
    }

    return {
        score: parseFloat(score.toFixed(2)),
        correct,
        wrong,
        attempted,
        skipped: quiz.length - attempted
    };
}

/* =========================================
   HELPER FUNCTIONS
   ========================================= */
function saveQuizConfig(config) {
    localStorage.setItem('upsc_quiz_config', JSON.stringify(config));
}

function loadQuizConfig() {
    const data = localStorage.getItem('upsc_quiz_config');
    return data ? JSON.parse(data) : null;
}

function saveMistakes(mistakeList) {
    let existing = JSON.parse(localStorage.getItem('upsc_mistakes') || '[]');
    mistakeList.forEach(q => {
        if (!existing.find(e => e.id === q.id)) existing.push(q);
    });
    localStorage.setItem('upsc_mistakes', JSON.stringify(existing));
}

window.isOffline = function() { return !navigator.onLine; };
window.formatTime = function(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

