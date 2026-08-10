/* ============================================================
   CONNECTA — shared behavior for secondary pages
   Nav shadow · mobile drawer · scroll reveals · FAQ · form
   ============================================================ */
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* nav shadow on scroll */
  var nav = document.getElementById('nav');
  if(nav){
    var onScroll = function(){ nav.classList.toggle('scrolled', window.scrollY > 12); };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
  }

  /* mobile drawer */
  var drawer = document.getElementById('drawer');
  var burger = document.getElementById('hamburger');
  var closeB = document.getElementById('drawerClose');
  if(drawer && burger){
    var openD = function(){ drawer.classList.add('open'); burger.setAttribute('aria-expanded','true'); document.body.style.overflow='hidden'; };
    var closeD = function(){ drawer.classList.remove('open'); burger.setAttribute('aria-expanded','false'); document.body.style.overflow=''; };
    burger.addEventListener('click', openD);
    if(closeB) closeB.addEventListener('click', closeD);
    drawer.addEventListener('click', function(e){ if(e.target===drawer) closeD(); });
    drawer.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeD); });
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeD(); });
  }

  /* scroll reveals */
  var revs = document.querySelectorAll('.reveal');
  if(reduce || !('IntersectionObserver' in window)){
    revs.forEach(function(el){ el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, {threshold:.12, rootMargin:'0px 0px -8% 0px'});
    revs.forEach(function(el){ io.observe(el); });
  }

  /* FAQ accordion */
  document.querySelectorAll('.faq-item').forEach(function(item){
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    if(!q || !a) return;
    q.addEventListener('click', function(){
      var isOpen = item.classList.contains('open');
      if(isOpen){
        item.classList.remove('open');
        a.style.maxHeight = '0px';
        q.setAttribute('aria-expanded','false');
      } else {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
        q.setAttribute('aria-expanded','true');
      }
    });
  });

  /* contact form → FormSubmit AJAX (no server needed) */
  var form = document.getElementById('contactForm');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var ok = document.getElementById('formSuccess');
      var err = document.getElementById('formError');
      var btn = form.querySelector('.btn');
      if(err) err.classList.remove('show');
      if(!form.checkValidity()){ form.reportValidity(); return; }
      var original = btn ? btn.textContent : '';
      if(btn){ btn.setAttribute('disabled','true'); btn.textContent = 'Sending…'; }

      fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      })
      .then(function(res){ if(!res.ok) throw new Error('bad status'); return res.json(); })
      .then(function(){
        form.querySelectorAll('input,select,textarea').forEach(function(f){ f.setAttribute('disabled','true'); });
        if(ok) ok.classList.add('show');
        form.reset();
      })
      .catch(function(){
        if(btn){ btn.removeAttribute('disabled'); btn.textContent = original; }
        if(err) err.classList.add('show');
      });
    });
  }

  /* current year in footer */
  document.querySelectorAll('[data-year]').forEach(function(el){
    el.textContent = new Date().getFullYear();
  });
})();
