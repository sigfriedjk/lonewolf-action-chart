/* Exercise the real app's storage and Undo paths without changing a browser's saves. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const C=require('../campaign.js');
const R=require('../rules.js');
const old=C.newCharacter(18,27,32,2,'Sword');
delete old.book;delete old.continued;
old.section=350;old.ep=21;old.disciplines=['Healing','Hunting','Mindshield','Mindblast','Weaponskill'];
const legacy=JSON.stringify(old);
const storage=new Map([['lone-wolf-action-chart-v1',legacy]]);
const elements=new Map(), listeners=new Map(), rollAnimations=[];
function element(selector) {
  if (!elements.has(selector)) elements.set(selector,{dataset:{},classList:{add(name){if(selector==='.random .die') rollAnimations.push(name);},remove(){}},addEventListener(){},focus(){},close(){this.open=false;},showModal(){this.open=true;},scrollTop:0});
  return elements.get(selector);
}
const context=vm.createContext({window:{LWRules:R,LWCampaign:C,addEventListener(){}},document:{querySelector:element,addEventListener(type,fn){listeners.set(type,fn);}},
  localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},
  crypto:{getRandomValues(values){values[0]=7;return values;}},matchMedia:()=>({matches:false}),setTimeout:()=>0,clearTimeout(){},console});
vm.runInContext(fs.readFileSync(require.resolve('../app.js'),'utf8'),context);
assert.equal(storage.get('lone-wolf-action-chart-v1'),legacy,'Original Book 1 storage must be retained');
let saved=C.validateSave(JSON.parse(storage.get('lone-wolf-action-chart-v2')));
assert.equal(saved.books[1].ep,21);assert.equal(saved.books[1].section,350);
vm.runInContext("const next=C.startBook2(state,{gold:11,discipline:'Tracking',items:['Shield']});change(()=>{campaign.activeBook=2;state=next;});",context);
saved=C.validateSave(JSON.parse(storage.get('lone-wolf-action-chart-v2')));
assert.equal(saved.activeBook,2);assert.equal(saved.books[2].disciplines.length,6);assert.equal(saved.books[1].gold,32);assert.equal(saved.books[2].gold,43);
vm.runInContext('change(s=>s.ep=10);selectBook(1);change(s=>s.gold=1);selectBook(2);',context);
saved=C.validateSave(JSON.parse(storage.get('lone-wolf-action-chart-v2')));
assert.equal(saved.books[2].ep,10);assert.equal(saved.books[1].ep,21);assert.equal(saved.books[1].gold,1);assert.equal(saved.books[2].gold,43);
vm.runInContext('undo();undo();undo();undo();undo();',context);
saved=C.validateSave(JSON.parse(storage.get('lone-wolf-action-chart-v2')));
assert.equal(saved.activeBook,1);assert.equal(saved.books[1].gold,32);assert.equal(saved.books[1].ep,21);assert.equal(saved.books[2],undefined,'Undo the initial transfer restores the whole campaign');
assert.equal(storage.get('lone-wolf-action-chart-v1'),legacy);
function click(action,value,extra={}) {
  const button={dataset:{action,value,...extra},disabled:false};button.closest=()=>button;
  listeners.get('click')({target:button});
}
vm.runInContext('change(s=>s.gold=50);',context);
click('gold-adjust','1');
saved=C.validateSave(JSON.parse(storage.get('lone-wolf-action-chart-v2')));
assert.equal(saved.books[1].gold,51,'Quick + crosses the usual pouch limit');
click('gold-adjust','-1');assert.equal(vm.runInContext('state.gold',context),50);
vm.runInContext('undo();',context);assert.equal(vm.runInContext('state.gold',context),51);
vm.runInContext('change(s=>s.gold=0);',context);click('gold-adjust','-1');
assert.equal(vm.runInContext('state.gold',context),0,'Gold cannot become negative');
click('roll');click('roll');
assert.equal(vm.runInContext('state.lastRoll',context),7);
assert.deepEqual(rollAnimations,['rolling','rolling'],'Repeated results animate on every click');
assert.equal(element('#roll-status').textContent,'Roll 2: 7','Repeated results have distinct accessible announcements');
vm.runInContext("change(s=>{s.weapons=['Axe','Sword'];s.equipped=1;s.disciplines=['Weaponskill'];s.mastery='Sword';});gearView='special';",context);
const specialBefore=vm.runInContext('JSON.stringify(state.special)',context);
click('weapons');
click('remove-item',undefined,{index:'0',type:'weapons',return:'weapons'});
assert.equal(vm.runInContext('JSON.stringify(state.weapons)',context),'["Sword"]');
assert.equal(vm.runInContext('state.equipped',context),0,'Removing the first weapon keeps the second equipped');
assert.equal(vm.runInContext('JSON.stringify(state.special)',context),specialBefore,'Weapon removal never removes Special Items, regardless of the Gear tab');
assert.equal(vm.runInContext('R.combatSkill(state).total',context),20,'Weaponskill remains applied to the equipped Sword');
vm.runInContext('undo();',context);
assert.equal(vm.runInContext('JSON.stringify(state.weapons)',context),'["Axe","Sword"]');
click('equip',undefined,{index:'0',return:'weapons'});
assert.equal(vm.runInContext('R.combatSkill(state).total',context),18,'Switching to an unmastered weapon removes the mastery bonus');
click('unarmed',undefined,{return:'weapons'});
assert.equal(vm.runInContext('R.combatSkill(state).total',context),14,'Unarmed applies the existing penalty');
const beforeTabs=vm.runInContext('JSON.stringify(state)',context),undoBeforeTabs=vm.runInContext('undoStack.length',context);
click('view',undefined,{view:'special'});
assert.doesNotMatch(element('#main').innerHTML,/data-action="undo"/,'Special replaces its header Undo with the location toggle');
assert.equal(vm.runInContext('gearView',context),'special','The Special tab routes item controls to Special Items');
click('view',undefined,{view:'gear'});
assert.equal(vm.runInContext('gearView',context),'backpack','The Backpack tab routes item controls to the backpack');
assert.equal(vm.runInContext('JSON.stringify(state)',context),beforeTabs,'Navigating between the new tabs preserves the character and equipment');
assert.equal(vm.runInContext('undoStack.length',context),undoBeforeTabs,'Navigating does not consume Undo entries');
console.log('Passed: app storage migration, independent book edits, Undo, uncapped gold, repeated rolls, weapon management, and separate Backpack/Special routing.');
// Drive the real setup submit handler, not just the campaign API.
context.FormData=class {
  constructor(form){this.values=form.values;}
  get(key){const value=this.values[key];return Array.isArray(value)?value[0]??null:value??null;}
  getAll(key){const value=this.values[key];return value===undefined?[]:Array.isArray(value)?value:[value];}
  has(key){return Object.hasOwn(this.values,key);}
};
function submit(form){listeners.get('submit')({target:form,preventDefault(){}});}
vm.runInContext("campaign={version:2,activeBook:1,books:{1:C.newCharacter()}};state=campaign.books[1];state.disciplines=R.disciplines.slice(0,5).map(d=>d[0]);state.ep=19;undoStack.length=0;",context);
const skillNames=R.disciplines.map(d=>d[0]);
for(const book of [2,3,4,5]) {
  vm.runInContext(`bookSetupDialog(${book},true);`,context);
  assert.match(element('#dialog').innerHTML,new RegExp(`Begin Book ${book}`));
  assert.equal((element('#dialog').innerHTML.match(/name="item\d"/g)||[]).length,C.books[book].supplyLimit,'Expose the complete supply allowance');
  submit({id:'book2-form',dataset:{book:String(book),source:String(book-1),continuing:'true'},values:{completed:'on',gold:'12',discipline:skillNames[book+3],keep:['0'],item1:'',item2:''}});
  assert.equal(vm.runInContext('campaign.activeBook',context),book);
  assert.equal(C.validateSave(JSON.parse(storage.get('lone-wolf-action-chart-v2'))).activeBook,book);
  if(book===3) {
    click('eat');assert.equal(vm.runInContext('state.meals',context),0,'Kalte consumes a carried Meal despite Hunting');
    click('eat');assert.equal(vm.runInContext('state.ep',context),16,'Kalte without a carried Meal loses 3 EP');
    vm.runInContext("change(s=>s.backpack=['Potion of Laumspur']);",context);click('potion',undefined,{index:'0'});
    assert.equal(vm.runInContext('state.ep',context),20);assert.equal(vm.runInContext('state.backpack.length',context),0);
  }
}
submit({id:'bookmark-form',dataset:{},values:{section:'400'}});
assert.equal(vm.runInContext('state.section',context),400);
submit({id:'bookmark-form',dataset:{},values:{section:'401'}});
assert.equal(vm.runInContext('state.section',context),400,'Invalid Book 5 bookmarks cannot corrupt the save');
vm.runInContext('campaign=load();state=campaign.books[campaign.activeBook];render();',context);
assert.equal(vm.runInContext('state.book',context),5);assert.equal(vm.runInContext('state.section',context),400);
click('view',undefined,{view:'kai'});assert.match(element('#main').innerHTML,/Disciplines \(9\/9\)/);
click('view',undefined,{view:'combat'});assert.match(element('#main').innerHTML,/Undead enemy/);
const book5Before=vm.runInContext('JSON.stringify(state)',context);
click('switch-book',undefined,{book:'2'});assert.equal(vm.runInContext('state.book',context),2);
click('undo');assert.equal(vm.runInContext('JSON.stringify(state)',context),book5Before,'Undo restores the selected later chart');
vm.runInContext('booksDialog();',context);assert.match(element('#dialog').innerHTML,/Shadow on the Sand/);
console.log('Passed: real Books 2–5 setup submissions, full supply forms, Kalte Meals, Laumspur recovery, Book 5 bookmarks, five-book reloads, discipline count, later-book undead controls, switching, and Undo.');
submit({id:'book2-form',dataset:{book:'4',continuing:'false'},values:{cs:'16',ep:'24',gold:'12',mastery:'Sword',item1:'Sword',item2:'Dagger',item3:'2 Potions of Laumspur',item4:'5 Special Rations',item5:'Chainmail Waistcoat',item6:'Shield'}});
assert.equal(vm.runInContext('state.meals',context),5);assert.equal(vm.runInContext('state.backpack.length',context),2);
assert.equal(vm.runInContext('state.special.some(v=>v.name==="Shield")',context),true,'The sixth supply selector is submitted');
submit({id:'book2-form',dataset:{book:'5',continuing:'false'},values:{cs:'16',ep:'24',gold:'12',mastery:'Sword',item1:'Dagger',item2:'Potion of Laumspur',item3:'2 Special Rations',item4:'Shield'}});
assert.equal(vm.runInContext('state.meals',context),2);assert.equal(vm.runInContext('R.combatSkill(state).equipment',context),2);
click('view',undefined,{view:'special'});
const undoBeforeLocation=vm.runInContext('undoStack.length',context);
click('special-location',undefined,{location:'safekeeping'});
assert.equal(vm.runInContext('undoStack.length',context),undoBeforeLocation,'Location filtering creates no Undo entry');
assert.match(element('#main').innerHTML,/Nothing in safekeeping/);
click('special-location',undefined,{location:'carry'});
const shieldIndex=vm.runInContext('state.special.findIndex(v=>v.name==="Shield")',context);
click('move-special',undefined,{index:String(shieldIndex),store:'true'});
assert.equal(vm.runInContext('R.combatSkill(state).equipment',context),0);
click('special-location',undefined,{location:'safekeeping'});
assert.match(element('#main').innerHTML,/Carry Shield/);assert.doesNotMatch(element('#main').innerHTML,/data-action="equip"/);
vm.runInContext('campaign=load();state=campaign.books[campaign.activeBook];render();',context);
assert.equal(vm.runInContext('state.storedSpecial.length',context),1,'Safekeeping survives reload');
click('move-special',undefined,{index:'0',store:'false'});assert.equal(vm.runInContext('R.combatSkill(state).equipment',context),2);
click('undo');assert.equal(vm.runInContext('state.storedSpecial.length',context),1,'Undo restores the item location and bonuses');
vm.runInContext("change(s=>{s.disciplines=['Mindblast'];s.ep=24;});",context);
submit({id:'combat-form',dataset:{},values:{name:'Mindblast enemy',cs:'20',ep:'30',modifier:'0',mindblastDamage:'2'}});
assert.equal(vm.runInContext('state.combat.mindblastDamage',context),2);
vm.runInContext('rollRound(false,6);',context);
assert.equal(vm.runInContext('state.combat.rounds[0].mindblastLoss',context),2);
const combatSave=C.validateSave(JSON.parse(storage.get('lone-wolf-action-chart-v2')));
assert.equal(combatSave.books[5].combat.mindblastDamage,2);assert.equal(combatSave.books[5].combat.rounds[0].mindblastLoss,2);
click('undo');assert.equal(vm.runInContext('state.ep',context),24);assert.equal(vm.runInContext('state.combat.rounds.length',context),0);
const activeBefore=vm.runInContext('JSON.stringify(state)',context);
click('move-special',undefined,{index:'0',store:'false'});assert.equal(vm.runInContext('JSON.stringify(state)',context),activeBefore,'Combat blocks moving items');
const oldCombat=JSON.parse(activeBefore);delete oldCombat.combat.mindblastDamage;
assert.equal(C.validateCharacter(oldCombat).combat.mindblastDamage,0,'Legacy combats default to no enemy Mindblast');
assert.throws(()=>C.validateCharacter({...oldCombat,combat:{...oldCombat.combat,mindblastDamage:-1}}),/combat record/);
console.log('Passed: six/four-choice supply submissions, Special location toggles and moves, bonus changes, reload, Undo, combat guards, enemy Mindblast saves, and legacy combat migration.');
