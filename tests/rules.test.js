const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const R = require('../rules.js');
const reference = path.join(__dirname,'../all-books-simple/en/xhtml-simple/lw/01fftd.htm');
const tableSource = fs.existsSync(reference) ? fs.readFileSync(reference,'utf8').split('<a id="crtable">')[1].split('</tbody>')[0] : null;
const sourceRows = tableSource ? [...tableSource.matchAll(/<tr>([\s\S]*?)<\/tr>/g)]
  .map(match=>({roll:Number(match[1].match(/<th scope="row">(\d)<\/th>/)?.[1]),cells:[...match[1].matchAll(/<td>([\dk]+\/[\dk]+)<\/td>/g)].map(m=>m[1])}))
  .filter(row=>row.cells.length) : require('./fixtures/book1-combat-table.json').rows;
assert.equal(sourceRows.length,10);
const ratios = [-11,-10,-8,-6,-4,-2,0,1,3,5,7,9,11];
let checked=0;
for(const row of sourceRows){
  assert.equal(row.cells.length,13);
  row.cells.forEach((cell,i)=>{
    const [enemy,hero] = cell.split('/').map(v=>v==='k'?'k':Number(v));
    assert.deepEqual(R.combatResult(ratios[i],row.roll),{enemy,hero},`roll ${row.roll}, ratio ${ratios[i]}`);
    if(ratios[i]<0 && ratios[i]>-11)assert.deepEqual(R.combatResult(ratios[i]+1,row.roll),{enemy,hero});
    if(ratios[i]>0 && ratios[i]<11)assert.deepEqual(R.combatResult(ratios[i]+1,row.roll),{enemy,hero});
    checked++;
  });
}
assert.deepEqual(R.combatResult(-100,1),{enemy:0,hero:'k'});
assert.deepEqual(R.combatResult(100,0),{enemy:'k',hero:0});
assert.deepEqual(R.combatResult(-3,6),{enemy:6,hero:3}); // Book's Winged Devil example.
assert.throws(()=>R.combatResult(0,10));
const character = () => ({baseCS:15,csBonus:0,baseEP:25,epBonus:0,ep:25,weapons:['Axe'],equipped:0,mastery:'Axe',disciplines:['Mindblast','Weaponskill'],special:[],combat:{name:'Winged Devil',cs:20,ep:20,maxEP:20,modifier:0,immune:false,rounds:[],status:'active'}});
let s=character();assert.equal(R.combatSkill(s).total,19);assert.equal(R.combatSkill(s,true).total,17);
s.equipped=-1;assert.equal(R.combatSkill(s).total,13);
s=character();s.disciplines=['Mindblast'];R.resolveRound(s,6);assert.equal(s.ep,22);assert.equal(s.combat.ep,14);assert.equal(s.combat.status,'active');
s=character();s.disciplines=['Mindblast'];R.resolveRound(s,6,true);assert.equal(s.ep,22);assert.equal(s.combat.ep,20);assert.equal(s.combat.status,'evaded');
s=character();s.combat.cs=1;R.resolveRound(s,0);assert.equal(s.combat.ep,0);assert.equal(s.combat.status,'victory');
s=character();s.combat.cs=40;R.resolveRound(s,1);assert.equal(s.ep,0);assert.equal(s.combat.status,'defeat');
s=character();s.special=[{ep:2},{ep:4}];assert.equal(R.maxEndurance(s),31);
const book2 = path.join(__dirname,'../all-books-simple/en/xhtml-simple/lw/02fotw.htm');
if (fs.existsSync(book2)) {
  const cells=[...fs.readFileSync(book2,'utf8').split('<a id="crtable">')[1].split('</tbody>')[0].matchAll(/<td>([\dk]+\/[\dk]+)<\/td>/g)].map(m=>m[1]);
  assert.deepEqual(cells,sourceRows.flatMap(row=>row.cells),'Book 2 uses the same combat results table');
}
s=character();s.special=[{name:'Shield',ep:0,cs:2},{name:'Sommerswerd',ep:0,cs:0}];
assert.equal(R.combatSkill(s).total,21,'Carrying the Sommerswerd alone grants no sword bonus');
s.equipped=-2;assert.equal(R.combatSkill(s).total,27,'Sommerswerd +8, Shield +2, Mindblast +2, no Axe mastery');
for(const mastery of ['Short Sword','Sword','Broadsword']) {s.mastery=mastery;assert.equal(R.combatSkill(s).total,29,'All sword masteries apply to the Sommerswerd');}
s.disciplines=[];s.combat.cs=25;s.combat.undead=true;
R.resolveRound(s,6);assert.equal(s.combat.ep,4,'Sommerswerd doubles undead damage');assert.equal(s.ep,23,'Hero damage is not doubled');
s=character();s.special=[{name:'Sommerswerd',ep:0}];s.equipped=-2;s.disciplines=[];s.combat.cs=23;s.combat.ep=30;s.combat.maxEP=30;s.combat.undead=true;
R.resolveRound(s,6,true);assert.equal(s.combat.ep,30,'Undead receive no damage during evasion');
console.log(`Passed: ${checked} source-table cells, paired ratio boundaries, combat bonuses, evasion, instant kills, and equipment endurance.`);
console.log('Passed: Book 2 table parity, Shield, Sommerswerd bonuses, sword masteries, and undead damage/evasion.');
