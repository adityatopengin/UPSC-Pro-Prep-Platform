/**
 * subjects.js
 * Configuration file for Subject Icons, Colors, and File Mapping
 */

// 1. GS PAPER 1 (12 Subjects)
const subjectsGS1 = [
    { name: 'Indian Polity', icon: 'fa-landmark', color: 'orange' },
    { name: 'Modern India', icon: 'fa-feather-pointed', color: 'yellow' },
    { name: 'Ancient India', icon: 'fa-scroll', color: 'amber' },
    { name: 'Medieval India', icon: 'fa-chess-rook', color: 'amber' },
    { name: 'Art & Culture', icon: 'fa-palette', color: 'rose' },
    { name: 'World Geography', icon: 'fa-earth-americas', color: 'blue' },
    { name: 'Indian Geography', icon: 'fa-map-location-dot', color: 'cyan' },
    { name: 'Environment', icon: 'fa-leaf', color: 'green' },
    { name: 'Indian Economy', icon: 'fa-indian-rupee-sign', color: 'emerald' },
    { name: 'Science & Tech', icon: 'fa-microchip', color: 'purple' },
    { name: 'Intl. Relations', icon: 'fa-handshake', color: 'indigo' },
    { name: 'Miscellaneous', icon: 'fa-star', color: 'slate' }
];

// 2. CSAT PAPER 2 (3 Subjects)
const subjectsCSAT = [
    { name: 'Mathematics', icon: 'fa-calculator', color: 'red' },
    { name: 'Reasoning', icon: 'fa-brain', color: 'violet' },
    { name: 'Passages', icon: 'fa-book-open', color: 'teal' }
];

// Filename Mapping (Must match your data/ folder)
// Note: We do NOT hardcode topics here anymore. core.js scans them dynamically.
const filenameMap = {
    'Indian Polity': 'polity',
    'Modern India': 'modern_history',
    'Ancient India': 'ancient_history',
    'Medieval India': 'medieval_history',
    'Art & Culture': 'art_culture',
    'World Geography': 'world_geo',
    'Indian Geography': 'indian_geo',
    'Environment': 'environment',
    'Indian Economy': 'economy',
    'Science & Tech': 'science_tech',
    'Intl. Relations': 'ir',
    'Miscellaneous': 'misc',
    'Mathematics': 'csat_math',
    'Reasoning': 'csat_reasoning',
    'Passages': 'csat_passage'
};

