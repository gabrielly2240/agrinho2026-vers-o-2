document.addEventListener('DOMContentLoaded', () => {
    const btnCalcular = document.getElementById('btnCalcular');
    const toggleTheme = document.getElementById('toggleTheme');
    let meuGrafico = null; // Guarda a instância do gráfico para poder destruir/recriar

    // --- CONTROLE DE TEMA (CLARO/ESCURO) ---
    toggleTheme.addEventListener('click', () => {
        const atual = document.body.getAttribute('data-theme');
        if (atual === 'dark') {
            document.body.removeAttribute('data-theme');
        } else {
            document.body.setAttribute('data-theme', 'dark');
        }
        // Força a atualização do gráfico se ele já existir para ajustar as cores
        if (meuGrafico) atualizarGrafico();
    });

    // --- LÓGICA DO SIMULADOR ---
    btnCalcular.addEventListener('click', () => {
        const tipoCombustivel = document.getElementById('combustivel').value;
        const consumoPorHora = parseFloat(document.getElementById('consumo').value);
        const horasTrabalhadas = parseFloat(document.getElementById('horas').value);
        const divResultado = document.getElementById('resultado');

        if (!consumoPorHora || consumoPorHora <= 0 || !horasTrabalhadas || horasTrabalhadas <= 0) {
            alert("Por favor, preencha as informações com valores válidos acima de zero.");
            return;
        }

        // Fatores de emissão oficiais aproximados (kg CO2 por Litro)
        const FATOR_DIESEL = 2.68;
        const FATOR_BIODIESEL = 0.50; 
        const ABSORCAO_ARVORE_ANO = 7.5; // Média para árvores em crescimento

        const fatorAtual = (tipoCombustivel === 'diesel') ? FATOR_DIESEL : FATOR_BIODIESEL;
        
        // Cálculos para a situação atual
        const totalLitros = consumoPorHora * horasTrabalhadas;
        const emissaoAtual = totalLitros * fatorAtual;
        const arvoresNecessarias = Math.ceil(emissaoAtual / ABSORCAO_ARVORE_ANO);

        // Cálculos para o gráfico (Comparativo cenário Diesel vs Biodiesel)
        const emissaoCenarioDiesel = totalLitros * FATOR_DIESEL;
        const emissaoCenarioBiodiesel = totalLitros * FATOR_BIODIESEL;

        // Atualizar Textos
        document.getElementById('emissaoTexto').innerText = `${emissaoAtual.toLocaleString('pt-BR', {maximumFractionDigits: 1})} kg`;
        document.getElementById('arvoresTexto').innerText = `${arvoresNecessarias} Árvore(s)`;

        // Mostrar Resultados
        divResultado.classList.remove('hidden');

        // Renderizar ou atualizar o Gráfico
        renderizarGrafico(emissaoCenarioDiesel, emissaoCenarioBiodiesel);
    });

    function renderizarGrafico(dieselKg, biodieselKg) {
        const ctx = document.getElementById('graficoComparativo').getContext('2d');
        
        // Se o gráfico já existe, apaga para não sobrepor dados antigos
        if (meuGrafico) {
            meuGrafico.destroy();
        }

        const isDark = document.body.getAttribute('data-theme') === 'dark';
        const corTexto = isDark ? '#94a3b8' : '#4a5568';

        meuGrafico = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Diesel Comum', 'Biodiesel Eco'],
                datasets: [{
                    label: 'Emissão de CO₂ (kg)',
                    data: [dieselKg, biodieselKg],
                    backgroundColor: ['#ef4444', '#10b981'],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Comparativo de Emissões (kg CO₂)',
                        color: corTexto,
                        font: { weight: 'bold' }
                    }
                },
                scales: {
                    y: {
                        ticks: { color: corTexto },
                        grid: { color: isDark ? '#334155' : '#e2e8f0' }
                    },
                    x: {
                        ticks: { color: corTexto },
                        grid: { display: false }
                    }
                }
            }
        });
    }
});