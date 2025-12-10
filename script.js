// Modal Elements
const modal = document.getElementById('gameModal');
const iframe = document.getElementById('gameFrame');
const closeBtn = document.querySelector('.close');

// Open modal on card click
document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', () => {
        const url = card.getAttribute('data-url');
        iframe.src = url;
        modal.style.display = 'block';
    });
});

// Close modal with button
closeBtn.addEventListener('click', () => {
    iframe.src = '';
    modal.style.display = 'none';
});

// Close modal clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        iframe.src = '';
        modal.style.display = 'none';
    }
});
