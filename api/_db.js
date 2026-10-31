// Bancos (chaves anon: já são públicas no site). Se o principal não responder, usa o reserva.
const BANCOS = [
  { url:'https://wyjrjioipqfltdyupfna.supabase.co', key:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5anJqaW9pcHFmbHRkeXVwZm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMzc4MjIsImV4cCI6MjA5NDgxMzgyMn0.R913daESlpXfWeKuFOzn59kFPXgk7EZCONNTSd1w5NU' },
  { url:'https://ldghexvlbkiqduzlpdss.supabase.co', key:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZ2hleHZsYmtpcWR1emxwZHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMjgzNzAsImV4cCI6MjEwMjkwNDM3MH0.MJOsPqcyc5J5TRH_JxvpH0Eul_v9bwfSeab-bFLe6vM' }
];
async function pedir(caminho, opcoes = {}){
  for (const [i, b] of BANCOS.entries()){
    const c = new AbortController(), t = setTimeout(() => c.abort(), 4000);
    try{
      const r = await fetch(b.url + caminho, { ...opcoes, signal:c.signal, headers:{ apikey:b.key, Authorization:'Bearer ' + b.key, ...(opcoes.headers || {}) } });
      if (r.ok){
        const dados = await r.json();
        // no reserva, as imagens do armazenamento passam a vir dele
        return i === 0 ? dados : JSON.parse(JSON.stringify(dados).split(BANCOS[0].url + '/storage/').join(b.url + '/storage/'));
      }
    }catch(_){}finally{ clearTimeout(t); }
  }
  return null;
}
exports.pedir = pedir;
exports.site = async id => {
  const a = await pedir(`/rest/v1/sites_publicos?select=id,brand_name,caption,categoria,image_url,handle&id=eq.${id}&oculto=eq.false&denuncias=lt.5&limit=1`);
  return (a && a[0]) || null;
};
exports.perfil = async h => pedir('/rest/v1/rpc/perfil_publico', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ p_handle:h }) });
