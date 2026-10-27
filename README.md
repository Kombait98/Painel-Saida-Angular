# 🏫 Painel de Saída Escolar — Frontend (Angular)

Sistema web **Mobile-First** em tempo real para gestão e controle de liberação e saída de alunos em escolas, substituindo a comunicação por interfone/rádio entre a **Portaria** e as **Salas de Aula** por painéis digitais sincronizados instantaneamente via **SignalR (WebSockets)**.

> 🔗 **Repositório da API (Backend .NET 8 + PostgreSQL):** [Kombait98/Painel-Saida-Api](https://github.com/Kombait98/Painel-Saida-Api)

---

## ✨ Principais Funcionalidades

### 1. 🔐 Autenticação e Controle de Acesso (`/login`, `/cadastro-usuario`, `/reset-senha`)
- **Login por Perfil (`TipoPessoa`):** Redirecionamento automático conforme o papel do usuário autenticado (**Porteiro**, **Professor**, **Administrador** ou **Responsável**).
- **Sessão Independente por Aba (`sessionStorage`):** Permite abrir múltiplas abas simultaneamente no mesmo navegador com usuários diferentes (ex.: Aba 1 como Porteiro e Aba 2 como Professor) para operação ou homologação em tempo real.
- **Gestão de Usuários (`/cadastro-usuario`):** Cadastro e edição completa de pessoas/usuários do sistema com busca, filtro por perfil, ativação/inativação de conta e feedback visual (Toast).
- **Redefinição de Senha (`/reset-senha`):** Fluxo dedicado para alteração de senha validando o login do usuário.

### 2. 🎓 Gestão Escolar: Alunos, Turmas e Responsáveis (`/gestao`)
- **Cadastro e Edição de Alunos:** Nome completo, matrícula, data de nascimento, vínculo com turma e status ativo/inativo.
- **Cadastro e Edição de Turmas:** Nome da turma, série, ano letivo, turno (`Manhã`, `Tarde`, `Integral`) e professor responsável.
- **Relação `1:N` Aluno ↔ Responsáveis (Modal de Vínculos):**
  - Um aluno pode ter **vários responsáveis vinculados** (Pai, Mãe, Avós, Tios, Transporte Escolar etc.).
  - Criação rápida de um novo responsável ou seleção de uma pessoa já cadastrada.
  - Controle individual de **permissão de retirada** (`Autorizado a Retirar` / `Bloqueado`) com um clique.

### 3. 🚪 Painel da Portaria (`/portaria`)
- Filtro rápido por turma e visualização em tempo real do status de cada aluno:
  - `Aguardando` → `Chamado` → `Em deslocamento (Arrumando)` → `Liberado (Desceu)` → `Entregue` (ou `Cancelado`).
- **Seleção de Responsável na Chamada:** Ao clicar em **"Chamar Aluno"**, o porteiro seleciona qual responsável autorizado está na portaria (caso o aluno tenha mais de um responsável autorizado) antes de disparar o chamado.
- **Rechamada e Confirmação de Entrega:** Permite chamar novamente caso haja atraso e confirmar a entrega final ao responsável (`Entregue ao Pai`).
- **Lista Diária Automática:** O painel exibe automaticamente apenas as solicitações do dia corrente, mantendo o histórico de dias anteriores salvo no banco de dados para auditoria.

### 4. 🧑‍🏫 Painel da Sala de Aula (`/sala`)
- Visualização focada na turma selecionada pelo professor.
- **Alertas Visuais em Tempo Real:** Destaque imediato quando a portaria solicita um aluno (`Portaria Chamando`), exibindo inclusive o **nome e parentesco do responsável** que veio buscar a criança.
- Atualização rápida de status com um toque: **"Arrumando"** (`Em deslocamento`) e **"Desceu"** (`Liberado`).
- Contador dinâmico de tempo decorrido (`TimeAgoPipe`) desde a última atualização.

---

## 🎨 Identidade Visual e UX

- **Design Mobile-First:** Botões amplos, tipografia de alto contraste e cartões otimizados para uso em smartphones e tablets sob luz ambiente intensa.
- **Paleta de Cores Institucional:**
  - `#58247F` (Roxo Principal)
  - `#DF184F` (Rosa/Carmim Destaque)
  - `#E32427` (Vermelho Alerta/Chamada)
  - `#F46E22` (Laranja Em Preparação/Deslocamento)
  - `#FFFFFF` (Superfícies e Contraste)
- **Notificações Flutuantes (Toast):** Feedback imediato de sucesso (`✅`) ou erro (`❌`) em todas as operações de cadastro, edição, exclusão e vínculo.

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Descrição |
| :--- | :--- |
| **Angular 21** | Framework SPA com Standalone Components e **Angular Signals** (`signal`, `computed`) |
| **TypeScript 5.9** | Tipagem estática de modelos, DTOs e serviços |
| **Microsoft SignalR (`@microsoft/signalr`)** | Comunicação bidirecional em tempo real (`/hubs/dismissal`) com reconexão automática |
| **BroadcastChannel API** | Fallback e sincronização instantânea entre abas locais do navegador |
| **CSS3 Custom Properties** | Estilização responsiva e temática sem dependência de frameworks pesados |

---

## 📂 Estrutura do Projeto

```text
painel-saida/
├── src/
│   ├── app/
│   │   ├── models/
│   │   │   └── student.model.ts       # Interfaces de Alunos, Turmas, Responsáveis e Status
│   │   ├── pages/
│   │   │   ├── login/                 # Tela de Login (/login)
│   │   │   ├── cadastro-usuario/      # Cadastro e Edição de Usuários (/cadastro-usuario)
│   │   │   ├── reset-senha/           # Redefinição de Senha (/reset-senha)
│   │   │   ├── gestao-escolar/        # Gestão de Alunos, Turmas e Responsáveis (/gestao)
│   │   │   ├── portaria/              # Painel do Porteiro (/portaria)
│   │   │   └── sala/                  # Painel do Professor (/sala)
│   │   ├── pipes/
│   │   │   └── time-ago-pipe.ts       # Pipe para exibição de tempo decorrido ("há 15 seg")
│   │   ├── services/
│   │   │   ├── auth.ts                # Autenticação, gestão de sessão e CRUD de usuários
│   │   │   └── student.ts             # Integração REST + SignalR de turmas, alunos e saídas
│   │   ├── app.routes.ts              # Definição das rotas da aplicação
│   │   └── app.config.ts              # Providers globais (HttpClient, Router)
│   └── environments/
│       └── environment.example.ts     # Modelo de configuração de URL da API e Hub SignalR
```

---

## ⚙️ Configuração e Execução Local

### Pré-requisitos
- **Node.js** (v20+ recomendado) e **npm**
- Backend **[Painel-Saida-Api](https://github.com/Kombait98/Painel-Saida-Api)** em execução (padrão: `http://localhost:5000`)

### 1. Clonar o repositório e instalar dependências
```bash
git clone https://github.com/Kombait98/Painel-Saida-Angular.git
cd Painel-Saida-Angular
npm install
```

### 2. Configurar as variáveis de ambiente (`environment.ts`)
Por segurança, o arquivo `src/environments/environment.ts` é ignorado pelo Git (`.gitignore`) para evitar o envio de endereços privados de servidores/APIs.

Copie o arquivo de exemplo para criar sua configuração local:

**No Windows (PowerShell):**
```powershell
Copy-Item src/environments/environment.example.ts src/environments/environment.ts
```

**No Linux / macOS (Bash):**
```bash
cp src/environments/environment.example.ts src/environments/environment.ts
```

Verifique o conteúdo de `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  hubUrl: 'http://localhost:5000/hubs/dismissal'
};
```

### 3. Iniciar o servidor de desenvolvimento
```bash
npm start
```
Acesse no navegador: **`http://localhost:4200/`**

---

## 🧪 Como Testar em Tempo Real (Portaria + Sala de Aula)

Quando conectado à [Painel-Saida-Api](https://github.com/Kombait98/Painel-Saida-Api), o banco de dados já é inicializado automaticamente com usuários, turmas, alunos e responsáveis de demonstração:

| Perfil | Login | Senha Inicial | Rota Principal |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin` | `123456` | `/gestao` e `/cadastro-usuario` |
| **Porteiro** | `porteiro` | `123456` | `/portaria` |
| **Professor (Turma A)** | `prof.a` | `123456` | `/sala` |
| **Professor (Turma B)** | `prof.b` | `123456` | `/sala` |

1. Abra **`http://localhost:4200/login`** em **duas abas lado a lado**.
2. Na **Aba 1**, faça login com `porteiro` / `123456`.
3. Na **Aba 2**, faça login com `prof.a` / `123456`.
4. Na **Aba 1 (Portaria)**, selecione a **Turma A** e clique em **"Chamar Aluno"** (escolha o responsável caso solicitado).
5. Observe a **Aba 2 (Sala de Aula)** destacar o aluno instantaneamente com o nome do responsável! Altere o status para **"Arrumando"** e depois **"Desceu"**, acompanhando a atualização em tempo real na portaria.
