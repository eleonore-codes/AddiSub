import {C,LEVELS} from './config.js';
import {generate,checkCalculation,gridWidth} from './math.js';
import {dayKey} from './storage.js';
import {chooseFamily,focusFrom,recordLearning} from './learning.js';
import {summarize,award} from './rewards.js';
export function start(state,level,id=crypto.randomUUID()){
 if(!Number.isInteger(level)||!LEVELS[level]||state.session&&state.session.stage!=='done')return false;
 state.session={id,level,stage:'a',elapsed:0,rows:{a:[],b:[]},reports:{},focus:[],active:null};return true;
}
export function chooseLevel(state,level){
 if(!Number.isInteger(level)||!LEVELS[level])return false;
 const current=state.session;
 if(current?.level!==level){
  state.pausedSessions||={};
  if(current&&current.stage!=='done')state.pausedSessions[current.level]=current;
  state.session=state.pausedSessions[level]||null;delete state.pausedSessions[level];
 }
 state.selectedLevel=level;return true;
}
export function prepareWork(w){
 if(w.inputVersion===2)return w;
 w.legacyAssisted=!!w.evidence?.length||!!w.errors?.length;
 w.legacyErrors=[...(w.errors||[])];w.inputVersion=2;w.firstSubmission=null;w.validation=null;w.submissions=0;w.corrections=0;w.correctionEdits=0;w.resolved=false;w.columnTimes={};
 w.p=Math.min(w.p,gridWidth(w.task)-1);w.selected={kind:'result',place:w.p};return w;
}
export function nextTask(state,rng=Math.random){const s=state.session;if(!['a','b'].includes(s.stage))return null;
 const family=chooseFamily(state,s.level,s.stage==='b'?s.focus:[],rng),growth=state.levelProgress[s.level]?.correct||0;
 const task=generate(s.level,{family,growth,rng,exclude:state.history.slice(-8).map(r=>r.key)});
 s.active=prepareWork({task,p:0,results:{},helpers:{},selected:{kind:'result',place:0},errors:[],stepErrors:[],evidence:[],firstMs:null,totalMs:0,columnMs:0,interrupted:false});return s.active;
}
export function selectField(w,kind,place){if(w.resolved||!['result','helper'].includes(kind)||!Number.isInteger(place)||place<0||place>=gridWidth(w.task))return false;w.selected={kind,place};w.p=place;return true;}
export function enterDigit(w,value){
 if(w.resolved||value!==null&&(!Number.isInteger(value)||value<0||value>9))return false;
 const {kind,place}=w.selected;(kind==='helper'?w.helpers:w.results)[place]=value;
 if(w.firstMs===null)w.firstMs=w.totalMs;if(w.firstSubmission)w.correctionEdits++;
 w.validation=null;
 if(value!==null){const next=kind==='result'?Math.min(place+1,gridWidth(w.task)-1):place;w.selected={kind:'result',place:next};w.p=next;}
 return true;
}
export function submitCalculation(w){
 if(w.resolved)return w.validation;
 const result=checkCalculation(w.task,w.results,w.helpers);w.submissions++;w.corrections=Math.max(0,w.submissions-1);
 if(!w.firstSubmission){
  w.firstSubmission={...structuredClone(result),results:{...w.results},helpers:{...w.helpers},totalMs:w.totalMs,columnTimes:{...w.columnTimes},independent:!w.legacyAssisted};
  w.errors=result.errors.map(e=>({...e}));if(w.legacyAssisted)w.errors.push(...w.legacyErrors);
  w.evidence=w.task.columns.map(c=>{const errors=w.errors.filter(e=>(e.sourcePlace??e.place)===c.place).map(e=>e.type);return {errors,ms:w.columnTimes[c.place]??null,resultOK:result.fields.result[c.place]===true,helperOK:!c.helperRequired||result.fields.helper[c.helperPlace]===true};});
 }
 w.validation=result;w.resolved=result.ok;return result;
}
export function finishCalculation(state,date=dayKey()){
 const s=state.session,w=s.active;if(!w?.resolved||!w.validation?.ok||!w.firstSubmission)return false;
 const t=w.task,first=w.firstSubmission;recordLearning(state,t,w,date);
 const row={key:`${t.a}${t.operation}${t.b}`,family:t.family,level:t.level,ok:first.ok&&first.independent,firstSubmissionCorrect:first.ok,independent:first.independent,finalCorrect:true,corrections:w.corrections,correctionEdits:w.correctionEdits,submissions:w.submissions,firstSubmission:structuredClone(first),finalSubmission:{results:{...w.results},helpers:{...w.helpers},numericCorrect:true,pathCorrect:true},columns:t.columns.length,helpers:t.columns.filter(c=>c.helperRequired).length,correctColumns:first.independent?w.evidence.filter(e=>e.resultOK).length:0,correctHelpers:first.independent?t.columns.filter(c=>c.helperRequired&&w.evidence[c.place].helperOK).length:0,resolved:true,firstMs:w.firstMs,totalMs:w.totalMs,firstSubmissionMs:first.totalMs,normalizedMs:first.totalMs/t.columns.length,errors:w.errors.map(e=>e.type)};
 s.rows[s.stage].push(row);state.history.push(row);state.history=state.history.slice(-C.historyLimit);
 const p=state.levelProgress[t.level]||={tasks:0,correct:0,columns:0,successes:0,recent:[]};p.tasks++;p.correct+=+row.ok;p.columns+=row.columns;p.recent.push(row.ok);p.recent=p.recent.slice(-C.recent);
 if(!state.learningDays.includes(date))state.learningDays.push(date);const d=state.daily[date]||={tasks:0,columns:0,successes:[]};d.tasks++;d.columns+=row.columns;
 s.active=null;if(s.elapsed>=(s.stage==='a'?C.generalMs:C.focusMs))finishPhase(state,date);return true;
}
export function finishPhase(state,date=dayKey()){
 const s=state.session;if(!['a','b'].includes(s.stage)||s.active)return null;const phase=s.stage;
 const report={...summarize(s.rows[phase]),phase,level:s.level,id:`${s.id}:${phase}`,date};s.reports[phase]=report;
 const card=award(state,report,date);if(card)state.daily[date].successes.push(card.number);
 if(phase==='a'){s.focus=focusFrom(s.rows.a);s.stage='between';}else s.stage='done';s.elapsed=0;return report;
}
export function startFocus(state){if(state.session?.stage!=='between')return false;state.session.stage='b';return true;}
