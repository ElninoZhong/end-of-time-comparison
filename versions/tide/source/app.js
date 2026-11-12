import {makeWorld} from './world.js';
const $=id=>document.getElementById(id),canvas=$('sea');
const chapters=[
 {name:'余晖',en:'Afterglow',verse:'潮声还在，岸上的钟已经停了。\n触碰信标上的光，听它最后一次报时。',memory:'「潮汐会记住每一个归来的人。」'},
 {name:'逆流',en:'Against the Current',verse:'有一束光正沿着昨天离去。\n让时间倒流，再接住它。',memory:'「我们在昨天，给明天留了一盏灯。」'},
 {name:'初光',en:'First Light',verse:'最后一个瞬间，比浪花更短。\n凝住时间，拾起海面上的第一束光。',memory:'「倘若有人记得，星光就有来处。」'}
];
const found=new Set(),buttons=[...document.querySelectorAll('[data-i]')];
let stage=0,intro=true,ending=false,paused=false,direction=1,time=0,clean=false,sound=false,ctx,bus,bed,noiseGain;
let world,guideReturn=null,timer,flash=0;
function say(s){$('hint').textContent=s;clearTimeout(timer);timer=setTimeout(()=>$('hint').textContent='',3500)}
function audioInit(){
 ctx=new (window.AudioContext||window.webkitAudioContext)();bus=ctx.createGain();bus.gain.value=0;bus.connect(ctx.destination);
 bed=ctx.createBiquadFilter();bed.type='lowpass';bed.frequency.value=320;bed.connect(bus);
 [55,82.4069,110.15,164.81].forEach((freq,i)=>{let osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=i<2?'sine':'triangle';osc.frequency.value=freq;gain.gain.value=[.12,.05,.024,.012][i];osc.connect(gain).connect(bed);osc.start()});
 const buf=ctx.createBuffer(1,ctx.sampleRate*6,ctx.sampleRate),data=buf.getChannelData(0);let last=0;for(let i=0;i<data.length;i++){last=(last+.026*(Math.random()*2-1))/1.025;data[i]=last;}
 let surf=ctx.createBufferSource();surf.buffer=buf;surf.loop=true;noiseGain=ctx.createGain();noiseGain.gain.value=.12;surf.connect(noiseGain).connect(bus);surf.start();
}
function chime(root){if(!sound||!ctx)return;[1,1.5,2.01].forEach((mul,i)=>{const o=ctx.createOscillator(),g=ctx.createGain(),start=ctx.currentTime+i*.12;o.frequency.value=root*mul;g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(.10/(i+1),start+.045);g.gain.exponentialRampToValueAtTime(.0001,start+2.8);o.connect(g).connect(bus);o.start(start);o.stop(start+3);o.onended=()=>{o.disconnect();g.disconnect()}})}
$('sound').onclick=async()=>{try{if(!ctx)audioInit();if(ctx.state!=='running')await ctx.resume();sound=!sound;bus.gain.setTargetAtTime(sound?.57:0,ctx.currentTime,.14);$('sound').setAttribute('aria-pressed',sound);$('sound').setAttribute('aria-label',sound?'关闭声音':'开启声音');$('wave').setAttribute('d',sound?'M12 7q3 3 0 6m2-9q6 6 0 12':'m13 8 4 4m0-4-4 4');if(sound)chime(220);}catch{say('浏览器未能开启声音，可继续无声航行。')}};
function syncTime(){for(let [id,value,label] of [['pause',paused,paused?'▷ 继续':'Ⅱ 凝时'],['reverse',direction<0,direction<0?'→ 顺流':'↶ 倒流']]){$(id).setAttribute('aria-pressed',value);$(id).textContent=label;}}
function setPause(){paused=!paused;syncTime();if(!intro&&!ending)say(paused?'潮汐已凝住':'潮汐重新流动')}
function setDirection(){direction*=-1;paused=false;syncTime();if(!intro&&!ending)say(direction<0?'时间正在倒流':'时间正在向前')}
$('pause').onclick=setPause;$('reverse').onclick=setDirection;
function drawText(){const c=chapters[stage],got=found.has(stage);
 $('story').classList.toggle('chapter',!intro);$('hud').hidden=intro||ending;
 $('tag').textContent=intro?'终潮航行日志':ending?'终潮航行日志 · 3 / 3':('航行日志  0'+(stage+1)+' / 03');
 $('title').textContent=intro?'时间的尽头':ending?'潮声再起':c.name;
 $('en').textContent=intro?'The End of Time':ending?'Beyond the Last Tide':c.en;
 $('verse').textContent=intro?'最后一颗恒星沉入潮汐。\n海上，只剩三段尚未消散的回声。':ending?'三段残响，汇成了第一声潮汐。\n在时间的尽头，海又一次醒来。':got?c.memory:c.verse;
 $('action').firstElementChild.textContent=intro?'驶入余晖':ending?'再航行一次':got?(found.size===3?'聆听终章':'驶向'+chapters[next()].name):'定位信标';
 buttons.forEach((b,i)=>{b.classList.toggle('active',i===stage);b.classList.toggle('done',found.has(i));b.setAttribute('aria-current',i===stage?'step':'false')});
}
function next(){for(let n=1;n<=3;n++){let j=(stage+n)%3;if(!found.has(j))return j}return stage}
function go(i){stage=i;intro=false;ending=false;direction=1;paused=false;syncTime();world.select(i,false);drawText();chime(165*2**(i/6));}
function collect(){if(intro||ending||found.has(stage))return;
 if(stage===1&&(direction>0||paused)){say('先让时间倒流，再触碰这段残响。');return}
 if(stage===2&&!paused){say('先凝住时间，再触碰这段残响。');return}
 found.add(stage);flash=1;chime([261.63,329.63,392][stage]);$('target').hidden=true;drawText();say('已收回残响 · '+found.size+' / 3');
}
$('target').onclick=collect;
$('action').onclick=()=>{if(intro){go(0);return}if(ending){found.clear();time=0;go(0);return}if(!found.has(stage)){world.reset();say('寻找海面上的菱形标记');return}
 if(found.size===3){ending=true;stage=2;world.select(2,true);paused=false;direction=1;syncTime();drawText();flash=1;chime(523.25)}else go(next())};
buttons.forEach(b=>b.onclick=()=>go(Number(b.dataset.i)));
function pure(value){clean=value;document.body.classList.toggle('clean',value);$('restore').hidden=!value;(value?$('restore'):$('clean')).focus({preventScroll:true})}
$('clean').onclick=()=>pure(true);$('restore').onclick=()=>pure(false);
function guide(open){if(open)guideReturn=document.activeElement;$('panel').hidden=!open;(open?$('close'):guideReturn||$('help')).focus({preventScroll:true})}
$('help').onclick=()=>guide(true);$('close').onclick=()=>guide(false);$('panel').onclick=e=>{if(e.target===$('panel'))guide(false)};
window.addEventListener('keydown',e=>{if(e.altKey||e.metaKey||e.ctrlKey)return;let k=e.key.toLowerCase();
 if(!$('panel').hidden){if(k==='escape')guide(false);if(k==='tab'){e.preventDefault();$('close').focus()}return}
 if(k==='h'||(k==='escape'&&clean)){pure(!clean);return}
 if(k==='?'&&!clean){guide(true);return}if(!world)return;
 if(k===' '&&e.target.tagName==='BUTTON')return;
 if(k===' '){e.preventDefault();setPause()}else if(k==='r')setDirection();else if(k==='home'){e.preventDefault();world.reset()}else if(k.startsWith('arrow')){e.preventDefault();world.rotate(k==='arrowright'?22:k==='arrowleft'?-22:0,k==='arrowdown'?-15:k==='arrowup'?15:0)}else if(k==='+'||k==='=')world.scale(.90);else if(k==='-')world.scale(1.1);
});
const touches=new Map();let start=null,moved=false;
canvas.onpointerdown=e=>{canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);touches.set(e.pointerId,[e.clientX,e.clientY]);if(touches.size===1){start=[e.clientX,e.clientY];moved=false}else moved=true};
function separation(){let [a,b]=[...touches.values()];return Math.hypot(a[0]-b[0],a[1]-b[1])}
canvas.onpointermove=e=>{let p=touches.get(e.pointerId);if(!p||!world)return;let old=touches.size===2?separation():0;touches.set(e.pointerId,[e.clientX,e.clientY]);if(touches.size===2){let d=separation();if(old&&d)world.scale(old/d)}else if(touches.size===1){world.rotate(e.clientX-p[0],e.clientY-p[1]);if(start&&Math.hypot(e.clientX-start[0],e.clientY-start[1])>4)moved=true}};
canvas.onpointerup=e=>{if(!moved&&!clean&&world?.pick(e.clientX,e.clientY))collect();touches.delete(e.pointerId)};
canvas.onpointercancel=canvas.onlostpointercapture=e=>touches.delete(e.pointerId);
canvas.addEventListener('wheel',e=>{e.preventDefault();world?.scale(Math.exp(Math.max(-200,Math.min(200,e.deltaY*(e.deltaMode===1?15:1)))*.0012))},{passive:false});
const reduce=matchMedia('(prefers-reduced-motion: reduce)');let prev=performance.now(),frames=0;
function tick(now){const dt=Math.min(Math.max((now-prev)/1000,0),.1);prev=now;if(!paused)time+=dt*direction*(reduce.matches?.26:1);
 const p=world.frame(time,dt,found,reduce.matches);
 const target=$('target');target.hidden=intro||ending||found.has(stage)||!p.visible;target.style.left=p.x+'px';target.style.top=p.y+'px';
 if(flash>0){flash=Math.max(0,flash-dt*.7);canvas.style.filter='brightness('+(1+flash*.28)+')'}else if(canvas.style.filter)canvas.style.filter='';
 if(frames++%6===0){let s=Math.floor(Math.abs(time));$('clock').textContent='T '+(time<0?'−':'+')+' '+String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');if(sound)noiseGain.gain.setTargetAtTime(.17+.06*Math.sin(time*.44),ctx.currentTime,.2)}
 requestAnimationFrame(tick);
}
try{world=makeWorld(canvas);world.select(0,true);drawText();world.resize();addEventListener('resize',world.resize);requestAnimationFrame(tick);}catch(e){$('err').hidden=false;$('err').textContent='海面未能显现。请在支持 WebGL 2 的浏览器中开启图形加速，然后重新载入。';console.error(e)}
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();$('err').hidden=false;$('err').textContent='图形连接暂时中断，正在等待浏览器恢复。'});canvas.addEventListener('webglcontextrestored',()=>location.reload());
