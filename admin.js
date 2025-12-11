document.getElementById('addForm').onsubmit=e=>{
 e.preventDefault();
 const payload={
  name: name.value,
  price: price.value,
  image: image.value,
  link: link.value
 };
 fetch('/.netlify/functions/addProduct',{method:'POST',body:JSON.stringify(payload)})
 .then(r=>r.text()).then(()=>alert('Produto adicionado!'));
};