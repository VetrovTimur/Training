document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.card');
    const wrapper = document.querySelector('.portal__cards-wrapper');
    const footer = document.querySelector('.portal__footer');

    // Показываем карточки с задержкой
    cards.forEach((card, index) => {
        const delay = parseInt(card.dataset.delay) || index * 300;
        setTimeout(() => {
            card.classList.add('card--visible');
        }, 1200 + delay);
    });

    // Расширяем wrapper
    setTimeout(() => {
        wrapper.classList.add('portal__cards-wrapper--expanded');
    }, 1400);

    // Показываем footer
    setTimeout(() => {
        footer.classList.remove('portal__footer--hidden');
        footer.classList.add('portal__footer--visible');
    }, 1400);
});