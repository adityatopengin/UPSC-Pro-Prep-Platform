/**
 * page-notes.js
 * Handles Modal Logic for the Resources Page
 */

// 1. OPEN MODAL
window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Lock background scroll
    } else {
        console.error("Error: Modal ID not found ->", modalId);
    }
}

// 2. CLOSE MODAL
window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = ''; // Unlock background scroll
    }
}

// 3. CLOSE ON BACKGROUND CLICK
document.addEventListener('DOMContentLoaded', () => {
    // Select all elements whose ID starts with "modal-"
    const modals = document.querySelectorAll('[id^="modal-"]'); 
    
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            // If the user clicks the dark background (and not the white box)
            if (e.target === modal) {
                modal.classList.add('hidden');
                document.body.style.overflow = '';
            }
        });
    });
});

