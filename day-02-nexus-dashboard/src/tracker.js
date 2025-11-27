/**
 * OrchAxon Tracker v1.1 (Versão REST API - Sem Dependências)
 */
(function() {
    // ⚠️ IMPORTANTE: Cole suas chaves do Supabase aqui novamente
    const CONFIG = {
        SUPABASE_URL : 'https://bjumbtpoocilxyccxnpa.supabase.co',
        SUPABASE_KEY : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqdW1idHBvb2NpbHh5Y2N4bnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMTgzNjgsImV4cCI6MjA3OTc5NDM2OH0.48dp49slcZoPeUvw9Xp-MkxxHhkYSPWzINpaKIXDVwY'
    };

    function init() {
        console.log('[OrchAxon] Iniciando tracker...');

        // 1. Identifica o nome do projeto
        const scriptTag = document.getElementById('orchaxon-tracker') || document.currentScript;
        const projectName = scriptTag ? scriptTag.getAttribute('data-project') : 'unknown';

        // 2. Prepara os dados
        const payload = {
            project_name: projectName,
            url: window.location.href,
            referrer: document.referrer || '',
            user_agent: navigator.userAgent,
            screen_width: window.screen.width
        };

        // 3. Envia direto via HTTP (Sem precisar de createClient)
        const endpoint = `${CONFIG.SUPABASE_URL}/rest/v1/page_views`;

        fetch(endpoint, {
            method: 'POST',
            headers: {
                'apikey': CONFIG.SUPABASE_KEY,
                'Authorization': `Bearer ${CONFIG.SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(payload)
        })
        .then(() => console.log(`[OrchAxon] View registrada para: ${projectName}`))
        .catch(err => console.error('[OrchAxon] Erro de conexão:', err));
    }

    // Garante que roda apenas após o HTML carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();