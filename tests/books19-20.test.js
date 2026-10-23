/* Grand Crown replacement arithmetic and a single, reversible Kai-ray round. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C=require('../campaign'),R=require('../rules');
const opts={cs:25,ep:39,gold:24},clone=s=>JSON.parse(JSON.stringify(s));
for(const book of [19,20]){
 const fresh=C.startBook(book,null,opts);assert.equal(C.limit(fresh),4);assert.equal(fresh.grandUnarmed,false);assert.equal(fresh.grandAdvances,0);assert.equal(fresh.grandFlaming,false);
 assert.equal(fresh.special[0].name,book===19?'Map of Sommerlund and the Wildlands':'Map of the Planes of Existence');
 assert.ok(C.books[book].supplies.includes('Broadsword'));assert.equal(C.books[book].supplies.includes('Quarterstaff'),book===20);
 for(const item of C.books[book].supplies)C.validateCharacter(C.startBook(book,null,{...opts,items:[item]}));
 const supplies=C.startBook(book,null,{...opts,items:['Sword','Quiver','2 Meals','Rope']});assert.equal(supplies.meals,2);assert.equal(supplies.arrows,6);assert.deepEqual(supplies.backpack,['Rope']);
 let source=C.startBook(book-1,null,opts);source=C.setGrandTraining(source,{grandUnarmed:'crown',grandAdvances:6,grandFlaming:true});source.grandMaster=['Grand Weaponmastery','Kai-surge'];source.grandMasteries=['Sword'];source.psychicMode='kaiBlast';source.ep-=9;source.notes='Record use';source.backpack=Array(8).fill('Supply');source.meals=2;
 const before=clone(source),next=C.startBook(book,source,{completed:true,gold:25});assert.deepEqual(source,before);assert.equal(next.ep,source.ep);assert.equal(C.limit(next),5);
 for(const key of ['grandUnarmed','grandAdvances','grandFlaming','grandMaster','grandMasteries','psychicMode','notes','backpack'])assert.deepEqual(next[key],source[key]);
 assert.throws(()=>C.startBook(book,source,{gold:24}),/Confirm/);assert.throws(()=>C.startBook(book,source,{completed:true,gold:24,items:['2 Meals']}),/backpack is full/);
 assert.deepEqual(C.validateCharacter(clone(next)),next);assert.throws(()=>C.validateCharacter({...next,section:351}));
 const path=`all-books-simple/en/xhtml-simple/lw/${C.books[book].slug}.htm`;
 if(fs.existsSync(path)){
  const h=fs.readFileSync(path,'utf8'),t=h.split('<a id="crtable">')[1].split('</tbody>')[0];let n=0;assert.equal(Math.max(...[...h.matchAll(/id="sect(\d+)"/g)].map(m=>+m[1])),350);
  for(const m of t.matchAll(/<tr>([\s\S]*?)<\/tr>/g)){const cells=[...m[1].matchAll(/<td>([\dk]+\/[\dk]+)<\/td>/g)].map(x=>x[1]);if(cells.length){assert.deepEqual(cells,R.table[+m[1].match(/<th scope="row">(\d)<\/th>/)[1]]);n++;}}assert.equal(n,10);console.log(`Local Book ${book}: all 130 combat-table cells and section bounds match.`);
 }else console.log(`Optional local Book ${book} comparison skipped (no download).`);
}
let s=C.startBook(19,null,opts);s.magnakai=['Weaponmastery'];s.weaponmasteryLevel='scion';
for(const [choice,value] of [[false,-1],[true,0],['crown',3]]){s=C.setGrandTraining(s,{grandUnarmed:choice});assert.equal(R.combatSkill(s).unarmed,value);assert.equal(C.validateCharacter(clone(s)).grandUnarmed,choice);}
s.grandMaster=R.grandMaster.map(d=>d[0]);s.grandUnarmed=false;assert.equal(R.combatSkill(s).unarmed,-1,'No inferred Grand Crown bonus');
s.grandUnarmed='crown';s.weapons=['Bow'];s.equipped=0;assert.equal(R.combatSkill(s).unarmed,3,'Bow remains unarmed in melee');s.weapons=['Sword'];s.grandMasteries=['Sword'];assert.equal(R.combatSkill(s).unarmed,0);assert.equal(R.combatSkill(s).mastery,5);
for(const value of [3,'trained','false',null,{}])assert.throws(()=>C.setGrandTraining(s,{grandUnarmed:value}));
function fight(mode='kaiSurge'){
 const s=C.startBook(20,null,{...opts,items:['Sword']});s.grandMaster=['Grand Weaponmastery'];s.grandMasteries=['Sword'];s.grandFlaming=true;s.psychicMode=mode;
 s.combat={name:'Test',cs:30,maxEP:100,ep:100,modifier:0,immune:false,undead:false,mindblastDamage:0,status:'active',rounds:[]};return s;
}
for(const mode of ['kaiSurge','archSurge','surge','kaiBlast','none']){
 s=fight(mode);const round=R.resolveRound(s,8,false,null,true);assert.equal(round.ratio,0);assert.equal(round.heroLoss,4);assert.equal(round.enemyLoss,26);assert.equal(round.flameLoss,1);assert.equal(round.rayLoss,15);assert.equal(round.rayCost,4);assert.equal(round.surgeLoss,undefined);assert.equal(round.blastRolls,undefined);assert.equal(s.psychicMode,mode);
 assert.deepEqual(C.validateCharacter(clone(s)),s);
}
s=fight();s.combat.immune=true;let round=R.resolveRound(s,8,false,null,true);assert.equal(round.rayLoss,0);assert.equal(round.rayCost,4);assert.equal(round.enemyLoss,11);
s=fight();s.combat.ep=12;round=R.resolveRound(s,8,false,null,true);assert.equal(round.enemyLoss,12);assert.equal(round.rayLoss,1);assert.equal(round.rayCost,4);
s=fight();s.ep=2;round=R.resolveRound(s,8,false,null,true);assert.equal(round.rayCost,2);assert.equal(round.heroLoss,2);assert.equal(s.combat.status,'defeat');assert.deepEqual(C.validateCharacter(clone(s)),s);
s=fight();s.combat.mindblastDamage=3;s.ep=5;round=R.resolveRound(s,8,false,null,true);assert.equal(round.mindblastLoss,3);assert.equal(round.rayCost,2);assert.equal(round.heroLoss,5);
s=fight();const before=clone(s);assert.throws(()=>R.resolveRound(s,8,true,null,true));assert.deepEqual(s,before);
s=fight();R.resolveRound(s,8,false,null,true);R.resolveRound(s,8,false,null,true);assert.equal(s.combat.rounds.length,2,'Once-per-combat eligibility remains the player’s decision');
for(const fields of [{rayLoss:16},{rayCost:5},{rayCost:4,heroLoss:3},{surgeLoss:1},{blastRolls:[0,0],blastCost:0,blastLoss:0}]){const invalid=clone(s);Object.assign(invalid.combat.rounds[0],fields);assert.throws(()=>C.validateCharacter(invalid));}
assert.match(R.trainingGuidance({book:19},'Grand Weaponmastery'),/Grand Crown.*\+3/);assert.match(R.trainingGuidance({book:20},'Kai-surge'),/Sun Prince.*Kai-ray/);
assert.doesNotMatch(R.trainingGuidance({book:19},'Kai-surge'),/Sun Prince/);
const books={1:C.validateCharacter(C.newCharacter())};for(let b=2;b<=20;b++)books[b]=C.startBook(b,null,b>=13?opts:{cs:16,ep:25,gold:12});books[20]=s;
const all={version:4,activeBook:20,books};assert.deepEqual(C.validateSave(clone(all)),all);assert.throws(()=>C.validateSave({...all,books:{...books,21:books[20]}}));assert.throws(()=>C.startBook(21,null,opts),/Unsupported/);

// Exercise the real forms with a deterministic combat number and campaign Undo.
const elements=new Map(),listeners=new Map(),storage=new Map([['lone-wolf-action-chart-v4',JSON.stringify({version:4,activeBook:20,books:{20:fight()}})]]);
function element(key){if(!elements.has(key))elements.set(key,{dataset:{},classList:{add(){},remove(){}},addEventListener(){},focus(){},close(){},showModal(){},scrollTop:0});return elements.get(key);}
const context=vm.createContext({window:{LWRules:R,LWCampaign:C,LWSaves:require('../saves.js'),addEventListener(){}},document:{querySelector:element,addEventListener(t,fn){listeners.set(t,fn);}},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},crypto:{getRandomValues(a){a[0]=5;return a;}},matchMedia:()=>({matches:false}),setTimeout:()=>0,clearTimeout(){},console});
context.FormData=class{constructor(form){this.values=form.values;}get(k){const v=this.values[k];return Array.isArray(v)?v[0]??null:v??null;}getAll(k){const v=this.values[k];return v===undefined?[]:Array.isArray(v)?v:[v];}has(k){return Object.hasOwn(this.values,k);}};
const run=code=>vm.runInContext(code,context),submit=(id,values)=>listeners.get('submit')({target:{id,values,dataset:{}},preventDefault(){}});run(fs.readFileSync(require.resolve('../app.js'),'utf8'));
run('kaiRayDialog()');assert.match(element('#dialog').innerHTML,/once per combat/);
submit('kai-ray-form',{roll:'8'});assert.equal(run('state.combat.rounds[0].rayLoss'),15);assert.equal(run('state.combat.rounds[0].rayCost'),4);assert.equal(run('state.psychicMode'),'kaiSurge');
run('campaign=load();state=campaign.books[20]');assert.equal(run('state.combat.rounds[0].rayLoss'),15);run('undo()');assert.equal(run('state.combat.rounds.length'),0);assert.equal(run('state.ep'),39);
submit('grand-master-form',{grandMasteries:'Sword',grandAdvances:'1',grandUnarmed:'crown',grandFlaming:'on',mastery:'Axe',weaponmasteryLevel:'standard'});assert.equal(run('state.grandUnarmed'),'crown');assert.equal(run('state.grandAdvances'),1);
run('campaign=load();state=campaign.books[20]');assert.equal(run('state.grandUnarmed'),'crown');run('undo()');assert.equal(run('state.grandUnarmed'),false);
console.log('Passed: Books 19–20 setup, replacement unarmed choices, Kai-ray costs/non-stacking/caps, retained attack, real forms/reload/Undo and twenty-chart saves.');
