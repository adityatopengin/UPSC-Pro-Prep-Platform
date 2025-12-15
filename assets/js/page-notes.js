/**
 * page-notes.js
 * Handles Modal Logic for the Resources Page
 */

// Explicitly attach functions to window so HTML onclick="" can find them
window.openNoteModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        // Optional: Prevent background scrolling when modal is open
        document.body.style.overflow = 'hidden';
    } else {
        console.error("Modal not found:", modalId);
    }
}

window.closeNoteModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        // Restore background scrolling
        document.body.style.overflow = '';
    }
}

// Close modal if clicking outside the white card (on the blurred background)
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.fixed').forEach(modal => {
        modal.addEventListener('click', (e) => {
            // If the click is on the background (id: modal-psir), close it.
            // If the click is inside the white box, do nothing.
            if (e.target === modal) {
                modal.classList.add('hidden');
                document.body.style.overflow = '';
            }
        });
    });
});

