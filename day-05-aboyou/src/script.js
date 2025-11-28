// --- app.js (Lógica Compartilhada) ---

// 1. SETTINGS, THEME & LANG
function openSettings() {

    // document.getElementById('settings-modal').classList.remove('hidden');
    // document.getElementById('settings-modal').classList.add('flex');
    // document.getElementById('settings-name-input').value = localStorage.getItem('aboyou_username') || '';
    // document.getElementById('theme-toggle').checked = document.documentElement.classList.contains('dark');
     

    // 1. Prepara os dados do formulário
    const nameInput = document.getElementById('settings-name-input');
    const themeToggle = document.getElementById('theme-toggle');
    // const langBtn = document.querySelector(`.lang-btn[data-lang="${currentLang}"]`);
    // setLanguage(currentLang);
    
    if (nameInput) nameInput.value = localStorage.getItem('aboyou_username') || '';
    if (themeToggle) themeToggle.checked = document.documentElement.classList.contains('dark');
    
    // Atualiza botões de idioma visualmente (caso o lang.js tenha resetado)
    if (typeof setLanguage === 'function') setLanguage(currentLang);

    // 2. Abre usando a função genérica (que lida com animação e swipe)
    openModal('settings-modal');
}

function closeSettings() { 

    closeModal('settings-modal');
    //document.getElementById('settings-modal').classList.add('hidden'); document.getElementById('settings-modal').classList.remove('flex'); 

}
function saveName() { localStorage.setItem('aboyou_username', document.getElementById('settings-name-input').value.trim()); document.getElementById('user-name-display').innerText = document.getElementById('settings-name-input').value; }

function toggleTheme() {
    const html = document.documentElement; html.classList.toggle('dark');
    localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
}
// Init Theme (Executa ao carregar)
if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) { document.documentElement.classList.add('dark'); }


// --- MODAIS & SWIPE (CORRIGIDO V3 - FLUIDO) ---

function openModal(id) {
    const overlay = document.getElementById(id);
    const content = overlay.querySelector('.modal-content');
    const isDesktop = window.innerWidth >= 1024;

    // Garante que o elemento está limpo de estilos inline antigos
    content.style.transform = '';
    content.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'; // Transição suave padrão
    
    overlay.classList.remove('hidden');
    
    // Pequeno delay para garantir que o display:flex foi renderizado
    setTimeout(() => {
        overlay.classList.add('flex');
        
        requestAnimationFrame(() => {
            if (isDesktop) {
                content.classList.remove('opacity-0', 'scale-95');
                content.classList.add('opacity-100', 'scale-100');
            } else {
                content.classList.remove('translate-y-full');
                content.classList.add('translate-y-0');
                // Só ativa swipe se for mobile
                enableSwipeDismiss(id);
            }
        });
    }, 10);
}

function closeModal(id) {
    const overlay = document.getElementById(id);
    const content = overlay.querySelector('.modal-content');
    const isDesktop = window.innerWidth >= 1024;

    // Reseta transição para garantir animação de saída
    content.style.transition = 'all 0.3s ease-in';

    if (isDesktop) {
        content.classList.remove('opacity-100', 'scale-100');
        content.classList.add('opacity-0', 'scale-95');
    } else {
        // No mobile, removemos o estilo inline para a classe CSS assumir
        content.style.transform = ''; 
        content.classList.remove('translate-y-0');
        content.classList.add('translate-y-full');
    }

    setTimeout(() => {
        overlay.classList.remove('flex');
        overlay.classList.add('hidden');
    }, 300); // Espera animação acabar
}

function handleBackdropClick(e, id) {
    if (e.target.id === id) closeModal(id);
}

// LÓGICA DE SWIPE REFINADA
function enableSwipeDismiss(modalId) {
    const modal = document.getElementById(modalId);
    const content = modal.querySelector('.modal-content');
    const handle = modal.querySelector('.swipe-handle');
    
    // Evita múltiplos listeners
    if(!handle || handle.dataset.listening) return; 
    handle.dataset.listening = "true";

    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    const onTouchStart = (e) => {
        startY = e.touches[0].clientY;
        isDragging = true;
        content.style.transition = 'none'; // Remove transição para arrastar em tempo real (zero delay)
    };

    const onTouchMove = (e) => {
        if (!isDragging) return;
        currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;
        
        // Só permite arrastar para baixo e com resistência elástica se tentar subir
        if (deltaY > 0) {
            content.style.transform = `translateY(${deltaY}px)`;
        }
    };

    const onTouchEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        
        const deltaY = currentY - startY;
        
        // Restaura a transição suave para o "snap" final
        content.style.transition = 'transform 0.3s ease-out';
        
        if (deltaY > 120) { // Se arrastou mais de 120px
            // 1. Completa o movimento visualmente via JS (evita o glitch de troca de classe)
            content.style.transform = `translateY(100vh)`; // Joga lá pra baixo da tela
            
            // 2. Espera a animação acabar para esconder e resetar classes
            setTimeout(() => {
                const overlay = document.getElementById(modalId);
                overlay.classList.remove('flex');
                overlay.classList.add('hidden');
                
                // Reseta estado para a próxima abertura
                content.style.transform = ''; 
                content.classList.add('translate-y-full');
                content.classList.remove('translate-y-0');
            }, 300);
            
        } else {
            // Se soltou antes, volta para o topo (Bounce back)
            content.style.transform = ''; // Remove inline, volta para a classe translate-y-0
        }
    };

    handle.addEventListener('touchstart', onTouchStart, { passive: true });
    modal.addEventListener('touchmove', onTouchMove, { passive: true });
    modal.addEventListener('touchend', onTouchEnd);
}


// --- LÓGICA DE INSIGHTS DA HOME (COM CORES DINÂMICAS) ---

function updateHomeInsight() {
    const logs = JSON.parse(localStorage.getItem('aboyou_logs') || '[]');
    const titleEl = document.getElementById('home-insight-text');
    const subEl = document.getElementById('home-insight-sub');
    const cardEl = document.getElementById('home-insight-card'); // O Card Fundo
    
    if (!titleEl || !cardEl) return;

    // 1. Definição das Cores por Humor (Tailwind Gradients)
    const moodGradients = {
        'Feliz': 'from-yellow-400 to-orange-500',      // Solar/Energia
        'Calmo': 'from-sky-400 to-emerald-400',        // Água/Natureza
        'Cansado': 'from-indigo-400 to-slate-500',     // Noite/Sono
        'Irritado': 'from-red-500 to-rose-600',        // Calor/Alerta
        'Ansioso': 'from-orange-400 to-amber-500',     // Tensão
        'Triste': 'from-slate-400 to-gray-500',        // Nublado
        'default': 'from-violet-600 to-fuchsia-600'    // Marca (Neutro)
    };

    // Caso 1: Usuário Novo
    if (logs.length === 0) {
        titleEl.innerText = (currentLang === 'en') ? "Start your journey today!" : 
                            (currentLang === 'es') ? "¡Comienza tu viaje hoy!" : 
                            "Comece sua jornada hoje!";
        subEl.innerText = (currentLang === 'en') ? "Tap + to verify your mood." : 
                          (currentLang === 'es') ? "Toca + para verificar tu estado." : 
                          "Toque em + para registrar seu humor.";
        // Reseta cor para padrão
        updateCardColor(cardEl, moodGradients['default']);
        return;
    }

    // Caso 2: Analisar padrão (Últimos 10)
    const recentLogs = logs.slice(0, 10);
    const counts = {};
    let dominantMood = '';
    let maxCount = 0;

    recentLogs.forEach(log => {
        if (log.type === 'mood') {
            counts[log.title] = (counts[log.title] || 0) + 1;
            if (counts[log.title] > maxCount) {
                maxCount = counts[log.title];
                dominantMood = log.title;
            }
        }
    });

    // Atualiza a Cor do Fundo
    if (dominantMood && moodGradients[dominantMood]) {
        updateCardColor(cardEl, moodGradients[dominantMood]);
    } else {
        updateCardColor(cardEl, moodGradients['default']);
    }

    // Tradução e Texto (Mantido igual)
    let moodTranslated = dominantMood;
    if (typeof translations !== 'undefined' && dominantMood) {
        const key = `mood_${dominantMood.toLowerCase()}`;
        if (translations[currentLang][key]) moodTranslated = translations[currentLang][key];
    }

    let insightText = "";
    let subText = "";

    if (['Feliz', 'Calmo'].includes(dominantMood)) {
        insightText = (currentLang === 'pt') ? `Você tem estado ${moodTranslated}!` :
                      (currentLang === 'es') ? `¡Has estado ${moodTranslated}!` :
                      `You've been ${moodTranslated}!`;
        subText = (currentLang === 'pt') ? "Continue cultivando esses bons momentos." : 
                  (currentLang === 'es') ? "Sigue cultivando estos buenos momentos." :
                  "Keep nurturing these good moments.";
    } else if (['Triste', 'Cansado', 'Ansioso', 'Irritado'].includes(dominantMood)) {
        insightText = (currentLang === 'pt') ? `Notamos que você se sentiu ${moodTranslated}.` :
                      (currentLang === 'es') ? `Notamos que te sentiste ${moodTranslated}.` :
                      `We noticed you felt ${moodTranslated}.`;
        subText = (currentLang === 'pt') ? "Que tal realizar uma tarefa disponível?" : 
                  (currentLang === 'es') ? "¿Qué tal realizar una tarea disponible?" :
                  "How about doing an available task?";
    } else {
        insightText = (currentLang === 'pt') ? "Construindo autoconhecimento." :
                      (currentLang === 'es') ? "Construyendo autoconocimiento." :
                      "Building self-awareness.";
        subText = (currentLang === 'pt') ? `${logs.length} registros no total.` :
                  (currentLang === 'es') ? `${logs.length} registros en total.` :
                  `${logs.length} total entries.`;
    }

    titleEl.innerText = insightText;
    subEl.innerText = subText;
}

// Helper para trocar classes de gradiente sem apagar o resto
function updateCardColor(element, newGradientClasses) {
    // Remove classes antigas de gradiente (todas que começam com from- ou to-)
    const classes = element.className.split(' ').filter(c => !c.startsWith('from-') && !c.startsWith('to-'));
    // Adiciona as novas
    element.className = classes.join(' ') + ' ' + newGradientClasses;
}

// 3. APP LOGIC
function switchTab(tab) {

    // Verifica se o navegador suporta a API
    if (!document.startViewTransition) {
        performTabSwitch(tab); // Navegador antigo? Faz do jeito normal
        return;
    }

    // Navegador moderno? Faz a mágica!
    document.startViewTransition(() => {
        performTabSwitch(tab);
    });
}

// Extraímos a lógica pesada para uma função separada para organizar
function performTabSwitch(tab) {
    // 1. Esconde tudo e reseta botões
    ['home', 'goals', 'diary', 'tools'].forEach(t => {
        const section = document.getElementById(`tab-${t}`);
        const btn = document.getElementById(`nav-${t}`);
        
        if(section) section.classList.add('hidden');
        
        if(btn) { 
            if(btn.classList.contains('nav-btn')) { // Mobile
                btn.classList.remove('text-primary-600', 'dark:text-primary-400');
                btn.classList.add('text-slate-400', 'dark:text-slate-500');
                const icon = btn.querySelector('i');
                if(icon) icon.classList.replace('ph-fill', 'ph-bold');
            } else { // Desktop
                btn.classList.remove('bg-primary-50', 'dark:bg-slate-800', 'text-primary-600', 'dark:text-primary-400');
                btn.classList.add('text-slate-500');
            }
        }
    });
    
    // 2. Mostra a aba nova
    const activeSection = document.getElementById(`tab-${tab}`);
    if(activeSection) activeSection.classList.remove('hidden');
    
    const activeBtn = document.getElementById(`nav-${tab}`);
    if(activeBtn) { 
        if(activeBtn.classList.contains('nav-btn')) { // Mobile
            activeBtn.classList.add('text-primary-600', 'dark:text-primary-400');
            activeBtn.classList.remove('text-slate-400', 'dark:text-slate-500');
            const icon = activeBtn.querySelector('i');
            if(icon) icon.classList.replace('ph-bold', 'ph-fill');
        } else { // Desktop
            activeBtn.classList.add('bg-primary-50', 'dark:bg-slate-800', 'text-primary-600', 'dark:text-primary-400');
            activeBtn.classList.remove('text-slate-500');
        }
    }

    // 3. Atualiza dados específicos
    if (tab === 'diary' && typeof renderHistory === 'function') renderHistory();
    if (tab === 'home' && typeof updateChart === 'function') updateChart();
}

function openMainAction() { openModal('main-action-modal'); }

let currentMood = {}; let currentTool = '';
function selectMood(mood, emoji, bg, text) {
    closeModal('main-action-modal');
    setTimeout(() => {
        currentMood = { mood, emoji, bg, text };
        document.getElementById('modal-emoji').innerText = emoji;
        // Tenta traduzir ou usa o original
        const transKey = `mood_${mood.toLowerCase()}`;
        const trans = (typeof translations !== 'undefined' && translations[currentLang][transKey]) ? translations[currentLang][transKey] : mood;
        document.getElementById('modal-mood-text').innerText = trans;
        openModal('checkin-modal');
    }, 300);
}

// --- LÓGICA DE AI SIMULADA ---

function showAIInsight(mood) {
    // 1. Abre o modal com estado de "Pensando"
    const modalContent = document.getElementById('ai-content');
    const loadingText = (typeof translations !== 'undefined') ? translations[currentLang]['ai_thinking'] : "Pensando...";
    
    modalContent.innerHTML = `<span class="italic text-slate-400">${loadingText}</span>`;
    openModal('ai-insight-modal');

    // 2. Simula delay de processamento (1.5s)
    setTimeout(() => {
        // 3. Seleciona insight aleatório baseado no humor
        const moodKey = `insight_${mood.toLowerCase()}`; // ex: insight_ansioso
        let messages = [];
        
        if (typeof translations !== 'undefined' && translations[currentLang][moodKey]) {
            messages = translations[currentLang][moodKey];
        } else {
            // Fallback genérico se não achar a chave exata
            messages = ["Respire fundo e continue.", "Um passo de cada vez.", "Você está indo bem."];
        }

        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        
        // 4. Exibe com fade in
        modalContent.style.opacity = 0;
        modalContent.innerHTML = randomMsg;
        
        // Animação simples de entrada
        requestAnimationFrame(() => {
            modalContent.style.transition = 'opacity 0.5s';
            modalContent.style.opacity = 1;
        });

    }, 1500);
}

// ATUALIZE A FUNÇÃO saveCheckin PARA CHAMAR A IA
function saveCheckin() {
    const note = document.getElementById('modal-note').value;
    const moodTitle = currentMood.mood; // Guarda o humor antes de fechar/limpar
    
    const entry = { 
        type: 'mood', 
        emoji: currentMood.emoji, 
        title: moodTitle, 
        note: note, 
        date: new Date().toISOString(), 
        tags: [moodTitle] 
    };
    
    saveToStorage(entry);
    closeModal('checkin-modal');
    document.getElementById('modal-note').value = '';
    
    if(!document.getElementById('tab-home').classList.contains('hidden')){ 
        updateChart();
        updateHomeInsight(); // <--- ADICIONE AQUI TAMBÉM
    }
    showVictory(translations[currentLang]['alert_saved'], '✨');
    // ✨ O PULO DO GATO: Chama a IA após salvar
    // Pequeno delay para a transição do modal anterior terminar
    setTimeout(() => {
        showAIInsight(moodTitle); // Passa "Ansioso", "Feliz", etc.
    }, 500);

    
}

function openToolModal(type) {
    currentTool = type;
    const titleKey = type === 'intencao' ? 'tool_intention_title' : 'tool_gratitude_title';
    if(typeof translations !== 'undefined') {
        document.getElementById('tool-title').innerText = translations[currentLang][titleKey];
        document.getElementById('tool-input').placeholder = translations[currentLang][`modal_tool_placeholder_${type}`];
    }
    document.getElementById('tool-input').value = '';
    openModal('tool-modal');
}

function saveTool() {
    const note = document.getElementById('tool-input').value; if(!note) return;
    const entry = { type: 'tool', emoji: currentTool === 'intencao' ? '🎯' : '🙏', title: currentTool === 'intencao' ? 'Intenção' : 'Gratidão', note: note, date: new Date().toISOString(), tags: [currentTool === 'intencao' ? 'Foco' : 'Positividade'] };
    saveToStorage(entry); closeModal('tool-modal');
    showVictory(translations[currentLang]['alert_saved'], '✨');
}

function saveToStorage(entry) { const logs = JSON.parse(localStorage.getItem('aboyou_logs') || '[]'); logs.unshift(entry); localStorage.setItem('aboyou_logs', JSON.stringify(logs)); }

function renderHistory() {
    const logs = JSON.parse(localStorage.getItem('aboyou_logs') || '[]');
    const container = document.getElementById('history-list');
    if (!container) return; // Segurança
    if (logs.length === 0) { 
        const msg = (typeof translations !== 'undefined') ? translations[currentLang]['empty_history'] : "Sem registros.";
        container.innerHTML = `<div class="text-center py-10 text-slate-400"><p>${msg}</p></div>`; 
        return; 
    }
    container.innerHTML = logs.map(log => {
        const transKey = `mood_${log.title.toLowerCase()}`;
        const title = (typeof translations !== 'undefined' && translations[currentLang][transKey]) ? translations[currentLang][transKey] : log.title;
        // Data formatada
        const dateOpt = { weekday: 'short', day: 'numeric', month: 'short' };
        const dateStr = new Date(log.date).toLocaleDateString(currentLang === 'pt' ? 'pt-BR' : 'en-US', dateOpt);
        
        return `<div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative mb-3 hover:shadow-md transition-shadow">
            <span class="absolute top-4 right-4 text-xs font-bold text-primary-600 dark:text-primary-400">${dateStr}</span>
            <div class="flex gap-3 mb-2">
                <div class="text-2xl">${log.emoji}</div>
                <div><h4 class="font-bold text-slate-700 dark:text-slate-200">${title}</h4></div>
            </div>
            <p class="text-slate-600 dark:text-slate-400 text-sm mb-3">${log.note || ''}</p>
        </div>`;
    }).join('');
}

// CHART
let moodChartInstance = null;
function updateChart() {
    const canvas = document.getElementById('moodChart');
    if (!canvas) return; // Se não estiver na tela, ignora
    const logs = JSON.parse(localStorage.getItem('aboyou_logs') || '[]');
    const ctx = canvas.getContext('2d');
    const counts = { 'Feliz': 0, 'Calmo': 0, 'Cansado': 0, 'Irritado': 0, 'Ansioso': 0, 'Triste': 0 };
    logs.forEach(log => { if (log.type === 'mood' && counts[log.title] !== undefined) counts[log.title]++; });
    
    // KPIs
    const elTotal = document.getElementById('total-logs');
    //const elStreak = document.getElementById('streak-days');
    if(elTotal) elTotal.innerText = logs.filter(l => l.type === 'mood').length;
    //if(elStreak) elStreak.innerText = logs.length > 0 ? '1' : '0';

    document.getElementById('streak-days').innerText = calculateStreak(logs);

    const data = { labels: ['Feliz', 'Calmo', 'Cansado', 'Irritado', 'Ansioso', 'Triste'], datasets: [{ data: Object.values(counts), backgroundColor: ['#facc15', '#60a5fa', '#c084fc', '#f87171', '#fb923c', '#9ca3af'], borderRadius: 8 }] };
    
    if (moodChartInstance) { moodChartInstance.data = data; moodChartInstance.update(); } 
    else { moodChartInstance = new Chart(ctx, { type: 'bar', data: data, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { display: false, grid: { display: false } }, x: { grid: { display: false }, ticks: { font: { family: 'Nunito', size: 10 } } } } } }); }
}

// --- LÓGICA DE NOTIFICAÇÕES ---

function toggleNotifications() {
    const toggle = document.getElementById('notif-toggle');
    
    if (toggle.checked) {
        // Pedir permissão
        if (!("Notification" in window)) {
            alert("Este navegador não suporta notificações.");
            toggle.checked = false;
            return;
        }

        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                localStorage.setItem('aboyou_notif', 'true');
                new Notification("Aboyou", { body: "Notificações ativadas! Te avisaremos durante o dia. 💜" });
            } else {
                toggle.checked = false;
                localStorage.setItem('aboyou_notif', 'false');
                alert("Precisamos da sua permissão para enviar lembretes.");
            }
        });
    } else {
        localStorage.setItem('aboyou_notif', 'false');
    }
}

function checkNotificationSchedule() {
    // Se não estiver ativado, sai
    if (localStorage.getItem('aboyou_notif') !== 'true') return;
    if (Notification.permission !== "granted") return;

    const now = new Date();
    const hour = now.getHours();
    const todayStr = now.toDateString(); // "Fri Nov 28 2025"
    
    // Recupera qual foi o último envio (para não repetir)
    const lastSent = JSON.parse(localStorage.getItem('aboyou_last_notif') || '{}');
    if (lastSent.date === todayStr && lastSent.period === getCurrentPeriod(hour)) return;

    // Definição dos Horários
    let msgKey = '';
    let period = '';

    if (hour === 9) { // 9:00 as 9:59
        msgKey = 'notif_morning';
        period = 'morning';
    } else if (hour === 14) { // 14:00 as 14:59
        msgKey = 'notif_afternoon';
        period = 'afternoon';
    } else if (hour === 20) { // 20:00 as 20:59
        msgKey = 'notif_night';
        period = 'night';
    }

    // Dispara
    if (msgKey) {
        const title = translations[currentLang]['notif_title'];
        const body = translations[currentLang][msgKey];
        
        new Notification(title, {
            body: body,
            icon: 'icon.png', // Certifique-se que o icon.png existe na pasta
            badge: 'icon.png'
        });

        // Salva que já enviou
        localStorage.setItem('aboyou_last_notif', JSON.stringify({ date: todayStr, period: period }));
    }
}

function getCurrentPeriod(hour) {
    if(hour === 9) return 'morning';
    if(hour === 14) return 'afternoon';
    if(hour === 20) return 'night';
    return '';
}

// Inicia o Scheduler (Verifica a cada 1 minuto)
setInterval(checkNotificationSchedule, 60000);

//Algoritmo Real do Streak
function calculateStreak(logs) {
    if (!logs || logs.length === 0) return 0;

    // 1. Extrai apenas as datas únicas (YYYY-MM-DD)
    const dates = [...new Set(logs.map(log => log.date.split('T')[0]))].sort().reverse();
    
    if (dates.length === 0) return 0;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Se não registrou hoje nem ontem, a sequência quebrou
    if (dates[0] !== today && dates[0] !== yesterday) return 0;

    let streak = 1;
    let currentDate = new Date(dates[0]);

    // 2. Volta no tempo contando dias consecutivos
    for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i]);
        const diffTime = Math.abs(currentDate - prevDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        if (diffDays === 1) {
            streak++;
            currentDate = prevDate;
        } else {
            break; // Quebrou a corrente
        }
    }

    return streak;
}


// --- LÓGICA PWA AVANÇADA ---

let deferredPrompt;
const pwaPopup = document.getElementById('pwa-popup');
const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

// 1. Inicialização do Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW registrado:', reg.scope))
            .catch(err => console.log('SW falhou:', err));
    });
}

// 2. Captura o evento no Android/Chrome Desktop
window.addEventListener('beforeinstallprompt', (e) => {
    console.log("🔥 Evento beforeinstallprompt DISPAROU!");
    e.preventDefault();
    deferredPrompt = e;
    
    // Se não estiver instalado, mostra o popup após 3 segundos
    if (!isInStandaloneMode && !localStorage.getItem('pwa_dismissed')) {
        setTimeout(showPwaPopup, 3000);
    }
});

// 3. Lógica para iOS (Manual)
if (isIos && !isInStandaloneMode && !localStorage.getItem('pwa_dismissed')) {
    setTimeout(() => {
        showPwaPopup();
        // Muda o texto do botão para "Instruções"
        const btn = document.getElementById('pwa-btn');
        if(btn) {
            btn.innerText = (currentLang === 'en') ? "How?" : "Como?";
            btn.onclick = () => document.getElementById('ios-prompt').classList.remove('hidden');
        }
    }, 3000);
}

function showPwaPopup() {
    pwaPopup.classList.remove('hidden');
    // Pequeno delay para animar a entrada (slide up)
    requestAnimationFrame(() => {
        pwaPopup.classList.remove('translate-y-full');
    });
}

function closePwaPopup() {
    pwaPopup.classList.add('translate-y-full');
    //localStorage.setItem('pwa_dismissed', 'true'); // Não mostra mais
    setTimeout(() => {
        pwaPopup.classList.add('hidden');
    }, 500);
}

function triggerInstall() {
    // Android/Desktop
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('Usuário aceitou instalação');
                closePwaPopup();
            }
            deferredPrompt = null;
        });
    }else {
        console.log('❌ Nenhum evento de instalação capturado. Verifique o Manifest.');
        alert('Instalação automática não disponível. Use o menu do navegador (Três pontinhos -> Instalar App).');
    }
}



// --- SISTEMA DE VITÓRIA (CONFETTI & TOAST) ---

function showVictory(message, emoji = '🎉') {
    // 1. Cria o Toast
    const toast = document.createElement('div');
    toast.className = 'victory-toast dark:text-white';
    toast.innerHTML = `
        <span class="text-2xl animate-bounce">${emoji}</span>
        <span class="font-bold text-sm text-slate-800 dark:text-slate-100">${message}</span>
    `;
    document.body.appendChild(toast);

    // Remove Toast depois de 3s
    setTimeout(() => {
        toast.style.animation = 'toastExit 0.5s forwards';
        setTimeout(() => toast.remove(), 500);
    }, 3000);

    // 2. Dispara Confetes (Explosão)
    fireConfetti();
}

function fireConfetti() {
    const colors = ['#8b5cf6', '#f472b6', '#fbbf24', '#34d399', '#60a5fa'];
    
    // Cria 30 pedacinhos
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        // Aleatoriedade
        const left = Math.random() * 100 + 'vw';
        const animDuration = Math.random() * 2 + 2 + 's'; // 2 a 4 segundos
        const delay = Math.random() * 0.5 + 's';
        const bg = colors[Math.floor(Math.random() * colors.length)];
        
        confetti.style.left = left;
        confetti.style.backgroundColor = bg;
        confetti.style.animationDuration = animDuration;
        confetti.style.animationDelay = delay;
        
        document.body.appendChild(confetti);

        // Limpa do DOM depois que cair
        setTimeout(() => confetti.remove(), 4000);
    }
}

// INIT (Só roda se estiver no browser)
if (typeof window !== 'undefined') {

    if(typeof setLanguage === 'function') setLanguage(localStorage.getItem('aboyou_lang') || 'pt');
    
    const name = localStorage.getItem('aboyou_username') || "Visitante";
    const nameEl = document.getElementById('user-name-display');
    if(nameEl) nameEl.innerText = name;
    
    // Auto executa ao carregar
    updateChart();
    updateHomeInsight();

    // Estado inicial do botão de notificação
    const notifToggle = document.getElementById('notif-toggle');
    if (notifToggle) {
        notifToggle.checked = (localStorage.getItem('aboyou_notif') === 'true' && Notification.permission === 'granted');
    }
}