/* ===================================================
   Limuru Nursing Home — LNH3.JS
   Author: Kelvin Kennedy  
   Features: hero slideshow (auto + manual + Ken Burns),
             dropdown, mobile menu, scroll-spy, stats
             counter, appointment form, back-to-top,
             emergency banner, scroll hint
=================================================== */

'use strict';

/* ══════════════════════════════════════════
   ── HERO SLIDESHOW ──
══════════════════════════════════════════ */
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
   Sends directly to ototokelvin180@gmail.com
   Steps:
     1. Go to https://formspree.io and sign up (free)
     2. Create a new form → set email to ototokelvin180@gmail.com
     3. Copy your Form ID (looks like: xpzgkwqr)
     4. Paste it in FORMSPREE_ID below
══════════════════════════════════════════ */

var FORMSPREE_ID = 'https://formspree.io/f/xwvzlgaa'; // ← only thing you need to change

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

        // Validation
        if (!name || !phone || !service || !date || !time) {
            alert('Please fill all required fields.');
            return;
        }

        // Disable submit button (prevent double-submit)
        var btn = apptForm.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

        // Send to Formspree → delivered to ototokelvin180@gmail.com
        fetch(FORMSPREE_ID, {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                'Full Name':  name,
                'Phone':      phone,
                'Email':      email,
                'Service':    service,
                'Date':       date,
                'Time':       time,
                'Notes':      notes
            })
        })
        .then(function (response) {
            if (response.ok) {
                // Show success UI
                apptForm.style.display = 'none';
                if (successMsg) successMsg.style.display = 'flex';
            } else {
                return response.json().then(function (data) {
                    throw new Error(data.error || 'Submission failed');
                });
            }
        })
        .catch(function (error) {
            console.error('Formspree error:', error);
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
