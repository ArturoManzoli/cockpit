import{d as B,a5 as U,v as u,A as I,x as w,o as L,j as z,a as f,X as F,aw as q,ax as G,a4 as X,q as J,D as Y,u as K,a9 as Q,G as Z,l as E,ar as ee,as as c,ay as te,ap as N,an as ae,H as se,c as oe,i as P,J as ne,ag as le,b as g,L as ie,a1 as re,a2 as de,a3 as ce}from"./index-DPxUdPy8.js";import{g as h}from"./index-DjKJqAo0.js";const ge=B({__name:"Dialog",props:{show:Boolean},emits:["update:show"],setup(n,{emit:v}){const p=n,k=v,d=U(p).show,l=u(d.value),r=u(),m=u();return I(()=>{r.value.addEventListener("click",a=>{!a.target||a.target instanceof HTMLElement&&!a.target.closest(".action-button")&&a.target.nodeName!=="DIALOG"||(l.value=!1)}),document.addEventListener("keydown",a=>{l.value&&a.key==="Escape"&&(a.preventDefault(),a.stopImmediatePropagation(),l.value=!1)},{passive:!1})}),w(d,()=>l.value=d.value),w(l,()=>{l.value?r.value.showModal():(r.value.setAttribute("closing",""),r.value.addEventListener("animationend",()=>{r.value.removeAttribute("closing"),r.value.close()},{once:!0})),k("update:show",l.value)}),(a,s)=>(L(),z(G,{to:"body"},[f("dialog",{ref_key:"dialogRef",ref:r,class:"modal"},[f("div",F({ref_key:"dialogContentRef",ref:m},a.$attrs,{class:"flex flex-col items-center justify-center w-full h-full p-5 backdrop-blur-sm"}),[q(a.$slots,"default")],16)],512)]))}}),ue=n=>(re("data-v-758f6fd3"),n=n(),de(),n),fe=["height","width"],ve={class:"flex items-center"},pe=ue(()=>f("span",{class:"mr-3 text-slate-100"},"Heading style",-1)),he={class:"w-40"};var O=(n=>(n.NORTH_UP="North Up",n.HEAD_UP="Head Up",n))(O||{});const we=B({__name:"Compass",props:{widget:{}},setup(n){const v=X();J.registerUsage(Y.heading);const p=K(),k=u(),d=u(),l=u(),r={0:"N",45:"NE",90:"E",135:"SE",180:"S",225:"SW",270:"W",315:"NW"},m=Object.values(O),s=U(n).widget;Q(()=>{Object.keys(s.value.options).length===0&&(s.value.options={headingStyle:m[0]})}),I(()=>{V(),M()});const{width:H,height:$}=Z(),T=E(()=>s.value.size.width*H.value),R=E(()=>s.value.size.height*$.value),y=E(()=>T.value<R.value?T.value:R.value),M=()=>{if(d.value===void 0||d.value===null)return;l.value===void 0&&(l.value=d.value.getContext("2d"));const e=l.value;ee(e);const t=.5*y.value,i=.13*y.value,D=.03*t;e.textAlign="center",e.strokeStyle="white",e.font=`bold ${i}px Arial`,e.fillStyle="white",e.lineWidth=D,e.textBaseline="middle";const x=.7*t,W=.4*t,C=.55*t;e.translate(t,t),e.font=`bold ${i}px Arial`,e.fillText(`${o.yawAngleDegrees.toFixed(0)}°`,.15*i,0),e.rotate(c(-90)),s.value.options.headingStyle=="Head Up"&&e.rotate(-c(o.yawAngleDegrees));for(const[S,j]of Object.entries(r))e.save(),e.rotate(c(Number(S))),e.beginPath(),e.moveTo(C,0),e.lineTo(x,0),e.textBaseline="bottom",e.font=`bold ${.7*i}px Arial`,e.translate(x*1.025,0),e.rotate(c(90)),e.fillText(j,0,0),e.stroke(),e.restore();for(const S of te(360))S%9===0&&(e.save(),e.lineWidth=.25*D,e.rotate(c(Number(S))),e.beginPath(),e.moveTo(1.1*C,0),e.lineTo(x,0),e.stroke(),e.restore());e.beginPath(),e.arc(0,0,x,0,c(360)),e.stroke(),s.value.options.headingStyle=="North Up"?e.rotate(c(o.yawAngleDegrees)):e.rotate(c(o.yawAngleDegrees)),e.beginPath(),e.lineWidth=1,e.strokeStyle="red",e.fillStyle="red";const _=.05*t;e.moveTo(W,_),e.lineTo(C-.5*_,0),e.lineTo(W,-_),e.lineTo(W,_),e.closePath(),e.fill(),e.stroke()},b=u(.01);let A;w(p.attitude,e=>{if(A===void 0){b.value=N(p.attitude.yaw),A=e.yaw;return}Math.abs(N(e.yaw-A))>.1&&(A=e.yaw,b.value=N(p.attitude.yaw))});const o=ae({yawAngleDegrees:0}),V=()=>{const e=b.value,t=e<0?e+360:e,i=o.yawAngleDegrees>270&&t<90,D=o.yawAngleDegrees<90&&t>270;i?(h.to(o,.05,{yawAngleDegrees:0}),h.fromTo(o,.05,{yawAngleDegrees:0},{yawAngleDegrees:t})):D?(h.to(o,.05,{yawAngleDegrees:360}),h.fromTo(o,.05,{yawAngleDegrees:360},{yawAngleDegrees:t})):h.to(o,.1,{yawAngleDegrees:t})};return w(b,()=>V()),w([o,T,R],()=>{v.isWidgetVisible(s.value)&&se(()=>M())}),(e,t)=>(L(),oe(ie,null,[f("div",{ref_key:"compassRoot",ref:k,class:"compass"},[f("canvas",{ref_key:"canvasRef",ref:d,height:y.value,width:y.value,class:"rounded-[15%] bg-slate-950/70"},null,8,fe)],512),P(ge,{show:g(v).widgetManagerVars(g(s).hash).configMenuOpen,"onUpdate:show":t[1]||(t[1]=i=>g(v).widgetManagerVars(g(s).hash).configMenuOpen=i),class:"flex pa-4 bg-[#ffffff10] text-white backdrop-blur-2xl border-[1px] border-[#FAFAFA12]"},{default:ne(()=>[f("div",ve,[pe,f("div",he,[P(le,{modelValue:g(s).options.headingStyle,"onUpdate:modelValue":t[0]||(t[0]=i=>g(s).options.headingStyle=i),options:g(m)},null,8,["modelValue","options"])])])]),_:1},8,["show"])],64))}}),be=ce(we,[["__scopeId","data-v-758f6fd3"]]);export{be as default};