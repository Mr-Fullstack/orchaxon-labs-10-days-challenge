  // ==========================================
        // CONFIGURAÇÃO DO SUPABASE
        // ==========================================
        const SUPABASE_URL = 'https://bjumbtpoocilxyccxnpa.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqdW1idHBvb2NpbHh5Y2N4bnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMTgzNjgsImV4cCI6MjA3OTc5NDM2OH0.48dp49slcZoPeUvw9Xp-MkxxHhkYSPWzINpaKIXDVwY';
        // ==========================================

        const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

        // Atualizar URL na caixa de código
        document.getElementById('host-url').innerText = window.location.origin;

        async function initDashboard() {
            try {
                // 1. Buscar Dados (Últimos 2000 registros para ser rápido)
                const { data, error } = await supabase
                    .from('page_views')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(2000);

                if (error) throw error;

                // 2. Processar Métricas
                updateKPIs(data);
                renderChart(data);
                renderFeed(data.slice(0, 15)); // Últimos 15 no feed

            } catch (err) {
                console.error('Erro ao carregar dados:', err);
            }
        }

        function updateKPIs(data) {
            // Total Views
            document.getElementById('total-views').innerText = data.length;

            // Agrupar por Projeto
            const counts = {};
            data.forEach(item => {
                const p = item.project_name || 'unknown';
                counts[p] = (counts[p] || 0) + 1;
            });

            // Top Project
            const sortedProjects = Object.entries(counts).sort((a,b) => b[1] - a[1]);
            if (sortedProjects.length > 0) {
                document.getElementById('top-project').innerText = sortedProjects[0][0];
                document.getElementById('active-projects').innerText = sortedProjects.length;
            }
        }

        let chartInstance = null;
        function renderChart(data) {
            const counts = {};
            data.forEach(item => {
                const p = item.project_name || 'unknown';
                counts[p] = (counts[p] || 0) + 1;
            });

            const ctx = document.getElementById('trafficChart').getContext('2d');
            
            if (chartInstance) chartInstance.destroy();

            chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: Object.keys(counts),
                    datasets: [{
                        label: 'Views',
                        data: Object.values(counts),
                        backgroundColor: '#10b981',
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
                        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                    }
                }
            });
        }

        function renderFeed(list) {
            const container = document.getElementById('feed-list');
            container.innerHTML = '';
            
            list.forEach(item => {
                const div = document.createElement('div');
                div.className = 'flex justify-between items-center text-sm border-b border-white/5 pb-2';
                const time = new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' });
                
                div.innerHTML = `
                    <div>
                        <span class="text-primary font-mono block">${item.project_name}</span>
                        <span class="text-slate-500 text-xs truncate max-w-[150px] block">${item.url || '/'}</span>
                    </div>
                    <span class="text-slate-400 text-xs font-mono bg-slate-800 px-2 py-1 rounded">${time}</span>
                `;
                container.appendChild(div);
            });
        }

        // Iniciar
        initDashboard();
        // Atualizar a cada 10s
        setInterval(initDashboard, 10000);