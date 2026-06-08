/**
 * Simulador EcoTrator - Lógica de Impacto e Interface
 * Projeto Agrinho 2026
 */

// --- MAPEAMENTO DE ELEMENTOS DO DOM (Cache para Performance) ---
const btnTheme = document.querySelector('.btn-theme');
const btnCalcular = document.getElementById('btnCalcular') || document.querySelector('.btn-primary');
const formSimulador = document.getElementById('simuladorForm');
const secaoResultado = document.getElementById('resultado');

const selectCombustivel = document.getElementById('combustivel');
const inputConsumo = document.getElementById('consumo');
const inputHoras = document.getElementById('horas');

const txtEmissao = document.getElementById('emissaoTexto');
const txtArvores = document.getElementById('arvoresTexto');
const canvasGrafico = document.getElementById('graficoComparativo');

// Instância global do Chart.js
let instanciaGrafico = null;

// --- CONFIGURAÇÕES DE CÁLCULO (Fatores Ecológicos) ---
const FATORES_EMISSAO = {
    diesel: 2.68,     // kg CO2 por litro de Diesel Comum
    biodiesel: 0.67   // kg CO2 equivalente líquido por litro de Biodiesel B20/100
};
const ABSORCAO_ARVORE_ANO = 15; // kg de CO2 que uma árvore absorve por ano

// --- CONTROLE DO MODO ESCURO ---
btnTheme.addEventListener('click', () => {
    const temaAtual = document.documentElement.getAttribute('data-theme');
    const novoTema = temaAtual === 'dark' ? 'light' : 'dark';
    
    if (novoTema === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }

    // Se o gráfico já existir, reconstrói para aplicar as cores do novo tema
    if (instanciaGrafico) {
        renderizarGrafico(
            instanciaGrafico.data.datasets[0].data[0],
            instanciaGrafico.data.datasets[0].data[1],
            selectCombustivel.value
        );
    }
});

// --- OPERAÇÃO DE CÁLCULO ---
const executarCalculo = () => {
    // Conversão e captura de valores
    const combustivel = selectCombustivel.value;
    const consumoPorHora = parseFloat(inputConsumo.value);
    const horasTrabalhadas = parseFloat(inputHoras.value);

    // Validação consistente com feedback visual nativo do HTML5
    if (!consumoPorHora || !horasTrabalhadas || consumoPorHora <= 0 || horasTrabalhadas <= 0) {
        alert("Por favor, insira valores válidos e maiores do que zero para o cálculo.");
        return;
    }

    // Processamento matemático
    const totalLitros = consumoPorHora * horasTrabalhadas;
    
    let emissaoFoco = 0;
    let emissaoComparativa = 0;

    if (combustivel === 'diesel') {
        emissaoFoco = totalLitros * FATORES_EMISSAO.diesel;
        emissaoComparativa = totalLitros * FATORES_EMISSAO.biodiesel;
    } else {
        emissaoFoco = totalLitros * FATORES_EMISSAO.biodiesel;
        emissaoComparativa = totalLitros * FATORES_EMISSAO.diesel;
    }

    const arvoresParaCompensar = Math.ceil(emissaoFoco / ABSORCAO_ARVORE_ANO);

    // Atualização da Interface do Usuário (UI)
    txtEmissao.textContent = `${emissaoFoco.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg CO₂`;
    txtArvores.textContent = `${arvoresParaCompensar} ${arvoresParaCompensar === 1 ? 'Árvore' : 'Árvores'}`;

    // Exibição animada/suave dos resultados
    secaoResultado.classList.remove('hidden');

    // Geração do Gráfico Adaptativo
    renderizarGrafico(emissaoFoco, emissaoComparativa, combustivel);
};

// --- RENDERIZAÇÃO DO GRÁFICO (CHART.JS) ---
const renderizarGrafico = (valorFoco, valorComp, tipoCombustivel) => {
    if (instanciaGrafico) {
        instanciaGrafico.destroy();
    }

    // Detectar cores dinâmicas com base no estado do tema atual
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const corTexto = isDark ? '#94a3b8' : '#64748b';
    const corGrade = isDark ? '#334155' : '#e2e8f0';

    const rótuloAtual = tipoCombustivel === 'diesel' ? 'Diesel Comum (Atual)' : 'Biodiesel (Atual)';
    const rótuloAlternativo = tipoCombustivel === 'diesel' ? 'Alternativa de Biodiesel' : 'Se utilizasse Diesel';

    const corBarraVermelha = '#d32f2f';
    const corBarraVerde = isDark ? '#4caf50' : '#2e7d32';

    const ctx = canvasGrafico.getContext('2d');
    instanciaGrafico = new Chart(ctx