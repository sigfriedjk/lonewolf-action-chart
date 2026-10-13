const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const C=require('../campaign.js');
const R=require('../rules.js');
const clone=s=>JSON.parse(JSON.stringify(s));
const skills=R.disciplines.map(([name])=>name);
let hero=C.newCharacter(17,28,47,6,'Sword');
hero.disciplines=skills.slice(0,5);hero.ep=19;hero.notes='Remember Banedon';hero.section=350;
const charts={1:clone(hero)};
for (let book=2;book<=5;book++) {
  const before=clone(hero);
  hero=C.startBook(book,hero,{gold:12,discipline:skills[book+3],items:[]});
  assert.deepEqual(charts[book-1],before,'An earlier chart is never overwritten');
  assert.equal(hero.book,book);assert.equal(hero.section,1);assert.equal(hero.combat,null);
  assert.equal(C.limit(hero),book+4);assert.equal(hero.disciplines.length,book+4);
  assert.deepEqual(hero.completedBooks,Array.from({length:book-1},(_,i)=>i+1));
  assert.equal(hero.ep,19,'Carry wounded current EP without refilling it');
  assert.equal(hero.gold,47+12*(book-1),'Keep gold above the reference pouch limit');
  assert.equal(hero.notes,before.notes);assert.deepEqual(hero.backpack,before.backpack);
  assert.ok(hero.special.some(v=>v.name===C.books[book].map));
  if(book===4)assert.ok(hero.special.some(v=>v.name==='Badge of Rank'));
  charts[book]=clone(hero);
}
const saved=C.validateSave({version:2,activeBook:5,books:charts});
assert.deepEqual(C.validateSave(clone(saved)),saved,'All five charts round-trip');
saved.books[5].notes='Changed';saved.books[5].backpack.push('Torch');
assert.equal(saved.books[4].notes,'Remember Banedon');assert.deepEqual(saved.books[4].backpack,['Healing Potion']);
const legacy=clone(charts[2]);delete legacy.completedBooks;delete legacy.storedSpecial;
assert.deepEqual(C.validateCharacter(legacy).completedBooks,[1],'Legacy continued Book 2 saves preserve the earned sixth Discipline');
const freshOptions={cs:16,ep:24,gold:13,mastery:'Sword',items:[]};
for(const book of [3,4,5]) {
  const fresh=C.startBook(book,null,freshOptions);
  assert.equal(C.limit(fresh),5);assert.equal(fresh.continued,false);assert.deepEqual(fresh.completedBooks,[]);
  assert.equal(fresh.meals,0);assert.deepEqual(fresh.weapons,[]);assert.deepEqual(fresh.backpack,[]);
  assert.ok(!fresh.special.some(v=>v.name==='Seal of Hammerdal'),'Do not give a new hero Book 2 gifts');
  assert.ok(!fresh.special.some(v=>v.name==='Map of Sommerlund'),'Give only this book’s map to a fresh hero');
}
let fresh=C.startBook(3,null,{...freshOptions,items:['Padded Leather Waistcoat','Potion of Laumspur']});
assert.equal(fresh.ep,26);assert.equal(R.maxEndurance(fresh),26);assert.deepEqual(fresh.backpack,['Potion of Laumspur']);
assert.equal(C.startBook(3,null,{...freshOptions,items:['Special Rations']}).meals,1);
fresh=C.startBook(4,null,{...freshOptions,items:['Sword','Dagger','2 Potions of Laumspur','5 Special Rations','Chainmail Waistcoat','Shield']});
assert.equal(fresh.ep,28);assert.equal(fresh.meals,5);assert.equal(fresh.backpack.length,2);
assert.equal(R.combatSkill(fresh).equipment,2);assert.deepEqual(fresh.weapons,['Sword','Dagger']);
fresh=C.startBook(5,null,{...freshOptions,items:['Dagger','Potion of Laumspur','2 Special Rations','Shield']});
assert.equal(fresh.meals,2);assert.equal(fresh.backpack.length,1);assert.equal(R.combatSkill(fresh).equipment,2);
fresh.section=400;assert.equal(C.validateCharacter(fresh).section,400);
assert.throws(()=>C.validateCharacter({...fresh,section:401}),/valid Book/);
assert.throws(()=>C.validateCharacter({...charts[4],section:351}),/valid Book/);
const skipped=C.startBook(5,charts[1],{gold:10,discipline:skills[5],items:[]});
assert.equal(C.limit(skipped),6,'Skipping books does not award unearned Disciplines');
const freshThird=C.startBook(3,null,freshOptions);freshThird.disciplines=skills.slice(0,5);
const fourth=C.startBook(4,freshThird,{gold:10,discipline:skills[5],items:[]});
assert.equal(C.limit(fourth),6);assert.deepEqual(fourth.completedBooks,[3]);
assert.throws(()=>C.startBook(3,charts[3],{gold:10,discipline:skills[9]}),/later book/);
assert.throws(()=>C.startBook(4,{...charts[3],ep:0},{gold:10,discipline:skills[7]}),/Complete Book/);
assert.throws(()=>C.startBook(4,{...charts[3],disciplines:skills.slice(0,6)},{gold:10,discipline:skills[7]}),/Complete Book/);
assert.throws(()=>C.startBook(3,charts[2],{gold:10,discipline:skills[0]}),/new Kai/);
assert.throws(()=>C.startBook(3,null,{...freshOptions,items:['Shield']}),/different/);
assert.throws(()=>C.startBook(5,null,{...freshOptions,items:C.books[5].supplies.slice(0,5)}),/up to 4/);
assert.throws(()=>C.startBook(4,null,{...freshOptions,items:['Sword','Sword']}),/different/);
const full={...charts[2],backpack:Array(8).fill('Torch'),meals:0};
assert.throws(()=>C.startBook(3,full,{gold:10,discipline:skills[6],items:['Potion of Laumspur']}),/backpack is full/);
const storedSource=clone(charts[4]);
storedSource.special.push({name:'Sommerswerd',effect:'Sun sword',ep:0,cs:0},{name:'Chainmail Waistcoat',effect:'Armour',ep:4,cs:0},{name:'Shield',effect:'Shield',ep:0,cs:2});
storedSource.ep=23;storedSource.equipped=-2;
const beforeStore=clone(storedSource),storeIndices=storedSource.special.map((v,i)=>['Sommerswerd','Chainmail Waistcoat','Shield'].includes(v.name)?i:-1).filter(i=>i>=0);
const stored=C.startBook(5,storedSource,{gold:10,discipline:skills[8],storeSpecial:storeIndices,items:[]});
assert.deepEqual(storedSource,beforeStore,'Safekeeping never removes items from the earlier chart');
assert.equal(stored.storedSpecial.length,3);assert.equal(stored.equipped,-1);
assert.equal(stored.ep,19);assert.equal(R.maxEndurance(stored),28,'Stored armour gives no EP bonus');
assert.equal(R.combatSkill(stored).equipment,0);assert.equal(R.combatSkill(stored).sunSword,0);
assert.deepEqual(C.validateCharacter(clone(stored)).storedSpecial,stored.storedSpecial);
stored.special=[];assert.equal(stored.storedSpecial.length,3,'Loss of carried Special Items leaves stored items safe');
assert.equal(C.startBook(4,charts[3],{gold:10,discipline:skills[7],storeSpecial:[0]}).storedSpecial.length,1,'Safekeeping controls may also be used before a later-book transition');
assert.throws(()=>C.startBook(5,charts[4],{gold:10,discipline:skills[8],storeSpecial:[100]}),/safekeeping/);
assert.throws(()=>C.validateCharacter({...charts[5],completedBooks:[1,1,3,4]}),/valid Book/);
assert.throws(()=>C.validateSave({version:2,activeBook:6,books:{6:charts[5]}}),/Invalid campaign/);
const sourceVerified=[];
for (const book of [3,4,5]) {
  assert.equal(R.canHuntForMeal({book,disciplines:['Hunting']}),book!==3);
  assert.equal(R.canHuntForMeal({book,disciplines:[]}),false);
  const file=path.join(__dirname,`../all-books-simple/en/xhtml-simple/lw/${C.books[book].slug}.htm`);
  if(fs.existsSync(file)) {
    const source=fs.readFileSync(file,'utf8');
    const rows=[...source.split('<a id="crtable">')[1].split('</tbody>')[0].matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(m=>({roll:Number(m[1].match(/<th scope="row">(\d)<\/th>/)?.[1]),cells:[...m[1].matchAll(/<td>([\dk]+\/[\dk]+)<\/td>/g)].map(v=>v[1])})).filter(row=>row.cells.length).sort((a,b)=>a.roll-b.roll);
    assert.deepEqual(rows.map(row=>row.roll),[0,1,2,3,4,5,6,7,8,9]);
    // The downloaded simple Book 5 has 8/4 at roll 8, ratio -10/-9.
    // The current official crtneg.png shows 5/4, matching the other Kai books.
    if(book===5) {assert.ok(['8/4','5/4'].includes(rows[8].cells[1]));rows[8].cells[1]='5/4';}
    assert.deepEqual(rows.flatMap(row=>row.cells),R.table.flat(),'Compare all 130 combat cells by roll, including books that print zero last');
    const sections=[...source.matchAll(/<a id="sect(\d+)">/g)].map(m=>Number(m[1]));
    assert.equal(Math.max(...sections),C.books[book].sections);
    sourceVerified.push(book);
  }
}
assert.equal(R.potionRecovery('Potion of Laumspur'),4);assert.equal(R.potionRecovery('Healing Potion'),4);
assert.equal(R.potionRecovery('Red Laumspur Potion'),0,'A special concentrated potion is not assumed to be an ordinary dose');
let moved=C.moveSpecial(storedSource,storedSource.special.findIndex(v=>v.name==='Chainmail Waistcoat'),true);
assert.equal(moved.ep,19);assert.equal(R.maxEndurance(moved),28);assert.equal(storedSource.ep,23,'Moving is pure and does not mutate the original chart');
moved=C.moveSpecial(moved,0,false);assert.equal(moved.ep,23);assert.equal(R.maxEndurance(moved),32,'Retrieving armour preserves the same wound deficit');
moved=C.moveSpecial(moved,moved.special.findIndex(v=>v.name==='Sommerswerd'),true);
assert.equal(moved.equipped,-1);assert.equal(R.combatSkill(moved).sunSword,0);
moved=C.moveSpecial(moved,0,false);assert.equal(moved.equipped,-1,'A retrieved Sommerswerd is not equipped automatically');
assert.throws(()=>C.moveSpecial({...storedSource,ep:4},storedSource.special.findIndex(v=>v.name==='Chainmail Waistcoat'),true),/zero Endurance/);
const dead=C.moveSpecial({...storedSource,ep:0},0,true);assert.equal(C.moveSpecial(dead,0,false).ep,0,'Retrieving equipment cannot revive a defeated hero');
assert.throws(()=>C.moveSpecial(storedSource,999,true),/no longer available/);
const duplicate=clone(storedSource);duplicate.storedSpecial.push({name:'Shield',effect:'Another shield',ep:0,cs:2});
assert.throws(()=>C.moveSpecial(duplicate,0,false),/already carry/);
const active=clone(storedSource);active.combat={name:'Enemy',cs:10,maxEP:10,ep:10,modifier:0,immune:false,undead:false,status:'active',rounds:[]};
assert.throws(()=>C.moveSpecial(active,0,true),/Finish combat/);
assert.deepEqual(C.validateCharacter(C.moveSpecial(charts[1],0,true)).storedSpecial[0].name,'Map of Sommerlund','Safekeeping is available on every book chart');
console.log('Passed: Books 3–5 setup supplies, five-book saves, legacy migration, earned Disciplines, skips, capacity rejection, section limits, safekeeping, and Kalte Hunting rules.');
console.log(`Optional local source comparisons verified: ${sourceVerified.length ? sourceVerified.join(', ') : 'none (book downloads absent)'}.`);
