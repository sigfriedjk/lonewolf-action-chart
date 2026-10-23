/* Book 7 continuation, supplies, persistence, and actual form handlers. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const R=require('../rules.js');
const C=require('../campaign.js');
const S=require('../saves.js');
const readSaved=require('./saved-record.js');
const clone=value=>JSON.parse(JSON.stringify(value));
const options={cs:16,ep:24,gold:12,mastery:'Sword',items:[]};
const fresh=()=>C.startBook(7,null,options);
let s=fresh();
assert.equal(s.book,7);assert.equal(s.version,2);assert.equal(C.limit(s),3);
assert.deepEqual(s.completedBooks,[]);assert.deepEqual(s.disciplines,[]);assert.deepEqual(s.magnakai,[]);
s=C.startBook(7,null,{...options,items:['Bow','Quiver','3 Meals','Lantern','3 Fireseeds']});
assert.deepEqual(s.weapons,['Bow']);assert.equal(s.arrows,6);assert.equal(s.meals,3);
assert.deepEqual(s.backpack,['Lantern']);assert.equal(R.combatSkill(s).unarmed,-4);
assert.equal(s.special.filter(item=>item.name==='Fireseed').length,3);
assert.ok(s.special.some(item=>item.name==='Map of Dessi'));
assert.equal(R.maxEndurance(s),24);assert.equal(R.combatSkill(s).equipment,0);
for(const item of C.books[7].supplies)C.validateCharacter(C.startBook(7,null,{...options,items:[item]}));
assert.throws(()=>C.startBook(7,null,{...options,items:['Sword','Mace','Dagger']}),/two weapons/);
assert.throws(()=>C.startBook(7,null,{...options,items:['Lantern','Lantern']}),/different/);
assert.throws(()=>C.startBook(7,null,{...options,items:C.books[7].supplies.slice(0,6)}),/different/);
let source=C.startBook(6,null,{...options,items:['Sword','Quiver','Rope']});
source.magnakai=['Weaponmastery','Huntmastery','Psi-screen'];source.masteries=['Sword','Bow','Axe'];
source.disciplines=['Weaponskill','Mindblast'];source.mastery='Sword';source.arrows=2;
source=C.setLoreCircle(source,'fire',true);source.ep=18;source.section=350;source.lastRoll=7;
source.storedSpecial=[{name:'Keepsake',effect:'Keep stored',ep:0,cs:0}];source.notes='Keep this independent';
source.combat={name:'Unfinished',cs:18,maxEP:30,ep:20,modifier:0,immune:false,undead:false,mindblastDamage:2,status:'active',rounds:[]};
const before=clone(source);
s=C.startBook(7,source,{gold:10,completed:true,items:['Quiver','3 Fireseeds','Lantern']});
assert.deepEqual(source,before);assert.equal(s.ep,18);assert.equal(R.maxEndurance(s),26);
for(const key of ['magnakai','masteries','loreCircles','disciplines','mastery','storedSpecial','notes'])assert.deepEqual(s[key],source[key]);
assert.equal(s.arrows,8);assert.equal(s.special.filter(item=>item.name==='Quiver').length,1);
assert.deepEqual(s.completedBooks,[6]);assert.equal(C.limit(s),4);assert.equal(s.gold,source.gold+10);
assert.equal(s.combat,null);assert.equal(s.lastRoll,null);assert.equal(s.section,1);
assert.equal(s.magnakai.length,3,'A new skill is chosen by the player, not awarded on copying');
s.masteries.push('Mace');s.magnakai.push('Curing');s.storedSpecial[0].effect='Changed';
assert.deepEqual(source,before,'Nested records are independent');
assert.throws(()=>C.startBook(7,source,{gold:10,items:[]}),/Confirm/);
assert.equal(C.startBook(7,{...source,ep:0,combat:null},{gold:10,completed:true,items:[]}).ep,0);
assert.throws(()=>C.startBook(7,{...source,meals:8,backpack:[]},{gold:10,completed:true,items:['Lantern']}),/backpack is full/);
const fullKai=C.startBook(7,source,{gold:10,completed:true,fullKai:true,items:[]});
assert.deepEqual(fullKai.completedBooks,[1,2,3,4,5,6]);assert.equal(fullKai.disciplines.length,10);
assert.equal(C.limit(fullKai),4,'Kai completions do not grant Magnakai skills');
const skipped=C.startBook(7,{...C.newCharacter(),book:5},{gold:10,completed:true,items:[]});
assert.equal(C.limit(skipped),3);assert.deepEqual(skipped.completedBooks,[5]);
assert.deepEqual(skipped.magnakai,[]);assert.equal(skipped.arrows,0);
assert.match(R.primateGuidance(s,'Curing'),/Delay poison/);
assert.equal(R.primateGuidance(source,'Curing'),'');
assert.equal(R.combatSkill(s).mastery,3,'Primate does not increase Weaponmastery to +4');
s.magnakai=R.magnakai.map(d=>d[0]);s.masteries=R.weaponTypes(s);s.section=350;
assert.equal(C.validateCharacter(s).magnakai.length,10,'Recommendations never lock selections');
assert.equal(C.validateSave(s).version,3);
const allBooks={};for(let book=1;book<=5;book++)allBooks[book]={...C.newCharacter(),book};
allBooks[6]=source;allBooks[7]=s;
const saved=C.validateSave({version:3,activeBook:7,books:allBooks});
assert.deepEqual(C.validateSave(clone(saved)),saved);
assert.throws(()=>C.validateSave({version:2,activeBook:7,books:{7:s}}),/requires? version 3/);
for(const invalid of [{...s,section:351},{...s,version:1},{...s,arrows:10000},{...s,magnakai:['fake']},{...s,masteries:['Bow','Bow']},{...s,book:21}])assert.throws(()=>C.validateCharacter(invalid));

const local='all-books-simple/en/xhtml-simple/lw/07cd.htm';
if(fs.existsSync(local)) {
  const table=fs.readFileSync(local,'utf8').split('<a id="crtable">')[1].split('</tbody>')[0];
  const rows=[...table.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(m=>({roll:Number(m[1].match(/<th scope="row">(\d)<\/th>/)?.[1]),cells:[...m[1].matchAll(/<td>([\dk]+\/[\dk]+)<\/td>/g)].map(x=>x[1])})).filter(row=>row.cells.length);
  assert.equal(rows.length,10);for(const row of rows)assert.deepEqual(row.cells,R.table[row.roll]);
  console.log('Optional local Book 7 comparison: all 130 combat-table cells match.');
} else console.log('Optional local Book 7 comparison skipped (book download absent).');

// Run the UI's form handlers against old storage, without a Book 6 chart.
const original=JSON.stringify(C.validateSave({version:2,activeBook:1,books:{1:C.newCharacter()}}));
const storage=new Map([['lone-wolf-action-chart-v2',original]]),elements=new Map(),listeners=new Map(),elementListeners=new Map();let exported;
function element(selector){
  if(!elements.has(selector))elements.set(selector,{dataset:{},classList:{add(){},remove(){}},addEventListener(type,fn){elementListeners.set(selector+':'+type,fn);},focus(){},close(){this.open=false;},showModal(){this.open=true;},scrollTop:0});
  return elements.get(selector);
}
const context=vm.createContext({window:{LWRules:R,LWCampaign:C,LWSaves:S,addEventListener(){}},document:{querySelector:element,addEventListener(type,fn){listeners.set(type,fn);},createElement(){return {click(){}};}},localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},crypto:{getRandomValues(values){values[0]=5;return values;}},matchMedia:()=>({matches:false}),setTimeout:()=>0,clearTimeout(){},Blob:class{constructor(parts){exported=parts.join('');}},URL:{createObjectURL:()=>'',revokeObjectURL(){}},console});
context.FormData=class{constructor(form){this.values=form.values;}get(key){const value=this.values[key];return Array.isArray(value)?value[0]??null:value??null;}getAll(key){const value=this.values[key];return value===undefined?[]:Array.isArray(value)?value:[value];}has(key){return Object.hasOwn(this.values,key);}};
const run=code=>vm.runInContext(code,context);
run(fs.readFileSync(require.resolve('../app.js'),'utf8'));
function click(action,extra={}){const button={dataset:{action,...extra},disabled:false};button.closest=()=>button;listeners.get('click')({target:button,detail:0});}
function submit(id,values,dataset={}){listeners.get('submit')({target:{id,values,dataset},preventDefault(){}});}
click('fresh-book',{book:'7'});
assert.match(element('#dialog').innerHTML,/Start Book 7/);assert.match(element('#dialog').innerHTML,/self-lighting Lantern/);
assert.equal((element('#dialog').innerHTML.match(/name="item\d"/g)||[]).length,5);
submit('book2-form',{cs:'16',ep:'24',gold:'12',item1:'Bow',item2:'Quiver',item3:'3 Meals',item4:'Lantern',item5:'3 Fireseeds'},{book:'7',continuing:'false'});
assert.equal(run('state.book'),7);assert.equal(run('state.arrows'),6);assert.equal(run('state.meals'),3);
assert.equal(readSaved(storage).version,3);
assert.equal(storage.get('lone-wolf-action-chart-v2'),original);
click('discipline',{name:'Curing'});assert.match(element('#dialog').innerHTML,/Primate reference/);
click('toggle-discipline',{name:'Curing'});click('mastery-dialog');assert.match(element('#dialog').innerHTML,/learning it later starts with three/);
click('rules');assert.match(element('#dialog').innerHTML,/Book 7 · quick rules/);
assert.match(element('#dialog').innerHTML,/07cd\/title.htm/);assert.doesNotMatch(element('#dialog').innerHTML,/archery tournament|undefined/);
const seedIndex=run('state.special.findIndex(item=>item.name==="Fireseed")');
click('remove-item',{type:'special',index:String(seedIndex)});
assert.equal(run('state.special.filter(item=>item.name==="Fireseed").length'),2);
click('undo');assert.equal(run('state.special.filter(item=>item.name==="Fireseed").length'),3);
run(`change(()=>{keepCheckpoint();state=C.validateCharacter(${JSON.stringify(source)});});`);
click('continue-book',{book:'7'});assert.match(element('#dialog').innerHTML,/From Book 6/);
submit('book2-form',{checkpoint:'on',completed:'on',gold:'10',keep:['0'],item1:'Lantern'},{book:'7',source:'6',continuing:'true'});
assert.equal(run('state.arrows'),2);assert.equal(run('state.magnakai.length'),3);assert.equal(run('state.ep'),18);
click('view',{view:'kai'});assert.match(element('#main').innerHTML,/Magnakai \(3\/4\)/);
click('toggle-discipline',{name:'Curing'});assert.equal(run('state.magnakai.length'),4);
submit('magnakai-form',{masteries:['Sword','Bow','Axe','Mace'],inherited:['Weaponskill','Mindblast'],mastery:'Sword'});
const valid=run('JSON.stringify(campaign)');
run('campaign=load();state=campaign.books[campaign.activeBook];render();');assert.equal(run('state.masteries.length'),4);
assert.equal(run('state.loreCircles[0]'),'fire');assert.equal(run('state.arrows'),2);
click('export');assert.deepEqual(C.validateCharacter(JSON.parse(exported)),C.validateSave(JSON.parse(valid)).books[JSON.parse(valid).activeBook]);
click('switch-book',{book:'6'});elementListeners.get('#confirm-import:click')();assert.equal(run('state.magnakai.length'),3);click('undo');assert.equal(run('state.book'),7);
async function importFile(value){await elementListeners.get('#import-file:change')({target:{files:[{size:1000,text:async()=>value}],value:'file'}});}
async function finish(){
  const beforeInvalid=run('JSON.stringify(campaign)');await importFile(JSON.stringify({...JSON.parse(valid),version:2}));
  assert.equal(run('JSON.stringify(campaign)'),beforeInvalid,'Invalid import preserves the campaign');
  submit('resource-form',{amount:'13'},{key:'arrows'});await importFile(valid);elementListeners.get('#confirm-import:click')();
  assert.equal(run('state.arrows'),2);click('undo');assert.equal(run('state.arrows'),13);
  await importFile(original);elementListeners.get('#confirm-import:click')();
  run('campaign=load();state=campaign.books[campaign.activeBook];');assert.equal(run('state.book'),1);
  assert.equal(readSaved(storage).activeBook,1);
  console.log('Passed: Book 7 supplies, independent Magnakai continuation, manual progression, Primate guidance, all-seven-chart saves, actual setup forms, old-storage upgrade, reload, export/import, and Undo.');
}
finish().catch(error=>{console.error(error);process.exitCode=1;});
