import * as T from 'three';

const CENTER = new T.Vector3(4.8,10.5,-11), RADIUS=6.1;
const noise = `
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
float fb(vec2 p){float a=.5,s=0.;mat2 m=mat2(.88,.47,-.47,.88);for(int i=0;i<4;i++){s+=a*n2(p);p=m*p*2.06+7.1;a*=.5;}return s;}
`;
const common=`uniform float tm;uniform float dawn;uniform vec3 ice;uniform vec3 ember;uniform vec3 heart;uniform vec3 night; uniform float radius;`+noise;
const worldVert=`varying vec3 pos;varying vec3 nor;varying vec2 tex;void main(){vec4 w=modelMatrix*vec4(position,1.);pos=w.xyz;nor=normalize(mat3(modelMatrix)*normal);tex=uv;gl_Position=projectionMatrix*viewMatrix*w;}`;
function generator(){let a=26017;return ()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296}}
const colors=[
 [[.43,.70,.81],[1,.71,.38],[.018,.03,.065]],
 [[.47,.57,.97],[.91,.51,.82],[.032,.024,.081]],
 [[.72,.81,.84],[1,.68,.43],[.085,.052,.079]]
];
export function makeWorld(canvas){
 const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance',alpha:false});
 const scene=new T.Scene(),cam=new T.PerspectiveCamera(48,1,.08,330);
 const rng=generator(),group=new T.Group(); scene.add(group);
 const v=(x,y,z)=>new T.Vector3(x,y,z);
 const U={dawn:{value:0},tm:{value:0},ice:{value:v(...colors[0][0])},ember:{value:v(...colors[0][1])},night:{value:v(...colors[0][2])},heart:{value:CENTER},radius:{value:RADIUS}};
 const palette=colors.map(row=>row.map(c=>v(...c)));
 const shader=(fragment,opts={})=>new T.ShaderMaterial({uniforms:U,vertexShader:worldVert,fragmentShader:common+'varying vec3 pos; varying vec3 nor; varying vec2 tex;\n'+fragment,...opts});
 function mesh(geo,mat,parent=scene){let m=new T.Mesh(geo,mat);parent.add(m);return m}
 const sky=mesh(new T.SphereGeometry(240,48,28),shader(`
 void main(){vec3 d=normalize(pos-cameraPosition); float h=max(d.y,0.);
 vec2 p=d.xz/(.68+abs(d.y)); float f=fb(p*3.8+d.y*2.);
 float veil=fb(p*6.+f*3.9+vec2(tm*.002,0));float band=exp(-abs(d.y-.28-d.x*.34+(f-.48)*.48)*5.);
 vec3 col=night+ice*(.025+.145*exp(-h*4.5));col+=ice*band*(.05+.38*pow(veil,2.2));
 col+=dawn*ember*.36*exp(-h*5.); col+=vec3(.18,.17,.23)*smoothstep(.48,.8,f)*band;
 vec3 hd=normalize(heart-cameraPosition);float sep=length(d-hd);col+=mix(ember,ice,.78)*exp(-sep*4.6)*.25;
 gl_FragColor=vec4(col,1.);}`,{side:T.BackSide,depthWrite:false}));sky.renderOrder=-8;
 // Different sizes stay sharp at a distance; a handful of bright stars have diffraction rays.
 function points(positions,attrs,vert,frag,parent=scene){
  let g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));for(const [key,[data,n]] of Object.entries(attrs))g.setAttribute(key,new T.Float32BufferAttribute(data,n));
  let m=new T.ShaderMaterial({uniforms:U,vertexShader:common+vert,fragmentShader:common+frag,transparent:true,depthWrite:false,blending:T.AdditiveBlending});
  let pts=new T.Points(g,m); parent.add(pts);return pts;
 }
 let stars=[],sv=[];
 for(let i=0;i<3700;i++){let a=rng()*Math.PI*2,b=rng()*.98+.014,r=172;stars.push(r*Math.cos(a)*Math.sqrt(1-b*b),r*b,r*Math.sin(a)*Math.sqrt(1-b*b));sv.push(rng(),rng(),rng())}
 const starfield=points(stars,{seed:[sv,3]},`
 attribute vec3 seed;varying vec3 st;void main(){st=seed;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=1.+pow(seed.x,9.)*7.;}`,`
 varying vec3 st;void main(){vec2 p=gl_PointCoord*2.-1.;float r=length(p);float rays=exp(-abs(p.x*p.y)*85.)*exp(-r*4.);float a=exp(-r*r*9.)+rays*.45*step(.85,st.x);gl_FragColor=vec4(mix(ice,ember,st.y),a*(.28+.66*st.z)*(.88+.12*sin(tm*.6+st.y*17.)));}`);
 const core=mesh(new T.SphereGeometry(RADIUS,96,64),shader(`
 void main(){vec3 n=normalize(nor),eye=normalize(cameraPosition-pos);float face=max(dot(n,eye),0.);float rim=1.-face;
 float whorl=fb(n.xy*5.+n.z*4.+tm*.002);float str=fb(vec2(n.y*47.+whorl*2.,n.x*4.));
 float light=.35+.65*max(dot(n,normalize(vec3(-.45,.8,.5))),0.);
 vec3 col=night*.50+ice*(.025*whorl+.043*str)*light;col+=ice*pow(rim,4.8)*(.35+.5*whorl);col+=mix(ice,vec3(1.),.72)*pow(rim,14.)*1.55;
 float ignition=(1.-smoothstep(-.18,.62,n.y+.7*n.x+whorl*.24));
 vec3 plasma=mix(ember*.52,vec3(1.,.94,.76),pow(str,1.4)*.85+pow(rim,4.)*.4);
 col=mix(col,plasma,dawn*(.16+.84*ignition));gl_FragColor=vec4(col,1.);}`));core.position.copy(CENTER);
 const corona=mesh(new T.PlaneGeometry(RADIUS*3.8,RADIUS*3.8),shader(`
 void main(){vec2 p=(tex-.5)*3.8;float r=length(p),ang=atan(p.y,p.x);float d=max(0.,r-1.);
 float f=fb(p*8.+vec2(tm*.025,-tm*.012));float rays=fb(vec2(cos(ang)*18.,sin(ang)*18.)+f*.9);
 float glow=.74*exp(-d*29.)+.13*exp(-d*6.5)+.031*exp(-d*2.);glow*=.70+.65*f;
 glow+=.22*rays*exp(-d*(10.+rays*19.));glow*=smoothstep(.965,1.,r)*(1.-smoothstep(1.6,1.85,r));
 gl_FragColor=vec4(mix(ice,vec3(.97,.96,.88),.30*exp(-d*55.)),glow);}`,{transparent:true,blending:T.AdditiveBlending,depthWrite:false}));corona.position.copy(CENTER);corona.renderOrder=1;
 const rings=new T.Group();rings.position.copy(CENTER);rings.rotation.order='ZXY';scene.add(rings);
 const ring=mesh(new T.RingGeometry(6.65,15.6,240,6),shader(`
 void main(){vec2 q=tex*2.-1.;float r=length(q)*15.6;float a=atan(q.y,q.x);float u=(r-6.65)/8.95;
 float lanes=.43+.57*pow(.5+.5*sin(r*9.+.48*sin(r*4.)+.12*sin(6.*a)),2.);
 float grit=fb(vec2(r*17.,sin(a)*13.+tm*.065));float streak=fb(vec2(r*4.,cos(a)*8.+tm*.05));
 float edge=smoothstep(0.,.052,u)*(1.-smoothstep(.42,1.,u));float gap=1.-.83*exp(-pow((r-10.65)/.34,2.));
 float alpha=edge*(.24+.76*lanes)*(.22+.86*grit)*gap;float spine=exp(-pow((r-7.68)/.29,2.));
 vec3 col=mix(ember*.79,vec3(1.,.94,.80),spine*.87+.23*streak);
 gl_FragColor=vec4(col,clamp(alpha*(1.38+spine*.65),0.,1.));}`,{transparent:true,depthWrite:false,side:T.DoubleSide} ),rings);ring.renderOrder=2;
 // Suspended rubble across the Roche limit, each fragment follows its own orbital rate.
 const rocks=new T.InstancedMesh(new T.DodecahedronGeometry(1,0),new T.MeshStandardMaterial({color:0x7c6f61,roughness:.82,flatShading:true}),240);
 rings.add(rocks);const dummy=new T.Object3D(),orbits=[];
 for(let i=0;i<rocks.count;i++){let r=10+rng()*7,s=.018+Math.pow(rng(),4)*.24;orbits.push([r,rng()*6.283,(rng()-.5)*.65,s,rng()*6,rng()*.5+.6]);}
 const dust=[],dv=[];for(let i=0;i<7400;i++){let a=rng()*6.283,r=6.8+Math.pow(rng(),1.25)*9.8;dust.push(Math.cos(a)*r,Math.sin(a)*r,(rng()-.5)*(.13+.32*(r-7)/9));dv.push(rng(),rng(),rng())}
 const sand=points(dust,{seed:[dv,3]},`
 attribute vec3 seed;varying vec3 st;void main(){st=seed;float a=tm*.021/pow(length(position.xy)/7.,1.5);vec3 p=vec3(mat2(cos(a),-sin(a),sin(a),cos(a))*position.xy,position.z);vec4 eye=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*eye;gl_PointSize=clamp((15.+38.*seed.x)/-eye.z,.8,3.);}`,`
 varying vec3 st;void main(){float r=length(gl_PointCoord-.5)*2.;gl_FragColor=vec4(mix(ember,vec3(1.),st.y*.7),exp(-r*r*4.)*(.23+.45*st.z));}`,rings);sand.renderOrder=3;
 U.ringN={value:v(0,1,0)};
 const water=mesh(new T.PlaneGeometry(270,270),shader(`
 uniform vec3 ringN;
 void main(){vec2 p=pos.xz;float dist=length(pos-cameraPosition);float fade=1./(1.+dist*.018);
 float drift=fb(p*.19),t=tm*.68;
 float slope=sin(p.y*4.7+p.x*.63+drift*8.+t)*.034+sin(p.y*10.9-p.x*.71+drift*11.-t*1.2)*.023;
 float chop=(n2(p*vec2(.8,5.)+t*.11)-.5)*.085;
 vec3 normal=normalize(vec3(.025*sin(p.x*1.5+p.y*.75+t+drift*4.),1.,(slope+chop)*fade));
 vec3 ray=reflect(normalize(pos-cameraPosition),normal);vec3 to=heart-pos;float proj=dot(to,ray);float b=length(to-ray*proj)/radius;
 float rim=proj>0.?exp(-abs(b-1.)*9.)+.35*exp(-abs(b-1.)*2.8):0.;
 float div=dot(ray,ringN),l=dot(to,ringN)/(abs(div)<.0001?.0001:div);float rr=length(pos+l*ray-heart);
 float reflected=l>0.?smoothstep(6.7,7.4,rr)*(1.-smoothstep(9.,15.4,rr))*(.55+.45*sin(rr*7.)):0.;
 if(proj>0.&&b<1.&&l>proj) reflected*=.12;
 float rip=.5+.5*sin(p.y*9.5+drift*15.+p.x*.54+t);
 vec3 col=night*.95+ice*(.035+.09*fade*(.35+.65*drift)+.105*(1.-fade));
 col+=ice*rim*(.27+.44*rip)+ember*reflected*(.21+.56*rip);
 col+=dawn*ember*(.08*(1.-fade)+.34*(1.-smoothstep(.5,1.12,b))*step(0.,proj))*(.48+.52*rip);col+=ice*.038*pow(rip,4.)*fade;gl_FragColor=vec4(col,1.);}`));water.rotation.x=-Math.PI/2;water.position.y=-.4;
 // Overlapping, irregular basalt ridges make a continuous horizon in every direction.
 for(let layer=0;layer<3;layer++){
  const verts=[],inds=[],tints=[],N=440;let phases=Array.from({length:6},()=>rng()*6.28);
  for(let i=0;i<=N;i++){let a=i/N*2*Math.PI;let relief=0;for(let k=0;k<6;k++)relief+=Math.sin(a*(3+2**k)+phases[k])/(1+k*.93);
   let rr=65+layer*13+Math.sin(a*7)*3,ht=.8+layer*.34+Math.max(0,relief+1.1)*(1.04+layer*.65)+Math.abs(Math.sin(a*33.7+layer)*Math.sin(a*14.2))*.85+Math.abs(Math.sin(a*119.))*Math.abs(Math.sin(a*16.))*.38;
   for(let h=0;h<3;h++){let d=rr+h*1.7,y=h===0?-1:h===1?ht*.63:ht;verts.push(Math.cos(a)*d,y,Math.sin(a)*d);tints.push((.64+h*.13)+.1*Math.sin(a*35));}
   if(i<N)for(let h=0;h<2;h++){let j=i*3+h;inds.push(j,j+3,j+1,j+3,j+4,j+1);}
  }
  let geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setAttribute('shade',new T.Float32BufferAttribute(tints,1));geo.setIndex(inds);
  const mat=new T.ShaderMaterial({uniforms:U,side:T.DoubleSide,vertexShader:'attribute float shade;varying float lum;void main(){lum=shade;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:common+`varying float lum;void main(){gl_FragColor=vec4((night+ice*`+(.056+layer*.052).toFixed(3)+`)*lum,1.);}`});mesh(geo,mat);
 }
 scene.add(new T.HemisphereLight(0xc1d9f2,0x32343f,1.75));const key=new T.DirectionalLight(0xffdfb0,2.4);key.position.set(-9,20,-14);scene.add(key);
 const stone=new T.MeshStandardMaterial({color:0x43444a,roughness:.72,metalness:.28,flatShading:true});
 // Broken, wet basalt: contour veins, quartz inclusions and a grazing sheen.
 stone.onBeforeCompile=program=>{
  program.vertexShader='varying vec3 lithicPos; varying vec3 lithicNormal;\n'+program.vertexShader;
  program.vertexShader=program.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nlithicPos=(modelMatrix*vec4(transformed,1.)).xyz; lithicNormal=normalize(mat3(modelMatrix)*objectNormal);');
  program.fragmentShader=noise+'varying vec3 lithicPos; varying vec3 lithicNormal;\n'+program.fragmentShader;
  program.fragmentShader=program.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
  vec2 uvRock=vec2(lithicPos.x+.52*lithicPos.z,lithicPos.y*.75+.4*lithicPos.z);
  float grain=fb(uvRock*2.1);float detail=n2(uvRock*64.);
  float mineral=1.-smoothstep(.025,.14,abs(sin(uvRock.x*3.1+uvRock.y*8.7+grain*11.)));
  diffuseColor.rgb*=.6+.63*grain+.35*detail;
  diffuseColor.rgb+=vec3(.012,.018,.021)*(1.+grain)+vec3(.045,.043,.034)*mineral*(.35+detail);
  float wet=pow(1.-abs(dot(normalize(cameraPosition-lithicPos),normalize(lithicNormal))),4.);
  diffuseColor.rgb+=vec3(.014,.026,.032)*wet;`);
 };
 const trim=new T.MeshStandardMaterial({color:0xa3875d,metalness:.52,roughness:.42});
 const light=new T.MeshBasicMaterial({color:0xffdfa9}), box=new T.BoxGeometry(1,1,1);
 function block(x,y,z,w,h,d,mat=stone,parent=group){let m=mesh(box,mat,parent);m.position.set(x,y,z);m.scale.set(w,h,d);return m}
 // The drowned causeway is split down the middle, with separately heaved basalt slabs.
 const path=new T.Group();group.add(path);path.position.x=3.4;path.rotation.y=.11;
 for(let i=0;i<39;i++){let z=22-i*.90, level=-.25+Math.max(0,9-i)*.027+.07*Math.sin(i*.6);
  for(let side of [-1,1]){let m=block(side*(.62+rng()*.05),level+rng()*.08,z,1.17+rng()*.11,.32+rng()*.18,.80+rng()*.07,stone,path);m.rotation.set((rng()-.5)*.05,(rng()-.5)*.038,(rng()-.5)*.07)}
  if(i%5===1){for(let side of [-1,1]){block(side*1.35,level+.31,z,.11,.69,.12,trim,path);block(side*1.35,level+.67,z,.10,.1,.11,light,path)}}
 }
 // Low buttresses disappear below the tide.
 for(let i=0;i<12;i++){block(0,-.43,20-i*2.85,2.2,.72,.6,stone,path);}
 const beacons=[v(3.2,.1,7.4),v(2.55,.1,-1.4),v(1.95,.1,-10.7)], beacongroups=[];
 for(let i=0;i<3;i++){let g=new T.Group();g.position.copy(beacons[i]);group.add(g);beacongroups.push(g);
  block(0,.04,0,2.9,.4,1.65,stone,g);
  for(let side of [-1,1]){
   block(side*1.02,1.17+i*.2,0,.31,2.45+i*.4,.5,stone,g);
   block(side*.85,1.18+i*.2,.17,.028,2.15+i*.4,.032,trim,g);
   block(side*1.02,2.42+i*.4,0,.36,.065,.54,trim,g);
  }
 }
 const dialMat=new T.MeshStandardMaterial({color:0xc7a56b,metalness:.60,roughness:.36,emissive:0x4c331c,emissiveIntensity:.32});
 const dials=[];
 beacongroups.forEach((g,i)=>{
  const dial=new T.Group();dial.position.y=1.65+i*.24;g.add(dial);dials.push(dial);
  for(let k=0;k<2;k++){let m=mesh(new T.TorusGeometry(.46+k*.12,.012,6,72),dialMat,dial);m.rotation.set(.25,k*.78,.17);}
  const incisions=[];
  for(let k=0;k<48;k++){let a=k*Math.PI/24,r=.57,lo=r-(k%4===0?.075:.034);incisions.push(Math.cos(a)*r,Math.sin(a)*r,.003,Math.cos(a)*lo,Math.sin(a)*lo,.003);}
  let marks=new T.BufferGeometry();marks.setAttribute('position',new T.Float32BufferAttribute(incisions,3));dial.add(new T.LineSegments(marks,new T.LineBasicMaterial({color:0xd1b280})));
  for(let side of [-1,1]){const fin=mesh(new T.CylinderGeometry(.075,.19,.58,4),stone,g);fin.position.set(side*1.02,2.73+i*.4,0);fin.rotation.y=Math.PI*.25;}
 });
 const gems=[];beacons.forEach((p,i)=>{let m=mesh(new T.OctahedronGeometry(.225),new T.MeshStandardMaterial({color:0xffdfae,emissive:0xffbf69,emissiveIntensity:1.3,metalness:.35,roughness:.3}));m.position.copy(p);gems.push(m);});
 for(let i=0;i<54;i++){let a=rng()*6.28,rr=11+rng()*36;let x=Math.cos(a)*rr,z=Math.sin(a)*rr;if(Math.abs(x-3)<3)continue;let m=mesh(new T.DodecahedronGeometry(1),stone);let s=.2+rng()*.82;m.position.set(x,-.52+rng()*.12,z);m.scale.set(s*2,s*.9,s);m.rotation.set(rng(),rng()*5,rng());}
 let motes=[],seeds=[];for(let i=0;i<480;i++){motes.push((rng()-.5)*52,rng()**2*14,(rng()-.5)*65);seeds.push(rng(),rng(),rng());}
 points(motes,{seed:[seeds,3]},`
 attribute vec3 seed;varying vec3 st;void main(){st=seed;vec3 p=position;p.x+=sin(tm*.09+seed.z*17.)*.55;p.y+=sin(tm*.21+seed.y*9.)*.48;vec4 e=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*e;gl_PointSize=clamp(32./-e.z+seed.x*1.6,1.,4.8);}`,`varying vec3 st;void main(){float r=length(gl_PointCoord-.5)*2.;gl_FragColor=vec4(mix(ember,ice,st.y),exp(-r*r*5.)*(.25+.45*st.x));}`);
 let orbit=0,pitch=.06,zoom=1,stage=0,landing=true,teleport=true;
 const target=v(0,0,0),desired=v(0,0,0),offset=v(0,0,0),eye=v(0,0,0),aim=v(0,0,0),normal=v(0,0,1);
 const anchors=[[-3,5.3,-5,34,.02],[-.6,5,-6,28,-.46],[1.1,5.8,-9,24,.62]];
 let width=0,height=0;function resize(){width=innerWidth;height=innerHeight;renderer.setPixelRatio(Math.min(devicePixelRatio,1.6,Math.sqrt(2700000/(width*height))));renderer.setSize(width,height,false);cam.aspect=width/height;cam.fov=width/height<.88?63:48;cam.updateProjectionMatrix();}
 resize();function reset(){orbit=0;pitch=.06;zoom=1;}
 function frame(time,dt,found,reduced){
  U.tm.value=time;U.dawn.value+=((landing&&stage===2?1:0)-U.dawn.value)*(reduced?1:1-Math.exp(-dt*.82));let k=reduced?1:1-Math.exp(-dt*3.5);for(let [j,name] of ['ice','ember','night'].entries())U[name].value.lerp(palette[stage][j],k);
  let [x,y,z,dist,angle]=anchors[stage];let portrait=width/height<.88;
  if(portrait){x=3.85;y=landing?3.2:3.35;dist*=1.18;}
  if(landing&&!portrait){x=-6.25;y=5.3;dist=32;}
  aim.set(x,y,z);let a=angle+orbit,p=pitch;let d=dist*zoom;
  offset.set(Math.sin(a)*Math.cos(p)*d,Math.sin(p)*d,Math.cos(a)*Math.cos(p)*d);
  eye.copy(aim).add(offset);eye.y=Math.max(.5,eye.y);
  let blend=teleport||reduced?1:1-Math.exp(-dt*5.3);target.lerp(aim,blend);desired.lerp(eye,blend);teleport=false;
  cam.position.copy(desired);cam.lookAt(target);cam.updateMatrixWorld();sky.position.copy(cam.position);starfield.position.copy(cam.position);
  corona.quaternion.copy(cam.quaternion);corona.lookAt(cam.position);rings.rotation.x=1.26+.08*Math.sin(time*.027+stage*.8);
  const tilt=[.19,-.27,.38][stage];rings.rotation.z+=(tilt-rings.rotation.z)*k;
  U.ringN.value.copy(normal).applyQuaternion(rings.quaternion);
  for(let i=0;i<orbits.length;i++){let [r,a,h,s,b,rate]=orbits[i];a+=time*.022*rate;dummy.position.set(r*Math.cos(a),r*Math.sin(a),h);dummy.rotation.set(b+time*.08,a,b-time*.055);dummy.scale.set(s*1.5,s*.63,s);dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix)}rocks.instanceMatrix.needsUpdate=true;
  dials.forEach((d,i)=>{d.rotation.y=.14+Math.sin(time*.28+i)*.62;d.rotation.z=time*.08;});
  gems.forEach((m,i)=>{m.position.y=1.76+i*.24+.12*Math.sin(time*1.3+i);m.rotation.set(.12,time*.48+i,.13);m.visible=!found.has(i);});
  renderer.render(scene,cam);
  let loc=gems[stage].position.clone().project(cam);
  return {x:(loc.x*.5+.5)*width,y:(.5-loc.y*.5)*height,visible:loc.z>-1&&loc.z<1&&Math.abs(loc.x)<.94&&Math.abs(loc.y)<.85};
 }
 return {resize,frame,reset,rotate(dx,dy){orbit-=dx*.006;pitch=T.MathUtils.clamp(pitch+dy*.004,-.35,1.32)},scale(f){zoom=T.MathUtils.clamp(zoom*f,.46,2.45)},select(i,intro){stage=i;landing=intro;reset()},pick(x,y){let ray=new T.Raycaster();ray.setFromCamera(new T.Vector2(x/width*2-1,1-y/height*2),cam);return ray.intersectObject(gems[stage]).length>0}};
}
