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
const elements=new Map();
function element(selector) {
  if (!elements.has(selector)) elements.set(selector,{dataset:{},classList:{add(){},remove(){}},addEventListener(){},focus(){},close(){},scrollTop:0});
  return elements.get(selector);
}
const context=vm.createContext({window:{LWRules:R,LWCampaign:C,addEventListener(){}},document:{querySelector:element,addEventListener(){}},
  localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},
  matchMedia:()=>({matches:false}),setTimeout:()=>0,clearTimeout(){},console});
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
console.log('Passed: actual app storage migration retains original Book 1 data; book edits stay independent; Undo restores transfers and book switches.');
