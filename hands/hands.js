/* ============================================================
   HANDS — Логика страницы «Бицепс + Трицепс + Запястья»
   ------------------------------------------------------------
   1. Reveal-хореография (порядок появления блоков)
   2. Смена шрифта заголовка после shrink-анимации
   3. Таймер отдыха на .divider[data-rest]
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

    /* ---------- 1. Reveal-хореография ---------- */
    const page      = document.querySelector('.page');
    const title     = document.querySelector('.page__title');
    const header    = document.querySelector('.header');
    const bodyItems = document.querySelectorAll('.card, .divider, .notes');
    const footer    = document.querySelector('.footer');

    const T = {
        page:      0,     // контейнер .page
        title:     200,   // заголовок
        header:    400,   // шапка
        body:      650,   // первый body-элемент
        bodyStep:  150,   // шаг между body-элементами
        footerGap: 350,   // пауза после последнего body до footer
        fontShift: 1600,  // задержка смены шрифта (после textShrink)
    };

    const at = (ms, fn) => setTimeout(fn, ms);

    at(T.page,   () => page.classList.add('is-ready'));
    at(T.title,  () => title.classList.add('is-shown'));
    at(T.header, () => header.classList.add('is-shown'));

    at(T.title + T.fontShift, () => title.classList.add('is-font-changed'));

    bodyItems.forEach((el, i) => {
        at(T.body + i * T.bodyStep, () => el.classList.add('is-shown'));
    });

    const lastBody = T.body + (bodyItems.length - 1) * T.bodyStep;
    at(lastBody + T.footerGap, () => footer.classList.add('is-shown'));


    /* ---------- 2. Таймер отдыха ---------- */
    const dividers = document.querySelectorAll('.divider[data-rest]');

    // Звук завершения (тот же, что был) — грузим лениво, один раз
    let dingAudio;
    const playDing = () => {
        try {
            dingAudio = dingAudio || new Audio(
                'data:audio/wav;base64,UklGRnoAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoAAACBhYqFhYV2Y2RiYF9eXVpbWVhYWFlaW15iZm1zd3uAg4SFhYSBgX56d3RybmpoZmVkZGVmZ2lrbG5vcHFyc3R1d3h5ent8fX1+fn9/gH+Af4B/f39+fn18e3p5eHd2dXJwbG1tAA=='
            );
            dingAudio.play().catch(() => {});
        } catch (_) {}
    };

    dividers.forEach(divider => {
        const start = () => {
            if (
                divider.classList.contains('is-running') ||
                divider.classList.contains('is-done')
            ) return;

            const total = parseInt(divider.dataset.rest, 10);
            if (Number.isNaN(total) || total <= 0) return;

            let remaining = total;
            const timeEl = divider.querySelector('.divider__time');

            divider.classList.add('is-running');

            const tick = setInterval(() => {
                remaining -= 1;
                if (timeEl) timeEl.textContent = remaining;

                if (remaining <= 0) {
                    clearInterval(tick);
                    divider.classList.remove('is-running');
                    divider.classList.add('is-done');
                    playDing();
                }
            }, 1000);
        };

        divider.addEventListener('click', start);
        divider.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                start();
            }
        });
    });
});