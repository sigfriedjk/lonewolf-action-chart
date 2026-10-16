/* Save migration and Books 1–20 setup. Shared by the browser and Node tests. */
(function (root) {
  'use strict';
  const R = typeof module !== 'undefined' ? require('./rules.js') : root.LWRules;
  const clone = value => JSON.parse(JSON.stringify(value));
  const armoury = ['Sword','Short Sword','Two Meals','Chainmail Waistcoat','Mace','Healing Potion','Quarterstaff','Spear','Shield','Broadsword'];
  const books = {
    1:{title:'Flight from the Dark',slug:'01fftd',sections:350},
    2:{title:'Fire on the Water',slug:'02fotw',sections:350,supplyLimit:2,supplies:armoury,map:'Map of Sommerlund',gifts:['Seal of Hammerdal']},
    3:{title:'The Caverns of Kalte',slug:'03tcok',sections:350,supplyLimit:2,supplies:['Sword','Short Sword','Padded Leather Waistcoat','Spear','Mace','Warhammer','Axe','Potion of Laumspur','Quarterstaff','Special Rations','Broadsword'],map:'Map of Kalte',gifts:[]},
    4:{title:'The Chasm of Doom',slug:'04tcod',sections:350,supplyLimit:6,supplies:['Warhammer','Dagger','2 Potions of Laumspur','Sword','Spear','5 Special Rations','Mace','Chainmail Waistcoat','Shield'],map:'Map of the Southlands',gifts:['Badge of Rank']},
    5:{title:'Shadow on the Sand',slug:'05sots',sections:400,supplyLimit:4,supplies:['Dagger','Potion of Laumspur','Sword','Spear','2 Special Rations','Mace','Shield'],map:'Map of Vassagonia',gifts:[]},
    6:{title:'The Kingdoms of Terror',slug:'06tkot',series:'Magnakai',sections:350,supplyLimit:5,supplies:['Sword','Potion of Laumspur','Warhammer','Bow','Quiver','4 Special Rations','Quarterstaff','Padded Leather Waistcoat','Rope','Dagger','Tinderbox','Axe'],map:'Map of the Stornlands',gifts:[]},
    7:{title:'Castle Death',slug:'07cd',series:'Magnakai',sections:350,supplyLimit:5,supplies:['Sword','Bow','Quiver','Rope','Potion of Laumspur','Lantern','Mace','3 Meals','Dagger','3 Fireseeds'],map:'Map of Dessi',gifts:[]},
    8:{title:'The Jungle of Horrors',slug:'08tjoh',series:'Magnakai',sections:350,supplyLimit:5,supplies:['Sword','Bow','Quiver','Rope','Potion of Laumspur','Lantern','Mace','3 Meals','Dagger','3 Fireseeds'],map:'Map of the Danarg',gifts:[]},
    9:{title:'The Cauldron of Fear',slug:'09tcof',series:'Magnakai',sections:350,supplyLimit:5,supplies:['Sword','Bow','Quiver','Rope','Potion of Laumspur','Lantern','Mace','3 Meals','Dagger','3 Fireseeds'],map:'Map of Anari',gifts:[]},
    10:{title:'The Dungeons of Torgar',slug:'10tdot',series:'Magnakai',sections:350,supplyLimit:5,supplies:['Sword','Bow','Quiver','Rope','Potion of Laumspur','Lantern','Mace','3 Meals','Dagger','Potion of Alether'],map:'Map of Ghatan',gifts:[]},
    11:{title:'The Prisoners of Time',slug:'11tpot',series:'Magnakai',sections:350,supplyLimit:6,supplies:['Sword','Bow','Quiver','Rope','Potion of Laumspur','Lantern','Mace','3 Meals','Dagger'],map:null,gifts:[],freshMeals:2,noContinuedSupplies:true},
    12:{title:'The Masters of Darkness',slug:'12tmod',series:'Magnakai',sections:350,supplyLimit:6,supplies:['Sword','Bow','Quiver','Rope','Potion of Laumspur','Lantern','Mace','4 Meals','Dagger','Quarterstaff','Axe'],map:'Map of the Darklands',gifts:[]},
    13:{title:'The Plague Lords of Ruel',slug:'13tplor',series:'Grand Master',sections:350,supplyLimit:5,supplies:['Sword','Bow','Quiver','Axe','4 Meals','Rope','Potion of Laumspur','Spear','Dagger'],map:'Map of the Dark Realm of Ruel',gifts:[],goldBase:20},
    14:{title:'The Captives of Kaag',slug:'14tcok',series:'Grand Master',sections:350,supplyLimit:5,supplies:['Sword','Bow','Quiver','Axe','4 Meals','Rope','Potion of Laumspur','Spear','Dagger'],map:'Map of the Darklands',gifts:[],goldBase:20},
    15:{title:'The Darke Crusade',slug:'15tdc',series:'Grand Master',sections:350,supplyLimit:5,supplies:['Sword','Bow','Quiver','Axe','4 Meals','Rope','Potion of Laumspur','Spear','Dagger'],map:'Map of the Western Tentarias',gifts:[],goldBase:20},
    16:{title:'The Legacy of Vashna',slug:'16tlov',series:'Grand Master',sections:350,supplyLimit:4,supplies:['Sword','Bow','Quiver','Axe','2 Meals','Rope','Potion of Laumspur','Quarterstaff','Dagger'],map:'Map of the Maakengorge',gifts:[],goldBase:20},
    17:{title:'The Deathlord of Ixia',slug:'17tdoi',series:'Grand Master',sections:350,supplyLimit:4,supplies:['Broadsword','Bow','Quiver','Dagger','Sword','2 Meals','Rope','Potion of Laumspur','Axe'],map:'Map of Ixia and the Hardlands',gifts:[],goldBase:20},
    18:{title:'Dawn of the Dragons',slug:'18dotd',series:'Grand Master',sections:350,supplyLimit:4,supplies:['Quarterstaff','Bow','Quiver','Dagger','Sword','2 Meals','Rope','Potion of Laumspur','Axe'],map:'Map of Northern Magnamund',gifts:[],goldBase:20},
    19:{title:"Wolf’s Bane",slug:'19wb',series:'Grand Master',sections:350,supplyLimit:4,supplies:['Broadsword','Bow','Quiver','Dagger','Sword','2 Meals','Rope','Potion of Laumspur','Axe'],map:'Map of Sommerlund and the Wildlands',gifts:[],goldBase:20},
    20:{title:'The Curse of Naar',slug:'20tcon',series:'Grand Master',sections:350,supplyLimit:4,supplies:['Quarterstaff','Broadsword','Bow','Quiver','Dagger','Sword','2 Meals','Rope','Potion of Laumspur','Axe'],map:'Map of the Planes of Existence',gifts:[],goldBase:20}
  };
  const completed = s => s.completedBooks ?? (s.book===2 && s.continued ? [1] : []);
  const grandCarryover = ['Crystal Star Pendant','Sommerswerd','Silver Helm','Dagger of Vashna','Silver Bracers','Jewelled Mace','Silver Bow of Duadon','Helshezag','Kagonite Chainmail','Korlinium Scabbard'];
  const limit = s => R.isGrandMaster(s) ? 4 + completed(s).filter(book=>book>=13).length : R.isMagnakai(s) ? 3 + completed(s).filter(book=>book>=6).length : 5 + completed(s).length;
  const specialItemValid = v => v && typeof v.name==='string' && v.name.trim() && v.name.length<=80 && typeof v.effect==='string' && v.effect.length<=160 && Number.isInteger(v.ep) && v.ep>=0 && v.ep<=99 && Number.isInteger(v.cs) && v.cs>=0 && v.cs<=99;
  function newCharacter(cs = 15, ep = 25, gold = 0, loot = 6, mastery = 'Axe') {
    const s = {version:1,book:1,continued:false,completedBooks:[],storedSpecial:[],baseCS:cs,csBonus:0,baseEP:ep,epBonus:0,ep,gold,
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
    s.completedBooks ??= completed(s); s.storedSpecial ??= [];
    if (Array.isArray(s.special)) s.special = s.special.map(v=>v && {...v,cs:v.cs ?? 0});
    if (Array.isArray(s.storedSpecial)) s.storedSpecial = s.storedSpecial.map(v=>v && {...v,cs:v.cs ?? 0});
    if (s.combat) {
      s.combat.undead ??= false;s.combat.mindblastDamage ??= 0;
      if(Array.isArray(s.combat.rounds))s.combat.rounds=s.combat.rounds.map(r=>r && {...r,mindblastLoss:r.mindblastLoss ?? 0});
    }
    const higher=R.isAdvanced(s),grand=R.isGrandMaster(s);
    if(grand && s.grandFlaming===undefined)s.grandFlaming=false;
    if(higher && s.psychicMode===undefined)s.psychicMode='legacy';
    if(higher && (typeof s.psychicMode!=='string' || !Object.hasOwn(R.psychicModes,s.psychicMode)))throw new Error('Invalid psychic mode.');
    if(higher && s.lastAdjustedRoll===undefined)s.lastAdjustedRoll=null;
    if(higher && s.lastAdjustedRoll!==null){const r=s.lastAdjustedRoll;if(!r || r.total!==R.adjustedRoll(r.roll,r.modifier,r.bow,r.mentora,r.grandBow).total)throw new Error('Invalid adjusted roll.');s.lastAdjustedRoll=R.adjustedRoll(r.roll,r.modifier,r.bow,r.mentora,r.grandBow);}
    if(higher && s.weaponmasteryLevel===undefined)s.weaponmasteryLevel='standard';
    if(higher && (typeof s.weaponmasteryLevel!=='string' || !Object.hasOwn(R.weaponmasteryLevels,s.weaponmasteryLevel)))throw new Error('Invalid Weaponmastery level.');
    const uniqueList = (values,allowed) => Array.isArray(values) && values.length<=allowed.length && new Set(values).size===values.length && values.every(v=>allowed.includes(v));
    if (higher && (!uniqueList(s.magnakai,R.magnakai.map(d=>d[0])) || !uniqueList(s.masteries,R.weaponTypes(s)) || !uniqueList(s.loreCircles,R.loreCircles.map(c=>c.id)) || !integer(s.arrows,0,9999))) throw new Error('The Magnakai records are invalid.');
    if (grand && (!uniqueList(s.grandMaster,R.grandMaster.map(d=>d[0])) || !uniqueList(s.grandMasteries,R.weaponTypes(s)) || !integer(s.grandAdvances,0,8) || ![false,true,'crown'].includes(s.grandUnarmed) || typeof s.grandFlaming!=='boolean')) throw new Error('The Grand Master records are invalid.');
    if (!grand && higher && ['kaiSurge','kaiMindblast','kaiBlast'].includes(s.psychicMode)) throw new Error('Grand Master psychic mode requires a Grand Master chart.');
    if (s.version!==(grand?3:higher?2:1) || !Number.isInteger(s.book) || !books[s.book] || typeof s.continued!=='boolean' ||
        !Array.isArray(s.completedBooks) || s.completedBooks.length>s.book-1 || new Set(s.completedBooks).size!==s.completedBooks.length || !s.completedBooks.every(b=>Number.isInteger(b) && b>=1 && b<s.book) || s.continued!==Boolean(s.completedBooks.length) ||
        !Array.isArray(s.storedSpecial) || s.storedSpecial.length+s.special?.length>100 || !s.storedSpecial.every(specialItemValid) ||
        !integer(s.baseCS,0,99) || !integer(s.csBonus,-99,99) || !integer(s.baseEP,1,99) || !integer(s.epBonus,0,99) ||
        !integer(s.ep,0,10000) || !integer(s.gold,0,Number.MAX_SAFE_INTEGER) || !integer(s.meals,0,R.backpackLimit(s)) || !integer(s.section,1,books[s.book].sections) || !text(s.notes,20000) ||
        !Array.isArray(s.weapons) || s.weapons.length>2 || !s.weapons.every(w=>R.weaponTypes(s).includes(w)) ||
        !integer(s.equipped,-2,1) || (s.equipped>=0 && !s.weapons[s.equipped]) ||
        !Array.isArray(s.backpack) || s.backpack.length+s.meals>R.backpackLimit(s) || !s.backpack.every(v=>text(v,80) && v.trim()) ||
        !Array.isArray(s.special) || s.special.length>100 || !s.special.every(specialItemValid) ||
        (s.equipped===-2 && !s.special.some(v=>v.name==='Sommerswerd')) ||
        !Array.isArray(s.disciplines) || s.disciplines.length>(higher?10:limit(s)) || new Set(s.disciplines).size!==s.disciplines.length ||
        !s.disciplines.every(v=>R.disciplines.some(d=>d[0]===v)) || !R.weapons.includes(s.mastery) ||
        !(s.lastRoll===null || integer(s.lastRoll,0,9))) throw new Error('This file is not a valid Book 1–20 Action Chart.');
    if (s.ep>R.maxEndurance(s)) throw new Error('Endurance exceeds its maximum.');
    if (s.combat!==null) {
      const c = s.combat;
      if (!c || !text(c.name,80) || !integer(c.cs,0,99) || !integer(c.maxEP,1,999) || !integer(c.ep,0,c.maxEP) ||
          typeof c.immune!=='boolean' || typeof c.undead!=='boolean' || !integer(c.mindblastDamage,0,99) || !integer(c.modifier,-99,99) ||
          !['active','victory','defeat','evaded'].includes(c.status) || (c.status==='active' && (!s.ep || !c.ep)) ||
          !Array.isArray(c.rounds) || c.rounds.length>1000 || !c.rounds.every(r=>r && integer(r.roll,0,9) && integer(r.ratio,-20200,20200) && integer(r.heroLoss,0,10000) && integer(r.enemyLoss,0,999) && integer(r.mindblastLoss,0,Math.min(99,r.heroLoss)) && (r.surgeLoss===undefined || integer(r.surgeLoss,0,Math.min(2,r.heroLoss-r.mindblastLoss))) && typeof r.evade==='boolean')) throw new Error('The combat record is invalid.');
      for(const r of c.rounds){
        if(r.flameLoss!==undefined && !integer(r.flameLoss,0,Math.min(1,r.enemyLoss)))throw new Error('Invalid flaming-weapon loss.');
        if(['blastRolls','blastLoss','blastCost'].some(key=>Object.hasOwn(r,key))){
          const damage=R.kaiBlastDamage(r.blastRolls);
          if(!integer(r.blastLoss,0,Math.min(damage,r.enemyLoss-(r.flameLoss || 0))) || !integer(r.blastCost,0,Math.min(4,r.heroLoss-r.mindblastLoss)) || r.surgeLoss)throw new Error('Invalid Kai-blast record.');
        }
        if(['rayLoss','rayCost'].some(key=>Object.hasOwn(r,key)) && (!integer(r.rayLoss,0,Math.min(15,r.enemyLoss-(r.flameLoss || 0))) || !integer(r.rayCost,0,Math.min(4,r.heroLoss-r.mindblastLoss)) || r.surgeLoss || Object.hasOwn(r,'blastRolls')))throw new Error('Invalid Kai-ray record.');
      }
    }
    const clean = newCharacter();
    for (const key of Object.keys(clean)) clean[key] = clone(s[key]);
    if (higher) for (const key of ['magnakai','masteries','loreCircles','arrows','weaponmasteryLevel','psychicMode','lastAdjustedRoll']) clean[key]=clone(s[key]);
    if (grand) for (const key of ['grandMaster','grandMasteries','grandAdvances','grandUnarmed','grandFlaming']) clean[key]=clone(s[key]);
    clean.special = s.special.map(({name,effect,ep,cs})=>({name,effect,ep,cs}));
    clean.storedSpecial = s.storedSpecial.map(({name,effect,ep,cs})=>({name,effect,ep,cs}));
    if (s.combat) {
      const {name,cs,maxEP,ep,modifier,immune,undead,mindblastDamage,status,rounds} = s.combat;
      clean.combat = {name,cs,maxEP,ep,modifier,immune,undead,mindblastDamage,status,rounds:rounds.map(r=>({roll:r.roll,ratio:r.ratio,heroLoss:r.heroLoss,enemyLoss:r.enemyLoss,mindblastLoss:r.mindblastLoss,evade:r.evade,...Object.fromEntries(['surgeLoss','flameLoss','blastRolls','blastLoss','blastCost','rayLoss','rayCost'].filter(key=>Object.hasOwn(r,key)).map(key=>[key,clone(r[key])]))}))};
    }
    return clean;
  }
  function validateSave(input) {
    if (input?.version===1 || input?.version===2 && R.isMagnakai(input) || input?.version===3 && R.isGrandMaster(input)) {
      const s=validateCharacter(input);
      return {version:R.isGrandMaster(s)?4:R.isMagnakai(s)?3:2,activeBook:s.book,books:{[s.book]:s}};
    }
    if (![2,3,4].includes(input?.version) || !Number.isInteger(input.activeBook) || !books[input.activeBook] || !input.books || typeof input.books!=='object' || Array.isArray(input.books)) throw new Error('Invalid campaign save.');
    if (input.version===2 && Object.keys(input.books).some(book=>R.isMagnakai({book:Number(book)}))) throw new Error('Invalid campaign: Magnakai charts require version 3.');
    if (input.version<4 && Object.keys(input.books).some(book=>R.isGrandMaster({book:Number(book)}))) throw new Error('Invalid campaign: Grand Master charts require version 4.');
    const savedBooks={};
    for (const key of Object.keys(input.books)) {
      if (!Object.keys(books).includes(key)) throw new Error('Unsupported book in save.');
      const s=validateCharacter(input.books[key]);
      if (s.book!==Number(key)) throw new Error('Book and chart do not match.');
      savedBooks[key]=s;
    }
    if (!savedBooks[input.activeBook]) throw new Error('The active book is missing.');
    return {version:input.version,activeBook:input.activeBook,books:savedBooks};
  }
  function startBook2(source, options) {
    if (source && source.book!==1 && source.book!==undefined) throw new Error('Complete Book 1 before starting Book 2.');
    return startBook(2,source,options);
  }
  function moveSpecial(input,index,store) {
    if(typeof store!=='boolean')throw new Error('Choose Carry or Safekeeping.');
    const s=validateCharacter(input);
    if(s.combat?.status==='active')throw new Error('Finish combat before moving Special Items.');
    const from=store?s.special:s.storedSpecial,to=store?s.storedSpecial:s.special;
    if(!Number.isInteger(index) || index<0 || index>=from.length)throw new Error('This Special Item is no longer available.');
    const item=from[index];
    if(!store && ['Shield','Sommerswerd'].includes(item.name) && to.some(v=>v.name===item.name))throw new Error(`You already carry a ${item.name}. Store or remove it before retrieving this one.`);
    if(store && s.ep>0 && item.ep>=s.ep)throw new Error('Storing this armour would leave you with zero Endurance. Recover first.');
    from.splice(index,1);to.push(item);
    if(store && item.name==='Sommerswerd' && s.equipped===-2)s.equipped=-1;
    if(s.ep>0)s.ep+=store?-item.ep:item.ep;
    return validateCharacter(s);
  }
  function startBook(book, source, options) {
    const setup=books[book];
    if (!Number.isInteger(book) || book<2 || !setup) throw new Error('Unsupported book setup.');
    let s;
    if (source) {
      s=validateCharacter(source);
      if (s.book>=book || !R.isAdvanced({book}) && (s.disciplines.length!==limit(s) || !s.ep || s.combat?.status==='active')) throw new Error(`Complete Book ${s.book} with ${limit(s)===5?'five':limit(s)} Kai Disciplines and finish any combat first; continue into a later book.`);
      if (R.isAdvanced({book})) {
        if (options.completed!==true) throw new Error('Confirm that you completed the source adventure.');
      } else {
        if (!R.disciplines.some(d=>d[0]===options.discipline) || s.disciplines.includes(options.discipline)) throw new Error('Choose one new Kai Discipline.');
        s.disciplines.push(options.discipline);
      }
      s.completedBooks=[...s.completedBooks,s.book].sort((a,b)=>a-b);
      s.continued=true;
    } else {
      const csBase=R.isGrandMaster({book})?25:10,epBase=R.isGrandMaster({book})?30:20;
      if (!Number.isInteger(options.cs) || options.cs<csBase || options.cs>csBase+9 || !Number.isInteger(options.ep) || options.ep<epBase || options.ep>epBase+9) throw new Error(`Starting scores must be CS ${csBase}–${csBase+9} and Endurance ${epBase}–${epBase+9}.`);
      s=newCharacter(options.cs,options.ep,0,-1,options.mastery);
      s.weapons=[];s.equipped=-1;s.meals=0;s.special=[];
    }
    s.book=book;s.section=1;s.combat=null;s.lastRoll=null;
    if (R.isAdvanced(s)) {
      s.version=R.isGrandMaster(s)?3:2;
      if (!source || !R.isAdvanced(source)) {s.magnakai=[];s.masteries=[];s.loreCircles=[];s.arrows=0;s.weaponmasteryLevel='standard';s.psychicMode='legacy';s.lastAdjustedRoll=null;}
      if (source && options.fullKai===true) {
        s.disciplines=R.disciplines.map(d=>d[0]);s.completedBooks=[...new Set([1,2,3,4,5,...s.completedBooks])].sort((a,b)=>a-b);
      }
    }
    if (R.isGrandMaster(s)) {
      if(!source || !R.isGrandMaster(source)) {s.grandMaster=[];s.grandMasteries=[];s.grandAdvances=0;s.grandUnarmed=false;s.grandFlaming=false;}
      if(source && options.fullMagnakai===true) {s.magnakai=R.magnakai.map(d=>d[0]);s.completedBooks=[...new Set([...s.completedBooks,6,7,8,9,10,11,12])].sort((a,b)=>a-b);}
    }
    const noSupplies=source && setup.noContinuedSupplies;
    const goldBase=setup.goldBase || 10;
    if(!noSupplies){if (!Number.isInteger(options.gold) || options.gold<goldBase || options.gold>goldBase+9) throw new Error(`Starting gold must be ${goldBase}–${goldBase+9} Crowns.`);s.gold+=options.gold;}
    if(!source)s.meals+=setup.freshMeals || 0;
    const carriedSpecialCount=source?s.special.length:0;
    // Retain old maps, replace none of the character's existing possessions.
    for (const name of [setup.map,...setup.gifts].filter(Boolean)) {
      if (!s.special.some(v=>v.name===name)) s.special.push({name,effect:name==='Seal of Hammerdal'?'Ring worn on your right hand':name==='Badge of Rank'?'Worn on your tunic sleeve':'Carried map',ep:0,cs:0});
    }
    const store=options.storeSpecial ?? [];
    if (!Array.isArray(store) || new Set(store).size!==store.length || !store.every(i=>Number.isInteger(i) && i>=0 && i<carriedSpecialCount)) throw new Error('Invalid safekeeping selection.');
    const stowed=s.special.filter((_,i)=>store.includes(i));
    s.storedSpecial.push(...stowed);
    s.special=s.special.filter((_,i)=>!store.includes(i));
    s.ep=Math.max(0,s.ep-stowed.reduce((sum,item)=>sum+item.ep,0));
    if (s.equipped===-2 && !s.special.some(v=>v.name==='Sommerswerd')) s.equipped=-1;
    if (!s.ep && (!R.isAdvanced(s) || stowed.length)) throw new Error('Storing this armour would leave you with zero Endurance. Recover before starting.');
    const keep=options.keepWeapons ?? s.weapons.map((_,i)=>i);
    if (!Array.isArray(keep) || new Set(keep).size!==keep.length || !keep.every(i=>Number.isInteger(i) && i>=0 && i<s.weapons.length)) throw new Error('Invalid weapon exchange.');
    const originalEquipped=s.equipped;
    s.weapons=s.weapons.filter((_,i)=>keep.includes(i));
    s.equipped=originalEquipped===-2 ? -2 : keep.slice().sort((a,b)=>a-b).indexOf(originalEquipped);
    const items=options.items ?? [];
    if(noSupplies && items.length)throw new Error('Continued Book 11 entry has no starting supply choices.');
    if (!Array.isArray(items) || items.length>setup.supplyLimit || new Set(items).size!==items.length || !items.every(v=>setup.supplies.includes(v))) throw new Error(`Choose up to ${setup.supplyLimit===2?'two':setup.supplyLimit} different ${book===2?'Royal Armoury':'starting supply'} items.`);
    for (const item of items) {
      if (R.weaponTypes(s).includes(item)) s.weapons.push(item);
      else if (['Two Meals','Special Rations','2 Special Rations','4 Special Rations','5 Special Rations'].includes(item)) s.meals+=item==='Special Rations'?1:item==='5 Special Rations'?5:item==='4 Special Rations'?4:2;
      else if (item==='2 Meals') s.meals+=2;
      else if (item==='3 Meals') s.meals+=3;
      else if (item==='4 Meals') s.meals+=4;
      else if (item==='Potion of Alether')s.backpack.push(item);
      else if (item==='2 Potions of Laumspur') s.backpack.push('Potion of Laumspur','Potion of Laumspur');
      else if (R.potionRecovery(item)) s.backpack.push(item);
      else if (['Rope','Tinderbox','Lantern'].includes(item)) s.backpack.push(item);
      else if (item==='3 Fireseeds') {
        for(let i=0;i<3;i++)s.special.push({name:'Fireseed',effect:'Explosive; use and remove manually as directed by the section',ep:0,cs:0});
      }
      else if (item==='Quiver') {
        if (!s.special.some(v=>v.name==='Quiver')) s.special.push({name:'Quiver',effect:'Slung over shoulder; arrows recorded on Stats',ep:0,cs:0});
        s.arrows+=6;
      }
      else {
        if (s.special.some(v=>v.name===item)) throw new Error(`You already carry a ${item}. Choose another item.`);
        const ep=item==='Chainmail Waistcoat'?4:item==='Padded Leather Waistcoat'?2:0,cs=item==='Shield'?2:0;
        s.special.push({name:item,effect:ep?`+${ep} maximum endurance`:'+2 combat skill',ep,cs});if(s.ep>0)s.ep+=ep;
      }
    }
    if (s.weapons.length>2) throw new Error('You can carry two weapons. Uncheck a carried weapon to exchange it.');
    if (s.meals+s.backpack.length>R.backpackLimit(s)) throw new Error(`Your backpack is full. Choose other supplies${source?`, or free space in Book ${source.book} first`:''}.`);
    if (!source && s.weapons.length) s.equipped=0;
    return validateCharacter(s);
  }
  function setLoreCircle(input,id,checked) {
    const s=validateCharacter(input);
    if (!R.isAdvanced(s) || !R.loreCircles.some(c=>c.id===id) || typeof checked!=='boolean') throw new Error('Invalid Lore-circle selection.');
    const before=R.maxEndurance(s);
    s.loreCircles=s.loreCircles.filter(value=>value!==id);
    if(checked)s.loreCircles.push(id);
    if(s.ep>0)s.ep=R.clamp(s.ep+R.maxEndurance(s)-before,0,R.maxEndurance(s));
    if(s.ep===0 && s.combat?.status==='active')s.combat.status='defeat';
    return validateCharacter(s);
  }
  function setGrandTraining(input,fields) {
    const s=validateCharacter(input);
    if(!R.isGrandMaster(s))throw new Error('Choose a Grand Master chart.');
    const before=R.maxEndurance(s);
    for(const key of ['grandMasteries','grandAdvances','grandUnarmed','grandFlaming','masteries','magnakai','disciplines','mastery','weaponmasteryLevel','loreCircles'])if(Object.hasOwn(fields,key))s[key]=clone(fields[key]);
    if(s.ep>0)s.ep=R.clamp(s.ep+R.maxEndurance(s)-before,0,R.maxEndurance(s));
    if(s.ep===0 && s.combat?.status==='active')s.combat.status='defeat';
    return validateCharacter(s);
  }
  const campaign={books,armoury,grandCarryover,limit,newCharacter,validateCharacter,validateSave,startBook2,startBook,moveSpecial,setLoreCircle,setGrandTraining};
  if (typeof module!=='undefined') module.exports=campaign;
  else root.LWCampaign=campaign;
})(typeof window!=='undefined'?window:globalThis);
