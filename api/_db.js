// Bancos (chaves anon: já são públicas no site).
// PC_PRIMARIO=false: principal = Supabase; segurança = PC (cópia a cada 10 min) e projeto reserva.
// PC_PRIMARIO=true : principal = PC (db.forgeaioficial.online); espelho = Supabase; último recurso = projeto reserva.
const PC_PRIMARIO = true;
const SUP = { nome:'sup', url:'https://wyjrjioipqfltdyupfna.supabase.co', key:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5anJqaW9pcHFmbHRkeXVwZm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMzc4MjIsImV4cCI6MjA5NDgxMzgyMn0.R913daESlpXfWeKuFOzn59kFPXgk7EZCONNTSd1w5NU' };
const PCT = { nome:'pct', pc:true, url:'https://desktop-muskj8q.tail4de325.ts.net', key:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6ImJsYWNrZS1yZXNlcnZhIiwiaWF0IjoxNzkzNjE0MjM0LCJleHAiOjIxMDg5NzQyMzR9.JFrbmZKNJyj2LPfBj8w63U2OzcnEHn1ewv_RCsg_UP4' };
const PCP = { nome:'pcp', pc:true, url:'https://db.forgeaioficial.online', key:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6ImJsYWNrZS1yZXNlcnZhIiwiaWF0IjoxNzkzNjE0MjM0LCJleHAiOjIxMDg5NzQyMzR9.JFrbmZKNJyj2LPfBj8w63U2OzcnEHn1ewv_RCsg_UP4' };
const RES = { nome:'res', url:'https://ldghexvlbkiqduzlpdss.supabase.co', key:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZ2hleHZsYmtpcWR1emxwZHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMjgzNzAsImV4cCI6MjEwMjkwNDM3MH0.MJOsPqcyc5J5TRH_JxvpH0Eul_v9bwfSeab-bFLe6vM' };
const BANCOS = PC_PRIMARIO ? [PCP, SUP, RES] : [SUP, PCT, RES];
const ANT = SUP.url + '/storage/v1/object/public/capas/';
// ajusta o endereço das imagens conforme o banco que respondeu
function ajustarImagens(txt, b){
  if (b.nome === 'pcp') return txt.split(ANT).join(PCP.url + '/rpc/capa?nome=');
  if (b.nome === 'pct') return txt.split(ANT).join(PCT.url + '/capas/');
  if (b.nome === 'res') return txt.split(SUP.url + '/storage/').join(RES.url + '/storage/');
  return txt;                                                                   // espelho (Supabase): mantém
}
async function pedir(caminho, opcoes = {}){
  for (const b of BANCOS){
    const c = new AbortController(), t = setTimeout(() => c.abort(), 4000);
    try{
      const r = await fetch(b.url + (b.pc ? caminho.replace('/rest/v1', '') : caminho), { ...opcoes, signal:c.signal, headers:{ ...(b.pc ? {} : { apikey:b.key }), Authorization:'Bearer ' + b.key, ...(opcoes.headers || {}) } });
      if (r.ok){
        const dados = await r.json();
        if (b.nome === 'sup' && !PC_PRIMARIO) return dados;
        return JSON.parse(ajustarImagens(JSON.stringify(dados), b));
      }
    }catch(_){}finally{ clearTimeout(t); }
  }
  return null;
}
exports.pedir = pedir;
exports.BANCO0 = BANCOS[0].url;
// clique nas páginas de bio: vai ao banco principal; se ele falhar e houver um PC de segurança, vai para a fila dele
exports.clique = BANCOS[0].pc
  ? { url:BANCOS[0].url + '/rpc/registrar_clique', headers:{ 'Content-Type':'application/json', Authorization:'Bearer ' + BANCOS[0].key } }
  : { url:BANCOS[0].url + '/rest/v1/rpc/registrar_clique', headers:{ 'Content-Type':'application/json', apikey:BANCOS[0].key, Authorization:'Bearer ' + BANCOS[0].key } };
exports.PC = PC_PRIMARIO ? null : PCT;
exports.site = async id => {
  const a = await pedir(`/rest/v1/sites_publicos?select=id,brand_name,caption,categoria,image_url,handle&id=eq.${id}&oculto=eq.false&denuncias=lt.5&limit=1`);
  return (a && a[0]) || null;
};
exports.perfil = async h => pedir('/rest/v1/rpc/perfil_publico', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ p_handle:h }) });
