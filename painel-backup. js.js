import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Configuração do Supabase
const SUPABASE_URL = 'https://amcmuqdcjkyrzdjeoifl.supabase.co';

const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_9d9mwTzubX6O_709D0QAbQ_VsYZ9NKM';

const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

// Verificar se existe usuário autenticado
async function protegerPainel() {
  

    const { data, error } = await supabaseClient.auth.getSession();

    if (error || !data.session) {
        window.location.replace("index.html");
        return;
    }

    console.log("Painel autorizado:", data.session.user.email);
}
// FUNÇÃO PARA LISTAR PRODUTOS
async function listarProdutos() {
    const lista = document.getElementById("lista-produtos");

    if (!lista) return;

    lista.textContent = "Carregando produtos...";

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        lista.textContent = "Usuário não autenticado.";
        return;
    }

    const { data, error } = await supabaseClient
        .from("produtos")
        .select("*")
        .eq("user_id", user.id)
        .order("id", { ascending: false });

    if (error) {
        console.error(error);
        lista.textContent = "Erro ao carregar produtos.";
        return;
    }

    lista.innerHTML = "";

    if (data.length === 0) {
        lista.textContent = "Nenhum produto cadastrado ainda.";
        return;
    }

    data.forEach(produto => {
        const item = document.createElement("div");

        item.textContent = produto.nome +
            " | Código: " + (produto.codigo || "-") +
            " | Quantidade: " + produto.quantidade +
            " | Preço: R$ " + produto.preco;

        lista.appendChild(item);
    });
}

protegerPainel();
// Função para sair do sistema
document.querySelector(".btn-sair").addEventListener("click", async () => {

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        alert("Erro ao sair do sistema.");
        console.error(error);
        return;
    }

    window.location.href = "index.html";

});
// NAVEGAÇÃO DO MENU LATERAL

const conteudoPrincipal = document.querySelector("#conteudo-principal");

// Guardar o conteúdo original do painel
const painelOriginal = conteudoPrincipal.innerHTML;

const paginas = {
    produtos: ["Produtos", "Aqui ficará o cadastro e a listagem de produtos."],
    estoque: ["Estoque", "Aqui ficará o controle de entrada e saída de mercadorias."],
    vendas: ["Vendas", "Aqui ficará o registro das vendas."],
    clientes: ["Clientes", "Aqui ficará o cadastro de clientes."],
    financeiro: ["Financeiro", "Aqui ficará o controle financeiro da loja."],
    relatorios: ["Relatórios", "Aqui ficarão os relatórios da loja."],
    configuracoes: ["Configurações", "Aqui ficarão as configurações do sistema."]
};


document.querySelectorAll(".menu a[data-pagina]").forEach(link => {
    link.addEventListener("click", (event) => {
        event.preventDefault();

        const pagina = link.dataset.pagina;

        document.querySelectorAll(".menu a").forEach(item => {
            item.classList.remove("ativo");
        });
        link.classList.add("ativo");

        if (pagina === "painel") {
            conteudoPrincipal.innerHTML = painelOriginal;
            return;
        }
if (pagina === "produtos") {
    conteudoPrincipal.innerHTML = `
        <header class="topo">
            <h2>Cadastro de Produtos</h2>
            <p>Gerencie os produtos da sua loja.</p>
        </header>

        <section class="bloco">
            <h3>Adicionar novo produto</h3>

            <form id="form-produto">

    <input type="text" id="nome" placeholder="Nome do produto" required>
                <input type="text" id="codigo" placeholder="Código">

                <input type="text" id="categoria" placeholder="Categoria">

                <input type="text" id="marca" placeholder="Marca">

                <input type="text" id="modelo" placeholder="Modelo">

                <input type="number" id="quantidade" placeholder="Quantidade">

                <input type="number" id="preco" placeholder="Preço de venda" step="0.01">

                <button type="submit">Salvar Produto</button>

            </form>
        </section>

        <section class="bloco">
            <h3>Produtos cadastrados</h3>
            <div id="lista-produtos">
                Carregando produtos...
            </div>
        </section>
    `;
const formulario = document.getElementById("form-produto");

formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    const { data: usuario, error: erroUsuario } =
        await supabaseClient.auth.getUser();

    if (erroUsuario || !usuario.user) {
        alert("Faça login novamente.");
        return;
    }

    const novoProduto = {
        nome: document.getElementById("nome").value.trim(),
        codigo: document.getElementById("codigo").value.trim(),
        categoria: document.getElementById("categoria").value.trim(),
        marca: document.getElementById("marca").value.trim(),
        modelo: document.getElementById("modelo").value.trim(),
        quantidade: Number(document.getElementById("quantidade").value),
        preco: Number(document.getElementById("preco").value),
        user_id: usuario.user.id
    };

    const { error } = await supabaseClient
        .from("produtos")
        .insert(novoProduto);

    if (error) {
        console.error("Erro ao salvar produto:", error);
        alert("Erro ao salvar: " + error.message);
        return;
    }

    alert("Produto cadastrado com sucesso!");

    formulario.reset();

    await listarProdutos();
});
    listarProdutos();
    return;
}
// MÓDULO DE ESTOQUE
if (pagina === "estoque") {

    conteudoPrincipal.innerHTML = `
        <header class="topo">
            <h2>Controle de Estoque</h2>
            <p>Gerencie entradas e saídas de mercadorias.</p>
        </header>

        <section class="bloco">
            <h3>Movimentar estoque</h3>

            <form id="form-estoque">

                <select id="produto-estoque" required>
                    <option value="">Selecione o produto</option>
                </select>

                <select id="tipo-movimento" required>
                    <option value="entrada">Entrada</option>
                    <option value="saida">Saída</option>
                </select>

                <input
                    type="number"
                    id="quantidade-estoque"
                    placeholder="Quantidade"
                    min="1"
                    step="1"
                    required
                >

                <input
                    type="text"
                    id="observacao-estoque"
                    placeholder="Observação (opcional)"
                >

                <button type="submit">Registrar movimentação</button>
            </form>
        </section>

        <section class="bloco">
            <h3>Estoque atual</h3>
            <div id="lista-estoque">Carregando...</div>
        </section>

        <section class="bloco">
            <h3>Histórico de movimentações</h3>
            <div id="historico-estoque">Carregando...</div>
        </section>
    `;

carregarProdutosEstoque();
     // CARREGAR PRODUTOS NO CAMPO DE ESTOQUE
async function carregarProdutosEstoque() {

    const seletor = document.getElementById("produto-estoque");

    const { data: usuario, error: erroUsuario } =
        await supabaseClient.auth.getUser();

    if (erroUsuario || !usuario.user) {
        seletor.innerHTML = '<option value="">Usuário não autenticado</option>';
        return;
    }

    const { data, error } = await supabaseClient
        .from("produtos")
        .select("id, nome, quantidade")
        .eq("user_id", usuario.user.id);

    if (error) {
        console.error("Erro ao buscar produtos:", error);
        seletor.innerHTML = '<option value="">Erro ao carregar produtos</option>';
        return;
    }

   seletor.innerHTML = '<option value="">Selecione o produto</option>';
   (data || []).forEach(produto => {
    const opcao = document.createElement("option");
    opcao.value = produto.id;
    opcao.textContent = produto.nome + " (Estoque: " + produto.quantidade + ")";
    seletor.appendChild(opcao);
});

}

// REGISTRAR MOVIMENTAÇÃO DE ESTOQUE

const formularioEstoque = document.getElementById("form-estoque");

formularioEstoque.addEventListener("submit", async (event) => {
    event.preventDefault();

    const produtoId = document.getElementById("produto-estoque").value;
    const tipo = document.getElementById("tipo-movimento").value;
    const quantidade = Number(document.getElementById("quantidade-estoque").value);
    const observacao = document.getElementById("observacao-estoque").value;

    if (!produtoId || !Number.isInteger(quantidade) || quantidade <= 0) {
        alert("Selecione um produto e informe uma quantidade válida.");
        return;
    }

    const { data: usuario, error: erroUsuario } =
        await supabaseClient.auth.getUser();

    if (erroUsuario || !usuario.user) {
        alert("Usuário não autenticado.");
        return;
    }

    const user = usuario.user;

    // Buscar produto
    const { data: produto, error: erroProduto } = await supabaseClient
        .from("produtos")
        .select("id, nome, quantidade")
        .eq("id", produtoId)
        .eq("user_id", user.id)
        .single();

    if (erroProduto || !produto) {
        alert("Erro ao localizar o produto.");
        return;
    }

    const estoqueAtual = Number(produto.quantidade || 0);

    let novoEstoque;

    if (tipo === "saida") {
        if (quantidade > estoqueAtual) {
            alert("Estoque insuficiente!");
            return;
        }

        novoEstoque = estoqueAtual - quantidade;
    } else {
        novoEstoque = estoqueAtual + quantidade;
    }

    // Registrar movimentação
    const { data: movimento, error: erroMovimento } =
        await supabaseClient
            .from("movimentacoes_estoque")
            .insert({
                produto_id: produto.id,
                user_id: user.id,
                tipo: tipo,
                quantidade: quantidade,
                observacao: observacao
            })
            .select("id")
            .single();

    if (erroMovimento) {
        console.error(erroMovimento);
        alert("Erro ao registrar movimentação.");
        return;
    }

    // Atualizar quantidade do produto
    const { error: erroAtualizacao } = await supabaseClient
        .from("produtos")
        .update({ quantidade: novoEstoque })
        .eq("id", produto.id)
        .eq("user_id", user.id);

    if (erroAtualizacao) {
        console.error(erroAtualizacao);

        await supabaseClient
            .from("movimentacoes_estoque")
            .delete()
            .eq("id", movimento.id)
            .eq("user_id", user.id);

        alert("Não foi possível atualizar o estoque.");
        return;
    }

    alert("Movimentação registrada com sucesso!");

    formularioEstoque.reset();

    await carregarProdutosEstoque();
    await atualizarEstoqueAtual();
    await atualizarHistoricoEstoque();
});

// CARREGAR ESTOQUE ATUAL
async function atualizarEstoqueAtual() {
    const lista = document.getElementById("lista-estoque");

    const { data: usuario } = await supabaseClient.auth.getUser();

    if (!usuario.user) return;

    const { data, error } = await supabaseClient
        .from("produtos")
        .select("nome, quantidade")
        .eq("user_id", usuario.user.id);

    if (error) {
        lista.textContent = "Erro ao carregar estoque.";
        console.error(error);
        return;
    }

  lista.innerHTML = data.map(produto =>
    "<p>" + produto.nome + " - Estoque: " + produto.quantidade + "</p>"
).join("");
}

// CARREGAR HISTÓRICO
async function atualizarHistoricoEstoque() {
    const lista = document.getElementById("historico-estoque");

    const { data: usuario } = await supabaseClient.auth.getUser();

    if (!usuario.user) return;

    const { data, error } = await supabaseClient
        .from("movimentacoes_estoque")
        .select("tipo, quantidade, observacao, created_at, produto_id")
        .eq("user_id", usuario.user.id)
        .order("created_at", { ascending: false });

    if (error) {
        lista.textContent = "Erro ao carregar histórico.";
        console.error(error);
        return;
    }

    const { data: produtos } = await supabaseClient
        .from("produtos")
        .select("id, nome")
        .eq("user_id", usuario.user.id);

    const nomes = Object.fromEntries(
        (produtos || []).map(p => [p.id, p.nome])
    );

    lista.innerHTML = data.map(item => `
        <p>
            ${item.tipo.toUpperCase()} —
            ${nomes[item.produto_id] || "Produto"}:
            ${item.quantidade} unidades
            ${item.observacao || ""}
        </p>
    `).join("") || "Nenhuma movimentação registrada.";
}

// CARREGAR INFORMAÇÕES INICIAIS
atualizarEstoqueAtual();
atualizarHistoricoEstoque();

    return;
}
        const informacao = paginas[pagina];
        // MÓDULO DE VENDAS
if (pagina === "vendas") {
    conteudoPrincipal.innerHTML = `
        <header class="topo">
            <h2>Vendas</h2>
            <p>Registre e acompanhe as vendas da VIIH STORE.</p>
        </header>

        <section class="bloco">
            <h3>Registrar nova venda</h3>

            <form id="form-venda">

                <label>Cliente</label>
                <select id="cliente-venda">
                    <option value="">Selecione o cliente</option>
                </select>

                <label>Produto</label>
                <select id="produto-venda" required>
                    <option value="">Selecione o produto</option>
                </select>

                <label>Quantidade</label>
                <input
                    type="number"
                    id="quantidade-venda"
                    min="1"
                    step="1"
                    required
                >

                <label>Desconto</label>
                <input
                    type="number"
                    id="desconto-venda"
                    min="0"
                    step="0.01"
                    value="0"
                >

                <label>Forma de pagamento</label>
                <select id="pagamento-venda" required>
                    <option value="">Selecione</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Pix">Pix</option>
                    <option value="Cartão de crédito">Cartão de crédito</option>
                    <option value="Cartão de débito">Cartão de débito</option>
                </select>

                <label>Observação</label>
                <input
                    type="text"
                    id="observacao-venda"
                    placeholder="Observação (opcional)"
                >

                <h3 id="total-venda">Total: R$ 0,00</h3>

                <button type="submit">
                    Finalizar venda
                </button>

            </form>
        </section>

        <section class="bloco">
            <h3>Histórico de vendas</h3>
            <div id="historico-vendas">
                Carregando vendas...
            </div>
        </section>
    `;
// CARREGAR PRODUTOS NO CAMPO DE VENDAS
    async function carregarProdutosVenda() {
        const seletor = document.getElementById("produto-venda");

        const { data: usuario, error: erroUsuario } =
            await supabaseClient.auth.getUser();

        if (erroUsuario || !usuario.user) {
            seletor.innerHTML =
                '<option value="">Usuário não autenticado</option>';
            return;
        }

        const { data, error } = await supabaseClient
            .from("produtos")
            .select("id, nome, quantidade, preco")
            .eq("user_id", usuario.user.id);

        if (error) {
            console.error("Erro ao carregar produtos:", error);
            seletor.innerHTML =
                '<option value="">Erro ao carregar produtos</option>';
            return;
        }

        seletor.innerHTML =
            '<option value="">Selecione o produto</option>';

        (data || []).forEach(produto => {
            const opcao = document.createElement("option");
            opcao.value = produto.id;
            opcao.dataset.preco = produto.preco;
            opcao.textContent =
                produto.nome + " - Estoque: " +
                produto.quantidade + " - R$ " +
                Number(produto.preco).toFixed(2);

            seletor.appendChild(opcao);
        });
    }

    carregarProdutosVenda();
    // CALCULAR TOTAL AUTOMATICAMENTE
    const produtoVenda = document.getElementById("produto-venda");
    const quantidadeVenda = document.getElementById("quantidade-venda");
    const descontoVenda = document.getElementById("desconto-venda");
    const totalVenda = document.getElementById("total-venda");

    function atualizarTotalVenda() {
        const preco = Number(
            produtoVenda.selectedOptions[0]?.dataset.preco || 0
        );

        const quantidade = Number(quantidadeVenda.value || 0);
        const desconto = Math.max(0, Number(descontoVenda.value || 0));

        const total = Math.max(0, (preco * quantidade) - desconto);

        totalVenda.textContent = "Total: " +
            total.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });
    }

    produtoVenda.addEventListener("change", atualizarTotalVenda);
    quantidadeVenda.addEventListener("input", atualizarTotalVenda);
    descontoVenda.addEventListener("input", atualizarTotalVenda);
    return;
}
// MODULO DE CLIENTES 
        if (!informacao) return;

        conteudoPrincipal.innerHTML = `
            <header class="topo">
                <h2>${informacao[0]}</h2>
                <p>${informacao[1]}</p>
            </header>
        `;
    });

});