/* Sun Lord choices must never be inferred, stacked, or lost from combat history. */
const assert=require('node:assert/strict'),fs=require('node:fs');
const C=require('../campaign'),R=require('../rules');
const opts={cs:25,ep:39,gold:24},clone=s=>JSON.parse(JSON.stringify(s));
function fight(){const s=C.startBook(16,null,{...opts,items:['Sword']});s.grandMaster=['Grand Weaponmastery'];s.grandMasteries=['Sword'];s.psychicMode='kaiBlast';s.grandFlaming=true;s.combat={name:'Test',cs:30,maxEP:100,ep:100,modifier:0,immune:false,undead:false,mindblastDamage:0,status:'active',rounds:[]};return s;}
let s=C.startBook(16,null,{...opts,items:['Sword','Quiver','2 Meals','Potion of Laumspur']});
assert.equal(s.meals,2);assert.equal(s.arrows,6);assert.equal(s.backpack[0],'Potion of Laumspur');
assert.equal(s.special[0].name,'Map of the Maakengorge');assert.equal(s.grandFlaming,false);assert.equal(s.psychicMode,'legacy');assert.equal(C.limit(s),4);
for(const item of C.books[16].supplies)C.validateCharacter(C.startBook(16,null,{...opts,items:[item]}));
assert.throws(()=>C.startBook(16,null,{...opts,items:['Sword','Bow','Quiver','2 Meals','Rope']}),/different/);
const source=C.startBook(15,null,opts);source.grandMaster=R.grandMaster.map(d=>d[0]);source.ep-=5;
let next=C.startBook(16,source,{completed:true,gold:25});assert.equal(next.ep,source.ep);assert.equal(next.grandFlaming,false);assert.equal(next.psychicMode,'legacy');assert.equal(next.grandAdvances,0);
assert.equal(C.limit(next),5);assert.equal(source.book,15);
for(const [numbers,damage] of [[[0,0],2],[[0,9],10],[[9,9],18]])assert.equal(R.kaiBlastDamage(numbers),damage);
for(const numbers of [null,[],[1],[1,2,3],[-1,2],[1,10],[1,'2']])assert.throws(()=>R.kaiBlastDamage(numbers));
s=fight();const before=clone(s);let round=R.resolveRound(s,8,false,[0,0]);
assert.equal(round.ratio,0);assert.equal(round.heroLoss,4);assert.equal(round.enemyLoss,13);assert.equal(round.blastLoss,2);assert.equal(round.blastCost,4);assert.equal(round.flameLoss,1);assert.equal(round.surgeLoss,undefined);
assert.deepEqual(C.validateCharacter(clone(s)),s);assert.deepEqual(round.blastRolls,[0,0]);
s=fight();s.combat.immune=true;round=R.resolveRound(s,8,false,[9,9]);assert.equal(round.enemyLoss,11);assert.equal(round.blastLoss,0);assert.equal(round.blastCost,4);
s=fight();round=R.resolveRound(s,8,true,[9,9]);assert.equal(round.enemyLoss,0);assert.equal(round.flameLoss,undefined);assert.equal(round.blastLoss,0);assert.equal(round.blastCost,4);
s=fight();s.combat.ep=11;round=R.resolveRound(s,8,false,[9,9]);assert.equal(round.enemyLoss,11);assert.equal(round.flameLoss,1);assert.equal(round.blastLoss,0);
s=fight();s.combat.cs=60;round=R.resolveRound(s,2,false,[9,9]);assert.equal(round.enemyLoss,18);assert.equal(round.flameLoss,undefined);assert.equal(round.blastLoss,18);
s=fight();s.ep=2;round=R.resolveRound(s,8,false,[9,9]);assert.equal(round.heroLoss,2);assert.equal(round.blastCost,2);assert.equal(s.ep,0);assert.equal(s.combat.status,'defeat');assert.deepEqual(C.validateCharacter(clone(s)),s);
s=fight();s.combat.mindblastDamage=3;s.ep=5;round=R.resolveRound(s,8,false,[0,0]);assert.equal(round.mindblastLoss,3);assert.equal(round.blastCost,2);assert.equal(round.heroLoss,5);
s=fight();s.psychicMode='none';round=R.resolveRound(s,8);assert.equal(round.enemyLoss,11);assert.equal(round.flameLoss,1);assert.equal(round.blastRolls,undefined);
s=fight();const unchanged=clone(s);assert.throws(()=>R.resolveRound(s,8,false,[10,0]));assert.deepEqual(s,unchanged);
s=fight();s.psychicMode='none';s.grandFlaming=false;s.grandMaster=R.grandMaster.map(d=>d[0]);round=R.resolveRound(s,8);assert.equal(round.enemyLoss,10);assert.equal(round.flameLoss,undefined);
s=fight();delete s.grandFlaming;assert.equal(C.validateCharacter(s).grandFlaming,false);
assert.throws(()=>C.setGrandTraining(fight(),{grandFlaming:1}));
s=fight();R.resolveRound(s,8,false,[0,9]);
for(const fields of [{flameLoss:2},{blastRolls:[10,0]},{blastCost:5},{blastLoss:19},{blastCost:4,heroLoss:3}]){const invalid=clone(s);Object.assign(invalid.combat.rounds[0],fields);assert.throws(()=>C.validateCharacter(invalid));}
next=C.startBook(16,C.startBook(15,null,opts),{completed:true,gold:24});next.grandFlaming=true;next.psychicMode='kaiBlast';
assert.deepEqual(C.validateSave({version:4,activeBook:16,books:{16:next}}).books[16],next);
assert.match(R.trainingGuidance(next,'Grand Weaponmastery'),/Sun Lord.*Flaming/);
assert.match(R.trainingGuidance(next,'Kai-surge'),/Kai-blast/);
const path='all-books-simple/en/xhtml-simple/lw/16tlov.htm';
if(fs.existsSync(path)){
 const h=fs.readFileSync(path,'utf8'),t=h.split('<a id="crtable">')[1].split('</tbody>')[0];let count=0;
 assert.equal(Math.max(...[...h.matchAll(/id="sect(\d+)"/g)].map(m=>+m[1])),350);
 for(const m of t.matchAll(/<tr>([\s\S]*?)<\/tr>/g)){const cells=[...m[1].matchAll(/<td>([\dk]+\/[\dk]+)<\/td>/g)].map(x=>x[1]);if(cells.length){assert.deepEqual(cells,R.table[+m[1].match(/<th scope="row">(\d)<\/th>/)[1]]);count++;}}
 assert.equal(count,10);console.log('Local Book 16: all 130 combat-table cells and section bounds match.');
}else console.log('Optional local Book 16 comparison skipped (no download).');
console.log('Passed: Book 16 supplies, explicit flaming weapon/Kai-blast, costs, immunity/evasion/caps/death, legacy defaults and saved round breakdowns.');
