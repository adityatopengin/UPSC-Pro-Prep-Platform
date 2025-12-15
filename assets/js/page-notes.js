function openNoteModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
}

function closeNoteModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
}

// Close modal if clicking on the dark blurred background
document.addEventListener('click', (e) => {
    // The backdrop div has the 'fixed' class in your HTML
    if (e.target.classList.contains('fixed')) {
        e.target.classList.add('hidden');
    }
});
