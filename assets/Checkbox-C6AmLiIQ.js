import{c as b,z as v,J as V,w as f,o as k,au as C,h as w,av as y,aw as x,l as d,m as p,s as a,t as M,v as F,H as O,x as m,S,O as W,ax as A}from"./index-BEFBJa3q.js";const D={key:0,class:"mr-3 mb-[3px] text-white"},_=b({__name:"Checkbox",props:{miniWidget:{}},setup(h){const t=v(),e=V(h).miniWidget,g=()=>{t.editingMode||e.value.options.actionVariable&&A(e.value.options.actionVariable.name,e.value.checked)};return f(()=>t.miniWidgetManagerVars(e.value.hash).configMenuOpen,o=>{o===!0&&(t.showElementPropsDrawer(e.value.hash),setTimeout(()=>{t.miniWidgetManagerVars(e.value.hash).configMenuOpen=!1},200))},{immediate:!0,deep:!0}),k(()=>{(!e.value.options||Object.keys(e.value.options).length===0)&&(e.value.isCustomElement=!0,t.updateElementOptions(e.value.hash,{variableType:"boolean",actionVariable:void 0,checked:!0,layout:{label:"",align:"center",color:"#FFFFFF"}})),e.value.options.actionVariable&&C(e.value.options.actionVariable.name,o=>{e.value.checked=o})}),w(()=>{e.value.options.actionVariable&&(y(e.value.options.actionVariable.name),x(e.value.options.actionVariable.name))}),(o,i)=>{var n,s,l,r,c;return d(),p("div",{class:m(["flex items-center h-[30px]",((n=a(t).elementToShowOnDrawer)==null?void 0:n.hash)===a(e).hash&&a(t).editingMode?"bg-[#00000010] ":"border-0"]),style:W({justifyContent:(s=a(e).options.layout)==null?void 0:s.align}),onClick:i[1]||(i[1]=u=>a(t).editingMode&&a(t).showElementPropsDrawer(a(e).hash))},[((l=a(e).options.layout)==null?void 0:l.label)!==""?(d(),p("p",D,M((r=a(e).options.layout)==null?void 0:r.label),1)):F("",!0),O(S,{modelValue:a(e).checked,"onUpdate:modelValue":i[0]||(i[0]=u=>a(e).checked=u),"hide-details":"",color:(c=a(e).options.layout)==null?void 0:c.color,class:m(["text-white",{"pointer-events-none":a(t).editingMode}]),theme:"dark",onChange:g},null,8,["modelValue","color","class"])],6)}}});export{_ as default};