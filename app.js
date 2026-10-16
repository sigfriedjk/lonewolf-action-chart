/* No dependencies, network calls, or build step. All adventure data stays in this browser. */
'use strict';
const R = window.LWRules;
const C = window.LWCampaign;
const STORAGE_KEY = 'lone-wolf-action-chart-v2';
const MAGNAKAI_STORAGE_KEY = 'lone-wolf-action-chart-v3';
let modernStorage = false;
const LEGACY_KEY = 'lone-wolf-action-chart-v1';
const $ = selector => document.querySelector(selector);
const escapeHTML = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const clone = value => JSON.parse(JSON.stringify(value));
const signed = value => value > 0 ? `+${value}` : String(value);
const uniqueWeapons = [...new Set(R.weapons)];
let view = 'chart', gearView = 'backpack', gearPage = 0, roundPage = 0, specialLocation = 'carry';
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
    const modern = localStorage.getItem(MAGNAKAI_STORAGE_KEY);
    modernStorage = modern!==null;
    const saved = modern ?? (localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY));
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
  modernStorage ||= campaign.version===3 || Object.values(campaign.books).some(R.isMagnakai);
  if(modernStorage)campaign.version=3;
  try { localStorage.setItem(modernStorage?MAGNAKAI_STORAGE_KEY:STORAGE_KEY,JSON.stringify(campaign)); storageAvailable = true; }
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
    <div class="resources"><section class="card resource gold-resource ${R.isMagnakai(state)?'supplies-resource':''}" aria-label="${R.isMagnakai(state)?'Gold Crowns and Arrows':'Gold Crowns'}"><button class="text-button" data-action="gold"><span class="resource-icon" aria-hidden="true">◈</span><span><span class="resource-value">${state.gold} <small>/ 50</small></span><br><span class="resource-label">Gold Crowns · edit</span></span></button>${R.isMagnakai(state)?`<button class="text-button" data-action="arrows"><span class="resource-icon" aria-hidden="true">➶</span><span><span class="resource-value">${state.arrows}</span><br><span class="resource-label">Arrows · edit</span></span></button>`:`<div class="gold-controls"><button class="square" data-action="gold-adjust" data-value="-1" aria-label="Spend one Gold Crown" ${!state.gold?'disabled':''}>−</button><button class="square" data-action="gold-adjust" data-value="1" aria-label="Gain one Gold Crown" ${state.gold===Number.MAX_SAFE_INTEGER?'disabled':''}>+</button></div>`}</section><section class="card resource meal-resource" aria-label="Meals"><button class="text-button" data-action="view" data-view="gear" data-gear="backpack"><span class="resource-icon" aria-hidden="true">♧</span><span><span class="resource-value">${state.meals}</span><br><span class="resource-label">Meals ›</span></span></button><button class="secondary meal-eat" data-action="eat" ${!state.ep?'disabled':''}>Eat a Meal</button></section></div>
    <section class="card random"><div><h3 class="card-title">Random number</h3><p class="caption">0–9 · zero counts as zero</p></div><strong class="die" aria-hidden="true">${state.lastRoll ?? '—'}</strong><span id="roll-status" class="sr-only" role="status" aria-live="polite"></span><button class="secondary" data-action="roll">Roll</button></section>
    <p class="footer-note stats-note">You are the last of the Kai. So this Action Chart autosaves</p>`;
}
function pageKai() {
  if(R.isMagnakai(state))return `${heading(`Magnakai (${state.magnakai.length}/${C.limit(state)})`,`<button class="toolbar-button settings-control" data-action="mastery-dialog">Mastery ${settingsIcon}</button>`)}
    <div class="discipline-grid">${R.magnakai.map(([name])=>`<button class="discipline" aria-pressed="${state.magnakai.includes(name)}" aria-haspopup="dialog" aria-describedby="discipline-hint" data-action="discipline" data-name="${name}"><span class="check" aria-hidden="true">✓</span>${name}</button>`).join('')}</div>
    <p class="gesture-hint" id="discipline-hint">Tap to read · Hold to select · ${C.limit(state)} recommended</p>
    <div class="lore-grid" role="group" aria-label="Lore-circles: check to apply bonuses">${R.loreCircles.map(circle=>{const ready=R.loreReady(state,circle),checked=state.loreCircles.includes(circle.id);return `<label class="lore-circle ${ready?'lore-ready':''}"><input type="checkbox" data-lore="${circle.id}" ${checked?'checked':''}><span>${circle.name}<small>${circle.cs?`+${circle.cs} CS · `:''}+${circle.ep} EP · ${ready?'Ready':checked?'Applied':'—'}</small></span></label>`;}).join('')}</div>
    <p class="footer-note">Checked circles add bonuses. Highlight means skills are selected.<br>Mastery opens inherited Kai skills and circle requirements.</p>`;
  return `${heading(`Disciplines (${state.disciplines.length}/${C.limit(state)})`,`<button class="toolbar-button settings-control mastery-settings" data-action="mastery-dialog" aria-label="Edit Weaponskill mastery" title="Mastery: ${state.mastery}"><span>Mastery: ${state.mastery}</span>${settingsIcon}</button>`)}
    <div class="discipline-grid">${R.disciplines.map(([name])=>`<button class="discipline" aria-pressed="${state.disciplines.includes(name)}" aria-haspopup="dialog" aria-describedby="discipline-hint" data-action="discipline" data-name="${name}"><span class="check" aria-hidden="true">✓</span>${name}</button>`).join('')}</div>
    <p class="gesture-hint" id="discipline-hint">Tap to read · Hold to select or remove</p>
    <p class="footer-note">Mindblast and equipped Weaponskill bonuses apply in combat.<br>Use Healing once per section without combat.</p>`;
}
function pageGear() {
  const entries=[...Array(state.meals).fill('Meal'),...state.backpack];
  const slots=Array.from({length:8},(_,i)=>i<entries.length?equipmentRow(entries[i],i,'backpack'):`<button class="item empty-slot" data-action="add-item" data-type="backpack" aria-label="Backpack slot ${i+1}: Empty, add item"><span class="number">${String(i+1).padStart(2,'0')}</span><span class="grow">Empty slot</span><span aria-hidden="true">＋</span></button>`).join('');
  return `${heading('Backpack',`<span class="toolbar-status">${entries.length} / 8 slots</span>`)}<div class="inventory-list backpack-list" aria-label="Eight backpack slots">${slots}</div><p class="footer-note">Tap an empty slot to add supplies.<br>Each Meal takes one slot.</p>`;
}
function pageSpecial() {
  const stored=specialLocation==='safekeeping',entries=stored?state.storedSpecial:state.special,size=specialPageSize();
  gearPage = Math.min(gearPage,Math.max(0,Math.ceil(entries.length/size)-1));
  const items=entries.slice(gearPage*size,gearPage*size+size).map((entry,i)=>equipmentRow(entry,gearPage*size+i,stored?'stored-special':'special')).join('');
  const full=state.special.length+state.storedSpecial.length===100;
  const toggle=`<div class="location-toggle" role="group" aria-label="Special Item location"><button class="toolbar-button" data-action="special-location" data-location="carry" aria-pressed="${!stored}">Carry</button><button class="toolbar-button" data-action="special-location" data-location="safekeeping" aria-pressed="${stored}">Safekeeping</button></div>`;
  return `${heading('Special Items',toggle)}<div class="inventory-list">${items}${!stored&&!full?'<button class="item empty-slot" data-action="add-item" data-type="special"><span aria-hidden="true">＋</span><span>Add a Special Item<small>No fixed slot limit</small></span></button>':''}${stored&&!entries.length?'<p class="empty">Nothing in safekeeping.<br>Store an item from Carry to keep it here.</p>':''}</div>${entries.length>size?`<div class="pager"><button class="square" data-action="gear-page" data-value="-1" aria-label="Previous items" ${gearPage===0?'disabled':''}>‹</button><span>Page ${gearPage+1} of ${Math.ceil(entries.length/size)}</span><button class="square" data-action="gear-page" data-value="1" aria-label="Next items" ${gearPage+1>=Math.ceil(entries.length/size)?'disabled':''}>›</button></div>`:''}<p class="footer-note special-note">${stored?'Stored at the Kai Monastery. No equipment bonuses apply until you carry these items.':'Worn or carried separately. These do not use backpack or regular weapon slots.'}</p>`;
}
function equipmentRow(entry,index,type,returnToWeapons=false) {
  if(type==='special' || type==='stored-special') {
    const stored=type==='stored-special',name=escapeHTML(entry.name);
    return `<div class="item special-row"><span class="number">${String(index+1).padStart(2,'0')}</span><div class="special-details">${R.isMagnakai(state)?`<button class="special-name" data-action="edit-effect" data-index="${index}" data-stored="${stored}" aria-label="Edit description: ${name}"><span class="item-name">${name}</span><span class="item-note">${escapeHTML(entry.effect)}${entry.ep?` · +${entry.ep} max EP`:''}${entry.cs?` · +${entry.cs} CS`:''}</span></button>`:`<div class="item-name">${name}</div><div class="item-note">${escapeHTML(entry.effect)}${entry.ep?` · +${entry.ep} max EP`:''}${entry.cs?` · +${entry.cs} CS`:''}</div>`}</div><div class="special-actions">${!stored&&entry.name==='Sommerswerd'?`<button class="equip ${state.equipped===-2?'active':''}" data-action="equip" data-index="-2" aria-label="Equip Sommerswerd">${state.equipped===-2?'Equipped':'Equip'}</button>`:''}<button class="equip" data-action="move-special" data-index="${index}" data-store="${!stored}" aria-label="${stored?'Carry':'Move to safekeeping:'} ${name}" ${state.combat?.status==='active'?'disabled':''}>${stored?'Carry':'Store'}</button>${!stored?`<button class="icon-button" data-action="remove-item" data-type="special" data-index="${index}" aria-label="Remove ${name}">×</button>`:''}</div></div>`;
  }
  const name=type==='special'?entry.name:entry;
  const note=type==='special'?`${entry.effect}${entry.ep?` · +${entry.ep} max EP`:''}${entry.cs?` · +${entry.cs} CS`:''}`:type==='weapons'?state.equipped===index?'Ready for combat':'Carried weapon':name==='Meal'?'One backpack slot':'Backpack Item';
  const returnAttr=returnToWeapons?'data-return="weapons"':'';
  return `<div class="item"><span class="number">${String(index+1).padStart(2,'0')}</span><div class="grow"><div class="item-name">${escapeHTML(name)}</div><div class="item-note">${escapeHTML(note)}</div></div>${type==='weapons' || type==='special' && name==='Sommerswerd'?`<button class="equip ${(type==='weapons'?state.equipped===index:state.equipped===-2)?'active':''}" data-action="equip" data-index="${type==='weapons'?index:-2}" ${returnAttr} aria-label="Equip ${escapeHTML(name)}">${(type==='weapons'?state.equipped===index:state.equipped===-2)?'Equipped':'Equip'}</button>`:R.potionRecovery(name) && type==='backpack'?`<button class="equip" data-action="potion" data-index="${index-state.meals}" ${!state.ep || state.combat?.status==='active'?'disabled':''}>Use +4</button>`:''}<button class="icon-button" data-action="remove-item" data-type="${type}" data-index="${index}" ${returnAttr} aria-label="Remove ${escapeHTML(name)}">×</button></div>`;
}
function weaponsDialog() {
  const slots=Array.from({length:2},(_,i)=>state.weapons[i]?equipmentRow(state.weapons[i],i,'weapons',true):`<button class="item empty-slot" data-action="add-item" data-type="weapons"><span class="number">${String(i+1).padStart(2,'0')}</span><span>Empty weapon slot<small>＋ Add a weapon</small></span></button>`).join('');
  dialog('Weapons',`<div class="form-stack"><p class="caption">${state.weapons.length} / 2 regular weapon slots · equip one for combat</p><div class="inventory-list">${slots}</div>${state.special.some(v=>v.name==='Sommerswerd')?`<button class="secondary full" data-action="equip" data-index="-2" data-return="weapons">${state.equipped===-2?'✓ Equipped':'Equip'} Sommerswerd</button><p class="caption">Sommerswerd is a Special Item; it uses no regular weapon slot.</p>`:''}<button class="secondary full" data-action="unarmed" data-return="weapons">${state.equipped===-1?'✓ ':''}Fight unarmed (${R.combatSkill({...state,equipped:-1}).unarmed} combat skill)</button><p class="hint">Remove a weapon with ×. Undo is available on Stats.</p></div>`);
}
function specialPageSize() { return Math.max(1,pageSize()-1); }
function pageSize() { return matchMedia('(max-height:660px)').matches ? 2 : matchMedia('(max-height:760px)').matches ? 3 : 4; }
function pageCombat() {
  const c = state.combat;
  if (!c) return `${heading('Combat',R.isMagnakai(state)?`<button class="toolbar-button" data-action="psychic-dialog">Psychic attack</button>`:`<span class="toolbar-status">Your CS <strong>${R.combatSkill(state).total}</strong></span>`)}<form id="combat-form" class="form-stack"><label>Enemy name<input name="name" maxlength="80" placeholder="e.g. Gourgaz" required></label><div class="grid-two"><label>Combat skill<input name="cs" type="number" inputmode="numeric" min="0" max="99" value="15" required></label><label>Endurance<input name="ep" type="number" inputmode="numeric" min="1" max="999" value="20" required></label></div><div class="grid-two"><label>Section CS modifier<input name="modifier" type="number" inputmode="numeric" min="-99" max="99" value="0" required></label><label>Enemy Mindblast<input name="mindblastDamage" aria-label="Enemy Mindblast damage per round" type="number" inputmode="numeric" min="0" max="99" value="0" required></label></div><div class="combat-options grid-two"><label class="checkbox-row"><input name="immune" type="checkbox">${R.isMagnakai(state)?'Immune to your attack':'Immune to Mindblast'}</label>${state.book>=2?'<label class="checkbox-row"><input name="undead" type="checkbox">Undead enemy</label>':''}</div><p class="hint">Your combat skill: ${R.combatSkill(state).total}. Enemy Mindblast: EP per round; ${R.isMagnakai(state)?'Mindshield/Psi-screen':'Mindshield'} blocks it.</p><button class="primary full" ${!state.ep?'disabled':''}>Start combat</button></form><p class="footer-note">One round at a time, using the Combat Results Table.<br>${state.book>=2?'Equipped Sommerswerd doubles damage to undead.':'Follow your section for special combat effects.'}</p>`;
  const skill = R.combatSkill(state,c.immune,c.modifier), ratio = skill.total-c.cs, active = c.status==='active';
  const latest = c.rounds.at(-1);
  const outcome = {victory:'Victory. Your enemy has fallen.',defeat:'You have fallen. Your adventure ends here.',evaded:'You escaped from combat.'};
  const status = active?`Round ${c.rounds.length+1}`:c.status==='victory'?'Victory':c.status==='evaded'?'Escaped':'Defeat';
  const roundHeader=c.rounds.length?`<button class="toolbar-button ${c.status==='defeat'?'dead':''}" data-action="combat-log" aria-label="View combat history, ${c.rounds.length} rounds">${status} · Log ▾</button>`:`<span class="toolbar-status">${status}</span>`;
  return `${heading(c.name,R.isMagnakai(state)?`<div class="toolbar-actions"><button class="toolbar-button" data-action="psychic-dialog" aria-label="Choose psychic attack">Psychic</button>${roundHeader}</div>`:roundHeader)}
    <div class="combat-hero"><div><div class="combat-title">Lone Wolf</div><div class="combat-number">${state.ep}</div><div class="caption">Endurance · CS ${skill.total}</div></div><div class="ratio"><div class="caption">RATIO</div><strong>${signed(ratio)}</strong></div><div><div class="combat-title">Enemy</div><div class="combat-number">${c.ep}</div><div class="caption">Endurance · CS ${c.cs}</div></div></div>
    <p class="hint">${state.baseCS} base ${signed(state.csBonus)} bonus ${skill.equipment?` · Equipment +${skill.equipment}`:''}${skill.sunSword?' · Sommerswerd +8':''}${c.undead&&skill.sunSword?' · Undead damage ×2':''}${skill.mastery?` · ${skill.mastery>=3?'Weaponmastery':'Weaponskill'} +${skill.mastery}`:''}${skill.lore?` · Lore-circles +${skill.lore}`:''}${skill.mindblast?` · Psychic +${skill.mindblast}`:''}${R.psychicEffect(state).cost?` · Surge ${R.psychicEffect(state).cost} EP/round`:''}${skill.unarmed?` · Unarmed ${signed(skill.unarmed)}`:''}${c.modifier?` · Section ${signed(c.modifier)}`:''}${c.immune?' · Psychic attack immune':''}${c.mindblastDamage?` · Enemy Mindblast ${R.enemyMindblast(state,c)} EP/round${R.psychicProtection(state)?` (${state.magnakai?.includes('Psi-screen')?'Psi-screen':'Mindshield'})`:''}`:''}</p>
    ${!active?`<div class="combat-result ${c.status==='defeat'?'defeat':''}">${outcome[c.status]}</div>`:latest?`<div class="combat-result">Roll <strong>${latest.roll}</strong> · You lost <strong>${latest.heroLoss}</strong>${latest.mindblastLoss?` (${latest.mindblastLoss} Mindblast)`:''}${latest.surgeLoss?` (${latest.surgeLoss} surge)`:''} · Enemy lost <strong>${latest.enemyLoss}</strong></div>`:'<p class="caption">Ready. Roll a number or enter one from the book.</p>'}
    ${active?`<div class="row"><label class="grow" for="combat-roll">Random number (optional)<select id="combat-roll"><option value="random">Roll automatically</option>${Array.from({length:10},(_,i)=>`<option value="${i}">${i}</option>`).join('')}</select></label><button class="primary" style="align-self:end" data-action="round">Fight round</button></div><div class="row"><button class="secondary grow" data-action="evade">Evade…</button><button class="secondary grow" data-action="undo" ${!undoStack.length?'disabled':''}>Undo round</button></div>`:`<div class="row"><button class="primary grow" data-action="finish-combat">Next combat</button><button class="secondary" data-action="undo" ${!undoStack.length?'disabled':''}>Undo</button></div>`}
    <p class="footer-note">Evasion is allowed only when your book offers it.</p>`;
}
function pageJournal() {
  return `${heading('Journal','<div class="toolbar-actions"><button class="toolbar-button" data-action="rules">Rules</button><button class="toolbar-button" data-action="export">Export save</button></div>')}<textarea class="journal" id="notes" maxlength="20000" aria-label="Adventure notes" placeholder="Clues, choices, and things to remember…">${escapeHTML(state.notes)}</textarea><p class="notes-meta"><span>Saved as you write</span><span id="notes-count">${state.notes.length.toLocaleString()} / 20,000</span></p>`;
}
function render() {
  cancelDisciplinePress(true);
  $('#book-button').textContent = `${String(state.book).padStart(2,'0')} / ${C.books[state.book].title} ▾`;
  $('#section-bookmark').innerHTML = `<span>Section ${state.section}</span>${settingsIcon}`;
  $('#section-bookmark').ariaLabel = `Edit section bookmark, section ${state.section}`;
  $('#main').ariaLabel = view==='chart'?'Stats':view==='kai'?'Kai Disciplines':view==='gear'?'Backpack':view==='special'?'Special Items':view[0].toUpperCase()+view.slice(1);
  $('#main').dataset.view = view;
  $('#main').dataset.series = R.isMagnakai(state)?'magnakai':'kai';
  $('#main').innerHTML = ({chart:pageChart,kai:pageKai,gear:pageGear,special:pageSpecial,combat:pageCombat,journal:pageJournal})[view]();
  const labels={chart:'Stats',kai:'Kai',gear:'Backpack',special:'Special',combat:'Combat',journal:'Journal'};
  $('.bottom-nav').innerHTML = Object.entries(icons).map(([key,path])=>`<button class="nav-button" data-action="view" data-view="${key}" ${view===key?'aria-current="page"':''}><svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>${labels[key]}</button>`).join('');
}
function switchView(next) { view = next; if(next==='gear')gearView='backpack';else if(next==='special')gearView='special';render(); $('#main').scrollTop = 0; }
function weaponOptions(selected,book=state.book) { return R.weaponTypes({book}).map(w=>`<option ${w===selected?'selected':''}>${w}</option>`).join(''); }
function dialog(title, content) {
  $('#dialog').innerHTML = `<div class="dialog-heading"><h2 id="dialog-title">${title}</h2><button class="icon-button" data-action="close-dialog" aria-label="Close dialog">×</button></div>${content}`;
  if (!$('#dialog').open) $('#dialog').showModal();
}
function closeDialog() { $('#dialog').close(); }
function disciplineDialog(name) {
  const discipline=R.disciplineList(state).find(d=>d[0]===name);
  if (!discipline) return;
  const selected=R.selectedDisciplines(state).includes(name), full=!R.isMagnakai(state) && !selected && state.disciplines.length>=C.limit(state);
  dialog(name,`<div class="form-stack"><p class="discipline-description">${escapeHTML(discipline[1])}</p>${R.trainingGuidance(state,name)?`<p class="hint">${escapeHTML(R.trainingGuidance(state,name))}</p>`:''}${R.isMagnakai(state)&&name==='Weaponmastery'?'<button class="secondary" data-action="adjusted-roll">Adjusted missile roll</button>':''}${R.isMagnakai(state)&&name==='Psi-surge'?'<button class="secondary" data-action="psychic-dialog">Choose psychic attack</button>':''}${R.isMagnakai(state)&&name==='Curing'?'<p class="hint">Archmaster Curing: in combat at 6 EP or less, once per 100 days. You decide whether it applies. Recovery is capped at maximum EP; it cannot revive a dead hero.</p><button class="secondary" data-action="arch-cure">Restore 20 EP</button>':''}${name==='Weaponskill'?`<p class="hint">Your mastery: <strong>${state.mastery}</strong>. ${state.book>=2?'Sword, Short Sword, and Broadsword mastery also apply to the Sommerswerd.':''}</p>`:''}<p class="discipline-status">${selected?'✓ Selected':'Not selected'} · ${R.selectedDisciplines(state).length} of ${C.limit(state)} skills ${R.isMagnakai(state)?'recommended':'chosen'}</p>${full?'<p class="hint">Your skills are full. Remove another Discipline before selecting this one.</p>':''}<button class="primary full" data-action="toggle-discipline" data-name="${name}" ${full?'disabled':''}>${selected?'Remove this Discipline':'Select this Discipline'}</button></div>`);
}
function toggleDiscipline(name) {
  if (!R.disciplineList(state).some(d=>d[0]===name)) return;
  const key=R.isMagnakai(state)?'magnakai':'disciplines',selected=state[key].includes(name);
  if (!R.isMagnakai(state) && !selected && state.disciplines.length>=C.limit(state)) return toast(`Choose ${C.limit(state)}. Remove a skill to replace it.`);
  change(s=>s[key]=selected?s[key].filter(d=>d!==name):[...s[key],name],`${name} ${selected?'removed':'selected'}.`);
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
    $('#discipline-hint').textContent=`Release to ${R.selectedDisciplines(state).includes(press.name)?'remove':'select'} ${press.name}`;
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
  dialog('Combat history',`<div class="form-stack"><p class="caption">${escapeHTML(c.name)} · ${c.rounds.length} rounds · newest first</p><table class="combat-log"><thead><tr><th>Round</th><th>Roll</th><th>Ratio</th><th>You lost</th><th>Enemy lost</th></tr></thead><tbody>${rounds.map((r,i)=>`<tr><td>${c.rounds.length-roundPage*size-i}${r.evade?' ↗':''}</td><td>${r.roll}</td><td>${signed(r.ratio)}</td><td>${r.heroLoss}${r.surgeLoss?` · ${r.surgeLoss} surge EP`:''}${r.mindblastLoss?`<small class="round-mindblast">${r.mindblastLoss} Mindblast</small>`:''}</td><td>${r.enemyLoss}</td></tr>`).join('')}</tbody></table>${pages>1?`<div class="pager"><button class="square" data-action="round-page" data-value="-1" aria-label="Newer rounds" ${roundPage===0?'disabled':''}>‹</button><span>Page ${roundPage+1} of ${pages}</span><button class="square" data-action="round-page" data-value="1" aria-label="Older rounds" ${roundPage+1>=pages?'disabled':''}>›</button></div>`:''}<p class="hint">↗ marks an evasion round. Your book determines when evasion is allowed.</p></div>`);
}
function booksDialog() {
  const next=Object.keys(C.books).map(Number).find(id=>id>state.book && !campaign.books[id]);
  const source=next?continuationSource(next):null, eligible=Boolean(source);
  dialog('Your books',`<div class="menu-options">${Object.entries(C.books).map(([id,book])=>{
    const saved=campaign.books[id];
    return `<button class="secondary book-choice" data-action="switch-book" data-book="${id}" ${Number(id)===state.book?'aria-current="page"':''}><strong>Book ${id} · ${book.title}</strong><small>${saved?`Section ${saved.section} · ${saved.ep}/${R.maxEndurance(saved)} EP · ${R.selectedDisciplines(saved).length} disciplines${Number(id)===state.book?' · Current book':''}`:'Not started'}</small></button>`;
  }).join('')}${next?`<button class="primary" data-action="continue-book" data-book="${next}" ${eligible?'':'disabled'}>Carry ${source?`Book ${source.book} character`:'a completed character'} into Book ${next} →</button><button class="secondary" data-action="fresh-book" data-book="${next}">Start Book ${next} with a fresh character</button>`:''}</div><p class="hint" style="margin-top:16px">Each book keeps its own chart, equipment, and notes.${next&&!eligible?' Choose all available Kai Disciplines and finish combat in an earlier book before continuing.':''}</p>`);
}
function continuationSource(book) {
  return Object.values(campaign.books).filter(s=>s.book<book && (R.isMagnakai({book}) || s.ep>0 && s.disciplines.length===C.limit(s) && s.combat?.status!=='active')).sort((a,b)=>b.book-a.book)[0] || null;
}
function selectBook(book) {
  if (!C.books[book]) return toast('Unsupported book.');
  if (book>1 && !campaign.books[book]) return bookSetupDialog(book,Boolean(continuationSource(book)));
  if (book===campaign.activeBook) return closeDialog();
  change(()=>{campaign.activeBook=book;state=campaign.books[book] || newCharacter();},`Book ${book} chart opened.`);
  gearPage=roundPage=0;closeDialog();switchView('chart');
}
function book2Dialog(continuing) { return bookSetupDialog(2,continuing); }
function bookSetupDialog(book,continuing) {
  const setup=C.books[book],source=continuing?continuationSource(book):null;
  if (!setup || book<2) return toast('Unsupported book setup.');
  if(R.isMagnakai({book}))return magnakaiSetupDialog(book,source);
  if (continuing && !source) return toast('Choose all available Kai Disciplines and finish combat in an earlier book before continuing.');
  const available=R.disciplines.filter(([name])=>!source?.disciplines.includes(name));
  const supplyOptions=selected=>`<option value="">No item</option>${setup.supplies.map(item=>`<option ${item===selected?'selected':''}>${item}</option>`).join('')}`;
  const supplyLabel=book===2?'Royal Armoury':'Starting supply';
  const defaultMeal=book===2?'Two Meals':book===3?'Special Rations':book===4?'5 Special Rations':'2 Special Rations';
  const supplyFields=`<div class="grid-two">${Array.from({length:setup.supplyLimit},(_,i)=>`<label>${supplyLabel} item ${i+1}<select name="item${i+1}">${supplyOptions(source?'':i===0?'Sword':i===1?defaultMeal:'')}</select></label>`).join('')}</div>`;
  const giftText=[setup.map,...setup.gifts].join(' and ');
  dialog(continuing?`Continue into Book ${book}`:`Start Book ${book}`,`<form id="book2-form" data-book="${book}" data-source="${source?.book || ''}" data-continuing="${continuing}" class="form-stack"><p class="caption">${setup.title}${campaign.books[book]?` · This replaces your Book ${book} chart; Undo is available.`:''}</p>${source?`<div class="carry-summary"><strong>Your Book ${source.book} character travels with you.</strong><br>CS ${source.baseCS} · EP ${source.ep}/${R.maxEndurance(source)} · ${source.gold} Gold Crowns<br>${source.weapons.length} weapons · ${source.meals+source.backpack.length}/8 backpack slots · ${source.special.length} Special Items<br>${source.disciplines.map(escapeHTML).join(', ')}</div><p class="hint">Scores, current endurance, equipment, mastery, and journal are copied. Your Book ${source.book} chart stays saved. Book ${book} starts at section 1.</p><label class="checkbox-row"><input name="completed" type="checkbox" required>I successfully completed Book ${source.book}</label><label>Learn one new Kai Discipline<select name="discipline">${available.map(([name])=>`<option>${name}</option>`).join('')}</select></label>`:`<div class="grid-two"><label>Combat skill (10 + roll)<input name="cs" type="number" min="10" max="19" value="${10+randomNumber()}" required></label><label>Endurance (20 + roll)<input name="ep" type="number" min="20" max="29" value="${20+randomNumber()}" required></label></div><label>Weaponskill mastery<select name="mastery">${weaponOptions(R.weapons[randomNumber()],book)}</select></label><p class="hint">Choose five Kai Disciplines after starting. ${giftText} included.</p>`}<label>Royal gold (10 + roll)<input name="gold" type="number" min="10" max="19" value="${10+randomNumber()}" required></label><p class="hint">${source?'Added to your existing gold, including totals above 50.':'Your starting Gold Crowns.'} ${giftText} added to Special Items.</p>${source?.weapons.length?`<div><label>Keep carried weapons</label>${source.weapons.map((name,i)=>`<label class="checkbox-row"><input name="keep" type="checkbox" value="${i}" checked>${escapeHTML(name)}</label>`).join('')}<p class="hint">Uncheck a weapon to exchange it for a starting weapon. Your Book ${source.book} equipment is kept on its chart.</p></div>`:''}${supplyFields}<p class="hint">Choose different listed supplies; Meals and potion doses each use a backpack slot. Carried equipment counts toward the usual limits. Choose up to ${setup.supplyLimit} supplies. Use Store on the Special tab to leave carried items in safekeeping.</p><p class="section-error" id="form-error" role="alert"></p><div class="dialog-actions"><button class="secondary" type="button" data-action="books">Back</button><button class="primary">Begin Book ${book}</button></div></form>`);
}
function magnakaiSetupDialog(book,source) {
  const setup=C.books[book],noSupplies=Boolean(source && setup.noContinuedSupplies);
  const options=selected=>`<option value="">No item</option>${setup.supplies.map(item=>`<option ${item===selected?'selected':''}>${item}</option>`).join('')}`;
  dialog(source?`Continue into Book ${book}`:`Start Book ${book}`,`<form id="book2-form" data-book="${book}" data-source="${source?.book || ''}" data-continuing="${Boolean(source)}" class="form-stack">
    <p class="caption">${setup.title}${campaign.books[book]?` · Replaces only your Book ${book} chart; Undo is available.`:''}</p>
    ${source?`<div class="carry-summary">From Book ${source.book}: CS ${source.baseCS} · EP ${source.ep}/${R.maxEndurance(source)} · ${source.gold} Crowns<br>Scores, wounds, equipment, safekeeping, Kai record, and notes are copied. The source chart stays saved; the new encounter resets.</div><label class="checkbox-row"><input name="completed" type="checkbox" required>I successfully completed Book ${source.book}</label><label class="checkbox-row"><input name="fullKai" type="checkbox">I completed all five Kai books; record all ten basic skills</label><p class="hint">Otherwise the selected Kai skills are copied for your review. No skipped books or additional skills are inferred. Edit the inherited record in Mastery.</p>`:`<div class="grid-two"><label>Combat skill (10 + roll)<input name="cs" type="number" min="10" max="19" value="${10+randomNumber()}" required></label><label>Endurance (20 + roll)<input name="ep" type="number" min="20" max="29" value="${20+randomNumber()}" required></label></div><p class="hint">Fresh entry has no inherited Kai bonuses. The story assumes basic Kai training; review any mechanical benefits yourself in Mastery.</p>`}
    <p class="hint">${source&&R.isMagnakai(source)?'Your Magnakai skills, masteries, checked circles, and arrows are retained. After completing a Magnakai adventure, choose one new Discipline on Kai. If you already had Weaponmastery, choose one additional mastered type in Mastery; newly learned Weaponmastery starts with three.':'Begin as Kai Master Superior: choose three Magnakai Disciplines on Kai. Weaponmastery starts with three chosen weapon types.'} Counts are guidance; you control the record.${book>=8?' Improved abilities are described in Discipline dialogs. Choose your Weaponmastery level explicitly in Mastery.':book===7?' Four skills correspond to Primate; its improved abilities remain manual.':''}</p>
    ${noSupplies?'<p class="hint">Continued Book 11 entry adds no gold, map, Meals, or supply choices. Your carried equipment is retained.</p>':`<label>Starting gold (10 + roll)<input name="gold" type="number" min="10" max="19" value="${10+randomNumber()}" required></label><p class="hint">${source?'Added to your existing Crowns. ':''}${setup.map?`${setup.map} included.`:'Fresh Book 11 includes two Meals; no map is granted.'} Totals above 50 remain editable.</p>`}
    ${!noSupplies && source?.weapons.length?`<div><label>Keep carried weapons</label>${source.weapons.map((name,i)=>`<label class="checkbox-row"><input name="keep" type="checkbox" value="${i}" checked>${escapeHTML(name)}</label>`).join('')}<p class="hint">Uncheck to exchange a weapon on the new chart.</p></div>`:''}
    <div class="grid-two">${Array.from({length:noSupplies?0:setup.supplyLimit},(_,i)=>`<label>Starting supply item ${i+1}<select name="item${i+1}">${options(!source?(i===0?'Sword':i===1?(book===12?'4 Meals':book===11?'':book>=7?'3 Meals':'4 Special Rations'):''):'')}</select></label>`).join('')}</div>
    <p class="hint">Choose up to ${noSupplies?0:setup.supplyLimit} different supplies, within two weapons and eight backpack slots. ${book===12?'Four Meals use four slots. Rope and the self-lighting Lantern use backpack slots.':book>=10?'Three Meals use three slots. Rope, the self-lighting Lantern, and potions use backpack slots. Alether, when offered, gives +2 CS for one combat: use the Section CS modifier and remove the dose yourself.':book>=7?'Three Meals use three slots. Rope and the self-lighting Lantern go in the backpack. Three Fireseeds are separate Special Items; remove each manually when used.':'Four rations use four slots. Rope and Tinderbox go in the backpack. Armour adds 2 EP without healing old wounds.'} A quiver adds six arrows to Stats.</p>
    <p class="section-error" id="form-error" role="alert"></p><div class="dialog-actions"><button class="secondary" type="button" data-action="books">Back</button><button class="primary">Begin Book ${book}</button></div></form>`);
}
function psychicDialog() {
  if(!R.isMagnakai(state))return;
  dialog('Psychic combat',`<form id="psychic-form" class="form-stack"><label>Your attack<select name="mode">${Object.entries(R.psychicModes).map(([key,m])=>`<option value="${key}" ${(state.psychicMode || 'legacy')===key?'selected':''}>${m.label}</option>`).join('')}</select></label><p class="hint">You choose the ability you use. Bonuses replace Mindblast; they do not stack. Do not also add the bonus in Extra CS or deduct the cost manually. A selected surge costs EP on each Fight or Evade round, even if the enemy is immune. Use No psychic attack to stop.</p><p class="hint">Ordinary surge: do not use at 6 EP or below. Archmaster surge: do not use at 4 EP or below. Follow the section for immunity and eligibility; the chart does not choose for you.</p><button class="primary">Use this attack</button></form>`);
}
function adjustedRollDialog() {
  if(!R.isMagnakai(state))return;
  const r=state.lastAdjustedRoll;
  dialog('Adjusted missile roll',`<form id="adjusted-roll-form" class="form-stack">${r?`<p class="combat-result" role="status">Last result: ${r.roll} ${signed(r.modifier)} section ${r.bow?'+3 Bow mastery ':''}${r.mentora?'+2 Mentora ':''}= <strong>${r.total}</strong></p>`:''}<label>Number from the book (blank to roll)<input name="roll" type="number" min="0" max="9"></label><label>Section modifier<input name="modifier" type="number" min="-99" max="99" value="0" required></label><label class="checkbox-row"><input name="bow" type="checkbox">Bow mastery +3</label><label class="checkbox-row"><input name="mentora" type="checkbox">Mentora missile bonus +2</label><p class="hint">Choose only the bonuses permitted by the section and your training. The total can exceed 0–9. Arrows and targets stay under your control; this does not resolve combat.</p><button class="primary">Roll and calculate</button></form>`);
}
function resourceDialog(key) {
  if(!['gold','arrows'].includes(key) || key==='arrows' && !R.isMagnakai(state))return;
  const title=key==='gold'?'Gold Crowns':'Arrows',maximum=key==='gold'?Number.MAX_SAFE_INTEGER:9999;
  dialog(title,`<form id="resource-form" data-key="${key}" class="form-stack"><label>${title}<input id="resource-value" name="amount" type="number" inputmode="numeric" min="0" max="${maximum}" value="${state[key]}" required></label><div class="gold-controls"><button class="square" type="button" data-action="resource-adjust" data-key="${key}" data-value="-1" aria-label="Remove one ${key==='gold'?'Gold Crown':'Arrow'}">−</button><button class="square" type="button" data-action="resource-adjust" data-key="${key}" data-value="1" aria-label="Add one ${key==='gold'?'Gold Crown':'Arrow'}">+</button></div><p class="hint">${key==='gold'?'50 is the usual pouch limit; you can record more.':'Track shots and replenishment yourself. Changing or storing a quiver does not change this total.'} −/+ saves each change immediately; Undo is available.</p><button class="primary">Save total</button></form>`);
}
function statsDialog() {
  dialog('Edit your scores',`<form id="stats-form" class="form-stack"><div class="grid-two"><label>Base combat skill<input name="baseCS" type="number" min="0" max="99" value="${state.baseCS}" required></label><label>Extra CS bonus<input name="csBonus" type="number" min="-99" max="99" value="${state.csBonus}" required></label><label>Base endurance<input name="baseEP" type="number" min="1" max="99" value="${state.baseEP}" required></label><label>Extra EP bonus<input name="epBonus" type="number" min="0" max="99" value="${state.epBonus}" required></label></div><label>Current endurance<input name="ep" type="number" min="0" max="999" value="${state.ep}" required></label><p class="hint">${R.isMagnakai(state)?`Inherited Kai, Magnakai weapon bonuses, and checked Lore-circles (+${R.loreBonus(state).cs} CS, +${R.loreBonus(state).ep} EP) are added automatically. Do not enter circle bonuses again here.`:`Kai combat bonuses are added automatically.`} Special Item endurance bonuses are added automatically. Use extra bonuses for other effects the book gives you. Current endurance is capped at your maximum.</p><button class="primary">Save scores</button></form>`);
}
function newDialog() {
  if (state.book>1) return bookSetupDialog(state.book,false);
  dialog('A new adventure',`<form id="new-form" class="form-stack"><p class="caption">Start Book 1 with fresh scores and equipment. This replaces your Book 1 chart; your other book charts are kept. You can undo it.</p><div class="grid-two"><label>Combat skill (10 + roll)<input name="cs" type="number" min="10" max="19" value="${10+randomNumber()}" required></label><label>Endurance (20 + roll)<input name="ep" type="number" min="20" max="29" value="${20+randomNumber()}" required></label></div><label>Starting Gold Crowns (0–9)<input name="gold" type="number" min="0" max="9" value="${randomNumber()}" required></label><label>Item found at the monastery<select name="loot">${['Broadsword','Sword','Helmet (+2 EP)','Two Meals','Chainmail Waistcoat (+4 EP)','Mace','Healing Potion (+4 recovery)','Quarterstaff','Spear','12 Gold Crowns'].map((name,i)=>`<option value="${i}">${i} · ${name}</option>`).join('')}</select></label><label>Weaponskill mastery<select name="mastery">${weaponOptions(R.weapons[randomNumber()])}</select></label><p class="hint">An Axe, one Meal, and a Map are included. Choose five Kai Disciplines after starting.</p><div class="dialog-actions"><button class="secondary" type="button" data-action="reroll-new">Roll again</button><button class="primary">Begin adventure</button></div></form>`);
  $('#new-form select[name=loot]').value = String(randomNumber());
}
function itemDialog(type = gearView) {
  const special=type==='special'?`<label>Known item<select name="preset"><option value="custom">Custom Special Item</option><option>Shield</option>${state.book>=2?'<option>Sommerswerd</option>':''}</select></label><label>Effect / how it is carried<input name="effect" maxlength="160" placeholder="e.g. Worn on your head"></label><div class="grid-two"><label>Maximum EP bonus<input name="ep" type="number" min="0" max="99" value="0" required></label><label>Combat skill bonus<input name="cs" type="number" min="0" max="99" value="0" required></label></div><p class="hint">Helmet: 2 EP. Chainmail: 4 EP. Shield: 2 CS. Sommerswerd adds 8 CS when equipped; leave its CS field at 0.</p>`:'';
  dialog(type==='weapons'?'Add a weapon':type==='backpack'?'Add to backpack':'Add a Special Item',`<form id="item-form" data-type="${type}" class="form-stack">${special}${type==='weapons'?`<label>Weapon<select name="name">${weaponOptions('Sword')}</select></label>`:`${type==='backpack'?'<label>Item type<select name="kind"><option value="item">Backpack Item</option><option value="meal">Meal</option><option value="potion">Healing Potion</option></select></label>':''}<label>Item name<input name="name" maxlength="80" placeholder="e.g. Torch" ${type==='special'?'required':''}></label>`}<p class="section-error" id="form-error" role="alert"></p><button class="primary">Add item</button></form>`);
}
function masteryDialog() {
  if(R.isMagnakai(state))return dialog('Magnakai & inherited Kai',`<form id="magnakai-form" class="form-stack"><p class="hint">Fresh Magnakai entry begins with three Disciplines and, if Weaponmastery is selected, three mastered types. Your confirmed history recommends ${C.limit(state)} Disciplines. After completing an adventure with Weaponmastery, select one more mastered type; learning it later starts with three. Counts are guidance.${state.book>=8?' See Discipline dialogs for training improvements; choose your Weaponmastery level below.':state.book===7?' Four skills correspond to Primate; see each Discipline for its manual improvements.':''}</p><fieldset><legend>Magnakai weapon masteries</legend><div class="grid-two">${R.weaponTypes(state).map(name=>`<label class="checkbox-row"><input name="masteries" type="checkbox" value="${name}" ${state.masteries.includes(name)?'checked':''}>${name}</label>`).join('')}</div></fieldset><label>Weaponmastery level<select name="weaponmasteryLevel">${Object.entries(R.weaponmasteryLevels).map(([value,level])=>`<option value="${value}" ${(state.weaponmasteryLevel || 'standard')===value?'selected':''}>${level.label} · melee +${level.melee}, unarmed ${level.unarmed}</option>`).join('')}</select></label><p class="hint">Choose the improvement you use; neither book number nor skill count selects it. Applies only with Weaponmastery selected. Do not duplicate these bonuses in Extra CS or the section adjustment.</p><p class="hint">Weaponmastery uses your selected level with a listed melee weapon. A matching inherited Weaponskill adds +2 only when the higher bonus does not apply. Sword, Short Sword, or Broadsword mastery applies to the Sommerswerd. Bow shot bonuses are manual.</p><fieldset><legend>Inherited basic Kai skills</legend><p class="hint">Review your earlier adventures and confirm the benefits you use. All five Kai books completed permits all ten skills, including the final one not selected previously. Incomplete histories are your judgment.</p><div class="grid-two">${R.disciplines.map(([name])=>`<label class="checkbox-row"><input name="inherited" type="checkbox" value="${name}" ${state.disciplines.includes(name)?'checked':''}>${name}</label>`).join('')}</div><label>Original Weaponskill mastery<select name="mastery">${uniqueWeapons.map(name=>`<option ${name===state.mastery?'selected':''}>${name}</option>`).join('')}</select></label></fieldset><p class="hint">Healing/Curing restores only 1 EP per noncombat section, applied on Stats. Huntmastery can provide food in wasteland and desert; basic Hunting remains section-dependent.</p><fieldset><legend>Lore-circle requirements</legend>${R.loreCircles.map(c=>`<p class="hint"><strong>${c.name}:</strong> ${c.skills.join(', ')}. ${c.cs?`+${c.cs} CS, `:''}+${c.ep} EP.</p>`).join('')}<p class="hint">Check circles on Kai to apply their bonuses automatically. Do not also enter them in Extra CS/EP. Highlighting is guidance; checks remain your choice. Changing a check preserves wounds, can reduce current EP to zero, and does not revive a dead hero.</p></fieldset><button class="primary">Save record</button></form>`);
  dialog('Weaponskill mastery',`<div class="form-stack"><label for="mastery">Mastered weapon<select id="mastery">${weaponOptions(state.mastery)}</select></label><p class="hint">Add 2 combat skill when you have Weaponskill and this weapon equipped. Mastery does not give you the weapon.</p><div class="dialog-actions"><button class="secondary" data-action="roll-mastery">Roll mastery</button><button class="primary" data-action="close-dialog">Done</button></div></div>`);
}
function eatMeal(force = false) {
  if (!state.ep) return toast('Your adventure has ended.');
  if (state.combat?.status==='active') return toast('Finish combat before eating.');
  if (R.canHuntForMeal(state) && !force) {
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
  if(R.isMagnakai(state))return dialog(`Book ${state.book} · quick rules`,`<div class="rule-copy"><p><strong>Magnakai.</strong> Begin at Kai Master Superior with three selected Disciplines. Weaponmastery starts with three weapon types; edit these and inherited Kai skills in Mastery. Your confirmed history recommends ${C.limit(state)} Disciplines; counts are guidance.${state.book===7?' Four skills correspond to Primate. Read Animal Control, Curing, Huntmastery, Psi-surge, and Nexus for the manual improvements; Primate alone does not raise the melee mastery bonus above +3.':''}</p><p><strong>Bonuses.</strong> Weaponmastery uses the level you select in Mastery (Standard +3/−4 unarmed, Tutelary +3/−2, Scion-kai +4/−1); matching Kai Weaponskill gives +2 only when the higher bonus does not apply. Mindblast adds +2 unless immune. Psi-screen or inherited Mindshield blocks the entered enemy Mindblast damage. Shield gives +2 while carried. Equipped Sommerswerd gives +8, applicable sword mastery, and double damage to undead.</p><p><strong>Psychic combat.</strong> Choose your attack from the Combat tab or adventure menu. Mindblast +2, Psi-surge +4 / 2 EP per round, Archmaster Mindblast +3, or Archmaster surge +6 / 1 EP per round. Selected bonuses replace one another; do not enter them again in Extra CS. EP costs are included in each Fight/Evade round. You decide eligibility and immunity; ordinary surge requires more than 6 EP, Archmaster surge more than 4. No attack changes automatically with rank.</p><p><strong>Lore-circles.</strong> The four checkboxes apply their CS/EP bonuses automatically; highlighted circles have all required Disciplines selected. Checks remain player-controlled. Do not also enter their bonuses in Extra CS/EP. Toggling preserves wounds and does not revive a dead hero.</p><p><strong>Recovery and food.</strong> Healing/Curing restores 1 EP per noncombat section, applied manually; the two do not stack. Huntmastery provides food even in wasteland/desert. Basic Hunting follows the section. Meal required consumes a ration or loses 3 EP. Ordinary Laumspur restores up to 4 EP after combat.</p><p><strong>Equipment and arrows.</strong> Two weapons; eight backpack entries including Meals; 50 Crowns is a reference.${state.book>=8?' The book gives a twelve-Special-Item carrying limit; manage it yourself with Carry/Safekeeping. No items are discarded or stored automatically.':''} Stats records arrows beside Gold; edit totals yourself. Quiver setup adds six arrows once. A Bow in ordinary melee uses your unarmed penalty. Use Adjusted missile roll in the menu or Weaponmastery dialog for selected Bow mastery +3, Mentora +2, and a section modifier; mark off arrows yourself.</p><p><strong>Exceptions.</strong> Use score adjustments and Journal for unusual equipment, ${state.book===6?'the archery tournament and target points,':'Fireseeds, poison, lost equipment or arrows,'} partial immunities, and other section effects. Bookmarks do not apply effects. Completion and inherited benefits are player-confirmed.</p><p><a href="https://www.projectaon.org/en/xhtml/lw/${C.books[state.book].slug}/title.htm" target="_blank" rel="noopener">Read Book ${state.book} at Project Aon ↗</a></p><p class="hint">Unofficial fan chart. Lone Wolf created by Joe Dever. No book narrative or illustrations are included.</p></div>`);
  const notes={2:'Returning from Book 1 gives a sixth Discipline.',3:'Hunting cannot provide Meals in Kalte. Eat a Meal consumes a carried ration, or deducts 3 EP if none is carried. When the section provides ice-sledge food, follow it without consuming backpack food.',4:'Starting supplies allow up to six choices. Hunting is unavailable in the Wildlands and Maaken Mines when the section says so; use Meal required.',5:'Starting supplies allow up to four choices. Hunting may be unavailable in the desert. Use Store on Special Items to leave possessions at the Kai Monastery. Bookmarks include all 400 sections.'};
  dialog(`Book ${state.book} · quick rules`,`<div class="rule-copy"><p><strong>Endurance.</strong> Zero ends the adventure. Recovery cannot exceed your maximum. Healing restores 1 point per numbered section without combat; apply it manually.</p><p><strong>Combat.</strong> Your combat skill minus the enemy’s gives the ratio. Weaponskill adds 2 with the mastered weapon equipped. Mindblast adds 2 unless the enemy is immune. Fighting unarmed subtracts 4. Enemy Mindblast adds the entered EP loss each round, including evasion; Mindshield blocks it.</p><p><strong>Evasion.</strong> Only when the book allows it. Resolve one round, ignoring damage to the enemy.</p><p><strong>Equipment.</strong> Two weapons, eight backpack slots including Meals, and a usual pouch limit of 50 Gold Crowns (the chart allows more). Special Items use no backpack slots.</p><p><strong>Food.</strong> Consume one Meal when instructed. Without food, lose 3 endurance. Hunting usually removes this requirement, except in Book 3. Healing Potion and ordinary Potion of Laumspur restore 4 endurance after combat; apply other potions manually as directed by the section.</p>${state.book>=2?`<p><strong>Book ${state.book}.</strong> ${notes[state.book]} Continuing a completed character grants one new Discipline. Shield adds 2 combat skill. Equip the Sommerswerd from Special Items to add 8, plus 2 for Weaponskill with Short Sword, Sword, or Broadsword. Tick Undead enemy to double its endurance loss.</p>`:''}<p>Follow the book for special rules, damage multipliers, and other exceptions. Use Edit scores for manual adjustments.</p><p><a href="https://www.projectaon.org/en/xhtml/lw/${C.books[state.book].slug}/title.htm" target="_blank" rel="noopener">Read Book ${state.book} at Project Aon ↗</a></p><p class="hint">Unofficial fan-made prototype. Lone Wolf created by Joe Dever. Rules source: Project Aon. Inspired by <a href="https://www.projectaon.org/staff/eric/lw01.htm" target="_blank" rel="noopener">Eric’s Action Chart</a>. No book text or illustrations are included in the app.</p></div>`);
}
document.addEventListener('click',event=>{
  const button = event.target.closest('[data-action]'); if (!button || button.disabled) return;
  const action = button.dataset.action;
  if (action==='view') switchView(button.dataset.view);
  else if (action==='books') booksDialog();
  else if (action==='switch-book') selectBook(Number(button.dataset.book));
  else if (action==='continue-book2') book2Dialog(true);
  else if (action==='fresh-book2') book2Dialog(false);
  else if (action==='continue-book') bookSetupDialog(Number(button.dataset.book),true);
  else if (action==='fresh-book') bookSetupDialog(Number(button.dataset.book),false);
  else if (action==='close-dialog') closeDialog();
  else if(action==='psychic-dialog')psychicDialog();
  else if(action==='adjusted-roll')adjustedRollDialog();
  else if(action==='arch-cure') {
    if(!R.isMagnakai(state) || !state.ep)return toast('A dead hero cannot be healed.');
    change(s=>s.ep=R.cure(s),'Curing used: restored up to 20 EP. Record the use in Journal.');closeDialog();
  }
  else if (action==='stats') statsDialog();
  else if (action==='bookmark') dialog('Section bookmark',`<form id="bookmark-form" class="form-stack"><label>Current book section<input name="section" type="number" inputmode="numeric" min="1" max="${C.books[state.book].sections}" value="${state.section}" required></label><p class="hint">This is a bookmark only. Apply any Healing or section effects yourself.</p><button class="primary">Save bookmark</button></form>`);
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
  else if (action==='gold') {if(R.isMagnakai(state))resourceDialog('gold');else dialog('Belt pouch',`<form id="gold-form" class="form-stack"><label>Gold Crowns<input name="gold" type="number" inputmode="numeric" min="0" max="${Number.MAX_SAFE_INTEGER}" value="${state.gold}" required></label><p class="hint">50 is the usual pouch limit. You can record more when needed.</p><button class="primary">Save gold</button></form>`);}
  else if (action==='arrows') resourceDialog('arrows');
  else if (action==='resource-adjust') {
    const key=button.dataset.key,amount=Number($('#resource-value').value),maximum=key==='gold'?Number.MAX_SAFE_INTEGER:9999;
    if(!['gold','arrows'].includes(key) || key==='arrows' && !R.isMagnakai(state) || !Number.isSafeInteger(amount) || amount<0 || amount>maximum)return toast('Enter a valid whole-number total.');
    const delta=Number(button.dataset.value);
    change(s=>s[key]=R.clamp(amount+delta,0,maximum));resourceDialog(key);
    $(`[data-action="resource-adjust"][data-value="${delta}"]`)?.focus({preventScroll:true});
  }
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
  else if (action==='special-location') {specialLocation=button.dataset.location==='safekeeping'?'safekeeping':'carry';gearPage=0;render();}
  else if (action==='move-special') {
    try {
      const store=button.dataset.store==='true',next=C.moveSpecial(state,Number(button.dataset.index),store);
      change(()=>state=next,store?'Item moved to safekeeping.':'Item carried again.');
    } catch(error) {toast(error.message);}
  }
  else if (action==='combat-log') {roundPage=0;combatLogDialog();}
  else if (action==='round-page') {roundPage+=Number(button.dataset.value);combatLogDialog();}
  else if (action==='weapons') weaponsDialog();
  else if (action==='add-item') itemDialog(button.dataset.type || gearView);
  else if (action==='edit-effect') {
    const list=button.dataset.stored==='true'?'storedSpecial':'special',index=Number(button.dataset.index),item=state[list][index];
    if(!item)return;
    dialog('Item description',`<form id="effect-form" data-list="${list}" data-index="${index}" class="form-stack"><p>${escapeHTML(item.name)}</p><label>Description / how carried<input name="effect" maxlength="160" value="${escapeHTML(item.effect)}"></label><p class="hint">Description only. Existing score bonuses are kept.</p><button class="primary">Save description</button></form>`);
  }
  else if (action==='equip') {change(s=>s.equipped=Number(button.dataset.index));if(button.dataset.return==='weapons')weaponsDialog();}
  else if (action==='unarmed') {change(s=>s.equipped=-1,'Fighting unarmed.');if(button.dataset.return==='weapons')weaponsDialog();}
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
    const index=Number(button.dataset.index),recovery=R.potionRecovery(state.backpack[index]);
    if (!state.ep || state.combat?.status==='active' || !Number.isInteger(index) || index<0 || !recovery) return;
    if (state.ep===R.maxEndurance(state)) return toast('Endurance is already full. Potion kept.');
    change(s=>{s.backpack.splice(index,1);s.ep=Math.min(R.maxEndurance(s),s.ep+recovery);},'Potion used. Restored up to 4 endurance.');
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
$('#menu-button').addEventListener('click',()=>dialog('Adventure menu',`<div class="menu-options"><button class="secondary" data-action="undo" ${!undoStack.length?'disabled':''}>↶ Undo last change</button><button class="secondary" data-action="books">Switch books / continue journey</button><button class="secondary" data-action="stats">Edit scores</button>${R.isMagnakai(state)?'<button class="secondary" data-action="adjusted-roll">Adjusted missile roll</button><button class="secondary" data-action="psychic-dialog">Choose psychic attack</button>':''}<button class="secondary" data-action="export">Export save file</button><button class="secondary" data-action="import">Import save file</button><button class="secondary" data-action="rules">Book ${state.book} rules & credits</button><button class="danger-button" data-action="new">Start a new adventure…</button></div><p class="hint" style="margin-top:17px">${storageAvailable?'Changes save automatically in this browser.':'Browser storage is unavailable. Export your save before closing.'} Export to move your chart to another device.</p>`));
document.addEventListener('change',event=>{
  if(event.target.dataset?.lore) {
    try {const next=C.setLoreCircle(state,event.target.dataset.lore,event.target.checked);change(()=>state=next,'Lore-circle bonuses updated.');}
    catch(error){toast(error.message);render();}
  }
  else if(event.target.name==='preset') {
    const form=event.target.form, preset=event.target.value;
    if (preset==='custom') return;
    form.elements.name.value=preset;form.elements.ep.value=0;form.elements.cs.value=preset==='Shield'?2:0;
    form.elements.effect.value=preset==='Shield'?'+2 combat skill':'Equip for +8 CS; double damage to undead';
  }
  else if(event.target.id==='section') { const value=Number(event.target.value);if(Number.isInteger(value)&&value>=1&&value<=C.books[state.book].sections)change(s=>s.section=value);else{event.target.value=state.section;toast(`Choose a section from 1 to ${C.books[state.book].sections}.`);} }
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
      const book=Number(form.dataset.book || 2),source=continuing?campaign.books[Number(form.dataset.source || 1)]:null;
      if (continuing && (!source || !data.has('completed'))) throw new Error('Confirm that you successfully completed the source book.');
      const next=C.startBook(book,source,{cs:number('cs'),ep:number('ep'),gold:number('gold'),mastery:data.get('mastery') || 'Axe',discipline:data.get('discipline'),completed:data.has('completed'),fullKai:data.has('fullKai'),keepWeapons:source && C.books[book].noContinuedSupplies?undefined:data.getAll('keep').map(Number),items:Array.from({length:C.books[book].supplyLimit},(_,i)=>data.get(`item${i+1}`)).filter(Boolean)});
      change(()=>{campaign.activeBook=book;state=next;},continuing?`Book ${book} begins. Your Book ${source.book} chart is saved.`:`Book ${book} begins. Choose ${R.isMagnakai(next)?`${C.limit(next)} Magnakai`:'five Kai'} Disciplines.`);
      gearPage=roundPage=0;closeDialog();switchView(continuing?'chart':'kai');
    } catch(error) {$('#form-error').textContent=error.message;}
  }
  else if(form.id==='stats-form') {change(s=>{for(const key of ['baseCS','csBonus','baseEP','epBonus'])s[key]=number(key);s.ep=R.clamp(number('ep'),0,R.maxEndurance(s));if(s.combat?.status==='active'&&s.ep===0)s.combat.status='defeat';},'Scores updated.');closeDialog();}
  else if(form.id==='gold-form') {change(s=>s.gold=number('gold'));closeDialog();}
  else if(form.id==='resource-form') {
    const key=form.dataset.key,amount=number('amount'),maximum=key==='gold'?Number.MAX_SAFE_INTEGER:9999;
    if(!['gold','arrows'].includes(key) || key==='arrows' && !R.isMagnakai(state) || !Number.isSafeInteger(amount) || amount<0 || amount>maximum)return toast('Enter a valid whole-number total.');
    change(s=>s[key]=amount,'Total saved.');closeDialog();
  }
  else if(form.id==='psychic-form') {
    const mode=data.get('mode');
    if(!R.isMagnakai(state) || !Object.hasOwn(R.psychicModes,mode))return;
    change(s=>s.psychicMode=mode,'Psychic attack selected.');closeDialog();
  }
  else if(form.id==='adjusted-roll-form') {
    try {
      const raw=data.get('roll'),roll=raw===null || raw===''?randomNumber():Number(raw);
      const result=R.adjustedRoll(roll,number('modifier'),data.has('bow'),data.has('mentora'));
      change(s=>{s.lastRoll=roll;s.lastAdjustedRoll=result;},'Adjusted roll saved.');adjustedRollDialog();
    }catch(error){toast(error.message);}
  }
  else if(form.id==='magnakai-form') {
    try {
      const next=C.validateCharacter({...state,masteries:data.getAll('masteries'),disciplines:data.getAll('inherited'),mastery:data.get('mastery'),weaponmasteryLevel:data.get('weaponmasteryLevel') || state.weaponmasteryLevel || 'standard'});
      change(()=>state=next,'Mastery and inherited Kai record saved.');closeDialog();
    }catch(error){toast(error.message);}
  }
  else if(form.id==='effect-form') {
    const list=form.dataset.list,index=Number(form.dataset.index),effect=String(data.get('effect') || '');
    if(!['special','storedSpecial'].includes(list) || !state[list][index] || effect.length>160)return;
    change(s=>s[list][index].effect=effect,'Description saved.');closeDialog();
  }
  else if(form.id==='bookmark-form') {
    const section=number('section');
    if (!Number.isInteger(section) || section<1 || section>C.books[state.book].sections) return toast(`Choose a section from 1 to ${C.books[state.book].sections}.`);
    change(s=>s.section=section);closeDialog();
  }
  else if(form.id==='combat-form') {
    if(!state.ep)return;
    const mindblastDamage=number('mindblastDamage');
    if(!Number.isInteger(mindblastDamage) || mindblastDamage<0 || mindblastDamage>99)return toast('Enemy Mindblast damage must be 0–99 EP per round.');
    change(s=>s.combat={name:data.get('name').trim()||'Enemy',cs:number('cs'),maxEP:number('ep'),ep:number('ep'),modifier:number('modifier'),immune:data.has('immune'),undead:data.has('undead'),mindblastDamage,status:'active',rounds:[]});roundPage=0;
  }
  else if(form.id==='item-form') {
    if(state.combat?.status==='active') {$('#form-error').textContent='Finish combat before changing equipment.';return;}
    const type=form.dataset.type, kind=data.get('kind'), name=kind==='meal'?'Meal':kind==='potion'?'Healing Potion':String(data.get('name')).trim();
    if(!name) {$('#form-error').textContent='Enter an item name, or choose Meal or Healing Potion.';return;}
    if(type==='special' && ['Shield','Sommerswerd'].includes(name) && state.special.some(v=>v.name===name)) {$('#form-error').textContent=`You already carry a ${name}.`;return;}
    if((type==='weapons'&&state.weapons.length>=2)||(type==='backpack'&&state.meals+state.backpack.length>=8)||(type==='special'&&state.special.length+state.storedSpecial.length>=100)) {$('#form-error').textContent='No space available. Remove an item first.';return;}
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
