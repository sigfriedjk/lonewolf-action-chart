/* Save migration and Book 2 setup. Shared by the browser and Node tests. */
(function (root) {
  'use strict';
  const R = typeof module !== 'undefined' ? require('./rules.js') : root.LWRules;
  const clone = value => JSON.parse(JSON.stringify(value));
  const books = {1:{title:'Flight from the Dark',slug:'01fftd'},2:{title:'Fire on the Water',slug:'02fotw'}};
  const armoury = ['Sword','Short Sword','Two Meals','Chainmail Waistcoat','Mace','Healing Potion','Quarterstaff','Spear','Shield','Broadsword'];
  const limit = s => s.book === 2 && s.continued ? 6 : 5;
  function newCharacter(cs = 15, ep = 25, gold = 0, loot = 6, mastery = 'Axe') {
    const s = {version:1,book:1,continued:false,baseCS:cs,csBonus:0,baseEP:ep,epBonus:0,ep,gold,
      meals:1,weapons:['Axe'],equipped:0,backpack:[],special:[{name:'Map of Sommerlund',effect:'Carried inside your tunic',ep:0}],
      disciplines:[],mastery,section:1,notes:'',lastRoll:null,combat:null};
    const lootWeapons = {0:'Broadsword',1:'Sword',5:'Mace',7:'Quarterstaff',8:'Spear'};
    if (lootWeapons[loot]) s.weapons.push(lootWeapons[loot]);
    if (loot === 2) s.special.push({name:'Helmet',effect:'+2 maximum endurance',ep:2});
    if (loot === 3) s.meals += 2;
    if (loot === 4) s.special.push({name:'Chainmail Waistcoat',effect:'+4 maximum endurance',ep:4});
    if (loot === 6) s.backpack.push('Healing Potion');
    if (loot === 9) s.gold += 12;
    s.ep = R.maxEndurance(s);
    return s;
  }
  function validateCharacter(input) {
    const s = clone(input);
    const integer = (n,min,max) => Number.isInteger(n) && n>=min && n<=max;
    const text = (v,max) => typeof v==='string' && v.length<=max;
    if (!s || typeof s!=='object' || Array.isArray(s)) throw new Error('Invalid Action Chart.');
    // Legacy Book 1 exports did not have book, continued, Special Item CS, or undead fields.
    s.book ??= 1; s.continued ??= false;
    if (Array.isArray(s.special)) s.special = s.special.map(v=>v && {...v,cs:v.cs ?? 0});
    if (s.combat) s.combat.undead ??= false;
    if (s.version!==1 || ![1,2].includes(s.book) || typeof s.continued!=='boolean' || (s.book===1 && s.continued) ||
        !integer(s.baseCS,0,99) || !integer(s.csBonus,-99,99) || !integer(s.baseEP,1,99) || !integer(s.epBonus,0,99) ||
        !integer(s.ep,0,10000) || !integer(s.gold,0,50) || !integer(s.meals,0,8) || !integer(s.section,1,350) || !text(s.notes,20000) ||
        !Array.isArray(s.weapons) || s.weapons.length>2 || !s.weapons.every(w=>R.weapons.includes(w)) ||
        !integer(s.equipped,-2,1) || (s.equipped>=0 && !s.weapons[s.equipped]) ||
        !Array.isArray(s.backpack) || s.backpack.length+s.meals>8 || !s.backpack.every(v=>text(v,80) && v.trim()) ||
        !Array.isArray(s.special) || s.special.length>100 || !s.special.every(v=>v && text(v.name,80) && v.name.trim() && text(v.effect,160) && integer(v.ep,0,99) && integer(v.cs,0,99)) ||
        (s.equipped===-2 && !s.special.some(v=>v.name==='Sommerswerd')) ||
        !Array.isArray(s.disciplines) || s.disciplines.length>limit(s) || new Set(s.disciplines).size!==s.disciplines.length ||
        !s.disciplines.every(v=>R.disciplines.some(d=>d[0]===v)) || !R.weapons.includes(s.mastery) ||
        !(s.lastRoll===null || integer(s.lastRoll,0,9))) throw new Error('This file is not a valid Book 1 or Book 2 Action Chart.');
    if (s.ep>R.maxEndurance(s)) throw new Error('Endurance exceeds its maximum.');
    if (s.combat!==null) {
      const c = s.combat;
      if (!c || !text(c.name,80) || !integer(c.cs,0,99) || !integer(c.maxEP,1,999) || !integer(c.ep,0,c.maxEP) ||
          typeof c.immune!=='boolean' || typeof c.undead!=='boolean' || !integer(c.modifier,-99,99) ||
          !['active','victory','defeat','evaded'].includes(c.status) || (c.status==='active' && (!s.ep || !c.ep)) ||
          !Array.isArray(c.rounds) || c.rounds.length>1000 || !c.rounds.every(r=>r && integer(r.roll,0,9) && integer(r.ratio,-20200,20200) && integer(r.heroLoss,0,10000) && integer(r.enemyLoss,0,999) && typeof r.evade==='boolean')) throw new Error('The combat record is invalid.');
    }
    const clean = newCharacter();
    for (const key of Object.keys(clean)) clean[key] = clone(s[key]);
    clean.special = s.special.map(({name,effect,ep,cs})=>({name,effect,ep,cs}));
    if (s.combat) {
      const {name,cs,maxEP,ep,modifier,immune,undead,status,rounds} = s.combat;
      clean.combat = {name,cs,maxEP,ep,modifier,immune,undead,status,rounds:rounds.map(({roll,ratio,heroLoss,enemyLoss,evade})=>({roll,ratio,heroLoss,enemyLoss,evade}))};
    }
    return clean;
  }
  function validateSave(input) {
    if (input?.version===1) {
      const s=validateCharacter(input);
      return {version:2,activeBook:s.book,books:{[s.book]:s}};
    }
    if (input?.version!==2 || ![1,2].includes(input.activeBook) || !input.books || typeof input.books!=='object' || Array.isArray(input.books)) throw new Error('Invalid campaign save.');
    const savedBooks={};
    for (const key of Object.keys(input.books)) {
      if (!['1','2'].includes(key)) throw new Error('Unsupported book in save.');
      const s=validateCharacter(input.books[key]);
      if (s.book!==Number(key)) throw new Error('Book and chart do not match.');
      savedBooks[key]=s;
    }
    if (!savedBooks[input.activeBook]) throw new Error('The active book is missing.');
    return {version:2,activeBook:input.activeBook,books:savedBooks};
  }
  function startBook2(source, options) {
    let s;
    if (source) {
      s=validateCharacter(source);
      if (s.book!==1 || s.disciplines.length!==5 || !s.ep || s.combat?.status==='active') throw new Error('Complete Book 1 with five Kai Disciplines and finish any combat first.');
      if (!R.disciplines.some(d=>d[0]===options.discipline) || s.disciplines.includes(options.discipline)) throw new Error('Choose one new Kai Discipline.');
      s.disciplines.push(options.discipline);
      s.continued=true;
    } else {
      s=newCharacter(options.cs,options.ep,0,-1,options.mastery);
      s.weapons=[];s.equipped=-1;s.meals=0;
    }
    s.book=2;s.section=1;s.combat=null;s.lastRoll=null;
    if (!Number.isInteger(options.gold) || options.gold<10 || options.gold>19) throw new Error('Royal gold must be 10–19 Crowns.');
    s.gold=Math.min(50,s.gold+options.gold);
    if (!s.special.some(v=>v.name==='Seal of Hammerdal')) s.special.push({name:'Seal of Hammerdal',effect:'Ring worn on your right hand',ep:0,cs:0});
    const keep=options.keepWeapons ?? s.weapons.map((_,i)=>i);
    if (!Array.isArray(keep) || new Set(keep).size!==keep.length || !keep.every(i=>Number.isInteger(i) && i>=0 && i<s.weapons.length)) throw new Error('Invalid weapon exchange.');
    const originalEquipped=s.equipped;
    s.weapons=s.weapons.filter((_,i)=>keep.includes(i));
    s.equipped=originalEquipped===-2 ? -2 : keep.slice().sort((a,b)=>a-b).indexOf(originalEquipped);
    const items=options.items ?? [];
    if (!Array.isArray(items) || items.length>2 || new Set(items).size!==items.length || !items.every(v=>armoury.includes(v))) throw new Error('Choose up to two different Royal Armoury items.');
    for (const item of items) {
      if (R.weapons.includes(item)) s.weapons.push(item);
      else if (item==='Two Meals') s.meals+=2;
      else if (item==='Healing Potion') s.backpack.push(item);
      else {
        if (s.special.some(v=>v.name===item)) throw new Error(`You already carry a ${item}. Choose another item.`);
        const ep=item==='Chainmail Waistcoat'?4:0,cs=item==='Shield'?2:0;
        s.special.push({name:item,effect:ep?'+4 maximum endurance':'+2 combat skill',ep,cs});s.ep+=ep;
      }
    }
    if (s.weapons.length>2) throw new Error('You can carry two weapons. Uncheck a carried weapon to exchange it.');
    if (s.meals+s.backpack.length>8) throw new Error('Your backpack is full. Choose other supplies, or free space in Book 1 first.');
    if (!source && s.weapons.length) s.equipped=0;
    return validateCharacter(s);
  }
  const campaign={books,armoury,limit,newCharacter,validateCharacter,validateSave,startBook2};
  if (typeof module!=='undefined') module.exports=campaign;
  else root.LWCampaign=campaign;
})(typeof window!=='undefined'?window:globalThis);
