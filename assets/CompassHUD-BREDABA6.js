import{c as $,J as B,K as H,M as G,Y as I,u as j,I as J,r as m,at as K,L as Q,o as q,au as Z,k as ee,w as C,aw as _,ay as ae,aA as te,ax as oe,l as se,m as ne,n as E,G as l,N as r,V as le,O as ie,s,P as re,Q as k,R as ue,a4 as A,aC as de,W as ce,F as he,az as fe,_ as ge}from"./index-BBnA6cql.js";import{w as V}from"./index-DxaGCbJO.js";import{g as pe}from"./index-DjKJqAo0.js";import{V as we,a as ve,b as me,c as Ce}from"./VExpansionPanels-Dr5yi855.js";const Ve={class:"main"},Se=["width","height"],xe=$({__name:"CompassHUD",props:{widget:{}},setup(D){const S=B(),L=H();G.registerUsage(I.heading);const T=j(),t=J(D).widget,W=m([["#FFFFFF"],["#FF2D2D"],["#0ADB0ACC"]]),X=e=>{switch(e){case-180:return"S";case-135:return"SW";case-90:return"W";case-45:return"NW";case 0:return"N";case 45:return"NE";case 90:return"E";case 135:return"SE";case 180:return"S";case 225:return"SW";case 270:return"W";case 315:return"NW";case 360:return"N";default:return`${e}°`}},c=K({yawLinesX:{}}),x=[];let b=-180;for(;b<181;)x.push(b),b+=3;Q(()=>{Object.keys(t.value.options).length===0&&(t.value.options={showYawValue:!0,hudColor:W.value[0][0],useNegativeRange:!1})}),q(()=>{x.forEach(e=>c.yawLinesX[e]=P(e)),F()});const{width:z}=Z(),u=ee(()=>({width:t.value.size.width*z.value,height:64})),w=m(0);let M;C(T.attitude,e=>{Math.abs(_(e.yaw-(M||0)))>.1&&(M=e.yaw,w.value=_(T.attitude.yaw))});const P=e=>{let o=-(e-w.value||0);return o<-180?o+=360:o>180&&(o-=360),-o},h=m(),y=m(),F=()=>{if(h.value===void 0||h.value===null)return;if(y.value===void 0){console.debug("Canvas context undefined!"),y.value=h.value.getContext("2d");return}const e=y.value;ae(e);const a=.5*u.value.width,o=.5*u.value.height,N=12,d=16,f=10,n=2,O=7;e.textAlign="center",e.strokeStyle="white",e.font=`bold ${N}px Arial`,e.fillStyle="white";for(const[i,R]of Object.entries(c.yawLinesX)){if(R<-90||R>90)continue;const U=2*a/Math.PI*Math.sin(fe(R)),v=a+U;if(e.beginPath(),e.moveTo(v,d+n+f+n),e.lineTo(v,o*2-N-n-O),e.lineWidth="1",Number(i)%15===0){e.lineWidth="2",e.lineTo(v,o*2-N-n);let p=Number(i);t.value.options.useNegativeRange||(p=p<0?p+360:p),e.fillText(X(Number(p)),v,o*2-n)}e.stroke()}if(t.value.options.showYawValue){e.font=`bold ${d}px Arial`;let i=Number(w.value);t.value.options.useNegativeRange||(i=i<0?i+360:i),e.fillText(`${i.toFixed(1)}°`,a,d)}e.beginPath(),e.moveTo(a,d+n+f),e.lineTo(a-.5*f,n+d+n),e.lineTo(a+.5*f,n+d+n),e.lineTo(a,d+n+f),e.closePath(),e.fill(),e.globalCompositeOperation="source-in";const g=e.createLinearGradient(0,o,u.value.width,o);g.addColorStop(.18,V(t.value.options.hudColor).alpha(0).toRgbString()),g.addColorStop(.3,V(t.value.options.hudColor).alpha(1).toRgbString()),g.addColorStop(.7,V(t.value.options.hudColor).alpha(1).toRgbString()),g.addColorStop(.82,V(t.value.options.hudColor).alpha(0).toRgbString()),e.fillStyle=g,e.fillRect(0,0,u.value.width,o*2)};C(w,()=>{x.forEach(e=>{const a=P(e);Math.abs(c.yawLinesX[e]-a)>90?c.yawLinesX[e]=a:pe.to(c.yawLinesX,{duration:2.5,ease:"elastic.out(1.2, 0.5)",[e]:a})})}),C([c,u,t.value.options],()=>{S.isWidgetVisible(t.value)&&te(()=>F())});const Y=oe(h);return C(Y,(e,a)=>{e&&!a&&F()}),(e,a)=>(se(),ne(he,null,[E("div",Ve,[E("canvas",{ref_key:"canvasRef",ref:h,width:u.value.width,height:u.value.height},null,8,Se)]),l(ce,{modelValue:s(S).widgetManagerVars(s(t).hash).configMenuOpen,"onUpdate:modelValue":a[3]||(a[3]=o=>s(S).widgetManagerVars(s(t).hash).configMenuOpen=o),"min-width":"400","max-width":"35%"},{default:r(()=>[l(le,{class:"px-8 pb-6 pt-2",style:ie(s(L).globalGlassMenuStyles)},{default:r(()=>[l(re,{class:"text-center"},{default:r(()=>a[4]||(a[4]=[k("HUD Compass widget config")])),_:1}),l(ue,null,{default:r(()=>[l(A,{class:"ma-1",label:"Show yaw value",color:s(t).options.showYawValue?"white":void 0,"model-value":s(t).options.showYawValue,"hide-details":"",onChange:a[0]||(a[0]=o=>s(t).options.showYawValue=!s(t).options.showYawValue)},null,8,["color","model-value"]),l(A,{class:"ma-1",label:"Use -180/+180 range",color:s(t).options.useNegativeRange?"white":void 0,"model-value":s(t).options.useNegativeRange,"hide-details":"",onChange:a[1]||(a[1]=o=>s(t).options.useNegativeRange=!s(t).options.useNegativeRange)},null,8,["color","model-value"]),l(we,null,{default:r(()=>[l(ve,{class:"bg-[#FFFFFF11] text-white mt-2"},{default:r(()=>[l(me,null,{default:r(()=>a[5]||(a[5]=[k("Color")])),_:1}),l(Ce,null,{default:r(()=>[l(de,{modelValue:s(t).options.hudColor,"onUpdate:modelValue":a[2]||(a[2]=o=>s(t).options.hudColor=o),theme:"dark",class:"ma-1 bg-[#FFFFFF11] text-white",swatches:W.value,width:"100%","show-swatches":""},null,8,["modelValue","swatches"])]),_:1})]),_:1})]),_:1})]),_:1})]),_:1},8,["style"])]),_:1},8,["modelValue"])],64))}}),Te=ge(xe,[["__scopeId","data-v-246f3d78"]]);export{Te as default};