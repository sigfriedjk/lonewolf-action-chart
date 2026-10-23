/* Exercise complete book transport, archive validation, and bounded untrusted decoding. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),zlib=require('node:zlib');
const C=require('../campaign.js'),R=require('../rules.js'),S=require('../saves.js');
const clone=value=>JSON.parse(JSON.stringify(value));
async function main(){
  const books={};
  for(let book=1;book<=20;book++){
    const chart=book===1?C.newCharacter():C.startBook(book,null,{cs:book>=13?30:15,ep:book>=13?35:25,gold:book>=13?25:15,mastery:'Sword',items:[]});
    chart.notes='Sommerlund — 🐺\n地図 café <script>alert("notes")</script>';
    chart.storedSpecial=[{name:'Spare shield',effect:'Stored at the monastery',ep:0,cs:2}];
    chart.section=C.books[book].sections;
    chart.combat={name:'Test enemy',cs:15,maxEP:999,ep:999,modifier:0,immune:false,undead:false,mindblastDamage:1,status:'active',rounds:[]};
    R.resolveRound(chart,8);
    books[book]=C.validateCharacter(chart);
    const token=await S.encode(chart);
    assert.match(token,/^1\.gz\.[A-Za-z0-9_-]+$/);
    assert.deepEqual(await S.decode(token),books[book]);
    const link=new URL(await S.createLink(chart,'https://example.test/index.html?other=keep#journal'));
    assert.equal(link.searchParams.get('other'),'keep');assert.equal(link.hash,'#journal');
    assert.deepEqual(await S.decode(link.searchParams.get('state')),books[book]);
  }
  const original={version:4,activeBook:20,books},migrated=S.importRecord(original);
  assert.equal(migrated.checkpoints.length,20);assert.deepEqual(migrated.current,books[20]);
  assert.deepEqual(S.campaign(migrated.current,migrated.checkpoints),original);
  assert.deepEqual(S.validateRecord(clone(migrated)),migrated);
  migrated.current.notes='Changed current';assert.notEqual(migrated.checkpoints[19].chart.notes,migrated.current.notes);
  assert.notEqual(original.books[20].notes,migrated.current.notes);
  const snapshot=S.checkpoint(books[20],'Before the final battle',123456789);
  const archive=S.append([],snapshot);books[20].notes='Later edits';
  assert.notEqual(snapshot.chart.notes,books[20].notes);
  assert.equal(archive.length,1);assert.equal(S.campaign(books[20],archive).activeBook,20);
  for(const invalid of [null,{}, {...migrated,version:2},{...migrated,checkpoints:[snapshot,snapshot]},{...migrated,checkpoints:[{...snapshot,id:'<script>'}]},{...migrated,checkpoints:[{...snapshot,chart:{}}]}])assert.throws(()=>S.validateRecord(invalid));
  assert.throws(()=>S.checkpoint(books[20],''));assert.throws(()=>S.append(Array(S.MAX_CHECKPOINTS).fill(snapshot),snapshot),/full/);
  const big=clone(books[20]);big.combat={name:'Large log',cs:15,maxEP:999,ep:999,modifier:0,immune:false,undead:false,mindblastDamage:0,status:'active',rounds:Array.from({length:1000},()=>({roll:0,ratio:0,heroLoss:0,enemyLoss:0,mindblastLoss:0,evade:false}))};
  const bigSnapshot=S.checkpoint(big,'Large chart');assert.throws(()=>S.append(Array(100).fill(bigSnapshot),bigSnapshot),/too large/);
  for(const token of ['', '2.gz.AAAA','1.gz.bad+base64','1.json.A','1.json._w','1.gz.AAAA','1.json.'+'A'.repeat(S.MAX_URL_LENGTH)])await assert.rejects(S.decode(token));
  const bomb='1.gz.'+zlib.gzipSync(Buffer.alloc(S.MAX_BOOK_BYTES+1,32)).toString('base64url');
  await assert.rejects(S.decode(bomb),/too much data/);
  const campaignToken='1.json.'+Buffer.from(JSON.stringify(original)).toString('base64url');
  await assert.rejects(S.decode(campaignToken));
  const valid=await S.encode(books[1]);await assert.rejects(S.decode(valid.slice(0,-5)));
  const large=clone(books[1]);large.notes=require('node:crypto').randomBytes(15000).toString('base64');
  await assert.rejects(S.createLink(large,'https://example.test/index.html'),/too large/);
  await assert.rejects(S.createLink(books[1],'https://example.test/?other='+'x'.repeat(S.MAX_URL_LENGTH)),/too large/);
  // A browser without native compression can still produce/open JSON links and export files.
  const context=vm.createContext({window:{LWCampaign:C},TextEncoder,TextDecoder,URL,Uint8Array,btoa,atob});
  vm.runInContext(fs.readFileSync(require.resolve('../saves.js'),'utf8'),context);
  const fallback=context.window.LWSaves,plain=await fallback.encode(books[1]);assert.match(plain,/^1\.json\./);
  assert.deepEqual(await fallback.decode(plain),books[1]);
  await assert.rejects(fallback.decode(await S.encode(books[1])),/current browser/);
  console.log('Passed: all twenty complete book links, Unicode, combat/safekeeping, archive migration/independence/validation, size bounds, gzip bombs, malformed links, and uncompressed fallback.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
