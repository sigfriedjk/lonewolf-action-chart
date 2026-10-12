/* No dependencies, network calls, or build step. All adventure data stays in this browser. */
'use strict';
const R = window.LWRules;
const C = window.LWCampaign;
const STORAGE_KEY = 'lone-wolf-action-chart-v2';
const LEGACY_KEY = 'lone-wolf-action-chart-v1';
const $ = selector => document.querySelector(selector);
const escapeHTML = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const clone = value => JSON.parse(JSON.stringify(value));
const signed = value => value > 0 ? `+${value}` : String(value);
const uniqueWeapons = [...new Set(R.weapons)];
let view = 'chart', gearView = 'backpack', gearPage = 0, roundPage = 0;
let toastTimer, storageAvailable = true, recoveryNotice = '', chartRollCount = 0;
const undoStack = [];
function randomNumber() {
  // Rejection sampling gives each result from 0 through 9 the same chance.
  const values = new Uint32Array(1);
  do { crypto.getRandomValues(values); } while (values[0] >= 4294967290);
  return values[0] % 10;
}
const newCharacter = C.newCharacter;
function load() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY);
    if (saved) return C.validateSave(JSON.parse(saved));
  } catch {
    recoveryNotice = 'Saved data could not be loaded. Import a backup from the menu if available.';
  }
  return {version:2,activeBook:1,books:{1:newCharacter()}};
}
let campaign = load();
let state = campaign.books[campaign.activeBook];
function persist() {
  campaign.books[campaign.activeBook] = state;
  try { localStorage.setItem(STORAGE_KEY,JSON.stringify(campaign)); storageAvailable = true; }
  catch { storageAvailable = false; }
  $('#save-state').textContent = storageAvailable ? 'Saved on device' : 'Use Export to save';
  $('#save-state').dataset.unavailable = String(!storageAvailable);
}
function toast(message) {
  clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').classList.add('show');
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'),3500);
}
function change(fn, message) {
  campaign.books[campaign.activeBook] = state;
  undoStack.push(clone(campaign)); if (undoStack.length > 30) undoStack.shift();
  fn(state);
  if (state.combat?.status==='active' && state.ep===0) state.combat.status='defeat';
  persist(); render(); if (message) toast(message);
}
function undo() {
  if (!undoStack.length) return toast('Nothing to undo yet.');
  campaign = undoStack.pop(); state = campaign.books[campaign.activeBook]; persist(); render(); toast('Last change undone.');
}
const icons = {
  chart:'<path d="M5 3h14v18H5zM9 7h6M9 11h6M9 15h3"/>',
  kai:'<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/>',
  gear:'<path d="M7 7V5a5 5 0 0 1 10 0v2M5 7h14l1 14H4zM8 12h8v6H8z"/>',
  special:'<path d="m12 3 3 6 6 3-6 3-3 6-3-6-6-3 6-3zM19 2v4M17 4h4"/>',
  combat:'<path d="m4 3 13 13M3 4l1 4 4-4-4-1zM14 18l4-4M16 17l4 4M20 3 3 20M16 4l4-1-1 4M3 21l4-4M5 14l5 5"/>',
  journal:'<path d="M4 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H4zM13 7a3 3 0 0 1 3-3h4v15h-3a4 4 0 0 0-4 2"/>'
};
function heading(title, controls = '') { return `<div class="tab-toolbar"><h2 title="${escapeHTML(title)}">${escapeHTML(title)}</h2>${controls}</div>`; }
const settingsIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 2h4l.6 3 1.8 1 2.9-.9 2 3.5-2.3 2v2.8l2.3 2-2 3.5-2.9-.9-1.8 1-.6 3h-4l-.6-3-1.8-1-2.9.9-2-3.5 2.3-2v-2.8l-2.3-2 2-3.5 2.9.9 1.8-1z"/><circle cx="12" cy="12" r="3"/></svg>';
function scoreSettings(label) {
  return `<button class="text-button score-settings" data-action="stats" aria-label="Edit ${label}" title="Edit ${label}">${settingsIcon}</button>`;
}
function pageChart() {
  const max = R.maxEndurance(state), skill = R.combatSkill(state);
  const weapon = state.equipped===-2?'Sommerswerd':state.weapons[state.equipped] || 'Unarmed (−4)';
  return `${heading('Lone Wolf',`<button class="toolbar-button" data-action="undo" ${!undoStack.length?'disabled':''}>↶ Undo</button>`)}
    <div class="grid-two">
      <section class="card combat-skill-card"><div class="stat-top"><h3 class="card-title">Combat skill</h3>${scoreSettings('combat skill')}</div><div class="stat-value">${skill.total}</div><p class="caption">${state.baseCS} base ${signed(skill.total-state.baseCS)} bonus</p><button class="secondary weapon-select" data-action="weapons" aria-label="Open weapons dialog, equipped: ${escapeHTML(weapon)}" aria-haspopup="dialog"><span>${escapeHTML(weapon)}</span>${settingsIcon}</button></section>
      <section class="card endurance"><div class="stat-top"><h3 class="card-title">Endurance</h3>${scoreSettings('endurance')}</div><div class="stat-value">${state.ep}<small> / ${max}</small></div><div class="meter" role="meter" aria-label="Endurance" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${state.ep}"><span style="width:${state.ep/max*100}%"></span></div><div class="stat-controls"><button class="square" data-action="ep" data-value="-1" aria-label="Lose one endurance" ${!state.ep?'disabled':''}>−</button><button class="square" data-action="ep" data-value="1" aria-label="Restore one endurance" ${!state.ep || state.ep===max?'disabled':''}>+</button></div></section>
    </div>
    ${state.ep === 0 ? '<div class="combat-result defeat">Your adventure has ended. Undo a mistake, or start a new adventure from the menu.</div>' : ''}
    <div class="resources"><section class="card resource gold-resource" aria-label="Gold Crowns"><button class="text-button" data-action="gold"><span class="resource-icon" aria-hidden="true">◈</span><span><span class="resource-value">${state.gold} <small>/ 50</small></span><br><span class="resource-label">Gold Crowns · edit</span></span></button><div class="gold-controls"><button class="square" data-action="gold-adjust" data-value="-1" aria-label="Spend one Gold Crown" ${!state.gold?'disabled':''}>−</button><button class="square" data-action="gold-adjust" data-value="1" aria-label="Gain one Gold Crown" ${state.gold===Number.MAX_SAFE_INTEGER?'disabled':''}>+</button></div></section><section class="card resource meal-resource" aria-label="Meals"><button class="text-button" data-action="view" data-view="gear" data-gear="backpack"><span class="resource-icon" aria-hidden="true">♧</span><span><span class="resource-value">${state.meals}</span><br><span class="resource-label">Meals · Backpack ›</span></span></button><button class="secondary meal-eat" data-action="eat" ${!state.ep?'disabled':''}>Eat a Meal</button></section></div>
    <section class="card random"><div><h3 class="card-title">Random number</h3><p class="caption">0–9 · zero counts as zero</p></div><strong class="die" aria-hidden="true">${state.lastRoll ?? '—'}</strong><span id="roll-status" class="sr-only" role="status" aria-live="polite"></span><button class="secondary" data-action="roll">Roll</button></section>
    <p class="footer-note stats-note">You are the last of the Kai. So this Action Chart autosaves</p>`;
}
function pageKai() {
  return `${heading('Disciplines',`<button class="toolbar-button" data-action="mastery-dialog" aria-label="Edit Weaponskill mastery">Mastery: ${state.mastery} ✎</button>`)}
    <div class="discipline-grid">${R.disciplines.map(([name])=>`<button class="discipline" aria-pressed="${state.disciplines.includes(name)}" aria-haspopup="dialog" aria-describedby="discipline-hint" data-action="discipline" data-name="${name}"><span class="check" aria-hidden="true">✓</span>${name}</button>`).join('')}</div>
    <p class="selection-summary"><span>${state.disciplines.length} of ${C.limit(state)} selected</span><span>${state.disciplines.length===C.limit(state)?'Skills ready':`Choose ${C.limit(state)-state.disciplines.length} more`}</span></p>
    <p class="gesture-hint" id="discipline-hint">Tap to read · Hold to select or remove</p>
    <p class="footer-note">Mindblast and equipped Weaponskill bonuses apply in combat.<br>Use Healing once per section without combat.</p>`;
}
function pageGear() {
  const entries=[...Array(state.meals).fill('Meal'),...state.backpack];
  const slots=Array.from({length:8},(_,i)=>i<entries.length?equipmentRow(entries[i],i,'backpack'):`<button class="item empty-slot" data-action="add-item" data-type="backpack" aria-label="Backpack slot ${i+1}: Empty, add item"><span class="number">${String(i+1).padStart(2,'0')}</span><span class="grow">Empty slot</span><span aria-hidden="true">＋</span></button>`).join('');
  return `${heading('Backpack',`<span class="toolbar-status">${entries.length} / 8 slots</span>`)}<div class="inventory-list backpack-list" aria-label="Eight backpack slots">${slots}</div><p class="footer-note">Tap an empty slot to add supplies.<br>Each Meal takes one slot.</p>`;
}
function pageSpecial() {
  const entries=state.special,size=specialPageSize();
  gearPage = Math.min(gearPage,Math.max(0,Math.ceil(entries.length/size)-1));
  const items=entries.slice(gearPage*size,gearPage*size+size).map((entry,i)=>equipmentRow(entry,gearPage*size+i,'special')).join('');
  const full=entries.length===100;
  return `${heading('Special Items',`<button class="toolbar-button" data-action="undo" ${!undoStack.length?'disabled':''}>↶ Undo</button>`)}<div class="inventory-list">${items}${!full?'<button class="item empty-slot" data-action="add-item" data-type="special"><span aria-hidden="true">＋</span><span>Add a Special Item<small>No fixed slot limit</small></span></button>':''}</div>${entries.length>size?`<div class="pager"><button class="square" data-action="gear-page" data-value="-1" aria-label="Previous items" ${gearPage===0?'disabled':''}>‹</button><span>Page ${gearPage+1} of ${Math.ceil(entries.length/size)}</span><button class="square" data-action="gear-page" data-value="1" aria-label="Next items" ${gearPage+1>=Math.ceil(entries.length/size)?'disabled':''}>›</button></div>`:''}<p class="footer-note special-note">Worn or carried separately. These do not use backpack or regular weapon slots.</p>`;
}
function equipmentRow(entry,index,type,returnToWeapons=false) {
  const name=type==='special'?entry.name:entry;
  const note=type==='special'?`${entry.effect}${entry.ep?` · +${entry.ep} max EP`:''}${entry.cs?` · +${entry.cs} CS`:''}`:type==='weapons'?state.equipped===index?'Ready for combat':'Carried weapon':name==='Meal'?'One backpack slot':'Backpack Item';
  const returnAttr=returnToWeapons?'data-return="weapons"':'';
  return `<div class="item"><span class="number">${String(index+1).padStart(2,'0')}</span><div class="grow"><div class="item-name">${escapeHTML(name)}</div><div class="item-note">${escapeHTML(note)}</div></div>${type==='weapons' || type==='special' && name==='Sommerswerd'?`<button class="equip ${(type==='weapons'?state.equipped===index:state.equipped===-2)?'active':''}" data-action="equip" data-index="${type==='weapons'?index:-2}" ${returnAttr} aria-label="Equip ${escapeHTML(name)}">${(type==='weapons'?state.equipped===index:state.equipped===-2)?'Equipped':'Equip'}</button>`:name==='Healing Potion' && type==='backpack'?`<button class="equip" data-action="potion" data-index="${index-state.meals}" ${!state.ep || state.combat?.status==='active'?'disabled':''}>Use +4</button>`:''}<button class="icon-button" data-action="remove-item" data-type="${type}" data-index="${index}" ${returnAttr} aria-label="Remove ${escapeHTML(name)}">×</button></div>`;
}
function weaponsDialog() {
  const slots=Array.from({length:2},(_,i)=>state.weapons[i]?equipmentRow(state.weapons[i],i,'weapons',true):`<button class="item empty-slot" data-action="add-item" data-type="weapons"><span class="number">${String(i+1).padStart(2,'0')}</span><span>Empty weapon slot<small>＋ Add a weapon</small></span></button>`).join('');
  dialog('Weapons',`<div class="form-stack"><p class="caption">${state.weapons.length} / 2 regular weapon slots · equip one for combat</p><div class="inventory-list">${slots}</div>${state.special.some(v=>v.name==='Sommerswerd')?`<button class="secondary full" data-action="equip" data-index="-2" data-return="weapons">${state.equipped===-2?'✓ Equipped':'Equip'} Sommerswerd</button><p class="caption">Sommerswerd is a Special Item; it uses no regular weapon slot.</p>`:''}<button class="secondary full" data-action="unarmed" data-return="weapons">${state.equipped===-1?'✓ ':''}Fight unarmed (−4 combat skill)</button><p class="hint">Remove a weapon with ×. Undo is available on Stats.</p></div>`);
}
function specialPageSize() { return Math.max(1,pageSize()-1); }
function pageSize() { return matchMedia('(max-height:660px)').matches ? 2 : matchMedia('(max-height:760px)').matches ? 3 : 4; }
function pageCombat() {
  const c = state.combat;
  if (!c) return `${heading('Combat',`<span class="toolbar-status">Your CS <strong>${R.combatSkill(state).total}</strong></span>`)}<form id="combat-form" class="form-stack"><label>Enemy name<input name="name" maxlength="80" placeholder="e.g. Gourgaz" required></label><div class="grid-two"><label>Combat skill<input name="cs" type="number" inputmode="numeric" min="0" max="99" value="15" required></label><label>Endurance<input name="ep" type="number" inputmode="numeric" min="1" max="999" value="20" required></label></div><div class="grid-two"><label>Section CS modifier<input name="modifier" type="number" inputmode="numeric" min="-99" max="99" value="0" required></label><label class="checkbox-row"><input name="immune" type="checkbox">Immune to Mindblast</label></div>${state.book===2?'<div class="combat-options"><label class="checkbox-row"><input name="undead" type="checkbox">Undead enemy</label></div>':''}<p class="hint">Your combat skill: ${R.combatSkill(state).total}. Add any section-specific skill adjustment above.</p><button class="primary full" ${!state.ep?'disabled':''}>Start combat</button></form><p class="footer-note">One round at a time, using the Kai Combat Results Table.<br>${state.book===2?'Equipped Sommerswerd doubles damage to undead.':'Follow your section for special combat effects.'}</p>`;
  const skill = R.combatSkill(state,c.immune,c.modifier), ratio = skill.total-c.cs, active = c.status==='active';
  const latest = c.rounds.at(-1);
  const outcome = {victory:'Victory. Your enemy has fallen.',defeat:'You have fallen. Your adventure ends here.',evaded:'You escaped from combat.'};
  const status = active?`Round ${c.rounds.length+1}`:c.status==='victory'?'Victory':c.status==='evaded'?'Escaped':'Defeat';
  return `${heading(c.name,c.rounds.length?`<button class="toolbar-button ${c.status==='defeat'?'dead':''}" data-action="combat-log" aria-label="View combat history, ${c.rounds.length} rounds">${status} · Log ▾</button>`:`<span class="toolbar-status">${status}</span>`)}
    <div class="combat-hero"><div><div class="combat-title">Lone Wolf</div><div class="combat-number">${state.ep}</div><div class="caption">Endurance · CS ${skill.total}</div></div><div class="ratio"><div class="caption">RATIO</div><strong>${signed(ratio)}</strong></div><div><div class="combat-title">Enemy</div><div class="combat-number">${c.ep}</div><div class="caption">Endurance · CS ${c.cs}</div></div></div>
    <p class="hint">${state.baseCS} base ${signed(state.csBonus)} bonus ${skill.equipment?` · Equipment +${skill.equipment}`:''}${skill.sunSword?' · Sommerswerd +8':''}${c.undead&&skill.sunSword?' · Undead damage ×2':''}${skill.mastery?' · Weaponskill +2':''}${skill.mindblast?' · Mindblast +2':''}${skill.unarmed?' · Unarmed −4':''}${c.modifier?` · Section ${signed(c.modifier)}`:''}${c.immune?' · Mindblast immune':''}</p>
    ${!active?`<div class="combat-result ${c.status==='defeat'?'defeat':''}">${outcome[c.status]}</div>`:latest?`<div class="combat-result">Roll <strong>${latest.roll}</strong> · You lost <strong>${latest.heroLoss}</strong> · Enemy lost <strong>${latest.enemyLoss}</strong></div>`:'<p class="caption">Ready. Roll a number or enter one from the book.</p>'}
    ${active?`<div class="row"><label class="grow" for="combat-roll">Random number (optional)<select id="combat-roll"><option value="random">Roll automatically</option>${Array.from({length:10},(_,i)=>`<option value="${i}">${i}</option>`).join('')}</select></label><button class="primary" style="align-self:end" data-action="round">Fight round</button></div><div class="row"><button class="secondary grow" data-action="evade">Evade…</button><button class="secondary grow" data-action="undo" ${!undoStack.length?'disabled':''}>Undo round</button></div>`:`<div class="row"><button class="primary grow" data-action="finish-combat">Next combat</button><button class="secondary" data-action="undo" ${!undoStack.length?'disabled':''}>Undo</button></div>`}
    <p class="footer-note">Evasion is allowed only when your book offers it.</p>`;
}
function pageJournal() {
  return `${heading('Journal','<div class="toolbar-actions"><button class="toolbar-button" data-action="rules">Rules</button><button class="toolbar-button" data-action="export">Export save</button></div>')}<textarea class="journal" id="notes" maxlength="20000" aria-label="Adventure notes" placeholder="Clues, choices, and things to remember…">${escapeHTML(state.notes)}</textarea><p class="notes-meta"><span>Saved as you write</span><span id="notes-count">${state.notes.length.toLocaleString()} / 20,000</span></p>`;
}
function render() {
  cancelDisciplinePress(true);
  $('#book-button').textContent = `${String(state.book).padStart(2,'0')} / ${C.books[state.book].title} ▾`;
  $('#section-bookmark').textContent = `Section ${state.section} ✎`;
  $('#section-bookmark').ariaLabel = `Edit section bookmark, section ${state.section}`;
  $('#main').ariaLabel = view==='chart'?'Stats':view==='kai'?'Kai Disciplines':view==='gear'?'Backpack':view==='special'?'Special Items':view[0].toUpperCase()+view.slice(1);
  $('#main').dataset.view = view;
  $('#main').innerHTML = ({chart:pageChart,kai:pageKai,gear:pageGear,special:pageSpecial,combat:pageCombat,journal:pageJournal})[view]();
  const labels={chart:'Stats',kai:'Kai',gear:'Backpack',special:'Special',combat:'Combat',journal:'Journal'};
  $('.bottom-nav').innerHTML = Object.entries(icons).map(([key,path])=>`<button class="nav-button" data-action="view" data-view="${key}" ${view===key?'aria-current="page"':''}><svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>${labels[key]}</button>`).join('');
}
function switchView(next) { view = next; if(next==='gear')gearView='backpack';else if(next==='special')gearView='special';render(); $('#main').scrollTop = 0; }
function weaponOptions(selected) { return uniqueWeapons.map(w=>`<option ${w===selected?'selected':''}>${w}</option>`).join(''); }
function dialog(title, content) {
  $('#dialog').innerHTML = `<div class="dialog-heading"><h2 id="dialog-title">${title}</h2><button class="icon-button" data-action="close-dialog" aria-label="Close dialog">×</button></div>${content}`;
  if (!$('#dialog').open) $('#dialog').showModal();
}
function closeDialog() { $('#dialog').close(); }
function disciplineDialog(name) {
  const discipline=R.disciplines.find(d=>d[0]===name);
  if (!discipline) return;
  const selected=state.disciplines.includes(name), full=!selected && state.disciplines.length>=C.limit(state);
  dialog(name,`<div class="form-stack"><p class="discipline-description">${escapeHTML(discipline[1])}</p>${name==='Weaponskill'?`<p class="hint">Your mastery: <strong>${state.mastery}</strong>. ${state.book===2?'Sword, Short Sword, and Broadsword mastery also apply to the Sommerswerd.':''}</p>`:''}<p class="discipline-status">${selected?'✓ Selected':'Not selected'} · ${state.disciplines.length} of ${C.limit(state)} skills chosen</p>${full?'<p class="hint">Your skills are full. Remove another Discipline before selecting this one.</p>':''}<button class="primary full" data-action="toggle-discipline" data-name="${name}" ${full?'disabled':''}>${selected?'Remove this Discipline':'Select this Discipline'}</button></div>`);
}
function toggleDiscipline(name) {
  if (!R.disciplines.some(d=>d[0]===name)) return;
  const selected=state.disciplines.includes(name);
  if (!selected && state.disciplines.length>=C.limit(state)) return toast(`Choose ${C.limit(state)}. Remove a skill to replace it.`);
  change(s=>s.disciplines=selected?s.disciplines.filter(d=>d!==name):[...s.disciplines,name],`${name} ${selected?'removed':'selected'}.`);
  $(`[data-action="discipline"][data-name="${name}"]`)?.focus({preventScroll:true});
}
// Selection happens on release after a deliberate hold, never from a short tap.
const DISCIPLINE_HOLD_MS=550;
let disciplinePress=null, suppressedDisciplineClick=null;
function cancelDisciplinePress(suppress=false) {
  const press=disciplinePress;
  if (!press) return;
  disciplinePress=null;
  clearTimeout(press.timer);
  press.button.classList.remove('holding','hold-ready');
  if (suppress) suppressedDisciplineClick={name:press.name,until:Date.now()+1000};
  if (press.button.hasPointerCapture?.(press.id)) press.button.releasePointerCapture(press.id);
  const hint=$('#discipline-hint');
  if (hint) hint.textContent='Tap to read · Hold to select or remove';
}
document.addEventListener('pointerdown',event=>{
  const button=event.target.closest('[data-action="discipline"]');
  if (!button || event.button!==0 || event.isPrimary===false || $('#dialog').open) return;
  cancelDisciplinePress(true);suppressedDisciplineClick=null;
  const press={button,name:button.dataset.name,id:event.pointerId,x:event.clientX,y:event.clientY,ready:false,timer:null};
  disciplinePress=press;
  button.classList.add('holding');
  // Capture keeps release/cancellation tied to this gesture if it leaves the tile.
  try {button.setPointerCapture?.(press.id);} catch { /* Document listeners still handle the gesture. */ }
  press.timer=setTimeout(()=>{
    if (disciplinePress!==press || !button.isConnected || view!=='kai' || $('#dialog').open) return;
    press.ready=true;button.classList.add('hold-ready');
    $('#discipline-hint').textContent=`Release to ${state.disciplines.includes(press.name)?'remove':'select'} ${press.name}`;
  },DISCIPLINE_HOLD_MS);
});
document.addEventListener('pointermove',event=>{
  const press=disciplinePress;
  if (press?.id===event.pointerId && Math.hypot(event.clientX-press.x,event.clientY-press.y)>10) cancelDisciplinePress(true);
});
document.addEventListener('pointerup',event=>{
  const press=disciplinePress;
  if (press?.id!==event.pointerId) return;
  const bounds=press.button.getBoundingClientRect();
  if (Math.hypot(event.clientX-press.x,event.clientY-press.y)>10 || event.clientX<bounds.left || event.clientX>bounds.right || event.clientY<bounds.top || event.clientY>bounds.bottom) return cancelDisciplinePress(true);
  cancelDisciplinePress(press.ready);
  if (press.ready) toggleDiscipline(press.name);
});
for (const type of ['pointercancel','lostpointercapture']) document.addEventListener(type,event=>{
  if (disciplinePress?.id===event.pointerId) cancelDisciplinePress(true);
});
document.addEventListener('contextmenu',event=>{if(event.target.closest('[data-action="discipline"]'))event.preventDefault();});
window.addEventListener('blur',()=>cancelDisciplinePress(true));
window.addEventListener('scroll',()=>cancelDisciplinePress(true),true);
function combatLogDialog() {
  const c=state.combat;
  if (!c) return;
  const size=8,pages=Math.max(1,Math.ceil(c.rounds.length/size));
  roundPage=R.clamp(roundPage,0,pages-1);
  const rounds=[...c.rounds].reverse().slice(roundPage*size,roundPage*size+size);
  dialog('Combat history',`<div class="form-stack"><p class="caption">${escapeHTML(c.name)} · ${c.rounds.length} rounds · newest first</p><table class="combat-log"><thead><tr><th>Round</th><th>Roll</th><th>Ratio</th><th>You lost</th><th>Enemy lost</th></tr></thead><tbody>${rounds.map((r,i)=>`<tr><td>${c.rounds.length-roundPage*size-i}${r.evade?' ↗':''}</td><td>${r.roll}</td><td>${signed(r.ratio)}</td><td>${r.heroLoss}</td><td>${r.enemyLoss}</td></tr>`).join('')}</tbody></table>${pages>1?`<div class="pager"><button class="square" data-action="round-page" data-value="-1" aria-label="Newer rounds" ${roundPage===0?'disabled':''}>‹</button><span>Page ${roundPage+1} of ${pages}</span><button class="square" data-action="round-page" data-value="1" aria-label="Older rounds" ${roundPage+1>=pages?'disabled':''}>›</button></div>`:''}<p class="hint">↗ marks an evasion round. Your book determines when evasion is allowed.</p></div>`);
}
function booksDialog() {
  const first=campaign.books[1], eligible=first?.ep>0 && first.disciplines.length===5 && first.combat?.status!=='active';
  dialog('Your books',`<div class="menu-options">${Object.entries(C.books).map(([id,book])=>{
    const saved=campaign.books[id];
    return `<button class="secondary book-choice" data-action="switch-book" data-book="${id}" ${Number(id)===state.book?'aria-current="page"':''}><strong>Book ${id} · ${book.title}</strong><small>${saved?`Section ${saved.section} · ${saved.ep}/${R.maxEndurance(saved)} EP · ${saved.disciplines.length} disciplines${Number(id)===state.book?' · Current book':''}`:'Not started'}</small></button>`;
  }).join('')}${!campaign.books[2]?`<button class="primary" data-action="continue-book2" ${eligible?'':'disabled'}>Carry Book 1 character into Book 2 →</button><button class="secondary" data-action="fresh-book2">Start Book 2 with a fresh character</button>`:''}</div><p class="hint" style="margin-top:16px">Each book keeps its own chart, equipment, and notes.${!campaign.books[2]&&!eligible?' Choose five Book 1 disciplines and finish any combat before continuing.':''}</p>`);
}
function selectBook(book) {
  if (book===2 && !campaign.books[2]) return book2Dialog(Boolean(campaign.books[1]?.ep && campaign.books[1].disciplines.length===5 && campaign.books[1].combat?.status!=='active'));
  if (book===campaign.activeBook) return closeDialog();
  change(()=>{campaign.activeBook=book;state=campaign.books[book] || newCharacter();},`Book ${book} chart opened.`);
  gearPage=roundPage=0;closeDialog();switchView('chart');
}
function book2Dialog(continuing) {
  const source=continuing?campaign.books[1]:null;
  if (continuing && (!source?.ep || source.disciplines.length!==5 || source.combat?.status==='active')) return toast('Choose five Book 1 disciplines and finish combat before continuing.');
  const available=R.disciplines.filter(([name])=>!source?.disciplines.includes(name));
  const supplyOptions=selected=>`<option value="">No item</option>${C.armoury.map(item=>`<option ${item===selected?'selected':''}>${item}</option>`).join('')}`;
  dialog(continuing?'Continue into Book 2':'Start Book 2',`<form id="book2-form" data-continuing="${continuing}" class="form-stack"><p class="caption">Fire on the Water${campaign.books[2]?' · This replaces your Book 2 chart; Undo is available.':''}</p>${source?`<div class="carry-summary"><strong>Your Book 1 character travels with you.</strong><br>CS ${source.baseCS} · EP ${source.ep}/${R.maxEndurance(source)} · ${source.gold} Gold Crowns<br>${source.weapons.length} weapons · ${source.meals+source.backpack.length}/8 backpack slots · ${source.special.length} Special Items<br>${source.disciplines.map(escapeHTML).join(', ')}</div><p class="hint">Scores, current endurance, equipment, mastery, and journal are copied. Your Book 1 chart stays saved. Book 2 starts at section 1.</p><label class="checkbox-row"><input name="completed" type="checkbox" required>I successfully completed Book 1</label><label>Learn a sixth Kai Discipline<select name="discipline">${available.map(([name])=>`<option>${name}</option>`).join('')}</select></label>`:`<div class="grid-two"><label>Combat skill (10 + roll)<input name="cs" type="number" min="10" max="19" value="${10+randomNumber()}" required></label><label>Endurance (20 + roll)<input name="ep" type="number" min="20" max="29" value="${20+randomNumber()}" required></label></div><label>Weaponskill mastery<select name="mastery">${weaponOptions(R.weapons[randomNumber()])}</select></label><p class="hint">Choose five Kai Disciplines after starting. A Map and the Seal of Hammerdal are included.</p>`}<label>Royal gold (10 + roll)<input name="gold" type="number" min="10" max="19" value="${10+randomNumber()}" required></label><p class="hint">${source?'Added to your existing gold, including totals above 50.':'Your starting Gold Crowns.'} The Seal of Hammerdal is added to Special Items.</p>${source?.weapons.length?`<div><label>Keep carried weapons</label>${source.weapons.map((name,i)=>`<label class="checkbox-row"><input name="keep" type="checkbox" value="${i}" checked>${escapeHTML(name)}</label>`).join('')}<p class="hint">Uncheck a weapon to exchange it for a Royal Armoury weapon. Your Book 1 equipment is kept on its chart.</p></div>`:''}<div class="grid-two"><label>Royal Armoury item 1<select name="item1">${supplyOptions(source?'':'Sword')}</select></label><label>Royal Armoury item 2<select name="item2">${supplyOptions(source?'':'Two Meals')}</select></label></div><p class="hint">Take up to two different items. Two Meals uses two backpack slots. Carried equipment counts toward the usual limits.</p><p class="section-error" id="form-error" role="alert"></p><div class="dialog-actions"><button class="secondary" type="button" data-action="books">Back</button><button class="primary">Begin Book 2</button></div></form>`);
}
function statsDialog() {
  dialog('Edit your scores',`<form id="stats-form" class="form-stack"><div class="grid-two"><label>Base combat skill<input name="baseCS" type="number" min="0" max="99" value="${state.baseCS}" required></label><label>Extra CS bonus<input name="csBonus" type="number" min="-99" max="99" value="${state.csBonus}" required></label><label>Base endurance<input name="baseEP" type="number" min="1" max="99" value="${state.baseEP}" required></label><label>Extra EP bonus<input name="epBonus" type="number" min="0" max="99" value="${state.epBonus}" required></label></div><label>Current endurance<input name="ep" type="number" min="0" max="999" value="${state.ep}" required></label><p class="hint">Kai combat bonuses and Special Item endurance bonuses are added automatically. Use extra bonuses for other effects the book gives you. Current endurance is capped at your maximum.</p><button class="primary">Save scores</button></form>`);
}
function newDialog() {
  if (state.book===2) return book2Dialog(false);
  dialog('A new adventure',`<form id="new-form" class="form-stack"><p class="caption">Start Book 1 with fresh scores and equipment. This replaces your Book 1 chart; your Book 2 chart is kept. You can undo it.</p><div class="grid-two"><label>Combat skill (10 + roll)<input name="cs" type="number" min="10" max="19" value="${10+randomNumber()}" required></label><label>Endurance (20 + roll)<input name="ep" type="number" min="20" max="29" value="${20+randomNumber()}" required></label></div><label>Starting Gold Crowns (0–9)<input name="gold" type="number" min="0" max="9" value="${randomNumber()}" required></label><label>Item found at the monastery<select name="loot">${['Broadsword','Sword','Helmet (+2 EP)','Two Meals','Chainmail Waistcoat (+4 EP)','Mace','Healing Potion (+4 recovery)','Quarterstaff','Spear','12 Gold Crowns'].map((name,i)=>`<option value="${i}">${i} · ${name}</option>`).join('')}</select></label><label>Weaponskill mastery<select name="mastery">${weaponOptions(R.weapons[randomNumber()])}</select></label><p class="hint">An Axe, one Meal, and a Map are included. Choose five Kai Disciplines after starting.</p><div class="dialog-actions"><button class="secondary" type="button" data-action="reroll-new">Roll again</button><button class="primary">Begin adventure</button></div></form>`);
  $('#new-form select[name=loot]').value = String(randomNumber());
}
function itemDialog(type = gearView) {
  const special=type==='special'?`<label>Known item<select name="preset"><option value="custom">Custom Special Item</option><option>Shield</option>${state.book===2?'<option>Sommerswerd</option>':''}</select></label><label>Effect / how it is carried<input name="effect" maxlength="160" placeholder="e.g. Worn on your head"></label><div class="grid-two"><label>Maximum EP bonus<input name="ep" type="number" min="0" max="99" value="0" required></label><label>Combat skill bonus<input name="cs" type="number" min="0" max="99" value="0" required></label></div><p class="hint">Helmet: 2 EP. Chainmail: 4 EP. Shield: 2 CS. Sommerswerd adds 8 CS when equipped; leave its CS field at 0.</p>`:'';
  dialog(type==='weapons'?'Add a weapon':type==='backpack'?'Add to backpack':'Add a Special Item',`<form id="item-form" data-type="${type}" class="form-stack">${special}${type==='weapons'?`<label>Weapon<select name="name">${weaponOptions('Sword')}</select></label>`:`${type==='backpack'?'<label>Item type<select name="kind"><option value="item">Backpack Item</option><option value="meal">Meal</option><option value="potion">Healing Potion</option></select></label>':''}<label>Item name<input name="name" maxlength="80" placeholder="e.g. Torch" ${type==='special'?'required':''}></label>`}<p class="section-error" id="form-error" role="alert"></p><button class="primary">Add item</button></form>`);
}
function masteryDialog() {
  dialog('Weaponskill mastery',`<div class="form-stack"><label for="mastery">Mastered weapon<select id="mastery">${weaponOptions(state.mastery)}</select></label><p class="hint">Add 2 combat skill when you have Weaponskill and this weapon equipped. Mastery does not give you the weapon.</p><div class="dialog-actions"><button class="secondary" data-action="roll-mastery">Roll mastery</button><button class="primary" data-action="close-dialog">Done</button></div></div>`);
}
function eatMeal(force = false) {
  if (!state.ep) return toast('Your adventure has ended.');
  if (state.combat?.status==='active') return toast('Finish combat before eating.');
  if (state.disciplines.includes('Hunting') && !force) {
    dialog('Hunting provides food',`<p class="hint">You do not need to use a Meal when instructed to eat. If this section says Hunting cannot be used, apply the Meal requirement below.</p><div class="dialog-actions"><button class="secondary" data-action="close-dialog">Keep Meal</button><button class="primary" data-action="eat-required">Meal required</button></div>`); return;
  }
  if (state.meals) change(s=>s.meals--,'Meal eaten. One backpack slot freed.');
  else change(s=>s.ep=Math.max(0,s.ep-3),'No Meal available. Lost 3 endurance.');
}
function rollRound(evade = false, chosen = null) {
  if (state.combat?.status !== 'active' || !state.ep) return;
  const selected = chosen ?? $('#combat-roll')?.value;
  const roll = selected==='random' || selected===undefined ? randomNumber() : Number(selected);
  change(s=>{s.lastRoll=roll;R.resolveRound(s,roll,evade);});
  roundPage = 0;
  render();
}
function exportSave() {
  persist();
  const blob = new Blob([JSON.stringify(campaign,null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = 'lone-wolf-campaign-save.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast('Save exported. Keep it as a backup.');
}
function rulesDialog() {
  dialog(`Book ${state.book} · quick rules`,`<div class="rule-copy"><p><strong>Endurance.</strong> Zero ends the adventure. Recovery cannot exceed your maximum. Healing restores 1 point per numbered section without combat; apply it manually.</p><p><strong>Combat.</strong> Your combat skill minus the enemy’s gives the ratio. Weaponskill adds 2 with the mastered weapon equipped. Mindblast adds 2 unless the enemy is immune. Fighting unarmed subtracts 4.</p><p><strong>Evasion.</strong> Only when the book allows it. Resolve one round, ignoring damage to the enemy.</p><p><strong>Equipment.</strong> Two weapons, eight backpack slots including Meals, and a usual pouch limit of 50 Gold Crowns (the chart allows more). Special Items use no backpack slots.</p><p><strong>Food.</strong> Consume one Meal when instructed. Without food, lose 3 endurance. Hunting usually removes this requirement. A Healing Potion restores 4 endurance after combat.</p>${state.book===2?'<p><strong>Book 2.</strong> Returning characters learn a sixth Discipline. Shield adds 2 combat skill. Equip the Sommerswerd from Special Items to add 8, plus 2 for Weaponskill with Short Sword, Sword, or Broadsword. Tick Undead enemy to double its endurance loss.</p>':''}<p>Follow the book for special rules, damage multipliers, and other exceptions. Use Edit scores for manual adjustments.</p><p><a href="https://www.projectaon.org/en/xhtml/lw/${C.books[state.book].slug}/title.htm" target="_blank" rel="noopener">Read Book ${state.book} at Project Aon ↗</a></p><p class="hint">Unofficial fan-made prototype. Lone Wolf created by Joe Dever. Rules source: Project Aon. Inspired by <a href="https://www.projectaon.org/staff/eric/lw01.htm" target="_blank" rel="noopener">Eric’s Action Chart</a>. No book text or illustrations are included in the app.</p></div>`);
}
document.addEventListener('click',event=>{
  const button = event.target.closest('[data-action]'); if (!button || button.disabled) return;
  const action = button.dataset.action;
  if (action==='view') switchView(button.dataset.view);
  else if (action==='books') booksDialog();
  else if (action==='switch-book') selectBook(Number(button.dataset.book));
  else if (action==='continue-book2') book2Dialog(true);
  else if (action==='fresh-book2') book2Dialog(false);
  else if (action==='close-dialog') closeDialog();
  else if (action==='stats') statsDialog();
  else if (action==='bookmark') dialog('Section bookmark',`<form id="bookmark-form" class="form-stack"><label>Current book section<input name="section" type="number" inputmode="numeric" min="1" max="350" value="${state.section}" required></label><p class="hint">This is a bookmark only. Apply any Healing or section effects yourself.</p><button class="primary">Save bookmark</button></form>`);
  else if (action==='ep') change(s=>s.ep=R.clamp(s.ep+Number(button.dataset.value),0,R.maxEndurance(s)));
  else if (action==='roll') {
    change(s=>s.lastRoll=randomNumber());
    $('.random .die').classList.add('rolling');
    $('#roll-status').textContent=`Roll ${++chartRollCount}: ${state.lastRoll}`;
    $('[data-action="roll"]').focus({preventScroll:true});
  }
  else if (action==='gold-adjust') {
    change(s=>s.gold=R.clamp(s.gold+Number(button.dataset.value),0,Number.MAX_SAFE_INTEGER));
    $(`[data-action="gold-adjust"][data-value="${button.dataset.value}"]`).focus({preventScroll:true});
  }
  else if (action==='eat') eatMeal();
  else if (action==='eat-required') {closeDialog();eatMeal(true);}
  else if (action==='gold') dialog('Belt pouch',`<form id="gold-form" class="form-stack"><label>Gold Crowns<input name="gold" type="number" inputmode="numeric" min="0" max="${Number.MAX_SAFE_INTEGER}" value="${state.gold}" required></label><p class="hint">50 is the usual pouch limit. You can record more when needed.</p><button class="primary">Save gold</button></form>`);
  else if (action==='discipline') {
    const suppressed=suppressedDisciplineClick;
    suppressedDisciplineClick=null;
    if (event.detail!==0 && suppressed?.name===button.dataset.name && Date.now()<suppressed.until) return;
    disciplineDialog(button.dataset.name);
  }
  else if (action==='toggle-discipline') {toggleDiscipline(button.dataset.name);disciplineDialog(button.dataset.name);$('#dialog [data-action="toggle-discipline"]')?.focus({preventScroll:true});}
  else if (action==='mastery-dialog') masteryDialog();
  else if (action==='roll-mastery') { const roll=randomNumber();change(s=>{s.mastery=R.weapons[roll];s.lastRoll=roll;},`Rolled ${roll}: mastery in ${R.weapons[roll]}.`); if ($('#dialog').open) masteryDialog(); }
  else if (action==='gear-page') {gearPage+=Number(button.dataset.value);render();}
  else if (action==='combat-log') {roundPage=0;combatLogDialog();}
  else if (action==='round-page') {roundPage+=Number(button.dataset.value);combatLogDialog();}
  else if (action==='weapons') weaponsDialog();
  else if (action==='add-item') itemDialog(button.dataset.type || gearView);
  else if (action==='equip') {change(s=>s.equipped=Number(button.dataset.index));if(button.dataset.return==='weapons')weaponsDialog();}
  else if (action==='unarmed') {change(s=>s.equipped=-1,'Unarmed: −4 combat skill.');if(button.dataset.return==='weapons')weaponsDialog();}
  else if (action==='remove-item') {
    if (state.combat?.status==='active') return toast('Finish combat before changing equipment.');
    const index=Number(button.dataset.index),type=button.dataset.type || gearView;
    change(s=>{
      if (type==='weapons') {s.weapons.splice(index,1);s.equipped=s.equipped===index?-1:s.equipped>index?s.equipped-1:s.equipped;}
      else if (type==='backpack') {if(index<s.meals)s.meals--;else s.backpack.splice(index-s.meals,1);}
      else {const bonus=s.special[index].ep;if(s.equipped===-2 && s.special[index].name==='Sommerswerd')s.equipped=-1;s.special.splice(index,1);s.ep=R.clamp(s.ep-bonus,0,R.maxEndurance(s));}
    },'Item removed. Undo is available in the menu.');
    if(button.dataset.return==='weapons')weaponsDialog();
  }
  else if (action==='potion') {
    if (state.ep===R.maxEndurance(state)) return toast('Endurance is already full. Potion kept.');
    change(s=>{s.backpack.splice(Number(button.dataset.index),1);s.ep=Math.min(R.maxEndurance(s),s.ep+4);},'Healing Potion used. Restored up to 4 endurance.');
  }
  else if (action==='round') rollRound();
  else if (action==='evade') dialog('Evade this enemy?',`<p class="hint">Continue only if your current section allows evasion. Resolve one round: you take damage and the enemy takes none.</p><div class="dialog-actions"><button class="secondary" data-action="close-dialog">Keep fighting</button><button class="primary" data-action="confirm-evade" data-roll="${$('#combat-roll').value}">Evade one round</button></div>`);
  else if (action==='confirm-evade') {const roll=button.dataset.roll;closeDialog();rollRound(true,roll);}
  else if (action==='finish-combat') change(s=>s.combat=null);
  else if (action==='undo') {closeDialog();undo();}
  else if (action==='export') exportSave();
  else if (action==='import') {closeDialog();$('#import-file').click();}
  else if (action==='new' || action==='reroll-new') newDialog();
  else if (action==='rules') rulesDialog();
});
$('#menu-button').addEventListener('click',()=>dialog('Adventure menu',`<div class="menu-options"><button class="secondary" data-action="undo" ${!undoStack.length?'disabled':''}>↶ Undo last change</button><button class="secondary" data-action="books">Switch books / continue journey</button><button class="secondary" data-action="stats">Edit scores</button><button class="secondary" data-action="export">Export save file</button><button class="secondary" data-action="import">Import save file</button><button class="secondary" data-action="rules">Book ${state.book} rules & credits</button><button class="danger-button" data-action="new">Start a new adventure…</button></div><p class="hint" style="margin-top:17px">${storageAvailable?'Changes save automatically in this browser.':'Browser storage is unavailable. Export your save before closing.'} Export to move your chart to another device.</p>`));
document.addEventListener('change',event=>{
  if(event.target.name==='preset') {
    const form=event.target.form, preset=event.target.value;
    if (preset==='custom') return;
    form.elements.name.value=preset;form.elements.ep.value=0;form.elements.cs.value=preset==='Shield'?2:0;
    form.elements.effect.value=preset==='Shield'?'+2 combat skill':'Equip for +8 CS; double damage to undead';
  }
  else if(event.target.id==='section') { const value=Number(event.target.value);if(Number.isInteger(value)&&value>=1&&value<=350)change(s=>s.section=value);else{event.target.value=state.section;toast('Choose a section from 1 to 350.');} }
  else if(event.target.id==='mastery') change(s=>s.mastery=event.target.value);
});
document.addEventListener('input',event=>{
  if(event.target.id==='notes') {state.notes=event.target.value;$('#notes-count').textContent=`${state.notes.length.toLocaleString()} / 20,000`;persist();}
});
document.addEventListener('submit',event=>{
  const form=event.target;event.preventDefault();const data=new FormData(form);const number=name=>Number(data.get(name));
  if(form.id==='new-form') {
    change(()=>{state=newCharacter(number('cs'),number('ep'),number('gold'),number('loot'),data.get('mastery'));},'Your journey begins. Choose five Kai Disciplines.');closeDialog();switchView('kai');
  }
  else if(form.id==='book2-form') {
    try {
      const continuing=form.dataset.continuing==='true';
      if (continuing && !data.has('completed')) throw new Error('Confirm that you successfully completed Book 1.');
      const next=C.startBook2(continuing?campaign.books[1]:null,{cs:number('cs'),ep:number('ep'),gold:number('gold'),mastery:data.get('mastery'),discipline:data.get('discipline'),keepWeapons:data.getAll('keep').map(Number),items:[data.get('item1'),data.get('item2')].filter(Boolean)});
      change(()=>{campaign.activeBook=2;state=next;},continuing?'Book 2 begins. Your Book 1 chart is saved.':'Book 2 begins. Choose five Kai Disciplines.');
      gearPage=roundPage=0;closeDialog();switchView(continuing?'chart':'kai');
    } catch(error) {$('#form-error').textContent=error.message;}
  }
  else if(form.id==='stats-form') {change(s=>{for(const key of ['baseCS','csBonus','baseEP','epBonus'])s[key]=number(key);s.ep=R.clamp(number('ep'),0,R.maxEndurance(s));if(s.combat?.status==='active'&&s.ep===0)s.combat.status='defeat';},'Scores updated.');closeDialog();}
  else if(form.id==='gold-form') {change(s=>s.gold=number('gold'));closeDialog();}
  else if(form.id==='bookmark-form') {change(s=>s.section=number('section'));closeDialog();}
  else if(form.id==='combat-form') {
    if(!state.ep)return;
    change(s=>s.combat={name:data.get('name').trim()||'Enemy',cs:number('cs'),maxEP:number('ep'),ep:number('ep'),modifier:number('modifier'),immune:data.has('immune'),undead:data.has('undead'),status:'active',rounds:[]});roundPage=0;
  }
  else if(form.id==='item-form') {
    if(state.combat?.status==='active') {$('#form-error').textContent='Finish combat before changing equipment.';return;}
    const type=form.dataset.type, kind=data.get('kind'), name=kind==='meal'?'Meal':kind==='potion'?'Healing Potion':String(data.get('name')).trim();
    if(!name) {$('#form-error').textContent='Enter an item name, or choose Meal or Healing Potion.';return;}
    if(type==='special' && ['Shield','Sommerswerd'].includes(name) && state.special.some(v=>v.name===name)) {$('#form-error').textContent=`You already carry a ${name}.`;return;}
    if((type==='weapons'&&state.weapons.length>=2)||(type==='backpack'&&state.meals+state.backpack.length>=8)||(type==='special'&&state.special.length>=100)) {$('#form-error').textContent='No space available. Remove an item first.';return;}
    if(type==='special')gearPage=Math.floor(state.special.length/specialPageSize());
    change(s=>{if(type==='weapons')s.weapons.push(name);else if(type==='backpack'){if(kind==='meal')s.meals++;else s.backpack.push(name);}else{const bonus=number('ep');s.special.push({name,effect:String(data.get('effect')).trim(),ep:bonus,cs:name==='Sommerswerd'?0:number('cs')});if(s.ep>0)s.ep+=bonus;}},'Item added.');closeDialog();if(type==='weapons')weaponsDialog();
  }
});
$('#import-file').addEventListener('change',async event=>{
  const file=event.target.files[0];if(!file)return;
  try {
    if(file.size>2000000)throw new Error('Save file is too large.');
    const imported=C.validateSave(JSON.parse(await file.text()));
    const chart=imported.books[imported.activeBook];
    dialog('Import this adventure?',`<p class="hint">Books ${Object.keys(imported.books).join(" & ")} · active Book ${chart.book}, section ${chart.section} · ${chart.ep}/${R.maxEndurance(chart)} endurance. This replaces your saved campaign. You can undo it.</p><div class="dialog-actions"><button class="secondary" data-action="close-dialog">Cancel</button><button class="primary" id="confirm-import">Import save</button></div>`);
    $('#confirm-import').addEventListener('click',()=>{change(()=>{campaign=imported;state=campaign.books[campaign.activeBook];},'Campaign imported.');closeDialog();});
  } catch(error) {toast(error.message || 'Could not read this save file.');}
  event.target.value='';
});
// Remember notes even if the browser is backgrounded before the field loses focus.
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){cancelDisciplinePress(true);persist();}});
let lastPageSize = pageSize();
window.addEventListener('resize',()=>{
  cancelDisciplinePress(true);
  const size = pageSize();
  if (size !== lastPageSize && !$('#dialog').open && ['special','combat'].includes(view)) render();
  lastPageSize = size;
});
render();persist();if(recoveryNotice)toast(recoveryNotice);
