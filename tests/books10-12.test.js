/* Book-specific setup, explicit arithmetic helpers, save transitions and sources. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C=require('../campaign.js'),R=require('../rules.js');
const clone=s=>JSON.parse(JSON.stringify(s));
const opts={cs:16,ep:25,gold:12,items:[]};
const fight=()=>{const s=C.startBook(12,null,{...opts,items:['Sword']});s.combat={name:'Test',cs:15,maxEP:999,ep:999,modifier:0,immune:false,undead:false,mindblastDamage:2,status:'active',rounds:[]};return s;};
for(const book of [10,11,12]){
  const s=C.startBook(book,null,opts);assert.equal(C.limit(s),3);assert.equal(s.psychicMode,'legacy');
  assert.equal(s.meals,book===11?2:0);assert.equal(s.special.length,book===11?0:1);
  for(const item of C.books[book].supplies)C.validateCharacter(C.startBook(book,null,{...opts,items:[item]}));
  const src=C.startBook(book-1,null,{...opts,items:['Sword','Quiver']});
  src.magnakai=['Weaponmastery'];src.masteries=['Sword'];src.weaponmasteryLevel='scion';src.psychicMode='archSurge';src.ep-=4;
  src.lastAdjustedRoll=R.adjustedRoll(8,-1,true,true);src.arrows=2;src.notes='Keep';
  const before=clone(src),next=C.startBook(book,src,{gold:11,completed:true,items:[]});
  assert.deepEqual(src,before);assert.equal(next.ep,src.ep);assert.equal(next.psychicMode,'archSurge');
  assert.equal(next.weaponmasteryLevel,'scion');assert.equal(next.gold,book===11?src.gold:src.gold+11);
  assert.equal(next.arrows,2);assert.deepEqual(next.lastAdjustedRoll,src.lastAdjustedRoll);assert.equal(C.limit(next),4);
  assert.deepEqual(C.validateCharacter(clone(next)),next);
  assert.throws(()=>C.startBook(book,src,{gold:11,items:[]}),/Confirm/);
  assert.throws(()=>C.validateCharacter({...s,section:351}));
  const path=`all-books-simple/en/xhtml-simple/lw/${C.books[book].slug}.htm`;
  if(fs.existsSync(path)){
    const table=fs.readFileSync(path,'utf8').split('<a id="crtable">')[1].split('</tbody>')[0];
    const rows=[...table.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(m=>({roll:Number(m[1].match(/<th scope="row">(\d)<\/th>/)?.[1]),cells:[...m[1].matchAll(/<td>([\dk]+\/[\dk]+)<\/td>/g)].map(x=>x[1])})).filter(r=>r.cells.length);
    assert.equal(rows.length,10);for(const row of rows)assert.deepEqual(row.cells,R.table[row.roll]);
    console.log(`Local Book ${book}: all 130 table cells match.`);
  }else console.log(`Optional Book ${book} comparison skipped (no download).`);
}
assert.ok(C.startBook(10,null,{...opts,items:['Potion of Alether']}).backpack.includes('Potion of Alether'));
assert.equal(C.startBook(12,null,{...opts,items:['4 Meals']}).meals,4);
const eleven=C.startBook(11,null,{...opts,items:['3 Meals','Rope','Lantern','Potion of Laumspur','Bow','Quiver']});
assert.equal(eleven.meals,5);assert.equal(eleven.backpack.length,3);assert.equal(eleven.arrows,6);
assert.throws(()=>C.startBook(11,eleven,{completed:true,items:['Sword']}),/later book/);
const ten=C.startBook(10,null,opts);
assert.throws(()=>C.startBook(11,ten,{completed:true,items:['Sword']}),/no starting/);
const continued11=C.startBook(11,ten,{completed:true});assert.equal(continued11.gold,ten.gold);
for(const [mode,cs,cost] of [['none',0,0],['mindblast',2,0],['surge',4,2],['archMindblast',3,0],['archSurge',6,1]]){
  const s=fight();s.psychicMode=mode;
  const base=R.combatSkill({...s,psychicMode:'none'}).total;
  assert.equal(R.combatSkill(s).total,base+cs);
  assert.equal(R.combatSkill(s,true).mindblast,0);
  const expectedTable=R.combatResult(R.combatSkill(s).total-s.combat.cs,5).hero;
  const before=s.ep,r=R.resolveRound(s,5);
  assert.equal(r.heroLoss,expectedTable+2+cost);assert.equal(r.surgeLoss||0,cost);assert.equal(s.ep,before-r.heroLoss);
  const saved=C.validateCharacter(clone(s));assert.deepEqual(saved,s);
}
let s=fight();s.psychicMode='surge';s.combat.immune=true;s.magnakai=['Psi-screen'];
let r=R.resolveRound(s,0,true);assert.equal(r.enemyLoss,0);assert.equal(r.surgeLoss,2);assert.equal(r.mindblastLoss,0);
s=fight();s.psychicMode='surge';s.ep=1;s.combat.cs=99;r=R.resolveRound(s,1);assert.equal(r.heroLoss,1);assert.equal(s.ep,0);assert.equal(s.combat.status,'defeat');
s=fight();s.magnakai=R.magnakai.map(d=>d[0]);assert.equal(R.psychicEffect(s).cs,2,'All skills do not select Archmaster');
for(const value of ['bogus',{},null])assert.throws(()=>C.validateCharacter({...s,psychicMode:value}));
assert.deepEqual(R.adjustedRoll(9,-1,true,true),{roll:9,modifier:-1,bow:true,mentora:true,total:13});
assert.equal(R.adjustedRoll(0,-3).total,-3);assert.throws(()=>R.adjustedRoll(10));
assert.throws(()=>C.validateCharacter({...s,lastAdjustedRoll:{...R.adjustedRoll(4),total:99}}));
assert.throws(()=>C.validateCharacter({...s,combat:{...s.combat,rounds:[{roll:0,ratio:0,heroLoss:1,enemyLoss:0,mindblastLoss:0,surgeLoss:2,evade:false}]}}));
const old=clone(s);delete old.psychicMode;delete old.lastAdjustedRoll;
assert.equal(C.validateCharacter(old).psychicMode,'legacy');assert.equal(C.validateCharacter(old).lastAdjustedRoll,null);
s.ep=6;assert.equal(R.cure(s),25);s.ep=24;assert.equal(R.cure(s),25);s.ep=0;assert.equal(R.cure(s),0);
const books={1:C.validateCharacter(C.newCharacter())};for(let book=2;book<=12;book++)books[book]=C.startBook(book,null,opts);
books[12].psychicMode='archSurge';books[12].lastAdjustedRoll=R.adjustedRoll(8,1,true,true);
const save={version:3,activeBook:12,books};assert.deepEqual(C.validateSave(clone(save)),save);

const elements=new Map(),listeners=new Map();
const initial=JSON.stringify({version:3,activeBook:12,books:{12:C.startBook(12,null,{...opts,items:['Sword']})}});
const storage=new Map([['lone-wolf-action-chart-v3',initial]]);
function element(key){if(!elements.has(key))elements.set(key,{dataset:{},classList:{add(){},remove(){}},addEventListener(){},focus(){},close(){},showModal(){},scrollTop:0});return elements.get(key);}
const context=vm.createContext({window:{LWRules:R,LWCampaign:C,addEventListener(){}},document:{querySelector:element,addEventListener(type,fn){listeners.set(type,fn);}},localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},crypto:{getRandomValues(a){a[0]=5;return a;}},matchMedia:()=>({matches:false}),setTimeout:()=>0,clearTimeout(){},console});
context.FormData=class{constructor(form){this.values=form.values;}get(key){const v=this.values[key];return Array.isArray(v)?v[0]??null:v??null;}getAll(key){const v=this.values[key];return v===undefined?[]:Array.isArray(v)?v:[v];}has(key){return Object.hasOwn(this.values,key);}};
const run=code=>vm.runInContext(code,context);
run(fs.readFileSync(require.resolve('../app.js'),'utf8'));
function submit(id,values,dataset={}){listeners.get('submit')({target:{id,values,dataset},preventDefault(){}});}
function click(action){listeners.get('click')({target:{closest(){return {dataset:{action},disabled:false};}},detail:0});}
run('view="combat";render();');
submit('combat-form',{name:'Test',cs:'15',ep:'30',modifier:'0',mindblastDamage:'0'});
submit('psychic-form',{mode:'archSurge'});assert.equal(run('state.psychicMode'),'archSurge');
run('rollRound(false,0);');assert.equal(run('state.combat.rounds[0].surgeLoss'),1);
const ep=run('state.ep');run('undo();');assert.equal(run('state.ep'),ep+1);
run('state.ep=6;persist();');click('arch-cure');assert.equal(run('state.ep'),25);run('undo();');assert.equal(run('state.ep'),6);
submit('adjusted-roll-form',{roll:'9',modifier:'-1',bow:'on',mentora:'on'});
assert.equal(run('state.lastAdjustedRoll.total'),13);assert.equal(run('state.lastRoll'),9);
run('campaign=load();state=campaign.books[12];');assert.equal(run('state.lastAdjustedRoll.total'),13);assert.equal(run('state.psychicMode'),'archSurge');
run(`campaign.books[10]=${JSON.stringify(C.startBook(10,null,{...opts,items:['Sword']}))};`);
run('bookSetupDialog(11,true);');assert.doesNotMatch(element('#dialog').innerHTML,/name="gold"|name="item1"/);
// From an earlier source, the actual continuation form preserves carried weapons.
submit('book2-form',{completed:'on'},{book:'11',source:'10',continuing:'true'});
assert.equal(run('state.book'),11);assert.equal(run('state.weapons[0]'),'Sword');assert.equal(run('state.gold'),12);
console.log('Passed: Books 10–12 supplies, no continued Book 11 grants, psychic choices/costs, adjusted rolls, Curing, twelve-chart saves, actual forms, reload and Undo.');
