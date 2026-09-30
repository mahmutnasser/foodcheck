const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const K={foods:'fc20_foods',history:'fc20_history',favorites:'fc20_favorites',compare:'fc20_compare',prefs:'fc20_prefs'};
const quickFoods=[['موز','🍌','fruit'],['تفاح','🍎','fruit'],['برتقال','🍊','fruit'],['فراولة','🍓','fruit'],['شوفان','🥣','food'],['أرز','🍚','food'],['دجاج','🍗','meal'],['زبادي','🥛','food']];
const builtInFoods=[
  {code:'builtin-garlic',name:'ثوم',aliases:['ثوم','الثوم','توم','التوم','garlic'],category:'خضار / بهار',ingredients_text:'ثوم',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-onion',name:'بصل',aliases:['بصل','البصل','onion'],category:'خضار',ingredients_text:'بصل',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-tomato',name:'طماطم',aliases:['طماطم','الطماطم','بندورة','tomato'],category:'خضار',ingredients_text:'طماطم',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-wheat',name:'قمح',aliases:['قمح','القمح','دقيق القمح','دقيق قمح','wheat'],category:'حبوب',ingredients_text:'قمح',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-oats',name:'شوفان',aliases:['شوفان','الشوفان','oats','oat'],category:'حبوب',ingredients_text:'شوفان',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-rice',name:'أرز',aliases:['أرز','ارز','الأرز','الارز','rice'],category:'حبوب',ingredients_text:'أرز',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-banana',name:'موز',aliases:['موز','الموز','banana'],category:'فاكهة',ingredients_text:'موز',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-apple',name:'تفاح',aliases:['تفاح','التفاح','apple'],category:'فاكهة',ingredients_text:'تفاح',nutriments:{},manual:true,image:'',symptoms:[]}
];
function normalizeSearchText(s){
  return String(s||'').toLowerCase().trim()
    .replace(/[\u064B-\u065F\u0670\u0640]/g,'')
    .replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه')
    .replace(/\s+/g,' ');
}
function builtInFoodForQuery(q){
  const n=normalizeSearchText(q);
  return builtInFoods.find(f=>f.aliases.some(a=>normalizeSearchText(a)===n))||null;
}
function looksNonFoodProduct(p){
  const cats=(p.categories_tags||[]).join(' ');
  const hay=normalizeSearchText([p.product_name,p.brands,cats].filter(Boolean).join(' '));
  const bad=['cosmetic','beauty','hair care','hair-care','hair oil','hair-oil','shampoo','conditioner','soap','skin care','skin-care','body care','body-care','essential oil','زيت شعر','شامبو','بلسم','كريم شعر','مستحضر شعر','عنايه بالشعر','العنايه بالشعر'];
  return bad.some(x=>hay.includes(normalizeSearchText(x)));
}
function productSearchScore(p,q){
  if(!p?.product_name||looksNonFoodProduct(p))return -999;
  const name=normalizeSearchText(p.product_name), nq=normalizeSearchText(q);
  let s=0;
  if(name===nq)s+=10;
  if(name.includes(nq))s+=5;
  if((p.ingredients_text||'').trim())s+=2;
  if(Array.isArray(p.categories_tags)&&p.categories_tags.length)s+=2;
  if(p.nutriments&&Object.keys(p.nutriments).length)s+=1;
  return s;
}
let current=null, scannerStream=null, scannerRAF=0, savedMode='all', pendingBarcode='';
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}}; const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const foods=()=>load(K.foods,[]), history=()=>load(K.history,[]), favorites=()=>load(K.favorites,[]), compare=()=>load(K.compare,[]), prefs=()=>load(K.prefs,{reflux:true,gas:true,chol:true});
const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function toast(t){const el=$('#toast');el.textContent=t;el.classList.remove('hidden');setTimeout(()=>el.classList.add('hidden'),1900)}
function allItems(){const m=new Map();[...foods(),...history()].forEach(x=>m.set(x.code,x));return [...m.values()]}
function showScreen(id,mode){$$('.screen').forEach(s=>{s.classList.add('hidden');s.classList.remove('active')});const el=$('#'+id);if(el){el.classList.remove('hidden');el.classList.add('active')}if(id!=='scannerScreen')stopScanner();if(id==='savedScreen'){savedMode=mode||savedMode;renderSaved()}if(id==='compareScreen')renderCompare();if(id==='reportScreen')renderReport();$$('.nav').forEach(n=>n.classList.toggle('active',n.dataset.screen===id&&(!n.dataset.mode||n.dataset.mode===savedMode)));scrollTo({top:0,behavior:'smooth'})}
function renderQuick(){ $('#quickFoodGrid').innerHTML=quickFoods.map(([n,e])=>`<button class="food-card" data-food="${esc(n)}"><div class="food-emoji">${e}</div><b>${esc(n)}</b></button>`).join(''); $$('.food-card').forEach(b=>b.onclick=()=>openAddFood(b.dataset.food)); }
function openAddFood(name='',barcode=''){
  pendingBarcode=barcode||'';
  showScreen('addFoodScreen');
  $('#foodName').value=name;
  $('#foodIngredients').value='';
  $('#foodNotes').value=barcode?`باركود: ${barcode}`:'';
  $('#foodPhotoPreview').src='';
  const hint=$('#localProductHint');
  if(hint){
    hint.classList.toggle('hidden',!barcode);
    hint.innerHTML=barcode?`🇪🇬 <b>المنتج غير موجود في القاعدة العالمية.</b><br>أضف الاسم والمكونات من العبوة، وسيتذكر FoodCheck الباركود <span dir="ltr">${esc(barcode)}</span> على هذا الجهاز.`:'';
  }
}
function addHistory(item){const h=history().filter(x=>x.code!==item.code);h.unshift({...item,lastSeen:Date.now(),symptoms:item.symptoms||[]});save(K.history,h.slice(0,40))}
function saveFood(item){const f=foods().filter(x=>x.code!==item.code);f.unshift(item);save(K.foods,f.slice(0,80));addHistory(item)}
function normalizeProduct(p){return{code:p.code||('p'+Date.now()),name:p.product_name||'بدون اسم',brands:p.brands||'',image:p.image_front_small_url||'',quantity:p.quantity||'',ingredients_text:p.ingredients_text||'',nutriments:p.nutriments||{},manual:false,symptoms:[]}}
function evaluate(item){
  const p=prefs();
  const ing=(item.ingredients_text||'').toLowerCase().trim();
  const n=item.nutriments||{};
  const sat=Number(n['saturated-fat_100g']);
  const totalFat=Number(n['fat_100g']);
  const match=arr=>arr.filter(x=>ing.includes(x));

  // IBS / bloating: WGO + NIDDK + Monash FODMAP
  const wheat=match(['wheat flour','whole wheat','wheat','rye','tarwebloem','tarwe','rogge','weizenmehl','weizen','دقيق قمح','دقيق القمح','قمح','طحين قمح','سميد القمح','دقيق كامل','جاودار']);
  const onion=match(['onion powder','onions','onion','uien','ui ','بصل','مسحوق بصل','بودرة بصل']);
  const garlic=match(['garlic powder','garlic','knoflook','ثوم','توم','مسحوق ثوم','بودرة ثوم','مسحوق توم','بودرة توم']);
  const polyols=match(['sorbitol','maltitol','xylitol','mannitol','erythritol','isomalt','سوربيتول','مالتيتول','زيليتول','مانيتول','إريثريتول','اريثريتول','إيزومالت','ايزومالت']);
  const inulin=match(['inulin','chicory','cichorei','oligofructose','fructooligosaccharide','إينولين','انولين','شيكوري','جذر الهندباء']);
  const lactose=match(['lactose','milk powder','skimmed milk powder','whey powder','لاكتوز','حليب مجفف','لبن مجفف','مسحوق الحليب','مسحوق اللبن']);
  const fructose=match(['high fructose corn syrup','glucose-fructose syrup','honey','شراب ذرة عالي الفركتوز','شراب جلوكوز فركتوز','عسل']);
  const highFodmapFruit=match(['apple','pear','mango','cherry','watermelon','تفاح','كمثرى','مانجو','كرز','بطيخ']);
  const gas=[...new Set([...wheat,...onion,...garlic,...polyols,...inulin,...lactose,...fructose,...highFodmapFruit])];

  // GERD: NIDDK + WGO. These are possible triggers, not universal exclusions.
  const reflux=match(['tomato','tomaat','citrus','orange','lemon','chili','hot pepper','spicy','chocolate','cacao','cocoa','coffee','caffeine','mint','peppermint','طماطم','صلصة طماطم','حمضيات','برتقال','ليمون','شطة','فلفل حار','حار','شوكولاتة','كاكاو','قهوة','كافيين','نعناع']);
  const highFatForReflux=Number.isFinite(totalFat)&&totalFat>17.5;

  // Heart/cholesterol: WHO daily guidance + NHS product-label thresholds.
  const palm=match(['palm oil','palm fat','palmolein','زيت نخيل','زيت النخيل','دهن نخيل','زيت اولين النخيل','زيت أولين النخيل']);
  const partialHydrogenated=match(['partially hydrogenated','partially-hydrogenated','زيت مهدرج جزئيا','زيت مهدرج جزئيًا','دهون مهدرجة جزئيا','دهون مهدرجة جزئيًا']);

  const hasIngredients=!!ing;
  const hasSat=Number.isFinite(sat);
  const hasHeartData=hasSat||palm.length||partialHydrogenated.length;

  let fat={cls:'gray',value:'معلومات غير كافية',detail:'لا توجد قيمة للدهون المشبعة'};
  if(hasSat){
    if(sat>5)fat={cls:'red',value:'مرتفعة',detail:`${sat}غ/100غ — تصنيف مرتفع حسب معايير الملصقات الغذائية`};
    else if(sat>1.5)fat={cls:'yellow',value:'متوسطة',detail:`${sat}غ/100غ`};
    else fat={cls:'green',value:'منخفضة',detail:`${sat}غ/100غ`};
  }else if(partialHydrogenated.length){
    fat={cls:'red',value:'تحقق من الدهون المتحولة',detail:'وجدت زيوتًا مهدرجة جزئيًا؛ منظمة الصحة العالمية توصي بخفض الدهون المتحولة لأدنى مستوى ممكن'};
  }else if(palm.length){
    fat={cls:'yellow',value:'تحقق من البطاقة',detail:'يوجد زيت نخيل؛ القرار الأدق يحتاج قيمة الدهون المشبعة'};
  }

  const gasDetail=[];
  if(wheat.length)gasDetail.push('قمح/جاودار (فركتان)');
  if(onion.length)gasDetail.push('بصل');
  if(garlic.length)gasDetail.push('ثوم');
  if(inulin.length)gasDetail.push('إينولين/شيكوري');
  if(polyols.length)gasDetail.push('مُحلّيات كحولية');
  if(lactose.length)gasDetail.push('لاكتوز/حليب مجفف');
  if(fructose.length)gasDetail.push('فركتوز زائد/عسل');
  if(highFodmapFruit.length)gasDetail.push('فاكهة قد تكون أعلى FODMAP');

  const refluxFlags=[...reflux];
  if(highFatForReflux)refluxFlags.push('high-fat');

  const refluxCard=!p.reflux?{icon:'🔥',title:'الارتجاع المعدي المريئي',cls:'gray',value:'غير مفعّل',detail:'فعّل هذا القسم من الإعدادات'}
    :!hasIngredients&&!Number.isFinite(totalFat)?{icon:'🔥',title:'الارتجاع المعدي المريئي',cls:'gray',value:'معلومات غير كافية',detail:'لا توجد مكونات أو بيانات دهون كافية'}
    :refluxFlags.length?{icon:'🔥',title:'الارتجاع المعدي المريئي',cls:'yellow',value:'قد يهيّج الأعراض',detail:'هذه محفزات محتملة وليست ممنوعة للجميع؛ راقب استجابتك الشخصية'}
    :{icon:'🔥',title:'الارتجاع المعدي المريئي',cls:'green',value:'لا توجد مؤشرات واضحة',detail:'لم أجد محفزات شائعة في البيانات المتاحة'};

  const gasCard=!p.gas?{icon:'🌾',title:'الغازات والانتفاخ',cls:'gray',value:'غير مفعّل',detail:'فعّل هذا القسم من الإعدادات'}
    :!hasIngredients?{icon:'🌾',title:'الغازات والانتفاخ',cls:'gray',value:'معلومات غير كافية',detail:'أضف قائمة المكونات لتقييم FODMAP بصورة أفضل'}
    :gas.length?{icon:'🌾',title:'الغازات والانتفاخ',cls:'yellow',value:'قد يسبب انتفاخًا',detail:`مؤشرات FODMAP محتملة: ${gasDetail.join('، ')}`}
    :{icon:'🌾',title:'الغازات والانتفاخ',cls:'green',value:'لا توجد مؤشرات واضحة',detail:'لم أجد FODMAPs شائعة ضمن المكونات التي يفحصها التطبيق'};

  const heartCard=!p.chol?{icon:'♥',title:'الدهون المشبعة / الكوليسترول',cls:'gray',value:'غير مفعّل',detail:'فعّل هذا القسم من الإعدادات'}
    :{icon:'♥',title:'الدهون المشبعة / الكوليسترول',...fat};

  const cards=[refluxCard,gasCard,heartCard];
  const active=cards.filter(c=>c.value!=='غير مفعّل');
  const red=active.some(c=>c.cls==='red');
  const yellow=active.some(c=>c.cls==='yellow');
  const gray=active.some(c=>c.cls==='gray');
  const allGray=active.length&&active.every(c=>c.cls==='gray');

  let overall='green',title='مناسب غالبًا وفق البيانات المتاحة',detail='لا توجد مؤشرات قوية في البيانات المتاحة';
  if(allGray){overall='gray';title='معلومات غير كافية';detail='لا يمكن إصدار تقييم مفيد قبل توفر المكونات أو القيم الغذائية'}
  else if(red){overall='red';title='قلّل منه / اختر بديلًا';detail='يوجد مؤشر قوي، خصوصًا من ناحية الدهون المشبعة أو الدهون المتحولة'}
  else if(yellow){overall='yellow';title='بحذر';detail='يوجد واحد أو أكثر من المحفزات المحتملة؛ الكمية وتجربتك الشخصية مهمتان'}
  else if(gray){overall='gray';title='بيانات ناقصة';detail='بعض الجوانب تبدو جيدة، لكن البيانات غير مكتملة'}

  const basis=[
    refluxCard.cls==='yellow'?'الارتجاع: تم رصد محفزات شائعة مذكورة في إرشادات NIDDK/WGO.':'',
    gasCard.cls==='yellow'?'القولون/الانتفاخ: تم رصد مكونات FODMAP محتملة وفق WGO/NIDDK وMonash.':'',
    heartCard.cls==='red'||heartCard.cls==='yellow'?'القلب: تصنيف الدهون المشبعة يعتمد على غ/100غ؛ حدود 1.5غ و5غ مأخوذة من إرشادات قراءة الملصقات في NHS، مع هدف WHO اليومي للدهون المشبعة.':''
  ].filter(Boolean).join(' ');

  return{overall,title,detail,cards,wheat,onion,garlic,polyols,inulin,lactose,fructose,highFodmapFruit,reflux,palm,partialHydrogenated,sat,totalFat,basis};
}
function openResult(item){current=item;addHistory(item);const ev=evaluate(item);showScreen('resultScreen');$('#resultImage').src=item.image||'';$('#resultImage').style.visibility=item.image?'visible':'hidden';$('#resultName').textContent=item.name||'بدون اسم';$('#resultMeta').textContent=item.manual?(item.category||'أكلة محفوظة'):`${item.brands||''}${item.quantity?' · '+item.quantity:''}`;$('#resultCode').textContent=item.manual?'':item.code;const box=$('#overallBox');box.className='overall-box '+ev.overall;$('#overallTitle').textContent=ev.title;$('#overallDetail').textContent=ev.detail;$('#healthCards').innerHTML=ev.cards.map(c=>`<div class="health-row ${c.cls}"><div class="hicon">${c.icon}</div><div class="hcopy"><strong>${esc(c.title)}</strong><b>${esc(c.value)}</b><p>${esc(c.detail)}</p></div></div>`).join('');if($('#decisionBasis'))$('#decisionBasis').textContent=ev.basis||'التقييم يعتمد على البيانات المتاحة فقط، ولا توجد قاعدة واحدة تمنع طعامًا بعينه لكل الأشخاص.';refreshFavButtons()}
function refreshFavButtons(){if(!current)return;const yes=favorites().includes(current.code);$('#resultFavBtn').textContent=yes?'♥':'♡';$('#favoriteBtn').innerHTML=`<span>${yes?'♥':'♡'}</span><b>${yes?'إزالة من المفضلة':'أضف للمفضلة'}</b>`}
function toggleFavorite(code){const f=favorites();save(K.favorites,f.includes(code)?f.filter(x=>x!==code):[code,...f]);refreshFavButtons();renderSaved()}
async function lookupBarcode(code){
  code=String(code||'').trim();
  const local=allItems().find(x=>String(x.code)===code);
  if(local){openResult(local);toast('تم العثور عليه في أكلاتك المحفوظة');return}
  try{
    const r=await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=code,product_name,brands,image_front_small_url,ingredients_text,nutriments,quantity`);
    const d=await r.json();
    if(d.status!==1)throw 0;
    openResult(normalizeProduct(d.product));
  }catch{
    toast('المنتج غير موجود — أضفه مرة واحدة وسأتذكر الباركود');
    openAddFood('',code);
  }
}
async function searchName(q){
  q=(q||'').trim();
  if(!q)return;

  const built=builtInFoodForQuery(q);
  if(built){
    openResult({...built});
    return;
  }

  const nq=normalizeSearchText(q);
  const local=allItems().find(x=>normalizeSearchText(x.name||'').includes(nq));
  if(local){openResult(local);return}

  try{
    const url=`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=30&fields=code,product_name,brands,image_front_small_url,ingredients_text,nutriments,quantity,categories_tags`;
    const r=await fetch(url);
    const d=await r.json();
    const ranked=(d.products||[])
      .map(p=>({p,score:productSearchScore(p,q)}))
      .filter(x=>x.score>-900)
      .sort((a,b)=>b.score-a.score);
    const p=ranked[0]?.p;
    if(!p)throw 0;
    openResult(normalizeProduct(p));
  }catch{
    toast('لم أجد طعامًا مناسبًا بهذا الاسم — جرّب إضافة الأكلة يدويًا');
  }
}
function openIngredients(){
  if(!current)return;
  const ev=evaluate(current);
  showScreen('ingredientsScreen');
  $('#ingredientProductImage').src=current.image||'';
  $('#ingredientProductImage').style.visibility=current.image?'visible':'hidden';
  $('#ingredientProductName').textContent=current.name||'';
  $('#ingredientProductMeta').textContent=current.manual?(current.category||'أكلة محفوظة'):`${current.brands||''}${current.quantity?' · '+current.quantity:''}`;
  $('#ingredientText').textContent=current.ingredients_text||'لا توجد قائمة مكونات مفصلة.';
  const ws=[];
  if(ev.wheat.length)ws.push({cls:'yellow',tag:'🌾 القمح/الجاودار',name:'فركتان محتمل',desc:'قد يسبب انتفاخًا لبعض الأشخاص المصابين بأعراض IBS؛ لا يعني أن الجميع يحتاج لمنعه'});
  if(ev.onion.length)ws.push({cls:'yellow',tag:'🧅 البصل',name:'فركتان',desc:'من المصادر الشائعة للفركتان في حمية Low-FODMAP'});
  if(ev.garlic.length)ws.push({cls:'yellow',tag:'🧄 الثوم',name:'فركتان',desc:'من المصادر الشائعة للفركتان في حمية Low-FODMAP'});
  if(ev.inulin.length)ws.push({cls:'yellow',tag:'💨 إينولين/شيكوري',name:'ألياف قابلة للتخمّر',desc:'قد تزيد الغازات والانتفاخ لدى بعض الأشخاص'});
  if(ev.polyols.length)ws.push({cls:'yellow',tag:'💨 Polyols',name:'مُحلّيات كحولية',desc:'مثل سوربيتول ومالتيتول وزيليتول؛ قد تكون FODMAP عالية'});
  if(ev.lactose.length)ws.push({cls:'yellow',tag:'🥛 لاكتوز',name:'مكوّن ألبان محتمل',desc:'قد يسبب أعراضًا إذا كان اللاكتوز من محفزاتك'});
  if(ev.fructose.length||ev.highFodmapFruit.length)ws.push({cls:'yellow',tag:'🍯 فركتوز/FODMAP',name:'مصدر محتمل',desc:'قد يحتاج تجربة فردية وكمية صغيرة'});
  if(ev.reflux.length||(Number.isFinite(ev.totalFat)&&ev.totalFat>17.5))ws.push({cls:'yellow',tag:'🔥 الارتجاع',name:'محفز محتمل',desc:'NIDDK/WGO يوصيان بتجنب المحفزات التي تزيد أعراضك شخصيًا بدل منع كل هذه الأطعمة للجميع'});
  if(Number.isFinite(ev.sat)&&ev.sat>5)ws.push({cls:'red',tag:'♥ الدهون المشبعة',name:'مرتفعة',desc:`${ev.sat}غ/100غ — أكثر من 5غ/100غ يُصنَّف مرتفعًا في إرشادات NHS للملصقات`});
  else if(Number.isFinite(ev.sat)&&ev.sat>1.5)ws.push({cls:'yellow',tag:'♥ الدهون المشبعة',name:'متوسطة',desc:`${ev.sat}غ/100غ`});
  if(ev.partialHydrogenated.length)ws.push({cls:'red',tag:'♥ دهون متحولة',name:'زيوت مهدرجة جزئيًا',desc:'WHO توصي بأن تكون الدهون المتحولة أقل من 1% من الطاقة اليومية'});
  $('#ingredientWarnings').innerHTML=ws.map(w=>`<div class="ingredient-warning ${w.cls}"><div class="wtag">${w.tag}</div><div><b>${w.name}</b><small>${w.desc}</small></div></div>`).join('')||'<div class="ingredient-warning info"><div class="wtag">✓</div><div><b>لا توجد تحذيرات واضحة</b><small>البيانات المتاحة لا تُظهر محفزات معروفة ضمن القواعد الحالية.</small></div></div>';
  $('#ingredientAdvice').textContent=ev.wheat.length||ev.onion.length||ev.garlic.length?'إرشادات WGO/NIDDK تشير إلى أن Low-FODMAP قد يفيد بعض مرضى IBS، لكن ليس الجميع؛ الهدف تجربة قصيرة ثم إعادة إدخال الأطعمة لمعرفة تحمّلك الشخصي.':'FoodCheck يربط التقييم بإرشادات عامة موثوقة، لكنه لا يشخّص ولا يستبدل الطبيب أو أخصائي التغذية.';
}
function renderSaved(){let list=allItems(),f=favorites();if(savedMode==='fav')list=list.filter(x=>f.includes(x.code));if(savedMode==='fruit')list=list.filter(x=>x.category==='fruit');if(savedMode==='meal')list=list.filter(x=>x.category==='meal');const q=$('#savedSearch').value.trim();if(q)list=list.filter(x=>(x.name||'').includes(q));$('#savedList').innerHTML=list.length?list.map(x=>{const emoji=quickFoods.find(z=>z[0]===x.name)?.[1]||'🍽️';return`<div class="saved-row" data-code="${esc(x.code)}">${x.image?`<img class="saved-avatar" src="${esc(x.image)}" alt="">`:`<div class="saved-avatar">${emoji}</div>`}<div class="saved-copy"><b>${esc(x.name)}</b><small>${esc(x.manual?(x.category||'أكلة محفوظة'):(x.brands||'منتج'))}</small></div><button class="row-heart" data-fav="${esc(x.code)}">${f.includes(x.code)?'♥':'♡'}</button><button class="row-menu" data-del="${esc(x.code)}">⋮</button></div>`}).join(''):'<div class="saved-row"><div class="saved-copy"><b>لا توجد عناصر</b><small>أضف أكلة أو احفظ منتجًا.</small></div></div>';$$('#savedList [data-code]').forEach(r=>r.onclick=e=>{if(e.target.closest('button'))return;const i=allItems().find(x=>x.code===r.dataset.code);if(i)openResult(i)});$$('#savedList [data-fav]').forEach(b=>b.onclick=e=>{e.stopPropagation();toggleFavorite(b.dataset.fav)});$$('#savedList [data-del]').forEach(b=>b.onclick=e=>{e.stopPropagation();const code=b.dataset.del;if(confirm('حذف هذا العنصر من أكلاتي المحفوظة؟')){save(K.foods,foods().filter(x=>x.code!==code));save(K.history,history().filter(x=>x.code!==code));save(K.favorites,favorites().filter(x=>x!==code));renderSaved()}});$$('#savedFilters button').forEach(b=>b.classList.toggle('active',b.dataset.filter===savedMode))}
function addCompare(code){let c=compare().filter(x=>x!==code);c.unshift(code);save(K.compare,c.slice(0,2));toast('تمت الإضافة للمقارنة')}
function renderCompare(){const items=compare().map(c=>allItems().find(x=>x.code===c)).filter(Boolean);const renderP=(id,x)=>{$(id).innerHTML=x?`${x.image?`<img src="${esc(x.image)}" alt="">`:'<div class="saved-avatar">🍽️</div>'}<b>${esc(x.name)}</b><small>${esc(x.quantity||x.category||'')}</small>`:'<div class="saved-avatar">＋</div><b>أضف منتجًا</b>'};renderP('#compareOne',items[0]);renderP('#compareTwo',items[1]);if(items.length<2){$('#compareMatrix').innerHTML='<div class="compare-cell yellow">أضف عنصرين من شاشة النتيجة للمقارنة.</div>';return}const a=evaluate(items[0]),b=evaluate(items[1]);const sat=x=>Number.isFinite(Number(x.nutriments?.['saturated-fat_100g']))?x.nutriments['saturated-fat_100g']+'غ/100غ':'—';$('#compareMatrix').innerHTML=`<div class="compare-cell ${a.cards[2].cls}">الدهون المشبعة<b>${sat(items[0])}</b></div><div class="compare-cell ${b.cards[2].cls}">الدهون المشبعة<b>${sat(items[1])}</b></div><div class="compare-cell ${a.cards[1].cls}">الغازات والانتفاخ<b>${a.cards[1].value}</b></div><div class="compare-cell ${b.cards[1].cls}">الغازات والانتفاخ<b>${b.cards[1].value}</b></div><div class="compare-cell ${a.cards[0].cls}">الارتجاع<b>${a.cards[0].value}</b></div><div class="compare-cell ${b.cards[0].cls}">الارتجاع<b>${b.cards[0].value}</b></div>`}
function saveExperience(){if(!current)return;const vals=[];if($('#expNone').checked)vals.push('بدون أعراض');if($('#expHeart').checked)vals.push('حرقان');if($('#expGas').checked)vals.push('غازات');if($('#expBloat').checked)vals.push('انتفاخ');if(!vals.length){toast('اختر نتيجة تجربتك');return}const entry={at:Date.now(),items:vals};let h=history();let it=h.find(x=>x.code===current.code)||{...current,symptoms:[]};it.symptoms=it.symptoms||[];it.symptoms.unshift(entry);h=h.filter(x=>x.code!==current.code);h.unshift(it);save(K.history,h);$('#experienceDialog').close();toast('تم حفظ تجربتك')}
function renderReport(){const week=Date.now()-7*864e5,logs=[];history().forEach(x=>(x.symptoms||[]).forEach(s=>{if(s.at>=week)logs.push(s)}));const ok=logs.filter(x=>x.items.includes('بدون أعراض')).length,bad=logs.filter(x=>!x.items.includes('بدون أعراض')).length,total=logs.length||1;const okP=Math.round(ok/total*100),badP=Math.round(bad/total*100),unk=Math.max(0,100-okP-badP);$('#reportSummary').innerHTML=`<div class="summary-box green"><div class="face">🙂</div><b>${okP}%</b><small>أطعمة مناسبة</small></div><div class="summary-box red"><div class="face">🙁</div><b>${badP}%</b><small>أطعمة تسبب إزعاج</small></div><div class="summary-box blue"><div class="face">😐</div><b>${unk}%</b><small>غير واضحة</small></div>`;const counts={حرقان:0,غازات:0,انتفاخ:0};logs.forEach(l=>l.items.forEach(i=>{if(counts[i]!=null)counts[i]++}));const max=Math.max(1,...Object.values(counts));$('#symptomBars').innerHTML=Object.entries(counts).map(([k,v])=>`<div class="bar-row"><span>${k}</span><div class="bar-track"><div class="bar-fill" style="width:${v/max*100}%"></div></div><b>${v} مرات</b></div>`).join('');$('#personalTips').innerHTML='<li><b>الارتجاع:</b> إذا كانت الأعراض ليلية، اترك نحو 3 ساعات بين الأكل والاستلقاء، وقلل فقط المحفزات التي تلاحظ أنها تزيد الأعراض — NIDDK/WGO.</li><li><b>القولون/الانتفاخ:</b> Low-FODMAP قد يساعد بعض الأشخاص؛ الأفضل أن يكون تجربة مؤقتة مع إعادة إدخال تدريجية بدل منع دائم — WGO/NIDDK.</li><li><b>الكوليسترول:</b> WHO توصي بأن تكون الدهون المشبعة أقل من 10% من الطاقة اليومية وأن تكون الدهون أساسًا غير مشبعة.</li><li>سجّل استجابتك الشخصية لأن المحفزات تختلف بين الناس.</li>'}
async function startScanner(){showScreen('scannerScreen');$('#scanStatus').textContent='جاري تشغيل الكاميرا...';try{scannerStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});$('#scannerVideo').srcObject=scannerStream;await $('#scannerVideo').play();if('BarcodeDetector'in window){const det=new BarcodeDetector({formats:['ean_13','ean_8','upc_a','upc_e','code_128']});const tick=async()=>{if(!scannerStream)return;try{const found=await det.detect($('#scannerVideo'));if(found[0]?.rawValue){stopScanner();lookupBarcode(found[0].rawValue);return}}catch{}scannerRAF=requestAnimationFrame(tick)};tick();$('#scanStatus').textContent='وجّه الباركود داخل الإطار'}else $('#scanStatus').textContent='المسح التلقائي غير مدعوم في هذا المتصفح.'}catch{$('#scanStatus').textContent='تعذر تشغيل الكاميرا'}}
function stopScanner(){if(scannerRAF)cancelAnimationFrame(scannerRAF);scannerRAF=0;if(scannerStream){scannerStream.getTracks().forEach(t=>t.stop());scannerStream=null}const v=$('#scannerVideo');if(v)v.srcObject=null}

// events
$('#searchBtn').onclick=()=>searchName($('#searchInput').value);$('#searchInput').onkeydown=e=>{if(e.key==='Enter')searchName(e.target.value)};$('#scanBtn').onclick=startScanner;$('#photoAddBtn').onclick=()=>openAddFood('');$('#manualAddBtn').onclick=()=>openAddFood('');$('#settingsBtn').onclick=()=>$('#settingsDialog').showModal();$('#egyptProductBtn').onclick=()=>openAddFood('');$('#homeFavBtn').onclick=()=>showScreen('savedScreen','fav');$('#ingredientsBtn').onclick=openIngredients;$('#resultFavBtn').onclick=()=>current&&toggleFavorite(current.code);$('#favoriteBtn').onclick=()=>current&&toggleFavorite(current.code);$('#compareBtn').onclick=()=>{if(current){addCompare(current.code);showScreen('compareScreen')}};$('#experienceBtn').onclick=()=>$('#experienceDialog').showModal();$('#saveExperienceBtn').onclick=saveExperience;$('#closeScannerBtn').onclick=()=>showScreen('homeScreen');$('#galleryBtn').onclick=()=>toast('إضافة قراءة الباركود من الصور يمكن تطويرها لاحقًا');$('#scanPulseBtn').onclick=()=>toast('يتم المسح تلقائيًا');$('#foodPhotoInput').onchange=e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>$('#foodPhotoPreview').src=r.result;r.readAsDataURL(f)};$('#saveFoodBtn').onclick=()=>{const n=$('#foodName').value.trim();if(!n){toast('اكتب اسم الأكلة');return}const item={code:pendingBarcode||('m'+Date.now()),name:n,image:$('#foodPhotoPreview').src||'',ingredients_text:$('#foodIngredients').value.trim(),notes:$('#foodNotes').value.trim(),manual:true,category:'food',nutriments:{},symptoms:[]};saveFood(item);pendingBarcode='';openResult(item);toast('تم حفظ الأكلة وسيتم تذكر الباركود إن وُجد')};$('#savedSearch').oninput=()=>renderSaved();$$('#savedFilters button').forEach(b=>b.onclick=()=>{savedMode=b.dataset.filter;renderSaved()});$('#bestForMeBtn').onclick=()=>toast('المنتج الأكثر خضرة والأقل دهونًا مشبعة غالبًا أنسب حسب القواعد الحالية.');$$('[data-back]').forEach(b=>b.onclick=()=>showScreen(b.dataset.back));$$('.nav').forEach(b=>b.onclick=()=>showScreen(b.dataset.screen,b.dataset.mode));$('#savePrefsBtn').onclick=()=>{save(K.prefs,{reflux:$('#prefReflux').checked,gas:$('#prefGas').checked,chol:$('#prefChol').checked});toast('تم حفظ الإعدادات')};
renderQuick();renderSaved();renderReport();showScreen('homeScreen');
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
