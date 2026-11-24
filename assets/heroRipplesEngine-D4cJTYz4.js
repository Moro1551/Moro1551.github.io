var e=24,t=`
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D uMedia;
uniform sampler2D uMask;
uniform float uHasMask;
uniform vec2 uScale;
uniform vec2 uSize;
uniform vec4 uRipples[${e}];
uniform int uCount;
uniform float uStrength;
uniform float uWavelength;
uniform float uSpeed;
uniform float uLife;
uniform float uHighlight;
varying vec2 vUv;

vec2 cover(vec2 uv) { return (uv - 0.5) * uScale + 0.5; }

void main() {
  vec2 p = vUv * uSize;
  vec2 disp = vec2(0.0);
  float light = 0.0;
  float k = 6.2831853 / uWavelength;
  for (int i = 0; i < ${e}; i++) {
    if (i >= uCount) break;
    vec4 r = uRipples[i];
    vec2 dv = p - r.xy;
    float d = length(dv);
    float front = r.z * uSpeed;
    float x = d - front;
    // Paquete de ~2 crestas alrededor del frente del círculo
    float env = exp(-(x * x) / (uWavelength * uWavelength * 1.4));
    float fade = 1.0 - r.z / uLife;
    float a = r.w * env * fade * fade * smoothstep(0.0, uWavelength * 0.75, front);
    if (a < 0.002) continue;
    disp += (dv / max(d, 1.0)) * sin(x * k) * a;
    light += cos(x * k) * a;
  }
  float m = uHasMask > 0.5 ? texture2D(uMask, cover(vUv)).r : 1.0;
  disp *= m;
  light *= m;
  vec2 uv = cover(vUv - disp * uStrength / uSize);
  vec3 color = texture2D(uMedia, clamp(uv, 0.0, 1.0)).rgb;
  float l = max(light, 0.0);
  color += vec3(0.85, 0.97, 1.0) * l * l * uHighlight;
  gl_FragColor = vec4(color, 1.0);
}`;function n(e,t,n){let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(e.deleteShader(r),null)):null}function r(e){return e instanceof HTMLVideoElement?[e.videoWidth,e.videoHeight]:[e.naturalWidth,e.naturalHeight]}function i(e){return e instanceof HTMLVideoElement?e.readyState>=2&&e.videoWidth>0:e.complete&&e.naturalWidth>0}function a(a,o,s,c){let l=a.getContext(`webgl`,{alpha:!1,antialias:!1,depth:!1,powerPreference:`low-power`});if(!l)return null;let u=n(l,l.VERTEX_SHADER,`
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`),d=n(l,l.FRAGMENT_SHADER,t),f=l.createProgram();if(!u||!d||!f||(l.attachShader(f,u),l.attachShader(f,d),l.linkProgram(f),!l.getProgramParameter(f,l.LINK_STATUS)))return null;l.useProgram(f);let p=l.createBuffer();l.bindBuffer(l.ARRAY_BUFFER,p),l.bufferData(l.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),l.STATIC_DRAW);let m=l.getAttribLocation(f,`aPos`);l.enableVertexAttribArray(m),l.vertexAttribPointer(m,2,l.FLOAT,!1,0,0);function h(e){let t=l.createTexture();return l.activeTexture(l.TEXTURE0+e),l.bindTexture(l.TEXTURE_2D,t),l.texParameteri(l.TEXTURE_2D,l.TEXTURE_MIN_FILTER,l.LINEAR),l.texParameteri(l.TEXTURE_2D,l.TEXTURE_MAG_FILTER,l.LINEAR),l.texParameteri(l.TEXTURE_2D,l.TEXTURE_WRAP_S,l.CLAMP_TO_EDGE),l.texParameteri(l.TEXTURE_2D,l.TEXTURE_WRAP_T,l.CLAMP_TO_EDGE),t}let g=h(0),_=h(1),v=e=>l.getUniformLocation(f,e);l.uniform1i(v(`uMedia`),0),l.uniform1i(v(`uMask`),1);let y=v(`uHasMask`),b=v(`uScale`),x=v(`uSize`),S=v(`uRipples`),C=v(`uCount`),w=v(`uStrength`),T=v(`uWavelength`),E=v(`uSpeed`),D=v(`uLife`),O=v(`uHighlight`);l.uniform1f(y,0);let k=c?`loading`:`none`,A=0;if(c){let e=new Image;e.decoding=`async`,e.onload=()=>{V||(l.activeTexture(l.TEXTURE1),l.bindTexture(l.TEXTURE_2D,_),l.texImage2D(l.TEXTURE_2D,0,l.LUMINANCE,l.LUMINANCE,l.UNSIGNED_BYTE,e),l.uniform1f(y,1),A=e.naturalWidth/e.naturalHeight,k=`ready`)},e.onerror=()=>{k=`failed`},e.src=c}let j=s;function M(){l.uniform1f(w,j.rippleStrength),l.uniform1f(T,Math.max(4,j.rippleRadius)),l.uniform1f(E,j.rippleSpeed),l.uniform1f(D,Math.max(.2,j.rippleDecay)),l.uniform1f(O,j.highlight)}M();let N=1,P=1;function F(){let e=Math.min(window.devicePixelRatio||1,1.5);N=Math.max(1,a.clientWidth),P=Math.max(1,a.clientHeight),a.width=Math.round(N*e),a.height=Math.round(P*e),l.viewport(0,0,a.width,a.height),l.uniform2f(x,N,P)}F();let I=new ResizeObserver(F);I.observe(a);let L=[],R=new Float32Array(e*4),z=0,B=!1,V=!1,H=-1e4,U=-1e4,W=0;function G(e){if(k===`loading`||k===`failed`)return!1;let t=o();if(!t||!i(t))return!1;let[n,a]=r(t),s=n/a;if(k===`ready`&&Math.abs(A-s)/s>.02)return!1;let c=N/P;c>s?l.uniform2f(b,1,s/c):l.uniform2f(b,c/s,1),l.activeTexture(l.TEXTURE0),l.bindTexture(l.TEXTURE_2D,g);try{l.texImage2D(l.TEXTURE_2D,0,l.RGB,l.RGB,l.UNSIGNED_BYTE,t)}catch{return!1}return R.fill(0),L.forEach((t,n)=>{R[n*4]=t.x,R[n*4+1]=t.y,R[n*4+2]=(e-t.born)/1e3,R[n*4+3]=t.amp}),l.uniform4fv(S,R),l.uniform1i(C,L.length),l.drawArrays(l.TRIANGLE_STRIP,0,4),!0}function K(){B=!1,cancelAnimationFrame(z),a.style.opacity=`0`}function q(e){if(V)return;let t=Math.max(.2,j.rippleDecay)*1e3;L=L.filter(n=>e-n.born<t),L.length===0?K():(G(e)&&(a.style.opacity=`1`),z=requestAnimationFrame(q))}function J(){B||V||(B=!0,z=requestAnimationFrame(q))}function Y(t,n,r){if(V)return;let i=Math.max(1,Math.min(e,Math.round(j.maxRipples)));for(L.push({x:t,y:n,born:performance.now(),amp:r});L.length>i;)L.shift();J()}function X(e,t){let n=performance.now(),r=Math.max(12,j.rippleRadius*.9);Math.hypot(e-H,t-U)<r||n-W<50||(H=e,U=t,W=n,Y(e,t,1))}function Z(e){e.preventDefault(),Q()}a.addEventListener(`webglcontextlost`,Z);function Q(){V||(V=!0,cancelAnimationFrame(z),I.disconnect(),a.removeEventListener(`webglcontextlost`,Z),a.style.opacity=`0`,l.getExtension(`WEBGL_lose_context`)?.loseContext())}return{move:X,click(e,t){Y(e,t,Math.max(1,j.clickMultiplier))},lift(){H=-1e4,U=-1e4},setParams(e){j=e,V||M()},destroy:Q}}export{a as createRippleEngine};