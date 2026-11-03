(()=>{'use strict';
const $=id=>document.getElementById(id), db=window.MARKET_SUPABASE_CLIENT||(window.APP_CONFIG&&window.supabase?window.supabase.createClient(window.APP_CONFIG.SUPABASE_URL,window.APP_CONFIG.SUPABASE_ANON_KEY):null);
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let entries=[], page=0, loading=false;
const perPage=()=>matchMedia('(min-width:760px)').matches?30:20;
function thNow(){return new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Bangkok'}));}
function within(a,b,now){if(!a||!b||a===b)return true;const m=v=>{const x=String(v).slice(0,5).split(':').map(Number);return x[0]*60+x[1];};const x=m(a),y=m(b);return x<y?(now>=x&&now<y):(now>=x||now<y);}
function available(s,cfg){if(!s||s.status!=='approved'||s.temporarily_closed||!cfg?.enabled||!cfg.payment_qr_url||(cfg.accepting_status||'open')!=='open')return false;
 const th=thNow(),minutes=th.getHours()*60+th.getMinutes();
 if(!s.open_24_hours){const d=s.opening_hours?.[['sun','mon','tue','wed','thu','fri','sat'][th.getDay()]];if(!d||d.closed||!d.open||!d.close||!within(d.open,d.close,minutes))return false;}
 if(!within(cfg.order_start_time,cfg.order_end_time,minutes))return false;return true;}
function gridPage(){const per=perPage(),total=Math.max(1,Math.ceil(entries.length/per));page=Math.min(page,total-1);$('ktbDeliveryGrid').innerHTML=entries.slice(page*per,(page+1)*per).map(s=>`<article class="ktb-delivery-card">${s.cover_url?`<img class="ktb-delivery-thumb" src="${escape(s.cover_url)}" alt="${escape(s.name)}" loading="lazy" onerror="this.style.display='none'">`:'<div class="ktb-delivery-fallback">🏪</div>'}<div class="ktb-delivery-card-content"><div class="ktb-delivery-name">${escape(s.name)}</div><button type="button" class="ktb-delivery-buy" data-market-order-shop="${escape(s.id)}">สั่งซื้อ</button></div></article>`).join('');
 $('ktbDeliveryMessage').textContent=entries.length?`มี ${entries.length} ร้านที่พร้อมรับออเดอร์ · หน้า ${page+1} จาก ${total}`:'ยังไม่มีร้านที่พร้อมรับ Delivery ในขณะนี้';
 $('ktbDeliveryPages').innerHTML=total>1?`<button data-ktb-page="${page-1}" ${page===0?'disabled':''}>ก่อนหน้า</button>${Array.from({length:total},(_,i)=>`<button data-ktb-page="${i}" ${i===page?'aria-current="page"':''}>${i+1}</button>`).join('')}<button data-ktb-page="${page+1}" ${page===total-1?'disabled':''}>ถัดไป</button>`:'';
}
async function load(){if(loading)return;loading=true;$('ktbDeliveryMessage').textContent='กำลังตรวจสอบร้านที่เปิดรับออเดอร์...';try{if(!db)throw Error('ยังไม่เชื่อมต่อระบบสั่งซื้อ');
 const [global,shop,settings,access,products]=await Promise.all([db.rpc('market_get_system_settings'),db.from('market_shops').select('id,name,status,cover_url,opening_hours,open_24_hours,temporarily_closed').eq('status','approved').limit(5000),db.from('market_shop_order_settings').select('shop_id,enabled,payment_qr_url,accepting_status,order_start_time,order_end_time').eq('enabled',true).limit(5000),db.from('market_order_shop_access').select('shop_id,enabled').eq('enabled',true).limit(5000),db.from('market_products').select('shop_id').eq('sale_status','available').limit(5000)]);
 for(const r of [global,shop,settings,access,products])if(r.error)throw r.error;
 const flag=Array.isArray(global.data)?global.data[0]:global.data;if(flag?.delivery_enabled===false){entries=[];gridPage();$('ktbDeliveryMessage').textContent='ระบบ Delivery ปิดให้บริการชั่วคราว';return;}
 const allowed=new Set(access.data.map(r=>String(r.shop_id))),productIds=new Set(products.data.map(r=>String(r.shop_id))),map=new Map(settings.data.map(r=>[String(r.shop_id),r]));
 entries=shop.data.filter(s=>allowed.has(String(s.id))&&productIds.has(String(s.id))&&available(s,map.get(String(s.id)))).sort((a,b)=>String(a.name).localeCompare(String(b.name),'th'));gridPage();
 }catch(e){entries=[];gridPage();$('ktbDeliveryMessage').textContent='ไม่สามารถตรวจสอบสถานะร้านได้ กรุณาลองใหม่อีกครั้ง';console.warn('Delivery catalog:',e);}finally{loading=false;}}
function close(){document.body.classList.remove('ktb-delivery-mode');history.replaceState(null,'',location.pathname+location.search);window.scrollTo({top:0});}
function open(){document.body.classList.add('ktb-delivery-mode');if(location.hash!=='#delivery-now')history.replaceState(null,'','#delivery-now');page=0;window.scrollTo({top:0});load();}
$('ktbOpenDeliveryCatalog')?.addEventListener('click',open);$('ktbDeliveryBack')?.addEventListener('click',close);$('ktbDeliveryPages')?.addEventListener('click',e=>{const b=e.target.closest('[data-ktb-page]');if(!b||b.disabled)return;page=Number(b.dataset.ktbPage);load().then(()=>window.scrollTo({top:0}));});
document.addEventListener('click',async e=>{const b=e.target.closest('#ktbDeliveryCatalog [data-market-order-shop]');if(!b)return;const s=entries.find(x=>String(x.id)===b.dataset.marketOrderShop);if(!s){e.preventDefault();return;} // Order module opens menu through its existing delegated handler.
});
window.addEventListener('resize',()=>{if(document.body.classList.contains('ktb-delivery-mode'))gridPage();});document.addEventListener('visibilitychange',()=>{if(!document.hidden&&document.body.classList.contains('ktb-delivery-mode'))load();});setInterval(()=>{if(!document.hidden&&document.body.classList.contains('ktb-delivery-mode'))load();},30000);
if(location.hash==='#delivery-now')open();
})();