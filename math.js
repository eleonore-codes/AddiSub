import {C,LEVELS} from './config.js';
export const digit=(n,p)=>Math.floor(n/10**p)%10;
export const width=n=>String(n).length;
export function model(a,b,operation='+',level=1,family=level){
 if(![a,b].every(n=>Number.isSafeInteger(n)&&n>=0&&n<=1000000)||!['+','-'].includes(operation))throw Error('Ungültige Aufgabe');
 const result=operation==='+'?a+b:a-b;if(result<0||result>1000000)throw Error('Außerhalb des Zahlenraums');
 const operandWidth=Math.max(width(a),width(b)),count=Math.max(operandWidth,width(result));let incoming=0;
 const columns=[];
 for(let p=0;p<count;p++){
  const top=digit(a,p),bottom=digit(b,p),local=operation==='+'?top+bottom+incoming:top-bottom-incoming;
  const outgoing=+(operation==='+'?local>=10:local<0);
  const expected=operation==='+'?local%10:local+10*outgoing;
  // The carry beyond the highest operand is entered directly as a new result digit.
  const helperRequired=!!outgoing&&p<operandWidth-1;
  columns.push({place:p,top,bottom,incoming,local,expected,outgoing,helperRequired,helperPlace:helperRequired?p+1:null,zeroTransition:!!outgoing&&(top===0||bottom===0)});incoming=outgoing;
 }
 const transitions=columns.reduce((s,c)=>s+c.outgoing,0),zeroTransition=columns.some(c=>c.zeroTransition);
 const skills=[operation==='+'?'add':'sub','place',`digits${count}`];
 skills.push(transitions?(operation==='+'?'carry':'helper'):(operation==='+'?'addPlain':'subPlain'));
 if(columns.some(c=>c.incoming))skills.push('incoming');if(transitions>1)skills.push('multiple');if(zeroTransition)skills.push('zero');
 const task={a,b,operation,result,operandWidth,columns,transitions,zeroTransition,level,family,skills,difficulty:{columns:count,transitions,zeros:zeroTransition,magnitude:Math.max(a,b,result)}};
 if(!validateTask(task))throw Error('Ungültiges Stellenmodell');return task;
}
export function validateTask(t){
 if(!t||!['+','-'].includes(t.operation)||![t.a,t.b,t.result].every(n=>Number.isSafeInteger(n)&&n>=0&&n<=1000000)||!Array.isArray(t.columns)||t.operandWidth!==Math.max(width(t.a),width(t.b))||t.columns.length!==Math.max(t.operandWidth,width(t.result)))return false;
 if(t.result!==(t.operation==='+'?t.a+t.b:t.a-t.b)||t.result<0)return false;
 let reconstructed=0,carry=0;
 for(const [p,c] of t.columns.entries()){
  const top=digit(t.a,p),bottom=digit(t.b,p);
  const equation=t.operation==='+'?top+bottom+carry:top-bottom-carry;
  const out=t.operation==='+'?Math.floor(equation/10):+(equation<0);
  const expected=t.operation==='+'?equation-out*10:equation+out*10;
  if(c.place!==p||c.top!==top||c.bottom!==bottom||c.incoming!==carry||c.local!==equation||c.expected!==expected||c.outgoing!==out||c.helperRequired!==(!!out&&p<t.operandWidth-1)||c.helperPlace!==(out&&p<t.operandWidth-1?p+1:null))return false;
  reconstructed+=expected*10**p;carry=out;
 }return reconstructed===t.result&&carry===0&&t.transitions===t.columns.reduce((n,c)=>n+c.outgoing,0)&&t.zeroTransition===t.columns.some(c=>!!c.outgoing&&(c.top===0||c.bottom===0));
}
export const ERRORS={BASIC_ADDITION_ERROR:'Additionsschritte prüfen',BASIC_SUBTRACTION_ERROR:'Subtraktionsschritte prüfen',PLACE_VALUE_ERROR:'Stelle der Ziffer prüfen',CARRY_NOT_RECOGNIZED:'Übergänge erkennen',CARRY_MISSING:'Übertrag eintragen',CARRY_WRONG_COLUMN:'Stelle des Übertrags prüfen',UNNECESSARY_CARRY:'Übertrag nur bei Bedarf',PREVIOUS_CARRY_NOT_USED:'Vorherigen Übertrag mitrechnen',SUBTRACTION_HELPER_NOT_RECOGNIZED:'Übergänge beim Abziehen erkennen',SUBTRACTION_HELPER_MISSING:'Hilfs-1 eintragen',SUBTRACTION_HELPER_WRONG_COLUMN:'Stelle der Hilfs-1 prüfen',SUBTRACTION_HELPER_NOT_USED:'Vorherige Hilfs-1 mitrechnen',ZERO_TRANSITION_ERROR:'Übergänge über Null üben',FINAL_COLUMN_ERROR:'Letzte Stelle prüfen'};
export function checkColumn(t,p,results,helpers){
 const c=t.columns[p],errors=[],add=t.operation==='+';if(!c)throw Error('Unbekannte Stelle');
 const resultOK=results[p]===c.expected;
 if(!resultOK){
  const without=add?(c.top+c.bottom)%10:(c.top-c.bottom+10)%10;
  errors.push(c.incoming&&results[p]===without?(add?'PREVIOUS_CARRY_NOT_USED':'SUBTRACTION_HELPER_NOT_USED'):c.zeroTransition?'ZERO_TRANSITION_ERROR':p>=t.operandWidth?'FINAL_COLUMN_ERROR':add?'BASIC_ADDITION_ERROR':'BASIC_SUBTRACTION_ERROR');
 }
 const editable=Object.entries(helpers).filter(([q,v])=>+q>p&&v!==null);
 const wrong=editable.some(([q])=>+q!==p+1);
 if(wrong)errors.push(add?'CARRY_WRONG_COLUMN':'SUBTRACTION_HELPER_WRONG_COLUMN');
 const h=helpers[p+1]??null;
 if(c.helperRequired&&h!==1){errors.push(add?'CARRY_MISSING':'SUBTRACTION_HELPER_MISSING');if(!resultOK)errors.push(add?'CARRY_NOT_RECOGNIZED':'SUBTRACTION_HELPER_NOT_RECOGNIZED');}
 if(!c.helperRequired&&h!==null)errors.push('UNNECESSARY_CARRY');
 return {ok:errors.length===0,resultOK,helperOK:!wrong&&(c.helperRequired?h===1:h===null),errors};
}
export function fits(t,family){return family===1?t.operation==='+'&&t.transitions===0:family===2?t.operation==='-'&&t.transitions===0:family===3?t.operation==='+'&&t.transitions===1&&t.columns.some(c=>c.helperRequired):family===4?t.operation==='-'&&t.transitions===1:family===5?t.operation==='+'&&t.transitions>=2:family===6?t.operation==='-'&&t.transitions>=2:family===7?t.zeroTransition&&t.transitions>=2:false;}
export function generate(level,{family=LEVELS[level]?.families[0],growth=0,rng=Math.random,exclude=[]}={}){
 const rule=LEVELS[level];if(!rule||!rule.families.includes(family))throw Error('Ungültiges Lernziel');
 const digits=rule.digits[Math.min(Math.floor(growth/C.growAfter),rule.digits.length-1)],max=rule.max||10**digits-1;
 for(let trial=0;trial<C.maxGenerationAttempts;trial++){
  let a,b,operation=family===7?(rng()<.5?'+':'-'):[2,4,6].includes(family)?'-':'+';
  const cap=Math.min(max,10**digits-1);
  a=1+Math.floor(rng()*cap);b=1+Math.floor(rng()*cap);
  // Digitwise construction makes no-transition constraints reliable even at six places.
  if(family===1||family===2){a=0;b=0;for(let p=0;p<digits;p++){const x=Math.floor(rng()*10),y=Math.floor(rng()*(family===1?10-x:x+1));a+=x*10**p;b+=y*10**p;}}
  if(rule.max&&growth>=C.growAfter&&rng()<.1){if(operation==='-')a=max;else a=max-b;}
  if(operation==='-'&&b>a)[a,b]=[b,a];
  if(a>max||b>max||a+b>max&&operation==='+'||a===0||b===0||Math.max(width(a),width(b))<Math.min(digits,6))continue;
  const t=model(a,b,operation,level,family);if(fits(t,family)&&!exclude.includes(`${a}${operation}${b}`))return t;
 }throw Error('Keine passende Aufgabe gefunden');
}
