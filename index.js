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
   ── APPOINTMENT FORM ──
══════════════════════════════════════════ */
var apptForm   = document.getElementById('appointmentForm');
var successMsg = document.getElementById('apptSuccess');
var newApptBtn = document.getElementById('newApptBtn');
var dateInput  = document.getElementById('apptDate');

// Set min date to today
if (dateInput) {
    dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);
}

function validateField(id, errorId, check, message) {
    var el  = document.getElementById(id);
    var err = document.getElementById(errorId);
    if (!el || !err) return true;

    if (!check(el.value)) {
        el.classList.add('invalid');
        err.textContent = message;
        return false;
    }
    el.classList.remove('invalid');
    err.textContent = '';
    return true;
}

// Live clear validation on input
['fullName', 'phone', 'email', 'service', 'apptDate', 'apptTime'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
        el.addEventListener('input', function () {
            el.classList.remove('invalid');
            var err = document.getElementById('err-' + id);
            if (err) err.textContent = '';
        });
        el.addEventListener('change', function () {
            el.classList.remove('invalid');
            var err = document.getElementById('err-' + id);
            if (err) err.textContent = '';
        });
    }
});

if (apptForm) {
    apptForm.addEventListener('submit', function (e) {
        e.preventDefault();

        var nameOk  = validateField('fullName', 'err-fullName', function (v) { return v.trim().length >= 2; }, 'Please enter your full name.');
        var phoneOk = validateField('phone',    'err-phone',    function (v) { return /^[\d\s+\-()]{7,}$/.test(v.trim()); }, 'Enter a valid phone number.');
        var servOk  = validateField('service',  'err-service',  function (v) { return v !== ''; }, 'Please select a service.');
        var dateOk  = validateField('apptDate', 'err-apptDate', function (v) { return v !== ''; }, 'Please choose a date.');
        var timeOk  = validateField('apptTime', 'err-apptTime', function (v) { return v !== ''; }, 'Please choose a time.');

        // Optional email validation
        var emailEl  = document.getElementById('email');
        var emailErr = document.getElementById('err-email');
        var emailVal = emailEl ? emailEl.value.trim() : '';
        var emailOk  = true;
        if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
            emailOk = false;
            if (emailEl) emailEl.classList.add('invalid');
            if (emailErr) emailErr.textContent = 'Enter a valid email address.';
        }

        if (!nameOk || !phoneOk || !emailOk || !servOk || !dateOk || !timeOk) return;

        var name    = document.getElementById('fullName').value.trim();
        var phone   = document.getElementById('phone').value.trim();
        var email   = emailVal || 'N/A';
        var service = document.getElementById('service').value;
        var date    = document.getElementById('apptDate').value;
        var time    = document.getElementById('apptTime').value;
        var notesEl = document.getElementById('notes');
        var notes   = notesEl ? notesEl.value.trim() || 'None' : 'None';

        var msg = [
            'Hello Limuru Nursing Home,',
            '',
            "I'd like to book an appointment:",
            '',
            '\uD83D\uDC64 Name: '    + name,
            '\uD83D\uDCDE Phone: '   + phone,
            '\uD83D\uDCE7 Email: '   + email,
            '\uD83C\uDFE5 Service: ' + service,
            '\uD83D\uDCC5 Date: '    + date,
            '\u23F0 Time: '          + time,
            '\uD83D\uDCDD Notes: '   + notes,
            '',
            'Kindly confirm my appointment. Thank you.'
        ].join('\n');

        var waURL = 'https://wa.me/254720519777?text=' + encodeURIComponent(msg);

        apptForm.style.display    = 'none';
        successMsg.style.display  = 'flex';

        setTimeout(function () { window.open(waURL, '_blank'); }, 700);
    });
}

// "Book Another" resets the form
if (newApptBtn) {
    newApptBtn.addEventListener('click', function () {
        if (apptForm) {
            apptForm.reset();
            apptForm.style.display = 'flex';
        }
        successMsg.style.display = 'none';
        if (dateInput) {
            dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);
        }
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
   ── YEAR IN FOOTER (auto-update) ──
══════════════════════════════════════════ */
(function () {
    var footer = document.querySelector('footer span');
    if (footer) {
        footer.textContent = '\u00A9 ' + new Date().getFullYear() + ' Limuru Nursing Home Ltd. All rights reserved.';
    }
})();
