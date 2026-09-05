document.addEventListener('DOMContentLoaded', function() {
    const items = document.querySelectorAll('.fade-item');
    
    items.forEach((item, index) => {
        let delay;
        
        if (index === 0) {
            delay = 0;
        } else if (index === 1) {
            delay = 1600;
        } else {
            delay = 1600 + (index - 1) * 300;
        }
        
        setTimeout(() => {
            item.classList.add('visible');
        }, delay);
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const title = document.querySelector('.page__title');
    
    // Меняем шрифт через 1.6 секунд (после завершения анимации)
    setTimeout(() => {
        title.classList.add('font-changed');
    }, 1600);
});