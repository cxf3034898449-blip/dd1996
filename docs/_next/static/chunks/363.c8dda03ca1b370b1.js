"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[363],{4363:(e,t,r)=>{r.r(t),r.d(t,{SpiralGallery:()=>m});var o=r(5988),i=r(2168),n=r(5688),a=r(3479),l=r.n(a),s=r(3372),c=r(2715),u=r(364);let d=`varying vec2 vUv;
varying vec3 vWorldPosition;
#define PI 3.14159265359

uniform float uScrollSpeed;

void main() {
  // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vec3 worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  vec3 newPosition = position;
  newPosition.z = sin(uv.x * PI) * 0.2;

  // newPosition.x -= pow(worldPosition.y, 2.0) * 0.05;


  vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  viewPosition.x += pow(worldPosition.y, 2.0) * 0.1;
  // viewPosition.x += uv.y * worldPosition.y * uScrollSpeed * 3.0;
  viewPosition.x += sin(uv.y * PI) * uScrollSpeed * 2.0;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  // projectedPosition.x += pow(worldPosition.y, 3.0);
  gl_Position = projectedPosition;

  // VARYINGS
  vUv = uv;
}`,v=`uniform sampler2D uTexture;
uniform float uColorStrength;
uniform float uZoom;
uniform vec2 uPlaneSizes;
uniform vec2 uImageSizes;
uniform float uRevealProgress;

varying vec2 vUv;

float roundedRectSDF(vec2 uv, vec2 size, float radius) {
  vec2 d = abs(uv - 0.5) - size * 0.5 + radius;
  return length(max(d, 0.0)) - radius;
}

void main() {

  vec2 ratio = vec2(
    min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
    min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
  );

  vec2 uv = vec2(
    vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );


  vec2 zoomedUv = (uv - 0.5) / uZoom + 0.5;

  vec4 color;

  if (gl_FrontFacing) {
    color = texture2D(uTexture, zoomedUv);
    color = mix(color, vec4(0.0, 0.0, 0.0, 1.0), uColorStrength);
  } else {
    float offset = 40.0 / 1024.0;
    vec4 c = vec4(0.0);

    c += texture2D(uTexture, uv + vec2(-offset, -offset)) * 1.0;
    c += texture2D(uTexture, uv + vec2( 0.0,    -offset)) * 2.0;
    c += texture2D(uTexture, uv + vec2( offset, -offset)) * 1.0;
    c += texture2D(uTexture, uv + vec2(-offset,  0.0))   * 2.0;
    c += texture2D(uTexture, uv)                         * 4.0;
    c += texture2D(uTexture, uv + vec2( offset,  0.0))   * 2.0;
    c += texture2D(uTexture, uv + vec2(-offset,  offset)) * 1.0;
    c += texture2D(uTexture, uv + vec2( 0.0,     offset)) * 2.0;
    c += texture2D(uTexture, uv + vec2( offset,  offset)) * 1.0;
    c /= 16.0;

    color = c;
  }

  float reveal = clamp(uRevealProgress, 0.0, 1.0);

  // Scale fictif via alpha
  vec2 revealSize = vec2(reveal);

  // Border radius suit le reveal
  float baseRadius = 0.05;
  float radius = baseRadius * reveal;

  // Signed Distance Field
  float sdf = roundedRectSDF(vUv, revealSize, radius);

  // Soft edge
  float edge = 0.002;
  float alpha = 1.0 - smoothstep(0.0, edge, sdf);
  alpha *= smoothstep(0.1, 1.0, uRevealProgress);

  // Final color
  gl_FragColor = vec4(color.rgb, color.a * alpha);

  gl_FragColor = vec4(color.rgb, alpha);
}
`;function m({active:e,onHover:t,onSound:r}){let a=(0,i.useRef)(null),h=(0,i.useRef)(e),f=(0,i.useRef)({onHover:t,onSound:r}),[w,p]=(0,i.useState)(!1),[g,x]=(0,i.useState)(0),P=(0,n.useRouter)();return((0,i.useEffect)(()=>{h.current=e},[e]),(0,i.useEffect)(()=>{f.current={onHover:t,onSound:r}},[t,r]),(0,i.useEffect)(()=>{let e,t=a.current;if(!t||w)return;try{e=new s.JeP({canvas:t,antialias:!0,alpha:!0,powerPreference:"high-performance",stencil:!1})}catch{queueMicrotask(()=>p(!0));return}let r=new c.Z58,o=new c.ubm(window.innerWidth<900?45:35,window.innerWidth/window.innerHeight,.1,100);o.position.z=8,e.setClearColor(657930,0),e.setPixelRatio(Math.min(window.devicePixelRatio,window.matchMedia("(pointer: coarse)").matches?1.25:2)),e.setSize(window.innerWidth,window.innerHeight),e.toneMapping=c.y_p;let i=!1,n=u.dt.map(()=>!1),l=u.dt.map(()=>new c.gPd),m=new Set,g=new Set,S=(e,t=0)=>{if(i)return;let r=new Image;g.add(r);let o=!1,a=a=>{o||i||(o=!0,clearTimeout(s),m.delete(s),g.delete(r),r.onload=null,r.onerror=null,a?(l[e].image=r,l[e].needsUpdate=!0,n[e]=!0,x(e=>e+1)):t<1?S(e,t+1):p(!0))},s=setTimeout(()=>a(!1),15e3);m.add(s),r.onload=()=>a(!0),r.onerror=()=>a(!1),r.src=u.dt[e].thumbnail+(t?"?retry=1":"")};u.dt.forEach((e,t)=>S(t));let y=new c.bdM(1,1,8,8),E=[...u.dt,...u.dt].map((e,t)=>{let o=l[t%u.dt.length],i=new c.BKk({vertexShader:d,fragmentShader:v,transparent:!0,side:c.$EB,uniforms:{uTexture:{value:o},uColorStrength:{value:0},uZoom:{value:1},uPlaneSizes:{value:new c.I9Y(1.7,1)},uImageSizes:{value:new c.I9Y(1.7,1)},uRevealProgress:{value:0},uScrollSpeed:{value:0}}}),n=new c.eaF(y,i);return n.scale.set(1.7,1,1),r.add(n),{mesh:n,project:e,hover:0,hidden:1}}),j=new c.tBo,b=new c.I9Y(-10,-10),z=window.matchMedia("(prefers-reduced-motion: reduce)"),M=.002*!z.matches,L=0,D=1,I=0,R=-1,C=performance.now(),k=0,F=!1,T=0,U=0,A=()=>{-1!==R&&f.current.onHover(null),R=-1,t.style.cursor="grab"},W=e=>{if(b.set(e.clientX/window.innerWidth*2-1,-(2*(e.clientY/window.innerHeight))+1),F&&h.current){let t=e.clientX-U;T+=Math.abs(t),M=c.cj9.clamp(M+.0015*t,-2,2),D=t>=0?1:-1,U=e.clientX}},_=e=>{h.current&&(e.preventDefault(),M=c.cj9.clamp(M+15e-5*e.deltaY,-2,2),D=e.deltaY>=0?1:-1)},H=e=>{h.current&&(F=!0,U=e.clientX,T=0,W(e),t.setPointerCapture(e.pointerId))},Y=e=>{if(!F)return;let r=T>=8;if(F=!1,t.hasPointerCapture(e.pointerId)&&t.releasePointerCapture(e.pointerId),!r&&h.current){W(e),j.setFromCamera(b,o);let t=j.intersectObjects(E.map(e=>e.mesh))[0];if(t?.face&&0>t.face.normal.clone().transformDirection(t.object.matrixWorld).dot(j.ray.direction)){let e=E.find(e=>e.mesh===t.object);e&&(f.current.onSound("longclick"),A(),P.push(`/projects/${e.project.slug}`))}}},N=()=>{F=!1,T=0,b.set(-10,-10),A()},Z=e=>{e.preventDefault(),p(!0)},B=e=>{h.current&&["ArrowDown","ArrowUp","ArrowLeft","ArrowRight"].includes(e.key)&&(e.preventDefault(),D=["ArrowDown","ArrowRight"].includes(e.key)?1:-1,M+=.08*D)},X=()=>{o.aspect=window.innerWidth/window.innerHeight,o.fov=window.innerWidth<900?45:35,o.updateProjectionMatrix(),e.setSize(window.innerWidth,window.innerHeight),e.setPixelRatio(Math.min(window.devicePixelRatio,window.matchMedia("(pointer: coarse)").matches?1.25:2))},$=a=>{if(i)return;let s=Math.min(a-C,50);C=a;let d=s/(1e3/60);if(h.current&&!document.hidden&&(L+=(M-L)*(1-Math.pow(.9,d)),I+=L*d,.002>Math.abs(M)&&(M=z.matches?0:.002*D),M*=Math.pow(.9,d)),E.forEach((e,t)=>{e.mesh.visible=n[t%u.dt.length],e.hover=c.cj9.lerp(e.hover,+(t===R),1-Math.pow(.93,.2*s)),e.hidden=c.cj9.lerp(e.hidden,+!h.current,1-Math.pow(.95,.15*s));let r=((t-I)%E.length+E.length)%E.length-Math.floor(E.length/2),o=.85*r,i=2*(1-e.hidden/2);e.mesh.position.set(Math.cos(o)*i,.5*r-.8+1.5*e.hidden,Math.sin(o)*i),e.mesh.rotation.y=-o+Math.PI/2;let a=e.mesh.material.uniforms;a.uColorStrength.value=.55*e.hover,a.uZoom.value=1+.05*e.hover,a.uRevealProgress.value=(1-.05*e.hover)*(1-e.hidden),a.uScrollSpeed.value=L;let d=l[t%u.dt.length].image;d?.width&&a.uImageSizes.value.set(d.width,d.height)}),h.current&&!F){j.setFromCamera(b,o);let e=j.intersectObjects(E.map(e=>e.mesh))[0],r=e?.face&&0>e.face.normal.clone().transformDirection(e.object.matrixWorld).dot(j.ray.direction)?E.findIndex(t=>t.mesh===e.object):-1;r!==R&&(R=r,f.current.onHover(r>=0?E[r].project:null),r>=0&&f.current.onSound("hover"),t.style.cursor=r>=0?"pointer":"grab")}else A();!document.hidden&&(h.current||E.some(e=>e.hidden<.999))&&e.render(r,o),k=requestAnimationFrame($)};return t.addEventListener("pointercancel",N),t.addEventListener("lostpointercapture",N),t.addEventListener("webglcontextlost",Z),t.addEventListener("wheel",_,{passive:!1}),t.addEventListener("pointerdown",H),t.addEventListener("pointerup",Y),t.addEventListener("pointermove",W),t.addEventListener("pointerleave",A),window.addEventListener("resize",X),window.addEventListener("keydown",B),k=requestAnimationFrame($),()=>{i=!0,cancelAnimationFrame(k),m.forEach(clearTimeout),g.forEach(e=>{e.onload=null,e.onerror=null}),t.removeEventListener("pointercancel",N),t.removeEventListener("lostpointercapture",N),t.removeEventListener("webglcontextlost",Z),t.removeEventListener("wheel",_),t.removeEventListener("pointerdown",H),t.removeEventListener("pointerup",Y),t.removeEventListener("pointermove",W),t.removeEventListener("pointerleave",A),window.removeEventListener("resize",X),window.removeEventListener("keydown",B),E.forEach(e=>e.mesh.material.dispose()),l.forEach(e=>e.dispose()),y.dispose(),e.dispose()}},[P,w]),w&&!e)?null:w?(0,o.jsx)("div",{className:"gallery-fallback",children:u.dt.map(e=>(0,o.jsxs)(l(),{href:`/projects/${e.slug}`,children:[(0,o.jsx)("img",{src:e.thumbnail,alt:e.title}),(0,o.jsx)("span",{children:e.title})]},e.slug))}):(0,o.jsxs)(o.Fragment,{children:[e&&g<u.dt.length&&(0,o.jsxs)("div",{className:"gallery-loading",role:"status",children:[(0,o.jsxs)("span",{children:["Loading works ",g,"/",u.dt.length]}),(0,o.jsx)("button",{onClick:()=>p(!0),children:"View images"})]}),(0,o.jsx)("canvas",{ref:a,className:`spiral-canvas ${e?"is-active":""}`,"aria-label":"Spiral project gallery. Scroll or drag to explore. Use list view for keyboard navigation."})]})}}}]);