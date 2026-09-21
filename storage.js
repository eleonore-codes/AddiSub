import {C} from './config.js';
import {validateTask,gridWidth} from './math.js';
import {prepareWork} from './session.js';
export const AVAILABLE_LEVELS=Array.from({length:10},(_,i)=>i+1);
export const KEY='addisub-learning-v1';
export const dayKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const ordinal=s=>{const [y,m,d]=s.split('-').map(Number);return Date.UTC(y,m-1,d)/86400000;};
export const fresh=()=>({schemaVersion:C.schemaVersion,revision:0,skills:{},facts:{},history:[],errors:[],daily:{},session:null,pausedSessions:{},unlockedLevels:[...AVAILABLE_LEVELS],levelProgress:{},successNumber:0,currentStreak:0,longestStreak:0,lastQualifyingSuccessDate:null,learningDays:[],awarded:{},cards:[],selectedLevel:1});
export function validate(s){if(!s||s.schemaVersion!==C.schemaVersion)throw Error('Unbekannte Datenversion');for(const k of ['skills','facts','daily','levelProgress','awarded'])if(!s[k]||typeof s[k]!=='object'||Array.isArray(s[k]))throw Error('Beschädigte Daten');for(const k of ['history','errors','unlockedLevels','learningDays','cards'])if(!Array.isArray(s[k]))throw Error('Beschädigte Listen');for(const k of ['revision','successNumber','currentStreak','longestStreak'])if(!Number.isSafeInteger(s[k])||s[k]<0)throw Error('Beschädigte Zähler');if(!s.unlockedLevels.includes(1)||s.unlockedLevels.some(n=>!Number.isInteger(n)||n<1||n>10))throw Error('Beschädigte Stufen');if(s.session&&(!['a','b','between','done'].includes(s.session.stage)||!Number.isFinite(s.session.elapsed)||s.session.elapsed<0||!s.session.rows||!Array.isArray(s.session.rows.a)||!Array.isArray(s.session.rows.b)))throw Error('Beschädigtes Training');return s;}
export function load(storage){const raw=storage.getItem(KEY);if(!raw)return fresh();const s=validate(JSON.parse(raw));
 for(const skill of [...Object.values(s.skills),...Object.values(s.facts)])if(!Number.isInteger(skill.n)||!Number.isInteger(skill.correct)||skill.n<0||skill.correct>skill.n||!Array.isArray(skill.recent)||skill.recent.some(r=>typeof r.ok!=='boolean'||r.ms!==null&&(!Number.isFinite(r.ms)||r.ms<0)))throw Error('Beschädigte Lernbeobachtung');
 if(!Number.isInteger(s.selectedLevel)||s.selectedLevel<1||s.selectedLevel>10)throw Error('Ungültige Auswahl');
 s.unlockedLevels=[...AVAILABLE_LEVELS];
 s.pausedSessions||={};
 if(typeof s.pausedSessions!=='object'||Array.isArray(s.pausedSessions))throw Error('Beschädigte Pausen');
 for(const session of [s.session,...Object.values(s.pausedSessions)]){
  if(!session)continue;
  if(!Number.isInteger(session.level)||session.level<1||session.level>10||!['a','b','between','done'].includes(session.stage)||!Number.isFinite(session.elapsed)||session.elapsed<0)throw Error('Beschädigte Sitzung');
  const w=session.active;if(!w)continue;
  if(!validateTask(w.task)||!Number.isInteger(w.p)||w.p<0||w.p>=gridWidth(w.task)||!w.results||!w.helpers||!Array.isArray(w.errors)||!Array.isArray(w.stepErrors)||!Array.isArray(w.evidence)||!w.selected||!['helper','result'].includes(w.selected.kind))throw Error('Beschädigte Rechnung');
  for(const map of [w.results,w.helpers])for(const [p,n] of Object.entries(map))if(!/^[0-6]$/.test(p)||n!==null&&(!Number.isInteger(n)||n<0||n>9))throw Error('Ungültige Ziffer');
  for(const key of ['totalMs','columnMs'])if(!Number.isFinite(w[key])||w[key]<0)throw Error('Ungültige Zeit');
  prepareWork(w);
  if(!Number.isInteger(w.submissions)||w.submissions<0||!Number.isInteger(w.corrections)||w.corrections<0||!w.columnTimes)throw Error('Beschädigte Prüfversuche');
  if(w.firstSubmission&&(!Array.isArray(w.firstSubmission.errors)||!w.firstSubmission.fields||typeof w.firstSubmission.ok!=='boolean'||!w.firstSubmission.results||!w.firstSubmission.helpers))throw Error('Beschädigter erster Prüfversuch');
  if(!w.firstSubmission&&w.submissions!==0||w.resolved&&!w.validation?.ok)throw Error('Ungültiger Prüfstatus');
 }
 return s;}
export function save(s,storage){s.revision++;storage.setItem(KEY,JSON.stringify(s));}
export function streak(s,today=dayKey()){return s.lastQualifyingSuccessDate&&ordinal(today)-ordinal(s.lastQualifyingSuccessDate)<=1?s.currentStreak:0;}
