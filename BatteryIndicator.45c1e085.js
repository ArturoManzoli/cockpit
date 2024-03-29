import{d as c,u as p,i as s,e as u,w as d,o as _,c as v,a as t,n as m,t as a}from"./index.5904388b.js";const y={class:"flex items-center w-[5.5rem] h-12 text-white justify-center"},h=t("span",{class:"absolute text-sm text-yellow-400 -bottom-[2px] -right-[7px] mdi mdi-alert-circle"},null,-1),w=[h],x={class:"flex flex-col w-[4rem] select-none text-sm font-semibold leading-4 text-end"},f={class:"w-full"},g={class:"font-mono"},S=t("span",null," V",-1),b={class:"w-full"},D={class:"font-mono"},B=t("span",null," A",-1),C=c({__name:"BatteryIndicator",setup(N){const e=p(),n=s(()=>{var o;return((o=e==null?void 0:e.powerSupply)==null?void 0:o.voltage)===void 0?NaN:Math.abs(e.powerSupply.voltage)>=100?e.powerSupply.voltage.toFixed(0):e.powerSupply.voltage.toFixed(1)}),l=s(()=>{var o;return((o=e==null?void 0:e.powerSupply)==null?void 0:o.current)===void 0?NaN:Math.abs(e.powerSupply.current)>=100?e.powerSupply.current.toFixed(0):e.powerSupply.current.toFixed(1)}),i=s(()=>"mdi-battery");return(o,V)=>{const r=u("tooltip");return d((_(),v("div",y,[t("span",{class:m(["relative w-[1.5rem] mdi battery-icon",[i.value]])},w,2),t("div",x,[t("div",f,[t("span",g,a(n.value),1),S]),t("div",b,[t("span",D,a(l.value),1),B])])])),[[r,"Your vehicle does not provide state-of-charge. Displaying voltage and current instead."]])}}});export{C as default};
