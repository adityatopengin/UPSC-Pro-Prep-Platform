/**
 * DataManager.js
 * Universal Data Adapter
 * Normalizes question data (tags, notes, linked concepts).
 */

class DataManager {
    constructor() {
        this.mode = (typeof window.isOffline === 'function' && window.isOffline()) ? 'local' : 'cloud';
    }

    /**
     * Fetch & Normalize Questions
     * Ensures all new parameters (tags, notes) are available.
     */
    async fetchQuestions(filename) {
        try {
            const res = await fetch(`data/${filename}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            
            const rawData = await res.json();
            const rawQuestions = Array.isArray(rawData) ? rawData : (rawData.questions || []);

            // ADAPTER PATTERN
            return rawQuestions.map(q => {
                return {
                    // Core Identity
                    id: q.id,
                    paper: q.paper || (filename.includes('csat') ? 'csat' : 'gs1'),
                    subject: q.subject || 'General',
                    topic: q.topic || 'General',
                    year: q.year || 'Model',
                    difficulty: q.difficulty || 'Medium',

                    // Content
                    type: q.type || 'standard',
                    text: q.text || q.question_text,
                    options: q.options || [],
                    correct: (q.correct !== undefined) ? q.correct : (q.correct_option_index || 0),
                    
                    // Rich Metadata (New)
                    explanation: q.explanation || "No explanation.",
                    tags: q.tags || [], // e.g. ["Conceptual", "Hard"]
                    notes: q.notes || null, // e.g. "Remember Art 21"
                    linkedConcepts: q.linked_concepts || q.linkedConcepts || [], // Spider Web
                    
                    // Media
                    imgUrl: q.imgUrl || q.image_url || null,
                    parentText: q.parentText || q.passage_text || null
                };
            });

        } catch (error) {
            console.warn(`DataManager: Failed to load ${filename}`, error);
            return [];
        }
    }

    /**
     * Save Result (Local + Cloud Future)
     */
    async saveResult(resultData) {
        // 1. Local Save
        const history = JSON.parse(localStorage.getItem('upsc_history') || '[]');
        history.push({
            ...resultData,
            synced: false,
            savedAt: new Date().toISOString()
        });
        localStorage.setItem('upsc_history', JSON.stringify(history));
        
        // 2. Cloud Hook (Placeholder for Phase 2)
        if (this.mode === 'cloud') {
            // Firestore logic will go here
        }
        return true;
    }

    /**
     * Get Aggregated Stats (For Stats Page)
     */
    async getStats() {
        const history = JSON.parse(localStorage.getItem('upsc_history') || '[]');
        
        let totalQs = 0, totalCorrect = 0, totalTime = 0;
        const subjects = {};
        const accuracyTrend = [];

        history.forEach(h => {
            totalQs += (h.total || 0);
            totalCorrect += (h.correct || 0);
            totalTime += (h.timeSpent || 0);

            // Trend Data
            const acc = h.total ? Math.round((h.correct/h.total)*100) : 0;
            accuracyTrend.push(acc);

            // Subject Breakdown
            const sub = h.subject || 'Mixed';
            if (!subjects[sub]) subjects[sub] = { qs: 0, correct: 0 };
            subjects[sub].qs += h.total;
            subjects[sub].correct += h.correct;
        });

        return {
            totalQuestions: totalQs,
            accuracy: totalQs > 0 ? Math.round((totalCorrect/totalQs)*100) : 0,
            studyHours: Math.round(totalTime / 60), // Minutes
            subjects: subjects, // { 'Polity': { qs: 10, correct: 5 } }
            history: accuracyTrend.slice(-10) // Last 10 quizzes
        };
    }
}

const appData = new DataManager();

