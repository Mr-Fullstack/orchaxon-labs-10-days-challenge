const namingData = {
            startup: {
                prefixes: [
                    'Tech', 'Data', 'Cloud', 'Smart', 'Quick', 'Fast', 'Instant', 'Rapid', 
                    'Mega', 'Ultra', 'Super', 'Hyper', 'Meta', 'Quantum', 'Cyber', 'Digital',
                    'Web', 'Net', 'App', 'Sync', 'Flow', 'Stream', 'Wave', 'Pulse', 'Spark',
                    'Bright', 'Swift', 'Zoom', 'Link', 'Connect', 'Hub', 'Node', 'Core',
                    'Vertex', 'Nexus', 'Pixel', 'Byte', 'Bit', 'Code', 'Dev', 'Hack',
                    'Boost', 'Launch', 'Rocket', 'Dash', 'Sprint', 'Peak', 'Prime', 'Pro',
                    'Elite', 'Edge', 'Fusion'
                ],
                suffixes: [
                    'ify', 'ly', 'io', 'hub', 'lab', 'base', 'space', 'cloud', 'flow',
                    'sync', 'link', 'box', 'spot', 'zone', 'wave', 'cast', 'scope', 'vista',
                    'forge', 'works', 'labs', 'tech', 'soft', 'ware', 'core', 'net', 'web',
                    'app', 'pro', 'plus', 'max', 'prime', 'boost', 'dash', 'pulse', 'spark',
                    'byte', 'bit', 'code', 'dev', 'node', 'edge', 'verse', 'sphere', 'nexus',
                    'pixel', 'loop', 'stack', 'stream'
                ]
            },
            corporativo: {
                prefixes: [
                    'Global', 'Prime', 'First', 'United', 'National', 'Capital', 'Strategic',
                    'Professional', 'Executive', 'Enterprise', 'Corporate', 'Premium', 'Superior',
                    'Advanced', 'Integrated', 'Consolidated', 'Universal', 'Continental', 'International',
                    'Atlantic', 'Pacific', 'Metropolitan', 'Central', 'Federal', 'Prestige',
                    'Excellence', 'Summit', 'Apex', 'Pinnacle', 'Meridian', 'Horizon', 'Alliance',
                    'Partnership', 'Associates', 'Consulting', 'Advisory', 'Management', 'Solutions',
                    'Services', 'Systems', 'Technologies', 'Enterprises', 'Industries', 'Corporation',
                    'Holdings', 'Group', 'Ventures', 'Capital', 'Trust', 'Assurance'
                ],
                suffixes: [
                    'Group', 'Corp', 'Inc', 'LLC', 'Partners', 'Associates', 'Solutions',
                    'Services', 'Consulting', 'Advisory', 'Management', 'Systems', 'Technologies',
                    'Enterprises', 'Industries', 'Holdings', 'Capital', 'Ventures', 'Trust',
                    'Assurance', 'Alliance', 'Network', 'Global', 'International', 'Worldwide',
                    'Professional', 'Executive', 'Strategic', 'Premier', 'Elite', 'Excellence',
                    'Summit', 'Apex', 'Pinnacle', 'Meridian', 'Horizon', 'Continental', 'Federal',
                    'National', 'United', 'Central', 'Metropolitan', 'Atlantic', 'Pacific',
                    'Prestige', 'Premium', 'Superior', 'Advanced', 'Integrated', 'Universal'
                ]
            },
            criativo: {
                prefixes: [
                    'Happy', 'Crazy', 'Funky', 'Jolly', 'Zippy', 'Peppy', 'Snazzy', 'Jazzy',
                    'Dizzy', 'Fuzzy', 'Buzzy', 'Fizzy', 'Quirky', 'Wacky', 'Zany', 'Groovy',
                    'Nifty', 'Dandy', 'Fancy', 'Spiffy', 'Swanky', 'Ritzy', 'Posh', 'Chic',
                    'Rad', 'Cool', 'Epic', 'Mega', 'Super', 'Wonder', 'Magic', 'Dream',
                    'Star', 'Rainbow', 'Sunny', 'Bright', 'Shiny', 'Sparkle', 'Twinkle', 'Dazzle',
                    'Glow', 'Brilliant', 'Vivid', 'Bold', 'Fresh', 'Wild', 'Free', 'Joy',
                    'Bliss', 'Zen'
                ],
                suffixes: [
                    'ster', 'zilla', 'rama', 'ville', 'land', 'world', 'paradise', 'heaven',
                    'haven', 'oasis', 'nest', 'den', 'lab', 'factory', 'works', 'studio',
                    'house', 'shop', 'spot', 'place', 'zone', 'corner', 'nook', 'hub',
                    'central', 'express', 'delight', 'magic', 'wonder', 'dream', 'fantasy',
                    'adventure', 'party', 'fiesta', 'carnival', 'festival', 'celebration', 'blast',
                    'boom', 'pop', 'splash', 'burst', 'spark', 'glow', 'shine', 'beam',
                    'ray', 'wave', 'vibe', 'mood'
                ]
            }
        };

        const generateBtn = document.getElementById('generateBtn');
        const keywordInput = document.getElementById('keyword');
        const styleSelect = document.getElementById('style');
        const resultsDiv = document.getElementById('results');
        const namesList = document.getElementById('namesList');
        const toast = document.getElementById('toast');

        function getRandomItem(arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        }

        function generateName(style, keyword) {
            const data = namingData[style];
            const prefix = getRandomItem(data.prefixes);
            const suffix = getRandomItem(data.suffixes);
            
            const patterns = [
                () => keyword ? `${prefix}${keyword}` : `${prefix}${suffix}`,
                () => keyword ? `${keyword}${suffix}` : `${prefix}${suffix}`,
                () => keyword ? `${prefix}${keyword}${suffix}` : `${prefix}${getRandomItem(data.suffixes)}`,
                () => keyword ? `${keyword}${prefix}` : `${getRandomItem(data.prefixes)}${suffix}`,
                () => keyword ? `${prefix}${keyword.charAt(0).toUpperCase() + keyword.slice(1)}` : `${prefix}${suffix}`
            ];
            
            return getRandomItem(patterns)();
        }

        function generateNames() {
            const keyword = keywordInput.value.trim();
            const style = styleSelect.value;
            const names = new Set();
            
            while (names.size < 10) {
                names.add(generateName(style, keyword));
            }
            
            namesList.innerHTML = '';
            
            Array.from(names).forEach((name, index) => {
                const nameCard = document.createElement('div');
                nameCard.className = 'bg-white border-2 border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-purple-500 transition-colors fade-in';
                nameCard.style.animationDelay = `${index * 0.05}s`;
                
                nameCard.innerHTML = `
                    <span class="text-lg font-semibold text-gray-800">${name}</span>
                    <button 
                        class="copy-btn bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                        data-name="${name}"
                    >
                        📋 Copiar
                    </button>
                `;
                
                namesList.appendChild(nameCard);
            });
            
            resultsDiv.classList.remove('hidden');
            resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        function copyToClipboard(text, btn) {
            navigator.clipboard.writeText(text).then(() => {
                btn.classList.add('copying');
                btn.textContent = '✓ Copiado!';
                btn.classList.remove('bg-purple-500', 'hover:bg-purple-600');
                btn.classList.add('bg-green-500');
                
                toast.classList.remove('hidden');
                setTimeout(() => {
                    toast.classList.add('hidden');
                }, 2000);
                
                setTimeout(() => {
                    btn.classList.remove('copying', 'bg-green-500');
                    btn.classList.add('bg-purple-500', 'hover:bg-purple-600');
                    btn.textContent = '📋 Copiar';
                }, 2000);
            });
        }

        generateBtn.addEventListener('click', generateNames);
        
        namesList.addEventListener('click', (e) => {
            if (e.target.classList.contains('copy-btn')) {
                const name = e.target.dataset.name;
                copyToClipboard(name, e.target);
            }
        });

        keywordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                generateNames();
            }
        });