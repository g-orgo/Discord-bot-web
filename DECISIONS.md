# Decisões — raptor-chatbot-web

## `sessionStorage` para autenticação
Token e dados do usuário ficam em `sessionStorage`. A sessão é perdida ao fechar a aba — intencional.

## Sem biblioteca de estado
Nenhum Zustand, Redux ou Pinia. Estado gerenciado com `useState` local em `App.jsx` e propagado via props.

## Props em vez de Context
`user` e `onLogout` são passados como props desde `App.jsx`. React Context não foi introduzido.

## CSS único em `App.css`
Sem CSS modules, sem Tailwind, sem estilos inline. Todo estilo fica em `App.css`.

---

## Escolhido pelo agente AI

- **React 19 + Vite** como stack base.
- **`react-router-dom`** para roteamento client-side.
- **Proxy Vite** (`/api/*` → LLM, `/auth/*` → server) — sem variáveis de ambiente de URL no frontend.
- **BEM-ish** como convenção de nomenclatura de classes CSS.
- **Sidebar desktop / bottom bar mobile** como layout de navegação.
