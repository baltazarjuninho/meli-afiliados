// script.js - shared by index + admin
const STORAGE_KEY = 'achadosjr_products';
const CLICK_KEY = 'achadosjr_clicks';

function loadProductsArr(){
  try{
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }catch(e){ return [];}
}
function saveProductsArr(arr){ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }

function loadClicks(){ try{ return JSON.parse(localStorage.getItem(CLICK_KEY) || '{}'); }catch(e){ return {}; } }
function saveClicks(o){ localStorage.setItem(CLICK_KEY, JSON.stringify(o)); }

function renderProductsUI(filter='', sort='new'){
  const list = document.getElementById('products');
  const empty = document.getElementById('empty');
  if(!list) return;
  let arr = loadProductsArr().slice(); // copy
  if(filter){
    arr = arr.filter(p => (p.title||'').toLowerCase().includes(filter.toLowerCase()));
  }
  if(sort==='cheap') arr.sort((a,b)=>a.price - b.price);
  else if(sort==='expensive') arr.sort((a,b)=>b.price - a.price);
  else arr.sort((a,b)=> new Date(b.date||0) - new Date(a.date||0));
  list.innerHTML = '';
  if(!arr || arr.length===0){ if(empty) empty.style.display='block'; return; } else { if(empty) empty.style.display='none'; }
  const clicks = loadClicks();
  arr.forEach(p=>{
    const li = document.createElement('li');
    li.className = 'product-item';
    li.innerHTML = `
      <img class="product-thumb" src="${p.thumbnail||''}" alt="${escapeHtml(p.title)}" />
      <div style="flex:1">
        <p class="prod-title">${escapeHtml(p.title)}</p>
        <p class="prod-price">R$ ${formatPrice(p.price)}</p>
        <div style="display:flex;gap:8px;margin-top:8px">
          <a class="btn" href="${p.finalUrl || p.link}" target="_blank" rel="noopener noreferrer" data-id="${p.id}">Ver oferta</a>
          <button class="btn copy" data-link="${encodeURIComponent(p.finalUrl || p.link)}">Copiar link</button>
          <button class="btn" onclick="openPreview('${p.id}')">Preview</button>
        </div>
        <p class="muted" style="margin-top:8px">Cliques: ${clicks[p.id]||0}</p>
      </div>`;
    list.appendChild(li);
  });
  // attach copy handlers and count clicks
  document.querySelectorAll('a[data-id]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const id = a.getAttribute('data-id');
      // increase count in localStorage
      const clicks = loadClicks();
      clicks[id] = (clicks[id]||0) + 1;
      saveClicks(clicks);
      // small delay to update UI
      setTimeout(()=>renderProductsUI(document.getElementById('search')?.value || '', document.getElementById('sort')?.value || 'new'), 200);
    });
  });
  document.querySelectorAll('button.copy').forEach(b=>{
    b.addEventListener('click', ()=>{
      const link = decodeURIComponent(b.getAttribute('data-link'));
      navigator.clipboard.writeText(link).then(()=> alert('Link copiado!'));
    });
  });
}

function formatPrice(v){
  if(v===null||v===undefined) return '---';
  const n = Number(v);
  if(isNaN(n)) return v;
  return n.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
}
function escapeHtml(t){ if(!t) return ''; return t.replace(/[&<>\"']/g, function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":\"&#39;\"}[m];}); }

// search / sort / theme wiring
document.addEventListener('DOMContentLoaded', ()=>{
  const s = document.getElementById('search');
  const sort = document.getElementById('sort');
  const toggle = document.getElementById('toggleTheme');
  if(s){
    s.addEventListener('input', ()=> renderProductsUI(s.value, sort?.value || 'new'));
  }
  if(sort){
    sort.addEventListener('change', ()=> renderProductsUI(s?.value || '', sort.value));
  }
  if(toggle){
    toggle.addEventListener('click', ()=>{
      document.body.classList.toggle('dark');
      // simple persistence
      localStorage.setItem('achadosjr_theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    });
  }
  // initial theme
  const theme = localStorage.getItem('achadosjr_theme') || 'light';
  if(theme==='dark') document.body.classList.add('dark');

  renderProductsUI();
});

// preview function for product page
function openPreview(id){
  const arr = loadProductsArr();
  const p = arr.find(x=>x.id==id);
  if(!p) return alert('Produto não encontrado');
  const w = window.open('', '_blank', 'width=900,height=700');
  w.document.write(`<html><head><title>${p.title}</title><link rel="stylesheet" href="/style.css"></head><body style="padding:20px"><h1>${p.title}</h1><img style="max-width:360px" src="${p.thumbnail}"><p><b>R$ ${formatPrice(p.price)}</b></p><p><a href="${p.finalUrl||p.link}" target="_blank">Ir para oferta</a></p></body></html>`);
}
