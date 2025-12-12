// admin.js
const ADMIN_PASS = 'admin123';

function byId(id){ return document.getElementById(id); }

byId('btnLogin').addEventListener('click', ()=>{
  const v = byId('pass').value;
  if(v===ADMIN_PASS){
    byId('panel').style.display='block';
    renderAdminList();
  } else alert('Senha incorreta');
});

async function addLink(){
  const link = byId('linkInput').value.trim();
  if(!link) { byId('status').textContent='Cole um link.'; return; }
  byId('status').textContent='Processando... aguarde';
  try{
    const res = await fetch('/.netlify/functions/expandAndFetch', {
      method: 'POST',
      body: JSON.stringify({ url: link }),
      headers: { 'Content-Type': 'application/json' }
    });
    const j = await res.json();
    if(!j.success) { byId('status').textContent='Erro: ' + (j.message||''); return; }
    const item = j.item;
    // Build stored object, preserve finalUrl (which might include affiliate params)
    const stored = {
      id: item.id,
      title: item.title,
      price: item.price,
      thumbnail: item.thumbnail,
      finalUrl: item.finalUrl || link,
      link: link,
      category_id: item.category_id || '',
      date: new Date().toISOString()
    };
    // save to localStorage
    const arr = JSON.parse(localStorage.getItem('achadosjr_products') || '[]');
    // avoid duplicates (replace)
    const idx = arr.findIndex(x=>x.id==stored.id);
    if(idx>=0) arr[idx] = stored;
    else arr.unshift(stored);
    localStorage.setItem('achadosjr_products', JSON.stringify(arr));
    byId('status').textContent = 'Produto salvo.';
    byId('linkInput').value = '';
    renderAdminList();
    // refresh main page if open
    if(window.opener && window.opener.AchadosJr) window.opener.AchadosJr.renderProducts();
  }catch(err){
    console.error(err);
    byId('status').textContent = 'Erro interno: ' + (err.message||'');
  }
}

byId('btnAdd').addEventListener('click', addLink);
byId('btnPreview').addEventListener('click', async ()=>{
  const link = byId('linkInput').value.trim();
  if(!link) return alert('Cole um link para preview');
  // try to expand using serverless function
  try{
    const res = await fetch('/.netlify/functions/expandAndFetch', { method:'POST', body:JSON.stringify({url:link}), headers:{'Content-Type':'application/json'}});
    const j = await res.json();
    if(!j.success) return alert('Erro: '+(j.message||''));
    const it = j.item;
    // show preview quick
    const w = window.open('', '_blank', 'width=700,height=600');
    w.document.write(`<html><head><title>Preview</title><link rel="stylesheet" href="/style.css"></head><body style="padding:18px"><h1>${it.title}</h1><img style="max-width:360px" src="${it.thumbnail}"><p><b>R$ ${it.price}</b></p><p>Final URL: <a href="${it.finalUrl}" target="_blank">${it.finalUrl}</a></p></body></html>`);
  }catch(e){ alert('Erro ao gerar preview: '+(e.message||'')); }
});

function renderAdminList(){
  const ul = byId('adminList');
  const arr = JSON.parse(localStorage.getItem('achadosjr_products') || '[]');
  ul.innerHTML = '';
  if(arr.length===0){ ul.innerHTML = '<li class="muted">Nenhum produto cadastrado.</li>'; return; }
  arr.forEach(p=>{
    const li = document.createElement('li');
    li.innerHTML = `<span style="max-width:70%">${escapeHtml(p.title)} — R$ ${p.price}</span>
      <span>
        <button class="btn" onclick="onEdit('${p.id}')">Editar</button>
        <button class="btn" onclick="onRemove('${p.id}')">Remover</button>
      </span>`;
    ul.appendChild(li);
  });
}

function onRemove(id){
  if(!confirm('Remover este produto?')) return;
  let arr = JSON.parse(localStorage.getItem('achadosjr_products') || '[]');
  arr = arr.filter(x=>x.id!=id);
  localStorage.setItem('achadosjr_products', JSON.stringify(arr));
  renderAdminList();
  if(window.opener && window.opener.AchadosJr) window.opener.AchadosJr.renderProducts();
}

function onEdit(id){
  const arr = JSON.parse(localStorage.getItem('achadosjr_products') || '[]');
  const p = arr.find(x=>x.id==id);
  if(!p) return alert('Produto não encontrado');
  // very simple edit prompt flow
  const newTitle = prompt('Editar título', p.title) || p.title;
  const newPrice = prompt('Editar preço', p.price) || p.price;
  p.title = newTitle;
  p.price = Number(newPrice) || p.price;
  localStorage.setItem('achadosjr_products', JSON.stringify(arr));
  renderAdminList();
  if(window.opener && window.opener.AchadosJr) window.opener.AchadosJr.renderProducts();
}

// export/import/clear
byId('btnExport').addEventListener('click', ()=>{
  const arr = JSON.parse(localStorage.getItem('achadosjr_products') || '[]');
  const blob = new Blob([JSON.stringify(arr, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'achadosjr_products.json'; document.body.appendChild(a); a.click(); a.remove();
});

byId('importFile').addEventListener('change', (e)=>{
  const f = e.target.files[0];
  if(!f) return;
  const r = new FileReader();
  r.onload = function(){ try{
    const parsed = JSON.parse(r.result);
    if(!Array.isArray(parsed)) return alert('Arquivo inválido');
    localStorage.setItem('achadosjr_products', JSON.stringify(parsed));
    renderAdminList();
    alert('Importado com sucesso.');
  }catch(err){ alert('Erro ao importar: '+err.message) } };
  r.readAsText(f);
});

byId('btnClear').addEventListener('click', ()=>{
  if(confirm('Remover todos os produtos?')){ localStorage.removeItem('achadosjr_products'); renderAdminList(); if(window.opener && window.opener.AchadosJr) window.opener.AchadosJr.renderProducts(); }
});

// helper (escape)
function escapeHtml(text){ if(!text) return ''; return text.replace(/[&<>\"']/g, function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":\"&#39;\"}[m]; }); }

// wire add button
document.addEventListener('DOMContentLoaded', ()=> {
  if(document.getElementById('btnAdd')) document.getElementById('btnAdd').addEventListener('click', addLinkWrapper);
});

function addLinkWrapper(e){
  e && e.preventDefault && e.preventDefault();
  addLink();
}
