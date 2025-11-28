  // ==========================================
        // CONFIGURAÇÃO DO SUPABASE
        // ==========================================
        const SUPABASE_URL = 'https://bjumbtpoocilxyccxnpa.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqdW1idHBvb2NpbHh5Y2N4bnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMTgzNjgsImV4cCI6MjA3OTc5NDM2OH0.48dp49slcZoPeUvw9Xp-MkxxHhkYSPWzINpaKIXDVwY';
        // ==========================================

    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // Atualizar URL do tracker na tela de instruções
    document.getElementById('host-url').innerText = window.location.origin;
async function initDashboard() {
        try {
            // 1. Buscar VIEWS
            const { data: views } = await supabase
                .from('page_views')
                .select('project_name, created_at, url')
                .order('created_at', { ascending: false })
                .limit(1000);

            // 2. Buscar FEEDBACKS
            const { data: feedbacks } = await supabase
                .from('feedbacks')
                .select('*')
                .order('created_at', { ascending: false });

            // Processar e Renderizar
            updateKPIs(views, feedbacks);
            renderHybridChart(views, feedbacks);
            renderViewFeed(views);
            renderFeedbackFeed(feedbacks);

        } catch (err) {
            console.error('Erro no Dashboard:', err);
        }
    }

    function updateKPIs(views, feedbacks) {
        // Total Views
        document.getElementById('total-views').innerText = views.length;

        // Top Project
        const counts = {};
        views.forEach(v => counts[v.project_name] = (counts[v.project_name] || 0) + 1);
        const top = Object.entries(counts).sort((a,b) => b[1] - a[1])[0];
        document.getElementById('top-project').innerText = top ? top[0] : '-';

        // Avg Rating Global
        if (feedbacks && feedbacks.length) {
            const sum = feedbacks.reduce((acc, curr) => acc + curr.rating, 0);
            document.getElementById('avg-rating').innerText = (sum / feedbacks.length).toFixed(1);
            document.getElementById('total-votes').innerText = feedbacks.length;
        }
    }

    let chartInstance = null;
    function renderHybridChart(views, feedbacks) {
        // 1. Agregar dados por Projeto
        const projectStats = {};

        // Contar Views
        views.forEach(v => {
            const name = v.project_name || 'unknown';
            if(!projectStats[name]) projectStats[name] = { views: 0, totalStars: 0, votes: 0 };
            projectStats[name].views++;
        });

        // Contar Notas
        if(feedbacks) {
            feedbacks.forEach(f => {
                const name = f.project_name || 'unknown';
                if(!projectStats[name]) projectStats[name] = { views: 0, totalStars: 0, votes: 0 };
                projectStats[name].totalStars += f.rating;
                projectStats[name].votes++;
            });
        }

        // Preparar Arrays para o Chart.js
        const labels = Object.keys(projectStats);
        const dataViews = labels.map(name => projectStats[name].views);
        const dataRatings = labels.map(name => {
            const p = projectStats[name];
            return p.votes > 0 ? (p.totalStars / p.votes).toFixed(1) : 0;
        });

        // Renderizar Chart Combo
        const ctx = document.getElementById('hybridChart').getContext('2d');
        if (chartInstance) chartInstance.destroy();

        chartInstance = new Chart(ctx, {
            type: 'bar', // Tipo base
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Visualizações',
                        data: dataViews,
                        backgroundColor: 'rgba(16, 185, 129, 0.7)', // Emerald
                        yAxisID: 'y',
                        order: 2
                    },
                    {
                        label: 'Nota Média (0-5)',
                        data: dataRatings,
                        borderColor: '#fbbf24', // Amber/Yellow
                        backgroundColor: '#fbbf24',
                        type: 'line', // Linha sobreposta
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 5,
                        yAxisID: 'y1',
                        order: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: { legend: { labels: { color: '#cbd5e1' } } },
                scales: {
                    x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
                    y: { // Eixo Views (Esquerda)
                        type: 'linear',
                        display: true,
                        position: 'left',
                        grid: { color: '#334155' },
                        ticks: { color: '#10b981' }
                    },
                    y1: { // Eixo Notas (Direita)
                        type: 'linear',
                        display: true,
                        position: 'right',
                        min: 0,
                        max: 5.5, // Folga para o 5 não cortar
                        grid: { display: false },
                        ticks: { color: '#fbbf24' }
                    }
                }
            }
        });
    }

    function renderViewFeed(list) {
        const container = document.getElementById('feed-list');
        container.innerHTML = '';
        list.slice(0, 15).forEach(item => {
            const div = document.createElement('div');
            div.className = 'text-xs border-b border-white/5 pb-1 mb-1';
            div.innerHTML = `<span class="text-primary font-mono">${item.project_name}</span> <span class="text-slate-500 float-right">${new Date(item.created_at).toLocaleTimeString('pt-BR')}</span>`;
            container.appendChild(div);
        });
    }

    function renderFeedbackFeed(list) {
        const container = document.getElementById('feedback-list');
        if(!list || list.length === 0) return;
        
        container.innerHTML = '';
        list.slice(0, 10).forEach(item => {
            const div = document.createElement('div');
            div.className = 'bg-slate-800/50 p-3 rounded mb-2 border-l-2 border-yellow-500';
            
            // Estrelas
            const stars = '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating);
            
            div.innerHTML = `
                <div class="flex justify-between items-center mb-1">
                    <span class="text-yellow-400 text-xs tracking-widest">${stars}</span>
                    <span class="text-[10px] text-slate-500">${new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                <div class="text-white text-sm italic mb-1">"${item.comment || 'Sem comentário'}"</div>
                <div class="text-[10px] text-primary font-mono text-right">Proj: ${item.project_name}</div>
            `;
            container.appendChild(div);
        });
    }

    // Start
    initDashboard();
    setInterval(initDashboard, 15000); // Atualiza a cada 15s