/* Exercise actual app handlers with deterministic timers and pointer events. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const C=require('../campaign.js');
const S=require('../saves.js');
const readSaved=require('./saved-record.js');
const R=require('../rules.js');
let clock=0,nextTimer=0;
const timers=new Map(),listeners=new Map(),windowListeners=new Map(),elements=new Map(),storage=new Map();
function element(selector) {
  if (!elements.has(selector)) {
    const classes=new Set();
    elements.set(selector,{dataset:{},isConnected:true,open:false,disabled:false,classList:{add:(...names)=>names.forEach(n=>classes.add(n)),remove:(...names)=>names.forEach(n=>classes.delete(n)),contains:name=>classes.has(name)},
      addEventListener(){},focus(){},close(){this.open=false;},showModal(){this.open=true;},getBoundingClientRect:()=>({left:0,right:200,top:0,bottom:100}),
      setPointerCapture(){},hasPointerCapture:()=>false,scrollTop:0});
  }
  return elements.get(selector);
}
const add=(map,type,fn)=>map.set(type,[...(map.get(type)||[]),fn]);
const context=vm.createContext({window:{LWRules:R,LWCampaign:C,LWSaves:S,addEventListener:(type,fn)=>add(windowListeners,type,fn)},
  document:{querySelector:element,addEventListener:(type,fn)=>add(listeners,type,fn),visibilityState:'visible'},
  localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)},matchMedia:()=>({matches:false}),
  Date:{now:()=>clock},setTimeout:(fn,delay)=>{const id=++nextTimer;timers.set(id,{fn,at:clock+delay});return id;},clearTimeout:id=>timers.delete(id),console});
vm.runInContext(fs.readFileSync(require.resolve('../app.js'),'utf8'),context);
vm.runInContext("view='kai';render();",context);
const run=code=>vm.runInContext(code,context);
const selected=()=>JSON.parse(run('JSON.stringify(state.disciplines)'));
const undoCount=()=>run('undoStack.length');
function tile(name,action='discipline') {
  const button=element(`[data-action="${action}"][data-name="${name}"]`);
  button.dataset={action,name};
  button.closest=selector=>selector==='[data-action]' || action==='discipline' && selector==='[data-action="discipline"]' ? button : null;
  return button;
}
function emit(type,button,extras={}) {
  const event={target:button,pointerId:1,clientX:20,clientY:20,button:0,isPrimary:true,detail:1,preventDefault(){},...extras};
  for (const fn of listeners.get(type)||[]) fn(event);
}
function advance(ms) {
  const end=clock+ms;
  while (true) {
    const pending=[...timers].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];
    if (!pending) break;
    clock=pending[1].at;timers.delete(pending[0]);pending[1].fn();
  }
  clock=end;
}
function hold(name,duration=550) {const button=tile(name);emit('pointerdown',button);advance(duration);emit('pointerup',button);emit('click',tile(name));}
const healing=tile('Healing');
emit('pointerdown',healing);advance(150);emit('pointerup',healing);emit('click',healing);
assert.deepEqual(selected(),[],'A tap must only open a description');assert.equal(undoCount(),0,'Reading creates no Undo entry');
assert.equal(element('#dialog').open,true);assert.match(element('#dialog').innerHTML,/Restore 1 Endurance/);element('#dialog').close();
hold('Healing');assert.deepEqual(selected(),['Healing']);assert.equal(undoCount(),1);assert.equal(element('#dialog').open,false,'The trailing click after a hold must not open a description');
hold('Healing',1200);assert.deepEqual(selected(),[]);assert.equal(undoCount(),2,'A prolonged hold only toggles once');
emit('pointerdown',healing);advance(549);emit('pointerup',healing);emit('click',healing);assert.deepEqual(selected(),[],'A press below the threshold is still a tap');element('#dialog').close();
emit('pointerdown',healing);advance(300);emit('pointermove',healing,{clientX:40});advance(1000);emit('pointerup',healing);assert.deepEqual(selected(),[],'Dragging cancels selection');
emit('pointerdown',healing);advance(550);emit('pointercancel',healing);emit('pointerup',healing);assert.deepEqual(selected(),[],'Cancellation after the threshold cannot select');
emit('pointerdown',healing,{clientX:5});advance(550);emit('pointerup',healing,{clientX:-1});assert.deepEqual(selected(),[],'Releasing outside the tile cannot select');
emit('pointerdown',healing);advance(550);for(const fn of windowListeners.get('blur'))fn();emit('pointerup',healing);assert.deepEqual(selected(),[],'Losing focus cancels a ready hold');
emit('pointerdown',healing);advance(550);run("view='chart';render();");emit('pointerup',healing);assert.deepEqual(selected(),[],'Navigation cancels a ready hold');run("view='kai';render();");
emit('pointerdown',healing,{isPrimary:false});advance(550);emit('pointerup',healing);assert.deepEqual(selected(),[],'A secondary touch never selects');
emit('pointerdown',healing,{button:2});advance(550);emit('pointerup',healing);assert.deepEqual(selected(),[],'Right mouse presses never select');
emit('click',healing,{detail:0});assert.equal(element('#dialog').open,true,'Keyboard activation opens the description');
emit('click',tile('Healing','toggle-discipline'),{detail:0});assert.deepEqual(selected(),['Healing'],'The description offers keyboard-accessible selection');assert.match(element('#dialog').innerHTML,/Remove this Discipline/);element('#dialog').close();
for(const name of ['Hunting','Mindblast','Mindshield','Camouflage'])hold(name);
hold('Tracking');assert.equal(selected().length,5,'Book 1 enforces its five-skill limit');assert.equal(selected().includes('Tracking'),false);
emit('click',tile('Tracking'));assert.match(element('#dialog').innerHTML,/Your skills are full/);assert.match(element('#dialog').innerHTML,/disabled/);element('#dialog').close();
hold('Camouflage');hold('Tracking');assert.equal(selected().length,5);assert.equal(selected().includes('Tracking'),true);
run("state=C.startBook2(state,{gold:10,discipline:'Sixth Sense',items:[]});campaign.activeBook=2;persist();render();");
assert.equal(selected().length,6);hold('Animal Kinship');assert.equal(selected().length,6);assert.equal(selected().includes('Animal Kinship'),false);
hold('Sixth Sense');hold('Animal Kinship');assert.equal(selected().length,6);assert.equal(selected().includes('Animal Kinship'),true);
const saved=readSaved(storage);assert.equal(saved.books[2].disciplines.length,6);
console.log('Passed: taps read without changing saves; held releases toggle once; ghost clicks, drags, cancellations, navigation, secondary touches, keyboard access, five/six-skill limits, and persistence.');
