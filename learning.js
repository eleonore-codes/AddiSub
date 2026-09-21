import {C,LEVELS,ERROR_PRIORITY} from './config.js';
import {dayKey,ordinal} from './storage.js';
export function mastery(s){
 if(!s||s.n<C.minObservations)return 'Noch nicht ausreichend geübt.';
 const r=s.recent,accuracy=r.filter(x=>x.ok).length/r.length,times=r.filter(x=>x.ms!==null).map(x=>x.ms),mean=times.reduce((a,b)=>a+b,0)/(times.length||1);
 if(accuracy<C.secureAccuracy)return 'Noch unsicher';
 if(s.n>=C.automatedObservations&&accuracy>=C.automatedAccuracy&&times.length>=C.minObservations&&mean<=C.automatedColumnMs)return 'Automatisiert';
 if(times.length>=C.minObservations&&mean>C.slowColumnMs)return 'Richtig, aber noch langsam';return 'Sicher';
}
export function observe(map,key,ok,ms,date=dayKey()){
 const s=map[key]||={n:0,correct:0,recent:[],lastDate:date};s.n++;s.correct+=+ok;s.lastDate=date;s.recent.push({ok,ms});s.recent=s.recent.slice(-C.recent);
}
export function recordLearning(state,task,work,date=dayKey()){
 if(work.legacyAssisted)return;
 for(const col of task.columns){const e=work.evidence[col.place];if(!e)throw Error('Fehlender Rechenschritt');
  const op=task.operation==='+'?'add':'sub',keys=[op,'place',`digits${task.columns.length}`];
  if(!task.transitions)keys.push(op==='add'?'addPlain':'subPlain');
  if(col.helperRequired)keys.push(op==='add'?'carry':'helper');if(col.incoming)keys.push('incoming');if(task.transitions>1)keys.push('multiple');if(col.zeroTransition)keys.push('zero');
  for(const key of keys){let ok=e.errors.length===0;if(key==='place')ok=!e.errors.some(x=>/COLUMN|PLACE_VALUE/.test(x));else if(['carry','helper'].includes(key))ok=!e.errors.some(x=>/CARRY|HELPER/.test(x));observe(state.skills,key,ok,work.interrupted?null:e.ms,date);}
  observe(state.facts,`${op}:${col.top}:${col.bottom}:${col.incoming}`,e.errors.length===0,work.interrupted?null:e.ms,date);
 }
 for(const type of new Set(work.errors.map(e=>e.type)))state.errors.push({type,family:task.family,place:work.errors.find(e=>e.type===type).place,date});state.errors=state.errors.slice(-C.errorLimit);
}
export function familySkills(f){return {1:['add','addPlain','place'],2:['sub','subPlain','place'],3:['carry','incoming'],4:['helper','incoming'],5:['carry','incoming','multiple'],6:['helper','incoming','multiple'],7:['zero','multiple']}[f];}
export function focusFrom(rows){const scores={};for(const r of rows){scores[r.family]=(scores[r.family]||0)+[...new Set(r.errors)].reduce((sum,e)=>sum+ERROR_PRIORITY[/PLACE_VALUE|WRONG_COLUMN/.test(e)?'place':/ZERO/.test(e)?'zero':/BASIC/.test(e)?'basic':'procedure'],0)+(r.normalizedMs>C.slowColumnMs?1:0);}return Object.entries(scores).sort((a,b)=>b[1]-a[1]).filter(x=>x[1]>0).map(x=>+x[0]);}
export function chooseFamily(state,level,focus=[],rng=Math.random,today=dayKey()){
 const recent=state.history.slice(-C.maxSameFamily),allowed=LEVELS[level].families;
 let pool=allowed.filter(f=>allowed.length===1||recent.length<C.maxSameFamily||!recent.every(r=>r.family===f));
 const weights=pool.map(f=>{let weight=1+(focus.includes(f)?C.focusWeight:0);for(const k of familySkills(f)){const s=state.skills[k];if(!s){weight+=C.weakWeight;continue;}const accuracy=s.recent.filter(x=>x.ok).length/s.recent.length;weight+=(1-accuracy)*C.weakWeight;if(mastery(s)==='Richtig, aber noch langsam')weight+=1;weight+=Math.min(1,Math.max(0,ordinal(today)-ordinal(s.lastDate))/C.spacingDays)*C.spacingWeight;}weight+=Math.min(C.weakWeight,state.errors.slice(-24).filter(e=>e.family===f).length);return weight;});
 let n=rng()*weights.reduce((a,b)=>a+b,0);for(let i=0;i<pool.length;i++){n-=weights[i];if(n<0)return pool[i];}return pool.at(-1);
}
