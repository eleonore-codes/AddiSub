import {C} from './config.js';
import {generate,checkColumn} from './math.js';
import {dayKey} from './storage.js';
import {chooseFamily,focusFrom,recordLearning,unlock} from './learning.js';
import {summarize,award} from './rewards.js';
export function start(state,level,id=crypto.randomUUID()){
 if(!state.unlockedLevels.includes(level)||state.session&&state.session.stage!=='done')return false;
 state.session={id,level,stage:'a',elapsed:0,rows:{a:[],b:[]},reports:{},focus:[],active:null};return true;
}
export function nextTask(state,rng=Math.random){const s=state.session;if(!['a','b'].includes(s.stage))return null;
 const family=chooseFamily(state,s.level,s.stage==='b'?s.focus:[],rng),growth=state.levelProgress[s.level]?.correct||0;
 const task=generate(s.level,{family,growth,rng,exclude:state.history.slice(-8).map(r=>r.key)});
 s.active={task,p:0,results:{},helpers:{},selected:{kind:'result',place:0},errors:[],stepErrors:[],evidence:[],firstMs:null,totalMs:0,columnMs:0,interrupted:false,choice:false};return s.active;
}
export function noteError(w,type,place=w.p){if(!w.stepErrors.includes(type))w.stepErrors.push(type);w.errors.push({type,place});if(w.choice&&w.evidence[w.p]){w.evidence[w.p].errors.push(type);w.evidence[w.p].resultOK=false;}}
export function verify(w){const check=checkColumn(w.task,w.p,w.results,w.helpers);for(const e of check.errors)noteError(w,e);if(check.ok){w.evidence[w.p]={errors:[...w.stepErrors],ms:w.columnMs,resultOK:!w.stepErrors.some(e=>/BASIC|NOT_USED|ZERO|FINAL|PLACE_VALUE/.test(e)),helperOK:!w.stepErrors.some(e=>/CARRY|HELPER/.test(e))};w.stepErrors=[];w.columnMs=0;if(w.p>=w.task.operandWidth-1)w.choice=true;else{w.p++;w.selected={kind:'result',place:w.p};}}return check;}
export function finishCalculation(state,date=dayKey()){
 const s=state.session,w=s.active;if(!w?.choice)return false;
 if(w.p<w.task.columns.length-1){noteError(w,'FINAL_COLUMN_ERROR');return false;}
 // A superfluous higher result column is an error, including a typed leading zero.
 if(Object.keys(w.results).some(p=>+p>=w.task.columns.length&&w.results[p]!==null)){noteError(w,'FINAL_COLUMN_ERROR');return false;}
 const t=w.task;recordLearning(state,t,w,date);
 const row={key:`${t.a}${t.operation}${t.b}`,family:t.family,level:t.level,ok:w.errors.length===0,columns:t.columns.length,helpers:t.columns.filter(c=>c.helperRequired).length,correctColumns:w.evidence.filter(e=>e.resultOK).length,correctHelpers:t.columns.filter(c=>c.helperRequired&&w.evidence[c.place].helperOK).length,resolved:true,firstMs:w.firstMs,totalMs:w.totalMs,normalizedMs:w.totalMs/t.columns.length,errors:w.errors.map(e=>e.type)};
 s.rows[s.stage].push(row);state.history.push(row);state.history=state.history.slice(-C.historyLimit);
 const p=state.levelProgress[t.level]||={tasks:0,correct:0,columns:0,successes:0,recent:[]};p.tasks++;p.correct+=+row.ok;p.columns+=row.columns;p.recent.push(row.ok);p.recent=p.recent.slice(-C.recent);
 if(!state.learningDays.includes(date))state.learningDays.push(date);const d=state.daily[date]||={tasks:0,columns:0,successes:[]};d.tasks++;d.columns+=row.columns;
 s.active=null;if(s.elapsed>=(s.stage==='a'?C.generalMs:C.focusMs))finishPhase(state,date);return true;
}
export function finishPhase(state,date=dayKey()){
 const s=state.session;if(!['a','b'].includes(s.stage)||s.active)return null;const phase=s.stage;
 const report={...summarize(s.rows[phase]),phase,level:s.level,id:`${s.id}:${phase}`,date};s.reports[phase]=report;
 const card=award(state,report,date);if(card)state.daily[date].successes.push(card.number);report.unlocked=unlock(state);
 if(phase==='a'){s.focus=focusFrom(s.rows.a);s.stage='between';}else s.stage='done';s.elapsed=0;return report;
}
export function startFocus(state){if(state.session?.stage!=='between')return false;state.session.stage='b';return true;}
