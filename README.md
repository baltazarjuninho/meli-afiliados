AchadosJr - Site estático (client-side)
=======================================

Descrição
- Site que lista produtos adicionados via painel admin.
- Painel admin pede senha (admin123) e aceita apenas o link do Mercado Livre.
- O código extrai o ID do link, consulta a API do Mercado Livre e salva os dados (título, preço, thumbnail, url) no localStorage.
- Funciona em hospedagem estática (Netlify, GitHub Pages, Vercel). Não precisa de backend.

Como usar
1. Suba os arquivos para seu repositório e faça deploy no Netlify ou outra hospedagem.
2. Acesse /admin (ex: https://seusite.netlify.app/admin).
3. Senha: admin123
4. Cole o link do produto do Mercado Livre e clique em Adicionar.
5. Volte para a página principal para ver os produtos listados.

Observações
- Se a API do Mercado Livre estiver bloqueando por CORS em algum ambiente, o painel mostrará erro ao buscar dados. Nesses casos você pode:
  - adicionar o produto manualmente (abrindo console e salvando localStorage) ou
  - usar uma função serverless para consultar a API (posso ajudar a configurar).
