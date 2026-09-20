import {C} from './config.js';
import {ordinal,dayKey} from './storage.js';
export function summarize(rows){const total=rows.length,columns=rows.reduce((s,r)=>s+r.columns,0),helpers=rows.reduce((s,r)=>s+r.helpers,0),correct=rows.filter(r=>r.ok).length,correctColumns=rows.reduce((s,r)=>s+r.correctColumns,0),correctHelpers=rows.reduce((s,r)=>s+r.correctHelpers,0);
 const parts=[[.4,total?correct/total:0],[.4,columns?correctColumns/columns:0]];if(helpers)parts.push([.2,correctHelpers/helpers]);const score=parts.reduce((s,[w,v])=>s+w*v,0)/parts.reduce((s,[w])=>s+w,0);return {total,columns,helpers,correct,correctColumns,correctHelpers,score,resolved:rows.every(r=>r.resolved)};}
export const qualifies=r=>r.resolved&&r.total>=C.minTasks[r.phase]&&r.columns>=C.minColumns[r.phase]&&r.score>=C.successThreshold;
export function comparePhases(a,b){const groups=new Set(a.map(r=>`${r.family}:${r.columns}`)),overlap=new Set(b.map(r=>`${r.family}:${r.columns}`).filter(k=>groups.has(k)));const aa=a.filter(r=>overlap.has(`${r.family}:${r.columns}`)),bb=b.filter(r=>overlap.has(`${r.family}:${r.columns}`));if(aa.length<2||bb.length<2)return null;return {before:summarize(aa).score,after:summarize(bb).score};}
export function award(state,report,date=dayKey()){
 if(state.awarded[report.id])return state.cards.find(c=>c.id===report.id);if(!qualifies(report))return null;
 const gap=state.lastQualifyingSuccessDate?ordinal(date)-ordinal(state.lastQualifyingSuccessDate):null;
 if(gap!==0){state.currentStreak=gap===1?state.currentStreak+1:1;state.lastQualifyingSuccessDate=date;}
 state.longestStreak=Math.max(state.longestStreak,state.currentStreak);state.successNumber++;state.awarded[report.id]=state.successNumber;
 const card={id:report.id,date,number:state.successNumber,streak:state.currentStreak,score:report.score,phase:report.phase,message:'Stark geübt!'};state.cards.push(card);state.levelProgress[report.level].successes++;report.successNumber=card.number;return card;
}
