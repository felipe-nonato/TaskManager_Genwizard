# TaskManager_Genwizard

Full-stack ticket management system: Next.js frontend + Node.js/Express API + SQLite. Features: user auth, ticket creation/tracking, external API integration, ATR responses via eventId extraction. Clean UI with Nothing-inspired design.

# Sistema de Login e Cadastro

Sistema completo de autenticação com Next.js, TypeScript, Tailwind CSS e SQLite.

## 🚀 Estrutura do Projeto

```
Accenture/
├── api/                          # Backend (Node.js + Express + SQLite)
│   ├── main.js                   # Servidor principal
│   ├── data.db                   # Banco de dados SQLite
│   └── package.json
│
└── task-manager/                 # Frontend (Next.js + TypeScript)
    ├── app/
    │   └── login/
    │       └── page.tsx          # Página de login/cadastro
    ├── services/
    │   └── api.ts                # Serviço centralizado de API
    └── .env.local                # Variáveis de ambiente
```

## 🛠️ Tecnologias

### Backend

-   **Node.js** + **Express** - Servidor HTTP
-   **SQLite3** - Banco de dados
-   **bcrypt** - Criptografia de senhas
-   **CORS** - Permitir requisições cross-origin

### Frontend

-   **Next.js 16** - Framework React
-   **TypeScript** - Tipagem estática
-   **Tailwind CSS** - Estilização
-   **React Hooks** - Gerenciamento de estado

## 📦 Instalação

### 1. Backend (API)

```bash
cd api
npm install
```

### 2. Frontend (Task Manager)

```bash
cd task-manager
npm install
```

## ▶️ Executando o Projeto

### 1. Iniciar o Backend

```bash
cd api
node main.js
```

O servidor estará rodando em: `http://localhost:3001`

### 2. Iniciar o Frontend

```bash
cd task-manager
npm run dev
```

O Next.js estará rodando em: `http://localhost:3000`

## 🔐 Funcionalidades

### Página de Login (`/login`)

-   ✅ **Login de usuários** existentes
-   ✅ **Cadastro de novos usuários**
-   ✅ **Validação de formulários**
-   ✅ **Mensagens de erro amigáveis**
-   ✅ **Loading states**
-   ✅ **Design responsivo**
-   ✅ **Criptografia bcrypt** (10 salt rounds)

### API Endpoints

#### POST `/register`

Cadastra um novo usuário.

**Body:**

```json
{
    "name": "João Silva",
    "email": "joao@example.com",
    "password": "minhasenha123"
}
```

**Response (201):**

```json
{
    "message": "Usuário cadastrado com sucesso",
    "userId": 1
}
```

#### POST `/login`

Autentica um usuário.

**Body:**

```json
{
    "email": "joao@example.com",
    "password": "minhasenha123"
}
```

**Response (200):**

```json
{
    "message": "Login realizado com sucesso",
    "user": {
        "id": 1,
        "name": "João Silva",
        "email": "joao@example.com",
        "created_at": "2025-11-05T01:00:00.000Z"
    }
}
```

#### GET `/users`

Lista todos os usuários (sem senhas).

**Response (200):**

```json
[
    {
        "id": 1,
        "name": "João Silva",
        "email": "joao@example.com",
        "created_at": "2025-11-05T01:00:00.000Z"
    }
]
```

## 📝 Serviço de API (Frontend)

O arquivo `services/api.ts` centraliza todas as chamadas à API:

```typescript
import apiService from '@/services/api'

// Login
const response = await apiService.login({ email, password })

// Cadastro
const response = await apiService.register({ name, email, password })

// Listar usuários
const users = await apiService.getUsers()
```

## 🎨 Estilização

O projeto usa **Tailwind CSS** com:

-   Gradientes de fundo
-   Sombras e bordas arredondadas
-   Estados de hover e focus
-   Animações suaves
-   Design responsivo (mobile-first)

## 🔒 Segurança

-   ✅ Senhas criptografadas com **bcrypt**
-   ✅ Validação de entrada no backend
-   ✅ CORS configurado
-   ✅ Mínimo de 6 caracteres para senhas
-   ✅ Emails únicos no banco de dados

## 🌐 Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do `task-manager`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🐛 Troubleshooting

### Backend não inicia

-   Verifique se a porta 3001 está livre
-   Execute `npm install` novamente

### Frontend não conecta à API

-   Verifique se o backend está rodando
-   Confirme a URL no `.env.local`
-   Verifique o CORS no `main.js`

### Erro de compilação TypeScript

-   Execute `npm install` novamente
-   Verifique a versão do Node.js (recomendado: v18+)

## 📄 Licença

ISC
