export const C = Object.freeze({schemaVersion:1,generalMs:180000,focusMs:120000,successThreshold:.90,minTasks:{a:3,b:2},minColumns:{a:8,b:6},recent:24,minObservations:12,secureAccuracy:.90,automatedObservations:36,automatedAccuracy:.96,slowColumnMs:18000,automatedColumnMs:10000,unlockTasks:12,unlockColumns:30,unlockSuccesses:2,unlockAccuracy:.85,growAfter:8,historyLimit:400,errorLimit:300,weakWeight:4,spacingWeight:2,focusWeight:7,spacingDays:7,maxSameFamily:2,maxGenerationAttempts:20000});
export const PLACES=['E','Z','H','T','ZT','HT','M'];
export const NAMES=['Einer','Zehner','Hunderter','Tausender','Zehntausender','Hunderttausender','Million'];
export const LEVELS=[null,
 {label:'Addieren ohne Übergang',families:[1],digits:[2,3,4]},
 {label:'Subtrahieren ohne Übergang',families:[2],digits:[2,3,4]},
 {label:'Addieren mit Übergang',families:[3],digits:[2,3,4]},
 {label:'Subtrahieren mit Hilfs-1',families:[4],digits:[2,3,4]},
 {label:'Mehrere Übergänge +',families:[5],digits:[3,4]},
 {label:'Mehrere Übergänge −',families:[6],digits:[3,4]},
 {label:'Rechnen mit Nullen',families:[7],digits:[3,4,5]},
 {label:'Gemischtes Training',families:[1,2,3,4,5,6,7],digits:[3,4,5]},
 {label:'Bis 100.000',families:[1,2,3,4,5,6,7],digits:[4,5],max:100000},
 {label:'Bis 1.000.000',families:[1,2,3,4,5,6,7],digits:[5,6],max:1000000}];
export const SKILLS={add:'Addieren',sub:'Subtrahieren',addPlain:'Addition ohne Übergang',subPlain:'Subtraktion ohne Übergang',carry:'Überträge bei Addition',helper:'Hilfs-1 bei Subtraktion',incoming:'Vorherige Hilfs-1 nutzen',multiple:'Mehrere Übergänge',zero:'Rechnen über Nullstellen',place:'Stellenwerte',digits2:'Zweistellige Zahlen',digits3:'Dreistellige Zahlen',digits4:'Vierstellige Zahlen',digits5:'Fünfstellige Zahlen',digits6:'Sechsstellige Zahlen',digits7:'Bis zur Million'};
export const ERROR_PRIORITY={basic:2,procedure:4,place:5,zero:4};
