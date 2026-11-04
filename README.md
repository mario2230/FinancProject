# FinControl

Aplicativo de controle financeiro pessoal desenvolvido com Ionic, Vue 3 e TypeScript. O projeto usa Supabase para autenticação e persistência de receitas e despesas, e ApexCharts para exibir gráficos no dashboard.

## Requisitos

- Node.js e npm
- Um projeto Supabase

## Configuração

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie um arquivo `.env` na raiz do projeto, seguindo o `.env-example`:

   ```env
   VITE_APP_SUPABASE_URL=https://SEU_PROJETO.supabase.co
   VITE_APP_SUPABASE_KEY=SUA_CHAVE_PUBLICA
   ```

   Use a chave pública `anon`/publishable do projeto. Nunca coloque uma chave `service_role` no aplicativo.

3. No Supabase, habilite o provedor de autenticação por e-mail. Se as confirmações por e-mail estiverem ativadas, configure as URLs de redirecionamento para os endereços usados no desenvolvimento e na publicação. O provedor de e-mail padrão tem limites de envio; para uso contínuo, configure um SMTP próprio em **Authentication → SMTP Settings**.

4. Inicie o servidor local:

   ```bash
   npm run dev
   ```

   Reinicie o servidor após alterar `.env`.

## Funcionalidades

- Cadastro e login com e-mail e senha pelo Supabase Auth.
- Rotas `/dashboard`, `/receitas`, `/despesas` e `/perfil` protegidas por autenticação.
- Cadastro, edição, listagem e exclusão de receitas e despesas.
- Dashboard com totais, saldo, indicadores e gráficos por categoria e por mês.
- Perfil da conta e encerramento de sessão.

O cadastro cria uma conta em **Supabase Authentication → Users**. O projeto não cria automaticamente um registro em uma tabela pública de perfil.

## Banco de dados

As telas financeiras esperam duas tabelas no Supabase:

- `receitas`
- `despesas`

Ambas devem disponibilizar as colunas `id`, `descricao`, `valor`, `categoria`, `data` e `user_id`. Os valores são numéricos; `data` deve ser compatível com uma data no formato `YYYY-MM-DD`; `user_id` deve referenciar o usuário autenticado. Os services filtram os registros pelo usuário atual.

Configure políticas RLS no Supabase para que usuários autenticados só possam consultar, inserir, atualizar e excluir os próprios registros (`user_id = auth.uid()`). As verificações no cliente não substituem a RLS. Este projeto não aplica migrations nem cria tabelas automaticamente.

## Rotas

| Caminho | Tela | Acesso |
| --- | --- | --- |
| `/login` | Login | Visitantes |
| `/register` | Cadastro | Visitantes |
| `/dashboard` | Visão geral | Autenticado |
| `/receitas` | Receitas | Autenticado |
| `/despesas` | Despesas | Autenticado |
| `/perfil` | Perfil | Autenticado |

## Comandos

```bash
npm run dev          # inicia o servidor de desenvolvimento
npm run build        # verifica os tipos e gera a versão de produção
npm run preview      # serve localmente a versão de produção
npm run eslint       # executa o ESLint
npm run test:unit    # executa os testes unitários
npm run test:e2e     # executa os testes Playwright
npm test             # executa testes unitários e E2E
```

O Playwright pode exigir a instalação do navegador configurado:

```bash
npx playwright install
```

## Estrutura principal

```text
src/
├── components/   # componentes Ionic, gráficos e lançamentos
├── router/       # rotas e proteção de autenticação
├── service/      # autenticação e acesso ao Supabase
├── theme/        # tema da aplicação
└── views/        # páginas da aplicação
```
