const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const STORE="foodcheck-history-v11", FAV="foodcheck-favorites-v11", COMP="foodcheck-compare-v11", PREF="foodcheck-prefs-v11", CUSTOM="foodcheck-custom-v11";
const OLD=["foodcheck-history-v10","foodcheck-history-v3","foodcheck-history-v2","foodcheck-history-v1"];
let current=null,scanStream=null,scanRAF=0,scanActive=false,manualImage="";

const gasWords=["inulin","chicory","chicory root","cichorei","cichoreiwortel","oligofructose","fructooligosaccharide","fos","sorbitol","xylitol","maltitol","mannitol","erythritol"];
const fructanGroups=[
 {label:"القمح/دقيق القمح (فركتان)",re:/\b(wheat flour|whole wheat|wheat|tarwebloem|volkoren tarwe|tarwe|weizenmehl|weizen|farine de blé|farina di frumento)\b/i,score:1},
 {label:"البصل (فركتان)",re:/\b(onion powder|onions|onion|uien|uipoeder|ui-poeder|zwiebel|oignon)\b/i,score:2},
 {label:"الثوم (فركتان)",re:/\b(garlic powder|garlic|knoflookpoeder|knoflook|knoblauch|ail)\b/i,score:2}
];
const refluxWords=["chocolate","chocolade","cocoa","cacao","peppermint","mint","munt","caffeine","cafeïne","coffee","koffie","chili","hot pepper","spicy"];
const commonFoods=["موز","تفاح","برتقال","فراولة","كيوي","أفوكادو","شوفان","أرز","بطاطس","بيض","دجاج","سمك","زبادي","شوربة","سلطة"];
const prefs=()=>safeJSON(localStorage.getItem(PREF),{reflux:true,gas:true,chol:true,personal:true});
const history=()=>safeJSON(localStorage.getItem(STORE),[]);
const favorites=()=>safeJSON(localStorage.getItem(FAV),[]);
const compareList=()=>safeJSON(localStorage.getItem(COMP),[]);
const customFoods=()=>safeJSON(localStorage.getItem(CUSTOM),[]);
function safeJSON(s,f){try{return s?JSON.parse(s):f}catch{return f}}
function esc(s){return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function toast(s){const t=$("#toast");t.textContent=s;t.classList.remove("hidden");setTimeout(()=>t.classList.add("hidden"),2200)}
function saveHistory(h){localStorage.setItem(STORE,JSON.stringify(h.slice(0,100)))}
function saveCustom(c){try{localStorage.setItem(CUSTOM,JSON.stringify(c.slice(0,60)))}catch{toast("مساحة التخزين ممتلئة. جرّب صورة أصغر.")}}
function savePrefs(){localStorage.setItem(PREF,JSON.stringify({reflux:$("#reflux").checked,gas:$("#gas").checked,chol:$("#chol").checked,personal:$("#personal").checked}))}
function migrate(){
 if(!localStorage.getItem(STORE)){for(const k of OLD){const v=localStorage.getItem(k);if(v){localStorage.setItem(STORE,v);break}}}
 const oldP=localStorage.getItem("foodcheck-prefs-v10");if(!localStorage.getItem(PREF)&&oldP)localStorage.setItem(PREF,oldP);
 const oldF=localStorage.getItem("foodcheck-favorites-v10");if(!localStorage.getItem(FAV)&&oldF)localStorage.setItem(FAV,oldF);
 const oldC=localStorage.getItem("foodcheck-compare-v10");if(!localStorage.getItem(COMP)&&oldC)localStorage.setItem(COMP,oldC);
}
function isManualCode(code){return String(code||"").startsWith("manual-")}
function itemByCode(code){return customFoods().find(x=>x.code===code)||history().find(x=>x.code===code)||favorites().find(x=>x.code===code)}

function personalStats(code){
 const item=history().find(x=>x.code===code),logs=item?.symptoms||[];
 const bad=logs.filter(s=>s.items?.length&&!s.items.includes("بدون أعراض"));
 const counts={heart:0,gas:0,bloat:0};bad.forEach(s=>{if(s.items.includes("حرقان"))counts.heart++;if(s.items.includes("غازات"))counts.gas++;if(s.items.includes("انتفاخ"))counts.bloat++});
 return{logs,bad,counts};
}
function evaluate(p){
 const pr=prefs(),ing=(p.ingredients_text||"").toLowerCase(),sat=Number(p.nutriments?.["saturated-fat_100g"]);
 const out={reflux:{cls:"gray",label:"غير معروف",detail:"بيانات غير كافية"},gas:{cls:"gray",label:"غير معروف",detail:"بيانات غير كافية"},chol:{cls:"gray",label:"غير معروف",detail:"لا توجد قيمة للدهون المشبعة"}};
 let score=0,known=false;
 if(pr.gas){
  const h=[...new Set(gasWords.filter(w=>ing.includes(w)))];
  const fructans=fructanGroups.filter(g=>g.re.test(ing));
  if(h.length||fructans.length){
    const notes=[];
    if(h.length)notes.push("مكونات قد تزيد الغازات: "+h.slice(0,4).join("، "));
    if(fructans.length)notes.push("قد يسبب انتفاخًا عند بعض الأشخاص بسبب "+fructans.map(g=>g.label).join("، "));
    out.gas={cls:"yellow",label:"بحذر",detail:notes.join(". ")};
    score+=h.length?2:Math.max(...fructans.map(g=>g.score));
    known=true;
  }else if(ing){out.gas={cls:"green",label:"لا توجد إشارة واضحة",detail:"لم أجد ضمن المكونات محفزات الغازات/الفركتان التي يبحث عنها التطبيق"};known=true}
 }
 if(pr.reflux){const h=[...new Set(refluxWords.filter(w=>ing.includes(w)))];if(h.length){out.reflux={cls:"yellow",label:"بحذر",detail:"وجدت: "+h.slice(0,4).join("، ")};score+=2;known=true}else if(ing){out.reflux={cls:"green",label:"لا توجد إشارة واضحة",detail:"لم أجد محفزات الارتجاع التي يبحث عنها التطبيق"};known=true}}
 if(pr.chol&&Number.isFinite(sat)){known=true;if(sat>5){out.chol={cls:"red",label:"مرتفع",detail:sat+" غ/100غ"};score+=3}else if(sat>1.5){out.chol={cls:"yellow",label:"متوسط",detail:sat+" غ/100غ"};score+=1}else out.chol={cls:"green",label:"منخفض",detail:sat+" غ/100غ"}}
 let personalNote="";
 if(pr.personal&&p.code){const ps=personalStats(p.code);if(ps.logs.length){known=true;if(ps.bad.length){score+=Math.min(3,ps.bad.length);personalNote=`🧠 سجلّك: ظهرت أعراض في ${ps.bad.length} من ${ps.logs.length} تجربة.`}else personalNote=`🧠 سجلّك: ${ps.logs.length} تجربة بدون أعراض مسجلة.`}}
 const overall=!known?{cls:"gray",label:p.manual?"⚪ أضف مكونات أو سجّل تجربتك":"⚪ معلومات غير كافية"}:score>=5?{cls:"red",label:"🔴 غير مناسب غالبًا لك"}:score>=1?{cls:"yellow",label:"🟡 جرّبه بحذر"}:{cls:"green",label:"🟢 مناسب غالبًا"};
 return{...out,overall,personalNote};
}

async function lookup(code){
 code=(code||"").replace(/\D/g,"");if(!code){toast("اكتب رقم الباركود أولًا");return}
 $("#barcode").value=code;showLoading();
 try{
  const fields="code,product_name,brands,image_front_small_url,ingredients_text,nutriments,nutriscore_grade,quantity";
  const r=await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=${fields}`,{headers:{Accept:"application/json"}});
  if(!r.ok)throw new Error("تعذر الاتصال بقاعدة المنتجات");
  const d=await r.json();if(d.status!==1||!d.product)throw new Error("لم أجد هذا المنتج في Open Food Facts");
  current={...d.product,code};addHistory(current);renderProduct(current);$("#searchResults").classList.add("hidden");
 }catch(e){$("#result").classList.remove("hidden");$("#result").innerHTML=`<p class="error"><b>تعذر تحليل المنتج.</b><br>${esc(e.message)}</p><button id="manualFallback" class="primary">✍️ أضفه يدويًا</button>`;$("#manualFallback").onclick=()=>openManual(false)}
}
function openLocal(code){const x=itemByCode(code);if(!x)return;current={...x,product_name:x.name||x.product_name};addHistory(current);renderProduct(current);showView("scanView");window.scrollTo({top:0,behavior:"smooth"})}
async function searchByName(q){
 q=(q||"").trim();if(q.length<2){toast("اكتب اسمًا أطول قليلًا");return}
 const box=$("#searchResults");box.classList.remove("hidden");box.innerHTML='<div class="loader"></div><p style="text-align:center">جاري البحث…</p>';
 const local=customFoods().filter(x=>(x.name||"").toLowerCase().includes(q.toLowerCase())).slice(0,6);
 let remote=[];
 try{
  const url=`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=10`;
  const r=await fetch(url);const d=await r.json();remote=(d.products||[]).filter(p=>p.code&&p.product_name).slice(0,8);
 }catch{}
 if(!local.length&&!remote.length){box.innerHTML=`<p class="small">لم أجد نتائج جاهزة.</p><button id="addSearchManual" class="primary">➕ أضف «${esc(q)}» يدويًا</button>`;$("#addSearchManual").onclick=()=>openManual(false,q);return}
 box.innerHTML='<h2>نتائج البحث</h2>'+
   (local.length?'<h3>من أكلاتك</h3>'+local.map(x=>`<div class="search-item clickable local-result" data-code="${esc(x.code)}">${x.image?`<img src="${esc(x.image)}" alt="">`:""}<div class="grow"><b>${esc(x.name)}</b><div class="small">${esc(categoryLabel(x.category))}</div></div><span>›</span></div>`).join(""):"")+
   (remote.length?'<h3>منتجات</h3>'+remote.map(p=>`<div class="search-item clickable remote-result" data-code="${esc(p.code)}">${p.image_front_small_url?`<img src="${esc(p.image_front_small_url)}" alt="">`:""}<div class="grow"><b>${esc(p.product_name)}</b><div class="small">${esc(p.brands||"")} · ${esc(p.code)}</div></div><span>›</span></div>`).join(""):"");
 $$(".local-result").forEach(el=>el.onclick=()=>openLocal(el.dataset.code));$$(".remote-result").forEach(el=>el.onclick=()=>lookup(el.dataset.code));
}
function showLoading(){$("#result").classList.remove("hidden");$("#result").innerHTML='<div class="loader"></div><p style="text-align:center">جاري تحليل المنتج…</p>'}
function status(icon,title,x){return`<div class="statusbox ${x.cls}"><div class="statushead"><span>${icon} ${title}</span><b>${x.label}</b></div><div class="small">${esc(x.detail)}</div></div>`}
function categoryLabel(v){return({fruit:"فاكهة",vegetable:"خضار",meal:"وجبة / أكلة",drink:"مشروب",snack:"سناك",other:"أخرى"})[v]||"أخرى"}
function renderProduct(p){
 const e=evaluate(p),name=p.product_name||p.name||"بدون اسم",img=p.image_front_small_url||p.image||"",ing=p.ingredients_text||"",isFav=favorites().some(x=>x.code===p.code),inComp=compareList().some(x=>x.code===p.code);
 $("#result").classList.remove("hidden");
 $("#result").innerHTML=`<div class="product">${img?`<img src="${esc(img)}" alt="">`:""}<div><h2>${esc(name)}</h2><div class="small">${p.manual?esc(categoryLabel(p.category)):(esc(p.brands||"")+(p.quantity?" · "+esc(p.quantity):""))}<br>${p.manual?"إضافة يدوية":esc(p.code)}</div><p><span class="badge ${e.overall.cls}">${e.overall.label}</span></p></div></div>
 <div class="healthgrid">${status("🔥","الحرقان",e.reflux)}${status("💨","الغازات والانتفاخ",e.gas)}${status("❤️","الدهون المشبعة",e.chol)}</div>
 ${e.personalNote?`<div class="personal ${e.overall.cls}">${esc(e.personalNote)}</div>`:""}
 ${p.notes?`<div class="personal gray">📝 ${esc(p.notes)}</div>`:""}
 ${ing?`<details class="ingredients"><summary>عرض المكونات</summary><p class="small">${esc(ing)}</p></details>`:""}
 <div class="actions"><button id="ateBtn">🍽️ سجل تجربتي</button><button id="favBtn">${isFav?"★ إزالة من المفضلة":"☆ أضف للمفضلة"}</button><button id="compareBtn">${inComp?"✓ في المقارنة":"⚖️ أضف للمقارنة"}</button>${p.manual?'<button id="editManualBtn">✏️ تعديل الأكلة</button>':""}<button id="copyBtn">📋 نسخ النتيجة</button></div>
 <p class="small">${p.manual?"الأكلات اليدوية تعتمد على المكونات التي تدخلها وسجل تجربتك.":"التقييم إرشادي ومبني على البيانات المتاحة وسجلّك الشخصي."}</p>`;
 $("#ateBtn").onclick=openSymptoms;$("#favBtn").onclick=toggleFavorite;$("#compareBtn").onclick=toggleCompare;
 if(p.manual)$("#editManualBtn").onclick=()=>openManual(false,null,p);
 $("#copyBtn").onclick=async()=>{try{await navigator.clipboard.writeText(`${name}: ${e.overall.label}`);toast("تم نسخ النتيجة")}catch{toast("تعذر النسخ")}};
}
function productSnapshot(p){return{code:p.code,name:p.product_name||p.name||"بدون اسم",brands:p.brands||"",image:p.image_front_small_url||p.image||"",ingredients_text:p.ingredients_text||"",nutriments:p.nutriments||{},quantity:p.quantity||"",manual:!!p.manual,category:p.category||"",notes:p.notes||""}}
function addHistory(p){let h=history(),old=h.find(x=>x.code===p.code),symptoms=old?.symptoms||[];h=h.filter(x=>x.code!==p.code);h.unshift({...productSnapshot(p),at:Date.now(),symptoms});saveHistory(h);renderHistory();renderDashboard()}
function renderHistory(){const h=history();$("#history").innerHTML=h.length?h.slice(0,20).map(x=>`<div class="history-item clickable" data-code="${esc(x.code)}">${x.image?`<img src="${esc(x.image)}" alt="">`:""}<div class="grow"><b>${esc(x.name)}</b><div class="small">${x.manual?esc(categoryLabel(x.category)):esc(x.code)}</div></div><span class="pill">${x.symptoms?.length||0} تجربة</span></div>`).join(""):'<p class="small">لم تفحص أو تضف أي شيء بعد.</p>';$$("#history .history-item").forEach(el=>el.onclick=()=>isManualCode(el.dataset.code)?openLocal(el.dataset.code):lookup(el.dataset.code))}
function openSymptoms(){$("#sNone").checked=$("#sHeart").checked=$("#sGas").checked=$("#sBloat").checked=false;$("#symptoms").showModal()}
function saveSymptoms(){
 if(!current)return;let h=history(),item=h.find(x=>x.code===current.code);if(!item){addHistory(current);h=history();item=h.find(x=>x.code===current.code)}
 const vals=[];if($("#sNone").checked)vals.push("بدون أعراض");if($("#sHeart").checked)vals.push("حرقان");if($("#sGas").checked)vals.push("غازات");if($("#sBloat").checked)vals.push("انتفاخ");
 if(!vals.length){toast("اختر الأعراض أو بدون أعراض");return}
 item.symptoms=item.symptoms||[];item.symptoms.unshift({at:Date.now(),items:vals,severity:+$("#severity").value});saveHistory(h);renderHistory();renderDashboard();setTimeout(()=>renderProduct(current),20);toast("تم حفظ تجربتك")
}
function toggleFavorite(){if(!current)return;let f=favorites();const exists=f.some(x=>x.code===current.code);f=exists?f.filter(x=>x.code!==current.code):[productSnapshot(current),...f];localStorage.setItem(FAV,JSON.stringify(f));renderFavorites();renderProduct(current);toast(exists?"تمت الإزالة من المفضلة":"تمت الإضافة للمفضلة")}
