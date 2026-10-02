const botaoTema = document.getElementById('botao-tema');
const campoTarefa = document.getElementById('campo-tarefa');
const botaoAdicionar = document.getElementById('botao-adicionar');
const listaTarefas = document.getElementById('lista-tarefas');
const contadorTarefas = document.getElementById('contador-tarefas');
const barraProgresso = document.getElementById('barra-progresso');
const textoPorcentagem = document.getElementById('texto-porcentagem');
const btnLimparConcluidas = document.getElementById('btn-limpar-concluidas');
const botoesFiltro = document.querySelectorAll('.filtro-btn');

let tarefas = JSON.parse(localStorage.getItem('minhas_tarefas')) || [];
let filtroAtual = 'todas';

document.addEventListener('DOMContentLoaded', () => {
    carregarTema();
    renderizarTarefas();
});

botaoTema.addEventListener('click', () => {
    document.body.classList.toggle('modo-escuro');
    const eModoEscuro = document.body.classList.contains('modo-escuro');
    localStorage.setItem('modo_escuro', eModoEscuro);
    atualizarIconeTema(eModoEscuro);
});

function carregarTema() {
    const eModoEscuro = localStorage.getItem('modo_escuro') === 'true';
    if (eModoEscuro) {
        document.body.classList.add('modo-escuro');
    }
    atualizarIconeTema(eModoEscuro);
}

function atualizarIconeTema(eModoEscuro) {
    const icone = botaoTema.querySelector('i');
    icone.className = eModoEscuro ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

botoesFiltro.forEach(btn => {
    btn.addEventListener('click', () => {
        botoesFiltro.forEach(b => b.classList.remove('ativo'));
        btn.classList.add('ativo');
        filtroAtual = btn.dataset.filtro;
        renderizarTarefas();
    });
});

botaoAdicionar.addEventListener('click', adicionarTarefa);
campoTarefa.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') adicionarTarefa();
});

function adicionarTarefa() {
    const textoTarefa = campoTarefa.value.trim();

    if (textoTarefa === '') {
        campoTarefa.focus();
        return;
    }

    const novaTarefa = {
        id: Date.now(),
        texto: textoTarefa,
        concluida: false
    };

    tarefas.push(novaTarefa);
    salvarERenderizar();

    campoTarefa.value = '';
    campoTarefa.focus();
}

function alternarConcluida(id) {
    tarefas = tarefas.map(t => t.id === id ? { ...t, concluida: !t.concluida } : t);
    salvarERenderizar();
}

function excluirTarefa(id, elementoDom) {
    elementoDom.classList.add('saindo');
    setTimeout(() => {
        tarefas = tarefas.filter(t => t.id !== id);
        salvarERenderizar();
    }, 300);
}

function ativarEdicao(tarefa, elementoTexto) {
    const inputEdicao = document.createElement('input');
    inputEdicao.type = 'text';
    inputEdicao.className = 'input-edicao';
    inputEdicao.value = tarefa.texto;

    elementoTexto.replaceWith(inputEdicao);
    inputEdicao.focus();

    const salvarEdicao = () => {
        const novoTexto = inputEdicao.value.trim();
        if (novoTexto !== '') {
            tarefa.texto = novoTexto;
            salvarERenderizar();
        } else {
            renderizarTarefas();
        }
    };

    inputEdicao.addEventListener('blur', salvarEdicao);
    inputEdicao.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') salvarEdicao();
    });
}

btnLimparConcluidas.addEventListener('click', () => {
    tarefas = tarefas.filter(t => !t.concluida);
    salvarERenderizar();
});

function salvarERenderizar() {
    localStorage.setItem('minhas_tarefas', JSON.stringify(tarefas));
    renderizarTarefas();
}

function renderizarTarefas() {
    listaTarefas.innerHTML = '';

    const tarefasFiltradas = tarefas.filter(t => {
        if (filtroAtual === 'pendentes') return !t.concluida;
        if (filtroAtual === 'concluidas') return t.concluida;
        return true;
    });

    tarefasFiltradas.forEach(tarefa => {
        const li = document.createElement('li');
        li.className = `item-tarefa ${tarefa.concluida ? 'concluida' : ''}`;

        li.innerHTML = `
            <span class="texto-tarefa" title="Clique duplo para editar">${escapeHtml(tarefa.texto)}</span>
            <div class="acoes-tarefa">
                <button class="botao-acao check" title="Marcar como ${tarefa.concluida ? 'pendente' : 'concluída'}">
                    <i class="fa-solid ${tarefa.concluida ? 'fa-circle-check' : 'fa-circle'}"></i>
                </button>
                <button class="botao-acao excluir" title="Excluir tarefa">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;

        const textoSpan = li.querySelector('.texto-tarefa');
        const botaoCheck = li.querySelector('.botao-acao.check');
        const botaoExcluir = li.querySelector('.botao-acao.excluir');

        textoSpan.addEventListener('dblclick', () => ativarEdicao(tarefa, textoSpan));
        botaoCheck.addEventListener('click', () => alternarConcluida(tarefa.id));
        botaoExcluir.addEventListener('click', () => excluirTarefa(tarefa.id, li));

        listaTarefas.appendChild(li);
    });

    atualizarEstatisticas();
}

function atualizarEstatisticas() {
    const total = tarefas.length;
    const concluidas = tarefas.filter(t => t.concluida).length;
    const porcentagem = total > 0 ? Math.round((concluidas / total) * 100) : 0;

    barraProgresso.style.width = `${porcentagem}%`;
    textoPorcentagem.textContent = `${porcentagem}%`;

    if (total === 0) {
        contadorTarefas.textContent = 'Nenhuma tarefa na lista';
    } else {
        contadorTarefas.textContent = `${concluidas} de ${total} concluída${concluidas !== 1 ? 's' : ''}`;
    }

    btnLimparConcluidas.style.display = concluidas > 0 ? 'block' : 'none';
}

function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}