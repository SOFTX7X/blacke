const URL_ = 'https://wyjrjioipqfltdyupfna.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5anJqaW9pcHFmbHRkeXVwZm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMzc4MjIsImV4cCI6MjA5NDgxMzgyMn0.R913daESlpXfWeKuFOzn59kFPXgk7EZCONNTSd1w5NU'  // chave anon: já é pública no site;
const H = { apikey: KEY, Authorization: 'Bearer ' + KEY };
exports.site = async id => {
  const r = await fetch(`${URL_}/rest/v1/sites_publicos?select=id,brand_name,caption,categoria,image_url,handle&id=eq.${id}&oculto=eq.false&denuncias=lt.5&limit=1`, { headers: H });
  if (!r.ok) return null; const a = await r.json(); return a[0] || null;
};
exports.perfil = async h => {
  const r = await fetch(`${URL_}/rest/v1/rpc/perfil_publico`, { method: 'POST', headers: { ...H, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_handle: h }) });
  if (!r.ok) return null; return await r.json();
};
