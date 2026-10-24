/* =====================================================================
   TAL WOOD — وود | script.js (نسخة الإصلاح)
   سبوتلايت معرض + معاينة عائمة + مجسم 3D + كاشف صور ذكي
===================================================================== */

/* ============================================================
   ⚙️ الإعدادات — غيّر رقم الواتساب هنا فقط (بدون + أو مسافات)
============================================================ */
const WHATSAPP_NUMBER = '962700000000';
const WA_DEFAULT_MSG  = 'مرحبًا وود Tal Wood، أود الاستفسار عن قطع من الخشب الطبيعي.';

/* ---------- 1) روابط واتساب ---------- */
document.querySelectorAll('[data-wa]').forEach(a=>{
  const msg = a.dataset.waMsg || WA_DEFAULT_MSG;
  a.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
});

/* ============================================================
   2) 🔎 محرّك كشف الصور الذكي — image/1.png … image/6.png
   - يجرب مجلدات: image/ ثم images/ ثم img/ ثم assets/ ثم بجانب index.html
   - يجرب امتدادات: png ثم jpg ثم jpeg ثم webp (وكبيرتها)
   - يعالج الصور التي فشلت قبل تشغيل السكربت
   - يطبع بالـ Console اسم المجلد الذي وُجدت فيه الصور
   - كخطة أخيرة: لوحة خشبية أنيقة — لا صور مكسورة أبدًا
============================================================ */
window.__talwoodBase     = null;   // المجلد الذي اكتُشفت فيه الصور
window.__talwoodResolved = {};     // رقم الصورة -> المسار النهائي
window.__talwoodAnnounced = false;

const IMG_FOLDERS = ['image/','images/','img/','assets/',''];
const IMG_EXTS    = ['png','jpg','jpeg','webp','PNG','JPG','JPEG','WEBP'];

function probeImage(n, done){
  let combos = [];
  const push = f => IMG_EXTS.forEach(e => combos.push(f + n + '.' + e));
  if (window.__talwoodBase !== null) push(window.__talwoodBase); /* المجلد المعروف أولًا */
  IMG_FOLDERS.forEach(f => { if (f !== window.__talwoodBase) push(f); });

  let i = 0;
  (function next(){
    if (i >= combos.length) return done(null);
    const path = combos[i++];
    const tester = new Image();
    tester.onload = () => {
      const slash = path.indexOf('/');
      window.__talwoodBase = slash > -1 ? path.slice(0, slash + 1) : '';
      window.__talwoodResolved[n] = path;
      if (!window.__talwoodAnnounced){
        window.__talwoodAnnounced = true;
        console.log('%c✅ Tal Wood — وُجدت الصور في المجلد: "' + (window.__talwoodBase || 'بجانب index.html') + '"',
          'background:#6aa832;color:#fff;padding:3px 10px;border-radius:4px;font-weight:bold');
        window.dispatchEvent(new CustomEvent('talwood:imgbase'));
      }
      done(path);
    };
    tester.onerror = next;
    tester.src = path;
  })();
}

function woodPlaceholder(n){
  const TITLES = {1:'بوفيهات التقديم',2:'أدوات المائدة',3:'ديكور وود',4:'أثاث لايف إيدج',5:'فن الإيبوكسي',6:'لمسات الطبيعة'};
  const t = TITLES[n] || ('صورة ' + n);
  let s = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000">'
    + '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'
    + '<stop offset="0" stop-color="#a5713a"/><stop offset="1" stop-color="#5d3c1c"/></linearGradient></defs>'
    + '<rect width="800" height="1000" fill="url(#g)"/>';
  for(let i=0;i<22;i++) s += '<path d="M0 '+(i*50+18)+' Q 200 '+(i*50+48)+' 400 '+(i*50+18)+' T 800 '+(i*50+18)
    + '" fill="none" stroke="rgba(255,225,180,.09)" stroke-width="3"/>';
  s += '<circle cx="400" cy="380" r="130" fill="none" stroke="rgba(121,185,64,.9)" stroke-width="6"/>'
    + '<circle cx="400" cy="380" r="90" fill="none" stroke="rgba(121,185,64,.5)" stroke-width="4"/>'
    + '<text x="400" y="412" text-anchor="middle" font-size="84" font-family="serif" font-weight="bold" fill="#f3ecdf">ود</text>'
    + '<text x="400" y="600" text-anchor="middle" font-size="40" font-family="sans-serif" fill="#f3ecdf">'+t+'</text>'
    + '<text x="400" y="654" text-anchor="middle" font-size="28" font-family="sans-serif" fill="rgba(243,236,223,.6)">'+n+'.png</text>'
    + '</svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
}

function applySmartImage(img, n){
  probeImage(n, path => {
    if (path) img.src = path;
    else { img.src = woodPlaceholder(n); img.style.objectFit = 'cover'; }
  });
}

(function scanImages(){
  document.querySelectorAll('img').forEach(img=>{
    const src = img.getAttribute('src') || '';
    const m = src.match(/(\d)\.(?:png|jpe?g|webp)$/i);
    if (!m) return;
    const n = m[1];

    /* الصورة فشلت قبل ما يشغّل السكربت (شائع على file://) */
    if (img.complete && img.naturalWidth === 0){ applySmartImage(img, n); return; }

    /* الصورة محمّلة بنجاح — سجّل مجلدها فورًا */
    if (img.complete && img.naturalWidth > 0){
      const slash = src.lastIndexOf('/');
      if (slash > -1 && window.__talwoodBase === null) window.__talwoodBase = src.slice(0, slash + 1);
      window.__talwoodResolved[n] = src;
      if (!window.__talwoodAnnounced){
        window.__talwoodAnnounced = true;
        console.log('%c✅ Tal Wood — وُجدت الصور في المجلد: "' + (window.__talwoodBase || 'بجانب index.html') + '"',
          'background:#6aa832;color:#fff;padding:3px 10px;border-radius:4px;font-weight:bold');
        window.dispatchEvent(new CustomEvent('talwood:imgbase'));
      }
      return;
    }

    /* ما زال يحمّل — نصطاد الخطأ إن حصل */
    img.addEventListener('error', function onErr(){
      img.removeEventListener('error', onErr);
      applySmartImage(img, n);
    });
  });
})();

/* =====================================================================
   3) المحرّك الكامل
===================================================================== */
function bootSite(){
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(hover: none)').matches;

  /* ---------- Lenis ---------- */
  let lenis = null;
  if (window.Lenis && !reduced){
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- تحديث حسابات السكرول بعد اكتمال التحميل (يمنع الأقسام الفاضية) ---------- */
  window.addEventListener('load', ()=> ScrollTrigger.refresh());
  setTimeout(()=> ScrollTrigger.refresh(), 1600);

  /* ---------- تكرار الشريط المتحرك ---------- */
  const ribbon = document.getElementById('ribbonTrack');
  if (ribbon) ribbon.innerHTML += ribbon.innerHTML;

  /* ---------- روابط داخلية سلسة ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      const id = a.getAttribute('href');
      if (id.length > 1){
        const t = document.querySelector(id);
        if (t){ e.preventDefault(); closeMenu(); lenis ? lenis.scrollTo(t,{offset:-60}) : t.scrollIntoView({behavior:'smooth'}); }
      }
    });
  });

  /* ---------- المؤشر ---------- */
  if (!isTouch){
    const dot = document.getElementById('cDot'), ring = document.getElementById('cRing'), label = document.getElementById('cLabel');
    let mx = innerWidth/2, my = innerHeight/2, rx = mx, ry = my;
    addEventListener('mousemove', e=>{ mx = e.clientX; my = e.clientY; });
    gsap.ticker.add(()=>{
      rx += (mx-rx)*.16; ry += (my-ry)*.16;
      dot.style.transform  = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    });
    document.addEventListener('mouseover', e=>{
      const lab = e.target.closest('[data-cursor]');
      const lnk = e.target.closest('a,button,.spot-media');
      ring.classList.toggle('is-label', !!lab);
      ring.classList.toggle('is-hover', !!lnk && !lab);
      if (lab) label.textContent = lab.dataset.cursor;
    });
  }

  /* ---------- أزرار مغناطيسية ---------- */
  if (!isTouch){
    document.querySelectorAll('[data-magnetic]').forEach(b=>{
      b.addEventListener('mousemove', e=>{
        const r = b.getBoundingClientRect();
        gsap.to(b,{x:(e.clientX-r.left-r.width/2)*.22, y:(e.clientY-r.top-r.height/2)*.22, duration:.4});
      });
      b.addEventListener('mouseleave', ()=> gsap.to(b,{x:0,y:0,duration:.6,ease:'elastic.out(1,.45)'}));
    });
  }

  /* ---------- شريط التقدم + نافبار + للأعلى ---------- */
  const bar = document.getElementById('scrollBar'), nav = document.getElementById('nav'), toTop = document.getElementById('toTop');
  ScrollTrigger.create({ start:0, end:'max', onUpdate:s=> bar.style.transform = `scaleX(${s.progress})` });
  ScrollTrigger.create({ start:80, onEnter:()=>nav.classList.add('scrolled'), onLeaveBack:()=>nav.classList.remove('scrolled') });
  ScrollTrigger.create({ start:700, onEnter:()=>toTop.classList.add('show'), onLeaveBack:()=>toTop.classList.remove('show') });
  toTop.addEventListener('click', ()=> lenis ? lenis.scrollTo(0) : scrollTo({top:0,behavior:'smooth'}));

  /* ---------- قائمة الموبايل ---------- */
  const burger = document.getElementById('burger'), mMenu = document.getElementById('mMenu');
  const menuTl = gsap.timeline({paused:true})
    .set(mMenu,{visibility:'visible'})
    .to(mMenu,{clipPath:'circle(160% at 30px 40px)',duration:.8,ease:'power4.inOut'})
    .from('.m-menu nav a',{yPercent:120,duration:.6,stagger:.06,ease:'power3.out'},'-=.3')
    .from('.m-menu-foot',{opacity:0,y:20,duration:.4},'-=.3');
  let menuOpen = false;
  function closeMenu(){
    if(!menuOpen) return;
    menuOpen = false; burger.classList.remove('open');
    menuTl.reverse(); lenis && lenis.start(); document.body.classList.remove('no-scroll');
  }
  burger.addEventListener('click', ()=>{
    menuOpen = !menuOpen;
    burger.classList.toggle('open', menuOpen);
    if(menuOpen){ menuTl.play(); lenis && lenis.stop(); document.body.classList.add('no-scroll'); }
    else closeMenu();
  });

  /* ---------- الظهور عند السكرول ---------- */
  gsap.utils.toArray('[data-reveal]').forEach(el=>{
    gsap.from(el,{y:50,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%'}});
  });

  /* ---------- بارالاكس ---------- */
  gsap.utils.toArray('.parallax').forEach(img=>{
    gsap.fromTo(img,{yPercent:-8},{yPercent:8,ease:'none',
      scrollTrigger:{trigger:img.closest('section'),start:'top bottom',end:'bottom top',scrub:true}});
  });

  /* ---------- عدّادات ---------- */
  document.querySelectorAll('.count').forEach(el=>{
    const target = parseFloat(el.dataset.count);
    const dec = (el.dataset.count.split('.')[1]||'').length;
    const o = {v:0};
    gsap.to(o,{v:target,duration:2,ease:'power2.out',
      scrollTrigger:{trigger:el,start:'top 88%'},
      onUpdate:()=> el.textContent = o.v.toFixed(dec)});
  });

  /* ---------- خط رحلة القطعة ---------- */
  gsap.to('#jLine',{width:'100%',ease:'none',
    scrollTrigger:{trigger:'.j-track',start:'top 75%',end:'bottom 60%',scrub:true}});

  /* ---------- الاقتباس كلمة كلمة ---------- */
  (function quoteWords(){
    const q = document.getElementById('quoteText');
    if(!q) return;
    const words = q.textContent.trim().split(/\s+/);
    q.innerHTML = words.map(w=>`<span class="qw">${w}</span>`).join('');
    gsap.to('.qw',{opacity:1,stagger:.08,ease:'none',
      scrollTrigger:{trigger:'.quote',start:'top 78%',end:'center 45%',scrub:true}});
  })();

  /* ============================================================
     المعرض — SPOTLIGHT
  ============================================================ */
  const slides = gsap.utils.toArray('.spot-slide');
  const dotsBox = document.getElementById('spotDots');
  const spotBar = document.getElementById('spotBar');
  let cur = 0, spotST = null;

  slides.forEach((_,i)=>{
    const d = document.createElement('button');
    d.setAttribute('aria-label','قطعة '+(i+1));
    if(i===0) d.classList.add('on');
    d.addEventListener('click', ()=>{
      if(!spotST) return;
      const y = spotST.start + (spotST.end - spotST.start) * (i/(slides.length-1));
      lenis ? lenis.scrollTo(y) : scrollTo({top:y,behavior:'smooth'});
    });
    dotsBox.appendChild(d);
  });
  const dots = dotsBox.querySelectorAll('button');

  function goSlide(i){
    if(i===cur) return;
    const prev = slides[cur]; cur = i;
    const next = slides[i];
    gsap.to(prev,{autoAlpha:0,duration:.5,ease:'power2.inOut',onComplete:()=>prev.classList.remove('is-on')});
    next.classList.add('is-on');
    gsap.fromTo(next,{autoAlpha:0},{autoAlpha:1,duration:.6,ease:'power2.inOut'});
    gsap.fromTo(next.querySelector('.spot-media img'),{scale:1.14},{scale:1,duration:1,ease:'power2.out'});
    gsap.fromTo(next.querySelectorAll('.spot-txt > *'),{y:26,opacity:0},{y:0,opacity:1,stagger:.06,duration:.55,ease:'power3.out'});
    dots.forEach((d,k)=> d.classList.toggle('on', k===i));
  }

  const mm = gsap.matchMedia();
  mm.add('(min-width: 992px)', ()=>{
    spotST = ScrollTrigger.create({
      trigger:'#gallery', start:'top top', end:'+=' + (slides.length * 90) + '%',
      pin:true, scrub:true, anticipatePin:1,
      snap:{ snapTo: 1/(slides.length-1), duration:{min:.25,max:.6}, ease:'power2.inOut' },
      onUpdate: s=>{
        goSlide(Math.round(s.progress * (slides.length-1)));
        spotBar.style.width = (s.progress*100) + '%';
      }
    });
    return ()=>{ spotST = null; };
  });
  mm.add('(max-width: 991px)', ()=>{
    slides.forEach(sl=>{
      gsap.from(sl,{y:60,opacity:0,duration:1,ease:'power3.out',
        scrollTrigger:{trigger:sl,start:'top 90%'}});
    });
    return ()=>{};
  });

  /* ---------- معاينة عائمة للخدمات (لا تظهر إلا بصورة سليمة) ---------- */
  if (!isTouch){
    const prev = document.getElementById('svcPreview');
    const prevImg = prev.querySelector('img');
    const list = document.getElementById('svcList');
    const qx = gsap.quickTo(prev,'x',{duration:.45,ease:'power3'});
    const qy = gsap.quickTo(prev,'y',{duration:.45,ease:'power3'});
    list.addEventListener('mousemove', e=>{
      qx(e.clientX - prev.offsetWidth/2);
      qy(e.clientY - prev.offsetHeight/2);
    });
    document.querySelectorAll('.svc-row').forEach(row=>{
      row.addEventListener('mouseenter', ()=>{
        const m = (row.dataset.img||'').match(/(\d)\.(?:png|jpe?g|webp)$/i);
        const n = m && m[1];
        const path = (n && window.__talwoodResolved[n]) || row.dataset.img;
        if(!path) return;
        const test = new Image();                 /* نتحقق أولًا أن الصورة سليمة */
        test.onload = ()=>{
          prevImg.src = path;
          gsap.to(prev,{autoAlpha:1,scale:1,duration:.4,ease:'power3.out'});
        };
        test.onerror = ()=> gsap.to(prev,{autoAlpha:0,scale:.8,duration:.2});
        test.src = path;
      });
    });
    list.addEventListener('mouseleave', ()=> gsap.to(prev,{autoAlpha:0,scale:.8,duration:.35}));
  }

  /* ---------- لايت بوكس ---------- */
  const lb = document.getElementById('lightbox'), lbImg = document.getElementById('lbImg'), lbCap = document.getElementById('lbCap');
  function openLB(src, cap){
    lbImg.src = src; lbCap.textContent = cap;
    lb.classList.add('show');
    lenis && lenis.stop(); document.body.classList.add('no-scroll');
    gsap.fromTo(lb,{opacity:0},{opacity:1,duration:.35});
    gsap.fromTo(lbImg,{scale:.9,y:24},{scale:1,y:0,duration:.6,ease:'power3.out'});
  }
  function closeLB(){
    gsap.to(lb,{opacity:0,duration:.3,onComplete:()=>{
      lb.classList.remove('show'); lbImg.src='';
      lenis && lenis.start(); document.body.classList.remove('no-scroll');
    }});
  }
  document.querySelectorAll('.spot-slide').forEach(sl=>{
    sl.querySelector('.spot-media').addEventListener('click', ()=>{
      openLB(sl.querySelector('img').src, sl.querySelector('h3').textContent + ' — ' + sl.querySelector('.spot-tag').textContent);
    });
  });
  document.getElementById('lbClose').addEventListener('click', closeLB);
  lb.addEventListener('click', e=>{ if(e.target===lb) closeLB(); });
  addEventListener('keydown', e=>{ if(e.key==='Escape'){ closeLB(); closeMenu(); } });

  /* ---------- الرابط النشط ---------- */
  document.querySelectorAll('main section[id]').forEach(sec=>{
    ScrollTrigger.create({
      trigger:sec, start:'top 45%', end:'bottom 45%',
      onToggle: s=>{
        if(s.isActive) document.querySelectorAll('.nav-links a').forEach(l=>
          l.classList.toggle('active', l.getAttribute('href')==='#'+sec.id));
      }
    });
  });

  /* ============================================================
     3D — شرائح جذع خشبية طائفة (Three.js)
     خامة حلقات الشجر مرسومة برمجيًا + تُستبدل بصورة 6 عند توفرها
  ============================================================ */
  (function init3D(){
    const canvas = document.getElementById('heroCanvas');
    const hero = document.getElementById('home');
    if (!window.THREE){ hero.classList.add('no-webgl'); return; }
    let renderer;
    try { renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true}); }
    catch(e){ hero.classList.add('no-webgl'); canvas.style.display='none'; return; }

    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.outputEncoding = THREE.sRGBEncoding;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42,1,.1,100);
    camera.position.set(0,0,9);

    scene.add(new THREE.HemisphereLight(0xfff2dd, 0x6b5842, .85));
    const key = new THREE.DirectionalLight(0xffe8c4, 1.2); key.position.set(4,6,7); scene.add(key);
    const rim = new THREE.DirectionalLight(0x8cc63f, .8);  rim.position.set(-6,-2,-4); scene.add(rim);
    const fill = new THREE.PointLight(0xa5713a, .7, 40);   fill.position.set(-4,3,6); scene.add(fill);

    function topTexture(seed){
      const c = document.createElement('canvas'); c.width = c.height = 512;
      const x = c.getContext('2d');
      const base = x.createRadialGradient(256,256,10,256,256,256);
      base.addColorStop(0,'#d9b585'); base.addColorStop(1,'#b98d55');
      x.fillStyle = base; x.fillRect(0,0,512,512);
      let r = 14 + seed*6;
      while (r < 260){
        x.beginPath();
        x.strokeStyle = Math.random()>.5
          ? `rgba(94,60,28,${.12+Math.random()*.2})`
          : `rgba(240,214,170,${.1+Math.random()*.15})`;
        x.lineWidth = .8 + Math.random()*2.4;
        const wob = 2 + Math.random()*7;
        for(let a=0;a<=64;a++){
          const th = a/64*Math.PI*2;
          const rr = r + Math.sin(th*3+seed)*wob;
          const px = 256+Math.cos(th)*rr, py = 256+Math.sin(th)*rr;
          a===0 ? x.moveTo(px,py) : x.lineTo(px,py);
        }
        x.stroke();
        r += 7 + Math.random()*12;
      }
      const knot = x.createRadialGradient(256,256,2,256,256,22+seed*8);
      knot.addColorStop(0,'rgba(70,42,18,.9)'); knot.addColorStop(1,'rgba(70,42,18,0)');
      x.fillStyle = knot; x.beginPath(); x.arc(256,256,30+seed*8,0,6.3); x.fill();
      const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
      return t;
    }
    function sideTexture(){
      const c = document.createElement('canvas'); c.width = 512; c.height = 128;
      const x = c.getContext('2d');
      x.fillStyle = '#5e3f22'; x.fillRect(0,0,512,128);
      for(let i=0;i<70;i++){
        x.fillStyle = `rgba(${30+Math.random()*40},${20+Math.random()*26},${8+Math.random()*14},${.35+Math.random()*.4})`;
        const w = 2+Math.random()*8, px = Math.random()*512;
        x.fillRect(px,0,w,128);
      }
      const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
      t.wrapS = THREE.RepeatWrapping;
      return t;
    }

    const woodMat = new THREE.MeshStandardMaterial({map:topTexture(2), roughness:.7, metalness:.02});

    /* — محاولة استبدال الخامة بصورة 6 الحقيقية بعد اكتشاف مجلدها — */
    let texTried = false;
    function tryHeroTexture(){
      const p6 = window.__talwoodResolved['6'];
      if (texTried || !p6) return;
      texTried = true;
      new THREE.TextureLoader().load(p6, tex => {
        tex.encoding = THREE.sRGBEncoding;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        woodMat.map = tex; woodMat.needsUpdate = true;
      }, undefined, ()=>{ texTried = false; });
    }
    window.addEventListener('talwood:imgbase', tryHeroTexture);
    tryHeroTexture();

    const barkMat = new THREE.MeshStandardMaterial({map:sideTexture(), roughness:.95});

    const group = new THREE.Group();
    const discs = [];
    const cfg = [
      {r:1.55, th:.3,  x:-.4, y:1.15, z:0,   rx:.5,  seed:1},
      {r:1.15, th:.22, x:1.7,  y:-.7,  z:1.2, rx:-.4, seed:2},
      {r:.85,  th:.18, x:-1.9, y:-1.2, z:2.2, rx:.9,  seed:3},
      {r:.65,  th:.14, x:2.6,  y:1.4,  z:-.8, rx:.3,  seed:4},
      {r:.5,   th:.12, x:.9,   y:2.1,  z:-1.6,rx:-.8, seed:5},
      {r:.42,  th:.1,  x:-2.8, y:.4,   z:-.5, rx:1.1, seed:6}
    ];
    cfg.forEach((d,i)=>{
      const face = woodMat.clone(); face.map = (i===0) ? woodMat.map : topTexture(d.seed);
      const side = barkMat;
      const g = new THREE.CylinderGeometry(d.r, d.r, d.th, 56);
      const m = new THREE.Mesh(g, [side, face, face]);
      m.rotation.set(d.rx, i*.8, d.rx*.5);
      const holder = new THREE.Group();
      holder.add(m);
      holder.position.set(d.x, d.y, d.z);
      holder.userData = {baseY:d.y, sp:.5+Math.random()*.5, ph:Math.random()*6.28, disc:m};
      group.add(holder);
      discs.push(holder);
    });
    scene.add(group);

    /* — نشارة خشبية — */
    const pGeo = new THREE.BufferGeometry();
    const pn = 90, pArr = new Float32Array(pn*3);
    for(let i=0;i<pn*3;i+=3){
      pArr[i]=(Math.random()-.5)*12; pArr[i+1]=(Math.random()-.5)*7; pArr[i+2]=(Math.random()-.5)*6;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pArr,3));
    const dust = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color:0xa5713a, size:.045, transparent:true, opacity:.5, depthWrite:false}));
    scene.add(dust);

    /* — سحب للدوران — */
    let gRotY = .2, gRotX = .05, tRotY = .2, tRotX = .05;
    let dragging = false, lx = 0, ly = 0, touched = false;
    canvas.addEventListener('pointerdown', e=>{
      dragging = true; lx = e.clientX; ly = e.clientY;
      canvas.classList.add('grabbing');
      if(!touched){ touched = true;
        gsap.to('#dragHint',{opacity:0,y:10,duration:.5,onComplete:()=>document.getElementById('dragHint').style.display='none'});
      }
    });
    addEventListener('pointermove', e=>{
      if(!dragging) return;
      tRotY += (e.clientX-lx)*.005;
      tRotX = Math.max(-.5, Math.min(.5, tRotX + (e.clientY-ly)*.003));
      lx = e.clientX; ly = e.clientY;
    });
    addEventListener('pointerup', ()=>{ dragging=false; canvas.classList.remove('grabbing'); });

    let pmx = 0, pmy = 0;
    addEventListener('mousemove', e=>{
      pmx = e.clientX/innerWidth-.5; pmy = e.clientY/innerHeight-.5;
    });

    function resize(){
      const w = hero.clientWidth, h = hero.clientHeight;
      renderer.setSize(w,h,false);
      camera.aspect = w/h; camera.updateProjectionMatrix();
      const wide = w > 991;
      group.position.set(wide ? 2.3 : 0, wide ? 0 : .5, 0);
      group.scale.setScalar(wide ? 1 : Math.max(.55, w/1400));
    }
    resize(); addEventListener('resize', resize);

    let visible = true;
    new IntersectionObserver(([en])=> visible = en.isIntersecting, {threshold:.02}).observe(canvas);
    const clock = new THREE.Clock();
    gsap.ticker.add(()=>{
      if(!visible || document.hidden) return;
      const t = clock.getElapsedTime();
      if(!dragging) tRotY += .0016;
      gRotY += (tRotY-gRotY)*.06;
      gRotX += (tRotX-gRotX)*.06;
      group.rotation.set(gRotX + pmy*.06, gRotY + pmx*.1, 0);
      discs.forEach(h=>{
        h.position.y = h.userData.baseY + Math.sin(t*h.userData.sp + h.userData.ph)*.22;
        h.userData.disc.rotation.z += .0015;
      });
      dust.rotation.y = t*.02;
      renderer.render(scene,camera);
    });
  })();

  /* ============================================================
     اللودر → مقدمة الهيرو
  ============================================================ */
  lenis && lenis.stop(); document.body.classList.add('no-scroll');
  const pct = document.getElementById('loaderPct');
  const o = {v:0};

  function heroIntro(){
    const tl = gsap.timeline();
    tl.to('#heroCanvas',{opacity:1,duration:1.4,ease:'power2.out'},0)
      .from('.h-line > span',{yPercent:130,duration:1.1,stagger:.12,ease:'power4.out'},.1)
      .from('.hero-kicker',{y:18,opacity:0,duration:.6},.35)
      .from('.hero-sub',{y:24,opacity:0,duration:.7},.5)
      .from('.hero-cta .btn',{y:22,opacity:0,stagger:.1,duration:.6},.62)
      .from('.drag-hint',{opacity:0,scale:.85,duration:.5},.9)
      .from('.hs-row .hstat',{y:20,opacity:0,stagger:.07,duration:.6},.8)
      .add(()=>{ lenis && lenis.start(); document.body.classList.remove('no-scroll'); ScrollTrigger.refresh(); },.5);
    return tl;
  }

  gsap.timeline()
    .to('.loader-rings circle',{strokeDashoffset:0,duration:1.3,stagger:.15,ease:'power2.inOut'},0)
    .from('.loader-word',{opacity:0,scale:.7,duration:1,ease:'power3.out'},0)
    .to(o,{v:100,duration:1.9,ease:'power2.inOut',
      onUpdate:()=> pct.textContent = Math.round(o.v)+'%'},0)
    .to('.loader-core, .loader-foot',{opacity:0,duration:.4,ease:'power2.in'},2.05)
    .to('.shutter-top',{yPercent:-101,duration:.9,ease:'power4.inOut'},2.35)
    .to('.shutter-bottom',{yPercent:101,duration:.9,ease:'power4.inOut'},2.35)
    .add(heroIntro(),2.55)
    .set('#loader',{display:'none'});
}

/* ---------- تشغيل + شبكة أمان ---------- */
if (window.gsap && window.ScrollTrigger){
  try { bootSite(); }
  catch(err){
    console.warn('Tal Wood:', err);
    const l = document.getElementById('loader'); l && l.remove();
    document.body.classList.remove('no-scroll');
    document.documentElement.classList.remove('js');
  }
} else {
  const l = document.getElementById('loader'); l && l.remove();
  document.documentElement.classList.remove('js');
}