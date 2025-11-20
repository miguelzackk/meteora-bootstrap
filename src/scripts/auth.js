// Gerenciamento de autenticação
class AuthManager {
  constructor() {
    this.usuarioLogado = null;
    this.carrinho = [];
    this.init();
  }

  init() {
    // Verificar se há usuário logado no localStorage
    const usuarioSalvo = localStorage.getItem("usuarioLogado");
    if (usuarioSalvo) {
      this.usuarioLogado = JSON.parse(usuarioSalvo);
      this.atualizarHeader();
    }

    // Carregar carrinho do localStorage
    const carrinhoSalvo = localStorage.getItem("carrinho");
    if (carrinhoSalvo) {
      this.carrinho = JSON.parse(carrinhoSalvo);
      this.atualizarContadorCarrinho();
    }

    // Configurar busca em todas as páginas
    this.configurarBusca();
  }

  // Configurar funcionalidade de busca
  configurarBusca() {
    const searchForms = document.querySelectorAll("form");
    searchForms.forEach((form) => {
      // Verificar se é um formulário de busca (tem input de search)
      const searchInput = form.querySelector('input[type="search"]');
      if (searchInput) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const termo = searchInput.value.trim();
          if (termo) {
            window.location.href = `busca.html?q=${encodeURIComponent(termo)}`;
          }
        });
      }
    });
  }

  // Funções do modal
  abrirModalLogin() {
    const modalLoginElement = document.getElementById("modalLogin");
    if (modalLoginElement) {
      const modalLogin = new bootstrap.Modal(modalLoginElement);
      modalLogin.show();
    }
  }

  mostrarCadastro() {
    const modalLogin = bootstrap.Modal.getInstance(
      document.getElementById("modalLogin")
    );
    if (modalLogin) {
      modalLogin.hide();
    }

    const modalCadastroElement = document.getElementById("modalCadastro");
    if (modalCadastroElement) {
      const modalCadastro = new bootstrap.Modal(modalCadastroElement);
      modalCadastro.show();
    }
  }

  mostrarLogin() {
    const modalCadastro = bootstrap.Modal.getInstance(
      document.getElementById("modalCadastro")
    );
    if (modalCadastro) {
      modalCadastro.hide();
    }

    const modalLoginElement = document.getElementById("modalLogin");
    if (modalLoginElement) {
      const modalLogin = new bootstrap.Modal(modalLoginElement);
      modalLogin.show();
    }
  }

  // Login
  async login(email, senha) {
    try {
      console.log("Tentando login com:", email);

      const response = await fetch("http://localhost:8000/api/login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          senha: senha,
        }),
      });

      console.log("Resposta recebida:", response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Dados recebidos:", data);

      if (data.success) {
        this.usuarioLogado = data.usuario;
        localStorage.setItem(
          "usuarioLogado",
          JSON.stringify(this.usuarioLogado)
        );
        this.atualizarHeader();

        // Fechar modal
        const modalLogin = bootstrap.Modal.getInstance(
          document.getElementById("modalLogin")
        );
        if (modalLogin) {
          modalLogin.hide();
        }

        // Mostrar mensagem de sucesso
        this.mostrarMensagem("Login realizado com sucesso!", "success");
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Erro no login:", error);
      return {
        success: false,
        message: "Erro de conexão: " + error.message,
      };
    }
  }

  // Cadastro
  async cadastrar(nome, sobrenome, email, senha) {
    try {
      console.log("Tentando cadastrar:", email);

      const response = await fetch("http://localhost:8000/api/cadastro.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          nome: nome,
          sobrenome: sobrenome,
          email: email,
          senha: senha,
        }),
      });

      console.log("Resposta recebida:", response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Dados recebidos:", data);

      if (data.success) {
        // Fechar modal
        const modalCadastro = bootstrap.Modal.getInstance(
          document.getElementById("modalCadastro")
        );
        if (modalCadastro) {
          modalCadastro.hide();
        }

        // Mostrar mensagem de sucesso e redirecionar para login
        this.mostrarMensagem(
          "Conta criada com sucesso! Faça login.",
          "success"
        );
        setTimeout(() => {
          this.mostrarLogin();
        }, 1500);

        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Erro no cadastro:", error);
      return {
        success: false,
        message: "Erro de conexão: " + error.message,
      };
    }
  }

  // Logout
  logout() {
    this.usuarioLogado = null;
    this.carrinho = [];
    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("carrinho");
    this.atualizarHeader();
    this.atualizarContadorCarrinho();
    this.mostrarMensagem("Logout realizado com sucesso!", "info");
  }

  // Atualizar header
  atualizarHeader() {
    const authButtons = document.getElementById("auth-buttons");
    if (!authButtons) return;

    if (this.usuarioLogado) {
      authButtons.innerHTML = `
        <div class="dropdown">
          <button class="btn btn-outline-light dropdown-toggle" type="button" data-bs-toggle="dropdown" style="border-radius: 0;">
            ${this.usuarioLogado.nome}
          </button>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="perfil.html">Meu Perfil</a></li>
            <li><a class="dropdown-item" href="historico.html">Histórico</a></li>
            <li><a class="dropdown-item" href="carrinho.html">Meu Carrinho</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" onclick="authManager.logout()">Sair</a></li>
          </ul>
        </div>
      `;
    } else {
      authButtons.innerHTML =
        '<button class="btn btn-outline-light" onclick="authManager.abrirModalLogin()" style="border-radius: 0;">Login</button>';
    }
  }

  // Carrinho
  // No auth.js, verifique a função adicionarAoCarrinho
  adicionarAoCarrinho(produto, quantidade) {
    if (!this.usuarioLogado) {
      this.abrirModalLogin();
      return;
    }

    console.log("Produto recebido:", produto); // DEBUG

    // VALIDAÇÃO CRÍTICA - garantir que todos os campos existem
    if (!produto || !produto.id_produto) {
      console.error("Produto inválido:", produto);
      alert("Erro: Produto inválido");
      return;
    }

    const produtoSanitizado = {
      id_produto: produto.id_produto,
      nome: produto.nome || "Produto sem nome",
      preco: parseFloat(produto.preco) || 0,
      imagem:
        produto.imagem ||
        `https://picsum.photos/100/100?random=${produto.id_produto}`,
      categoria: produto.categoria || "Sem categoria",
      estoque: parseInt(produto.estoque) || 0,
    };

    console.log("Produto sanitizado:", produtoSanitizado); // DEBUG

    const carrinho = this.getCarrinho();
    const itemExistente = carrinho.find(
      (item) => item.id_produto === produtoSanitizado.id_produto
    );

    if (itemExistente) {
      // Atualizar quantidade existente
      itemExistente.quantidade += parseInt(quantidade);
    } else {
      // Adicionar novo item
      carrinho.push({
        ...produtoSanitizado,
        quantidade: parseInt(quantidade),
      });
    }

    this.salvarCarrinho();
    this.atualizarContadorCarrinho();
    alert("Produto adicionado ao carrinho!");
  }

  removerDoCarrinho(idProduto) {
    this.carrinho = this.carrinho.filter(
      (item) => item.id_produto !== idProduto
    );
    this.salvarCarrinho();
    this.atualizarContadorCarrinho();
    this.mostrarMensagem("Produto removido do carrinho!", "info");
  }

  atualizarQuantidade(idProduto, quantidade) {
    if (quantidade < 1) {
      this.removerDoCarrinho(idProduto);
      return;
    }

    const item = this.carrinho.find((item) => item.id_produto === idProduto);
    if (item) {
      if (quantidade > item.estoque) {
        this.mostrarMensagem(
          `Quantidade indisponível. Estoque: ${item.estoque}`,
          "warning"
        );
        return;
      }
      item.quantidade = quantidade;
      this.salvarCarrinho();
      this.atualizarContadorCarrinho();
    }
  }

  limparCarrinho() {
    this.carrinho = [];
    this.salvarCarrinho();
    this.atualizarContadorCarrinho();
  }

  salvarCarrinho() {
    localStorage.setItem("carrinho", JSON.stringify(this.carrinho));
  }

  atualizarContadorCarrinho() {
    const carrinhoCount = document.getElementById("carrinho-count");
    if (carrinhoCount) {
      const totalItens = this.carrinho.reduce(
        (total, item) => total + item.quantidade,
        0
      );
      if (totalItens > 0) {
        carrinhoCount.textContent = totalItens;
        carrinhoCount.style.display = "block";
      } else {
        carrinhoCount.style.display = "none";
      }
    }
  }

  getCarrinho() {
    return this.carrinho;
  }

  getTotalCarrinho() {
    return this.carrinho.reduce(
      (total, item) => total + parseFloat(item.preco) * item.quantidade,
      0
    );
  }

  getQuantidadeTotalItens() {
    return this.carrinho.reduce((total, item) => total + item.quantidade, 0);
  }

  // Finalizar compra com atualização de estoque
  async finalizarCompra() {
    if (!this.usuarioLogado) {
      this.mostrarMensagem("Faça login para finalizar a compra!", "warning");
      this.abrirModalLogin();
      return false;
    }

    const carrinho = this.getCarrinho();

    if (carrinho.length === 0) {
      this.mostrarMensagem("Seu carrinho está vazio!", "warning");
      return false;
    }

    try {
      // Atualizar estoque para cada item
      for (const item of carrinho) {
        await this.atualizarEstoque(item.id_produto, item.quantidade);
      }

      // Limpar carrinho após compra
      this.carrinho = [];
      this.salvarCarrinho();
      this.atualizarContadorCarrinho();

      this.mostrarMensagem(
        "Compra finalizada com sucesso! Estoque atualizado.",
        "success"
      );
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);

      return true;
    } catch (error) {
      console.error("Erro ao finalizar compra:", error);
      this.mostrarMensagem(
        "Erro ao finalizar compra. Tente novamente.",
        "danger"
      );
      return false;
    }
  }

  // Função para atualizar estoque na API
  async atualizarEstoque(idProduto, quantidadeVendida) {
    try {
      const response = await fetch(
        `http://localhost:8000/api/atualizar-estoque.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_produto: idProduto,
            quantidade: quantidadeVendida,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao atualizar estoque");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      console.error("Erro:", error);
      throw error;
    }
  }

  // Utilitário para mostrar mensagens
  mostrarMensagem(mensagem, tipo = "info") {
    // Remover mensagens anteriores
    const mensagensExistentes = document.querySelectorAll(".alert-custom");
    mensagensExistentes.forEach((msg) => msg.remove());

    // Criar nova mensagem
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${tipo} alert-custom position-fixed`;
    alertDiv.style.cssText = `
      top: 20px;
      right: 20px;
      z-index: 9999;
      min-width: 300px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    alertDiv.innerHTML = `
      ${mensagem}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(alertDiv);

    // Auto-remover após 5 segundos
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.remove();
      }
    }, 5000);
  }

  // Verificar se usuário está logado (para proteção de rotas)
  verificarAutenticacao() {
    if (!this.usuarioLogado) {
      this.mostrarMensagem("Faça login para acessar esta página!", "warning");
      this.abrirModalLogin();
      return false;
    }
    return true;
  }

  // Atualizar perfil do usuário
  async atualizarPerfil(dados) {
    try {
      const response = await fetch(
        "http://localhost:8000/api/atualizar-perfil.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_cliente: this.usuarioLogado.id_cliente,
            ...dados,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Atualizar usuário logado
        this.usuarioLogado = { ...this.usuarioLogado, ...dados };
        localStorage.setItem(
          "usuarioLogado",
          JSON.stringify(this.usuarioLogado)
        );
        this.atualizarHeader();

        this.mostrarMensagem("Perfil atualizado com sucesso!", "success");
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      return {
        success: false,
        message: "Erro de conexão: " + error.message,
      };
    }
  }
}

// Instância global
const authManager = new AuthManager();

// Funções globais para os modals
function abrirModalLogin() {
  authManager.abrirModalLogin();
}

function mostrarCadastro() {
  authManager.mostrarCadastro();
}

function mostrarLogin() {
  authManager.mostrarLogin();
}

// Funções globais para o carrinho
function adicionarAoCarrinho(produto, quantidade = 1) {
  authManager.adicionarAoCarrinho(produto, quantidade);
}

function removerDoCarrinho(idProduto) {
  authManager.removerDoCarrinho(idProduto);
}

function atualizarQuantidadeCarrinho(idProduto, quantidade) {
  authManager.atualizarQuantidade(idProduto, quantidade);
}

function finalizarCompra() {
  return authManager.finalizarCompra();
}

// Event Listeners para os forms
document.addEventListener("DOMContentLoaded", function () {
  // Form de Login
  const formLogin = document.getElementById("formLogin");
  if (formLogin) {
    formLogin.addEventListener("submit", async function (e) {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value;
      const senha = document.getElementById("loginSenha").value;

      if (!email || !senha) {
        authManager.mostrarMensagem("Preencha todos os campos!", "warning");
        return;
      }

      const resultado = await authManager.login(email, senha);
      if (!resultado.success) {
        authManager.mostrarMensagem(resultado.message, "danger");
      }
    });
  }

  // Form de Cadastro
  const formCadastro = document.getElementById("formCadastro");
  if (formCadastro) {
    formCadastro.addEventListener("submit", async function (e) {
      e.preventDefault();

      const nome = document.getElementById("cadastroNome").value;
      const sobrenome = document.getElementById("cadastroSobrenome").value;
      const email = document.getElementById("cadastroEmail").value;
      const senha = document.getElementById("cadastroSenha").value;
      const confirmarSenha = document.getElementById(
        "cadastroConfirmarSenha"
      ).value;

      if (!nome || !sobrenome || !email || !senha || !confirmarSenha) {
        authManager.mostrarMensagem("Preencha todos os campos!", "warning");
        return;
      }

      if (senha !== confirmarSenha) {
        authManager.mostrarMensagem("As senhas não coincidem!", "warning");
        return;
      }

      if (senha.length < 6) {
        authManager.mostrarMensagem(
          "A senha deve ter pelo menos 6 caracteres!",
          "warning"
        );
        return;
      }

      const resultado = await authManager.cadastrar(
        nome,
        sobrenome,
        email,
        senha
      );
      if (!resultado.success) {
        authManager.mostrarMensagem(resultado.message, "danger");
      }
    });
  }

  // Form de Perfil
  const formPerfil = document.getElementById("formPerfil");
  if (formPerfil) {
    // Carregar dados do perfil
    if (authManager.usuarioLogado) {
      document.getElementById("perfilNome").value =
        authManager.usuarioLogado.nome || "";
      document.getElementById("perfilSobrenome").value =
        authManager.usuarioLogado.sobrenome || "";
      document.getElementById("perfilEmail").value =
        authManager.usuarioLogado.email || "";
    }

    formPerfil.addEventListener("submit", async function (e) {
      e.preventDefault();

      if (!authManager.verificarAutenticacao()) return;

      const nome = document.getElementById("perfilNome").value;
      const sobrenome = document.getElementById("perfilSobrenome").value;
      const senha = document.getElementById("perfilSenha").value;
      const confirmarSenha = document.getElementById(
        "perfilConfirmarSenha"
      ).value;

      if (!nome || !sobrenome) {
        authManager.mostrarMensagem("Preencha nome e sobrenome!", "warning");
        return;
      }

      if (senha && senha !== confirmarSenha) {
        authManager.mostrarMensagem("As senhas não coincidem!", "warning");
        return;
      }

      const dados = { nome, sobrenome };
      if (senha) {
        dados.senha = senha;
      }

      const resultado = await authManager.atualizarPerfil(dados);
      if (!resultado.success) {
        authManager.mostrarMensagem(resultado.message, "danger");
      }
    });
  }
});


// Proteção de rotas - verificar autenticação em páginas protegidas
document.addEventListener("DOMContentLoaded", function () {
  const paginasProtegidas = ["perfil.html", "historico.html", "carrinho.html"];
  const paginaAtual = window.location.pathname.split("/").pop();

  if (paginasProtegidas.includes(paginaAtual)) {
    if (!authManager.verificarAutenticacao()) {
      // Redirecionar para home se não estiver logado
      window.location.href = "index.html";
    }
  }
});

