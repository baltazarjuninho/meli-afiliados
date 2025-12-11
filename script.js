/*
 AchadosJr - client-side only
 Products stored in localStorage under key 'achadosjr_products'
 Each product: {id, title, price, thumbnail, url, date}
*/

const STORAGE_KEY = 'achadosjr_products';

function loadProducts(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return arr;
  }catch(e){
    console.error(e);
    return [];
  }
}

function saveProducts(arr){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function renderProducts(){
  const list = document.getElementById('products');
  const empty = document.getElementById('empty');
  list.innerHTML = '';
  const arr = loadProducts();
  if(!arr || arr.length===0){
    empty.style.display='block';
    return;
  }
  empty.style.display='none';
  arr.forEach(p=>{
    const li = document.createElement('li');
    li.className='product-item';
    li.innerHTML = `
      <img class="product-thumb" src="${p.thumbnail||''}" alt="${escapeHtml(p.title)}">
      <div class="product-info">
        <p class="prod-title">${escapeHtml(p.title)}</p>
        <p class="prod-price">R$ ${formatPrice(p.price)}</p>
        <p><a class="btn" href="${p.url}" target="_blank">Ver no Mercado Livre</a></p>
      </div>
    `;
    list.appendChild(li);
  });
}

function formatPrice(v){
  if(v===null||v===undefined) return '---';
  const n = Number(v);
  if(isNaN(n)) return v;
  return n.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
}

function escapeHtml(text){
  if(!text) return '';
  return text.replace(/[&<>\"']/g, function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":\"&#39;\"}[m];});
}

// initial render
document.addEventListener('DOMContentLoaded', ()=>{ renderProducts(); });

// expose for admin page (if same origin)
window.AchadosJr = {
  loadProducts, saveProducts, renderProducts, formatPrice
};
