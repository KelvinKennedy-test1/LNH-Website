/* ===================================================
   Limuru Nursing Home — LNH.JS
   Author: Kelvin Kennedy
   Fixed bugs + added: scroll-spy, stats counter,
   mobile menu, back-to-top, form validation,
   "Book Another" reset, "See All Services" link
=================================================== */

// ── DROPDOWN TOGGLE ──
const dropdowns = document.querySelectorAll('.nav-dropdown');

dropdowns.forEach(function(dropdown) {
    const panel   = dropdown.querySelector('.dropdown-panel');
    const trigger = dropdown.querySelector('.nav-link-dropdown');

    trigger.addEventListener('click', function(e) {
        e.preventDefault();
        const isOpen = panel.classList.contains('open');

        // Close all dropdowns
        closeAllDropdowns();

        // Toggle current (open if it was closed)
        if (!isOpen) {
            panel.classList.add('open');
            dropdown.classList.add('open');
        }
    });
});

function closeAllDropdowns() {
    dropdowns.forEach(function(d) {
        d.querySelector('.dropdown-panel').classList.remove('open');
        d.classList.remove('open');
    });
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    const clickedInsideDropdown = Array.from(dropdowns).some(d => d.contains(e.target));
    if (!clickedInsideDropdown) closeAllDropdowns();
});

// FIX: "See All Services" — single click scrolls to services (removed broken double-click UX)
const seeAllServices = document.getElementById('seeAllServices');
if (seeAllServices) {
    seeAllServices.addEventListener('click', function(e) {
        e.preventDefault();
        closeAllDropdowns();
        document.getElementById('services').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}


// ── MOBILE HAMBURGER ──
const hamburger    = document.getElementById('hamburger');
const navMenu      = document.getElementById('navMenu');
const mobileOverlay = document.getElementById('mobileOverlay');

if (hamburger) {
    hamburger.addEventListener('click', function() {
        const isOpen = navMenu.classList.toggle('open');
        hamburger.classList.toggle('open', isOpen);
        mobileOverlay.classList.toggle('active', isOpen);
    });
}

if (mobileOverlay) {
    mobileOverlay.addEventListener('click', function() {
        navMenu.classList.remove('open');
        hamburger.classList.remove('open');
        mobileOverlay.classList.remove('active');
        closeAllDropdowns();
    });
}

// Close mobile menu on nav link click
document.querySelectorAll('#navMenu .nav-link').forEach(function(link) {
    link.addEventListener('click', function() {
        navMenu.classList.remove('open');
        hamburger && hamburger.classList.remove('open');
        mobileOverlay && mobileOverlay.classList.remove('active');
    });
});


// ── SCROLL-SPY — highlight active nav section ──
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link[data-section]');

function updateScrollSpy() {
    const scrollPos = window.scrollY + 100;
    sections.forEach(function(section) {
        const top    = section.offsetTop;
        const bottom = top + section.offsetHeight;
        const id     = section.getAttribute('id');

        if (scrollPos >= top && scrollPos < bottom) {
            navLinks.forEach(l => l.classList.remove('active'));
            const active = document.querySelector(`.nav-link[data-section="${id}"]`);
            if (active) active.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateScrollSpy, { passive: true });
updateScrollSpy();


// ── NAVBAR SHADOW ON SCROLL ──
const mainNav = document.getElementById('mainNav');
window.addEventListener('scroll', function() {
    if (mainNav) {
        mainNav.style.boxShadow = window.scrollY > 10
            ? '0 4px 20px rgba(0,0,0,0.25)'
            : '0 2px 12px rgba(0,0,0,0.18)';
    }
}, { passive: true });


// ── BOOK APPOINTMENT — show section on click ──
const bookBtn        = document.getElementById('bookBtn');
const appointmentSec = document.getElementById('appointment');

if (bookBtn && appointmentSec) {
    bookBtn.addEventListener('click', function() {
        appointmentSec.style.display = 'block';
        setTimeout(function() {
            appointmentSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    });
}


// ── APPOINTMENT FORM ──
const apptForm   = document.getElementById('appointmentForm');
const successMsg = document.getElementById('apptSuccess');
const newApptBtn = document.getElementById('newApptBtn');

// Set min date to today (no past dates)
const dateInput = document.getElementById('apptDate');
if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
}

// Inline validation helper
function validateField(id, errorId, check, message) {
    const el  = document.getElementById(id);
    const err = document.getElementById(errorId);
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

// Clear validation on input
['fullName','phone','email','service','apptDate','apptTime'].forEach(function(id) {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('input', function() {
            el.classList.remove('invalid');
            const err = document.getElementById('err-' + id);
            if (err) err.textContent = '';
        });
    }
});

if (apptForm) {
    apptForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validate all required fields
        const nameOk  = validateField('fullName', 'err-fullName', v => v.trim().length >= 2, 'Please enter your full name.');
        const phoneOk = validateField('phone',    'err-phone',    v => /^[\d\s+\-()]{7,}$/.test(v.trim()), 'Enter a valid phone number.');
        const emailVal = document.getElementById('email') ? document.getElementById('email').value.trim() : '';
        const emailOk = emailVal === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
        if (!emailOk) {
            document.getElementById('email').classList.add('invalid');
            document.getElementById('err-email').textContent = 'Enter a valid email address.';
        }
        const servOk  = validateField('service',  'err-service',  v => v !== '', 'Please select a service.');
        const dateOk  = validateField('apptDate', 'err-apptDate', v => v !== '', 'Please choose a date.');
        const timeOk  = validateField('apptTime', 'err-apptTime', v => v !== '', 'Please choose a time.');

        if (!nameOk || !phoneOk || !emailOk || !servOk || !dateOk || !timeOk) return;

        const name    = document.getElementById('fullName').value.trim();
        const phone   = document.getElementById('phone').value.trim();
        const email   = emailVal || 'N/A';
        const service = document.getElementById('service').value;
        const date    = document.getElementById('apptDate').value;
        const time    = document.getElementById('apptTime').value;
        const notes   = document.getElementById('notes').value.trim() || 'None';

        const msg = [
            'Hello Limuru Nursing Home,',
            '',
            "I'd like to book an appointment:",
            '',
            `👤 Name: ${name}`,
            `📞 Phone: ${phone}`,
            `📧 Email: ${email}`,
            `🏥 Service: ${service}`,
            `📅 Date: ${date}`,
            `⏰ Time: ${time}`,
            `📝 Notes: ${notes}`,
            '',
            'Kindly confirm my appointment. Thank you.'
        ].join('\n');

        const waURL = `https://wa.me/254720519777?text=${encodeURIComponent(msg)}`;

        // Show success
        apptForm.style.display = 'none';
        successMsg.style.display = 'flex';

        // Open WhatsApp after brief delay
        setTimeout(function() { window.open(waURL, '_blank'); }, 700);
    });
}

// "Book Another" resets the form
if (newApptBtn) {
    newApptBtn.addEventListener('click', function() {
        apptForm.reset();
        apptForm.style.display = 'flex';
        successMsg.style.display = 'none';
        // Re-set min date
        if (dateInput) {
            dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);
        }
    });
}


// ── STATS COUNTER ANIMATION ──
function animateCounter(el, target, duration) {
    let start = 0;
    const step = target / (duration / 16);

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

const statNums = document.querySelectorAll('.stat-num[data-target]');
let statsAnimated = false;

const statsObserver = new IntersectionObserver(function(entries) {
    if (entries[0].isIntersecting && !statsAnimated) {
        statsAnimated = true;
        statNums.forEach(function(el) {
            animateCounter(el, parseInt(el.getAttribute('data-target'), 10), 1400);
        });
    }
}, { threshold: 0.4 });

const statsStrip = document.querySelector('.stats-strip');
if (statsStrip) statsObserver.observe(statsStrip);


// ── BACK TO TOP BUTTON ──
const backToTop = document.getElementById('backToTop');

if (backToTop) {
    window.addEventListener('scroll', function() {
        backToTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    backToTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}


// ── CARD ENTRANCE ANIMATION on scroll ──
const cards = document.querySelectorAll('.card');
if (cards.length) {
    const cardObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.style.opacity    = '1';
                entry.target.style.transform  = 'translateY(0)';
                cardObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    cards.forEach(function(card, i) {
        card.style.opacity   = '0';
        card.style.transform = 'translateY(24px)';
        card.style.transition = `opacity 0.45s ease ${i * 0.07}s, transform 0.45s ease ${i * 0.07}s, box-shadow 0.25s`;
        cardObserver.observe(card);
    });
}
