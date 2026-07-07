import{c as B,j as r,ad as se,r as u,i as V,U as oe,t as U,B as j,I as le,S as R,b as z,d as D,e as F,f as A,m as G}from"./index-CWP3SedY.js";import{C as L,a as ie,c as ne,b as J}from"./card-BGf9ITTy.js";import{B as C}from"./badge-BvFQj71S.js";import{D as ce,a as de,d as me,b as pe,c as ue}from"./dialog-BaUrvJcY.js";import{S as W}from"./sparkles-Dw33xRmh.js";import{S as q}from"./search-B3jWUKlz.js";import{L as he}from"./loader-circle-B6FQ2n51.js";import{H as ge}from"./heart-CTJq7q6Z.js";import"./vendor-dUYnP3YU.js";import"./index-Cof_SeJ4.js";import"./index-ndialj7g.js";/**
 * @license lucide-react v0.545.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xe=[["path",{d:"M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z",key:"1a0edw"}],["path",{d:"M12 22V12",key:"d0xqtd"}],["polyline",{points:"3.29 7 12 12 20.71 7",key:"ousv84"}],["path",{d:"m7.5 4.27 9 5.15",key:"1c824w"}]],K=B("package",xe);/**
 * @license lucide-react v0.545.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fe=[["path",{d:"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",key:"r04s7s"}]],ye=B("star",fe);/**
 * @license lucide-react v0.545.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const be=[["path",{d:"M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5",key:"slp6dd"}],["path",{d:"M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244",key:"o0xfot"}],["path",{d:"M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05",key:"wn3emo"}]],ve=B("store",be);function M({className:e,...a}){return r.jsx("div",{"data-slot":"skeleton",className:se("bg-accent animate-pulse rounded-md",e),...a})}let we={data:""},je=e=>{if(typeof window=="object"){let a=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return a.nonce=window.__nonce__,a.parentNode||(e||document.head).appendChild(a),a.firstChild}return e||we},Ne=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,Pe=/\/\*[^]*?\*\/|  +/g,Z=/\n+/g,N=(e,a)=>{let t="",o="",c="";for(let i in e){let l=e[i];i[0]=="@"?i[1]=="i"?t=i+" "+l+";":o+=i[1]=="f"?N(l,i):i+"{"+N(l,i[1]=="k"?"":a)+"}":typeof l=="object"?o+=N(l,a?a.replace(/([^,])+/g,d=>i.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,m=>/&/.test(m)?m.replace(/&/g,d):d?d+" "+m:m)):i):l!=null&&(i=/^--/.test(i)?i:i.replace(/[A-Z]/g,"-$&").toLowerCase(),c+=N.p?N.p(i,l):i+":"+l+";")}return t+(a&&c?a+"{"+c+"}":c)+o},v={},Y=e=>{if(typeof e=="object"){let a="";for(let t in e)a+=t+Y(e[t]);return a}return e},Se=(e,a,t,o,c)=>{let i=Y(e),l=v[i]||(v[i]=(m=>{let g=0,f=11;for(;g<m.length;)f=101*f+m.charCodeAt(g++)>>>0;return"go"+f})(i));if(!v[l]){let m=i!==e?e:(g=>{let f,s,n=[{}];for(;f=Ne.exec(g.replace(Pe,""));)f[4]?n.shift():f[3]?(s=f[3].replace(Z," ").trim(),n.unshift(n[0][s]=n[0][s]||{})):n[0][f[1]]=f[2].replace(Z," ").trim();return n[0]})(e);v[l]=N(c?{["@keyframes "+l]:m}:m,t?"":"."+l)}let d=t&&v.g?v.g:null;return t&&(v.g=v[l]),((m,g,f,s)=>{s?g.data=g.data.replace(s,m):g.data.indexOf(m)===-1&&(g.data=f?m+g.data:g.data+m)})(v[l],a,o,d),l},ke=(e,a,t)=>e.reduce((o,c,i)=>{let l=a[i];if(l&&l.call){let d=l(t),m=d&&d.props&&d.props.className||/^go/.test(d)&&d;l=m?"."+m:d&&typeof d=="object"?d.props?"":N(d,""):d===!1?"":d}return o+c+(l??"")},"");function _(e){let a=this||{},t=e.call?e(a.p):e;return Se(t.unshift?t.raw?ke(t,[].slice.call(arguments,1),a.p):t.reduce((o,c)=>Object.assign(o,c&&c.call?c(a.p):c),{}):t,je(a.target),a.g,a.o,a.k)}let X,I,Q;_.bind({g:1});let w=_.bind({k:1});function Ae(e,a,t,o){N.p=a,X=e,I=t,Q=o}function P(e,a){let t=this||{};return function(){let o=arguments;function c(i,l){let d=Object.assign({},i),m=d.className||c.className;t.p=Object.assign({theme:I&&I()},d),t.o=/ *go\d+/.test(m),d.className=_.apply(t,o)+(m?" "+m:"");let g=e;return e[0]&&(g=d.as||e,delete d.as),Q&&g[0]&&Q(d),X(g,d)}return c}}var Ce=e=>typeof e=="function",T=(e,a)=>Ce(e)?e(a):e,Ee=(()=>{let e=0;return()=>(++e).toString()})(),$e=(()=>{let e;return()=>{if(e===void 0&&typeof window<"u"){let a=matchMedia("(prefers-reduced-motion: reduce)");e=!a||a.matches}return e}})(),_e=20,ee="default",te=(e,a)=>{let{toastLimit:t}=e.settings;switch(a.type){case 0:return{...e,toasts:[a.toast,...e.toasts].slice(0,t)};case 1:return{...e,toasts:e.toasts.map(l=>l.id===a.toast.id?{...l,...a.toast}:l)};case 2:let{toast:o}=a;return te(e,{type:e.toasts.find(l=>l.id===o.id)?1:0,toast:o});case 3:let{toastId:c}=a;return{...e,toasts:e.toasts.map(l=>l.id===c||c===void 0?{...l,dismissed:!0,visible:!1}:l)};case 4:return a.toastId===void 0?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(l=>l.id!==a.toastId)};case 5:return{...e,pausedAt:a.time};case 6:let i=a.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(l=>({...l,pauseDuration:l.pauseDuration+i}))}}},Re=[],ze={toasts:[],pausedAt:void 0,settings:{toastLimit:_e}},S={},re=(e,a=ee)=>{S[a]=te(S[a]||ze,e),Re.forEach(([t,o])=>{t===a&&o(S[a])})},ae=e=>Object.keys(S).forEach(a=>re(e,a)),De=e=>Object.keys(S).find(a=>S[a].toasts.some(t=>t.id===e)),H=(e=ee)=>a=>{re(a,e)},Fe=(e,a="blank",t)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:a,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...t,id:t?.id||Ee()}),E=e=>(a,t)=>{let o=Fe(a,e,t);return H(o.toasterId||De(o.id))({type:2,toast:o}),o.id},h=(e,a)=>E("blank")(e,a);h.error=E("error");h.success=E("success");h.loading=E("loading");h.custom=E("custom");h.dismiss=(e,a)=>{let t={type:3,toastId:e};a?H(a)(t):ae(t)};h.dismissAll=e=>h.dismiss(void 0,e);h.remove=(e,a)=>{let t={type:4,toastId:e};a?H(a)(t):ae(t)};h.removeAll=e=>h.remove(void 0,e);h.promise=(e,a,t)=>{let o=h.loading(a.loading,{...t,...t?.loading});return typeof e=="function"&&(e=e()),e.then(c=>{let i=a.success?T(a.success,c):void 0;return i?h.success(i,{id:o,...t,...t?.success}):h.dismiss(o),c}).catch(c=>{let i=a.error?T(a.error,c):void 0;i?h.error(i,{id:o,...t,...t?.error}):h.dismiss(o)}),e};var Le=w`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,Me=w`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Oe=w`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,Ie=P("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${Le} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${Me} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${Oe} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,Qe=w`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,Te=P("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${Qe} 1s linear infinite;
`,Be=w`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,Ve=w`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,He=P("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${Be} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${Ve} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,Ue=P("div")`
  position: absolute;
`,Ge=P("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,Je=w`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,We=P("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${Je} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,qe=({toast:e})=>{let{icon:a,type:t,iconTheme:o}=e;return a!==void 0?typeof a=="string"?u.createElement(We,null,a):a:t==="blank"?null:u.createElement(Ge,null,u.createElement(Te,{...o}),t!=="loading"&&u.createElement(Ue,null,t==="error"?u.createElement(Ie,{...o}):u.createElement(He,{...o})))},Ke=e=>`
0% {transform: translate3d(0,${e*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,Ze=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e*-150}%,-1px) scale(.6); opacity:0;}
`,Ye="0%{opacity:0;} 100%{opacity:1;}",Xe="0%{opacity:1;} 100%{opacity:0;}",et=P("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,tt=P("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,rt=(e,a)=>{let t=e.includes("top")?1:-1,[o,c]=$e()?[Ye,Xe]:[Ke(t),Ze(t)];return{animation:a?`${w(o)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${w(c)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}};u.memo(({toast:e,position:a,style:t,children:o})=>{let c=e.height?rt(e.position||a||"top-center",e.visible):{opacity:0},i=u.createElement(qe,{toast:e}),l=u.createElement(tt,{...e.ariaProps},T(e.message,e));return u.createElement(et,{className:e.className,style:{...c,...t,...e.style}},typeof o=="function"?o({icon:i,message:l}):u.createElement(u.Fragment,null,i,l))});Ae(u.createElement);_`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;const at=async(e,{signal:a}={})=>{if(!e?.trim())return[];try{return(await V.get("/shopping/search",{params:{q:e},signal:a,timeout:3e4})).data||[]}catch(t){return t.name==="AbortError"||t.name==="CanceledError"?[]:(console.error("searchProducts error:",t),[])}},st=async(e,{signal:a}={})=>{if(!e?.trim())return[];try{return(await V.get("/shopping/amazon",{params:{q:e},signal:a,timeout:3e4})).data||[]}catch(t){return t.name==="AbortError"||t.name==="CanceledError"?[]:(console.error("searchAmazonOnly error:",t),[])}},ot=async(e,{signal:a}={})=>{if(!e?.trim())return[];try{return(await V.get("/shopping/flipkart",{params:{q:e},signal:a,timeout:3e4})).data||[]}catch(t){return t.name==="AbortError"||t.name==="CanceledError"?[]:(console.error("searchFlipkartOnly error:",t),[])}},lt=async(e,a="all",{signal:t}={})=>{switch(a){case"amazon":return await st(e,{signal:t});case"flipkart":return await ot(e,{signal:t});case"all":default:return await at(e,{signal:t})}},O=12,it=e=>e<=.25?"0-3 months":e<=.5?"3-6 months":e<=1?"6-12 months":e<=2?"1-2 years":(e<=3,"2-3 years"),nt=(e="")=>e.toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,100),vt=()=>{const{selectedEntity:e}=u.useContext(oe),a=u.useRef(null),[t,o]=u.useState({products:[],filteredProducts:[],displayedProducts:[],searchQuery:"",selectedAgeRange:"All Ages",selectedPriceRange:"All Prices",selectedPriority:"All Priorities",currentPage:1,totalPages:1,selectedProduct:null,showProductDialog:!1,isSearching:!0,hasSearched:!1,error:null,favorites:new Set(JSON.parse(localStorage.getItem("baby_favorites")||"[]")),selectedStore:"all"});u.useEffect(()=>{const s=localStorage.getItem("baby_favorites");s&&o(n=>({...n,favorites:new Set(JSON.parse(s))}))},[]),u.useEffect(()=>{localStorage.setItem("baby_favorites",JSON.stringify([...t.favorites]))},[t.favorites]);const c=e?it(e.age):"",i=e?.gender==="male"?"boy":"girl",l=u.useCallback(async(s=null)=>{let n=s?.trim();if(n||(n=t.selectedAgeRange==="All Ages"?`${c} ${i} baby essentials clothes toys diapers india`:`${t.selectedAgeRange} ${i} baby essentials clothes toys diapers india`),!n||!e)return;a.current&&a.current.abort();const b=new AbortController;a.current=b,o(x=>({...x,isSearching:!0,hasSearched:!0,error:null,products:[],currentPage:1}));try{const x=await lt(n,t.selectedStore,{signal:b.signal}),y=new Map,k=(Array.isArray(x)?x:[]).filter(p=>p?.name&&(p.price||p.sale_price)).map(p=>({id:`prod_${Date.now()}_${Math.random()}`,name:p.name||"Baby Product",description:`Great for ${c} ${i} babies`,price:Number(p.sale_price||p.price||999),image_url:p.image_url||p.image||"https://via.placeholder.com/300x300.png?text=Baby",url:p.url||p.link||"#",rating:p.rating||4.2+Math.random()*.8,reviews:p.reviews||Math.floor(Math.random()*1e4),platform:p.platform||p.source||"Store",priority:Math.random()>.4?"Essential":"Recommended",ageRange:c})).filter(p=>{const $=`${nt(p.name)}-${p.price}-${p.platform}`;return y.has($)?!1:(y.set($,!0),!0)}).sort((p,$)=>p.price-$.price);o(p=>({...p,products:k,filteredProducts:k,isSearching:!1,error:k.length===0?"No products found for this search.":null})),k.length>0&&h.success(`Found ${k.length} products!`)}catch(x){if(x.name==="AbortError")return;console.error("Search failed:",x),o(y=>({...y,isSearching:!1,error:"Search failed. Please try again."})),h.error("Search failed")}},[c,i,t.selectedStore,t.selectedAgeRange,e]);u.useEffect(()=>{e&&l()},[e,t.selectedAgeRange,t.selectedStore,l]),u.useEffect(()=>{let s=[...t.products];if(t.searchQuery){const x=t.searchQuery.toLowerCase();s=s.filter(y=>y.name.toLowerCase().includes(x))}t.selectedPriceRange!=="All Prices"&&(s=s.filter(x=>{const y=x.price;switch(t.selectedPriceRange){case"Under ₹500":return y<500;case"₹500 - ₹1000":return y>=500&&y<=1e3;case"₹1000 - ₹2000":return y>=1e3&&y<=2e3;case"Above ₹2000":return y>2e3;default:return!0}})),t.selectedPriority!=="All Priorities"&&(s=s.filter(x=>x.priority===t.selectedPriority));const n=Math.ceil(s.length/O),b=(t.currentPage-1)*O;o(x=>({...x,filteredProducts:s,displayedProducts:s.slice(b,b+O),totalPages:n,currentPage:x.currentPage>n?1:x.currentPage}))},[t.products,t.searchQuery,t.selectedPriceRange,t.selectedPriority,t.currentPage]);const d=s=>{o(n=>({...n,selectedProduct:s,showProductDialog:!0}))},m=s=>{o(n=>{const b=new Set(n.favorites);return b.has(s)?b.delete(s):b.add(s),h.success(b.has(s)?"Added to favorites!":"Removed from favorites"),{...n,favorites:b}})},g=()=>{t.searchQuery.trim()&&l(t.searchQuery.trim())},f=s=>{s.key==="Enter"&&g()};return e?r.jsx("div",{className:"min-h-screen ",children:r.jsxs("div",{className:"max-w-7xl mx-auto px-4 py-8",children:[r.jsx(L,{className:"mb-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl",children:r.jsxs(ie,{className:"text-center py-12",children:[r.jsxs("div",{className:"flex justify-center gap-6 mb-6",children:[r.jsx(U,{className:"w-16 h-16"}),r.jsx(W,{className:"w-14 h-14 animate-pulse"})]}),r.jsxs(ne,{className:"text-5xl font-bold",children:["Shopping for ",e.name?.split(" ")[0]]}),r.jsxs("p",{className:"text-2xl mt-3 opacity-90",children:[c," old ",i," • ",t.products.length," products"]})]})}),r.jsx("div",{className:"flex justify-center gap-4 mb-8",children:["all","amazon","flipkart"].map(s=>r.jsxs(j,{variant:t.selectedStore===s?"default":"outline",onClick:()=>{o(n=>({...n,selectedStore:s})),l(t.searchQuery||void 0)},className:s==="amazon"?"text-orange-600":s==="flipkart"?"text-blue-600":"",children:[r.jsx(ve,{className:"w-5 h-5 mr-2"}),s==="all"?"All Stores":s.charAt(0).toUpperCase()+s.slice(1)]},s))}),r.jsxs("div",{className:"relative mb-6",children:[r.jsx(q,{className:"absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-6 h-6"}),r.jsx(le,{placeholder:`Search ${t.selectedStore==="all"?"all stores":t.selectedStore} `,value:t.searchQuery,onChange:s=>o(n=>({...n,searchQuery:s.target.value})),onKeyPress:f,className:"pl-14 pr-16 py-7 text-lg border-2",disabled:t.isSearching}),r.jsx(j,{onClick:g,disabled:t.isSearching||!t.searchQuery.trim(),className:"absolute button-primary right-2 top-1/2 -translate-y-1/2 h-12 px-6 ",children:t.isSearching?r.jsx(he,{className:"w-5 h-5 animate-spin"}):r.jsxs(r.Fragment,{children:[r.jsx(q,{className:"w-5 h-5 mr-2"}),"Search"]})})]}),r.jsxs("div",{className:"flex flex-wrap gap-4 mb-10",children:[r.jsxs(R,{value:t.selectedAgeRange,onValueChange:s=>o(n=>({...n,selectedAgeRange:s})),children:[r.jsx(z,{className:"w-56",children:r.jsx(D,{})}),r.jsx(F,{className:"bg-white text-black",children:["All Ages","0-3 months","3-6 months","6-12 months","1-2 years","2-3 years"].map(s=>r.jsx(A,{value:s,children:s},s))})]}),r.jsxs(R,{value:t.selectedPriceRange,onValueChange:s=>o(n=>({...n,selectedPriceRange:s,currentPage:1})),children:[r.jsx(z,{className:"w-56",children:r.jsx(D,{})}),r.jsx(F,{className:"bg-white text-black",children:["All Prices","Under ₹500","₹500 - ₹1000","₹1000 - ₹2000","Above ₹2000"].map(s=>r.jsx(A,{value:s,children:s},s))})]}),r.jsxs(R,{value:t.selectedPriority,onValueChange:s=>o(n=>({...n,selectedPriority:s,currentPage:1})),children:[r.jsx(z,{className:"w-56",children:r.jsx(D,{})}),r.jsxs(F,{className:"bg-white text-black",children:[r.jsx(A,{value:"All Priorities",children:"All Priorities"}),r.jsx(A,{value:"Essential",children:"Essential"}),r.jsx(A,{value:"Recommended",children:"Recommended"})]})]})]}),t.isSearching&&r.jsx("div",{className:"grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6",children:[...Array(12)].map((s,n)=>r.jsxs(L,{className:"overflow-hidden",children:[r.jsx(M,{className:"w-full h-64"}),r.jsxs(J,{className:"p-4",children:[r.jsx(M,{className:"h-6 w-3/4 mb-2"}),r.jsx(M,{className:"h-4 w-1/2"})]})]},n))}),!t.isSearching&&t.hasSearched&&(t.error||t.displayedProducts.length===0)&&r.jsxs(G.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},className:"text-center py-20 px-4 bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-purple-200",children:[r.jsxs("div",{className:"relative inline-block mb-6",children:[r.jsx(K,{className:"w-20 h-20 mx-auto text-purple-300"}),r.jsx(W,{className:"absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-pulse"})]}),r.jsx("h3",{className:"text-3xl font-bold text-purple-900 mb-2",children:"Features Coming Soon!"}),r.jsxs("p",{className:"text-lg text-gray-600 max-w-md mx-auto",children:["We are currently expanding our ",t.selectedStore!=="all"?t.selectedStore:"curated"," collection for ",r.jsx("b",{children:e.name}),". Check back shortly for personalized recommendations and exclusive deals!"]}),r.jsx(j,{variant:"outline",className:"mt-8 border-purple-400 text-purple-600 hover:bg-purple-50",onClick:()=>l("baby essentials india"),children:"Try General Search"})]}),!t.isSearching&&t.displayedProducts.length>0&&r.jsxs(r.Fragment,{children:[r.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mb-12",children:t.displayedProducts.map(s=>r.jsx(G.div,{initial:{opacity:0,scale:.9},animate:{opacity:1,scale:1},transition:{duration:.3},children:r.jsxs(L,{className:"overflow-hidden flex flex-col cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-300",onClick:()=>d(s),children:[r.jsxs("div",{className:"relative group",children:[r.jsx("img",{src:s.image_url||"https://via.placeholder.com/300x300.png?text=Product",alt:s.name,className:"w-full h-56 sm:h-64 md:h-56 lg:h-64 xl:h-60 object-cover bg-gray-50",onError:n=>{n.currentTarget.src="https://via.placeholder.com/300x300.png?text=Product"}}),r.jsx(C,{className:`absolute top-2 left-2 px-2 py-1 text-xs ${s.priority==="Essential"?"bg-red-600":"bg-orange-500"}`,children:s.priority}),r.jsxs(C,{className:"absolute top-2 right-2 px-2 py-1 text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold",children:["₹",s.price.toLocaleString()]}),r.jsx(j,{size:"icon",variant:"ghost",className:"absolute top-10 right-2 bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity",onClick:n=>{n.stopPropagation(),m(s.id)},children:r.jsx(ge,{className:`w-5 h-5 ${t.favorites.has(s.id)?"fill-red-500 text-red-500":"text-gray-700"}`})})]}),r.jsxs(J,{className:"p-3 flex-1 flex flex-col",children:[r.jsx("h3",{className:"font-semibold text-sm sm:text-base md:text-base line-clamp-2 leading-tight",children:s.name}),r.jsxs("div",{className:"flex items-center gap-2 mt-1 text-xs sm:text-sm text-gray-600",children:[s.rating&&r.jsxs(r.Fragment,{children:[r.jsx(ye,{className:"w-3 h-3 fill-yellow-400 text-yellow-400"}),r.jsxs("span",{children:[s.rating.toFixed(1)," (",s.reviews?.toLocaleString()||0," reviews)"]})]}),r.jsx(C,{variant:"secondary",className:"ml-auto text-[10px] sm:text-xs",children:s.platform})]}),r.jsx("div",{className:"mt-auto pt-3",children:r.jsxs(j,{className:"w-full text-sm sm:text-base bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium py-2 sm:py-3",onClick:n=>{n.stopPropagation(),window.open(s.url,"_blank")},children:[r.jsx(K,{className:"w-4 h-4 mr-1 inline"})," Buy Now"]})})]})]})},s.id))}),t.totalPages>1&&r.jsxs("div",{className:"flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-6 mb-8",children:[r.jsx(j,{variant:"outline",disabled:t.currentPage===1,onClick:()=>o(s=>({...s,currentPage:s.currentPage-1})),className:"w-full sm:w-auto",children:"Previous"}),r.jsxs("span",{className:"text-sm sm:text-base font-medium",children:["Page ",t.currentPage," of ",t.totalPages]}),r.jsx(j,{variant:"outline",disabled:t.currentPage===t.totalPages,onClick:()=>o(s=>({...s,currentPage:s.currentPage+1})),className:"w-full sm:w-auto",children:"Next"})]})]}),r.jsx(ce,{open:t.showProductDialog,onOpenChange:s=>o(n=>({...n,showProductDialog:s})),children:r.jsx(de,{className:" max-h-[90vh] overflow-y-auto",children:t.selectedProduct&&r.jsxs(r.Fragment,{children:[r.jsxs(me,{children:[r.jsx(pe,{className:"text-2xl pr-10",children:t.selectedProduct.name}),r.jsx(ue,{className:"text-lg",children:t.selectedProduct.description})]}),r.jsxs("div",{className:"grid md:grid-cols-2 gap-8 mt-8",children:[r.jsx("img",{src:t.selectedProduct.image_url,alt:t.selectedProduct.name,className:"w-full rounded-xl shadow-lg",onError:s=>{s.currentTarget.src="https://via.placeholder.com/500x500.png?text=Product"}}),r.jsxs("div",{className:"flex flex-col justify-center space-y-6",children:[r.jsxs("div",{className:"bg-gradient-to-r from-purple-100 to-pink-100 p-8 rounded-2xl",children:[r.jsxs("p",{className:"text-5xl font-bold text-purple-800 mb-6",children:["₹",t.selectedProduct.price.toLocaleString()]}),r.jsxs(j,{className:"w-full text-lg py-7 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600",size:"lg",onClick:()=>window.open(t.selectedProduct.url,"_blank"),children:["Buy Now on ",t.selectedProduct.platform]})]}),r.jsxs("div",{className:"flex gap-3 text-sm",children:[r.jsx(C,{variant:"secondary",className:"px-4 py-2",children:t.selectedProduct.priority}),r.jsx(C,{variant:"secondary",className:"px-4 py-2",children:t.selectedProduct.ageRange})]})]})]})]})})})]})}):r.jsx("div",{className:"min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50",children:r.jsxs("div",{className:"text-center",children:[r.jsx(U,{className:"w-20 h-20 mx-auto text-gray-400 mb-4"}),r.jsx("p",{className:"text-2xl text-gray-600",children:"Please select a child first"})]})})};export{vt as default};
//# sourceMappingURL=ShoppingPage-D9WLFa3J.js.map
