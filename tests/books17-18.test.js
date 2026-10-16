const assert=require('node:assert/strict'),fs=require('node:fs');
const C=require('../campaign'),R=require('../rules');
const opts={cs:30,ep:35,gold:24},clone=s=>JSON.parse(JSON.stringify(s));
for(const book of [17,18]){
 const fresh=C.startBook(book,null,opts);assert.equal(fresh.gold,24);assert.equal(C.limit(fresh),4);assert.equal(fresh.grandFlaming,false);assert.equal(fresh.grandAdvances,0);assert.deepEqual(fresh.grandMaster,[]);
 assert.equal(fresh.special[0].name,book===17?'Map of Ixia and the Hardlands':'Map of Northern Magnamund');
 assert.ok(C.books[book].supplies.includes(book===17?'Broadsword':'Quarterstaff'));
 assert.ok(!C.books[book].supplies.includes(book===17?'Quarterstaff':'Broadsword'));
 for(const item of C.books[book].supplies)C.validateCharacter(C.startBook(book,null,{...opts,items:[item]}));
 const supplies=C.startBook(book,null,{...opts,items:['Sword','Quiver','2 Meals','Potion of Laumspur']});assert.equal(supplies.meals,2);assert.equal(supplies.arrows,6);assert.equal(supplies.backpack.length,1);
 assert.throws(()=>C.startBook(book,null,{...opts,items:['Sword','Quiver','2 Meals','Rope','Bow']}),/different/);
 let source=C.startBook(book-1,null,{...opts,items:['Sword','Quiver']});source.grandMaster=['Grand Weaponmastery','Kai-surge'];source.grandMasteries=['Sword'];source.grandFlaming=true;source.psychicMode='kaiBlast';source.grandAdvances=3;source.grandUnarmed=true;source.ep-=6;source.arrows=1;source.notes='Manual limits';source.backpack=Array(8).fill('Supply');source.meals=2;
 const before=clone(source),next=C.startBook(book,source,{completed:true,gold:25});assert.deepEqual(source,before);assert.equal(next.ep,source.ep);assert.equal(next.gold,49);assert.equal(next.grandFlaming,true);assert.equal(next.psychicMode,'kaiBlast');assert.equal(next.grandAdvances,3);assert.equal(C.limit(next),5);
 for(const field of ['grandMaster','grandMasteries','grandUnarmed','arrows','backpack','notes'])assert.deepEqual(next[field],source[field]);
 assert.deepEqual(C.validateCharacter(clone(next)),next);assert.throws(()=>C.startBook(book,source,{gold:24}),/Confirm/);assert.throws(()=>C.startBook(book,source,{completed:true,gold:24,items:['2 Meals']}),/backpack is full/);
 assert.throws(()=>C.validateCharacter({...next,section:351}));
 const path=`all-books-simple/en/xhtml-simple/lw/${C.books[book].slug}.htm`;
 if(fs.existsSync(path)){
  const h=fs.readFileSync(path,'utf8'),t=h.split('<a id="crtable">')[1].split('</tbody>')[0];let n=0;
  assert.equal(Math.max(...[...h.matchAll(/id="sect(\d+)"/g)].map(m=>+m[1])),350);
  for(const m of t.matchAll(/<tr>([\s\S]*?)<\/tr>/g)){const cells=[...m[1].matchAll(/<td>([\dk]+\/[\dk]+)<\/td>/g)].map(x=>x[1]);if(cells.length){assert.deepEqual(cells,R.table[+m[1].match(/<th scope="row">(\d)<\/th>/)[1]]);n++;}}assert.equal(n,10);console.log(`Local Book ${book}: all 130 combat-table cells and section bounds match.`);
 }else console.log(`Optional local Book ${book} comparison skipped (no download).`);
}
assert.match(R.trainingGuidance({book:17},'Kai-screen'),/Sun Thane.*Mindfort/);
assert.match(R.trainingGuidance({book:18},'Grand Nexus'),/Grand Thane.*Shadow Gates/);
assert.doesNotMatch(R.trainingGuidance({book:17},'Grand Nexus'),/Grand Thane/);
const books={1:C.validateCharacter(C.newCharacter())};for(let book=2;book<=18;book++)books[book]=C.startBook(book,null,book>=13?opts:{cs:16,ep:25,gold:12});
const save={version:4,activeBook:18,books};assert.deepEqual(C.validateSave(clone(save)),save);
console.log('Passed: Books 17–18 distinct supplies/maps, retained choices/wounds, manual training guidance and eighteen-chart saves.');
