import test from 'node:test';import assert from 'node:assert/strict';import {fresh,KEY,load} from '../storage.js';import {start,nextTask} from '../session.js';import {model} from '../math.js';
test('UI: no judgment until submission; any field editable; all levels and reset; first attempt retained',async()=>{
 const original={document:globalThis.document,window:globalThis.window,localStorage:globalThis.localStorage,setInterval:globalThis.setInterval};const handlers={},app={innerHTML:'',addEventListener:(n,f)=>handlers[n]=f},notice={hidden:true},data=new Map();const s=fresh();start(s,1,'ui');nextTask(s);s.session.active.task=model(987,248);data.set(KEY,JSON.stringify(s));
 globalThis.document={hidden:false,querySelector:sel=>sel==='#app'?app:notice,addEventListener:()=>{}};globalThis.window={addEventListener:()=>{}};globalThis.localStorage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};globalThis.setInterval=()=>0;
 const click=dataset=>handlers.click({target:{closest:()=>({dataset,disabled:false})}}),snapshot=()=>JSON.parse(data.get(KEY));
 const noJudgment=()=>{assert.doesNotMatch(app.innerHTML,/✓|✕|class="cell [^"]*(?:checked|incorrect)/);assert.equal(snapshot().session.active.firstSubmission,null);};
 try{await import('../app.js?delayed-ui');click({action:'levels'});assert.equal((app.innerHTML.match(/data-level=/g)||[]).length,10);assert.doesNotMatch(app.innerHTML,/disabled|gesperrt|freigeschaltet/i);click({level:'10'});assert.equal(snapshot().selectedLevel,10);assert.equal(snapshot().session,null);assert.ok(snapshot().pausedSessions[1]);click({action:'levels'});click({level:'1'});click({action:'resume'});
  for(const row of ['label','top','bottom','helper','result'])assert.deepEqual([...app.innerHTML.matchAll(new RegExp(`data-row="${row}" data-place="(\\d)"`,'g'))].map(m=>+m[1]),[3,2,1,0]);
  assert.match(app.innerHTML,/Ergebnis prüfen/);assert.doesNotMatch(app.innerHTML,/Stelle prüfen|Noch eine Stelle/);
  click({digit:'9'});assert.equal(snapshot().session.active.p,1);noJudgment();click({digit:'3'});noJudgment();
  click({cell:'helper:3'});click({digit:'1'});noJudgment(); // Wrong helper is accepted silently.
  click({cell:'result:0'});click({digit:'5'});noJudgment(); // Fix before submitting: not counted as an error.
  click({cell:'helper:3'});click({action:'erase'});click({cell:'helper:1'});click({digit:'1'});noJudgment();
  click({cell:'result:2'});click({digit:'2'});click({digit:'1'});noJudgment();
  click({action:'check'});assert.match(app.innerHTML,/Das Ergebnis stimmt. Prüfe die Hilfszahl: Hunderter/);let w=snapshot().session.active;assert.equal(w.firstSubmission.numericCorrect,true);assert.equal(w.firstSubmission.pathCorrect,false);assert.equal(w.results[0],5);assert.equal(w.submissions,1);
  click({cell:'helper:2'});click({digit:'1'});assert.doesNotMatch(app.innerHTML,/✓|✕/);click({action:'check'});assert.match(app.innerHTML,/✓ Ergebnis und Rechenweg stimmen/);click({action:'finish'});
  const row=snapshot().history[0];assert.equal(row.ok,false);assert.equal(row.finalCorrect,true);assert.equal(row.corrections,1);assert.deepEqual(row.errors,['CARRY_MISSING']);assert.equal(row.correctColumns,4);assert.equal(row.correctHelpers,1);
  click({action:'pause'});assert.match(app.innerHTML,/<h1>Pause/);click({action:'progress'});assert.match(app.innerHTML,/Geübte Stufen/);assert.doesNotMatch(app.innerHTML,/Offene Stufen|freigeschaltet/);click({action:'reset'});assert.equal(snapshot().history.length,1);click({action:'confirm-reset'});assert.equal(snapshot().history.length,0);assert.equal(load(globalThis.localStorage).unlockedLevels.length,10);
 }finally{for(const [k,v] of Object.entries(original))if(v===undefined)delete globalThis[k];else globalThis[k]=v;}
});
