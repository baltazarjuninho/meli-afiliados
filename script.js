fetch('/.netlify/functions/getProducts')
.then(r=>r.json())
.then(data=>{
 const list=document.getElementById('product-list');
 data.forEach(p=>{
  const div=document.createElement('div');
  div.innerHTML=`<img src="${p.image}"><br>${p.name}<br>R$ ${p.price}<br><a href="${p.link}">Comprar</a><hr>`;
  list.appendChild(div);
 });
});