const $=s=>document.querySelector(s);
const STORE="foodcheck-history-v1", PREF="foodcheck-prefs-v1";
let current=null;
const gasWords=["inulin","chicory","chicory root","cichorei","cichoreiwortel","oligofructose","fructooligosaccharide","sorbitol","xylitol","maltitol","mannitol"];
const refluxWords=["chocolate","chocolade","cocoa","cacao","peppermint","mint","munt","caffeine","cafeïne","coffee","koffie","chili","hot pepper"];
const prefs=()=>JSON.parse(localStorage.getItem(PREF)||'{"reflux":true,"gas":true,"chol":true}');
function savePrefs(){localStorage.setItem(PREF,JSON.stringify({reflux:$("#reflux").checked,gas:$("#gas").checked,chol:$("#chol").checked}))}
function norm(x){return (x||"").toLowerCase()}
function evaluate(p){
  const pr=prefs(), ing=norm(p.ingredients_text), reasons=[]; let score=0, known=false;
  if(pr.gas){const hits=gasWords.filter(w=>ing.includes(w)); if(hits.length){score+=2;known=true;reasons.push(["💨","قد يزيد الغازات/الانتفاخ",`وجدت: ${[...new Set(hits)].slice(0,4).join("، ")}`])}}
  if(pr.reflux){const hits=refluxWords.filter(w=>ing.includes(w)); if(hits.length){score+=2;known=true;reasons.push(["🔥","قد يحفّز الحرقان عند بعض الأشخاص",`وجدت: ${[...new Set(hits)].slice(0,4).join("، ")}`])}}
  const sat=Number(p.nutriments?.["saturated-fat_100g"]);
  if(pr.chol && Number.isFinite(sat)){known=true;if(sat>5){score+=3;reasons.push(["❤️","دهون مشبعة مرتفعة",`${sat} غ/100غ`])}else if(sat>1.5){score+=1;reasons.push(["❤️","دهون مشبعة متوسطة",`${sat} غ/100غ`])}else{reasons.push(["❤️","دهون مشبعة منخفضة",`${sat} غ/100غ`])}}
  if(!known) return {cls:"gray",label:"⚪ معلومات غير كافية",reasons};
  if(score>=4)return{cls:"red",label:"🔴 يفضّل تجنبه مع أعراضك",reasons};
  if(score>=1)return{cls:"yellow",label:"🟡 جرّبه بحذر",reasons};
  return{cls:"green",label:"🟢 مناسب غالبًا",reasons};
}
async function lookup(code){
  code=(code||"").replace(/\D/g,""); if(!code)return;
  showLoading();
  try{
    const fields="code,product_name,brands,image_front_small_url,ingredients_text,nutriments";
    const r=await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=${fields}`,{headers:{"Accept":"application/json"}});
    const d=await r.json();
    if(d.status!==1||!d.product)throw new Error("لم أجد هذا المنتج في Open Food Facts.");
    current={...d.product,code}; renderProduct(current); addHistory(current);
  }catch(e){$("#result").classList.remove("hidden");$("#result").innerHTML=`<p class="error"><b>تعذر جلب المنتج.</b><br>${e.message}</p><p class="small">يمكن أن يكون المنتج غير موجود في قاعدة البيانات أو أن الاتصال محجوب.</p>`}
}
function showLoading(){$("#result").classList.remove("hidden");$("#result").innerHTML="<p>جاري البحث…</p>"}
function esc(s){return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function renderProduct(p){
 const e=evaluate(p), name=p.product_name||"منتج بدون اسم", img=p.image_front_small_url||"";
 $("#result").innerHTML=`<div class="product">${img?`<img src="${esc(img)}" alt="">`:""}<div><h2>${esc(name)}</h2><div class="small">${esc(p.brands||"")} · ${esc(p.code)}</div><p><span class="badge ${e.cls}">${e.label}</span></p></div></div>
 ${e.reasons.map(r=>`<div class="reason"><b>${r[0]} ${r[1]}</b><div class="small">${esc(r[2])}</div></div>`).join("")}
 <div class="actions"><button id="ateBtn">🍽️ أكلته</button><button id="copyBtn">📋 نسخ النتيجة</button></div>
 <p class="small">التقييم مبني على قواعد عامة وتفضيلاتك، وليس حكمًا طبيًا قطعيًا. تحمّل الأطعمة يختلف من شخص لآخر.</p>`;
 $("#ateBtn").onclick=()=>$("#symptoms").showModal();
 $("#copyBtn").onclick=()=>navigator.clipboard?.writeText(`${name}: ${e.label}`);
}
function history(){return JSON.parse(localStorage.getItem(STORE)||"[]")}
function addHistory(p){let h=history().filter(x=>x.code!==p.code);h.unshift({code:p.code,name:p.product_name||"بدون اسم",at:Date.now(),symptoms:[]});localStorage.setItem(STORE,JSON.stringify(h.slice(0,50)));renderHistory()}
function renderHistory(){const h=history();$("#history").innerHTML=h.length?h.map(x=>`<div class="history-item"><b>${esc(x.name)}</b><div class="small">${esc(x.code)}${x.symptoms?.length?` · ${x.symptoms.length} تسجيل أعراض`:""}</div></div>`).join(""):'<p class="small">لم تفحص أي منتجات بعد.</p>'}
$("#lookupBtn").onclick=()=>lookup($("#barcode").value);
$("#barcode").addEventListener("keydown",e=>{if(e.key==="Enter")lookup(e.target.value)});
$("#settingsBtn").onclick=()=>{$("#settings").showModal()};
$("#settings").addEventListener("close",savePrefs);
$("#clearBtn").onclick=()=>{if(confirm("مسح السجل المحلي؟")){localStorage.removeItem(STORE);renderHistory()}};
$("#saveSymptoms").onclick=()=>{
 if(!current)return;
 let h=history(), item=h.find(x=>x.code===current.code); if(!item)return;
 const vals=[]; if($("#sHeart").checked)vals.push("حرقان");if($("#sGas").checked)vals.push("غازات");if($("#sBloat").checked)vals.push("انتفاخ");
 item.symptoms=item.symptoms||[];item.symptoms.unshift({at:Date.now(),items:vals,severity:+$("#severity").value});
 localStorage.setItem(STORE,JSON.stringify(h));renderHistory();
};
$("#scanBtn").onclick=async()=>{
 if("BarcodeDetector" in window){
   try{
     const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}}});
     const v=document.createElement("video");v.srcObject=stream;v.setAttribute("playsinline","");await v.play();
     $("#result").classList.remove("hidden");$("#result").innerHTML="وجّه الكاميرا نحو الباركود…";
     const det=new BarcodeDetector({formats:["ean_13","ean_8","upc_a","upc_e"]});
     const canvas=document.createElement("canvas"),ctx=canvas.getContext("2d");
     let done=false;
     const tick=async()=>{if(done)return;canvas.width=v.videoWidth;canvas.height=v.videoHeight;ctx.drawImage(v,0,0);try{const b=await det.detect(canvas);if(b.length){done=true;stream.getTracks().forEach(t=>t.stop());$("#barcode").value=b[0].rawValue;lookup(b[0].rawValue);return}}catch{}requestAnimationFrame(tick)};tick();
     setTimeout(()=>{if(!done){done=true;stream.getTracks().forEach(t=>t.stop());$("#result").innerHTML='<p class="small">لم يتم العثور على باركود. اكتب الرقم يدويًا.</p>'}},20000);
   }catch{$("#cameraHint").textContent="تعذر فتح الكاميرا. استخدم إدخال الباركود يدويًا."}
 }else{$("#cameraHint").textContent="المتصفح لا يدعم المسح المباشر هنا. اكتب رقم الباركود يدويًا."}
};
const p=prefs();$("#reflux").checked=p.reflux;$("#gas").checked=p.gas;$("#chol").checked=p.chol;renderHistory();
if("serviceWorker" in navigator)navigator.serviceWorker.register("./sw.js").catch(()=>{});