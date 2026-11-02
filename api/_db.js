// Bancos (chaves anon: já são públicas no site), em ordem: principal, PC próprio (cópia a cada 6 h) e projeto reserva.
const BANCOS = [
  { url:'https://wyjrjioipqfltdyupfna.supabase.co', key:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5anJqaW9pcHFmbHRkeXVwZm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMzc4MjIsImV4cCI6MjA5NDgxMzgyMn0.R913daESlpXfWeKuFOzn59kFPXgk7EZCONNTSd1w5NU' },
  { pc:true, url:'https://desktop-muskj8q.tail4de325.ts.net', key:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6ImJsYWNrZS1yZXNlcnZhIiwiaWF0IjoxNzkzNjE0MjM0LCJleHAiOjIxMDg5NzQyMzR9.JFrbmZKNJyj2LPfBj8w63U2OzcnEHn1ewv_RCsg_UP4' },
  { url:'https://ldghexvlbkiqduzlpdss.supabase.co', key:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZ2hleHZsYmtpcWR1emxwZHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMjgzNzAsImV4cCI6MjEwMjkwNDM3MH0.MJOsPqcyc5J5TRH_JxvpH0Eul_v9bwfSeab-bFLe6vM' }
];
async function pedir(caminho, opcoes = {}){
  for (const [i, b] of BANCOS.entries()){
    const c = new AbortController(), t = setTimeout(() => c.abort(), 4000);
    try{
      const r = await fetch(b.url + (b.pc ? caminho.replace('/rest/v1', '') : caminho), { ...opcoes, signal:c.signal, headers:{ ...(b.pc ? {} : { apikey:b.key }), Authorization:'Bearer ' + b.key, ...(opcoes.headers || {}) } });
      if (r.ok){
        const dados = await r.json();
        // no reserva, as imagens do armazenamento passam a vir dele
        if (i === 0) return dados;
        const txt = JSON.stringify(dados);
        return JSON.parse(b.pc ? txt.split(BANCOS[0].url + '/storage/v1/object/public/capas/').join(b.url + '/capas/')
                               : txt.split(BANCOS[0].url + '/storage/').join(b.url + '/storage/'));
      }
    }catch(_){}finally{ clearTimeout(t); }
  }
  return null;
}
exports.pedir = pedir;
exports.BANCO0 = BANCOS[0].url;
exports.site = async id => {
  const a = await pedir(`/rest/v1/sites_publicos?select=id,brand_name,caption,categoria,image_url,handle&id=eq.${id}&oculto=eq.false&denuncias=lt.5&limit=1`);
  return (a && a[0]) || null;
};
exports.perfil = async h => pedir('/rest/v1/rpc/perfil_publico', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ p_handle:h }) });
