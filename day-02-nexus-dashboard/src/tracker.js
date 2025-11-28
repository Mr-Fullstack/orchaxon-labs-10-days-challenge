/**
 * OrchAxon Tracker v2.0 - Analytics + Feedback System
 * Injeta automaticamente um Modal de Feedback em todos os apps.
 */
(function() {
    // ==========================================
    // ⚠️ CONFIGURAÇÃO
    // ==========================================
    const CONFIG = {
        SUPABASE_URL: 'https://bjumbtpoocilxyccxnpa.supabase.co',
        SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqdW1idHBvb2NpbHh5Y2N4bnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMTgzNjgsImV4cCI6MjA3OTc5NDM2OH0.48dp49slcZoPeUvw9Xp-MkxxHhkYSPWzINpaKIXDVwY',
        DELAY_MODAL: 15000 // Tempo em ms para abrir o modal (ex: 15 seg)
    };

    // Identificar projeto
    const scriptTag = document.getElementById('orchaxon-tracker') || document.currentScript;
    const PROJECT_NAME = scriptTag ? scriptTag.getAttribute('data-project') : document.title;
    
    // Gerar ou recuperar ID único do usuário
    let USER_ID = localStorage.getItem('orchaxon_user_id');
    if (!USER_ID) {
        USER_ID = crypto.randomUUID();
        localStorage.setItem('orchaxon_user_id', USER_ID);
    }

    // ==========================================
    // 1. RASTREAMENTO DE VISITAS (ANALYTICS)
    // ==========================================
    async function trackView() {
        const payload = {
            project_name: PROJECT_NAME,
            url: window.location.href,
            referrer: document.referrer || '',
            user_agent: navigator.userAgent,
            screen_width: window.screen.width
        };

        try {
            await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/page_views`, {
                method: 'POST',
                headers: {
                    'apikey': CONFIG.SUPABASE_KEY,
                    'Authorization': `Bearer ${CONFIG.SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(payload)
            });
            console.log(`[OrchAxon] View registrada: ${PROJECT_NAME}`);
        } catch (err) {
            console.warn('[OrchAxon] Erro tracker:', err);
        }
    }

    // ==========================================
    // 2. SISTEMA DE FEEDBACK (MODAL)
    // ==========================================
    function initFeedbackSystem() {
        // Verificar se já votou neste projeto
        const hasVoted = localStorage.getItem(`orchaxon_voted_${PROJECT_NAME}`);
        if (hasVoted) return; // Não mostra nada se já votou

        // Injetar CSS
        const style = document.createElement('style');
        style.innerHTML = `
            #orchaxon-feedback-modal { display: none; position: fixed; bottom: 20px; right: 20px; z-index: 9999; font-family: sans-serif; }
            .oa-card { background: white; width: 300px; padding: 20px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); border: 1px solid #e2e8f0; animation: slideIn 0.5s ease; }
            .oa-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
            .oa-title { font-weight: bold; font-size: 16px; color: #1e293b; }
            .oa-close { cursor: pointer; color: #94a3b8; font-size: 20px; }
            .oa-stars { display: flex; gap: 5px; margin-bottom: 15px; justify-content: center; }
            .oa-star { cursor: pointer; font-size: 24px; color: #cbd5e1; transition: color 0.2s; }
            .oa-star.active { color: #f59e0b; }
            .oa-input { width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; margin-bottom: 10px; font-size: 14px; box-sizing: border-box;}
            .oa-btn { width: 100%; background: #0f172a; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: bold; }
            .oa-btn:hover { background: #334155; }
            @keyframes slideIn { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        `;
        document.head.appendChild(style);

        // Criar HTML do Modal
        const modalDiv = document.createElement('div');
        modalDiv.id = 'orchaxon-feedback-modal';
        modalDiv.innerHTML = `
            <div class="oa-card">
                <div class="oa-header">
                    <span class="oa-title">O que achou da ferramenta?</span>
                    <span class="oa-close" onclick="document.getElementById('orchaxon-feedback-modal').style.display='none'">&times;</span>
                </div>
                <div class="oa-stars" id="oa-stars-container">
                    <span class="oa-star" data-val="1">★</span>
                    <span class="oa-star" data-val="2">★</span>
                    <span class="oa-star" data-val="3">★</span>
                    <span class="oa-star" data-val="4">★</span>
                    <span class="oa-star" data-val="5">★</span>
                </div>
                <textarea class="oa-input oa-title" id="oa-comment" rows="3" placeholder="Sugestões ou críticas?"></textarea>
                <button class="oa-btn" onclick="submitOrchAxonFeedback()">Enviar Feedback</button>
            </div>
        `;
        document.body.appendChild(modalDiv);

        // Lógica das Estrelas
        let currentRating = 0;
        const stars = modalDiv.querySelectorAll('.oa-star');
        stars.forEach(star => {
            star.addEventListener('click', () => {
                currentRating = star.dataset.val;
                stars.forEach(s => s.classList.remove('active'));
                stars.forEach(s => { if(s.dataset.val <= currentRating) s.classList.add('active'); });
            });
        });

        // Função Global de Envio
        window.submitOrchAxonFeedback = async () => {
            if (currentRating === 0) { alert('Por favor, selecione uma nota de 1 a 5.'); return; }
            
            const comment = document.getElementById('oa-comment').value;
            const btn = document.querySelector('.oa-btn');
            btn.innerText = 'Enviando...';
            btn.disabled = true;

            const feedbackPayload = {
                project_name: PROJECT_NAME,
                rating: parseInt(currentRating),
                recommend: parseInt(currentRating) >= 4, // Simplificação: Se nota >= 4, recomenda
                comment: comment,
                user_id: USER_ID
            };

            try {
                await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/feedbacks`, {
                    method: 'POST',
                    headers: {
                        'apikey': CONFIG.SUPABASE_KEY,
                        'Authorization': `Bearer ${CONFIG.SUPABASE_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(feedbackPayload)
                });
                
                // Sucesso
                localStorage.setItem(`orchaxon_voted_${PROJECT_NAME}`, 'true');
                modalDiv.innerHTML = '<div class="oa-card" style="text-align:center; color:green;"><h3>Obrigado! 🚀</h3><p>Seu feedback ajuda muito.</p></div>';
                setTimeout(() => { modalDiv.style.display = 'none'; }, 3000);

            } catch (err) {
                console.error(err);
                btn.innerText = 'Erro ao enviar';
            }
        };

        // Timer para mostrar o modal
        setTimeout(() => {
            modalDiv.style.display = 'block';
        }, CONFIG.DELAY_MODAL);
    }

    // Inicialização
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { trackView(); initFeedbackSystem(); });
    } else {
        trackView();
        initFeedbackSystem();
    }
})();