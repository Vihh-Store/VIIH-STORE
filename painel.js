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
// CARREGAR CLIENTES NO CAMPO DE VENDAS
async function carregarClientesVenda() {
    const seletor = document.getElementById("cliente-venda");

    const { data: usuario } = await supabaseClient.auth.getUser();

    if (!usuario.user) {
        seletor.innerHTML = '<option value="">Usuário não autenticado</option>';
        return;
    }

    const { data, error } = await supabaseClient
        .from("clientes")
        .select("id, nome")
        .eq("user_id", usuario.user.id);

    if (error) {
        console.error("Erro ao carregar clientes:", error);
        seletor.innerHTML = '<option value="">Erro ao carregar clientes</option>';
        return;
    }

    seletor.innerHTML = '<option value="">Selecione o cliente</option>';

    (data || []).forEach(cliente => {
        const opcao = document.createElement("option");
        opcao.value = cliente.id;
        opcao.textContent = cliente.nome;
        seletor.appendChild(opcao);
    });
}
    carregarProdutosVenda();
    carregarClientesVenda();
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
// FINALIZAR E REGISTRAR VENDA
const formularioVenda = document.getElementById("form-venda");

formularioVenda.addEventListener("submit", async (event) => {
    event.preventDefault();

    const botao = formularioVenda.querySelector('button[type="submit"]');
    botao.disabled = true;

    try {
        const { data: usuario, error: erroUsuario } =
            await supabaseClient.auth.getUser();

        if (erroUsuario || !usuario.user) {
            throw new Error("Usuário não autenticado.");
        }

        const user = usuario.user;

        const clienteId = document.getElementById("cliente-venda").value;
        const produtoId = produtoVenda.value;
        const quantidade = Number(quantidadeVenda.value);
        const desconto = Number(descontoVenda.value || 0);
        const pagamento = document.getElementById("pagamento-venda").value;
        const observacao = document.getElementById("observacao-venda").value;

        if (!produtoId || !Number.isInteger(quantidade) || quantidade <= 0) {
            throw new Error("Selecione um produto e informe uma quantidade válida.");
        }

        if (!pagamento) {
            throw new Error("Selecione a forma de pagamento.");
        }

        // Buscar produto no banco
        const { data: produto, error: erroProduto } = await supabaseClient
            .from("produtos")
            .select("id, nome, quantidade, preco")
            .eq("id", produtoId)
            .eq("user_id", user.id)
            .single();

        if (erroProduto || !produto) {
            throw new Error("Não foi possível localizar o produto.");
        }

        const estoqueAtual = Number(produto.quantidade);
        const preco = Number(produto.preco);
        const subtotal = preco * quantidade;

        if (quantidade > estoqueAtual) {
            throw new Error("Estoque insuficiente para realizar a venda.");
        }

        if (!Number.isFinite(desconto) || desconto < 0 || desconto > subtotal) {
            throw new Error("Informe um desconto válido.");
        }

        const total = subtotal - desconto;

        // Registrar venda
        const { data: venda, error: erroVenda } = await supabaseClient
            .from("vendas")
            .insert({
                cliente_id: clienteId || null,
                user_id: user.id,
                subtotal: subtotal,
                desconto: desconto,
                total: total,
                forma_pagamento: pagamento,
                observacao: observacao
            })
            .select("id")
            .single();

        if (erroVenda) {
            throw erroVenda;
        }

        // Registrar item da venda
        const { error: erroItem } = await supabaseClient
            .from("itens_venda")
            .insert({
                venda_id: venda.id,
                produto_id: produto.id,
                user_id: user.id,
                nome_produto: produto.nome,
                quantidade: quantidade,
                preco_unitario: preco,
                subtotal: subtotal
            });

        if (erroItem) {
            console.error(erroItem);

            await supabaseClient
                .from("vendas")
                .delete()
                .eq("id", venda.id)
                .eq("user_id", user.id);

            throw erroItem;
        }

        // Atualizar estoque
        const { error: erroEstoque } = await supabaseClient
            .from("produtos")
            .update({
                quantidade: estoqueAtual - quantidade
            })
            .eq("id", produto.id)
            .eq("user_id", user.id);

        if (erroEstoque) {
            console.error(erroEstoque);

            await supabaseClient
                .from("itens_venda")
                .delete()
                .eq("venda_id", venda.id)
                .eq("user_id", user.id);

            await supabaseClient
                .from("vendas")
                .delete()
                .eq("id", venda.id)
                .eq("user_id", user.id);

            throw erroEstoque;
        }

        alert("Venda realizada com sucesso!");

        formularioVenda.reset();

        atualizarTotalVenda();
        await carregarProdutosVenda();

    } catch (erro) {
        console.error("Erro ao finalizar venda:", erro);
        alert("Não foi possível finalizar a venda: " + erro.message);

    } finally {
        botao.disabled = false;
    }
});
// CARREGAR HISTÓRICO DE VENDAS
async function carregarHistoricoVendas() {
    const lista = document.getElementById("historico-vendas");

    lista.textContent = "Carregando vendas...";

    const { data: usuario } = await supabaseClient.auth.getUser();

    if (!usuario.user) {
        lista.textContent = "Usuário não autenticado.";
        return;
    }

    const { data: vendas, error } = await supabaseClient
        .from("vendas")
        .select("*")
        .eq("user_id", usuario.user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        lista.textContent = "Erro ao carregar vendas.";
        return;
    }

    if (!vendas || vendas.length === 0) {
        lista.textContent = "Nenhuma venda registrada.";
        return;
    }

    const { data: clientes } = await supabaseClient
        .from("clientes")
        .select("id, nome")
        .eq("user_id", usuario.user.id);

    const ids = vendas.map(v => v.id);

    const { data: itens } = await supabaseClient
        .from("itens_venda")
        .select("*")
        .in("venda_id", ids);

    const nomesClientes = Object.fromEntries(
        (clientes || []).map(c => [c.id, c.nome])
    );

    lista.innerHTML = "";

    vendas.forEach(venda => {
        const bloco = document.createElement("div");
        bloco.className = "item-lista";

        const cliente = document.createElement("strong");
        cliente.textContent =
            "Cliente: " + (nomesClientes[venda.cliente_id] || "Não informado");

        bloco.appendChild(cliente);

        (itens || [])
            .filter(item => item.venda_id === venda.id)
            .forEach(item => {
                const produto = document.createElement("p");
                produto.textContent =
                    item.nome_produto + " - Quantidade: " +
                    item.quantidade;

                bloco.appendChild(produto);
            });

        const total = document.createElement("p");
        total.textContent =
            "Total: " + Number(venda.total).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });

        bloco.appendChild(total);

        const data = document.createElement("p");
        data.textContent =
            "Data: " + new Date(venda.created_at).toLocaleString("pt-BR");

        bloco.appendChild(data);

        const botaoDetalhes = document.createElement("button");

botaoDetalhes.textContent = "Ver detalhes";

botaoDetalhes.addEventListener("click", () => {

    const itensVenda = (itens || [])
        .filter(item => item.venda_id === venda.id);

    const produtosTexto = itensVenda.map(item =>
        `${item.nome_produto}
Quantidade: ${item.quantidade}
Preço unitário: ${Number(item.preco_unitario).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })}`
    ).join("\n\n");

    const detalhes = `
DETALHES DA VENDA

Cliente: ${nomesClientes[venda.cliente_id] || "Não informado"}

Produtos:
${produtosTexto}

Subtotal: ${Number(venda.subtotal).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}

Desconto: ${Number(venda.desconto).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}

Total: ${Number(venda.total).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}

Pagamento: ${venda.forma_pagamento || "Não informado"}

Observação: ${venda.observacao || "Nenhuma"}

Data: ${new Date(venda.created_at).toLocaleString("pt-BR")}
`;

    const modal = document.createElement("div");

Object.assign(modal.style, {
    position: "fixed",
    inset: "0",
    background: "rgba(0,0,0,0.65)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: "9999",
    padding: "20px"
});

const caixa = document.createElement("div");

Object.assign(caixa.style, {
    background: "#ffffff",
    color: "#333333",
    width: "100%",
    maxWidth: "500px",
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 10px 35px rgba(0,0,0,0.3)",
    maxHeight: "85vh",
    overflowY: "auto"
});

const titulo = document.createElement("h2");
titulo.textContent = "VIIH STORE | Detalhes da venda";
titulo.style.color = "#c02670";

const conteudo = document.createElement("pre");
conteudo.textContent = detalhes;

Object.assign(conteudo.style, {
    whiteSpace: "pre-wrap",
    fontFamily: "Arial, sans-serif",
    fontSize: "15px",
    lineHeight: "1.7"
});

const fechar = document.createElement("button");
fechar.textContent = "Fechar";

Object.assign(fechar.style, {
    background: "#c02670",
    color: "#ffffff",
    border: "none",
    padding: "12px 25px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    marginTop: "15px"
});

fechar.addEventListener("click", () => {
    modal.remove();
});

caixa.appendChild(titulo);
caixa.appendChild(conteudo);
caixa.appendChild(fechar);
modal.appendChild(caixa);
document.body.appendChild(modal);
});

bloco.appendChild(botaoDetalhes);
        lista.appendChild(bloco);
    });
}

carregarHistoricoVendas();
    return;
}

       
// MÓDULO DE CLIENTES
if (pagina === "clientes") {

    conteudoPrincipal.innerHTML = `
        <header class="topo">
            <h2>Cadastro de Clientes</h2>
            <p>Gerencie os clientes da VIIH STORE.</p>
        </header>

        <section class="bloco">
            <h3>Novo Cliente</h3>

            <form id="form-cliente">

                <input type="text" id="nome-cliente"
                    placeholder="Nome completo" required>

                <input type="text" id="telefone-cliente"
                    placeholder="Telefone">

                <input type="email" id="email-cliente"
                    placeholder="E-mail">

                <input type="text" id="endereco-cliente"
                    placeholder="Endereço">

                <input type="text" id="observacoes-cliente"
                    placeholder="Observações">

                <button type="submit">Cadastrar Cliente</button>
            </form>
        </section>

        <section class="bloco">
            <h3>Clientes cadastrados</h3>
            <div id="lista-clientes">Carregando...</div>
        </section>
    `;

    async function carregarClientes() {
        const { data: usuario } =
            await supabaseClient.auth.getUser();

        if (!usuario.user) return;

        const { data, error } = await supabaseClient
            .from("clientes")
            .select("*")
            .eq("user_id", usuario.user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error(error);
            return;
        }

        const lista = document.getElementById("lista-clientes");

        lista.innerHTML = (data || []).map(cliente => `
            <div class="item-lista">
                <strong>${cliente.nome}</strong>
                <p>Telefone: ${cliente.telefone || "-"}</p>
                <p>E-mail: ${cliente.email || "-"}</p>
            </div>
        `).join("") || "Nenhum cliente cadastrado.";
    }

    document.getElementById("form-cliente")
        .addEventListener("submit", async (event) => {

            event.preventDefault();

            const { data: usuario } =
                await supabaseClient.auth.getUser();

            if (!usuario.user) return;

            const { error } = await supabaseClient
                .from("clientes")
                .insert([{
                    nome: document.getElementById("nome-cliente").value,
                    telefone: document.getElementById("telefone-cliente").value,
                    email: document.getElementById("email-cliente").value,
                    endereco: document.getElementById("endereco-cliente").value,
                    observacoes: document.getElementById("observacoes-cliente").value,
                    user_id: usuario.user.id
                }]);

            if (error) {
                alert("Erro ao cadastrar cliente.");
                console.error(error);
                return;
            }

            alert("Cliente cadastrado com sucesso!");

            event.target.reset();

            carregarClientes();
        });

    carregarClientes();

    return;
}
if (pagina === "financeiro") {
    conteudoPrincipal.innerHTML = `
        <header class="topo">
            <h2>Financeiro</h2>
            <p>Controle financeiro da VIIH STORE</p>
        </header>

        <section class="bloco">
            <h3>Resumo financeiro</h3>
            <div id="resumo-financeiro">
                Carregando informações...
            </div>
        </section>

        <section class="bloco">
            <h3>Histórico financeiro</h3>
            <div id="historico-financeiro">
                Carregando vendas...
            </div>
        </section>
    `;

    async function carregarFinanceiro() {
        const resumo = document.getElementById("resumo-financeiro");
        const historico = document.getElementById("historico-financeiro");

        const { data: { user }, error: erroUsuario } =
            await supabaseClient.auth.getUser();

        if (erroUsuario || !user) {
            resumo.textContent = "Usuário não autenticado.";
            return;
        }

        const { data: vendas, error } = await supabaseClient
            .from("vendas")
            .select("total, created_at, forma_pagamento")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error(error);
            resumo.textContent = "Erro ao carregar financeiro.";
            return;
        }

        const lista = vendas || [];
        const hoje = new Date();

        const vendasHoje = lista.filter(v => {
            const data = new Date(v.created_at);
            return data.toDateString() === hoje.toDateString();
        });

        const vendasMes = lista.filter(v => {
            const data = new Date(v.created_at);
            return data.getMonth() === hoje.getMonth() &&
                   data.getFullYear() === hoje.getFullYear();
        });

        const somar = itens =>
            itens.reduce((total, v) => total + Number(v.total || 0), 0);

        const moeda = valor =>
            valor.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });

        resumo.innerHTML = `
            <p>Total de vendas: <strong>${lista.length}</strong></p>
            <p>Faturamento de hoje: <strong>${moeda(somar(vendasHoje))}</strong></p>
            <p>Faturamento do mês: <strong>${moeda(somar(vendasMes))}</strong></p>
            <p>Faturamento total: <strong>${moeda(somar(lista))}</strong></p>
        `;

        historico.innerHTML = "";

        if (lista.length === 0) {
            historico.textContent = "Nenhuma venda registrada.";
            return;
        }

        lista.forEach(venda => {
            const item = document.createElement("div");
            item.className = "item-lista";

            item.textContent =
                `${new Date(venda.created_at).toLocaleString("pt-BR")} | ` +
                `${venda.forma_pagamento || "Não informado"} | ` +
                moeda(Number(venda.total || 0));

            historico.appendChild(item);
        });
    }

    carregarFinanceiro();
    return;
}

// MÓDULO DE RELATÓRIOS
if (pagina === "relatorios") {
    conteudoPrincipal.innerHTML = `
        <header class="topo">
            <h2>Relatórios</h2>
            <p>Relatórios de vendas da VIIH STORE.</p>
        </header>

        <section class="bloco">
            <h3>Resumo de vendas</h3>
            <div id="resumo-relatorios">
                Carregando informações...
            </div>
        </section>

        <section class="bloco">
            <h3>Histórico de vendas</h3>
            <div id="lista-relatorios">
                Carregando vendas...
            </div>
        </section>
    `;

    async function carregarRelatorios() {

        const moeda = valor => Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
});

        const resumo = document.getElementById("resumo-relatorios");
        const lista = document.getElementById("lista-relatorios");

        const { data: { user } } =
            await supabaseClient.auth.getUser();

        if (!user) {
            resumo.textContent = "Usuário não autenticado.";
            return;
        }

        const { data: vendas, error } = await supabaseClient
            .from("vendas")
            .select("total, created_at, forma_pagamento")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            resumo.textContent = "Erro ao carregar relatórios.";
            console.error(error);
            return;
        }

        const dados = vendas || [];

        const total = dados.reduce(
            (soma, venda) => soma + Number(venda.total || 0), 0
        );

        const hoje = new Date().toLocaleDateString("pt-BR");

        const vendasHoje = dados.filter(venda =>
            new Date(venda.created_at).toLocaleDateString("pt-BR") === hoje
        );

        const faturamentoHoje = vendasHoje.reduce(
            (soma, venda) => soma + Number(venda.total || 0), 0
        );

        resumo.innerHTML = `
            <p>Total de vendas: <strong>${dados.length}</strong></p>
            <p>Faturamento total: <strong>${moeda(total)}</strong></p>
            <p>Vendas de hoje: <strong>${vendasHoje.length}</strong></p>
            <p>Faturamento de hoje: <strong>${moeda(faturamentoHoje)}</strong></p>
        `;

        if (dados.length === 0) {
            lista.textContent = "Nenhuma venda registrada.";
            return;
        }

        lista.innerHTML = "";

        dados.forEach(venda => {
            const item = document.createElement("div");
            item.className = "item-lista";

           item.textContent =
    new Date(venda.created_at).toLocaleString("pt-BR") + " | " +
    (venda.forma_pagamento || "Não informado") + " | " +
    moeda(Number(venda.total || 0));

            lista.appendChild(item);
        });
    }

    carregarRelatorios();
    return;
}if (!informacao) return;

if (pagina === "configuracoes") {
    conteudoPrincipal.innerHTML = `
        <header class="topo">
            <h2>Configurações</h2>
            <p>Gerencie as configurações da VIIH STORE.</p>
        </header>

        <section class="bloco">
            <h3>Dados da loja</h3>

            <form id="form-configuracoes">
                <input type="text" id="nome-loja"
                    placeholder="Nome da loja" value="VIIH STORE">

                <input type="text" id="telefone-loja"
                    placeholder="Telefone">

                <input type="text" id="endereco-loja"
                    placeholder="Endereço">

                <button type="submit">Salvar configurações</button>
            </form>
        </section>
    `;

    const configSalvas = JSON.parse(
    localStorage.getItem("viihStoreConfig") || "{}"
);

document.getElementById("nome-loja").value =
    configSalvas.nome || "VIIH STORE";

document.getElementById("telefone-loja").value =
    configSalvas.telefone || "";

document.getElementById("endereco-loja").value =
    configSalvas.endereco || "";
    
    const formConfig = document.getElementById("form-configuracoes");

formConfig.addEventListener("submit", (event) => {
    event.preventDefault();

    const configuracoes = {
        nome: document.getElementById("nome-loja").value,
        telefone: document.getElementById("telefone-loja").value,
        endereco: document.getElementById("endereco-loja").value
    };

    localStorage.setItem(
        "viihStoreConfig",
        JSON.stringify(configuracoes)
    );

    alert("Configurações salvas com sucesso!");
});

    return;
}

        conteudoPrincipal.innerHTML = `
            <header class="topo">
                <h2>${informacao[0]}</h2>
                <p>${informacao[1]}</p>
            </header>
        `;
    });

});