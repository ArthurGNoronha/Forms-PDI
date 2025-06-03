# LogBook - Controle de Estoque

Sistema web para controle de estoque de insumos e reagentes, com interface para usuários.

## Sumário

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Configuração e Execução](#configuração-e-execução)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Scripts Principais](#scripts-principais)
- [Endpoints Principais](#endpoints-principais)

---

## Visão Geral

O LogBook é um sistema para registro, consulta e administração do estoque de reagentes e insumos, voltado para laboratórios e ambientes acadêmicos. Possui:

- Formulário público para registro de uso de reagentes.
- Painel administrativo protegido por autenticação JWT.
- Exportação de dados para Excel.
- Filtros, paginação e controle de estoque (entrada/saída).
- Validação de dados e feedback visual.

## Funcionalidades

- Cadastro, edição e exclusão de reagentes.
- Registro de entradas e saídas de estoque.
- Consulta e exportação de respostas (usos de reagentes).
- Autenticação de administradores.
- Filtros e paginação em todas as tabelas.
- Alertas visuais para estoques próximos do limite mínimo.
- Exportação de dados para Excel.

## Estrutura do Projeto

```
backend/
  src/
    app.js
    server.js
    routes.js
    controllers/
    middlewares/
    models/
    routes/
    config/
frontend/
  pages/
    scripts/
    styles/
    views/
Images/
  ...
```

- **backend/**: API REST em Node.js/Express, com autenticação, banco de dados e respostas em Hateoas.
- **frontend/**: Páginas EJS, scripts JS e estilos CSS para interface do usuário e painel ADM.
- **Images/**: Imagens usadas na interface.

## Pré-requisitos

- Node.js >= 16.x
- MongoDB (local ou remoto)
- npm

## Configuração e Execução

1. **Clone o repositório:**
   ```sh
   git clone https://github.com/ArthurGNoronha/Forms-PDI
   cd Forms-PDI
   ```

2. **Configuração do Backend:**
   ```sh
   cd backend
   cp .env.example .env
   # Edite o arquivo .env com suas configurações (veja abaixo)
   npm install
   npm start
   ```
   O backend roda por padrão em `http://localhost:3000`.

3. **Frontend:**
   O frontend é servido pelo próprio backend via rotas EJS. Basta acessar:
   - Formulário: `http://localhost:3000/`
   - Painel ADM: `http://localhost:3000/adm`

## Variáveis de Ambiente

No arquivo `backend/.env`:

```
port=3000
db=mongodb://localhost:27017/db
JWTSECRET=sua_chave_secreta
JWTEXPIRE=1d
```

## Scripts Principais

No backend:

- `npm start` — Inicia o servidor em modo produção.
- `npm run swagger` — Roda o swagger-auto-gen e inicia o servidor.
- `npm run pm2` - Inicia o servidor utilizando a lib pm2 (Recomendado apenas para produção).

## Endpoints Principais

- **Frontend**
  - `/` — Formulário de registro de uso.
  - `/adm` — Painel administrativo (login obrigatório).

- **API**
  - `POST /login` — Autenticação.
  - `GET /api/answers` — Listagem de respostas (uso de reagentes).
  - `GET /api/reagentes` — Listagem de reagentes.
  - `POST /api/reagentes` — Cadastro de reagente.
  - `PUT /api/reagentes/:id` — Edição de reagente.
  - `DELETE /api/reagentes/:id` — Exclusão de reagente.
  - `POST /api/reagentes/add` — Entrada de estoque.
  - `POST /api/reagentes/remove` — Saída de estoque.
  - `GET /api/answers/excel` — Exportação de respostas para Excel.
  - `GET /api/reagentes/excel` — Exportação de reagentes para Excel.

A documentação completa da API está disponível em `/swagger`.

---

**Desenvolvido por Arthur Noronha.**