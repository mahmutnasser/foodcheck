function renderFavorites(){const f=favorites();$("#favCount").textContent=f.length+" عنصر";$("#favoritesList").innerHTML=f.length?f.map(x=>`<div class="fav-item clickable" data-code="${esc(x.code)}">${x.image?`<img src="${esc(x.image)}" alt="">`:""}<div class="grow"><b>${esc(x.name)}</b><div class="small">${x.manual?esc(categoryLabel(x.category)):(esc(x.brands||"")+" · "+esc(x.code))}</div></div><span>›</span></div>`).join(""):'<p class="small">لا توجد عناصر مفضلة بعد.</p>';$$("#favoritesList .fav-item").forEach(el=>el.onclick=()=>isManualCode(el.dataset.code)?openLocal(el.dataset.code):(showView("scanView"),lookup(el.dataset.code)))}
function toggleCompare(){if(!current)return;let c=compareList(),exists=c.some(x=>x.code===current.code);if(exists)c=c.filter(x=>x.code!==current.code);else{if(c.length>=2)c.shift();c.push(productSnapshot(current))}localStorage.setItem(COMP,JSON.stringify(c));renderCompare();renderProduct(current);toast(exists?"تمت الإزالة من المقارنة":"تمت الإضافة للمقارنة")}
function renderCompare(){
 const c=compareList(),box=$("#compareBox");if(!c.length){box.innerHTML='<p class="small">لم تضف عناصر للمقارنة بعد.</p>';return}
 if(c.length===1){box.innerHTML=`<div class="comparecol">${c[0].image?`<img src="${esc(c[0].image)}">`:""}<b>${esc(c[0].name)}</b><p class="small">أضف عنصرًا ثانيًا للمقارنة.</p></div>`;return}
 const val=(x,k)=>Number(x.nutriments?.[k]);
 box.innerHTML=`<div class="comparegrid">${c.map(x=>`<div class="comparecol">${x.image?`<img src="${esc(x.image)}">`:""}<h3>${esc(x.name)}</h3><div class="compareline">دهون مشبعة: <b>${Number.isFinite(val(x,"saturated-fat_100g"))?val(x,"saturated-fat_100g")+" غ":"—"}</b></div><div class="compareline">سكر: <b>${Number.isFinite(val(x,"sugars_100g"))?val(x,"sugars_100g")+" غ":"—"}</b></div><div class="compareline">ألياف: <b>${Number.isFinite(val(x,"fiber_100g"))?val(x,"fiber_100g")+" غ":"—"}</b></div><div class="compareline">تجاربك: <b>${personalStats(x.code).logs.length}</b></div></div>`).join("")}</div>`;
}
function renderDashboard(){
 const now=Date.now(),week=now-7*864e5,h=history(),logs=[];h.forEach(p=>(p.symptoms||[]).forEach(s=>{if(s.at>=week)logs.push({...s,product:p.name,code:p.code})}));
 const heart=logs.filter(x=>x.items?.includes("حرقان")).length,gas=logs.filter(x=>x.items?.includes("غازات")).length,bloat=logs.filter(x=>x.items?.includes("انتفاخ")).length,ok=logs.filter(x=>x.items?.includes("بدون أعراض")).length;
 $("#statsGrid").innerHTML=`<div class="stat"><b>${logs.length}</b><span>تجارب</span></div><div class="stat"><b>${ok}</b><span>بدون أعراض</span></div><div class="stat"><b>${heart}</b><span>حرقان</span></div><div class="stat"><b>${gas+bloat}</b><span>غازات/انتفاخ</span></div>`;
 const byProduct={};logs.filter(x=>x.items?.length&&!x.items.includes("بدون أعراض")).forEach(x=>byProduct[x.product]=(byProduct[x.product]||0)+1);const top=Object.entries(byProduct).sort((a,b)=>b[1]-a[1]).slice(0,3);
 let ins=[];if(!logs.length)ins.push("سجّل تجربتك بعد الأكل كي يظهر تقريرك الأسبوعي.");if(top.length)ins.push("أكثر عناصر ارتبطت بأعراض في سجلك: "+top.map(x=>`${x[0]} (${x[1]})`).join("، ")+".");if(ok>0)ins.push(`لديك ${ok} تجربة مسجلة بدون أعراض هذا الأسبوع.`);
 $("#insights").innerHTML=ins.map(x=>`<div class="insight">🧠 ${esc(x)}</div>`).join("");
 const ideas=["استخدم زر «أضف أكلة/فاكهة» لتسجيل الطعام الذي لا يحتوي على باركود.","صوّر الطبق واحفظ مكوناته، ثم سجّل شعورك بعده لتكوين سجل شخصي أدق.","قارن بين المنتجات المعبأة عندما تتوفر بياناتها الغذائية."];
 $("#mealIdeas").innerHTML=ideas.map(x=>`<div class="idea">${x}</div>`).join("");
}
function showView(id){$$(".view").forEach(v=>v.classList.toggle("hidden",v.id!==id));$$(".tab").forEach(t=>t.classList.toggle("active",t.dataset.view===id));if(id==="dashboardView")renderDashboard();if(id==="favoritesView")renderFavorites();if(id==="compareView")renderCompare()}
function renderCustomFoods(){
 const c=customFoods();$("#customFoodsCard").classList.toggle("hidden",!c.length);$("#customCount").textContent=c.length+" محفوظ";
 $("#customFoods").innerHTML=c.slice(0,12).map(x=>`<div class="custom-item clickable" data-code="${esc(x.code)}">${x.image?`<img src="${esc(x.image)}" alt="">`:""}<div class="grow"><b>${esc(x.name)}</b><div class="small">${esc(categoryLabel(x.category))}${x.notes?" · "+esc(x.notes):""}</div></div><span>›</span></div>`).join("");
 $$("#customFoods .custom-item").forEach(el=>el.onclick=()=>openLocal(el.dataset.code));
}
function exportData(){const data={version:11,exportedAt:new Date().toISOString(),history:history(),favorites:favorites(),compare:compareList(),custom:customFoods(),prefs:prefs()};const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="foodcheck-backup.json";a.click();URL.revokeObjectURL(a.href)}
async function importData(file){try{const data=JSON.parse(await file.text());if(!data||!Array.isArray(data.history))throw new Error();localStorage.setItem(STORE,JSON.stringify(data.history||[]));localStorage.setItem(FAV,JSON.stringify(data.favorites||[]));localStorage.setItem(COMP,JSON.stringify(data.compare||[]));localStorage.setItem(CUSTOM,JSON.stringify(data.custom||[]));if(data.prefs)localStorage.setItem(PREF,JSON.stringify(data.prefs));initPrefs();renderAll();toast("تم استيراد البيانات")}catch{toast("ملف النسخة الاحتياطية غير صالح")}}
function renderAll(){renderHistory();renderFavorites();renderCompare();renderDashboard();renderCustomFoods()}
function initPrefs(){const p=prefs();$("#reflux").checked=p.reflux;$("#gas").checked=p.gas;$("#chol").checked=p.chol;$("#personal").checked=p.personal!==false}

function openManual(withCamera=false,prefill="",edit=null){
 manualImage=edit?.image||"";
 $("#manualName").value=edit?.name||prefill||"";$("#manualCategory").value=edit?.category||"fruit";$("#manualIngredients").value=edit?.ingredients_text||"";$("#manualSatFat").value=Number.isFinite(Number(edit?.nutriments?.["saturated-fat_100g"]))?edit.nutriments["saturated-fat_100g"]:"";$("#manualNotes").value=edit?.notes||"";
 $("#manualFood").dataset.editCode=edit?.code||"";$("#manualPhoto").value="";
 const prev=$("#manualPhotoPreview");if(manualImage){prev.src=manualImage;prev.classList.remove("hidden")}else{prev.src="";prev.classList.add("hidden")}
 $("#manualFood").showModal();
 if(withCamera)setTimeout(()=>$("#manualPhoto").click(),150);
}
function resizeImage(file){
 return new Promise((resolve,reject)=>{const r=new FileReader();r.onerror=reject;r.onload=()=>{const im=new Image();im.onerror=reject;im.onload=()=>{const max=720,scale=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*scale);c.height=Math.round(im.height*scale);c.getContext("2d").drawImage(im,0,0,c.width,c.height);resolve(c.toDataURL("image/jpeg",0.68))};im.src=r.result};r.readAsDataURL(file)})
}
async function onManualPhoto(file){if(!file)return;try{manualImage=await resizeImage(file);$("#manualPhotoPreview").src=manualImage;$("#manualPhotoPreview").classList.remove("hidden")}catch{toast("تعذر قراءة الصورة")}}
function saveManual(){
 const name=$("#manualName").value.trim();if(!name){toast("اكتب اسم الأكلة أو الفاكهة");return}
 const editCode=$("#manualFood").dataset.editCode,code=editCode||("manual-"+Date.now()+"-"+Math.random().toString(36).slice(2,7));
 const sat=parseFloat(String($("#manualSatFat").value).replace(",","."));
 const item={code,name,product_name:name,manual:true,category:$("#manualCategory").value,image:manualImage,ingredients_text:$("#manualIngredients").value.trim(),nutriments:Number.isFinite(sat)?{"saturated-fat_100g":sat}:{},notes:$("#manualNotes").value.trim(),at:Date.now()};
 let c=customFoods();c=c.filter(x=>x.code!==code);c.unshift(item);saveCustom(c);
 let h=history(),old=h.find(x=>x.code===code),symptoms=old?.symptoms||[];h=h.filter(x=>x.code!==code);h.unshift({...productSnapshot(item),at:Date.now(),symptoms});saveHistory(h);
 current=item;renderAll();renderProduct(item);toast(editCode?"تم تحديث الأكلة":"تم حفظ الأكلة")
}

function stopScanner(){scanActive=false;if(scanRAF)cancelAnimationFrame(scanRAF);scanRAF=0;if(scanStream){scanStream.getTracks().forEach(t=>t.stop());scanStream=null}const v=$("#scannerVideo");if(v){v.pause();v.srcObject=null}$("#scannerOverlay").classList.add("hidden")}
async function startScanner(){
 $("#cameraHint").textContent="";
 if(!navigator.mediaDevices?.getUserMedia){$("#cameraHint").textContent="الكاميرا غير متاحة هنا. اكتب الباركود يدويًا.";return}
 if(!("BarcodeDetector"in window)){$("#cameraHint").textContent="المتصفح يسمح بالكاميرا لكنه لا يدعم قارئ الباركود المدمج. افتح الموقع مباشرة في Chrome أو استخدم الرقم المكتوب أسفل الباركود.";return}
 try{
  $("#scannerOverlay").classList.remove("hidden");$("#scannerStatus").textContent="جاري تشغيل الكاميرا…";
  scanStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"},width:{ideal:1920},height:{ideal:1080}},audio:false});
  const v=$("#scannerVideo");v.srcObject=scanStream;await v.play();scanActive=true;$("#scannerStatus").textContent="وجّه الباركود داخل الإطار وثبّت الهاتف";
  const fmts=await BarcodeDetector.getSupportedFormats().catch(()=>["ean_13","ean_8","upc_a","upc_e"]);const wanted=["ean_13","ean_8","upc_a","upc_e","code_128"].filter(x=>fmts.includes(x));const det=new BarcodeDetector(wanted.length?{formats:wanted}:undefined);
  let busy=false,last=0;const tick=async t=>{if(!scanActive)return;if(!busy&&t-last>160&&v.readyState>=2){busy=true;last=t;try{const f=await det.detect(v);if(f.length&&f[0].rawValue){const code=f[0].rawValue;if(navigator.vibrate)navigator.vibrate(80);stopScanner();$("#barcode").value=code;lookup(code);return}}catch{}busy=false}scanRAF=requestAnimationFrame(tick)};scanRAF=requestAnimationFrame(tick)
 }catch(e){stopScanner();$("#cameraHint").textContent=e?.name==="NotAllowedError"?"تم رفض إذن الكاميرا. اسمح للموقع باستخدامها من إعدادات المتصفح.":"تعذر تشغيل الكاميرا. جرّب فتح الموقع مباشرة في Chrome."}
}

$("#lookupBtn").onclick=()=>lookup($("#barcode").value);$("#barcode").addEventListener("keydown",e=>{if(e.key==="Enter")lookup(e.target.value)});
$("#nameSearchBtn").onclick=()=>searchByName($("#nameSearch").value);$("#nameSearch").addEventListener("keydown",e=>{if(e.key==="Enter")searchByName(e.target.value)});
$("#manualBtn").onclick=()=>openManual(false);$("#photoBtn").onclick=()=>openManual(true);$("#manualPhoto").onchange=e=>onManualPhoto(e.target.files?.[0]);$("#saveManualFood").onclick=saveManual;
$("#settingsBtn").onclick=()=>$("#settings").showModal();$("#settings").addEventListener("close",()=>{savePrefs();if(current)renderProduct(current)});
$("#clearBtn").onclick=()=>{if(confirm("هل تريد مسح سجل المشاهدة والتجارب؟ أكلاتك اليدوية المحفوظة لن تُحذف.")){localStorage.removeItem(STORE);renderAll();toast("تم مسح السجل")}};
$("#sNone").onchange=e=>{if(e.target.checked){$("#sHeart").checked=$("#sGas").checked=$("#sBloat").checked=false}};["#sHeart","#sGas","#sBloat"].forEach(id=>$(id).onchange=e=>{if(e.target.checked)$("#sNone").checked=false});
$("#saveSymptoms").onclick=saveSymptoms;$("#scanBtn").onclick=startScanner;$("#closeScanner").onclick=stopScanner;
$("#clearCompare").onclick=()=>{localStorage.removeItem(COMP);renderCompare();if(current)renderProduct(current)};
$("#exportBtn").onclick=exportData;$("#importFile").onchange=e=>e.target.files[0]&&importData(e.target.files[0]);
$$(".tab").forEach(t=>t.onclick=()=>showView(t.dataset.view));
$("#commonFoodChips").innerHTML=commonFoods.map(x=>`<button type="button" class="chip">${x}</button>`).join("");$$(".chip").forEach(b=>b.onclick=()=>{$("#manualName").value=b.textContent});

migrate();initPrefs();renderAll();
if("serviceWorker"in navigator)navigator.serviceWorker.register("./sw.js").catch(()=>{});