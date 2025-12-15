/**
 * subjects.js
 * Defines the list of subjects for GS1 and CSAT
 */

const subjectsGS1 = [
    { name: "Ancient History", id: "ancient" },
    { name: "Medieval History", id: "medieval" },
    { name: "Modern History", id: "modern" },
    { name: "Art & Culture", id: "art_culture" },
    { name: "Indian Polity", id: "polity" },
    { name: "Indian Geography", id: "indian_geo" },
    { name: "World Geography", id: "world_geo" },
    { name: "Environment", id: "environment" },
    { name: "Indian Economy", id: "economy" },
    { name: "Science & Tech", id: "science_tech" },
    { name: "Intl. Relations", id: "ir" }
];

const subjectsCSAT = [
    { name: "Mathematics", id: "csat_math" },
    { name: "Reasoning", id: "csat_reasoning" },
    { name: "Reading Passage", id: "csat_passage" }
];

// Mapping readable names to filenames
const filenameMap = {
    "Ancient History": "ancient_history",
    "Medieval History": "medieval_history",
    "Modern History": "modern_history",
    "Art & Culture": "art_culture",
    "Indian Polity": "polity",
    "Indian Geography": "indian_geo",
    "World Geography": "world_geo",
    "Environment": "environment",
    "Indian Economy": "economy",
    "Science & Tech": "science_tech",
    "Intl. Relations": "ir",
    "Mathematics": "csat_math",
    "Reasoning": "csat_reasoning",
    "Reading Passage": "csat_passage"
};

