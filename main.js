 /* ── HAMBURGER ── */
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('navMenu');
  hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  /* ── DROPDOWNS ── */
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  dropdowns.forEach(dd => {
    const trigger = dd.querySelector('.nav-link-dropdown');
    trigger.addEventListener('click', (e) => {
      if (window.innerWidth <= 900) e.preventDefault();
      const isOpen = dd.classList.toggle('open');
      trigger.setAttribute('aria-expanded', isOpen);
      dropdowns.forEach(other => {
        if (other !== dd) { other.classList.remove('open'); other.querySelector('.nav-link-dropdown').setAttribute('aria-expanded','false'); }
      });
    });
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.nav-dropdown')) {
      dropdowns.forEach(dd => { dd.classList.remove('open'); dd.querySelector('.nav-link-dropdown').setAttribute('aria-expanded','false'); });
    }
  });

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
   ── APPOINTMENT FORM (Web3Forms) ──
   Sends directly to info@limurunursinghome.co.ke
══════════════════════════════════════════ */

/* ══════════════════════════════════════════
   Web3Forms  → info@limurunursinghome.co.ke
   EmailJS    → Auto-reply to patient
══════════════════════════════════════════ */


var WEB3FORMS_KEY    = 'ad7c24f9-97ce-45d4-80cf-020a49a083d8';
var EMAILJS_SERVICE  = 'service_z72ta1o';
var EMAILJS_TEMPLATE = 'template_iq0e1wv';
var EMAILJS_KEY      = 'c_30z16kdD65mwja-';

var apptForm   = document.getElementById('appointmentForm');
var successMsg = document.getElementById('apptSuccess');
var newApptBtn = document.getElementById('newApptBtn');
var dateInput  = document.getElementById('apptDate');

// Set minimum date = today
if (dateInput) {
    dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);
}
// ── Initialize EmailJS once ───────────────────────────────────
emailjs.init(EMAILJS_KEY);

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

        // Format date from yyyy-mm-dd to dd/mm/yyyy
        var formattedDate = (function(d) {
            var parts = d.split('-');
            return parts[2] + '/' + parts[1] + '/' + parts[0];
        })(date);

        // Validation
        if (!name || !phone || !service || !date || !time) {
            alert('Please fill all required fields.');
            return;
        }

        // Email is required for auto-reply — warn if missing
        if (!email) {
            alert('Please enter your email address to receive a confirmation.');
            return;
        }

        // Disable submit button (prevent double-submit)
        var btn = apptForm.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

        // ── STEP 1: Send to Web3Forms (notifies nursing home) ──
        var web3Promise = fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                access_key:  WEB3FORMS_KEY,
                subject:     'New Appointment Request – Limuru Nursing Home',
                'Full Name': name,
                'Phone':     phone,
                'Email':     email,
                'Service':   service,
                'Date':      formattedDate,
                'Time':      time,
                'Notes':     notes
            })
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            console.log('Web3Forms response:', data); // ← debug log
            return data;
        })
        .catch(function(err) {
            console.error('Web3Forms failed:', err);  // ← debug log
            throw err;
        });

         // ── STEP 2: Send auto-reply to visitor via EmailJS ────
        var emailjsPromise = emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
            to_email:  email,
            to_name:   name,
            from_name: 'Limuru Nursing Home',
            reply_to:  email,
            message:   "Thank you for reaching out! We'll get back to you within 24 hours.",
            // Appointment details (use in template if you want)
            appt_service: service,
            appt_date:    formattedDate,
            appt_time:    time,
        })
        .then(function(res) {
            console.log('[EmailJS] Auto-reply sent to', email, '| Status:', res.status);
            return res;
        })
        .catch(function(err) {
            // Log but don't block success — Web3Forms is the critical path
            console.error('[EmailJS] Auto-reply failed:', err);
        });



        // ── Wait for both to complete ──
        Promise.all([web3Promise, emailjsPromise])
        .then(function(results) {
            var web3Result = results[0];
            if (web3Result.success) {
                apptForm.style.display = 'none';
                if (successMsg) successMsg.style.display = 'flex';
            } else {
                throw new Error(web3Result.message || 'Submission failed');
            }
        })
        .catch(function(error) {
            console.error('Submission error:', error);
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

 
  /* ─────────────────────────────────────────
   GALLERY FILTERS
───────────────────────────────────────── */
function initGallery() {
  const filterBtns   = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('#galleryGrid .gallery-item');
  const galleryEmpty = document.getElementById('galleryEmpty');

  if (!filterBtns.length || !galleryItems.length) return;

  // Reset to "All" state
  filterBtns.forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
  if (allBtn) {
    allBtn.classList.add('active');
    allBtn.setAttribute('aria-selected', 'true');
  }
  galleryItems.forEach(item => {
    item.style.display = '';
    item.classList.remove('hidden');
  });
  if (galleryEmpty) galleryEmpty.style.display = 'none';

  // Clone buttons to clear any stale listeners
  filterBtns.forEach(btn => {
    const fresh = btn.cloneNode(true);
    btn.parentNode.replaceChild(fresh, btn);
  });

  // Re-query after cloning
  const freshBtns = document.querySelectorAll('.filter-btn');

  freshBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      freshBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;
      let visible = 0;

      galleryItems.forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter;
        if (match) {
          item.style.display = '';
          item.classList.remove('hidden');
          item.style.animationDelay = (visible * 0.04) + 's';
          visible++;
        } else {
          item.style.display = 'none';
          item.classList.add('hidden');
        }
      });

      if (galleryEmpty) {
        galleryEmpty.style.display = visible === 0 ? 'block' : 'none';
      }
    });
  });
}

// Initialise on page load — gallery is always visible inline
document.addEventListener('DOMContentLoaded', function() {
  initGallery();
});

/* ─────────────────────────────────────────
   GALLERY MODAL
   (kept for nav link + mobile menu close)
───────────────────────────────────────── */
const galleryNavLink    = document.getElementById('galleryNavLink');
const galleryModalClose = document.getElementById('galleryModalClose');

// Gallery is inline — scroll to it when nav link is clicked
if (galleryNavLink) {
  galleryNavLink.addEventListener('click', function(e) {
    e.preventDefault();
    const gallerySection = document.getElementById('gallery') || document.getElementById('galleryGrid');
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: 'smooth' });
    }
    // Close mobile menu if open
    if (typeof navMenu !== 'undefined') navMenu.classList.remove('open');
    if (typeof hamburger !== 'undefined') {
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
}

// Close button (hide it or scroll back up)
if (galleryModalClose) {
  galleryModalClose.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ─────────────────────────────────────────
   PHOTO LIGHTBOX
───────────────────────────────────────── */
const photoLightbox = document.getElementById('photoLightbox');
const lbImg         = document.getElementById('lbImg');
const lbTitle       = document.getElementById('lbTitle');
const lbCat         = document.getElementById('lbCat');
const lbCounter     = document.getElementById('lbCounter');

let currentIndex = 0;
let visibleItems = [];

function getVisible() {
  return [...document.querySelectorAll('#galleryGrid .gallery-item')]
    .filter(i => !i.classList.contains('hidden') && i.style.display !== 'none');
}

function showSlide(index) {
  const item = visibleItems[index];
  lbImg.src  = item.querySelector('img').src;
  lbImg.alt  = item.querySelector('img').alt;
  lbTitle.textContent = item.dataset.label;
  lbCat.textContent   = item.dataset.category.toUpperCase();
  lbCounter.textContent = `${index + 1} / ${visibleItems.length}`;
}

function openLightbox(index) {
  visibleItems = getVisible();
  currentIndex = index;
  showSlide(currentIndex);
  photoLightbox.classList.add('open');
  document.getElementById('lbClose').focus();
}

function closeLightbox() {
  photoLightbox.classList.remove('open');
}

// Delegated click — works even after filter re-renders
document.getElementById('galleryGrid').addEventListener('click', e => {
  const item = e.target.closest('.gallery-item');
  if (!item) return;
  visibleItems = getVisible();
  const idx = visibleItems.indexOf(item);
  if (idx !== -1) openLightbox(idx);
});

document.getElementById('galleryGrid').addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    const item = e.target.closest('.gallery-item');
    if (item) { e.preventDefault(); item.click(); }
  }
});

document.getElementById('lbClose').addEventListener('click', closeLightbox);
document.getElementById('lbPrev').addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
  showSlide(currentIndex);
});
document.getElementById('lbNext').addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % visibleItems.length;
  showSlide(currentIndex);
});
photoLightbox.addEventListener('click', e => {
  if (e.target === photoLightbox) closeLightbox();
});

/* ─────────────────────────────────────────
   KEYBOARD NAVIGATION
───────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (photoLightbox.classList.contains('open')) { closeLightbox(); return; }
    // Close any open dropdowns
    if (typeof dropdowns !== 'undefined') {
      dropdowns.forEach(dd => {
        dd.classList.remove('open');
        dd.querySelector('.nav-link-dropdown').setAttribute('aria-expanded', 'false');
      });
    }
  }
  if (!photoLightbox.classList.contains('open')) return;
  if (e.key === 'ArrowLeft') {
    currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
    showSlide(currentIndex);
  }
  if (e.key === 'ArrowRight') {
    currentIndex = (currentIndex + 1) % visibleItems.length;
    showSlide(currentIndex);
  }
});

  /* ── KEYBOARD ── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (photoLightbox.classList.contains('open')) { closeLightbox(); return; }
      if (galleryModal.classList.contains('open'))  { closeGalleryModal(); return; }
      dropdowns.forEach(dd => { dd.classList.remove('open'); dd.querySelector('.nav-link-dropdown').setAttribute('aria-expanded','false'); });
    }
    if (!photoLightbox.classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  { currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length; showSlide(currentIndex); }
    if (e.key === 'ArrowRight') { currentIndex = (currentIndex + 1) % visibleItems.length; showSlide(currentIndex); }
  });

  /* ── SCROLL SPY ── */
  const sections = document.querySelectorAll('section[id], div[id]');
  const navLinks  = document.querySelectorAll('.nav-link[data-section]');
  const spyObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.toggle('active', link.dataset.section === entry.target.id));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => spyObserver.observe(s));

  /* Patient Section */
  // FAQ toggle
function toggleFaq(el) {
  el.classList.toggle('open');
  const ans = el.nextElementSibling;
  ans.classList.toggle('open');
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
