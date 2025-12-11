exports.handler=async()=>{
 const fs=require('fs');
 const data=fs.readFileSync('products.json','utf8');
 return {statusCode:200, body:data};
};