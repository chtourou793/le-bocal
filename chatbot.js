(() => {
  const panel = document.getElementById('bocalChatPanel');
  if (!panel) return;
  const toggle = document.getElementById('bocalChatToggle');
  const close = document.getElementById('bocalChatClose');
  const log = document.getElementById('bocalChatLog');
  const input = document.getElementById('bocalChatInput');
  const send = document.getElementById('bocalChatSend');
  const reset = document.getElementById('bocalChatReset');
  const status = document.getElementById('bocalChatStatus');
  const choices = [...panel.querySelectorAll('[data-chat-question]')];
  let csrf = '', enabled = false, busy = false, loaded = false;
  function message(text, role = 'bot') {
    const p = document.createElement('p'); p.className = 'bocal-chat-message ' + role;
    p.textContent = text; log.appendChild(p); log.scrollTop = log.scrollHeight;
  }
  function controls() {
    input.disabled = send.disabled = !enabled || busy;
    reset.disabled = busy || !csrf;
    choices.forEach(button => button.disabled = !enabled || busy);
  }
  async function request(data) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 55000);
    try {
      const response = await fetch('chatbot.php', data ? {method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({...data,csrf}),signal:controller.signal} : {credentials:'same-origin',cache:'no-store',signal:controller.signal});
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'L’assistant est momentanément indisponible.');
      return body;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('La réponse prend trop de temps. Réessayez plus tard ou appelez l’équipe.');
      if (error instanceof SyntaxError || error instanceof TypeError) throw new Error('Connexion au chat impossible. Vous pouvez appeler l’équipe.');
      throw error;
    } finally { clearTimeout(timer); }
  }
  async function init() {
    busy = true; controls(); status.textContent = 'Connexion à l’assistant…';
    try {
      const data = await request(); csrf = data.csrf; enabled = data.enabled; loaded = true;
      if (!log.children.length) {
        message('Bonjour ! Une question sur la carte, les horaires ou une table au Bocal ?');
        (data.history || []).forEach(item => message(item.content, item.role === 'user' ? 'user' : 'bot'));
      }
      status.textContent = enabled ? '' : 'L’assistant IA n’est pas encore activé. Les liens ci-dessous restent disponibles.';
    } catch (error) { status.textContent = error.message; }
    finally { busy = false; controls(); if (enabled && !panel.hidden) input.focus(); }
  }
  function hide() {panel.hidden = true;toggle.setAttribute('aria-expanded','false');toggle.focus();}
  toggle.addEventListener('click', () => {
    if (!panel.hidden) return hide();
    panel.hidden = false; toggle.setAttribute('aria-expanded','true');
    if (!loaded || !enabled) init(); else if (!busy) input.focus();
  });
  close.addEventListener('click',hide);
  panel.addEventListener('keydown',event => {if(event.key === 'Escape') {event.preventDefault();hide();}});
  async function ask(text) {
    if (!enabled || busy || !text.trim()) return;
    message(text,'user');input.value='';busy=true;controls();status.textContent='L’assistant vous répond…';
    try {const data=await request({message:text});message(data.text);status.textContent='';}
    catch(error) {status.textContent=error.message;}
    finally {busy=false;controls();if(!panel.hidden)input.focus();}
  }
  document.getElementById('bocalChatForm').addEventListener('submit',event=>{event.preventDefault();ask(input.value.trim());});
  choices.forEach(button=>button.addEventListener('click',()=>ask(button.dataset.chatQuestion)));
  reset.addEventListener('click',async()=>{
    if(busy || !csrf)return;busy=true;controls();
    try {await request({action:'reset'});log.replaceChildren();message('La discussion a été effacée. Comment puis-je vous aider ?');status.textContent=enabled?'':'L’assistant IA n’est pas encore activé.';}
    catch(error){status.textContent=error.message;}
    finally {busy=false;controls();}
  });
  controls();
})();
