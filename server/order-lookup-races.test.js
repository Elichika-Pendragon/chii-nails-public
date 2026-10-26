import test from 'node:test';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {normalizeOrderCode,validOrderCode,orderSummary} from '../src/order-code.js';
import {estimatePayment} from '../src/order-payment.js';
import {calculateServices,defaultPrices} from '../src/pricing.js';
const code=readFileSync(new URL('../src/scripts/order-lookup.js',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'');
const flush=()=>new Promise(r=>setTimeout(r,0));
function node(){return {value:'',hidden:false,textContent:'',listeners:{},addEventListener(k,fn){this.listeners[k]=fn;},dispatchEvent(){},closest(){return {disabled:false};},focus(){}};}
function fixture(){
 const input=node(),button=node(),status=node(),detail=node(),clear=node(),total=node(),deposit=node(),mode=node(),form=node();input.value='ABC23';mode.value='deposit';
 const root={querySelector:s=>({'[data-order-input]':input,button,'[data-order-status]':status,'[data-order-detail]':detail})[s]};
 const window={listeners:{},addEventListener(k,fn){this.listeners[k]=fn;}};
 const document={querySelector:s=>s==='[data-order-lookup]'?root:clear,getElementById:s=>({'booking-agreedPrice':total,'booking-deposit':deposit,'booking-paymentMode':mode,'booking-form':form})[s]};
 let release;const held=new Promise(resolve=>release=resolve);
 const order={code:'ABC23',revision:1,estimate:calculateServices(defaultPrices,[{id:'nail-art-0',quantity:1}],{kit:false,glue:false}),expiresAt:Date.now()+86400000};
 vm.runInNewContext(code,{normalizeOrderCode,validOrderCode,orderSummary,estimatePayment,document,window,sessionStorage:{getItem(){return null;},removeItem(){}},orderSession:async()=>({nonce:'synthetic'}),orderApi:async()=>{await held;return order;},Event,setTimeout,clearTimeout});
 return {input,button,status,detail,clear,total,deposit,window,release};
}
for(const scenario of ['clear-form-during-lookup','depart-during-lookup'])test(scenario+' ignores late response across 100 cycles',async()=>{
 for(let i=0;i<100;i++){
 const f=fixture(),pending=f.button.listeners.click();await flush();
 if(scenario==='clear-form-during-lookup')f.clear.listeners.click();else f.window.listeners.pagehide();
 f.release();await pending;
 assert.equal(f.detail.hidden,true);assert.equal(f.total.value,'');assert.equal(f.input.value,scenario==='clear-form-during-lookup'?'':'ABC23');assert.equal(f.button.disabled,false);
 }
});
