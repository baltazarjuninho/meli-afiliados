exports.handler=async(event)=>{
 const fs=require('fs');
 const newProd=JSON.parse(event.body);
 const arr=JSON.parse(fs.readFileSync('products.json','utf8'));
 arr.push(newProd);
 fs.writeFileSync('products.json',JSON.stringify(arr));
 return {statusCode:200,body:'OK'};
};