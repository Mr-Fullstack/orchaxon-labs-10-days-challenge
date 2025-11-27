/**
 * OrchAxon Tracker v1.0
 * Copie as chaves do Supabase para a CONFIG abaixo.
 */
(function() {
    // ==========================================
    // ⚠️ COLOQUE SUAS CHAVES AQUI
    // ==========================================
    const CONFIG = {
      SUPABASE_URL :'https://bjumbtpoocilxyccxnpa.supabase.co',
      SUPABASE_KEY : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqdW1idHBvb2NpbHh5Y2N4bnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMTgzNjgsImV4cCI6MjA3OTc5NDM2OH0.48dp49slcZoPeUvw9Xp-MkxxHhkYSPWzINpaKIXDVwY'
    };
     // ==========================================

    async function init() {
        // 1. Identificar quem está chamando o script
        // Tenta pegar pelo ID ou pelo script que está executando agora
        const scriptTag = document.getElementById('orchaxon-tracker') || document.currentScript;
        
        // Se não achar a tag, usa 'unknown', senão pega o atributo data-project
        const projectName = scriptTag ? scriptTag.getAttribute('data-project') : document.title;

        // 2. Montar os dados da visita
        const payload = {
            project_name: projectName,
            url: window.location.href,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
            screen_width: window.screen.width
        };

        // 3. Enviar para o Supabase via API REST (Fetch)
        // Isso evita precisar da biblioteca do Supabase em todos os sites
        try {
            const endpoint = `${CONFIG.SUPABASE_URL}/rest/v1/page_views`;
            
            await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'apikey': CONFIG.SUPABASE_KEY,
                    'Authorization': `Bearer ${CONFIG.SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal' // Não precisa retornar resposta, economiza banda
                },
                body: JSON.stringify(payload)
            });

            console.log(`[OrchAxon Tracker] Visita registrada: ${projectName}`);

        } catch (err) {
            console.warn('[OrchAxon Tracker] Falha ao enviar métrica:', err);
        }
    }

    // Garante que o DOM carregou antes de rodar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();