import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Configuração do Supabase
const SUPABASE_URL = 'https://amcmuqdcjkyrzdjeoifl.supabase.co';

const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_9d9mwTzubX6O_709D0QAbQ_VsYZ9NKM';

// Criar conexão
const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

// Mensagem de retorno do login
const mensagem = document.createElement("p");
mensagem.id = "mensagemLogin";
mensagem.style.textAlign = "center";
mensagem.style.marginTop = "12px";

document.querySelector("#formLogin").appendChild(mensagem);

// Função de login
document.querySelector("#formLogin").addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.querySelector("#email").value.trim();
    const senha = document.querySelector("#senha").value;

    mensagem.textContent = "Verificando acesso...";
    mensagem.style.color = "#762b59";

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: senha
    });

    if (error) {
        mensagem.textContent = "E-mail ou senha incorretos. Tente novamente.";
        mensagem.style.color = "red";
        return;
    }

    mensagem.textContent = "Login realizado com sucesso!";
    mensagem.style.color = "green";

    console.log("Usuário autenticado:", data.user.email);

   window.location.href = "painel.html";
});

// Recuperação de senha
document.querySelector("#esqueciSenha").addEventListener("click", async (event) => {
    event.preventDefault();

    const email = document.querySelector("#email").value.trim();

    if (!email) {
        mensagem.textContent = "Digite seu e-mail para recuperar a senha.";
        mensagem.style.color = "red";
        return;
    }

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email);

    if (error) {
        mensagem.textContent = "Não foi possível enviar o e-mail: " + error.message;
        mensagem.style.color = "red";
        return;
    }

    mensagem.textContent = "Confira seu e-mail para redefinir sua senha.";
    mensagem.style.color = "green";
});