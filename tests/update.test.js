import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
test('waiting update activates only after explicit update message',async()=>{
 const handlers={};let activated=0;
 const source=await readFile(new URL('../service-worker.js',import.meta.url),'utf8');
 vm.runInNewContext(source,{self:{addEventListener:(name,fn)=>handlers[name]=fn,skipWaiting:async()=>{activated++;}}});
 assert.equal(activated,0);handlers.message({data:{type:'unrelated'}});assert.equal(activated,0);
 let pending;handlers.message({data:{type:'ACTIVATE_UPDATE'},waitUntil:p=>pending=p});await pending;assert.equal(activated,1);
 const page=await readFile(new URL('../aktualisieren.html',import.meta.url),'utf8');
 assert.doesNotMatch(page,/localStorage|sessionStorage|\.unregister\(|caches\.delete/);
 assert.match(page,/updateViaCache:'none'/);assert.match(page,/ACTIVATE_UPDATE/);
});
