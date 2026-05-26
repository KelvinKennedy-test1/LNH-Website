/* ===================================================
   Limuru Nursing Home — LNH3.JS
   Features: hero slideshow (auto + manual + Ken Burns),
             dropdown, mobile menu, scroll-spy, stats
             counter, appointment form, back-to-top,
             emergency banner, scroll hint
=================================================== */

'use strict';

/* ══════════════════════════════════════════
   ── HERO SLIDESHOW ──
══════════════════════════════════════════ */
const slides = [
  { src: "./hero1.jpeg", caption: "Welcome to our hospital" },
  { src: "./hero2.jpeg", caption: "Dedicated medical team" },
  { src: "./hero3.jpeg", caption: "Compassionate patient care" },
  { src: "./hero4.jpeg"},
  { src: "./hero5.jpeg"},


];

const slideEls = document.querySelectorAll('.hero-slide');

// Apply background URLs to each slide div
slideEls.forEach((el, i) => {
  if (slides[i]) {
    el.style.backgroundImage = `url('${slides[i].src}')`;
  }
});
(function initSlideshow() {
    var slides      = document.querySelectorAll('.hero-slide');
    var dots        = document.querySelectorAll('.hero-dot');
    var prevBtn     = document.getElementById('heroPrev');
    var nextBtn     = document.getElementById('heroNext');
    var scrollHint  = document.querySelector('.hero-scroll-hint');

    if (!slides.length) return;

    var current   = 0;
    var total     = slides.length;
    var autoTimer = null;
    var INTERVAL  = 5500; // ms between auto-advance

    function goTo(index) {
        // Remove active from current
        slides[current].classList.remove('active');
        dots[current].classList.remove('active');
        dots[current].setAttribute('aria-selected', 'false');

        current = (index + total) % total;

        slides[current].classList.add('active');
        dots[current].classList.add('active');
        dots[current].setAttribute('aria-selected', 'true');
    }

    function startAuto() {
        clearInterval(autoTimer);
        autoTimer = setInterval(function () { goTo(current + 1); }, INTERVAL);
    }

    function resetAuto() {
        startAuto(); // restart timer on manual interaction
    }

    // Arrow buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', function () {
            goTo(current - 1);
            resetAuto();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function () {
            goTo(current + 1);
            resetAuto();
        });
    }

    // Dot buttons
    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
            goTo(i);
            resetAuto();
        });
    });

    // Touch / swipe support
    var touchStartX = 0;
    var hero = document.getElementById('home');
    if (hero) {
        hero.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].clientX;
        }, { passive: true });

        hero.addEventListener('touchend', function (e) {
            var diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 40) {
                goTo(diff > 0 ? current + 1 : current - 1);
                resetAuto();
            }
        }, { passive: true });
    }

    // Pause on hover / focus
    if (hero) {
        hero.addEventListener('mouseenter', function () { clearInterval(autoTimer); });
        hero.addEventListener('mouseleave', startAuto);
    }

    // Show scroll hint after 3 s
    if (scrollHint) {
        setTimeout(function () {
            scrollHint.style.display = 'block';
        }, 3000);
    }

    // Preload all slide images
    slides.forEach(function (slide) {
        var url = (slide.style.backgroundImage || '').replace(/url\(['"]?|['"]?\)/g, '');
        if (url) { var img = new Image(); img.src = url; }
    });

    // Initialise slideshow
    startAuto();
})();


/* ══════════════════════════════════════════
   ── DROPDOWN TOGGLE ──
══════════════════════════════════════════ */
var dropdowns = document.querySelectorAll('.nav-dropdown');

dropdowns.forEach(function (dropdown) {
    var panel   = dropdown.querySelector('.dropdown-panel');
    var trigger = dropdown.querySelector('.nav-link-dropdown');

    trigger.addEventListener('click', function (e) {
        e.preventDefault();
        var isOpen = panel.classList.contains('open');
        closeAllDropdowns();
        if (!isOpen) {
            panel.classList.add('open');
            dropdown.classList.add('open');
        }
    });
});

function closeAllDropdowns() {
    dropdowns.forEach(function (d) {
        d.querySelector('.dropdown-panel').classList.remove('open');
        d.classList.remove('open');
    });
}

document.addEventListener('click', function (e) {
    var inside = Array.from(dropdowns).some(function (d) { return d.contains(e.target); });
    if (!inside) closeAllDropdowns();
});

// Keyboard: close on Escape
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAllDropdowns();
});

// "See All Services" link
var seeAllServices = document.getElementById('seeAllServices');
if (seeAllServices) {
    seeAllServices.addEventListener('click', function (e) {
        e.preventDefault();
        closeAllDropdowns();
        document.getElementById('services').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}


/* ══════════════════════════════════════════
   ── MOBILE HAMBURGER ──
══════════════════════════════════════════ */
var hamburger     = document.getElementById('hamburger');
var navMenu       = document.getElementById('navMenu');
var mobileOverlay = document.getElementById('mobileOverlay');

if (hamburger) {
    hamburger.addEventListener('click', function () {
        var isOpen = navMenu.classList.toggle('open');
        hamburger.classList.toggle('open', isOpen);
        mobileOverlay.classList.toggle('active', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
}

if (mobileOverlay) {
    mobileOverlay.addEventListener('click', function () {
        navMenu.classList.remove('open');
        if (hamburger) { hamburger.classList.remove('open'); hamburger.setAttribute('aria-expanded', 'false'); }
        mobileOverlay.classList.remove('active');
        closeAllDropdowns();
    });
}

document.querySelectorAll('#navMenu .nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
        navMenu.classList.remove('open');
        if (hamburger) { hamburger.classList.remove('open'); hamburger.setAttribute('aria-expanded', 'false'); }
        if (mobileOverlay) mobileOverlay.classList.remove('active');
    });
});


/* ══════════════════════════════════════════
   ── SCROLL-SPY ──
══════════════════════════════════════════ */
var sections = document.querySelectorAll('section[id]');
var navLinks = document.querySelectorAll('.nav-link[data-section]');

function updateScrollSpy() {
    var scrollPos = window.scrollY + 110;
    sections.forEach(function (section) {
        var top    = section.offsetTop;
        var bottom = top + section.offsetHeight;
        var id     = section.getAttribute('id');

        if (scrollPos >= top && scrollPos < bottom) {
            navLinks.forEach(function (l) { l.classList.remove('active'); });
            var active = document.querySelector('.nav-link[data-section="' + id + '"]');
            if (active) active.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateScrollSpy, { passive: true });
updateScrollSpy();


/* ══════════════════════════════════════════
   ── NAVBAR SHADOW ON SCROLL ──
══════════════════════════════════════════ */
var mainNav = document.getElementById('mainNav');
window.addEventListener('scroll', function () {
    if (mainNav) {
        mainNav.style.boxShadow = window.scrollY > 10
            ? '0 4px 20px rgba(0,0,0,0.28)'
            : '0 2px 12px rgba(0,0,0,0.18)';
    }
}, { passive: true });


/* ══════════════════════════════════════════
   ── BOOK APPOINTMENT BUTTON ──
══════════════════════════════════════════ */
var bookBtn        = document.getElementById('bookBtn');
var appointmentSec = document.getElementById('appointment');

if (bookBtn && appointmentSec) {
    bookBtn.addEventListener('click', function () {
        appointmentSec.style.display = 'block';
        setTimeout(function () {
            appointmentSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    });
}


/* ══════════════════════════════════════════
   ── APPOINTMENT FORM (FORMSPREE) ──
   Sends directly to info@limurunursinghome.co.ke
══════════════════════════════════════════ */

var WEB3FORMS_KEY = 'd02c1e54-3102-4926-9643-01c572b908c6';/* Include that of lnh */

var apptForm   = document.getElementById('appointmentForm');
var successMsg = document.getElementById('apptSuccess');
var newApptBtn = document.getElementById('newApptBtn');
var dateInput  = document.getElementById('apptDate');

// Set minimum date = today
if (dateInput) {
    dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);
}

if (apptForm) {
    apptForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Collect values
        var name    = document.getElementById('fullName').value.trim();
        var phone   = document.getElementById('phone').value.trim();
        var email   = document.getElementById('email').value.trim() || 'N/A';
        var service = document.getElementById('service').value;
        var date    = document.getElementById('apptDate').value;
        var time    = document.getElementById('apptTime').value;
        var notes   = document.getElementById('notes').value.trim() || 'None';

        // Format date from yyyy-mm-dd to dd/mm/yy
        var formattedDate = (function(d) {
            var parts = d.split('-');
            return parts[2] + '/' + parts[1] + '/' + parts[0];
        })(date);

        // Validation
        if (!name || !phone || !service || !date || !time) {
            alert('Please fill all required fields.');
            return;
        }

        // Disable submit button (prevent double-submit)
        var btn = apptForm.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

        // Send via Web3Forms → delivered to info@limurunursinghome.co.ke
        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                access_key:   WEB3FORMS_KEY,
                subject:      'New Appointment Request – Limuru Nursing Home',
                'Full Name':  name,
                'Phone':      phone,
                'Email':      email,
                'Service':    service,
                'Date':       formattedDate,
                'Time':       time,
                'Notes':      notes
            })
        })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (data.success) {
                // Show success UI
                apptForm.style.display = 'none';
                if (successMsg) successMsg.style.display = 'flex';
            } else {
                throw new Error(data.message || 'Submission failed');
            }
        })
        .catch(function (error) {
            console.error('Web3Forms error:', error);
            alert('Failed to send appointment. Please try again or call +254 720 519 777.');
            if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit Appointment Request'; }
        });
    });
}

// Reset form for another booking
if (newApptBtn) {
    newApptBtn.addEventListener('click', function () {
        apptForm.reset();
        apptForm.style.display = 'flex';
        if (successMsg) successMsg.style.display = 'none';
        var btn = apptForm.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit Appointment Request'; }
    });
}
/* ══════════════════════════════════════════
   ── STATS COUNTER ANIMATION ──
══════════════════════════════════════════ */
function animateCounter(el, target, duration) {
    var start = 0;
    var step  = target / (duration / 16);

    function tick() {
        start += step;
        if (start >= target) {
            el.textContent = target.toLocaleString();
            return;
        }
        el.textContent = Math.floor(start).toLocaleString();
        requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

var statNums     = document.querySelectorAll('.stat-num[data-target]');
var statsAnimated = false;
var statsStrip    = document.querySelector('.stats-strip');

if (statsStrip && statNums.length) {
    var statsObserver = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting && !statsAnimated) {
            statsAnimated = true;
            statNums.forEach(function (el) {
                animateCounter(el, parseInt(el.getAttribute('data-target'), 10), 1500);
            });
        }
    }, { threshold: 0.4 });

    statsObserver.observe(statsStrip);
}


/* ══════════════════════════════════════════
   ── BACK TO TOP BUTTON ──
══════════════════════════════════════════ */
var backToTop = document.getElementById('backToTop');

if (backToTop) {
    window.addEventListener('scroll', function () {
        backToTop.classList.toggle('visible', window.scrollY > 450);
    }, { passive: true });

    backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}


/* ══════════════════════════════════════════
   ── CARD ENTRANCE ANIMATION ──
══════════════════════════════════════════ */
var cards = document.querySelectorAll('.card');
if (cards.length) {
    var cardObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.style.opacity   = '1';
                entry.target.style.transform = 'translateY(0)';
                cardObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    cards.forEach(function (card, i) {
        card.style.opacity    = '0';
        card.style.transform  = 'translateY(24px)';
        card.style.transition = 'opacity 0.45s ease ' + (i * 0.07) + 's, transform 0.45s ease ' + (i * 0.07) + 's, box-shadow 0.25s';
        cardObserver.observe(card);
    });
}
/* ══════════════════════════════════════════════════════
   SERVICE MODAL SLIDESHOW
   ══════════════════════════════════════════════════════
 */

const SERVICE_IMAGES = {
  laboratory: [
    { src: "./lab1.jpeg", alt: "Kwa Patel Laboratory Entrance" },
    { src: "./lab2.jpeg", alt: "Laboratory Equipment" },
    { src: "./lab3.jpeg", alt: "Laboratory Interior" },
  ],
  orthopaedic: [
    { src: "./ortho1.jpeg", alt: "Orthopaedic Theatre - Overview" },
    { src: "./ortho2.jpeg", alt: "Orthopaedic Theatre - C-Arm & Equipment" },
    { src: "./ortho3.jpeg", alt: "Orthopaedic Theatre - Operating Table" },
    { src: "./ortho4.jpeg", alt: "Orthopaedic Theatre - Surgical Lights" },
  ],
  chemist: [
    { src: "./chemist.jpeg", alt: "Kwa Patel Chemist - 24hrs Pharmacy" },
  ],
  outpatient: [
    { src: "./sectionA.jpeg"},
    { src: "./sectionB.jpeg"},
  ],
  paediatrics: [
    { src: "./sectionA.jpeg"},
    { src: "./sectionB.jpeg"},
    { src: "./sectionC.jpeg"},
    { src: "./sectionD.jpeg"},
    { src: "./sectionE.jpeg"},
    { src: "./sectionF.jpeg"},
    { src: "./sectionG.jpeg"},
    { src: "./sectionH.jpeg"},
  ],

};

let currentImages = [];
let currentIndex  = 0;
let autoTimer     = null;

// ── BUILD MODAL DOM ──────────────────────────────────────
function buildModal() {
  if (document.getElementById('serviceModal')) return;

  document.body.insertAdjacentHTML('beforeend', `
    <div id="serviceModal" class="svc-modal" role="dialog" aria-modal="true" aria-label="Service gallery">
      <div class="svc-modal__backdrop"></div>
      <div class="svc-modal__box">

        <button class="svc-modal__close" aria-label="Close">&times;</button>

        <div class="svc-modal__header">
          <i class="svc-modal__icon"></i>
          <h2 class="svc-modal__title"></h2>
        </div>

        <div class="svc-modal__stage">
          <img class="svc-modal__img" src="" alt="" />
          <div class="svc-modal__spinner"><span></span></div>

          <button class="svc-modal__nav svc-modal__nav--prev" aria-label="Previous">&#8249;</button>
          <button class="svc-modal__nav svc-modal__nav--next" aria-label="Next">&#8250;</button>

          <div class="svc-modal__counter"></div>
        </div>

        <p class="svc-modal__caption"></p>
        <div class="svc-modal__dots"></div>

      </div>
    </div>
  `);

  // Events
  document.querySelector('.svc-modal__backdrop').addEventListener('click', closeModal);
  document.querySelector('.svc-modal__close').addEventListener('click', closeModal);
  document.querySelector('.svc-modal__nav--prev').addEventListener('click', () => goTo(currentIndex - 1));
  document.querySelector('.svc-modal__nav--next').addEventListener('click', () => goTo(currentIndex + 1));

  document.getElementById('serviceModal').addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft')  goTo(currentIndex - 1);
    if (e.key === 'ArrowRight') goTo(currentIndex + 1);
  });
}

// ── OPEN ────────────────────────────────────────────────
function openModal(serviceKey, title, iconClass) {
  buildModal();
  const images = SERVICE_IMAGES[serviceKey];
  if (!images || images.length === 0) return;

  currentImages = images;
  currentIndex  = 0;

  const modal = document.getElementById('serviceModal');
  modal.querySelector('.svc-modal__title').textContent = title;

  const iconEl = modal.querySelector('.svc-modal__icon');
  iconEl.className = 'svc-modal__icon ' + iconClass;

  renderDots();
  loadSlide(0);

  modal.classList.add('svc-modal--open');
  document.body.style.overflow = 'hidden';
  modal.focus();
  startAuto();
}

function closeModal() {
  const modal = document.getElementById('serviceModal');
  if (!modal) return;
  modal.classList.remove('svc-modal--open');
  document.body.style.overflow = '';
  stopAuto();
}

// ── NAVIGATION ───────────────────────────────────────────
function goTo(index) {
  const n = currentImages.length;
  currentIndex = ((index % n) + n) % n;
  loadSlide(currentIndex);
  stopAuto(); startAuto();
}

function loadSlide(index) {
  const modal   = document.getElementById('serviceModal');
  const imgEl   = modal.querySelector('.svc-modal__img');
  const caption = modal.querySelector('.svc-modal__caption');
  const counter = modal.querySelector('.svc-modal__counter');
  const spinner = modal.querySelector('.svc-modal__spinner');

  imgEl.style.opacity = '0';
  spinner.style.display = 'flex';

  const newImg = new Image();
  newImg.onload = () => {
    imgEl.src = currentImages[index].src;
    imgEl.alt = currentImages[index].caption;
    spinner.style.display = 'none';
    imgEl.style.opacity = '1';
  };
  newImg.src = currentImages[index].src;

  caption.textContent = currentImages[index].caption;
  counter.textContent = (index + 1) + ' / ' + currentImages.length;
  updateDots(index);
}

// ── DOTS ─────────────────────────────────────────────────
function renderDots() {
  const dotsEl = document.querySelector('.svc-modal__dots');
  dotsEl.innerHTML = currentImages.map((_, i) =>
    `<button class="svc-dot" aria-label="Go to slide ${i+1}"></button>`
  ).join('');
  dotsEl.querySelectorAll('.svc-dot').forEach((dot, i) => {
    dot.addEventListener('click', () => goTo(i));
  });
}

function updateDots(active) {
  document.querySelectorAll('.svc-dot').forEach((dot, i) => {
    dot.classList.toggle('svc-dot--active', i === active);
  });
}

// ── AUTO-PLAY ────────────────────────────────────────────
function startAuto() {
  stopAuto();
  if (currentImages.length > 1) {
    autoTimer = setInterval(() => goTo(currentIndex + 1), 8000);
  }
}
function stopAuto() {
  if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
}

// ── WIRE UP CARDS ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.card[data-service]').forEach(card => {
    const key = card.dataset.service;
    if (!SERVICE_IMAGES[key]) return; // no images yet — skip click

    card.classList.add('card--has-gallery');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', card.querySelector('h3').textContent + ' — view gallery');

    const onClick = () => {
      const title     = card.querySelector('h3').textContent;
      const iconClass = card.querySelector('.card-icon').className.replace('card-icon', '').trim();
      openModal(key, title, iconClass);
    };

    card.addEventListener('click', onClick);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') onClick(); });
  });
});

/* ══════════════════════════════════════════
   ── MAIL ICON → Open Gmail in browser ──
══════════════════════════════════════════ */
var mailIconBtn = document.querySelector('.icon-box.mail');
if (mailIconBtn) {
    mailIconBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var to      = 'info@limurunursinghome.co.ke';
        var subject = encodeURIComponent('Enquiry – Limuru Nursing Home');
        var body    = encodeURIComponent('Hello, I would like to enquire about your services.');

        // Opens Gmail compose window directly in browser tab
        window.open(
            'https://mail.google.com/mail/?view=cm&to=' + to + '&su=' + subject + '&body=' + body,
            '_blank'
        );
    });
}

/* ══════════════════════════════════════════
   ── YAHOO ICON → Open Yahoo Mail compose ──
══════════════════════════════════════════ */
(function () {
    var yahooIcon = document.querySelector('.icon-box.yahoo');
    if (!yahooIcon) return;

    yahooIcon.removeAttribute('href');

    yahooIcon.addEventListener('click', function (e) {
        e.preventDefault();

        var to      = 'limuru.nursinghome@yahoo.com';
        var subject = encodeURIComponent('Enquiry – Limuru Nursing Home');
        var body    = encodeURIComponent(
            'Hello,\n\nI would like to enquire about your services.\n\nName: \nPhone: \nMessage: '
        );

        // Opens Yahoo Mail compose window in a new browser tab
        // Yahoo icon also opens Gmail compose to your business email
    window.open(
        'https://mail.google.com/mail/?view=cm&to=limuru.nursinghome@yahoo.com&su=' + subject + '&body=' + body,
        '_blank'
        );
        
    });
})();


/* ══════════════════════════════════════════
   ── YEAR IN FOOTER (auto-update) ──
══════════════════════════════════════════ */
(function () {
    var footer = document.querySelector('footer span');
    if (footer) {
        footer.textContent = '\u00A9 ' + new Date().getFullYear() + ' Limuru Nursing Home Ltd. All rights reserved.';
    }
})();
