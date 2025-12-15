/**
 * core.js - The Central Intelligence
 * Handles Data Scanning, Topic Extraction, and Global State.
 */

const APP_DATA = {
    // 15 Files Configuration
    files: [
        'polity.json', 'modern_history.json', 'ancient_history.json', 'medieval_history.json', 'art_culture.json',
        'world_geo.json', 'indian_geo.json', 'environment.json', 'economy.json', 'science_tech.json', 'ir.json', 'misc.json',
        'csat_math.json', 'csat_reasoning.json', 'csat_passage.json'
    ],
    questions: [],
    topics: {}, // Dynamic Topic Map: { 'Polity': ['Preamble', 'FR'] }
    meta: { total: 0, gs1: 0, csat: 0, subjects: {} }
};

/* =========================================
   1. STARTUP ENGINE
   ========================================= */
(function initSystem() {
    // Check Theme
    const savedTheme = localStorage.getItem('upsc_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Trigger Data Scan (Lazy Load)
    // We don't await here to not block UI rendering. Page controllers handle the wait.
    scanAllData();
})();

async function scanAllData() {
    if (APP_DATA.questions.length > 0) return; // Already loaded

    console.log("🚀 Core: Scanning Data Files...");

    // Parallel Fetch
    const promises = APP_DATA.files.map(fileName => 
        fetch(`data/${fileName}`).then(res => res.ok ? res.json() : [])
        .catch(() => [])
    );

    const results = await Promise.all(promises);
    
    // Process Results
    results.forEach((fileData, index) => {
        // Handle Wrapped Data ({ questions: [...] }) vs Array ([...])
        const rawQs = Array.isArray(fileData) ? fileData : (fileData.questions || []);
        
        rawQs.forEach(q => {
            // Normalization
            const subject = q.subject || 'General';
            const paper = q.paper || (APP_DATA.files[index].includes('csat') ? 'csat' : 'gs1');
            const topic = q.topic || 'General';

            // Update Counts
            APP_DATA.meta.total++;
            if (paper === 'csat') APP_DATA.meta.csat++; else APP_DATA.meta.gs1++;
            APP_DATA.meta.subjects[subject] = (APP_DATA.meta.subjects[subject] || 0) + 1;

            // Build Dynamic Topic Map
            if (!APP_DATA.topics[subject]) APP_DATA.topics[subject] = new Set();
            APP_DATA.topics[subject].add(topic);
        });

        APP_DATA.questions.push(...rawQs);
    });

    // Save Meta for Dashboard (Instant Load next time)
    localStorage.setItem('upsc_meta_cache', JSON.stringify(APP_DATA.meta));
    console.log(`✅ Core: Loaded ${APP_DATA.meta.total} Qs across ${Object.keys(APP_DATA.topics).length} subjects.`);
}

/* =========================================
   2. PUBLIC API (Helpers)
   ========================================= */

// Get Real Topics for a Subject
function getTopicsForSubject(subjectName) {
    if (APP_DATA.topics[subjectName]) {
        // Convert Set to Array and Sort
        return Array.from(APP_DATA.topics[subjectName]).sort(); 
    }
    return ['All Topics'];
}

// Calculate Score
function calculateScore(quiz, answers, paperType = 'gs1') {
    let correct = 0, wrong = 0, skipped = 0;
    const marksPerQ = (paperType === 'csat') ? 2.5 : 2.0;
    const negative = (paperType === 'csat') ? 0.83 : 0.66;

    quiz.forEach(q => {
        const userAns = answers[q.id];
        if (userAns === undefined) skipped++;
        else if (userAns === q.correct) correct++;
        else wrong++;
    });

    const rawScore = (correct * marksPerQ) - (wrong * negative);
    return {
        score: parseFloat(rawScore.toFixed(2)),
        correct, wrong, skipped,
        attempted: correct + wrong
    };
}

// Format Time
function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

// Save Quiz Config
function saveQuizConfig(config) {
    localStorage.setItem('upsc_quiz_config', JSON.stringify(config));
}

// Mistake Bank Saver
function saveMistakes(mistakes) {
    if (!mistakes.length) return;
    let bank = JSON.parse(localStorage.getItem('upsc_mistakes') || '[]');
    
    mistakes.forEach(m => {
        if (!bank.some(saved => saved.id === m.id)) {
            bank.push({
                id: m.id,
                text: m.text,
                subject: m.subject,
                topic: m.topic,
                options: m.options,
                correct: m.correct,
                explanation: m.explanation,
                tags: m.tags || [],
                savedAt: new Date().toISOString()
            });
        }
    });
    
    if (bank.length > 100) bank = bank.slice(-100); // Cap at 100
    localStorage.setItem('upsc_mistakes', JSON.stringify(bank));
}

