    const SUPABASE_URL = 'https://bjumbtpoocilxyccxnpa.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqdW1idHBvb2NpbHh5Y2N4bnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMTgzNjgsImV4cCI6MjA3OTc5NDM2OH0.48dp49slcZoPeUvw9Xp-MkxxHhkYSPWzINpaKIXDVwY';
    let testCases = [];
    let currentTab = 'visual';

    function switchTab(tab) {
        currentTab = tab;
        const btnVisual = document.getElementById('tabVisual');
        const btnJson = document.getElementById('tabJson');
        if (tab === 'visual') {
            btnVisual.classList.add('tab-active', 'text-blue-400'); btnVisual.classList.remove('text-slate-400');
            btnJson.classList.remove('tab-active', 'text-blue-400'); btnJson.classList.add('text-slate-400');
            document.getElementById('visualBuilder').classList.remove('hidden');
            document.getElementById('jsonBuilder').classList.add('hidden');
            syncFromJson(); 
        } else {
            btnJson.classList.add('tab-active', 'text-blue-400'); btnJson.classList.remove('text-slate-400');
            btnVisual.classList.remove('tab-active', 'text-blue-400'); btnVisual.classList.add('text-slate-400');
            document.getElementById('visualBuilder').classList.add('hidden');
            document.getElementById('jsonBuilder').classList.remove('hidden');
            syncToJson(); 
        }
    }

    function addCase(text = '') {
        const id = Date.now();
        testCases.push({ id, text });
        renderCases();
        updateOutput();
    }

    function removeCase(id) {
        testCases = testCases.filter(c => c.id !== id);
        renderCases();
        updateOutput();
    }

    function updateCase(id, text) {
        const caseItem = testCases.find(c => c.id === id);
        if (caseItem) { caseItem.text = text; updateOutput(); }
    }

    function renderCases() {
        const container = document.getElementById('casesList');
        container.innerHTML = testCases.map(c => `
            <div class="case-item flex gap-2 group">
                <input type="text" value="${c.text}" oninput="updateCase(${c.id}, this.value)"
                        placeholder="Should return true when..."
                        class="flex-1 px-3 py-2 rounded bg-slate-900 border border-slate-700 focus:border-purple-500 text-sm font-mono transition-colors">
                <button onclick="removeCase(${c.id})" class="px-3 py-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors">✕</button>
            </div>
        `).join('');
    }

    function toSnakeCase(str) { return str.replace(/[^a-zA-Z0-9]/g, '_').replace(/([a-z])([A-Z])/g, '$1_$2').replace(/_+/g, '_').toLowerCase(); }
    function toPascalCase(str) { return str.replace(/[^a-zA-Z0-9]/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(''); }
    function toCamelCase(str) { const p = toPascalCase(str); return p.charAt(0).toLowerCase() + p.slice(1); }

    function generateCSharp(className, methodName, cases) {
        return `<span class="keyword">using</span> Xunit;\n\n<span class="keyword">public class</span> <span class="class-name">${className}Tests</span>\n{\n${cases.map(c => `    <span class="comment">// ${c.text}</span>\n    [<span class="class-name">Fact</span>]\n    <span class="keyword">public void</span> <span class="function">${methodName}_${toPascalCase(c.text)}</span>()\n    {\n        <span class="comment">// Arrange</span>\n        <span class="keyword">var</span> service = <span class="keyword">new</span> <span class="class-name">${className}</span>();\n        <span class="comment">// Act</span>\n        <span class="comment">// Assert</span>\n    }\n`).join('\n')}}`;
    }
    function generateKotlin(className, methodName, cases) {
        return `<span class="keyword">import</span> org.junit.Test\n\n<span class="keyword">class</span> <span class="class-name">${className}Test</span> {\n${cases.map(c => `    <span class="comment">// ${c.text}</span>\n    @<span class="class-name">Test</span>\n    <span class="keyword">fun</span> <span class="function">\`${methodName} ${c.text}\`</span>() {\n        <span class="comment">// Arrange</span>\n        <span class="keyword">val</span> service = <span class="class-name">${className}</span>()\n        <span class="comment">// Act</span>\n        <span class="comment">// Assert</span>\n    }\n`).join('\n')}}`;
    }
    function generateTypeScript(className, methodName, cases) {
        return `<span class="keyword">describe</span>(<span class="string">'${className}'</span>, () => {\n    <span class="keyword">describe</span>(<span class="string">'${methodName}'</span>, () => {\n${cases.map(c => `        <span class="comment">// ${c.text}</span>\n        <span class="keyword">it</span>(<span class="string">'${c.text}'</span>, () => {\n            <span class="comment">// Arrange</span>\n            <span class="keyword">const</span> service = <span class="keyword">new</span> <span class="class-name">${className}</span>();\n            <span class="comment">// Act</span>\n            <span class="comment">// Assert</span>\n        });\n`).join('\n')}    });\n});`;
    }
    function generateJava(className, methodName, cases) {
        return `<span class="keyword">import</span> org.junit.jupiter.api.Test;\n<span class="keyword">import static</span> org.junit.jupiter.api.Assertions.*;\n\n<span class="keyword">class</span> <span class="class-name">${className}Test</span> {\n${cases.map(c => `    <span class="comment">// ${c.text}</span>\n    <span class="annotation">@Test</span>\n    <span class="keyword">void</span> <span class="function">${toCamelCase(methodName)}_${toCamelCase(c.text)}</span>() {\n        <span class="comment">// Arrange</span>\n        <span class="keyword">var</span> service = <span class="keyword">new</span> <span class="class-name">${className}</span>();\n        <span class="comment">// Act</span>\n        <span class="comment">// Assert</span>\n    }\n`).join('\n')}}`;
    }
    function generatePHP(className, methodName, cases) {
        return `<span class="keyword">&lt;?php</span>\n<span class="keyword">use</span> PHPUnit\\Framework\\TestCase;\n\n<span class="keyword">class</span> <span class="class-name">${className}Test</span> <span class="keyword">extends</span> <span class="class-name">TestCase</span>\n{\n${cases.map(c => `    <span class="comment">// ${c.text}</span>\n    <span class="keyword">public function</span> <span class="function">test${toPascalCase(methodName)}_${toPascalCase(c.text)}</span>()\n    {\n        <span class="comment">// Arrange</span>\n        <span class="variable">$service</span> = <span class="keyword">new</span> <span class="class-name">${className}</span>();\n        <span class="comment">// Act</span>\n        <span class="comment">// Assert</span>\n    }\n`).join('\n')}}`;
    }

    function updateLangBadge() {
        const lang = document.getElementById('language').value;
        const badge = document.getElementById('langBadge');
        const labels = { csharp: 'C#', kotlin: 'Kotlin', typescript: 'TypeScript', java: 'Java', php: 'PHP' };
        badge.className = `lang-badge lang-${lang}`;
        badge.textContent = labels[lang];
    }

    function updateOutput() {
        const lang = document.getElementById('language').value;
        const className = document.getElementById('className').value.trim() || 'MyClass';
        const methodName = document.getElementById('methodName').value.trim() || 'MyMethod';
        const outputEl = document.getElementById('output');
        
        outputEl.className = `flex-grow max-h-[500px] overflow-y-auto theme-${lang} font-mono text-sm p-4`;
        
        if (testCases.length === 0) {
            outputEl.innerHTML = '<span class="comment">// Add at least one test scenario to generate code...</span>';
            return;
        }

        let code = '';
        switch (lang) {
            case 'csharp': code = generateCSharp(className, methodName, testCases); break;
            case 'kotlin': code = generateKotlin(className, methodName, testCases); break;
            case 'typescript': code = generateTypeScript(className, methodName, testCases); break;
            case 'java': code = generateJava(className, methodName, testCases); break;
            case 'php': code = generatePHP(className, methodName, testCases); break;
        }
        outputEl.innerHTML = code;
    }

    function syncToJson() {
        const lang = document.getElementById('language').value;
        const className = document.getElementById('className').value.trim();
        const methodName = document.getElementById('methodName').value.trim();
        const data = { lang, class: className, method: methodName, cases: testCases.map(c => c.text) };
        document.getElementById('jsonInput').value = JSON.stringify(data, null, 2);
    }

    function syncFromJson() {
        try {
            const data = JSON.parse(document.getElementById('jsonInput').value);
            document.getElementById('language').value = data.lang || 'csharp';
            document.getElementById('className').value = data.class || '';
            document.getElementById('methodName').value = data.method || '';
            testCases = (data.cases || []).map((text, i) => ({ id: Date.now() + i, text }));
            renderCases();
            updateOutput();
            updateLangBadge();
        } catch (e) { }
    }

    function copyCode(btn) {
        const output = document.getElementById('output');
        const text = output.innerText;
        
        navigator.clipboard.writeText(text).then(() => {
            // Salva o estado original
            const originalText = btn.innerHTML;
            const originalClass = btn.className;
            
            // Aplica o feedback (Fica verde e muda texto)
            btn.innerHTML = '✓ Copied!';
            btn.className = "px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-xs font-medium text-white transition-all flex items-center gap-1 transform scale-105";
            
            // Reseta depois de 2 segundos
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.className = originalClass;
            }, 2000);
        });
    }

    function downloadCode() {
        const lang = document.getElementById('language').value;
        const className = document.getElementById('className').value.trim() || 'MyClass';
        const output = document.getElementById('output').innerText;
        const ext = { csharp: 'cs', kotlin: 'kt', typescript: 'ts', java: 'java', php: 'php' };
        const blob = new Blob([output], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${className}Test.${ext[lang]}`;
        a.click();
    }

    function openModal() { document.getElementById('modal').classList.remove('hidden'); document.getElementById('modal').classList.add('flex'); }
    function closeModal() { document.getElementById('modal').classList.add('hidden'); document.getElementById('modal').classList.remove('flex'); }
    
    function copyModalExample() {
        const example = `{\n  "lang": "csharp",\n  "class": "PaymentService",\n  "method": "Process",\n  "cases": [\n    "Should_Return_True_If_Valid",\n    "Should_Throw_Exception_If_Offline"\n  ]\n}`;
        navigator.clipboard.writeText(example).then(() => {
            const btn = event.target; // Captura o botão que foi clicado
            const original = btn.textContent;
            btn.textContent = '✓ Copied!';
            setTimeout(() => btn.textContent = original, 2000);
        });
    }

    async function joinWaitlist() {
        const emailInput = document.getElementById('waitlistEmail');
        const email = emailInput.value.trim();
        const container = document.getElementById('waitlist-container');

        // Validação simples de e-mail
        if (!email || !email.includes('@') || !email.includes('.')) {
            alert('Por favor, insira um e-mail válido.');
            return;
        }

        // Feedback visual de "Carregando"
        const originalContent = container.innerHTML;
        container.innerHTML = '<div class="text-purple-400 animate-pulse font-mono">Connecting to OrchAxon mainframe...</div>';

        try {
            // Envia para o Supabase
            // IMPORTANTE: Usa as mesmas constantes CONFIG.SUPABASE_URL que já existem no seu script
            // Se você usou variáveis diferentes no tracker, ajuste aqui.
            // Vou assumir que você tem um client 'supabase' criado ou vai usar fetch puro:
            
            await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, { // <--- Usa a constante global que já definimos
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY, // <--- Usa a constante global
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({ 
                    email: email,
                    project_name: 'autotest-cli'
                })
            });

            // Sucesso!
            container.innerHTML = `
                <div class="bg-green-500/10 border border-green-500/50 p-4 rounded-lg text-green-400">
                    <p class="font-bold flex items-center justify-center gap-2">
                        <span>🚀</span> You're on the list!
                    </p>
                    <p class="text-xs text-green-500/70 mt-1">We'll notify you when the CLI drops.</p>
                </div>
            `;

        } catch (error) {
            console.error(error);
            container.innerHTML = originalContent; // Restaura o form
            alert('Erro ao entrar na lista. Tente novamente.');
        }
    }
    document.getElementById('modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });

    // Init
    addCase('Should return expected result');
    updateLangBadge();