/* Each book has source-checked entry, progression guidance, and independent saves. */
const assert=require('node:assert/strict'),fs=require('node:fs');
const C=require('../campaign'),R=require('../rules');
const opts={cs:31,ep:36,gold:24,items:[]},clone=s=>JSON.parse(JSON.stringify(s));
for(const book of [14,15]){
  const fresh=C.startBook(book,null,opts);
  assert.equal(C.limit(fresh),4);assert.equal(fresh.grandAdvances,0);assert.equal(fresh.grandUnarmed,false);
  assert.deepEqual(fresh.grandMaster,[]);assert.deepEqual(fresh.magnakai,[]);assert.equal(fresh.gold,24);
  assert.equal(fresh.special[0].name,book===14?'Map of the Darklands':'Map of the Western Tentarias');
  for(const item of C.books[book].supplies)C.validateCharacter(C.startBook(book,null,{...opts,items:[item]}));
  const supplies=C.startBook(book,null,{...opts,items:['Sword','Quiver','4 Meals','Rope','Potion of Laumspur']});
  assert.equal(supplies.meals,4);assert.equal(supplies.backpack.length,2);assert.equal(supplies.arrows,6);
  let source=C.startBook(book-1,null,{...opts,items:['Sword','Quiver']});
  source.grandMaster=['Grand Weaponmastery','Kai-surge','Deliverance','Kai-screen'];source.grandMasteries=['Sword','Bow'];
  source.magnakai=['Weaponmastery','Huntmastery'];source.masteries=['Sword'];source.weaponmasteryLevel='scion';source.psychicMode='kaiSurge';source.loreCircles=['fire'];
  source=C.setGrandTraining(source,{grandAdvances:2,grandUnarmed:true});source.ep-=7;source.arrows=3;source.notes='Keep';
  source.lastAdjustedRoll=R.adjustedRoll(8,1,false,false,true);source.storedSpecial=[{name:'Silver Helm',effect:'Stored',ep:2,cs:0}];
  source.backpack=Array(8).fill('Supply');source.meals=2;
  const before=clone(source),next=C.startBook(book,source,{completed:true,gold:25});
  assert.deepEqual(source,before);assert.equal(next.ep,source.ep);assert.equal(next.gold,49);assert.equal(C.limit(next),5);
  for(const field of ['grandMaster','grandMasteries','grandAdvances','grandUnarmed','magnakai','masteries','weaponmasteryLevel','psychicMode','loreCircles','arrows','notes','lastAdjustedRoll','storedSpecial','backpack'])assert.deepEqual(next[field],source[field]);
  assert.equal(next.grandMaster.length,4,'No automatic new skill');assert.equal(next.grandAdvances,2,'No inferred advance');
  assert.deepEqual(C.validateCharacter(clone(next)),next);next.grandMaster.push('Animal Mastery');assert.deepEqual(source,before);
  assert.throws(()=>C.startBook(book,source,{gold:24}),/Confirm/);
  assert.throws(()=>C.startBook(book,source,{completed:true,gold:24,items:['Rope']}),/backpack is full/);
  const dead=clone(source);dead.ep=0;assert.equal(C.startBook(book,dead,{completed:true,gold:24}).ep,0);
  assert.throws(()=>C.validateCharacter({...next,section:351}));
  const skipped=C.startBook(book,C.startBook(12,null,{cs:16,ep:25,gold:12}),{completed:true,gold:24});assert.equal(C.limit(skipped),4);
  assert.match(R.trainingGuidance(fresh,'Magi-magic'),/Grand Guardian/);
  assert.equal(R.combatSkill({...fresh,grandMaster:R.grandMaster.map(d=>d[0])}).mastery,0,'Selecting all skills grants no weapon types');
  const path=`all-books-simple/en/xhtml-simple/lw/${C.books[book].slug}.htm`;
  if(fs.existsSync(path)){
    const html=fs.readFileSync(path,'utf8'),table=html.split('<a id="crtable">')[1].split('</tbody>')[0];
    assert.equal(Math.max(...[...html.matchAll(/id="sect(\d+)"/g)].map(m=>Number(m[1]))),350);
    const rows=[...table.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(m=>({roll:Number(m[1].match(/<th scope="row">(\d)<\/th>/)?.[1]),cells:[...m[1].matchAll(/<td>([\dk]+\/[\dk]+)<\/td>/g)].map(x=>x[1])})).filter(r=>r.cells.length);
    assert.equal(rows.length,10);for(const row of rows)assert.deepEqual(row.cells,R.table[row.roll]);
    console.log(`Local Book ${book}: all 130 combat-table cells and section bounds match.`);
  }else console.log(`Optional local Book ${book} source comparison skipped (no download).`);
}
assert.match(R.trainingGuidance({book:15},'Kai-alchemy'),/Sun Knight.*Strength/);
assert.doesNotMatch(R.trainingGuidance({book:14},'Kai-alchemy'),/Sun Knight/);
const one=C.startBook(13,null,opts),two=C.startBook(14,one,{completed:true,gold:24}),three=C.startBook(15,two,{completed:true,gold:24});
assert.equal(C.limit(three),6);assert.equal(three.grandAdvances,0);assert.deepEqual(three.grandMaster,[]);
const charts={1:C.validateCharacter(C.newCharacter())};for(let b=2;b<=15;b++)charts[b]=C.startBook(b,null,b>=13?opts:{cs:16,ep:25,gold:12});
charts[13]=one;charts[14]=two;charts[15]=three;
const campaign={version:4,activeBook:15,books:charts};assert.deepEqual(C.validateSave(clone(campaign)),campaign);
assert.throws(()=>C.startBook(21,null,opts),/Unsupported/);
console.log('Passed: Books 14–15 fresh/continued supplies, explicit progression, retained wounds/records, skipped histories, guidance, and fifteen-chart saves.');
