  // State
        const state = {
            men: 0,
            women: 0,
            children: 0,
            profile: 'standard' // 'standard' or 'big'
        };

        // Consumption Rules (g/ml per person)
        const RULES = {
            standard: {
                meat: { man: 500, woman: 400, child: 250 },
                beer: { man: 1500, woman: 1000, child: 0 },
                soda: { man: 300, woman: 400, child: 600 },
                water: { man: 200, woman: 200, child: 200 },
            },
            big: {
                meat: { man: 650, woman: 500, child: 300 },
                beer: { man: 2000, woman: 1200, child: 0 },
                soda: { man: 400, woman: 500, child: 700 },
                water: { man: 250, woman: 250, child: 250 },
            }
        };

        // DOM Elements cache
        const els = {
            btnStandard: document.getElementById('btn-standard'),
            btnBig: document.getElementById('btn-big'),
            counts: {
                men: document.getElementById('count-men'),
                women: document.getElementById('count-women'),
                children: document.getElementById('count-children')
            },
            emptyState: document.getElementById('empty-state'),
            resultCard: document.getElementById('result-card'),
            vals: {
                beef: document.getElementById('val-beef'),
                chicken: document.getElementById('val-chicken'),
                sausage: document.getElementById('val-sausage'),
                totalMeat: document.getElementById('total-meat'),
                beer: document.getElementById('val-beer'),
                soda: document.getElementById('val-soda'),
                water: document.getElementById('val-water'),
                charcoal: document.getElementById('val-charcoal'),
                ice: document.getElementById('val-ice'),
            }
        };

        // Functions
        function setProfile(type) {
            state.profile = type;
            
            // Toggle UI classes
            if (type === 'standard') {
                els.btnStandard.classList.add('bg-brand-charcoal', 'text-white', 'shadow-md');
                els.btnStandard.classList.remove('text-stone-500', 'hover:bg-stone-50');
                
                els.btnBig.classList.remove('bg-brand-orange', 'text-white', 'shadow-md');
                els.btnBig.classList.add('text-stone-500', 'hover:bg-stone-50');
            } else {
                els.btnStandard.classList.remove('bg-brand-charcoal', 'text-white', 'shadow-md');
                els.btnStandard.classList.add('text-stone-500', 'hover:bg-stone-50');
                
                els.btnBig.classList.add('bg-brand-orange', 'text-white', 'shadow-md');
                els.btnBig.classList.remove('text-stone-500', 'hover:bg-stone-50');
            }

            calculate();
        }

        function updateCount(type, change) {
            const newValue = state[type] + change;
            if (newValue >= 0) {
                state[type] = newValue;
                els.counts[type].innerText = newValue;
                calculate();
            }
        }

        function calculate() {
            const totalPeople = state.men + state.women + state.children;

            // Visibility
            if (totalPeople > 0) {
                els.emptyState.classList.add('hidden');
                els.resultCard.classList.remove('hidden');
            } else {
                els.emptyState.classList.remove('hidden');
                els.resultCard.classList.add('hidden');
                return;
            }

            const r = RULES[state.profile];

            // 1. Meat Calculation (grams)
            const totalMeatGrams = 
                (state.men * r.meat.man) +
                (state.women * r.meat.woman) +
                (state.children * r.meat.child);
            
            // Ratios: 50% Beef, 25% Chicken, 25% Sausage
            const beefKg = (totalMeatGrams * 0.5) / 1000;
            const chickenKg = (totalMeatGrams * 0.25) / 1000;
            const sausageKg = (totalMeatGrams * 0.25) / 1000;
            const totalMeatKg = totalMeatGrams / 1000;

            // 2. Drinks (ml -> Liters)
            const beerL = ((state.men * r.beer.man) + (state.women * r.beer.woman)) / 1000;
            const sodaL = ((state.men * r.soda.man) + (state.women * r.soda.woman) + (state.children * r.soda.child)) / 1000;
            const waterL = ((state.men * r.water.man) + (state.women * r.water.woman) + (state.children * r.water.child)) / 1000;

            // 3. Extras
            // Charcoal: 1kg per 1kg meat (simplified)
            let charcoalKg = Math.ceil(totalMeatKg * 1.0);
            if (charcoalKg < 3) charcoalKg = 3; // Minimum bag size

            // Ice: 5kg per 10 people
            let iceKg = Math.ceil(totalPeople / 10) * 5;
            if (iceKg < 5) iceKg = 5;

            // Render
            els.vals.beef.innerText = beefKg.toFixed(1).replace('.', ',') + 'kg';
            els.vals.chicken.innerText = chickenKg.toFixed(1).replace('.', ',') + 'kg';
            els.vals.sausage.innerText = sausageKg.toFixed(1).replace('.', ',') + 'kg';
            els.vals.totalMeat.innerText = totalMeatKg.toFixed(1).replace('.', ',');

            els.vals.beer.innerText = Math.ceil(beerL) + 'L';
            els.vals.soda.innerText = Math.ceil(sodaL) + 'L';
            els.vals.water.innerText = Math.ceil(waterL) + 'L';

            els.vals.charcoal.innerText = charcoalKg + 'kg';
            els.vals.ice.innerText = iceKg + 'kg';

            // Store current result for sharing
            state.lastResult = {
                beef: beefKg.toFixed(1).replace('.', ','),
                chicken: chickenKg.toFixed(1).replace('.', ','),
                sausage: sausageKg.toFixed(1).replace('.', ','),
                total: totalMeatKg.toFixed(1).replace('.', ','),
                beer: Math.ceil(beerL),
                soda: Math.ceil(sodaL),
                water: Math.ceil(waterL),
                charcoal: charcoalKg,
                ice: iceKg
            };
        }

        function shareWhatsApp() {
            if (!state.lastResult) return;
            const res = state.lastResult;
            const url = window.location.href;

            const text = `🔥 *Planejamento ChurrascoMaster* 🔥

👥 *Convidados:*
👨 ${state.men} Homens
👩 ${state.women} Mulheres
👶 ${state.children} Crianças

🥩 *Carnes (${res.total}kg total):*
- Picanha/Boi: ${res.beef}kg
- Frango: ${res.chicken}kg
- Linguiça: ${res.sausage}kg

🍺 *Bebidas:*
- Cerveja: ${res.beer}L
- Refri: ${res.soda}L
- Água: ${res.water}L

🧱 *Extras:*
- Carvão: ${res.charcoal}kg
- Gelo: ${res.ice}kg

Calcule o seu também em: ${url}`;

            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        }

        // Initialize
        calculate();

        // PWA Registration
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(registration => {
                        console.log('SW registrado com sucesso:', registration.scope);
                    })
                    .catch(error => {
                        console.log('Falha ao registrar SW:', error);
                    });
            });
        }