const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const K={
  foods:'fc20_foods',history:'fc20_history',favorites:'fc20_favorites',compare:'fc20_compare',prefs:'fc20_prefs',
  profiles:'fc_profiles_v1',activeProfile:'fc_active_profile_v1',contributions:'fc_contributions_v1',communityCache:'fc_egypt_community_v1'
};
let activeProfileId=localStorage.getItem(K.activeProfile)||'me';
let communityProducts=[];
const PROFILE_BASES=[K.foods,K.history,K.favorites,K.compare,K.prefs];
const pkey=base=>`${base}:${activeProfileId}`;
const quickFoods=[['موز','🍌','fruit'],['تفاح','🍎','fruit'],['برتقال','🍊','fruit'],['فراولة','🍓','fruit'],['شوفان','🥣','food'],['أرز','🍚','food'],['دجاج','🍗','meal'],['زبادي','🥛','food']];
const builtInFoods=[
  {code:'builtin-garlic',name:'ثوم',aliases:['ثوم','الثوم','توم','التوم','garlic'],category:'خضار / بهار',ingredients_text:'ثوم',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-onion',name:'بصل',aliases:['بصل','البصل','onion'],category:'خضار',ingredients_text:'بصل',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-tomato',name:'طماطم',aliases:['طماطم','الطماطم','قوطة','قوطه','tomato'],category:'خضار',ingredients_text:'طماطم',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-potato',name:'بطاطس',aliases:['بطاطس','البطاطس','potato','potatoes'],category:'خضار',ingredients_text:'بطاطس',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-sweet-potato',name:'بطاطا',aliases:['بطاطا','البطاطا','sweet potato'],category:'خضار',ingredients_text:'بطاطا',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-zucchini',name:'كوسة',aliases:['كوسة','كوسه','الكوسة','الكوسه','كوسا','zucchini','courgette'],category:'خضار',ingredients_text:'كوسة',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-eggplant',name:'باذنجان',aliases:['باذنجان','الباذنجان','eggplant','aubergine'],category:'خضار',ingredients_text:'باذنجان',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-cucumber',name:'خيار',aliases:['خيار','الخيار','cucumber'],category:'خضار',ingredients_text:'خيار',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-carrot',name:'جزر',aliases:['جزر','الجزر','carrot'],category:'خضار',ingredients_text:'جزر',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-cabbage',name:'كرنب',aliases:['كرنب','الكرنب','ملفوف','cabbage'],category:'خضار',ingredients_text:'كرنب',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-cauliflower',name:'قرنبيط',aliases:['قرنبيط','القرنبيط','زهرة','زهره','cauliflower'],category:'خضار',ingredients_text:'قرنبيط',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-peas',name:'بسلة',aliases:['بسلة','بسله','البسلة','البسله','بازلاء','peas'],category:'خضار',ingredients_text:'بسلة',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-okra',name:'بامية',aliases:['بامية','باميه','البامية','الباميه','okra'],category:'خضار',ingredients_text:'بامية',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-molokhia',name:'ملوخية',aliases:['ملوخية','ملوخيه','الملوخية','الملوخيه','molokhia','molokhiya'],category:'خضار',ingredients_text:'ملوخية',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-spinach',name:'سبانخ',aliases:['سبانخ','السبانخ','spinach'],category:'خضار',ingredients_text:'سبانخ',nutriments:{},manual:true,image:'',symptoms:[]},

  {code:'builtin-wheat',name:'قمح',aliases:['قمح','القمح','دقيق القمح','دقيق قمح','طحين قمح','wheat'],category:'حبوب',ingredients_text:'قمح',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-oats',name:'شوفان',aliases:['شوفان','الشوفان','oats','oat'],category:'حبوب',ingredients_text:'شوفان',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-rice',name:'أرز',aliases:['أرز','ارز','الأرز','الارز','رز','الرز','rice'],category:'حبوب',ingredients_text:'أرز',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-pasta',name:'مكرونة',aliases:['مكرونة','مكرونه','المكرونة','المكرونه','معكرونة','pasta','macaroni'],category:'حبوب',ingredients_text:'دقيق قمح',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-bread',name:'عيش بلدي',aliases:['عيش','العيش','عيش بلدي','العيش البلدي','خبز','خبز بلدي','baladi bread'],category:'خبز',ingredients_text:'دقيق قمح',nutriments:{},manual:true,image:'',symptoms:[]},

  {code:'builtin-fava',name:'فول',aliases:['فول','الفول','فول مدمس','الفول المدمس','fava beans','ful','foul'],category:'بقوليات',ingredients_text:'فول',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-lentils',name:'عدس',aliases:['عدس','العدس','lentils','lentil'],category:'بقوليات',ingredients_text:'عدس',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-chickpeas',name:'حمص',aliases:['حمص','الحمص','chickpeas','chickpea'],category:'بقوليات',ingredients_text:'حمص',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-beans',name:'فاصوليا',aliases:['فاصوليا','فاصوليه','الفاصوليا','الفاصوليه','beans'],category:'بقوليات',ingredients_text:'فاصوليا',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-blackeyed',name:'لوبيا',aliases:['لوبيا','اللوبيا','black eyed peas','black-eyed peas'],category:'بقوليات',ingredients_text:'لوبيا',nutriments:{},manual:true,image:'',symptoms:[]},

  {code:'builtin-milk',name:'لبن',aliases:['لبن','اللبن','حليب','الحليب','milk'],category:'ألبان',ingredients_text:'حليب',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-yogurt',name:'زبادي',aliases:['زبادي','الزبادي','yogurt','yoghurt'],category:'ألبان',ingredients_text:'زبادي',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-cheese',name:'جبنة',aliases:['جبنة','جبنه','الجبنة','الجبنه','cheese'],category:'ألبان',ingredients_text:'جبنة',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-cottage-cheese',name:'جبنة قريش',aliases:['جبنة قريش','جبنه قريش','قريش','cottage cheese'],category:'ألبان',ingredients_text:'جبنة قريش',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-roumy-cheese',name:'جبنة رومي',aliases:['جبنة رومي','جبنه رومي','رومي','جبن رومي'],category:'ألبان',ingredients_text:'جبنة رومي',nutriments:{},manual:true,image:'',symptoms:[]},

  {code:'builtin-chicken',name:'دجاج',aliases:['دجاج','الدجاج','فراخ','الفراخ','فرخة','فرخه','chicken'],category:'بروتين',ingredients_text:'دجاج',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-meat',name:'لحمة',aliases:['لحمة','لحمه','اللحمة','اللحمه','لحم','لحمه حمرا','لحمة حمرا','لحم احمر','لحم أحمر','beef','meat','red meat'],category:'بروتين',ingredients_text:'لحم',nutriments:{},manual:true,image:'',symptoms:[],genericRedMeat:true},
  {code:'builtin-fish',name:'سمك',aliases:['سمك','السمك','fish'],category:'بروتين',ingredients_text:'سمك',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-shrimp',name:'جمبري',aliases:['جمبري','الجمبري','روبيان','shrimp','prawn','prawns'],category:'بروتين',ingredients_text:'جمبري',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-squid',name:'سبيط',aliases:['سبيط','السبيط','كاليماري','حبار','squid','calamari'],category:'بروتين',ingredients_text:'سبيط',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-eggs',name:'بيض',aliases:['بيض','البيض','egg','eggs'],category:'بروتين',ingredients_text:'بيض',nutriments:{},manual:true,image:'',symptoms:[]},

  {code:'builtin-banana',name:'موز',aliases:['موز','الموز','banana'],category:'فاكهة',ingredients_text:'موز',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-apple',name:'تفاح',aliases:['تفاح','التفاح','apple'],category:'فاكهة',ingredients_text:'تفاح',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-orange',name:'برتقال',aliases:['برتقال','البرتقال','برتقان','البرتقان','orange'],category:'فاكهة',ingredients_text:'برتقال',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-tangerine',name:'يوسفي',aliases:['يوسفي','يوسفى','اليوسفي','اليوسفى','tangerine','mandarin'],category:'فاكهة',ingredients_text:'يوسفي',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-strawberry',name:'فراولة',aliases:['فراولة','فراوله','الفراولة','الفراوله','strawberry'],category:'فاكهة',ingredients_text:'فراولة',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-mango',name:'مانجو',aliases:['مانجو','المانجو','mango'],category:'فاكهة',ingredients_text:'مانجو',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-guava',name:'جوافة',aliases:['جوافة','جوافه','الجوافة','الجوافه','guava'],category:'فاكهة',ingredients_text:'جوافة',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-watermelon',name:'بطيخ',aliases:['بطيخ','البطيخ','watermelon'],category:'فاكهة',ingredients_text:'بطيخ',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-dates',name:'بلح',aliases:['بلح','البلح','تمر','التمر','dates','date'],category:'فاكهة',ingredients_text:'تمر',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-grapes',name:'عنب',aliases:['عنب','العنب','grapes','grape'],category:'فاكهة',ingredients_text:'عنب',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-peach',name:'خوخ',aliases:['خوخ','الخوخ','peach'],category:'فاكهة',ingredients_text:'خوخ',nutriments:{},manual:true,image:'',symptoms:[]},
  {code:'builtin-apricot',name:'مشمش',aliases:['مشمش','المشمش','apricot'],category:'فاكهة',ingredients_text:'مشمش',nutriments:{},manual:true,image:'',symptoms:[]},

  {code:'builtin-koshary',name:'كشري',aliases:['كشري','كشرى','الكشري','الكشرى','koshari','koshary'],category:'وجبة مصرية',ingredients_text:'',nutriments:{},manual:true,image:'',symptoms:[],needsIngredients:true},
  {code:'builtin-taameya',name:'طعمية',aliases:['طعمية','طعميه','الطعمية','الطعميه','فلافل','falafel','taameya'],category:'وجبة مصرية',ingredients_text:'',nutriments:{},manual:true,image:'',symptoms:[],needsIngredients:true},
  {code:'builtin-mahshi',name:'محشي',aliases:['محشي','محشى','المحشي','المحشى','mahshi'],category:'وجبة مصرية',ingredients_text:'',nutriments:{},manual:true,image:'',symptoms:[],needsIngredients:true},
  {code:'builtin-hawawshi',name:'حواوشي',aliases:['حواوشي','حواوشى','الحواوشي','الحواوشى','hawawshi'],category:'وجبة مصرية',ingredients_text:'',nutriments:{},manual:true,image:'',symptoms:[],needsIngredients:true},
  {code:'builtin-kofta',name:'كفتة',aliases:['كفتة','كفته','الكفتة','الكفته','kofta','kefta'],category:'وجبة',ingredients_text:'',nutriments:{},manual:true,image:'',symptoms:[],needsIngredients:true},
  {code:'builtin-kebda',name:'كبدة',aliases:['كبدة','كبده','الكبدة','الكبده','kebda','liver'],category:'وجبة',ingredients_text:'',nutriments:{},manual:true,image:'',symptoms:[],needsIngredients:true},
  {code:'builtin-macaroni-bechamel',name:'مكرونة بشاميل',aliases:['مكرونة بشاميل','مكرونه بشاميل','بشاميل','macaroni bechamel'],category:'وجبة مصرية',ingredients_text:'',nutriments:{},manual:true,image:'',symptoms:[],needsIngredients:true},
  {code:'builtin-feteer',name:'فطير مشلتت',aliases:['فطير مشلتت','فطير','الفطير','feteer','feteer meshaltet'],category:'وجبة مصرية',ingredients_text:'',nutriments:{},manual:true,image:'',symptoms:[],needsIngredients:true},
  {code:'builtin-omali',name:'أم علي',aliases:['أم علي','ام علي','ام على','أم على','om ali','umm ali'],category:'حلوى مصرية',ingredients_text:'',nutriments:{},manual:true,image:'',symptoms:[],needsIngredients:true},
  {code:'builtin-roz-bel-laban',name:'رز بلبن',aliases:['رز بلبن','ارز بلبن','أرز بلبن','rice pudding'],category:'حلوى / ألبان',ingredients_text:'',nutriments:{},manual:true,image:'',symptoms:[],needsIngredients:true}
]
const dishIngredientPresets={
  'كشري':['أرز','مكرونة','عدس','حمص','بصل','صلصة طماطم','ثوم','شطة'],
  'طعمية':['فول','بصل','ثوم','خضرة','زيت للقلي'],
  'محشي':['أرز','بصل','صلصة طماطم','خضرة','زيت/سمنة'],
  'حواوشي':['عيش بلدي','لحمة','بصل','فلفل','بهارات','دهون/سمنة'],
  'كفتة':['لحمة','بصل','بهارات','دهون'],
  'كبدة':['كبدة','ثوم','فلفل','زيت','ليمون'],
  'مكرونة بشاميل':['مكرونة','لبن','دقيق','زبدة/سمنة','لحمة مفرومة'],
  'فطير مشلتت':['دقيق قمح','سمنة/زبدة'],
  'أم علي':['رقاق/عجين','لبن','سكر','مكسرات','قشطة'],
  'رز بلبن':['أرز','لبن','سكر']
};
function renderDishChips(name){
  const box=$('#egyptIngredientChips'); if(!box)return;
  const list=dishIngredientPresets[name]||[];
  box.classList.toggle('hidden',!list.length);
  box.innerHTML=list.length?`<div class="chips-title">اختار الموجود في وصفتك:</div>${list.map(x=>`<button type="button" class="ingredient-chip" data-ing="${esc(x)}">${esc(x)}</button>`).join('')}`:'';
  $('#egyptIngredientChips .ingredient-chip').forEach(b=>b.onclick=()=>{
    b.classList.toggle('active');
    const chosen=$('#egyptIngredientChips .ingredient-chip.active').map(x=>x.dataset.ing);
    $('#foodIngredients').value=chosen.join('، ');
  });
}
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
function initProfiles(){
  let ps=load(K.profiles,[]);
  if(!ps.length){ps=[{id:'me',name:'أنا'}];save(K.profiles,ps)}
  if(!ps.some(p=>p.id===activeProfileId)){activeProfileId=ps[0].id;localStorage.setItem(K.activeProfile,activeProfileId)}
  // One-time migration of pre-profile local data into the first profile.
  PROFILE_BASES.forEach(base=>{
    const dest=`${base}:${activeProfileId}`;
    if(localStorage.getItem(dest)==null&&localStorage.getItem(base)!=null)localStorage.setItem(dest,localStorage.getItem(base));
  });
}
initProfiles();
const foods=()=>load(pkey(K.foods),[]), history=()=>load(pkey(K.history),[]), favorites=()=>load(pkey(K.favorites),[]), compare=()=>load(pkey(K.compare),[]), prefs=()=>load(pkey(K.prefs),{reflux:true,gas:true,chol:true,lowData:false});
const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function toast(t){const el=$('#toast');el.textContent=t;el.classList.remove('hidden');setTimeout(()=>el.classList.add('hidden'),1900)}
function allItems(){const m=new Map();[...foods(),...history()].forEach(x=>m.set(x.code,x));return [...m.values()]}
function contributions(){return load(K.contributions,[])}
function sourceLabel(item){
  if(item?.source)return item.source;
  if(item?.code?.startsWith('builtin-'))return 'FoodCheck Egypt';
  if(item?.manual)return 'إضافة محلية';
  return 'Open Food Facts';
}
function confidenceFor(item){
  const hasIng=!!(item?.ingredients_text||'').trim();
  const hasSat=Number.isFinite(Number(item?.nutriments?.['saturated-fat_100g']));
  const hasFat=Number.isFinite(Number(item?.nutriments?.['fat_100g']));
  if(hasIng&&hasSat)return {level:'عالية',cls:'high',why:'المكونات والدهون المشبعة متاحة'};
  if(hasIng&&(hasFat||item?.code?.startsWith('builtin-')))return {level:'متوسطة',cls:'medium',why:'المكونات متاحة لكن بعض القيم الغذائية ناقصة'};
  if(hasIng)return {level:'متوسطة',cls:'medium',why:'المكونات متاحة'};
  return {level:'منخفضة',cls:'low',why:'الاسم وحده لا يكفي لتقييم دقيق'};
}
async function loadCommunity(){
  const cached=load(K.communityCache,[]);
  if(Array.isArray(cached))communityProducts=cached;
  if(prefs().lowData||!navigator.onLine){updateNetworkBadge();return}
  try{
    const r=await fetch('./community-products.json',{cache:'no-store'});
    if(r.ok){
      const d=await r.json();
      communityProducts=Array.isArray(d.products)?d.products:(Array.isArray(d)?d:[]);
      save(K.communityCache,communityProducts);
    }
  }catch{}
  updateNetworkBadge();
}
function communityFindByCode(code){return communityProducts.find(x=>String(x.code)===String(code))}
function updateNetworkBadge(){
  const el=$('#networkBadge'); if(!el)return;
  if(!navigator.onLine)el.textContent='غير متصل · البحث المحلي يعمل';
  else if(prefs().lowData)el.textContent='وضع توفير البيانات · البحث المحلي فقط';
  else el.textContent='متصل · البحث العالمي متاح';
}
function showScreen(id,mode){$$('.screen').forEach(s=>{s.classList.add('hidden');s.classList.remove('active')});const el=$('#'+id);if(el){el.classList.remove('hidden');el.classList.add('active')}if(id!=='scannerScreen')stopScanner();if(id==='savedScreen'){savedMode=mode||savedMode;renderSaved()}if(id==='compareScreen')renderCompare();if(id==='reportScreen')renderReport();$$('.nav').forEach(n=>n.classList.toggle('active',n.dataset.screen===id&&(!n.dataset.mode||n.dataset.mode===savedMode)));scrollTo({top:0,behavior:'smooth'})}
function renderQuick(){ $('#quickFoodGrid').innerHTML=quickFoods.map(([n,e])=>`<button class="food-card" data-food="${esc(n)}"><div class="food-emoji">${e}</div><b>${esc(n)}</b></button>`).join(''); $$('.food-card').forEach(b=>b.onclick=()=>openAddFood(b.dataset.food)); }
function openAddFood(name='',barcode=''){
  pendingBarcode=barcode||'';
  showScreen('addFoodScreen');
  $('#foodName').value=name;
  $('#foodIngredients').value='';
  $('#foodNotes').value=barcode?`باركود: ${barcode}`:'';
  if($('#foodSatFat'))$('#foodSatFat').value='';
  if($('#foodPrice'))$('#foodPrice').value='';
  if($('#ocrStatus')){$('#ocrStatus').textContent='';$('#ocrStatus').classList.add('hidden')}
  $('#foodPhotoPreview').src='';
  renderDishChips(name);
  const hint=$('#localProductHint');
  if(hint){
    hint.classList.toggle('hidden',!barcode);
    hint.innerHTML=barcode?`🇪🇬 <b>المنتج غير موجود في القاعدة العالمية.</b><br>أضف الاسم والمكونات من العبوة، وسيتذكر FoodCheck الباركود <span dir="ltr">${esc(barcode)}</span> على هذا الجهاز.`:'';
  }
}
function addHistory(item){const h=history().filter(x=>x.code!==item.code);h.unshift({...item,lastSeen:Date.now(),symptoms:item.symptoms||[]});save(pkey(K.history),h.slice(0,40))}
function saveFood(item){const f=foods().filter(x=>x.code!==item.code);f.unshift(item);save(pkey(K.foods),f.slice(0,80));addHistory(item)}
function normalizeProduct(p){return{code:p.code||('p'+Date.now()),name:p.product_name||'بدون اسم',brands:p.brands||'',image:p.image_front_small_url||'',quantity:p.quantity||'',ingredients_text:p.ingredients_text||'',nutriments:p.nutriments||{},manual:false,symptoms:[],source:'Open Food Facts'}}
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
  const highFodmapFruit=match(['apple','pear','mango','cherry','watermelon','peach','apricot','تفاح','كمثرى','مانجو','كرز','بطيخ','خوخ','مشمش']);
  const legumes=match(['fava beans','beans','lentil','lentils','chickpea','chickpeas','black eyed peas','فول','فاصوليا','فاصوليه','عدس','حمص','لوبيا','بسلة','بسله','بازلاء']);
  const fodmapVeg=match(['cauliflower','cabbage','mushroom','قرنبيط','كرنب','مشروم','فطر']);
  const gas=[...new Set([...wheat,...onion,...garlic,...polyols,...inulin,...lactose,...fructose,...highFodmapFruit,...legumes,...fodmapVeg])];

  // GERD: NIDDK + WGO. These are possible triggers, not universal exclusions.
  const reflux=match(['tomato','tomaat','citrus','orange','lemon','chili','hot pepper','spicy','chocolate','cacao','cocoa','coffee','caffeine','mint','peppermint','طماطم','صلصة طماطم','حمضيات','برتقال','ليمون','شطة','فلفل حار','حار','شوكولاتة','كاكاو','قهوة','كافيين','نعناع']);
  const highFatForReflux=Number.isFinite(totalFat)&&totalFat>17.5;
  const genericRedMeat=!!item.genericRedMeat||item.code==='builtin-meat'||['لحمه','لحمه حمرا','لحم','لحم احمر','beef','red meat'].includes(normalizeSearchText(item.name));
  const processedMeatTerms=match(['sausage','sausages','salami','bacon','hot dog','deli meat','processed meat','سجق','سوسيس','لانشون','سلامي','بسطرمة','بسترمة','لحم مصنع','لحوم مصنعة']);
  const processedMeat=processedMeatTerms.length>0;

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
  if(highFodmapFruit.length)gasDetail.push('فاكهة قد تكون أعلى FODMAP حسب النوع والكمية');
  if(legumes.length)gasDetail.push('بقوليات — الكمية مهمة في FODMAP');
  if(fodmapVeg.length)gasDetail.push('خضار قد تكون أعلى FODMAP حسب الكمية');

  const refluxFlags=[...reflux];
  if(highFatForReflux)refluxFlags.push('high-fat');

  const refluxCard=!p.reflux?{icon:'🔥',title:'الارتجاع المعدي المريئي',cls:'gray',value:'غير مفعّل',detail:'فعّل هذا القسم من الإعدادات'}
    :genericRedMeat&&!Number.isFinite(totalFat)?{icon:'🔥',title:'الارتجاع المعدي المريئي',cls:'yellow',value:'يعتمد على نسبة الدهون',detail:'القطع الدسمة قد تزيد أعراض الارتجاع لدى بعض الأشخاص؛ القطعة القليلة الدهون ليست ممنوعة تلقائيًا'}
    :!hasIngredients&&!Number.isFinite(totalFat)?{icon:'🔥',title:'الارتجاع المعدي المريئي',cls:'gray',value:'معلومات غير كافية',detail:'لا توجد مكونات أو بيانات دهون كافية'}
    :refluxFlags.length?{icon:'🔥',title:'الارتجاع المعدي المريئي',cls:'yellow',value:'قد يهيّج الأعراض',detail:'هذه محفزات محتملة وليست ممنوعة للجميع؛ راقب استجابتك الشخصية'}
    :{icon:'🔥',title:'الارتجاع المعدي المريئي',cls:'green',value:'لا توجد مؤشرات واضحة',detail:'لم أجد محفزات شائعة في البيانات المتاحة'};

  const gasCard=!p.gas?{icon:'🌾',title:'الغازات والانتفاخ',cls:'gray',value:'غير مفعّل',detail:'فعّل هذا القسم من الإعدادات'}
    :!hasIngredients?{icon:'🌾',title:'الغازات والانتفاخ',cls:'gray',value:'معلومات غير كافية',detail:'أضف قائمة المكونات لتقييم FODMAP بصورة أفضل'}
    :gas.length?{icon:'🌾',title:'الغازات والانتفاخ',cls:'yellow',value:'قد يسبب انتفاخًا',detail:`مؤشرات FODMAP محتملة: ${gasDetail.join('، ')}`}
    :{icon:'🌾',title:'الغازات والانتفاخ',cls:'green',value:'لا توجد مؤشرات واضحة',detail:'اللحوم الطازجة غير المتبلة لا تحتوي عادةً على FODMAP؛ انتبه للبصل والثوم والصلصات المصاحبة'};

  let heartCard;
  if(!p.chol){
    heartCard={icon:'♥',title:'الدهون المشبعة / الكوليسترول',cls:'gray',value:'غير مفعّل',detail:'فعّل هذا القسم من الإعدادات'};
  }else if(processedMeat&&!hasSat){
    heartCard={icon:'♥',title:'الدهون المشبعة / الكوليسترول',cls:'yellow',value:'قلّل اللحوم المصنّعة',detail:'السجق واللانشون والسلامي غالبًا أعلى في الدهون المشبعة والملح؛ اخترها أقل تكرارًا وراجع الملصق'};
  }else if(genericRedMeat&&!hasSat){
    heartCard={icon:'♥',title:'الدهون المشبعة / الكوليسترول',cls:'yellow',value:'يعتمد على القطعة',detail:'اختر قطعة قليلة الدهون، أزل الدهون الظاهرة، ويفضل اللحم غير المصنّع. أدخل الدهون المشبعة/100غ إن كانت متاحة لتقييم أدق'};
  }else{
    heartCard={icon:'♥',title:'الدهون المشبعة / الكوليسترول',...fat};
  }

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
    genericRedMeat?'اللحمة الحمراء ليست ممنوعة تلقائيًا: WHO وNHS وAHA يوصون باختيار القطع قليلة الدهون، إزالة الدهون الظاهرة، وتفضيل اللحوم غير المصنّعة. WHO توصي بأن تكون الدهون المشبعة أقل من 10% من الطاقة اليومية.':'',
    refluxCard.cls==='yellow'&&!genericRedMeat?'الارتجاع: تم رصد محفزات شائعة مذكورة في إرشادات NIDDK/WGO.':'',
    genericRedMeat&&refluxCard.cls==='yellow'?'الارتجاع: القطع الأعلى دهونًا قد تكون أكثر إزعاجًا؛ الاختيار يعتمد على نسبة الدهون واستجابتك الشخصية.':'',
    gasCard.cls==='yellow'?'القولون/الانتفاخ: تم رصد مكونات FODMAP محتملة وفق WGO/NIDDK وMonash.':'',
    !genericRedMeat&&(heartCard.cls==='red'||heartCard.cls==='yellow')?'القلب: تصنيف الدهون المشبعة يعتمد على غ/100غ؛ حدود 1.5غ و5غ مأخوذة من إرشادات قراءة الملصقات في NHS، مع هدف WHO اليومي للدهون المشبعة.':''
  ].filter(Boolean).join(' ');

  return{overall,title,detail,cards,wheat,onion,garlic,polyols,inulin,lactose,fructose,highFodmapFruit,legumes,fodmapVeg,reflux,palm,partialHydrogenated,sat,totalFat,basis,genericRedMeat,processedMeat};
}
function openResult(item){current=item;addHistory(item);const ev=evaluate(item);showScreen('resultScreen');$('#resultImage').src=item.image||'';$('#resultImage').style.visibility=item.image?'visible':'hidden';$('#resultName').textContent=item.name||'بدون اسم';$('#resultMeta').textContent=item.manual?(item.category||'أكلة محفوظة'):`${item.brands||''}${item.quantity?' · '+item.quantity:''}`;$('#resultCode').textContent=item.manual?'':item.code;const box=$('#overallBox');box.className='overall-box '+ev.overall;$('#overallTitle').textContent=ev.title;$('#overallDetail').textContent=ev.detail;$('#healthCards').innerHTML=ev.cards.map(c=>`<div class="health-row ${c.cls}"><div class="hicon">${c.icon}</div><div class="hcopy"><strong>${esc(c.title)}</strong><b>${esc(c.value)}</b><p>${esc(c.detail)}</p></div></div>`).join('');if($('#decisionBasis'))$('#decisionBasis').textContent=ev.basis||'التقييم يعتمد على البيانات المتاحة فقط، ولا توجد قاعدة واحدة تمنع طعامًا بعينه لكل الأشخاص.';
const cf=confidenceFor(item);if($('#confidenceChip')){$('#confidenceChip').textContent=`ثقة ${cf.level}`;$('#confidenceChip').className='confidence-chip '+cf.cls;$('#confidenceChip').title=cf.why}
if($('#dataSource'))$('#dataSource').textContent='المصدر: '+sourceLabel(item);
if($('#portionQty'))$('#portionQty').value=1;
if($('#portionUnit'))$('#portionUnit').value='100g';
renderPortionSummary();
refreshFavButtons()}
function refreshFavButtons(){if(!current)return;const yes=favorites().includes(current.code);$('#resultFavBtn').textContent=yes?'♥':'♡';$('#favoriteBtn').innerHTML=`<span>${yes?'♥':'♡'}</span><b>${yes?'إزالة من المفضلة':'أضف للمفضلة'}</b>`}
function toggleFavorite(code){const f=favorites();save(pkey(K.favorites),f.includes(code)?f.filter(x=>x!==code):[code,...f]);refreshFavButtons();renderSaved()}
async function lookupBarcode(code){
  code=String(code||'').trim();
  const local=allItems().find(x=>String(x.code)===code);
  if(local){openResult(local);toast('تم العثور عليه في أكلاتك المحفوظة');return}
  const community=communityFindByCode(code);
  if(community){openResult({...community,source:'FoodCheck Egypt Community'});toast('تم العثور عليه في قاعدة FoodCheck Egypt');return}
  if(prefs().lowData||!navigator.onLine){
    toast('غير موجود محليًا — أضفه مرة واحدة وسأتذكر الباركود');
    openAddFood('',code);return;
  }
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
    if(built.needsIngredients){
      openAddFood(built.name);
      toast('الأكلة لها وصفات مختلفة — أضف مكوناتها لتحليل أدق');
    }else{
      openResult({...built});
    }
    return;
  }

  const nq=normalizeSearchText(q);
  const local=allItems().find(x=>normalizeSearchText(x.name||'').includes(nq));
  if(local){openResult(local);return}
  const community=communityProducts
    .map(x=>({x,score:(normalizeSearchText(x.name||x.product_name||'').includes(nq)?8:0)+(x.ingredients_text?2:0)}))
    .sort((a,b)=>b.score-a.score)[0];
  if(community?.score>0){openResult({...community.x,name:community.x.name||community.x.product_name,source:'FoodCheck Egypt Community'});return}
  if(prefs().lowData||!navigator.onLine){toast('وضع البحث المحلي فقط — لم أجد هذا الطعام محفوظًا');return}

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
  if(ev.legumes?.length)ws.push({cls:'yellow',tag:'🫘 بقوليات',name:'الكمية مهمة',desc:'بعض البقول قد تكون أعلى FODMAP حسب النوع والحصة'});
  if(ev.fodmapVeg?.length)ws.push({cls:'yellow',tag:'🥦 خضار FODMAP',name:'الكمية مهمة',desc:'التحمل يختلف حسب النوع والكمية'});
  if(ev.reflux.length||(Number.isFinite(ev.totalFat)&&ev.totalFat>17.5))ws.push({cls:'yellow',tag:'🔥 الارتجاع',name:'محفز محتمل',desc:'NIDDK/WGO يوصيان بتجنب المحفزات التي تزيد أعراضك شخصيًا بدل منع كل هذه الأطعمة للجميع'});
  if(Number.isFinite(ev.sat)&&ev.sat>5)ws.push({cls:'red',tag:'♥ الدهون المشبعة',name:'مرتفعة',desc:`${ev.sat}غ/100غ — أكثر من 5غ/100غ يُصنَّف مرتفعًا في إرشادات NHS للملصقات`});
  else if(Number.isFinite(ev.sat)&&ev.sat>1.5)ws.push({cls:'yellow',tag:'♥ الدهون المشبعة',name:'متوسطة',desc:`${ev.sat}غ/100غ`});
  if(ev.partialHydrogenated.length)ws.push({cls:'red',tag:'♥ دهون متحولة',name:'زيوت مهدرجة جزئيًا',desc:'WHO توصي بأن تكون الدهون المتحولة أقل من 1% من الطاقة اليومية'});
  $('#ingredientWarnings').innerHTML=ws.map(w=>`<div class="ingredient-warning ${w.cls}"><div class="wtag">${w.tag}</div><div><b>${w.name}</b><small>${w.desc}</small></div></div>`).join('')||'<div class="ingredient-warning info"><div class="wtag">✓</div><div><b>لا توجد تحذيرات واضحة</b><small>البيانات المتاحة لا تُظهر محفزات معروفة ضمن القواعد الحالية.</small></div></div>';
  $('#ingredientAdvice').textContent=ev.genericRedMeat?'بالنسبة للحوم الحمراء، لا يكفي اسم «لحمة» وحده للحكم على الكوليسترول. الأفضل معرفة القطعة ونسبة الدهون؛ اختر القطع القليلة الدهون وأزل الدهون الظاهرة وقلل اللحوم المصنّعة.':ev.wheat.length||ev.onion.length||ev.garlic.length?'إرشادات WGO/NIDDK تشير إلى أن Low-FODMAP قد يفيد بعض مرضى IBS، لكن ليس الجميع؛ الهدف تجربة قصيرة ثم إعادة إدخال الأطعمة لمعرفة تحمّلك الشخصي.':'FoodCheck يربط التقييم بإرشادات عامة موثوقة، لكنه لا يشخّص ولا يستبدل الطبيب أو أخصائي التغذية.';
}
function gramsForPortion(){
  const qty=Math.max(.1,Number($('#portionQty')?.value)||1);
  const unit=$('#portionUnit')?.value||'100g';
  const grams={g:1,'100g':100,tbsp:15,cup:240,halfbaladi:45,baladi:90,piece:50,sandwich:180}[unit]||100;
  return qty*grams;
}
function renderPortionSummary(){
  const box=$('#portionSummary'); if(!box||!current)return;
  const g=gramsForPortion();
  const sat=Number(current.nutriments?.['saturated-fat_100g']);
  const ev=evaluate(current);
  const satTxt=Number.isFinite(sat)?`الدهون المشبعة في هذه الكمية ≈ <b>${(sat*g/100).toFixed(1)}غ</b>.`:'لا توجد قيمة دهون مشبعة كافية لحساب الحصة.';
  const gut=ev.cards[1].cls==='yellow'?' يوجد مكوّن FODMAP محتمل؛ تأثيره يعتمد على نوع الطعام والكمية وتحملك الشخصي.':'';
  box.innerHTML=`الكمية التقديرية: <b>${Math.round(g)} جم</b>. ${satTxt}${gut}`;
}
function openCorrection(){
  if(!current)return;
  $('#correctName').value=current.name||'';
  $('#correctIngredients').value=current.ingredients_text||'';
  const sat=Number(current.nutriments?.['saturated-fat_100g']);
  $('#correctSatFat').value=Number.isFinite(sat)?sat:'';
  $('#correctionDialog').showModal();
}
function saveCorrection(){
  if(!current)return;
  const sat=Number($('#correctSatFat').value);
  const corrected={...current,name:$('#correctName').value.trim()||current.name,ingredients_text:$('#correctIngredients').value.trim(),manual:true,source:'تصحيح محلي',nutriments:{...(current.nutriments||{})}};
  if(Number.isFinite(sat))corrected.nutriments['saturated-fat_100g']=sat;
  saveFood(corrected); current=corrected; $('#correctionDialog').close(); openResult(corrected); toast('تم حفظ التصحيح على جهازك');
}
function queueContribution(){
  if(!current)return;
  const q=contributions();
  const entry={...current,submittedAt:new Date().toISOString(),profile:activeProfileId,status:'pending-review'};
  const next=q.filter(x=>x.code!==entry.code); next.unshift(entry); save(K.contributions,next.slice(0,100));
  toast('تم تجهيز المنتج للمراجعة ضمن مساهماتك');
  updateCommunityStatus();
  if(confirm('تم حفظ المساهمة محليًا. هل تريد فتح نموذج GitHub لإرسالها للمراجعة الآن؟')){
    const body=[
      '### FoodCheck Egypt product contribution',
      '',
      '**Barcode:** '+(entry.code||''),
      '**Name:** '+(entry.name||''),
      '**Brand:** '+(entry.brands||''),
      '**Saturated fat /100g:** '+(entry.nutriments?.['saturated-fat_100g']??''),
      '',
      '**Ingredients**',
      entry.ingredients_text||'',
      '',
      '> يرجى مراجعة البيانات قبل إضافتها إلى community-products.json.'
    ].join('\n');
    const url='https://github.com/mahmutnasser/foodcheck/issues/new?title='+encodeURIComponent('Egypt product: '+(entry.name||entry.code))+'&body='+encodeURIComponent(body);
    window.open(url,'_blank','noopener');
  }
}
function exportContributions(){
  const data={version:1,exportedAt:new Date().toISOString(),products:contributions()};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='foodcheck-egypt-contributions.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function profiles(){return load(K.profiles,[{id:'me',name:'أنا'}])}
function renderProfiles(){
  const sel=$('#profileSelect'); if(!sel)return;
  sel.innerHTML=profiles().map(p=>`<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
  sel.value=activeProfileId;
  const p=prefs();
  $('#prefReflux').checked=p.reflux!==false;$('#prefGas').checked=p.gas!==false;$('#prefChol').checked=p.chol!==false;$('#prefLowData').checked=!!p.lowData;
  updateCommunityStatus();
}
function switchProfile(id){
  if(!profiles().some(p=>p.id===id))return;
  activeProfileId=id;localStorage.setItem(K.activeProfile,id);current=null;renderProfiles();renderSaved();renderReport();showScreen('homeScreen');toast('تم تغيير فرد الأسرة');
}
function addProfile(){
  const name=prompt('اسم فرد الأسرة'); if(!name?.trim())return;
  const ps=profiles(),id='p'+Date.now();ps.push({id,name:name.trim()});save(K.profiles,ps);activeProfileId=id;localStorage.setItem(K.activeProfile,id);renderProfiles();toast('تم إنشاء ملف جديد');
}
function deleteProfile(){
  const ps=profiles(); if(ps.length<=1){toast('لا يمكن حذف الملف الوحيد');return}
  const cur=ps.find(p=>p.id===activeProfileId);if(!confirm(`حذف ملف ${cur?.name||''} وبياناته المحلية؟`))return;
  PROFILE_BASES.forEach(base=>localStorage.removeItem(`${base}:${activeProfileId}`));
  const next=ps.filter(p=>p.id!==activeProfileId);save(K.profiles,next);activeProfileId=next[0].id;localStorage.setItem(K.activeProfile,activeProfileId);renderProfiles();renderSaved();renderReport();toast('تم حذف الملف');
}
function updateCommunityStatus(){
  const el=$('#communityStatus');if(!el)return;
  el.textContent=`قاعدة المجتمع: ${communityProducts.length} منتج محفوظ محليًا · مساهماتك قيد المراجعة: ${contributions().length}`;
}
function startVoiceSearch(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){toast('البحث الصوتي غير مدعوم في هذا المتصفح');return}
  const rec=new SR();rec.lang='ar-EG';rec.interimResults=false;rec.maxAlternatives=3;
  toast('اتكلم بالمصري…');
  rec.onresult=e=>{const text=e.results[0][0].transcript;$('#searchInput').value=text;searchName(text)};
  rec.onerror=()=>toast('تعذر التقاط الصوت');
  rec.start();
}
function parseOcrText(text){
  const clean=String(text||'').replace(/\r/g,' ');
  const ingMatch=clean.match(/(?:المكونات|مكونات|ingredients?)\s*[:：-]?\s*([\s\S]{10,500})/i);
  let ingredients=ingMatch?ingMatch[1].split(/(?:nutrition|القيم الغذائية|حقائق غذائية|energy|طاقة)/i)[0].trim():'';
  const satMatch=clean.match(/(?:saturated\s*fat|دهون\s*مشبعة|الدهون\s*المشبعة)\s*[:：-]?\s*([0-9]+(?:[.,][0-9]+)?)/i);
  return{ingredients:ingredients.slice(0,900),sat:satMatch?Number(satMatch[1].replace(',','.')):NaN};
}
async function runOcr(){
  const file=$('#foodPhotoInput').files?.[0];
  if(!file){toast('اختار صورة واضحة لظهر العبوة أولًا');return}
  const st=$('#ocrStatus');st.classList.remove('hidden');st.textContent='جاري قراءة الصورة… قد يستغرق ذلك قليلًا';
  try{
    if(!window.Tesseract)throw new Error('ocr');
    const result=await Tesseract.recognize(file,'ara+eng',{logger:m=>{if(m.status==='recognizing text')st.textContent=`قراءة النص… ${Math.round((m.progress||0)*100)}%`}});
    const parsed=parseOcrText(result.data.text);
    if(parsed.ingredients)$('#foodIngredients').value=parsed.ingredients;
    if(Number.isFinite(parsed.sat))$('#foodSatFat').value=parsed.sat;
    st.textContent='تم الاستخراج. راجع النص والأرقام قبل الحفظ.';
  }catch{
    st.textContent='تعذر استخراج النص تلقائيًا. يمكنك كتابة المكونات والقيم يدويًا.';
  }
}
function savePrefsFromUI(){
  save(pkey(K.prefs),{reflux:$('#prefReflux').checked,gas:$('#prefGas').checked,chol:$('#prefChol').checked,lowData:$('#prefLowData').checked});
  updateNetworkBadge();loadCommunity();toast('تم حفظ الإعدادات');
}
function renderSaved(){let list=allItems(),f=favorites();if(savedMode==='fav')list=list.filter(x=>f.includes(x.code));if(savedMode==='fruit')list=list.filter(x=>x.category==='fruit');if(savedMode==='meal')list=list.filter(x=>x.category==='meal');const q=$('#savedSearch').value.trim();if(q)list=list.filter(x=>(x.name||'').includes(q));$('#savedList').innerHTML=list.length?list.map(x=>{const emoji=quickFoods.find(z=>z[0]===x.name)?.[1]||'🍽️';return`<div class="saved-row" data-code="${esc(x.code)}">${x.image?`<img class="saved-avatar" src="${esc(x.image)}" alt="">`:`<div class="saved-avatar">${emoji}</div>`}<div class="saved-copy"><b>${esc(x.name)}</b><small>${esc(x.manual?(x.category||'أكلة محفوظة'):(x.brands||'منتج'))}</small></div><button class="row-heart" data-fav="${esc(x.code)}">${f.includes(x.code)?'♥':'♡'}</button><button class="row-menu" data-del="${esc(x.code)}">⋮</button></div>`}).join(''):'<div class="saved-row"><div class="saved-copy"><b>لا توجد عناصر</b><small>أضف أكلة أو احفظ منتجًا.</small></div></div>';$$('#savedList [data-code]').forEach(r=>r.onclick=e=>{if(e.target.closest('button'))return;const i=allItems().find(x=>x.code===r.dataset.code);if(i)openResult(i)});$$('#savedList [data-fav]').forEach(b=>b.onclick=e=>{e.stopPropagation();toggleFavorite(b.dataset.fav)});$$('#savedList [data-del]').forEach(b=>b.onclick=e=>{e.stopPropagation();const code=b.dataset.del;if(confirm('حذف هذا العنصر من أكلاتي المحفوظة؟')){save(pkey(K.foods),foods().filter(x=>x.code!==code));save(pkey(K.history),history().filter(x=>x.code!==code));save(pkey(K.favorites),favorites().filter(x=>x!==code));renderSaved()}});$$('#savedFilters button').forEach(b=>b.classList.toggle('active',b.dataset.filter===savedMode))}
function addCompare(code){let c=compare().filter(x=>x!==code);c.unshift(code);save(pkey(K.compare),c.slice(0,2));toast('تمت الإضافة للمقارنة')}
function renderCompare(){const items=compare().map(c=>allItems().find(x=>x.code===c)).filter(Boolean);const renderP=(id,x)=>{$(id).innerHTML=x?`${x.image?`<img src="${esc(x.image)}" alt="">`:'<div class="saved-avatar">🍽️</div>'}<b>${esc(x.name)}</b><small>${esc(x.quantity||x.category||'')}</small>`:'<div class="saved-avatar">＋</div><b>أضف منتجًا</b>'};renderP('#compareOne',items[0]);renderP('#compareTwo',items[1]);if(items.length<2){$('#compareMatrix').innerHTML='<div class="compare-cell yellow">أضف عنصرين من شاشة النتيجة للمقارنة.</div>';return}const a=evaluate(items[0]),b=evaluate(items[1]);const sat=x=>Number.isFinite(Number(x.nutriments?.['saturated-fat_100g']))?x.nutriments['saturated-fat_100g']+'غ/100غ':'—';let html=`<div class="compare-cell ${a.cards[2].cls}">الدهون المشبعة<b>${sat(items[0])}</b></div><div class="compare-cell ${b.cards[2].cls}">الدهون المشبعة<b>${sat(items[1])}</b></div><div class="compare-cell ${a.cards[1].cls}">الغازات والانتفاخ<b>${a.cards[1].value}</b></div><div class="compare-cell ${b.cards[1].cls}">الغازات والانتفاخ<b>${b.cards[1].value}</b></div><div class="compare-cell ${a.cards[0].cls}">الارتجاع<b>${a.cards[0].value}</b></div><div class="compare-cell ${b.cards[0].cls}">الارتجاع<b>${b.cards[0].value}</b></div>`;if(Number.isFinite(Number(items[0].price))&&Number.isFinite(Number(items[1].price)))html+=`<div class="compare-cell info">السعر<b>${items[0].price} ج.م</b></div><div class="compare-cell info">السعر<b>${items[1].price} ج.م</b></div>`;$('#compareMatrix').innerHTML=html}
function saveExperience(){if(!current)return;const vals=[];if($('#expNone').checked)vals.push('بدون أعراض');if($('#expHeart').checked)vals.push('حرقان');if($('#expGas').checked)vals.push('غازات');if($('#expBloat').checked)vals.push('انتفاخ');if(!vals.length){toast('اختر نتيجة تجربتك');return}const entry={at:Date.now(),items:vals};let h=history();let it=h.find(x=>x.code===current.code)||{...current,symptoms:[]};it.symptoms=it.symptoms||[];it.symptoms.unshift(entry);h=h.filter(x=>x.code!==current.code);h.unshift(it);save(pkey(K.history),h);$('#experienceDialog').close();toast('تم حفظ تجربتك')}
function renderReport(){const week=Date.now()-7*864e5,logs=[];history().forEach(x=>(x.symptoms||[]).forEach(s=>{if(s.at>=week)logs.push(s)}));const ok=logs.filter(x=>x.items.includes('بدون أعراض')).length,bad=logs.filter(x=>!x.items.includes('بدون أعراض')).length,total=logs.length||1;const okP=Math.round(ok/total*100),badP=Math.round(bad/total*100),unk=Math.max(0,100-okP-badP);$('#reportSummary').innerHTML=`<div class="summary-box green"><div class="face">🙂</div><b>${okP}%</b><small>أطعمة مناسبة</small></div><div class="summary-box red"><div class="face">🙁</div><b>${badP}%</b><small>أطعمة تسبب إزعاج</small></div><div class="summary-box blue"><div class="face">😐</div><b>${unk}%</b><small>غير واضحة</small></div>`;const counts={حرقان:0,غازات:0,انتفاخ:0};logs.forEach(l=>l.items.forEach(i=>{if(counts[i]!=null)counts[i]++}));const max=Math.max(1,...Object.values(counts));$('#symptomBars').innerHTML=Object.entries(counts).map(([k,v])=>`<div class="bar-row"><span>${k}</span><div class="bar-track"><div class="bar-fill" style="width:${v/max*100}%"></div></div><b>${v} مرات</b></div>`).join('');$('#personalTips').innerHTML='<li><b>الارتجاع:</b> إذا كانت الأعراض ليلية، اترك نحو 3 ساعات بين الأكل والاستلقاء، وقلل فقط المحفزات التي تلاحظ أنها تزيد الأعراض — NIDDK/WGO.</li><li><b>القولون/الانتفاخ:</b> Low-FODMAP قد يساعد بعض الأشخاص؛ الأفضل أن يكون تجربة مؤقتة مع إعادة إدخال تدريجية بدل منع دائم — WGO/NIDDK.</li><li><b>الكوليسترول:</b> WHO توصي بأن تكون الدهون المشبعة أقل من 10% من الطاقة اليومية وأن تكون الدهون أساسًا غير مشبعة.</li><li>سجّل استجابتك الشخصية لأن المحفزات تختلف بين الناس.</li>'}
async function startScanner(){showScreen('scannerScreen');$('#scanStatus').textContent='جاري تشغيل الكاميرا...';try{scannerStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});$('#scannerVideo').srcObject=scannerStream;await $('#scannerVideo').play();if('BarcodeDetector'in window){const det=new BarcodeDetector({formats:['ean_13','ean_8','upc_a','upc_e','code_128']});const tick=async()=>{if(!scannerStream)return;try{const found=await det.detect($('#scannerVideo'));if(found[0]?.rawValue){stopScanner();lookupBarcode(found[0].rawValue);return}}catch{}scannerRAF=requestAnimationFrame(tick)};tick();$('#scanStatus').textContent='وجّه الباركود داخل الإطار'}else $('#scanStatus').textContent='المسح التلقائي غير مدعوم في هذا المتصفح.'}catch{$('#scanStatus').textContent='تعذر تشغيل الكاميرا'}}
function stopScanner(){if(scannerRAF)cancelAnimationFrame(scannerRAF);scannerRAF=0;if(scannerStream){scannerStream.getTracks().forEach(t=>t.stop());scannerStream=null}const v=$('#scannerVideo');if(v)v.srcObject=null}

// events
$('#searchBtn').onclick=()=>searchName($('#searchInput').value);$('#searchInput').onkeydown=e=>{if(e.key==='Enter')searchName(e.target.value)};$('#scanBtn').onclick=startScanner;$('#photoAddBtn').onclick=()=>openAddFood('');$('#manualAddBtn').onclick=()=>openAddFood('');$('#settingsBtn').onclick=()=>{renderProfiles();$('#settingsDialog').showModal()};$('#egyptProductBtn').onclick=()=>openAddFood('');$('#homeFavBtn').onclick=()=>showScreen('savedScreen','fav');$('#ingredientsBtn').onclick=openIngredients;$('#resultFavBtn').onclick=()=>current&&toggleFavorite(current.code);$('#favoriteBtn').onclick=()=>current&&toggleFavorite(current.code);$('#compareBtn').onclick=()=>{if(current){addCompare(current.code);showScreen('compareScreen')}};$('#experienceBtn').onclick=()=>$('#experienceDialog').showModal();$('#saveExperienceBtn').onclick=saveExperience;$('#closeScannerBtn').onclick=()=>showScreen('homeScreen');$('#galleryBtn').onclick=()=>toast('إضافة قراءة الباركود من الصور يمكن تطويرها لاحقًا');$('#scanPulseBtn').onclick=()=>toast('يتم المسح تلقائيًا');$('#foodPhotoInput').onchange=e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>$('#foodPhotoPreview').src=r.result;r.readAsDataURL(f)};$('#saveFoodBtn').onclick=()=>{const n=$('#foodName').value.trim();if(!n){toast('اكتب اسم الأكلة');return}const sat=Number($('#foodSatFat')?.value),price=Number($('#foodPrice')?.value);const item={code:pendingBarcode||('m'+Date.now()),name:n,image:$('#foodPhotoPreview').src||'',ingredients_text:$('#foodIngredients').value.trim(),notes:$('#foodNotes').value.trim(),manual:true,category:'food',source:'إضافة محلية',price:Number.isFinite(price)?price:null,nutriments:{},symptoms:[]};if(Number.isFinite(sat))item.nutriments['saturated-fat_100g']=sat;saveFood(item);pendingBarcode='';openResult(item);toast('تم حفظ الأكلة وسيتم تذكر الباركود إن وُجد')};$('#savedSearch').oninput=()=>renderSaved();$$('#savedFilters button').forEach(b=>b.onclick=()=>{savedMode=b.dataset.filter;renderSaved()});$('#bestForMeBtn').onclick=()=>toast('قارن الجوانب التي تهمك: الأعراض، الدهون المشبعة، الحصة والسعر. لا يوجد اختيار واحد مناسب للجميع.');$$('[data-back]').forEach(b=>b.onclick=()=>showScreen(b.dataset.back));$$('.nav').forEach(b=>b.onclick=()=>showScreen(b.dataset.screen,b.dataset.mode));$('#savePrefsBtn').onclick=savePrefsFromUI;

$('#voiceSearchBtn').onclick=startVoiceSearch;
$('#portionQty').oninput=renderPortionSummary;$('#portionUnit').onchange=renderPortionSummary;
$('#correctProductBtn').onclick=openCorrection;$('#saveCorrectionBtn').onclick=saveCorrection;
$('#shareContributionBtn').onclick=queueContribution;
$('#exportContributionsBtn').onclick=exportContributions;
$('#profileSelect').onchange=e=>switchProfile(e.target.value);
$('#addProfileBtn').onclick=addProfile;$('#deleteProfileBtn').onclick=deleteProfile;
$('#ocrBtn').onclick=runOcr;
window.addEventListener('online',()=>{updateNetworkBadge();loadCommunity()});
window.addEventListener('offline',updateNetworkBadge);
renderQuick();renderSaved();renderReport();renderProfiles();updateNetworkBadge();loadCommunity();showScreen('homeScreen');
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
