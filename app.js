(()=>{
  'use strict';
  const phone='972502808222';
  const encodeWhatsApp=(message)=>`https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  const templates={
    short:'שלום, הגעתי דרך האתר של מעדני יעקב ואשמח לקבל הצעת מחיר לאירוע.\n\nסוג האירוע: \nכמות מוזמנים: \nתאריך האירוע: ',
    questions:'שלום, הגעתי דרך האתר של מעדני יעקב ואשמח לקבל הצעת מחיר.\n\nסוג האירוע: \nכמות מוזמנים: \nתאריך האירוע: \nמיקום: \nבקשות נוספות: '
  };
  document.querySelectorAll('.wa-link').forEach(link=>{
    link.href=encodeWhatsApp(templates[link.dataset.wa||'short']);
    link.target='_blank';link.rel='noopener noreferrer';
  });

  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progress=document.querySelector('#progress');
  const header=document.querySelector('#header');
  let scrollTick=false;
  function updateScroll(){
    if(scrollTick)return;
    scrollTick=true;
    requestAnimationFrame(()=>{
      const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
      progress.style.transform=`scaleX(${Math.min(1,Math.max(0,scrollY/max))})`;
      header.classList.toggle('scrolled',scrollY>20);
      scrollTick=false;
    });
  }
  addEventListener('scroll',updateScroll,{passive:true});updateScroll();

  const navToggle=document.querySelector('#navToggle');
  const mobileNav=document.querySelector('#mobileNav');
  function closeNav(){navToggle.setAttribute('aria-expanded','false');navToggle.setAttribute('aria-label','פתיחת תפריט');mobileNav.hidden=true;}
  navToggle.addEventListener('click',()=>{
    const opened=navToggle.getAttribute('aria-expanded')!=='true';
    navToggle.setAttribute('aria-expanded',String(opened));
    navToggle.setAttribute('aria-label',opened?'סגירת תפריט':'פתיחת תפריט');
    mobileNav.hidden=!opened;
  });
  mobileNav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeNav));
  addEventListener('resize',()=>{if(innerWidth>900)closeNav();},{passive:true});

  if(!reduceMotion && 'IntersectionObserver' in window){
    const observer=new IntersectionObserver((entries,obs)=>{
      entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');obs.unobserve(entry.target);}});
    },{threshold:0.06,rootMargin:'0px 0px -25px 0px'});
    document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
  }else document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));

  if(!reduceMotion){
    document.querySelectorAll('[data-sparkles]').forEach((layer,j)=>{
      const count=Math.min(30,Number(layer.dataset.sparkles)||18);
      // Fixed deterministic layout: no animation-induced layout changes.
      for(let i=0;i<count;i++){
        const particle=document.createElement('i');
        particle.className='particle';
        const x=((i*37+j*17)%97)+1;
        const delay=-((i*13+j*7)%23)/2;
        const duration=10+((i*7+j*3)%15);
        const drift=((i*17)%58)-29;
        particle.style.left=x+'%';
        particle.style.setProperty('--delay',delay+'s');
        particle.style.setProperty('--fall',duration+'s');
        particle.style.setProperty('--drift',drift+'px');
        layer.appendChild(particle);
      }
    });
  }

  const gallery=document.querySelector('#galleryTrack');
  const images=[...document.querySelectorAll('.gallery-item img')];
  const galleryProgress=document.querySelector('#galleryProgress span');
  function galleryStep(){return (gallery.querySelector('.gallery-item')?.getBoundingClientRect().width||280)+15;}
  function updateGalleryProgress(){
    const max=Math.max(1,gallery.scrollWidth-gallery.clientWidth);
    const portion=Math.min(1,Math.abs(gallery.scrollLeft)/max);
    galleryProgress.style.transform=`scaleX(${0.16+0.84*portion})`;
  }
  document.querySelector('#galleryBack').addEventListener('click',()=>gallery.scrollBy({left:galleryStep(),behavior:reduceMotion?'instant':'smooth'}));
  document.querySelector('#galleryForward').addEventListener('click',()=>gallery.scrollBy({left:-galleryStep(),behavior:reduceMotion?'instant':'smooth'}));
  gallery.addEventListener('scroll',()=>requestAnimationFrame(updateGalleryProgress),{passive:true});
  addEventListener('resize',updateGalleryProgress,{passive:true});
  updateGalleryProgress();
  // The mouse wheel is intentionally NOT intercepted: vertical page scrolling remains natural.

  const lightbox=document.querySelector('#lightbox');
  const lightboxImage=document.querySelector('#lightboxImage');
  const lbBack=document.querySelector('#lightboxBack');
  const lbForward=document.querySelector('#lightboxForward');
  let activeIndex=null;
  let previousFocus=null;
  function lightboxRender(){
    const item=images[activeIndex];
    if(!item)return;
    lightboxImage.src=item.src;lightboxImage.alt=item.alt;
  }
  function openLightbox(index){
    previousFocus=document.activeElement;
    activeIndex=index;
    if(index===null){
      lightboxImage.src='assets/images/menu.webp';lightboxImage.alt='תפריט מעדני יעקב';
      lbBack.hidden=true;lbForward.hidden=true;
    }else{lightboxRender();lbBack.hidden=false;lbForward.hidden=false;}
    lightbox.hidden=false;document.body.classList.add('locked');
    document.querySelector('#lightboxClose').focus();
  }
  function closeLightbox(){
    if(lightbox.hidden)return;
    lightbox.hidden=true;document.body.classList.remove('locked');
    lightboxImage.removeAttribute('src');
    previousFocus?.focus?.();
  }
  images.forEach((_,index)=>images[index].closest('button').addEventListener('click',()=>openLightbox(index)));
  document.querySelector('#menuOpen').addEventListener('click',()=>openLightbox(null));
  document.querySelector('#lightboxClose').addEventListener('click',closeLightbox);
  lightbox.addEventListener('click',event=>{if(event.target===lightbox)closeLightbox();});
  function navigateLightbox(delta){
    if(activeIndex===null)return;
    activeIndex=(activeIndex+delta+images.length)%images.length;
    lightboxRender();
  }
  lbBack.addEventListener('click',()=>navigateLightbox(-1));
  lbForward.addEventListener('click',()=>navigateLightbox(1));
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'){closeNav();closeLightbox();}
    if(lightbox.hidden)return;
    if(event.key==='ArrowLeft')navigateLightbox(1);
    if(event.key==='ArrowRight')navigateLightbox(-1);
    if(event.key==='Tab'){
      const buttons=[...lightbox.querySelectorAll('button:not([hidden])')];
      const first=buttons[0],last=buttons[buttons.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });

  // Muted video previews play only when visible and stop when the tab is hidden.
  const videos=[...document.querySelectorAll('video[autoplay]')];
  videos.forEach(video=>{
    video.muted=true;video.defaultMuted=true;
    if(reduceMotion){video.pause();return;}
    if('IntersectionObserver' in window){
      const videoObserver=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting&&document.visibilityState==='visible'){
            const p=entry.target.play();if(p&&p.catch)p.catch(()=>{});
          }else entry.target.pause();
        });
      },{threshold:.16,rootMargin:'30px 0px'});
      videoObserver.observe(video);
    }
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)videos.forEach(video=>video.pause());});


  const dateField=document.querySelector('input[name="date"].date-field');
  function validateDate(){
    if(!dateField)return;
    const value=dateField.value.trim();
    dateField.setCustomValidity('');
    if(!value)return;
    const match=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
    if(!match){dateField.setCustomValidity('נא להזין תאריך בתבנית יום/חודש/שנה, למשל 25/12/2026');return;}
    const day=Number(match[1]),month=Number(match[2]),year=Number(match[3]);
    const check=new Date(year,month-1,day);
    if(check.getFullYear()!==year||check.getMonth()!==month-1||check.getDate()!==day)dateField.setCustomValidity('יש להזין תאריך תקין');
  }
  dateField?.addEventListener('input',()=>dateField.setCustomValidity(''));
  dateField?.addEventListener('change',validateDate);
  dateField?.addEventListener('blur',validateDate);

  document.querySelector('#eventForm').addEventListener('submit',event=>{
    event.preventDefault();
    const form=event.currentTarget;
    validateDate();
    if(!form.reportValidity())return;
    const data=new FormData(form);
    const date=String(data.get('date')||'').trim()||'טרם נקבע';
    const message=[
      'שלום, הגעתי דרך האתר של מעדני יעקב ואשמח לקבל הצעת מחיר:',
      '',
      `שם: ${data.get('name')}`,
      `טלפון: ${data.get('phone')||'לא צוין'}`,
      `סוג האירוע: ${data.get('event')}`,
      `כמות מוזמנים: ${data.get('guests')}`,
      `תאריך: ${date}`,
      `מיקום: ${data.get('location')||'טרם נקבע'}`,
      `בקשות נוספות: ${data.get('note')||'ללא'}`
    ].join('\n');
    const dest=encodeWhatsApp(message);
    const popup=window.open(dest,'_blank');
    if(!popup)location.href=dest;
  });
  // Only on mobile: display the same contact details beneath the quote form.
  // On larger screens restore the exact original layout and DOM positions.
  const mobileContactLayout=window.matchMedia('(max-width:700px)');
  const contactCopy=document.querySelector('.contact-copy');
  const contactForm=document.querySelector('#eventForm');
  const contactDivider=contactCopy.querySelector('.contact-divider');
  const contactDetails=contactCopy.querySelector('.footer-contact');
  function arrangeContactDetails(){
    if(mobileContactLayout.matches){
      contactForm.after(contactDivider,contactDetails);
    }else{
      contactCopy.append(contactDivider,contactDetails);
    }
  }
  arrangeContactDetails();
  if(mobileContactLayout.addEventListener){mobileContactLayout.addEventListener('change',arrangeContactDetails);}
  else{mobileContactLayout.addListener(arrangeContactDetails);}

  document.querySelector('#year').textContent=new Date().getFullYear();
})();
