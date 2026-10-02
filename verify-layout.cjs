const path = require('node:path');
const fs=require('fs'),vm=require('vm'),assert=require('assert');const {Canvas}=require('skia-canvas');
function setup(w=980,h=650){const cv=new Canvas(w,h),els=new Map(),events=new Map();function el(id){if(!els.has(id))els.set(id,{id,textContent:'',innerHTML:'',style:{},open:false,classList:{add(){},remove(){},toggle(){}},addEventListener(name,f){events.set(id+':'+name,f)},querySelector(){return el(id+':child')},getBoundingClientRect(){return {left:0,top:0,width:w,height:h}},focus(){},setPointerCapture(){},showModal(){this.open=true},close(){this.open=false},parentElement:{getBoundingClientRect(){return {width:w,height:h}}},getContext:()=>cv.getContext('2d')});return els.get(id)}const can=el('game');Object.defineProperty(can,'width',{set:v=>cv.width=v,get:()=>cv.width});Object.defineProperty(can,'height',{set:v=>cv.height=v,get:()=>cv.height});const storage=new Map();let frame;const context={console,document:{getElementById:el,addEventListener(){},activeElement:{tagName:'CANVAS'}},window:{addEventListener(){}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},performance:{now:()=>0},devicePixelRatio:1,matchMedia:()=>({matches:false}),AbortController,setTimeout:()=>1,clearTimeout(){},requestAnimationFrame:f=>{frame=f}};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname, "engine.js"),'utf8'),context);const run=s=>vm.runInContext(s,context);return {run,cv,events,els,storage}}
function advance(g,t){g.run(`for(let i=0;i<${Math.ceil(t*60)};i++)update(1/60)`)}
function travel(g,id){g.run(`planPath(player,stations.find(s=>s.id==='${id}'))`);let ticks=0;while(g.run('player.path.length')&&ticks<3600){g.run(`(()=>{const p=player.path[0],dx=p.x-player.x,dz=p.z-player.z;if(Math.hypot(dx,dz)<.16){player.path.shift();drag=null;}else drag={startX:0,startY:0,x:(dx-dz)*100,y:(dx+dz)*50};update(1/60)})()`);ticks++}g.run('release()');assert(ticks<3600,'Path stuck '+id);return ticks/60}
const g=setup();
assert.equal(g.run("stations.find(s=>s.id==='proc').x-stations.find(s=>s.id==='source').x"),3.9*1.4);
assert.equal(g.run("recommendedStation().id"),'source');
assert.equal(g.run("stationAvailable(stations.find(s=>s.id==='gear'))"),false);
g.run("player.cargo='raw';player.count=2");assert.equal(g.run("recommendedStation().id"),'proc');
g.run("player.cargo='part'");assert.equal(g.run("recommendedStation().id"),'pack');
g.run("player.cargo='product'");assert.equal(g.run("recommendedStation().id"),'delivery');
assert.equal(g.run("blocked(stations.find(s=>s.id==='proc2').x,stations.find(s=>s.id==='proc2').z)"),false);
g.run('S.stage=5');assert.equal(g.run("blocked(stations.find(s=>s.id==='proc2').x,stations.find(s=>s.id==='proc2').z)"),true);
g.run('S.stage=10;player.premium=false');assert.equal(g.run('recommendedStation().id'),'paint');
g.run('player.premium=true;S.stage=20');assert.equal(g.run('recommendedStation().id'),'export');
g.run('player.moving=true;player.walkPhase=.5');const p1=g.run('gait(player).swing');g.run('player.walkPhase=2');assert.notEqual(p1,g.run('gait(player).swing'));g.run('player.moving=false');assert.equal(g.run('gait(player).swing'),0);
g.run("S.money=500;save()");const saved=JSON.parse(g.storage.get('shift-walk-factory-v2'));assert.equal(saved.layout,3);assert.equal(saved.state.money,500);
console.log('PASS wider station spacing, cargo-aware destinations, unavailable equipment, hidden-equipment collisions, walking gait and versioned saves');
