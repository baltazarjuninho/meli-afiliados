// expandAndFetch.js
// Netlify function: POST { "url": "..." }
// Returns: { success:true, item:{ id, title, price, thumbnail, finalUrl, category_id } } or {success:false, message}

const fetch = require('node-fetch');

function extractIdFromString(s){
  if(!s) return null;
  // 1) MLB followed by digits
  const m1 = s.match(/MLB\d{5,15}/i);
  if(m1) return m1[0];
  // 2) wid=MLB...
  const m2 = s.match(/wid=(MLB\d{5,15})/i);
  if(m2) return m2[1];
  // 3) /p/MLB...
  const m3 = s.match(/\/p\/(MLB\d{5,15})/i);
  if(m3) return m3[1];
  // fallback: last long number (rare)
  const m4 = s.match(/(\d{6,15})/g);
  if(m4 && m4.length>0){
    // Try the last one prefixed by MLB if not present
    const cand = m4[m4.length-1];
    return 'MLB'+cand;
  }
  return null;
}

exports.handler = async function(event, context) {
  try{
    if(event.httpMethod !== 'POST'){
      return { statusCode: 405, body: JSON.stringify({success:false, message:'Use POST'})};
    }
    const body = JSON.parse(event.body || '{}');
    const url = (body.url || '').trim();
    if(!url) return { statusCode:400, body: JSON.stringify({success:false, message:'Faltou o campo url'}) };

    // 1) Try to fetch the URL to follow redirects and get final URL
    let finalUrl = url;
    try{
      const res = await fetch(url, { method: 'GET', redirect: 'follow', timeout: 10000 });
      // node-fetch sets res.url to final after redirects
      if(res && res.url) finalUrl = res.url;
      // also optionally read body text if no id found and page contains ML id in HTML
      var pageText = await res.text();
    }catch(err){
      // network/redirect might fail — still try to extract ID from original URL
      finalUrl = url;
      var pageText = '';
    }

    // 2) Try to extract ID from finalUrl or pageText
    let id = extractIdFromString(finalUrl) || extractIdFromString(url) || extractIdFromString(pageText);

    if(!id){
      return { statusCode: 404, body: JSON.stringify({success:false, message:'ID não encontrado no link'})};
    }

    // 3) Query MercadoLibre Items API
    const apiUrl = `https://api.mercadolibre.com/items/${id}`;
    const apiRes = await fetch(apiUrl);
    if(!apiRes.ok){
      return { statusCode: 404, body: JSON.stringify({success:false, message:'Produto não encontrado na API do Mercado Livre'})};
    }
    const item = await apiRes.json();

    // Build thumbnail best candidate
    let thumbnail = item.thumbnail || (item.pictures && item.pictures[0] && item.pictures[0].secure_url) || '';

    const result = {
      id: id,
      title: item.title || '',
      price: item.price || 0,
      thumbnail: thumbnail,
      finalUrl: finalUrl,
      category_id: item.category_id || ''
    };

    return { statusCode: 200, body: JSON.stringify({success:true, item: result}) };
  }catch(err){
    console.error('expandAndFetch error', err);
    return { statusCode: 500, body: JSON.stringify({success:false, message: err.message || 'Erro interno'}) };
  }
};
