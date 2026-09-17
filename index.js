 const portal = document.querySelector('.portal');
            const portalSubtitle = document.querySelector('.portal__subtitle');
            const portalCards = document.querySelector('.portal__cards');
            const cards = document.querySelectorAll('.card');
            const portalFooter = document.querySelector('.portal__footer');

            const T = { portal: 0, portalSubtitle: 1000, portalCards: 1500, cardStep: 200, cardStart: 1500, portalFooter: 500};

            const at = (ms, fn) => setTimeout(fn, ms);

            at(T.portal, () => portal.classList.add('ready'));

            at(T.portalSubtitle, () => portalSubtitle.classList.add('shown'));

            at(T.portalCards, () => portalCards.classList.add('shown'));
            
            cards.forEach((card, i) => {
                at(T.cardStart + i * T.cardStep, () => card.classList.add('shown'));
            });

            const lastCardStart = T.cardStart + (cards.length - 1) * T.cardStep;
            at(lastCardStart + T.portalFooter, () => portalFooter.classList.add('shown'));