const $=s=>document.querySelector(s);
const STORE="foodcheck-history-v3", OLD=["foodcheck-history-v2","foodcheck-history-v1"], PREF="foodcheck-prefs-v1";
let current=null;
const gasWords=["inulin","chicory","chicory root","cichorei","cichoreiwortel","oligofructose","fructooligosaccharide","fos","sorbitol","xylitol","maltitol","mannitol","erythritol"];
const refluxWords=["chocolate","chocolade","cocoa","cacao","peppermint","mint","munt","caffeine","cafeïne","coffee","koffie","chili","hot pepper","spicy"];
const prefs=()=>JSON.parse(localStorage.getItem(PREF)||'{"reflux":true,"gas":true,"chol":true}');
function migrate(){if(localStorage.getItem(STORE))return;for(const k of OLD){const v=localStorage.getItem(k);if(v){localStorage.setItem(STORE,v);break}}}
function savePrefs(){localStorage.setItem(PREF,JSON.stringify({reflux:$("#reflux").checked,gas:$("#gas").checked,chol:$("#chol").checked}))}
function norm(x){return(x||"").toLowerCase()} function uniq(a){return[...new Set(a)]}
function esc(s){return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function toast(s){const t=$("#toast");t.textContent=s;t.classList.remove("hidden");setTimeout(()=>t.classList.add("hidden"),2200)}
function evaluate(p){
 const pr=prefs(),ing=norm(p.ingredients_text),sat=Number(p.nutriments?.["saturated-fat_100g"]);
 const out={reflux:{cls:"gray",label:"غير معروف",detail:"بيانات غير كافية"},gas:{cls:"gray",label:"غير معروف",detail:"بيانات غير كافية"},chol:{cls:"gray",label:"غير معروف",detail:"لا توجد قيمة للدهون المشبعة"}};
 let score=0,known=false;
 if(pr.gas){const h=uniq(gasWords.filter(w=>ing.includes(w)));if(h.length){out.gas={cls:"yellow",label:"بحذر",detail:"وجدت: "+h.slice(0,4).join("، ")};score+=2;known=true}else if(ing){out.gas={cls:"green",label:"لا توجد إشارة واضحة",detail:"لم أجد محفزات الغازات التي يبحث عنها التطبيق"};known=true}}
 if(pr.reflux){const h=uniq(refluxWords.filter(w=>ing.includes(w)));if(h.length){out.reflux={cls:"yellow",label:"بحذر",detail:"وجدت: "+h.slice(0,4).join("، ")};score+=2;known=true}else if(ing){out.reflux={cls:"green",label:"لا توجد إشارة واضحة",detail:"لم أجد محفزات الارتجاع التي يبحث عنها التطبيق"};known=true}}
 if(pr.chol&&Number.isFinite(sat)){known=true;if(sat>5){out.chol={cls:"red",label:"مرتفع",detail:sat+" غ/100غ"};score+=3}else if(sat>1.5){out.chol={cls:"yellow",label:"متوسط",detail:sat+" غ/100غ"};score+=1}else out.chol={cls:"green",label:"منخفض",detail:sat+" غ/100غ"}}
 const overall=!known?{cls:"gray",label:"⚪ معلومات غير كافية"}:score>=4?{cls:"red",label:"🔴 يفضّل تجنبه مع الأعراض"}:score>=1?{cls:"yellow",label:"🟡 جرّبه بحذر"}:{cls:"green",label:"🟢 مناسب غالبًا"};
 return{...out,overall};
}
function history(){try{return JSON.parse(localStorage.getItem(STORE)||"[]")}catch{return[]}}
function saveHistory(h){localStorage.setItem(STORE,JSON.stringify(h.slice(0,60)))}
async function lookup(code){
 code=(code||"").replace(/\D/g,"");if(!code){toast("اكتب رقم الباركود أولًا");return} $("#barcode").value=code;showLoading();
 try{
  const fields="code,product_name,brands,image_front_small_url,ingredients_text,nutriments,nutriscore_grade,quantity";
  const r=await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=${fields}`,{headers:{Accept:"application/json"}});
  if(!r.ok)throw new Error("تعذر الاتصال بقاعدة المنتجات");
  const d=await r.json();if(d.status!==1||!d.product)throw new Error("لم أجد هذا المنتج في Open Food Facts");
  current={...d.product,code};addHistory(current);renderProduct(current);
 }catch(e){$("#result").classList.remove("hidden");$("#result").innerHTML=`<p class="error"><b>تعذر تحليل المنتج.</b><br>${esc(e.message)}</p><p class="small">يمكنك المحاولة مرة أخرى أو إدخال باركود منتج آخر.</p>`}
}
function showLoading(){$("#result").classList.remove("hidden");$("#result").innerHTML='<div class="loader"></div><p style="text-align:center">جاري تحليل المنتج…</p>'}
function status(icon,title,x){return`<div class="statusbox ${x.cls}"><div class="statushead"><span>${icon} ${title}</span><b>${x.label}</b></div><div class="small">${esc(x.detail)}</div></div>`}
function personalNote(code){const h=history().find(x=>x.code===code);if(!h?.symptoms?.length)return"";const bad=h.symptoms.filter(s=>s.items?.length&&!s.items.includes("بدون أعراض"));if(!bad.length)return'<div class="personal green">🧠 سجلّك الشخصي: لم تسجل أعراضًا مع هذا المنتج.</div>';return`<div class="personal yellow">🧠 سجلّك الشخصي: سجلت أعراضًا في ${bad.length} من ${h.symptoms.length} تجربة.</div>`}
function renderProduct(p){
 const e=evaluate(p),name=p.product_name||"منتج بدون اسم",img=p.image_front_small_url||"",ing=p.ingredients_text||"";
 $("#result").innerHTML=`<div class="product">${img?`<img src="${esc(img)}" alt="">`:""}<div><h2>${esc(name)}</h2><div class="small">${esc(p.brands||"")}${p.quantity?" · "+esc(p.quantity):""}<br>${esc(p.code)}</div><p><span class="badge ${e.overall.cls}">${e.overall.label}</span></p></div></div>
 <div class="healthgrid">${status("🔥","الحرقان",e.reflux)}${status("💨","الغازات والانتفاخ",e.gas)}${status("❤️","الدهون المشبعة",e.chol)}</div>
 ${personalNote(p.code)}
 ${ing?`<details class="ingredients"><summary>عرض المكونات</summary><p class="small">${esc(ing)}</p></details>`:""}
 <div class="actions"><button id="ateBtn">🍽️ سجل تجربتي</button><button id="copyBtn">📋 نسخ النتيجة</button></div>
 <p class="small">هذه نتيجة إرشادية مبنية على البيانات المتاحة، وليست تشخيصًا أو بديلًا عن النصيحة الطبية.</p>`;
 $("#ateBtn").onclick=()=>{$("#sNone").checked=false;$("#sHeart").checked=false;$("#sGas").checked=false;$("#sBloat").checked=false;$("#symptoms").showModal()};
 $("#copyBtn").onclick=async()=>{try{await navigator.clipboard.writeText(`${name}: ${e.overall.label}`);toast("تم نسخ النتيجة")}catch{toast("تعذر النسخ")}};
}
function addHistory(p){let h=history(),old=h.find(x=>x.code===p.code),symptoms=old?.symptoms||[];h=h.filter(x=>x.code!==p.code);h.unshift({code:p.code,name:p.product_name||"بدون اسم",image:p.image_front_small_url||"",at:Date.now(),symptoms});saveHistory(h);renderHistory()}
function renderHistory(){const h=history();$("#history").innerHTML=h.length?h.map(x=>`<div class="history-item" data-code="${esc(x.code)}">${x.image?`<img src="${esc(x.image)}" alt="">`:""}<div class="grow"><b>${esc(x.name)}</b><div class="small">${esc(x.code)}</div></div><span class="pill">${x.symptoms?.length||0} تجربة</span></div>`).join(""):'<p class="small">لم تفحص أي منتجات بعد.</p>';document.querySelectorAll(".history-item").forEach(el=>el.onclick=()=>lookup(el.dataset.code))}
$("#lookupBtn").onclick=()=>lookup($("#barcode").value);$("#barcode").addEventListener("keydown",e=>{if(e.key==="Enter")lookup(e.target.value)});
$("#settingsBtn").onclick=()=>$("#settings").showModal();$("#settings").addEventListener("close",()=>{savePrefs();if(current)renderProduct(current)});
$("#clearBtn").onclick=()=>{if(confirm("هل تريد مسح سجل المنتجات والتجارب؟")){localStorage.removeItem(STORE);renderHistory();toast("تم مسح السجل")}};
$("#sNone").onchange=e=>{if(e.target.checked){$("#sHeart").checked=$("#sGas").checked=$("#sBloat").checked=false}};
["#sHeart","#sGas","#sBloat"].forEach(id=>$(id).onchange=e=>{if(e.target.checked)$("#sNone").checked=false});
$("#saveSymptoms").onclick=()=>{if(!current)return;let h=history(),item=h.find(x=>x.code===current.code);if(!item)return;const vals=[];if($("#sNone").checked)vals.push("بدون أعراض");if($("#sHeart").checked)vals.push("حرقان");if($("#sGas").checked)vals.push("غازات");if($("#sBloat").checked)vals.push("انتفاخ");if(!vals.length){toast("اختر الأعراض أو بدون أعراض");return}item.symptoms=item.symptoms||[];item.symptoms.unshift({at:Date.now(),items:vals,severity:+$("#severity").value});saveHistory(h);renderHistory();setTimeout(()=>renderProduct(current),20);toast("تم حفظ تجربتك")};
let scanStream=null,scanRAF=0,scanActive=false;
function stopScanner(){
 scanActive=false;
 if(scanRAF)cancelAnimationFrame(scanRAF);
 scanRAF=0;
 if(scanStream){scanStream.getTracks().forEach(t=>t.stop());scanStream=null}
 const v=$("#scannerVideo");if(v){v.pause();v.srcObject=null}
 $("#scannerOverlay").classList.add("hidden");
}
$("#closeScanner").onclick=stopScanner;
$("#scannerOverlay").addEventListener("click",e=>{if(e.target===$("#scannerOverlay"))stopScanner()});
$("#scanBtn").onclick=async()=>{
 $("#cameraHint").textContent="";
 if(!navigator.mediaDevices?.getUserMedia){$("#cameraHint").textContent="الكاميرا غير متاحة في هذا المتصفح. اكتب الباركود يدويًا.";return}
 if(!("BarcodeDetector"in window)){$("#cameraHint").textContent="المتصفح يسمح بالكاميرا لكنه لا يدعم قارئ الباركود المستخدم حاليًا. افتح الموقع في Chrome أو اكتب الرقم يدويًا.";return}
 try{
  $("#scannerOverlay").classList.remove("hidden");$("#scannerStatus").textContent="جاري تشغيل الكاميرا…";
  scanStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"},width:{ideal:1920},height:{ideal:1080}},audio:false});
  const v=$("#scannerVideo");v.srcObject=scanStream;await v.play();scanActive=true;
  $("#scannerStatus").textContent="وجّه الباركود داخل الإطار وثبّت الهاتف";
  const formats=await BarcodeDetector.getSupportedFormats().catch(()=>["ean_13","ean_8","upc_a","upc_e"]);
  const wanted=["ean_13","ean_8","upc_a","upc_e","code_128"].filter(x=>formats.includes(x));
  const det=new BarcodeDetector(wanted.length?{formats:wanted}:undefined);
  let busy=false,last=0;
  const tick=async t=>{
   if(!scanActive)return;
   if(!busy&&t-last>180&&v.readyState>=2){
    busy=true;last=t;
    try{
     const found=await det.detect(v);
     if(found.length&&found[0].rawValue){
      const code=found[0].rawValue;$("#scannerStatus").textContent="✓ تم العثور على الباركود";
      if(navigator.vibrate)navigator.vibrate(80);
      stopScanner();$("#barcode").value=code;lookup(code);return;
     }
    }catch{}
    busy=false;
   }
   scanRAF=requestAnimationFrame(tick);
  };
  scanRAF=requestAnimationFrame(tick);
 }catch(e){
  stopScanner();
  $("#cameraHint").textContent=e?.name==="NotAllowedError"?"تم رفض إذن الكاميرا. اسمح للموقع باستخدام الكاميرا من إعدادات المتصفح.":"تعذر تشغيل الكاميرا. جرّب فتح الموقع مباشرة في Chrome.";
 }
};
migrate();const p=prefs();$("#reflux").checked=p.reflux;$("#gas").checked=p.gas;$("#chol").checked=p.chol;renderHistory();
if("serviceWorker"in navigator)navigator.serviceWorker.register("./sw.js").catch(()=>{});