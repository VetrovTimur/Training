/* ============================================================
   SHOULDERS — логика страницы «Плечи + Трапеция»
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

    /* ---------- 1. Reveal-хореография ---------- */
    const page      = document.querySelector('.page');
    const title     = document.querySelector('.page__title');
    const header    = document.querySelector('.header');

    const bodyItems = document.querySelectorAll('.card, .divider, .progress, .notes');
    const footer    = document.querySelector('.footer');

    const T = {
        page:      0,
        title:     200,
        header:    400,
        body:      650,
        bodyStep:  150,
        footerGap: 350,
        fontShift: 1600,
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


    /* ---------- 2. Инфраструктура шагов ---------- */
    const steps = Array.from(document.querySelectorAll('[data-step]'))
        .sort((a, b) => +a.dataset.step - +b.dataset.step);

    const TOTAL_STEPS = steps.length;

    const progressFill    = document.getElementById('progress-fill');
    const progressCounter = document.getElementById('progress-counter');
    const results         = document.getElementById('results');
    const resultsBody     = document.getElementById('results-body');
    const resetBtn        = document.getElementById('reset-btn');

    const state = {
        currentStep: 0,
        results: [],
    };

    /* ---------- 3. Блокировка / активация ---------- */
    function updateSteps() {
        steps.forEach((el, i) => {
            const active = i === state.currentStep;
            const passed = i < state.currentStep;

            el.classList.toggle('is-active', active);
            el.classList.toggle('is-passed', passed);
            el.classList.toggle('is-locked', !active && !passed);

            if (el.classList.contains('exercise')) {
                el.disabled = !active;
            } else if (el.classList.contains('divider')) {
                el.setAttribute('aria-disabled', String(!active));
            }
        });

        updateProgress();
    }

    function updateProgress() {
        const done = state.currentStep;
        const pct  = TOTAL_STEPS ? (done / TOTAL_STEPS) * 100 : 0;

        progressFill.style.width = pct + '%';
        progressCounter.textContent = `${done} / ${TOTAL_STEPS}`;

        if (state.currentStep >= TOTAL_STEPS && !results.classList.contains('is-shown')) {
            renderResults();
            at(0, () => results.classList.add('is-shown'));
        }
    }

    function nextStep() {
        state.currentStep++;
        updateSteps();
    }

    /* ---------- 4. Межблочные таймеры ---------- */
    function setupDivider(divider) {
        let intervalId = null;

        const start = () => {
            if (!divider.classList.contains('is-active')) return;
            if (divider.classList.contains('is-running')) return;
            if (divider.classList.contains('is-passed')) return;

            const total = parseInt(divider.dataset.rest, 10);
            if (Number.isNaN(total) || total <= 0) {
                finish();
                return;
            }

            let remaining = total;
            const timeEl = divider.querySelector('.divider__time');
            if (timeEl) timeEl.textContent = remaining;

            divider.classList.add('is-running');

            intervalId = setInterval(() => {
                remaining--;
                if (timeEl) timeEl.textContent = Math.max(remaining, 0);
                if (remaining <= 0) {
                    clearInterval(intervalId);
                    intervalId = null;
                    finish();
                }
            }, 1000);
        };

        const finish = () => {
            if (intervalId) { clearInterval(intervalId); intervalId = null; }
            divider.classList.remove('is-running');
            nextStep();
        };

        divider.addEventListener('click', start);
        divider.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                start();
            }
        });
    }

    document.querySelectorAll('.divider[data-rest]').forEach(setupDivider);

    /* ---------- 5. Модальное окно упражнения ---------- */
    const modal     = document.getElementById('modal');
    const dialog    = modal.querySelector('.modal__dialog');
    const mName     = document.getElementById('modal-name');

    const screens = modal.querySelectorAll('.modal__screen');

    const showScreen = name => {
        screens.forEach(s => s.classList.toggle('is-active', s.dataset.screen === name));
        dialog.dataset.activeScreen = name;
    };

    const mSets   = document.getElementById('m-sets');
    const mRest   = document.getElementById('m-rest');
    const mStart  = document.getElementById('m-start');

    const mWorkSet   = document.getElementById('m-work-set');
    const mWorkTotal = document.getElementById('m-work-total');
    const mWorkTimer = document.getElementById('m-work-timer');
    const mWorkDots  = document.getElementById('m-work-dots');
    const mFinish    = document.getElementById('m-finish');

    const mInputSet   = document.getElementById('m-input-set');
    const mInputTotal = document.getElementById('m-input-total');
    const mReps       = document.getElementById('m-reps');
    const mWeight     = document.getElementById('m-weight');
    const mWarmup     = document.getElementById('m-warmup');
    const mSave       = document.getElementById('m-save');

    const mRestSet   = document.getElementById('m-rest-set');
    const mRestTimer = document.getElementById('m-rest-timer');
    const mRestDots  = document.getElementById('m-rest-dots');
    const mSkip      = document.getElementById('m-skip');

    const closeTriggers = modal.querySelectorAll('[data-modal-close]');

    const mState = {
        exercise: null,
        name: '',
        totalSets: 4,
        restSec: 90,
        currentSet: 0,
        sets: [],
        workStart: 0,
        workIntervalId: null,
        restIntervalId: null,
    };

    /* Stepper-кнопки (+/−) */
    document.querySelectorAll('.stepper__btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById(btn.dataset.target);
            if (!input) return;

            const delta = parseFloat(btn.dataset.delta);
            const step  = parseFloat(input.step) || 1;
            const min   = input.min !== '' ? parseFloat(input.min) : -Infinity;
            const max   = input.max !== '' ? parseFloat(input.max) : Infinity;

            let value = parseFloat(input.value);
            if (Number.isNaN(value)) value = 0;

            let next = value + delta;
            next = Math.min(max, Math.max(min, next));
            next = Math.round(next / step) * step;
            next = Math.round(next * 100) / 100;

            input.value = next;
        });
    });

    function openModal(exercise) {
        mState.exercise   = exercise;
        mState.name       = exercise.dataset.name;
        mState.totalSets  = Math.max(1, parseInt(exercise.dataset.sets, 10) || 4);
        mState.restSec    = Math.max(0, parseInt(exercise.dataset.rest, 10) || 90);
        mState.currentSet = 0;
        mState.sets       = [];
        mState.workStart  = 0;
        mState.workIntervalId = null;
        mState.restIntervalId = null;

        const card = exercise.closest('.card');
        if (card) {
            const accentRgb = getComputedStyle(card).getPropertyValue('--card-accent-rgb').trim();
            if (accentRgb) dialog.style.setProperty('--modal-accent-rgb', accentRgb);
        }

        mName.textContent = mState.name;
        mSets.value       = mState.totalSets;
        mRest.value       = mState.restSec;

        showScreen('setup');
        modal.hidden = false;
        document.body.classList.add('modal-open');
    }

    function closeModal() {
        if (mState.workIntervalId) { clearInterval(mState.workIntervalId); mState.workIntervalId = null; }
        if (mState.restIntervalId) { clearInterval(mState.restIntervalId); mState.restIntervalId = null; }

        modal.hidden = true;
        document.body.classList.remove('modal-open');
        mState.exercise = null;
    }

    closeTriggers.forEach(el => el.addEventListener('click', closeModal));

    /* ---------- 6. Логика экранов модалки ---------- */

    mStart.addEventListener('click', () => {
        const sets = Math.max(1, Math.min(20, parseInt(mSets.value, 10) || 1));
        const rest = Math.max(0, Math.min(600, parseInt(mRest.value, 10) || 0));

        mState.totalSets  = sets;
        mState.restSec    = rest;
        mState.currentSet = 0;
        mState.sets       = [];

        enterWorkScreen();
    });

    function enterWorkScreen() {
        mWorkSet.textContent   = mState.currentSet + 1;
        mWorkTotal.textContent = mState.totalSets;

        renderDots(mWorkDots, mState.totalSets, mState.currentSet);

        mWorkTimer.textContent = '0:00';
        mState.workStart = Date.now();

        showScreen('work');

        if (mState.workIntervalId) clearInterval(mState.workIntervalId);
        mState.workIntervalId = setInterval(() => {
            const elapsed = Math.floor((Date.now() - mState.workStart) / 1000);
            mWorkTimer.textContent = formatTime(elapsed);
        }, 250);
    }

    mFinish.addEventListener('click', () => {
        if (mState.workIntervalId) { clearInterval(mState.workIntervalId); mState.workIntervalId = null; }

        mInputSet.textContent   = mState.currentSet + 1;
        mInputTotal.textContent = mState.totalSets;

        mReps.value     = mReps.value   || 10;
        mWeight.value   = mWeight.value || 20;
        mWarmup.checked = false;

        showScreen('input');
    });

    mSave.addEventListener('click', () => {
        const reps   = Math.max(0, Math.min(200, parseInt(mReps.value, 10) || 0));
        const weight = Math.max(0, Math.min(500, parseFloat(mWeight.value) || 0));
        const warmup = mWarmup.checked;

        mState.sets.push({ reps, weight, warmup });

        if (mState.currentSet >= mState.totalSets - 1) {
            completeExercise();
            return;
        }

        enterRestScreen(warmup);
    });

    function enterRestScreen(warmup) {
        const restSec = warmup ? 60 : mState.restSec;

        mRestSet.textContent   = mState.currentSet + 1;
        mRestTimer.textContent = formatTime(restSec);

        renderDots(mRestDots, mState.totalSets, mState.currentSet + 1);

        showScreen('rest');

        if (restSec <= 0) {
            advanceToNextSet();
            return;
        }

        let remaining = restSec;
        if (mState.restIntervalId) clearInterval(mState.restIntervalId);
        mState.restIntervalId = setInterval(() => {
            remaining--;
            mRestTimer.textContent = formatTime(Math.max(remaining, 0));
            if (remaining <= 0) {
                clearInterval(mState.restIntervalId);
                mState.restIntervalId = null;
                advanceToNextSet();
            }
        }, 1000);
    }

    function advanceToNextSet() {
        if (mState.restIntervalId) { clearInterval(mState.restIntervalId); mState.restIntervalId = null; }
        mState.currentSet++;
        enterWorkScreen();
    }

    mSkip.addEventListener('click', advanceToNextSet);

    /* ---------- 7. Завершение упражнения ---------- */
    function completeExercise() {
        const exerciseName = mState.name;
        mState.sets.forEach((s, i) => {
            state.results.push({
                exercise: exerciseName,
                set: i + 1,
                reps: s.reps,
                weight: s.weight,
                warmup: s.warmup,
            });
        });

        const el = mState.exercise;
        closeModal();

        if (el) {
            el.classList.remove('is-active');
            el.classList.add('is-passed');
            el.disabled = true;
        }

        nextStep();
    }

    /* ---------- 8. Обработчики упражнений ---------- */
    document.querySelectorAll('.exercise').forEach(ex => {
        ex.addEventListener('click', () => {
            if (!ex.classList.contains('is-active')) return;
            openModal(ex);
        });
    });

    /* ---------- 9. Dots ---------- */
    function renderDots(container, total, current) {
        container.innerHTML = '';
        for (let i = 0; i < total; i++) {
            const dot = document.createElement('span');
            dot.className = 'modal__dot';
            if (i < current) {
                dot.classList.add('is-passed');
            } else if (i === current) {
                dot.classList.add('is-current');
            }
            container.appendChild(dot);
        }
    }

    /* ---------- 10. Форматирование времени ---------- */
    function formatTime(totalSec) {
        const s = Math.max(0, totalSec | 0);
        const m = Math.floor(s / 60);
        const r = s % 60;
        return `${m}:${String(r).padStart(2, '0')}`;
    }

    /* ---------- 11. Результаты ---------- */
    function renderResults() {
        if (!state.results.length) {
            resultsBody.innerHTML = `<tr><td class="results__empty" colspan="5">Пока пусто.</td></tr>`;
            return;
        }

        const groups = [];
        state.results.forEach(r => {
            const last = groups[groups.length - 1];
            if (last && last.name === r.exercise) {
                last.rows.push(r);
            } else {
                groups.push({ name: r.exercise, rows: [r] });
            }
        });

        const html = groups.map(g => {
            const span = g.rows.length;
            return g.rows.map((r, i) => {
                const cells = [];

                if (i === 0) {
                    cells.push(
                        `<td class="results__name" rowspan="${span}">${escapeHtml(g.name)}</td>`
                    );
                }

                cells.push(`<td>${r.set}</td>`);
                cells.push(`<td>${r.reps}</td>`);
                cells.push(`<td>${r.weight}</td>`);
                cells.push(`<td>${r.warmup ? '<span class="is-warmup-tag">разминка</span>' : ''}</td>`);

                let cls = '';
                if (i === 0)                 cls = 'results__group-start';
                if (i === g.rows.length - 1) cls = cls ? 'results__group-start results__group-end' : 'results__group-end';

                return `<tr class="${cls}">${cells.join('')}</tr>`;
            }).join('');
        }).join('');

        resultsBody.innerHTML = html;
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /* ---------- 12. Сброс ---------- */
    resetBtn.addEventListener('click', () => {
        if (mState.workIntervalId) { clearInterval(mState.workIntervalId); mState.workIntervalId = null; }
        if (mState.restIntervalId) { clearInterval(mState.restIntervalId); mState.restIntervalId = null; }

        if (!modal.hidden) closeModal();

        state.currentStep = 0;
        state.results = [];

        steps.forEach(el => {
            el.classList.remove('is-active', 'is-passed', 'is-locked', 'is-running');

            if (el.classList.contains('exercise')) {
                el.disabled = true;
            } else if (el.classList.contains('divider')) {
                el.setAttribute('aria-disabled', 'true');

                const t = el.querySelector('.divider__time');
                const total = parseInt(el.dataset.rest, 10);
                if (t && !Number.isNaN(total)) t.textContent = total;
            }
        });

        results.classList.remove('is-shown');
        resultsBody.innerHTML = '';

        updateSteps();
        renderResults();

        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* ---------- 13. Инициализация ---------- */
    updateSteps();
    renderResults();
});