import{aA as f,aB as P,aC as A,aD as E,aE as _,aF as m,aG as R,aH as D,l as d,aI as g,aJ as u,aK as y,i as l,aL as S,aM as k,aN as G,w as I,aO as L,aP as O,aQ as V,aR as $,aS as C,h as j,O as z,aT as F,aU as N,aV as H,aW as J,aX as K,aY as M,aZ as Q}from"./index-CAwa1Tno.js";const r=Symbol.for("vuetify:v-expansion-panel"),U=["default","accordion","inset","popout"],W=f({color:String,flat:Boolean,focusable:Boolean,static:Boolean,tile:Boolean,variant:{type:String,default:"default",validator:e=>U.includes(e)},readonly:Boolean,...P(),...A(),...E(),..._()},"VExpansionPanels"),ae=m()({name:"VExpansionPanels",props:W(),emits:{"update:modelValue":e=>!0},setup(e,o){let{slots:n}=o;R(e,r);const{themeClasses:a}=D(e),i=d(()=>e.variant&&`v-expansion-panels--variant-${e.variant}`);return g({VExpansionPanel:{color:u(e,"color"),readonly:u(e,"readonly")},VExpansionPanelTitle:{focusable:u(e,"focusable"),static:u(e,"static")}}),y(()=>l(e.tag,{class:["v-expansion-panels",{"v-expansion-panels--flat":e.flat,"v-expansion-panels--tile":e.tile},a.value,i.value,e.class],style:e.style},n)),{}}}),X=f({...P(),...S()},"VExpansionPanelText"),Y=m()({name:"VExpansionPanelText",props:X(),setup(e,o){let{slots:n}=o;const a=k(r);if(!a)throw new Error("[Vuetify] v-expansion-panel-text needs to be placed inside v-expansion-panel");const{hasContent:i,onAfterLeave:v}=G(e,a.isSelected);return y(()=>l(O,{onAfterLeave:v},{default:()=>{var c;return[I(l("div",{class:["v-expansion-panel-text",e.class],style:e.style},[n.default&&i.value&&l("div",{class:"v-expansion-panel-text__wrapper"},[(c=n.default)==null?void 0:c.call(n)])]),[[L,a.isSelected.value]])]}})),{}}}),T=f({color:String,expandIcon:{type:V,default:"$expand"},collapseIcon:{type:V,default:"$collapse"},hideActions:Boolean,focusable:Boolean,static:Boolean,ripple:{type:[Boolean,Object],default:!1},readonly:Boolean,...P()},"VExpansionPanelTitle"),Z=m()({name:"VExpansionPanelTitle",directives:{Ripple:$},props:T(),setup(e,o){let{slots:n}=o;const a=k(r);if(!a)throw new Error("[Vuetify] v-expansion-panel-title needs to be placed inside v-expansion-panel");const{backgroundColorClasses:i,backgroundColorStyles:v}=C(e,"color"),c=d(()=>({collapseIcon:e.collapseIcon,disabled:a.disabled.value,expanded:a.isSelected.value,expandIcon:e.expandIcon,readonly:e.readonly}));return y(()=>{var x;return I(l("button",{class:["v-expansion-panel-title",{"v-expansion-panel-title--active":a.isSelected.value,"v-expansion-panel-title--focusable":e.focusable,"v-expansion-panel-title--static":e.static},i.value,e.class],style:[v.value,e.style],type:"button",tabindex:a.disabled.value?-1:void 0,disabled:a.disabled.value,"aria-expanded":a.isSelected.value,onClick:e.readonly?void 0:a.toggle},[l("span",{class:"v-expansion-panel-title__overlay"},null),(x=n.default)==null?void 0:x.call(n,c.value),!e.hideActions&&l("span",{class:"v-expansion-panel-title__icon"},[n.actions?n.actions(c.value):l(z,{icon:a.isSelected.value?e.collapseIcon:e.expandIcon},null)])]),[[j("ripple"),e.ripple]])}),{}}}),q=f({title:String,text:String,bgColor:String,...P(),...F(),...N(),...S(),...H(),...E(),...T()},"VExpansionPanel"),ne=m()({name:"VExpansionPanel",props:q(),emits:{"group:selected":e=>!0},setup(e,o){let{slots:n}=o;const a=J(e,r),{backgroundColorClasses:i,backgroundColorStyles:v}=C(e,"bgColor"),{elevationClasses:c}=K(e),{roundedClasses:x}=M(e),h=d(()=>(a==null?void 0:a.disabled.value)||e.disabled),b=d(()=>a.group.items.value.reduce((s,t,p)=>(a.group.selected.value.includes(t.id)&&s.push(p),s),[])),B=d(()=>{const s=a.group.items.value.findIndex(t=>t.id===a.id);return!a.isSelected.value&&b.value.some(t=>t-s===1)}),w=d(()=>{const s=a.group.items.value.findIndex(t=>t.id===a.id);return!a.isSelected.value&&b.value.some(t=>t-s===-1)});return Q(r,a),g({VExpansionPanelText:{eager:u(e,"eager")},VExpansionPanelTitle:{readonly:u(e,"readonly")}}),y(()=>{const s=!!(n.text||e.text),t=!!(n.title||e.title);return l(e.tag,{class:["v-expansion-panel",{"v-expansion-panel--active":a.isSelected.value,"v-expansion-panel--before-active":B.value,"v-expansion-panel--after-active":w.value,"v-expansion-panel--disabled":h.value},x.value,i.value,e.class],style:[v.value,e.style]},{default:()=>{var p;return[l("div",{class:["v-expansion-panel__shadow",...c.value]},null),t&&l(Z,{key:"title",collapseIcon:e.collapseIcon,color:e.color,expandIcon:e.expandIcon,hideActions:e.hideActions,ripple:e.ripple},{default:()=>[n.title?n.title():e.title]}),s&&l(Y,{key:"text"},{default:()=>[n.text?n.text():e.text]}),(p=n.default)==null?void 0:p.call(n)]}})}),{}}});export{ae as V,ne as a,Z as b,Y as c};