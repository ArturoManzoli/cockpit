import{c as A,z as O,J as R,r as f,w as W,o as S,au as B,k as L,h as T,av as j,aw as P,l as V,m as b,n as r,x as m,O as y,s as n,t as I,v as N,ax as X,_ as Y}from"./index-BEFBJa3q.js";const $={class:"potentiometer-scale elevation-5"},J={key:0,class:"value-display bg-[#FFFFFF22] border-[#FFFFFF44] border-[1px] rounded-md p-[2px] min-w-9 text-center elevation-1"},U=A({__name:"Dial",props:{miniWidget:{}},setup(w){const a=O(),e=R(w).miniWidget,u=f(0),c=f(-150);W(()=>a.miniWidgetManagerVars(e.value.hash).configMenuOpen,t=>{t===!0&&(a.showElementPropsDrawer(e.value.hash),setTimeout(()=>{a.miniWidgetManagerVars(e.value.hash).configMenuOpen=!1},200))},{immediate:!0,deep:!0,flush:"post"}),S(()=>{var t;(!e.value.options||Object.keys(e.value.options).length===0)&&(e.value.isCustomElement=!0,a.updateElementOptions(e.value.hash,{variableType:"number",actionVariable:void 0,layout:{minValue:0,maxValue:100,size:"small",showValue:!0,align:"center"}})),e.value.options.actionVariable&&B((t=e.value.options.actionVariable)==null?void 0:t.name,i=>{var s;u.value=i;const o=300,l=e.value.options.layout.maxValue-e.value.options.layout.minValue||1;c.value=(i-((s=e.value.options.layout)==null?void 0:s.minValue))/l*o-150})});const x=L(()=>{var t;switch((t=e.value.options.layout)==null?void 0:t.size){case"medium":return"potentiometer-medium";case"large":return"potentiometer-large";default:return"potentiometer-small"}}),M=t=>{t.preventDefault();const o=t.currentTarget.getBoundingClientRect(),l=d=>{var v,g,h;const F=o.left+o.width/2,k=o.top+o.height/2,C=d.clientX-F,D=d.clientY-k,_=Math.atan2(D,C)*(180/Math.PI),p=Math.max(-150,Math.min(150,_));c.value=p;const E=300,z=((v=e.value.options.layout)==null?void 0:v.maxValue)-((g=e.value.options.layout)==null?void 0:g.minValue);if(u.value=(p+150)/E*z+((h=e.value.options.layout)==null?void 0:h.minValue),e.value.options.actionVariable){if(a.editingMode)return;X(e.value.options.actionVariable.name,u.value.toFixed(1))}},s=()=>{document.removeEventListener("mousemove",l),document.removeEventListener("mouseup",s)};document.addEventListener("mousemove",l),document.addEventListener("mouseup",s)};return T(()=>{e.value.options.actionVariable&&(j(e.value.options.actionVariable.name),P(e.value.options.actionVariable.name))}),(t,i)=>{var o,l,s;return V(),b("div",{id:"dial",class:m(["flex items-center w-auto",((o=n(a).elementToShowOnDrawer)==null?void 0:o.hash)===n(e).hash&&n(a).editingMode?"bg-[#00000010] ":"border-0"]),style:y({justifyContent:(l=n(e).options.layout)==null?void 0:l.align}),onClick:i[0]||(i[0]=d=>n(a).editingMode&&n(a).showElementPropsDrawer(n(e).hash))},[r("div",{class:m(["flex flex-row",n(a).editingMode?"pointer-events-none":"pointer-events-auto"])},[r("div",{class:m(["potentiometer-container w-full",x.value]),onMousedown:M},[r("div",$,[r("div",{class:"potentiometer-knob",style:y({transform:`rotate(${c.value}deg)`})},i[1]||(i[1]=[r("div",{class:"knob-notch"},null,-1)]),4)])],34)],2),(s=n(e).options.layout)!=null&&s.showValue?(V(),b("div",J,I(Math.round(u.value)),1)):N("",!0)],6)}}}),H=Y(U,[["__scopeId","data-v-e80d1147"]]);export{H as default};