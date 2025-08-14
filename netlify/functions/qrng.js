
// Netlify Function: QRNG proxy with fallbacks
export async function handler(event, context) {
  const len = Math.max(1, Math.min(2048, parseInt((event.queryStringParameters || {}).len || "64", 10)));
  let data = null;
  try {
    const r = await fetch(`https://api.quantumnumbers.anu.edu.au/random?length=${len}&type=uint16`);
    if (r.ok) {
      const j = await r.json();
      if (Array.isArray(j)) data = j;
      else if (j && Array.isArray(j.data)) data = j.data;
    }
  } catch(e) {}
  if (!data) {
    try{
      const r2 = await fetch(`https://qrng.anu.edu.au/API/jsonI.php?length=${len}&type=uint16`);
      if (r2.ok) {
        const j2 = await r2.json();
        if (j2 && Array.isArray(j2.data)) data = j2.data;
      }
    }catch(e){}
  }
  if (!data) {
    data = Array.from({length: len}, () => Math.floor(Math.random()*65536));
  }
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS"
    },
    body: JSON.stringify({ data })
  };
}
