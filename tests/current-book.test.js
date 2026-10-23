/* Exercise real app persistence and URL restore without touching browser/player data. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C=require('../campaign.js'),R=require('../rules.js'),S=require('../saves.js');
const code=fs.readFileSync(require.resolve('../app.js'),'utf8');
function harness(initial=[],href='https://example.test/index.html',blocked=false){
  const storage=new Map(initial),elements=new Map(),listeners=new Map(),writes=[];
  function element(key){
    if(!elements.has(key))elements.set(key,{dataset:{},open:false,checked:true,classList:{add(){},remove(){}},addEventListener(type,fn){listeners.set(key+':'+type,fn);},focus(){},select(){},close(){this.open=false;},showModal(){this.open=true;},scrollTop:0});
    return elements.get(key);
  }
  const location={href},history={state:{keep:true},replaceState(state,title,url){this.state=state;location.href=url;}};
  const context=vm.createContext({window:{LWRules:R,LWCampaign:C,LWSaves:{...S},location,history,addEventListener(){}},document:{querySelector:element,addEventListener(type,fn){listeners.set(type,fn);}},localStorage:{getItem(key){return storage.get(key)??null;},setItem(key,value){if(blocked)throw new Error('Quota exceeded');writes.push(key);storage.set(key,value);}},URL,setTimeout:()=>0,clearTimeout(){},matchMedia:()=>({matches:false}),console});
  context.FormData=class{constructor(form){this.values=form.values;}get(key){return this.values[key]??null;}getAll(key){const value=this.values[key];return value===undefined?[]:Array.isArray(value)?value:[value];}has(key){return Object.hasOwn(this.values,key);}};
  const run=source=>vm.runInContext(source,context);
  const click=action=>listeners.get('click')({target:{closest(){return {dataset:{action},disabled:false};}},detail:0});
  run(code);
  return {run,click,storage,writes,elements,listeners,location,history,element,submit:(id,values,dataset={})=>listeners.get('submit')({target:{id,values,dataset},preventDefault(){}})};
}
async function settled(h){
  for(let i=0;i<100;i++){
    if(!h.run('urlPending') || h.element('#dialog').innerHTML.includes('Restore this adventure?'))return;
    await new Promise(resolve=>setImmediate(resolve));
  }
  throw new Error('URL decoding did not settle');
}
async function main(){
  const old=C.newCharacter();old.notes='Original progress';
  const oldSave=JSON.stringify({version:2,activeBook:1,books:{1:old}});
  const incoming=C.startBook(13,null,{cs:30,ep:35,gold:25,items:[]});incoming.notes='Shared checkpoint 🐺';
  const link=await S.createLink(incoming,'https://example.test/index.html?other=keep#journal');
  let h=harness([['lone-wolf-action-chart-v2',oldSave]],link);
  assert.equal(h.writes.length,0);h.run('persist()');assert.equal(h.writes.length,0,'Pending link must block startup/background writes');
  await settled(h);assert.equal(h.run('state.book'),1);assert.equal(h.writes.length,0);
  h.listeners.get('#confirm-import:click')();
  assert.equal(h.run('state.book'),13);assert.equal(h.storage.get('lone-wolf-action-chart-v2'),oldSave);
  assert.equal(h.location.href,'https://example.test/index.html?other=keep#journal');assert.equal(h.history.state.keep,true);
  let saved=S.validateRecord(JSON.parse(h.storage.get(S.STORAGE_KEY)));
  assert.equal(saved.current.book,13);assert.ok(saved.checkpoints.some(c=>c.chart.notes==='Original progress'));
  h.run('change(s=>s.notes="After restoring");campaign=load();state=campaign.books[campaign.activeBook]');assert.equal(h.run('state.notes'),'After restoring');
  h.run('undo()');assert.equal(h.run('state.book'),13);h.run('undo()');assert.equal(h.run('state.book'),1);
  h=harness([['lone-wolf-action-chart-v2',oldSave]],link);await settled(h);h.click('close-dialog');assert.equal(h.run('state.notes'),'Original progress');assert.equal(new URL(h.location.href).searchParams.has('state'),false);
  const record=JSON.stringify(S.record(C.validateCharacter(old)));
  for(const bad of ['?state=1.gz.AAAA','?state=bad&state=bad','?state=1.json.A','?state=2.json.AAAA']){
    h=harness([[S.STORAGE_KEY,record]],'https://example.test/index.html'+bad);await settled(h);
    assert.equal(h.storage.get(S.STORAGE_KEY),record);assert.equal(h.writes.length,0,'Malformed links leave stored bytes untouched');assert.equal(h.run('state.notes'),'Original progress');
  }
  h=harness([[S.STORAGE_KEY,'{bad'],['lone-wolf-action-chart-v2',oldSave]]);
  assert.equal(h.run('state.book'),1);assert.equal(h.storage.get(S.STORAGE_KEY),'{bad');assert.equal(h.writes.length,0);h.run('change(s=>s.gold=3)');assert.equal(h.writes.length,0,'Corruption must not overwrite saves or fall back to stale keys');
  // New play can continue from one chart without any saved predecessor.
  const source=C.startBook(12,null,{cs:15,ep:25,gold:15,items:[]});
  h=harness([[S.STORAGE_KEY,JSON.stringify(S.record(source))]]);
  h.submit('book2-form',{completed:'on',gold:'25'},{book:'13',source:'12',continuing:'true'});
  saved=S.validateRecord(JSON.parse(h.storage.get(S.STORAGE_KEY)));assert.equal(saved.current.book,13);assert.equal(saved.checkpoints.length,0);assert.deepEqual(saved.current.completedBooks,[12]);
  h.run('undo()');assert.equal(h.run('state.book'),12);
  h.submit('book2-form',{checkpoint:'on',completed:'on',gold:'25'},{book:'13',source:'12',continuing:'true'});
  saved=S.validateRecord(JSON.parse(h.storage.get(S.STORAGE_KEY)));assert.equal(saved.checkpoints.length,1);assert.deepEqual(saved.checkpoints[0].chart,C.validateCharacter(source));
  h.run('change(s=>s.gold=99)');assert.equal(S.validateRecord(JSON.parse(h.storage.get(S.STORAGE_KEY))).checkpoints[0].chart.gold,15);
  h.run('undo();undo()');assert.equal(h.run('state.book'),12);assert.equal(h.run('checkpoints.length'),0,'Undo restores checkpoint creation with the transition');
  h=harness([[S.STORAGE_KEY,record]],link,true);await settled(h);h.listeners.get('#confirm-import:click')();assert.equal(h.run('state.book'),13);assert.equal(h.storage.get(S.STORAGE_KEY),record);assert.equal(h.run('storageAvailable'),false);assert.match(h.element('#toast').textContent,/Restored in memory/);assert.equal(new URL(h.location.href).searchParams.has('state'),false);
  // Repeated checkpoint deletion is reversible, and a failed append is atomic.
  h=harness([[S.STORAGE_KEY,record]]);h.run('change(()=>keepCheckpoint(state,"Before battle"));');
  const id=h.run('checkpoints[0].id');h.run(`change(()=>{checkpoints=checkpoints.filter(c=>c.id!==${JSON.stringify(id)})})`);assert.equal(h.run('checkpoints.length'),0);h.run('undo()');assert.equal(h.run('checkpoints.length'),1);
  const before=h.run('JSON.stringify(campaign)'),undoCount=h.run('undoStack.length');
  assert.throws(()=>h.run('change(()=>{state.gold=999;keepCheckpoint(state,"")})'));assert.equal(h.run('JSON.stringify(campaign)'),before);assert.equal(h.run('undoStack.length'),undoCount);
  const full=Array.from({length:S.MAX_CHECKPOINTS},(_,i)=>({...S.checkpoint(old,'Saved chart'),id:`checkpoint-${i}`}));
  h=harness([[S.STORAGE_KEY,JSON.stringify(S.record(old,full))]]);
  h.submit('new-form',{checkpoint:'on',cs:'15',ep:'25',gold:'3',loot:'6',mastery:'Axe'});assert.match(h.element('#form-error').textContent,/full/);assert.equal(h.run('state.notes'),'Original progress');
  h.submit('new-form',{cs:'15',ep:'25',gold:'3',loot:'6',mastery:'Axe'});assert.equal(h.run('state.notes'),'');assert.equal(h.run('checkpoints.length'),S.MAX_CHECKPOINTS);
  // A completed asynchronous encoder must not reopen a dismissed dialog or replace a newer one.
  h=harness();h.run('S.createLink=()=>new Promise(resolve=>{window.finishLink=resolve});showSaveLink();');h.click('close-dialog');h.run('checkpointDialog();window.finishLink("https://example.test/?state=old");');
  await new Promise(resolve=>setImmediate(resolve));assert.match(h.element('#dialog').innerHTML,/Keep a checkpoint/);assert.doesNotMatch(h.element('#dialog').innerHTML,/id="save-link"/);
  h.element('#save-link').value='https://example.test/';await h.run('copySaveLink()');assert.match(h.element('#toast').textContent,/Select and copy/);
  console.log('Passed: pending/accepted/cancelled/invalid links, unrelated URL parts, old-key retention, corrupt-save protection, quota failures, current-only continuation, optional checkpoints, and atomic Undo.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
