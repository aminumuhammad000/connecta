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

  /* Fetch Live Platform Statistics Directly from Database (No Mock Data) */
  fetch('https://api.myconnecta.ng/api/stats/public')
    .then(function(res){ return res.json(); })
    .then(function(res){
      if(res && res.success && res.data){
        var d = res.data;
        var jobsEl = document.querySelector('[data-stat="activeJobs"]');
        var freelancersEl = document.querySelector('[data-stat="totalFreelancers"]');
        var escrowEl = document.querySelector('[data-stat="totalEscrow"]');
        var pros = d.totalProfessionals || d.totalFreelancers || d.totalUsers || 0;
        var activeJobs = d.activeJobs || d.totalJobs || 0;
        var escrowVol = d.totalEscrowVolume || 0;
        if(jobsEl && activeJobs > 0) jobsEl.textContent = activeJobs.toLocaleString() + '+';
        if(freelancersEl && pros > 0) freelancersEl.textContent = pros.toLocaleString() + '+';
        if(escrowEl && escrowVol > 0) escrowEl.textContent = '$' + escrowVol.toLocaleString();
      }
    })
    .catch(function(err){ console.warn('Stats fetch warning:', err); });

  /* Fetch Live Contact Information from Database API */
  fetch('https://api.myconnecta.ng/api/settings/contact')
    .then(function(res){ return res.json(); })
    .then(function(res){
      if(res && res.success && res.data){
        var c = res.data;
        if(c.email){
          document.querySelectorAll('[data-contact="email"]').forEach(function(el){ el.textContent = c.email; });
          document.querySelectorAll('[data-contact="email-link"]').forEach(function(el){ el.href = 'mailto:' + c.email; });
        }
        if(c.phone){
          document.querySelectorAll('[data-contact="phone"]').forEach(function(el){ el.textContent = c.phone; });
          var cleanPhone = c.phone.replace(/[^0-9+]/g, '');
          document.querySelectorAll('[data-contact="phone-link"]').forEach(function(el){ el.href = 'tel:' + cleanPhone; });
        }
        if(c.whatsapp){
          document.querySelectorAll('[data-contact="whatsapp"]').forEach(function(el){ el.textContent = c.whatsapp; });
          var cleanWa = c.whatsapp.replace(/[^0-9]/g, '');
          document.querySelectorAll('[data-contact="whatsapp-link"]').forEach(function(el){ el.href = 'https://wa.me/' + cleanWa; });
        }
        if(c.supportHours){
          document.querySelectorAll('[data-contact="hours"]').forEach(function(el){ el.textContent = c.supportHours; });
        }
        if(c.supportChannel){
          document.querySelectorAll('[data-contact="channel"]').forEach(function(el){ el.textContent = c.supportChannel; });
        }
        if(c.address){
          document.querySelectorAll('[data-contact="address"]').forEach(function(el){ el.textContent = c.address; });
        }
      }
    })
    .catch(function(err){ console.warn('Contact info fetch warning:', err); });

  /* current year in footer */
  document.querySelectorAll('[data-year]').forEach(function(el){
    el.textContent = new Date().getFullYear();
  });
})();
