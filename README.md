# Desafio Técnico Front-end - Viveo

Este repositório contém a solução desenvolvida para a avaliação técnica de Front-end da Viveo. O projeto consiste em uma aplicação web responsiva com autenticação, cadastro de usuários, perfil e consumo de APIs externas, desenvolvida com foco em código limpo, usabilidade e melhores práticas.

## 🚀 Tecnologias Utilizadas

O projeto foi construído utilizando a stack moderna recomendada, garantindo performance e escalabilidade:

- **React** (com **Vite** para build tool)
- **TypeScript** (para tipagem estática e segurança de código)
- **Tailwind CSS** (para estilização responsiva e moderna)
- **Headless UI** & **Heroicons** (para componentes de interface acessíveis e ícones)
- **React Router DOM** (para roteamento e navegação SPA)
- **Supabase** (Backend-as-a-Service para Autenticação, Banco de Dados e Storage de Imagens)

## ✨ Funcionalidades Implementadas

Atendendo aos requisitos do desafio:

1.  **Tela de Login Responsiva**

    - Autenticação integrada com Supabase Auth.
    - Redirecionamento inteligente (se já logado, vai para o feed).
    - Feedback visual de carregamento e erros.

2.  **Tela de Cadastro de Usuários**

    - Formulário completo com validação.
    - **Integração com ViaCEP:** Preenchimento automático de endereço ao digitar o CEP.
    - **Upload de Imagens:** Usuário pode enviar foto de perfil e capa (armazenadas no Supabase Storage).
    - **Edição de Perfil:** A mesma tela serve para cadastrar novos usuários ou editar os dados do usuário logado.

3.  **Consumo de API Open-Source**

    - Integração com a API **https://randomuser.me/api/** na tela de Feed/Lista.
    - Exibição híbrida: Lista "Minha Rede" (usuários reais do banco) e "Sugestões" (usuários da API externa).

4.  **Funcionalidades Extras**
    - **Perfil Dinâmico:** Rota `/user/:userId` que permite visualizar o perfil de qualquer usuário (real ou fake).
    - **Layout Persistente:** Header com menu responsivo (mobile/desktop) e dropdown de usuário.
    - **Deploy:** Configuração pronta para Vercel (SPA rewrites).

## 📦 Como Rodar o Projeto

### Pré-requisitos

- Node.js instalado (versão 18+ recomendada).
- Uma conta no [Supabase](https://supabase.com) (Grátis).

### Passos

1.  **Clone o repositório:**

    ```bash
    git clone [https://github.com/seu-usuario/viveo-teste.git](https://github.com/seu-usuario/viveo-teste.git)
    cd viveo-teste
    ```

2.  **Instale as dependências:**

    ```bash
    npm install
    ```

3.  **Configuração de Variáveis de Ambiente:**
    Crie um arquivo `.env.local` na raiz do projeto e adicione suas credenciais do Supabase (veja o arquivo `SUPABASE_SETUP.md` para detalhes de como configurar o banco e os buckets):

    ```env
    VITE_SUPABASE_URL=sua_url_do_supabase
    VITE_SUPABASE_ANON_KEY=sua_chave_anonima
    ```

4.  **Rode o projeto:**
    ```bash
    npm run dev
    ```
    Acesse `http://localhost:5173` no seu navegador.

## 🗄️ Estrutura do Banco de Dados (Supabase)

Para o funcionamento correto, o projeto espera uma tabela `public.users` e buckets de storage configurados.

- **Tabela:** `users` (Vinculada ao `auth.users` via trigger ou inserção manual no cadastro).
- **Storage:** Buckets públicos `avatars` e `banners` com políticas RLS apropriadas.

_(Consulte o arquivo `SUPABASE_SETUP.md` incluído no projeto para o guia passo-a-passo da configuração do backend)._

---

Desenvolvido por **André**.
