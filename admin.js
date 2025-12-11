/*
 Admin page logic:
 - simple client-side password (admin123)
 - single input: paste Mercado Livre product URL
 - fetch product data from Mercado Livre API
 - save to localStorage
*/

const ADMIN_PASS = 'admin123';
const STORAGE_KEY = 'achadosjr_products';

function extractMlId(url){
  if(!url) return null;
  try{
    // try patterns: /MLB-123456789 or /p/123456789 or last long number
    const m1 = url.match(/MLB-(\d+)/i);
    if(m1) return m1[1];
    const m2 = url.match(/\/p\/(\d+)/i);
    if(m2) return m2[1];
    const m3 = url.match(/(\d{6,})/g);
    if(m3 && m3.length>0) return m3[m3.length-1];
    return null;
  }catch(e){return null}
}

async function fetchMlItem(id){
  const api = `https://api.mercadolibre.com/items/${id}`;
  const res = await fetch(api);
  if(!res.ok) throw new Error('Produto não encontrado na API do Mercado Livre');
  return await res.json();
}

function loadProducts(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw? JSON.parse(raw): [];
  }catch(e){ return [];}
}

function saveProducts(arr){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function addProductObj(obj){
  const arr = loadProducts();
  // avoid duplicate by id
  if(arr.some(x=>x.id==obj.id)) {
    // replace existing
    const idx = arr.findIndex(x=>x.id==obj.id);
    arr[idx]=obj;
  } else {
    arr.unshift(obj);
  }
  saveProducts(arr);
  renderAdminList();
  // refresh main page if open in same origin
  if(window.opener && window.opener.AchadosJr) window.opener.AchadosJr.renderProducts();
}

function renderAdminList(){
  const ul = document.getElementById('adminList');
  ul.innerHTML = '';
  const arr = loadProducts();
  if(!arr || arr.length===0){
    ul.innerHTML = '<li class="muted">Nenhum produto cadastrado.</li>';
    return;
  }
  arr.forEach(p=>{
    const li = document.createElement('li');
    li.innerHTML = `<span>${p.title || p.url} — R$ ${window.AchadosJr ? window.AchadosJr.formatPrice(p.price) : p.price}</span>
      <span>
        <button class="btn" data-id="${p.id}" onclick="onRemove(event)">Remover</button>
      </span>`;
    ul.appendChild(li);
  });
}

function onRemove(e){
  const id = e.currentTarget.getAttribute('data-id');
  let arr = loadProducts();
  arr = arr.filter(x=>x.id!=id);
  saveProducts(arr);
  renderAdminList();
  if(window.opener && window.opener.AchadosJr) window.opener.AchadosJr.renderProducts();
}

document.getElementById('btnLogin').addEventListener('click', ()=>{
  const v = document.getElementById('pass').value;
  if(v===ADMIN_PASS){
    document.getElementById('panel').style.display='block';
  }else{
    alert('Senha incorreta');
  }
});

document.getElementById('add').addEventListener('click', async ()=>{
  const url = document.getElementById('mlLink').value.trim();
  const status = document.getElementById('status');
  status.textContent = '';
  if(!url){ status.textContent = 'Cole o link do Mercado Livre.'; return; }
  const id = extractMlId(url);
  if(!id){ status.textContent = 'Não foi possível extrair o ID do link. Verifique o link.'; return; }
  status.textContent = 'Buscando dados do produto...';
  try{
    const ml = await fetchMlItem(id);
    const thumb = ml.thumbnail || (ml.pictures && ml.pictures[0] && ml.pictures[0].secure_url) || '';
    const item = {
      id: id,
      title: ml.title || ('Produto ' + id),
      price: ml.price || 0,
      thumbnail: thumb,
      url: url,
      date: new Date().toISOString()
    };
    addProductObj(item);
    document.getElementById('mlLink').value='';
    status.textContent = 'Produto adicionado.';
  }catch(err){
    console.error(err);
    status.textContent = 'Erro ao buscar produto: '+err.message;
  }
});

// initial render
renderAdminList();
