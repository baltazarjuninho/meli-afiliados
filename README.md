AchadosJr - Deploy rápido (Netlify)

1) Crie um repositório no GitHub e envie TODOS os arquivos:
   - index.html, admin.html, style.css, script.js, admin.js, README.md
   - pasta: netlify/functions/expandAndFetch.js
   - package.json (com node-fetch)

2) No Netlify:
   - New site -> Import from Git -> escolha o repositório
   - Netlify instalará dependências e deployará a function automaticamente

3) Acesse:
   - Página pública: https://<seu-site>.netlify.app/
   - Admin: https://<seu-site>.netlify.app/admin
     Senha: admin123

Observações:
- A função expandAndFetch segue redirecionamentos e busca o ID do produto. Em alguns casos extremos o ML bloqueia requisições; se ocorrer, retorno de erro aparecerá no admin.
- Para persistência centralizada (multi-usuário) posso configurar gravação no GitHub via token (Netlify env vars), ou em um banco (ex: Supabase). Diga se quer que eu faça.
