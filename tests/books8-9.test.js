/* Explicit mastery improvements, independent Books 8–9, and source tables. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const C=require('../campaign.js'),R=require('../rules.js');
const clone=s=>JSON.parse(JSON.stringify(s));
const options={cs:16,ep:25,gold:12,items:[]};
for(const book of [8,9]) {
  let s=C.startBook(book,null,{...options,items:['Bow','Quiver','3 Meals','Lantern','3 Fireseeds']});
  assert.equal(s.weaponmasteryLevel,'standard');assert.equal(C.limit(s),3);assert.equal(s.arrows,6);
  assert.equal(s.meals,3);assert.deepEqual(s.backpack,['Lantern']);assert.equal(s.special.filter(i=>i.name==='Fireseed').length,3);
  assert.ok(s.special.some(i=>i.name===C.books[book].map));
  for(const item of C.books[book].supplies)C.validateCharacter(C.startBook(book,null,{...options,items:[item]}));
  assert.throws(()=>C.startBook(book,null,{...options,items:['Sword','Mace','Dagger']}),/two weapons/);
  assert.throws(()=>C.startBook(book,null,{...options,items:['Lantern','Lantern']}),/different/);
  assert.throws(()=>C.validateCharacter({...s,section:351}));
  s.magnakai=R.magnakai.map(d=>d[0]);s.weaponmasteryLevel='standard';
  assert.equal(R.combatSkill(s).unarmed,-4,'All skills do not enable an improvement');
  for(const [level,penalty,bonus] of [['standard',-4,3],['tutelary',-2,3],['scion',-1,4]]) {
    s.weaponmasteryLevel=level;s.equipped=-1;assert.equal(R.combatSkill(s).unarmed,penalty);
    s.equipped=0;assert.equal(R.combatSkill(s).unarmed,penalty,'Bow remains unarmed in melee');
    s.weapons=['Sword'];s.equipped=0;s.masteries=['Sword'];s.disciplines=['Weaponskill'];s.mastery='Sword';
    assert.equal(R.combatSkill(s).mastery,bonus,'Kai mastery never stacks');
    s.special.push({name:'Sommerswerd',effect:'Sword',ep:0,cs:0});s.equipped=-2;
    assert.equal(R.combatSkill(s).mastery,bonus);s.special.pop();s.weapons=['Bow'];
  }
  s.equipped=-1;s.magnakai=[];assert.equal(R.combatSkill(s).unarmed,-4,'Selection needs Weaponmastery');
  assert.throws(()=>C.validateCharacter({...s,weaponmasteryLevel:'automatic'}),/level/);
  const old=clone(s);delete old.weaponmasteryLevel;
  assert.equal(C.validateCharacter(old).weaponmasteryLevel,'standard');
  assert.match(R.trainingGuidance(s,'Weaponmastery'),/Tutelary/);
  if(book===9)assert.match(R.trainingGuidance(s,'Huntmastery'),/Principalin/);
  const source=C.startBook(book-1,null,{...options,items:['Sword','Quiver']});
  source.magnakai=['Weaponmastery','Huntmastery'];source.masteries=['Sword'];source.weaponmasteryLevel='tutelary';
  source.arrows=2;source.notes='Carry independently';source.storedSpecial=[{name:'Keepsake',effect:'Stored',ep:0,cs:0}];
  const wounded=C.setLoreCircle(source,'fire',true);wounded.ep-=5;
  const before=clone(wounded),next=C.startBook(book,wounded,{gold:10,completed:true,items:['Quiver']});
  assert.deepEqual(wounded,before);assert.equal(next.ep,wounded.ep);assert.equal(next.weaponmasteryLevel,'tutelary');assert.equal(next.arrows,8);
  assert.equal(C.limit(next),4);next.masteries.push('Axe');assert.deepEqual(wounded.masteries,['Sword']);
  assert.throws(()=>C.startBook(book,wounded,{gold:10,items:[]}),/Confirm/);
  assert.equal(C.startBook(book,{...wounded,ep:0},{gold:10,completed:true,items:[]}).ep,0);
  assert.throws(()=>C.startBook(book,{...wounded,meals:8},{gold:10,completed:true,items:['Lantern']}),/full/);
  const path=`all-books-simple/en/xhtml-simple/lw/${C.books[book].slug}.htm`;
  if(fs.existsSync(path)) {
    const table=fs.readFileSync(path,'utf8').split('<a id="crtable">')[1].split('</tbody>')[0];
    const rows=[...table.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(m=>({roll:Number(m[1].match(/<th scope="row">(\d)<\/th>/)?.[1]),cells:[...m[1].matchAll(/<td>([\dk]+\/[\dk]+)<\/td>/g)].map(x=>x[1])})).filter(row=>row.cells.length);
    assert.equal(rows.length,10);for(const row of rows)assert.deepEqual(row.cells,R.table[row.roll]);
    console.log(`Local Book ${book}: all 130 combat-table cells match.`);
  } else console.log(`Optional Book ${book} comparison skipped (download absent).`);
}
const books={};for(let book=1;book<=9;book++)books[book]=book===1?C.validateCharacter(C.newCharacter()):C.startBook(book,null,options);
assert.deepEqual(C.validateSave(clone({version:3,activeBook:9,books})),{version:3,activeBook:9,books});
// Actual Mastery form, save/load, older import, and Undo; no DOM-only replica.
const elements=new Map(),listeners=new Map();
const initial=JSON.stringify({version:3,activeBook:8,books:{8:C.startBook(8,null,{...options,items:['Sword']})}});
const storage=new Map([['lone-wolf-action-chart-v3',initial]]);
function element(key){if(!elements.has(key))elements.set(key,{dataset:{},classList:{add(){},remove(){}},addEventListener(){},focus(){},close(){},showModal(){},scrollTop:0});return elements.get(key);}
const context=vm.createContext({window:{LWRules:R,LWCampaign:C,addEventListener(){}},document:{querySelector:element,addEventListener(type,fn){listeners.set(type,fn);}},localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},crypto:{getRandomValues(a){a[0]=5;return a;}},matchMedia:()=>({matches:false}),setTimeout:()=>0,clearTimeout(){},console});
context.FormData=class{constructor(form){this.values=form.values;}get(key){const v=this.values[key];return Array.isArray(v)?v[0]??null:v??null;}getAll(key){const v=this.values[key];return v===undefined?[]:Array.isArray(v)?v:[v];}has(key){return Object.hasOwn(this.values,key);}};
const run=code=>vm.runInContext(code,context);
run(fs.readFileSync(require.resolve('../app.js'),'utf8'));
run("state.magnakai=['Weaponmastery'];state.equipped=-1;persist();masteryDialog();");
assert.match(element('#dialog').innerHTML,/name="weaponmasteryLevel"/);
listeners.get('submit')({target:{id:'magnakai-form',values:{masteries:['Sword'],mastery:'Sword',weaponmasteryLevel:'tutelary'}},preventDefault(){}});
assert.equal(run('R.combatSkill(state).unarmed'),-2);
run('campaign=load();state=campaign.books[8];');assert.equal(run('state.weaponmasteryLevel'),'tutelary');
run('undo();');assert.equal(run('state.weaponmasteryLevel'),'standard');
console.log('Passed: Books 8–9 setup, manual mastery levels, independent carryover, wounds, nine-chart saves, old defaults, form, reload and Undo.');
