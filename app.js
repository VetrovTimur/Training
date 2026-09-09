document.addEventListener('DOMContentLoaded', function() {
    const items = document.querySelectorAll('.fade-item');
    
    items.forEach((item, index) => {
        let delay;
        if (index === 0) delay = 0;
        else if (index === 1) delay = 1600;
        else delay = 1600 + (index - 1) * 300;
        
        setTimeout(() => {
            item.classList.add('visible');
        }, delay);
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const title = document.querySelector('.page__title');
    setTimeout(() => {
        title.classList.add('font-changed');
    }, 1600);
});

// ============================================
// ТАЙМЕР ДЛЯ РАЗДЕЛИТЕЛЕЙ (исправленный)
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const dividers = document.querySelectorAll('.divider[data-rest]');
    
    dividers.forEach(divider => {
        divider.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Если таймер уже запущен или завершён — игнорируем
            if (this.classList.contains('running') || this.classList.contains('done')) return;
            
            const totalSeconds = parseInt(this.dataset.rest);
            let remaining = totalSeconds;
            
            const timeElement = this.querySelector('.divider__time');
            const labelElement = this.querySelector('.divider__label');
            const secondsElement = this.querySelector('.divider__seconds');
            const subElement = this.querySelector('.divider__sub');
            
            // Запускаем таймер
            this.classList.add('running');
            this.style.cursor = 'default';
            
            const timerInterval = setInterval(() => {
                remaining--;
                if (timeElement) {
                    timeElement.textContent = remaining;
                }
                
                // Если таймер закончился
                if (remaining <= 0) {
                    clearInterval(timerInterval);
                    
                    // Меняем состояние на "завершён"
                    this.classList.remove('running');
                    this.classList.add('done');
                    this.style.cursor = 'pointer';
                    
                    // Принудительно применяем стили (на случай, если CSS не сработал)
                    if (labelElement) {
                        labelElement.style.fontSize = '22px';
                        labelElement.style.textDecoration = 'line-through';
                        labelElement.style.color = '#8a9bb0';
                        labelElement.style.display = 'inline';
                    }
                    if (timeElement) {
                        timeElement.style.display = 'none';
                    }
                    if (secondsElement) {
                        secondsElement.style.display = 'none';
                    }
                    if (subElement) {
                        subElement.style.fontSize = '22px';
                        subElement.style.color = '#E30102';
                        subElement.style.fontWeight = '600';
                        subElement.style.display = 'block';
                        subElement.style.marginTop = '4px';
                    }
                    this.style.borderColor = '#4a4a4a';
                    this.style.opacity = '1';
                    
                    // Звук
                    try {
                        const audio = new Audio('data:audio/wav;base64,UklGRnoAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoAAACBhYqFhYV2Y2RiYF9eXVpbWVhYWFlaW15iZm1zd3uAg4SFhYSBgX56d3RybmpoZmVkZGVmZ2lrbG5vcHFyc3R1d3h5ent8fX1+fn9/gH+Af4B/f39+fn18e3p5eHd2dXJwbG1tAA==');
                        audio.play().catch(() => {});
                    } catch(e) {}
                }
            }, 1000);
        });
    });
});