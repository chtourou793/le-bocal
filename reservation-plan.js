(() => {
'use strict';
const $ = id => document.getElementById(id);
const date=$('date_reservation'),time=$('heure_reservation'),people=$('nb_personnes'),chosen=$('table_id'),list=$('table-list'),status=$('availability-status'),scene=$('terrace-scene'),layer=$('plan-tables'),submit=$('book-submit');
let tables=JSON.parse($('table-defaults').textContent).map(t=>({...t,status:'unknown'})),valid=false,serial=0,weatherSerial=0,controller,weatherController,debounce;
const labels={available:'Libre',occupied:'Indisponible',closed:'Indisponible',pending:'Placement à confirmer',small:'Trop petite',unknown:'À vérifier'};
const slot=()=>`${date.value}|${time.value}|${people.value}`;
function selection(){
 const t=tables.find(t=>String(t.id)===chosen.value&&t.status==='available');
 if(!t||!valid)chosen.value='';
 layer.querySelectorAll('.plan-table').forEach(b=>{const yes=b.dataset.id===chosen.value;b.classList.toggle('selected',yes);b.setAttribute('aria-pressed',String(yes));});
 list.value=chosen.value;submit.disabled=!chosen.value||!valid;
 $('selection-summary').textContent=chosen.value?`Table ${t.id} · ${people.value} personne${+people.value>1?'s':''}\n${date.value.split('-').reverse().join('/')} à ${time.value} · 2 heures`:'Choisissez une table libre sur le plan.';
}
function draw(){
 layer.replaceChildren();list.replaceChildren(new Option(valid?'Choisir une table…':'En attente du créneau',''));
 tables.forEach(t=>{
  const b=document.createElement('button');b.type='button';b.className='plan-table '+t.status;b.style.left=t.x+'%';b.style.top=t.y+'%';b.dataset.id=String(t.id);b.textContent=String(t.id);b.disabled=!valid||t.status!=='available';
  b.setAttribute('aria-label',`Table ${t.id}, ${t.seats} places, ${labels[t.status]}`);b.title=b.getAttribute('aria-label');
  const small=document.createElement('small');small.textContent=t.seats+' pl.';b.append(small);b.addEventListener('click',()=>{chosen.value=String(t.id);selection();});layer.append(b);
  const option=new Option(`Table ${t.id} · ${t.seats} places · ${labels[t.status]}`,String(t.id));option.disabled=b.disabled;list.append(option);
 });list.disabled=!valid;selection();
}
function invalidate(message){valid=false;tables=tables.map(t=>({...t,status:'unknown'}));draw();status.textContent=message;}
const ready=()=>date.value&&time.value&&people.validity.valid&&date.validity.valid;
async function loadAvailability(silent=false){
 const seq=++serial;controller?.abort();controller=new AbortController();const current=slot();
 if(!ready()){invalidate('Choisissez une date, une heure et le nombre de personnes.');return;}
 if(!silent){valid=false;submit.disabled=true;status.textContent='Vérification des tables…';}
 const timer=setTimeout(()=>controller.abort(),12000);
 try{
  const response=await fetch(`availability.php?${new URLSearchParams({date:date.value,time:time.value,people:people.value})}`,{signal:controller.signal,cache:'no-store'});const data=await response.json();
  if(seq!==serial||current!==slot())return;
  if(!response.ok||!Array.isArray(data.tables)||data.tables.length!==18)throw new Error(data.error||'Impossible de vérifier les tables.');
  const previous=chosen.value;tables=data.tables;valid=true;draw();const count=tables.filter(t=>t.status==='available').length;
  status.textContent=data.unassigned?'L’équipe finalise le placement de ce créneau. Appelez-nous pour réserver.':`${count} table${count>1?'s':''} disponible${count>1?'s':''} pour votre groupe. Actualisé à ${new Date(data.checked_at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit',second:'2-digit',timeZone:'Europe/Paris'})}.`;
  if(previous&&!chosen.value)status.textContent='Votre table n’est plus disponible. Choisissez une autre table.';
 }catch(e){if(seq!==serial)return;invalidate(e.name==='AbortError'?'La vérification prend trop de temps. Réessayez ou appelez-nous.':e.message);}
 finally{clearTimeout(timer);}
}
async function loadWeather(){
 const seq=++weatherSerial;weatherController?.abort();weatherController=new AbortController();scene.dataset.weather='unknown';scene.dataset.light='day';$('light-label').textContent='Ambiance du créneau';$('weather-temp').textContent='';$('weather-icon').textContent='◌';
 if(!ready()){$('weather-label').textContent='Choisissez une date et une heure';$('weather-detail').textContent='L’ambiance s’adapte à votre créneau.';return;}
 $('weather-label').textContent='Lecture des prévisions…';$('weather-detail').textContent='';const timer=setTimeout(()=>weatherController.abort(),11000);
 try{
  const response=await fetch(`weather.php?${new URLSearchParams({date:date.value,time:time.value})}`,{signal:weatherController.signal,cache:'no-store'});const data=await response.json();if(seq!==weatherSerial)return;if(!response.ok)throw new Error();
  scene.dataset.light=data.light;scene.dataset.weather=data.available?data.weather:'unknown';$('light-label').textContent={day:'En journée',twilight:'À la tombée du jour',night:'En soirée'}[data.light]||'';
  $('weather-label').textContent=data.label;$('weather-icon').textContent=data.available?({rain:'☂',snow:'❄',cloudy:'☁',clear:data.light==='night'?'☾':'☀',unknown:'◌'}[data.weather]):'◌';
  $('weather-temp').textContent=data.available?data.temperature+'°C':'';
  $('weather-detail').textContent=data.available?`${data.stale?'Dernière prévision en cache · ':''}Prévision pour ${new Date(data.forecast_at).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',timeZone:'Europe/Paris'})} · pas de ${data.resolution_hours} h`:`Météo non disponible · lever ${data.sunrise}, coucher ${data.sunset}.`;
 }catch(e){if(seq===weatherSerial){$('weather-label').textContent='Météo momentanément indisponible';$('weather-detail').textContent='Les disponibilités des tables restent consultables.';}}
 finally{clearTimeout(timer);}
}
function change(){++serial;++weatherSerial;controller?.abort();weatherController?.abort();chosen.value='';invalidate('Vérification du nouveau créneau…');clearTimeout(debounce);debounce=setTimeout(()=>{loadAvailability();loadWeather();},250);}
[date,time,people].forEach(el=>el.addEventListener('input',change));list.addEventListener('change',()=>{chosen.value=list.value;selection();});
$('booking-form').addEventListener('submit',e=>{if(!valid||!chosen.value){e.preventDefault();status.textContent='Choisissez une table disponible avant d’envoyer.';return;}submit.disabled=true;submit.textContent='Envoi en cours…';});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){loadAvailability(true);loadWeather();}else{++serial;controller?.abort();valid=false;submit.disabled=true;}});
setInterval(()=>{if(!document.hidden&&ready())loadAvailability(true);},20000);setInterval(()=>{if(!document.hidden&&ready())loadWeather();},600000);
draw();if(ready()){loadAvailability();loadWeather();}
})();
