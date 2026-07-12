/* ══════════════════════════════════════════════════════════════
   LIMURU NURSING HOME — SHARED SITE SCRIPT
   Loaded on every page. Each block below guards itself so it
   only runs when the elements it needs actually exist on the
   current page — safe to share across index/about/services/
   team/patients/gallery/careers/contact.
══════════════════════════════════════════════════════════════ */

/* ── 1. HIGHLIGHT ACTIVE NAV LINK (per page) ── */
(function highlightActiveNav() {
  const page = document.body.dataset.page;
  if (!page) return;
  document.querySelectorAll('.nav-link[data-page], .nav-link-dropdown[data-page]').forEach(link => {
    if (link.dataset.page === page) link.classList.add('active');
  });
})();

/* ── 2. HAMBURGER MENU ── */
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('navMenu');
if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });
}

/* ── 3. DROPDOWN MENUS ── */
const dropdowns = document.querySelectorAll('.nav-dropdown');
dropdowns.forEach(dd => {
  const trigger = dd.querySelector('.nav-link-dropdown');
  if (!trigger) return;
  trigger.addEventListener('click', (e) => {
    if (window.innerWidth <= 900) e.preventDefault();
    const isOpen = dd.classList.toggle('open');
    trigger.setAttribute('aria-expanded', isOpen);
    dropdowns.forEach(other => {
      if (other !== dd) {
        other.classList.remove('open');
        const t = other.querySelector('.nav-link-dropdown');
        if (t) t.setAttribute('aria-expanded', 'false');
      }
    });
  });
});
document.addEventListener('click', e => {
  if (!e.target.closest('.nav-dropdown')) {
    dropdowns.forEach(dd => {
      dd.classList.remove('open');
      const t = dd.querySelector('.nav-link-dropdown');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  }
});

function closeNavMenus() {
  document.querySelectorAll('.nav-dropdown.open').forEach(dd => {
    dd.classList.remove('open');
    const t = dd.querySelector('.nav-link-dropdown');
    if (t) t.setAttribute('aria-expanded', 'false');
  });
  if (navMenu && navMenu.classList.contains('open')) {
    navMenu.classList.remove('open');
    if (hamburger) {
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  }
}

// Close the mobile menu whenever a link that actually navigates away is used.
// Dropdown triggers (.nav-link-dropdown) are excluded on purpose: on mobile they
// only toggle their sub-panel open/closed (see section 3 above) and don't navigate,
// so closing the whole menu here would immediately undo that same-click toggle.
document.querySelectorAll('.nav-link, .dp-link').forEach(link => {
  link.addEventListener('click', closeNavMenus);
});

/* ══════════════════════════════════════════
   ── BOOK APPOINTMENT BUTTON (home page only) ──
   Other pages just link to index.html#appointment
   and the DOMContentLoaded handler below opens it.
══════════════════════════════════════════ */
const bookBtn           = document.getElementById('bookBtn');
const appointmentSec    = document.getElementById('appointment');
const dpBookAppointment = document.getElementById('dpBookAppointment');

function openAppointmentSection() {
  if (!appointmentSec) return;
  appointmentSec.style.display = 'block';
  setTimeout(function () {
    appointmentSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 50);
}

if (bookBtn) {
  bookBtn.addEventListener('click', openAppointmentSection);
}

if (dpBookAppointment) {
  dpBookAppointment.addEventListener('click', function (e) {
    // Only intercept if the appointment section is on THIS page (index.html).
    // On every other page this link just navigates to index.html#appointment.
    if (appointmentSec) {
      e.preventDefault();
      closeNavMenus();
      openAppointmentSection();
    }
  });
}

/* ══════════════════════════════════════════
   ── CROSS-SECTION / CROSS-PAGE JUMP LINKS ──
   service-jump-link / team-jump-link / patient-jump-link now
   point to "page.html#id". If the target id exists on the
   CURRENT page we smooth-scroll + highlight it via JS.
   Otherwise we let the browser navigate to the other page
   normally (the hash handler below then highlights it there).
══════════════════════════════════════════ */
function jumpToCard(targetId) {
  const card = document.getElementById(targetId);
  if (!card) return;
  closeNavMenus();
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  card.classList.remove('highlight');
  void card.offsetWidth;
  card.classList.add('highlight');
  setTimeout(function () { card.classList.remove('highlight'); }, 1600);
}

document.querySelectorAll('.service-jump-link, .team-jump-link, .patient-jump-link').forEach(function (link) {
  link.addEventListener('click', function (e) {
    const href = link.getAttribute('href') || '';
    const targetId = href.split('#')[1];
    if (!targetId) return;
    if (document.getElementById(targetId)) {
      e.preventDefault();
      jumpToCard(targetId);
    }
    // else: target lives on another page — allow normal navigation
  });
});

// On page load: if we arrived with a #hash (from another page, or a
// bookmark), reveal/scroll/highlight the right thing.
window.addEventListener('DOMContentLoaded', function () {
  const hash = window.location.hash.slice(1);
  if (!hash) return;

  // Appointment section is hidden by default — reveal it if that's the target
  if (hash === 'appointment' && appointmentSec) {
    openAppointmentSection();
    return;
  }

  const target = document.getElementById(hash);
  if (target && target.matches('.service-card, .team-card, .info-card, .ins-pill')) {
    setTimeout(function () { jumpToCard(hash); }, 300);
  }
});

/* ══════════════════════════════════════════
   ── APPOINTMENT FORM (index.html only) ──
   Web3Forms  → info@limurunursinghome.co.ke
   EmailJS    → Auto-reply to patient
══════════════════════════════════════════ */
const apptForm = document.getElementById('appointmentForm');

if (apptForm) {
  const WEB3FORMS_KEY    = 'ad7c24f9-97ce-45d4-80cf-020a49a083d8';
  const EMAILJS_SERVICE  = 'service_4ccr09k';
  const EMAILJS_TEMPLATE = 'template_iq0e1wv';
  const EMAILJS_KEY      = 'c_3Oz16kdD65mwja-';

  /* ── FIREBASE (slot-locking backend) ──
     Replace with YOUR OWN project config from:
     Firebase Console → Project Settings → General → Your apps → SDK setup
     Firestore must be enabled (Native mode) with the security rules from
     the SETUP notes provided alongside this file. */
  const firebaseConfig = {
    apiKey:            "REPLACE_WITH_YOUR_API_KEY",
    authDomain:        "REPLACE_WITH_YOUR_PROJECT.firebaseapp.com",
    projectId:         "REPLACE_WITH_YOUR_PROJECT_ID",
    storageBucket:     "REPLACE_WITH_YOUR_PROJECT.appspot.com",
    messagingSenderId: "REPLACE_WITH_YOUR_SENDER_ID",
    appId:             "REPLACE_WITH_YOUR_APP_ID"
  };

  let db = null;
  try {
    if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== 'REPLACE_WITH_YOUR_API_KEY') {
      firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
    } else {
      console.warn('[Booking] Firebase not configured — slot-locking is disabled. See script.js comments.');
    }
  } catch (err) {
    console.error('[Booking] Firebase init failed:', err);
  }

  // Turns a date + service + time into a safe, unique Firestore doc ID.
  // Slots are scoped PER SERVICE, so two different services can share the same time.
  function slotDocId(date, service, time) {
    const clean = s => String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return clean(date) + '__' + clean(service) + '__' + clean(time);
  }

  const successMsg = document.getElementById('apptSuccess');
  const newApptBtn = document.getElementById('newApptBtn');
  const dateInput  = document.getElementById('apptDate');
  const serviceSelect = document.getElementById('service');
  const timeSelect = document.getElementById('apptTime');

  // Set minimum date = today
  if (dateInput) {
    dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);
  }

  // Cache each time <option>'s original label so we can restore it after re-enabling.
  if (timeSelect) {
    timeSelect.querySelectorAll('option').forEach(opt => {
      if (opt.value) opt.dataset.baseLabel = opt.textContent;
    });
  }

  // Re-checks Firestore for the currently selected date + service and disables
  // any time slots already taken. Runs on load, and whenever date/service changes.
  async function refreshTimeSlotAvailability() {
    if (!db || !timeSelect || !dateInput || !serviceSelect) return;
    const date = dateInput.value;
    const service = serviceSelect.value;
    if (!date || !service) return;

    const options = Array.from(timeSelect.querySelectorAll('option[value]:not([value=""])'));
    // Reset to available while we check, so stale disables don't linger.
    options.forEach(opt => {
      opt.disabled = false;
      opt.textContent = opt.dataset.baseLabel || opt.textContent;
    });

    try {
      const snap = await db.collection('bookings')
        .where('date', '==', date)
        .where('service', '==', service)
        .get();
      const takenTimes = new Set(snap.docs.map(d => d.data().time));
      options.forEach(opt => {
        if (takenTimes.has(opt.value)) {
          opt.disabled = true;
          opt.textContent = (opt.dataset.baseLabel || opt.textContent) + ' — Already booked';
          if (timeSelect.value === opt.value) timeSelect.value = '';
        }
      });
    } catch (err) {
      console.error('[Booking] Could not check slot availability:', err);
    }
  }

  if (dateInput)     dateInput.addEventListener('change', refreshTimeSlotAvailability);
  if (serviceSelect) serviceSelect.addEventListener('change', refreshTimeSlotAvailability);

  // Inline field error helper — replaces alert() for better UX
  function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errEl = document.getElementById('err-' + fieldId);
    if (field) field.classList.add('invalid');
    if (errEl) errEl.textContent = message;
  }
  function clearFieldErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-group input.invalid, .form-group select.invalid').forEach(el => el.classList.remove('invalid'));
  }

  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_KEY);
  }

  apptForm.addEventListener('submit', function (e) {
    e.preventDefault();
    clearFieldErrors();

    const name    = document.getElementById('fullName').value.trim();
    const phone   = document.getElementById('phone').value.trim();
    const email   = document.getElementById('email').value.trim();
    const service = document.getElementById('service').value;
    const date    = document.getElementById('apptDate').value;
    const time    = document.getElementById('apptTime').value;
    const notes   = document.getElementById('notes').value.trim() || 'None';

    // Format date from yyyy-mm-dd to dd/mm/yyyy
    const formattedDate = (function (d) {
      const parts = d.split('-');
      return parts[2] + '/' + parts[1] + '/' + parts[0];
    })(date || '--');

    // Inline validation — no more alert()
    let hasError = false;
    if (!name)    { showFieldError('fullName', 'Full name is required.'); hasError = true; }
    if (!phone)   { showFieldError('phone', 'Phone number is required.'); hasError = true; }
    if (!email)   { showFieldError('email', 'Email is required for your confirmation.'); hasError = true; }
    if (!service) { showFieldError('service', 'Please select a service.'); hasError = true; }
    if (!date)    { showFieldError('apptDate', 'Please select a date.'); hasError = true; }
    if (!time)    { showFieldError('apptTime', 'Please select a time.'); hasError = true; }
    if (hasError) return;

    const btn = apptForm.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Checking availability…'; }

    // STEP 0: Atomically claim the slot before doing anything else.
    // This is what actually prevents two patients from booking the same
    // date + service + time, even if they submit at the exact same moment:
    // Firestore transactions are serialized on the server, so whichever
    // request reaches Firestore first wins the slot and the second one
    // is rejected and asked to pick another time — no double-booking.
    function claimSlot() {
      if (!db) return Promise.resolve(); // Firebase not configured — booking proceeds unguarded.
      const slotId = slotDocId(date, service, time);
      const slotRef = db.collection('bookings').doc(slotId);
      return db.runTransaction(function (tx) {
        return tx.get(slotRef).then(function (doc) {
          if (doc.exists) {
            throw new Error('SLOT_TAKEN');
          }
          tx.set(slotRef, {
            date: date,
            service: service,
            time: time,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        });
      });
    }

    // Runs once the slot has been safely claimed in Firestore (or immediately,
    // if Firebase isn't configured). Sends the actual notifications.
    function submitAppointment() {
      if (btn) { btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…'; }

      // STEP 1: Notify nursing home via Web3Forms
      const web3Promise = fetch('https://api.web3forms.com/submit', {
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
        .then(res => res.json())
        .catch(err => { console.error('Web3Forms failed:', err); throw err; });

      // STEP 2: Auto-reply to patient via EmailJS
      const emailjsPromise = (typeof emailjs !== 'undefined')
        ? emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
            to_email:     email,
            to_name:      name,
            from_name:    'Limuru Nursing Home',
            reply_to:     email,
            message:      "Thank you for reaching out! We'll confirm your appointment within 24 hours.",
            appt_service: service,
            appt_date:    formattedDate,
            appt_time:    time,
          })
          .then(res => { console.log('[EmailJS] Auto-reply sent to', email, '| Status:', res.status); return res; })
          .catch(err => { console.error('[EmailJS] Auto-reply failed (non-critical):', err); })
        : Promise.resolve();

      Promise.all([web3Promise, emailjsPromise])
        .then(function (results) {
          const web3Result = results[0];
          if (web3Result && web3Result.success) {
            apptForm.style.display = 'none';
            if (successMsg) successMsg.style.display = 'flex';
          } else {
            throw new Error((web3Result && web3Result.message) || 'Submission failed');
          }
        })
        .catch(function (error) {
          console.error('Submission error:', error);
          // The time slot is already reserved in Firestore at this point, so we
          // must NOT invite the patient to "try again" — resubmitting would
          // just hit SLOT_TAKEN against their own reservation. Instead, let them
          // know the slot is secured and ask them to confirm by phone.
          const errEl = document.createElement('p');
          errEl.style.cssText = 'color:#e74c3c;font-size:13px;font-weight:600;margin-top:8px;text-align:center;';
          errEl.textContent = 'Your time slot is reserved, but we could not send the confirmation message. ' +
            'Please call +254 720 519 777 or +254 708 244 911 to confirm your appointment.';
          const existingErr = apptForm.querySelector('.submit-error');
          if (existingErr) existingErr.remove();
          errEl.className = 'submit-error';
          if (btn) btn.parentNode.insertBefore(errEl, btn.nextSibling);
          if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Slot Reserved'; }
        });
    }

    claimSlot()
      .then(submitAppointment)
      .catch(function (err) {
        if (err && err.message === 'SLOT_TAKEN') {
          showFieldError('apptTime', 'Sorry — that time was just booked by someone else. Please pick a different time.');
          refreshTimeSlotAvailability();
        } else {
          console.error('[Booking] Slot claim failed:', err);
          showFieldError('apptTime', 'Could not verify slot availability. Please try again.');
        }
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit Appointment Request'; }
      });
  });

  // Reset form for another booking
  if (newApptBtn) {
    newApptBtn.addEventListener('click', function () {
      apptForm.reset();
      clearFieldErrors();
      apptForm.style.display = 'flex';
      if (successMsg) successMsg.style.display = 'none';
      const btn = apptForm.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit Appointment Request'; }
      if (timeSelect) {
        timeSelect.querySelectorAll('option[value]:not([value=""])').forEach(opt => {
          opt.disabled = false;
          opt.textContent = opt.dataset.baseLabel || opt.textContent;
        });
      }
    });
  }
}

/* ─────────────────────────────────────────
   GALLERY FILTERS + LIGHTBOX (gallery.html only)
───────────────────────────────────────── */
const galleryGrid = document.getElementById('galleryGrid');

if (galleryGrid) {
  (function initGallery() {
    const filterBtns   = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('#galleryGrid .gallery-item');
    const galleryEmpty = document.getElementById('galleryEmpty');

    if (!filterBtns.length || !galleryItems.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
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
  })();

  /* ── Lightbox ── */
  const photoLightbox = document.getElementById('photoLightbox');
  const lbImg         = document.getElementById('lbImg');
  const lbTitle       = document.getElementById('lbTitle');
  const lbCat         = document.getElementById('lbCat');
  const lbCounter     = document.getElementById('lbCounter');
  const lbClose       = document.getElementById('lbClose');
  const lbPrev        = document.getElementById('lbPrev');
  const lbNext        = document.getElementById('lbNext');

  let currentIndex = 0;
  let visibleItems = [];

  function getVisible() {
    return [...document.querySelectorAll('#galleryGrid .gallery-item')]
      .filter(i => !i.classList.contains('hidden') && i.style.display !== 'none');
  }

  function showSlide(index) {
    const item = visibleItems[index];
    if (!item) return;
    const img = item.querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbTitle.textContent = item.dataset.label;
    lbCat.textContent   = (item.dataset.category || '').toUpperCase();
    lbCounter.textContent = `${index + 1} / ${visibleItems.length}`;
  }

  function openLightbox(index) {
    visibleItems = getVisible();
    currentIndex = index;
    showSlide(currentIndex);
    photoLightbox.classList.add('open');
    if (lbClose) lbClose.focus();
  }

  function closeLightbox() {
    photoLightbox.classList.remove('open');
  }

  galleryGrid.addEventListener('click', e => {
    const item = e.target.closest('.gallery-item');
    if (!item) return;
    visibleItems = getVisible();
    const idx = visibleItems.indexOf(item);
    if (idx !== -1) openLightbox(idx);
  });

  galleryGrid.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const item = e.target.closest('.gallery-item');
      if (item) { e.preventDefault(); item.click(); }
    }
  });

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev) lbPrev.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
    showSlide(currentIndex);
  });
  if (lbNext) lbNext.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % visibleItems.length;
    showSlide(currentIndex);
  });
  if (photoLightbox) {
    photoLightbox.addEventListener('click', e => {
      if (e.target === photoLightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && photoLightbox && photoLightbox.classList.contains('open')) {
      closeLightbox();
      return;
    }
    if (!photoLightbox || !photoLightbox.classList.contains('open')) return;
    if (e.key === 'ArrowLeft') {
      currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
      showSlide(currentIndex);
    }
    if (e.key === 'ArrowRight') {
      currentIndex = (currentIndex + 1) % visibleItems.length;
      showSlide(currentIndex);
    }
  });
}

/* ── ESCAPE KEY CLOSES OPEN DROPDOWNS (any page) ── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    dropdowns.forEach(dd => {
      dd.classList.remove('open');
      const t = dd.querySelector('.nav-link-dropdown');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  }
});

/* ─────────────────────────────────────────
   PATIENTS PAGE — FAQ TOGGLE (patients.html only)
   Called inline via onclick="toggleFaq(this)"
───────────────────────────────────────── */
function toggleFaq(el) {
  el.classList.toggle('open');
  const ans = el.nextElementSibling;
  if (ans) ans.classList.toggle('open');
}

/* ══════════════════════════════════════════
   ── BACK TO TOP BUTTON (every page) ──
══════════════════════════════════════════ */
const backToTop = document.getElementById('backToTop');

if (backToTop) {
  window.addEventListener('scroll', function () {
    backToTop.classList.toggle('visible', window.scrollY > 450);
  }, { passive: true });

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ══════════════════════════════════════════
   ── CAREERS SYSTEM (careers.html only) ──
══════════════════════════════════════════ */
if (document.getElementById('careersGrid')) {
  (function () {
    /* ── Supabase connection (public, read-only via Row Level Security) ── */
    const SUPABASE_URL = 'https://egoyohycsuzitnexaeus.supabase.co';       // e.g. https://xxxxx.supabase.co
    const SUPABASE_ANON_KEY = 'sb_publishable_0ybYQqHOMHCH2b-yPvbJZA_9-ceNGMl';     // safe to expose client-side

    /* ── Web3Forms key for the "Apply Now" application submission form.
       Unrelated to the listings data above — left exactly as-is. ── */
    const CAREERS_WEB3_KEY = 'ad7c24f9-97ce-45d4-80cf-020a49a083d8';

    /* ── Fallback seed listings — used ONLY if Supabase can't be reached
       (e.g. offline, first load before setup). Real edits happen in the
       admin panel and are stored in Supabase, not here. ── */
    const DEFAULT_OPPORTUNITIES = [
      {
        id: 1, type: 'job', title: 'Registered Nurse (RN)',
        dept: 'Nursing', location: 'Limuru, Kiambu', time: 'Full-time',
        deadline: '30 Jun 2026',
        desc: 'Provide direct patient care, administer medications and coordinate with physicians in our inpatient ward. Must be registered with the Nursing Council of Kenya.',
        reqs: ['NCK certificate', '2+ years clinical experience', 'BCLS/ACLS certified']
      },
      {
        id: 2, type: 'job', title: 'Clinical Officer',
        dept: 'Clinical', location: 'Limuru, Kiambu', time: 'Full-time',
        deadline: '15 Jul 2026',
        desc: 'Diagnose and manage patients in the outpatient department, conduct ward rounds and support the medical team in delivering quality care.',
        reqs: ['Diploma in Clinical Medicine', 'Licensed by KMPDB', 'Good interpersonal skills']
      },
      {
        id: 3, type: 'job', title: 'Caregiver / Nurse Aide',
        dept: 'Nursing', location: 'Limuru, Kiambu', time: 'Full-time',
        deadline: '20 Jun 2026',
        desc: 'Assist elderly and bedridden patients with daily living activities, personal hygiene, feeding and mobility in a compassionate and respectful manner.',
        reqs: ['Certificate in Community Health', 'Experience in elderly care preferred', 'Patient and empathetic']
      },
      {
        id: 4, type: 'intern', title: 'Pharmacy Internship',
        dept: 'Pharmacy', location: 'Limuru, Kiambu', time: '3 Months',
        deadline: '10 Jul 2026',
        desc: 'Gain hands-on experience in dispensing, inventory management and patient counselling under the supervision of a licensed pharmacist.',
        reqs: ['Pursuing a degree/diploma in Pharmacy', 'Available for 3 months', 'Good attention to detail']
      },
      {
        id: 5, type: 'intern', title: 'Medical Records & IT Internship',
        dept: 'Administration', location: 'Limuru, Kiambu', time: '3 Months',
        deadline: '25 Jun 2026',
        desc: 'Support digitisation of patient records, assist with health information systems and ensure data accuracy and confidentiality.',
        reqs: ['IT or Health Informatics background', 'Proficient in MS Office', 'Organised and detail-oriented']
      },
      {
        id: 6, type: 'attach', title: 'Nursing Student Attachment',
        dept: 'Nursing', location: 'Limuru, Kiambu', time: '4–8 Weeks',
        deadline: 'Rolling',
        desc: 'Open to nursing students from accredited colleges seeking clinical attachment hours. Rotate across wards including maternity, general and elderly care.',
        reqs: ['Enrolled in an accredited nursing programme', 'Introduction letter from institution', 'NHIF & personal insurance required']
      }
    ];

    /* ── Load published opportunities from Supabase (falls back to
       defaults if the request fails, so the page never shows empty) ── */
    let opportunities = DEFAULT_OPPORTUNITIES.slice();
    let activeTab = 'all';

    async function loadOpportunities() {
      try {
        const res = await fetch(
          SUPABASE_URL + '/rest/v1/careers_listings?select=*&published=eq.true&order=sort_order.asc',
          { headers: { apikey: SUPABASE_ANON_KEY, Authorization: 'Bearer ' + SUPABASE_ANON_KEY } }
        );
        if (!res.ok) throw new Error('Supabase request failed: ' + res.status);
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          opportunities = rows.map(r => ({
            id: r.id, type: r.type, title: r.title, dept: r.dept,
            location: r.location, time: r.time, deadline: r.deadline,
            desc: r.description, reqs: r.requirements || []
          }));
        }
      } catch (e) {
        console.warn('Could not load live listings, showing fallback:', e);
      }
      updateCounts();
      renderCareers();
    }

    function getBadgeClass(type) {
      return type === 'job' ? 'badge-job' : type === 'intern' ? 'badge-intern' : 'badge-attach';
    }
    function getBadgeLabel(type) {
      return type === 'job' ? '<i class="fa-solid fa-hospital-user"></i> Job Offer'
        : type === 'intern' ? '<i class="fa-solid fa-graduation-cap"></i> Internship'
        : '<i class="fa-solid fa-certificate"></i> Attachment';
    }

    function updateCounts() {
      const elAll = document.getElementById('ct-all');
      const elJob = document.getElementById('ct-job');
      const elIntern = document.getElementById('ct-intern');
      const elAttach = document.getElementById('ct-attach');
      if (elAll) elAll.textContent    = opportunities.length;
      if (elJob) elJob.textContent    = opportunities.filter(o => o.type === 'job').length;
      if (elIntern) elIntern.textContent = opportunities.filter(o => o.type === 'intern').length;
      if (elAttach) elAttach.textContent = opportunities.filter(o => o.type === 'attach').length;
    }

    function renderCareers() {
      const list = activeTab === 'all' ? opportunities : opportunities.filter(o => o.type === activeTab);
      const grid  = document.getElementById('careersGrid');
      const empty = document.getElementById('careersEmpty');
      if (!grid) return;

      if (!list.length) {
        grid.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
      }
      if (empty) empty.style.display = 'none';

      grid.innerHTML = list.map(o =>
        '<div class="career-card">' +
          '<span class="career-type-badge ' + getBadgeClass(o.type) + '">' + getBadgeLabel(o.type) + '</span>' +
          '<h3>' + o.title + '</h3>' +
          '<div class="career-meta">' +
            '<span><i class="fa-solid fa-building-columns"></i>' + o.dept + '</span>' +
            '<span><i class="fa-solid fa-location-dot"></i>' + o.location + '</span>' +
            '<span><i class="fa-solid fa-clock"></i>' + o.time + '</span>' +
          '</div>' +
          '<p>' + o.desc + '</p>' +
          '<div class="career-card-footer">' +
            '<div class="career-deadline">Deadline: <strong>' + o.deadline + '</strong></div>' +
            '<button class="career-apply-btn" data-id="' + o.id + '">' +
              '<i class="fa-solid fa-paper-plane"></i> Apply Now' +
            '</button>' +
          '</div>' +
        '</div>'
      ).join('');

      grid.querySelectorAll('.career-apply-btn').forEach(btn => {
        btn.addEventListener('click', function () {
          openCareersModal(parseInt(this.dataset.id));
        });
      });
    }

    // Tab switching
    document.querySelectorAll('.career-tab').forEach(tab => {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.career-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');
        activeTab = this.dataset.tab;
        renderCareers();
      });
    });

    /* ── Modal ── */
    function openCareersModal(id) {
      const o = opportunities.find(x => x.id === id);
      if (!o) return;

      document.getElementById('careersModalTitle').textContent = o.title;
      document.getElementById('careersModalMeta').textContent = (o.type === 'job' ? 'Job Offer' : o.type === 'intern' ? 'Internship' : 'Attachment') + ' · ' + o.dept + ' · ' + o.time;

      const introField = o.type === 'attach' ? (
        '<div class="careers-form-group full">' +
          '<label>Upload Institution Introduction Letter *</label>' +
          '<div class="careers-upload-zone" id="introZone">' +
            '<input type="file" id="careers-intro" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onchange="careersFileChosen(\'careers-intro\',\'intro-fname\')">' +
            '<i class="fa-solid fa-file-certificate"></i>' +
            '<p><strong>Click to upload</strong> your institution letter</p>' +
            '<p>PDF, DOC, Image — max 5MB</p>' +
            '<p class="careers-file-name" id="intro-fname"></p>' +
          '</div>' +
        '</div>'
      ) : '';

      document.getElementById('careersModalBody').innerHTML =
        '<div class="careers-modal-body">' +
          '<p style="font-size:0.85rem;color:var(--gray-600);line-height:1.65;margin-bottom:1rem;">' + o.desc + '</p>' +
          '<p style="font-size:0.8rem;font-weight:700;color:var(--navy);margin-bottom:6px;">Requirements:</p>' +
          '<ul style="padding-left:1.1rem;font-size:0.82rem;color:var(--gray-600);line-height:1.9;margin-bottom:1.25rem;">' +
            o.reqs.map(r => '<li>' + r + '</li>').join('') +
          '</ul>' +
          '<hr style="border:none;border-top:1px solid var(--gray-200);margin-bottom:1.25rem;">' +
          '<p style="font-size:0.9rem;font-weight:700;color:var(--teal);margin-bottom:1rem;">Your Application</p>' +
          '<div class="careers-form-row">' +
            '<div class="careers-form-group"><label>Full Name *</label><input type="text" id="careers-name" placeholder="Jane Wanjiku" autocomplete="name"></div>' +
            '<div class="careers-form-group"><label>Email Address *</label><input type="email" id="careers-email" placeholder="jane@email.com" autocomplete="email"></div>' +
          '</div>' +
          '<div class="careers-form-row">' +
            '<div class="careers-form-group"><label>Phone Number *</label><input type="tel" id="careers-phone" placeholder="+254 7XX XXX XXX" autocomplete="tel"></div>' +
            '<div class="careers-form-group"><label>Highest Qualification *</label>' +
              '<select id="careers-qual"><option value="">Select...</option><option>Certificate</option><option>Diploma</option><option>Bachelor\'s Degree</option><option>Postgraduate</option></select>' +
            '</div>' +
          '</div>' +
          '<div class="careers-form-row careers-form-group full" style="grid-template-columns:1fr;margin-bottom:14px;">' +
            '<label>Cover Letter / Motivation</label>' +
            '<textarea id="careers-cover" placeholder="Tell us why you\'d like to join Limuru Nursing Home and what you bring to this role..."></textarea>' +
          '</div>' +
          '<div class="careers-form-group full" style="margin-bottom:14px;">' +
            '<label>Upload CV / Resume *</label>' +
            '<div class="careers-upload-zone">' +
              '<input type="file" id="careers-cv" accept=".pdf,.doc,.docx" onchange="careersFileChosen(\'careers-cv\',\'cv-fname\')">' +
              '<i class="fa-solid fa-file-arrow-up"></i>' +
              '<p><strong>Click to upload</strong> or drag & drop</p>' +
              '<p>PDF, DOC, DOCX — max 5MB</p>' +
              '<p class="careers-file-name" id="cv-fname"></p>' +
            '</div>' +
          '</div>' +
          introField +
        '</div>' +
        '<div class="careers-modal-footer">' +
          '<button class="careers-cancel-btn" id="careersCancelBtn">Cancel</button>' +
          '<button class="careers-submit-btn" id="careersSubmitBtn" data-id="' + o.id + '">' +
            '<i class="fa-solid fa-paper-plane"></i> Submit Application' +
          '</button>' +
        '</div>';

      document.getElementById('careersCancelBtn').addEventListener('click', closeCareersModal);
      document.getElementById('careersSubmitBtn').addEventListener('click', function () {
        submitCareersApp(o);
      });

      document.getElementById('careersModalOverlay').classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    window.careersFileChosen = function (inputId, labelId) {
      const f = document.getElementById(inputId);
      const label = document.getElementById(labelId);
      if (f && f.files[0] && label) {
        label.innerHTML = '<i class="fa-solid fa-circle-check" style="color:var(--teal)"></i> ' + f.files[0].name;
      }
    };

    function closeCareersModal() {
      document.getElementById('careersModalOverlay').classList.remove('open');
      document.body.style.overflow = '';
    }

    function submitCareersApp(o) {
      const name  = (document.getElementById('careers-name')  || {}).value || '';
      const email = (document.getElementById('careers-email') || {}).value || '';
      const phone = (document.getElementById('careers-phone') || {}).value || '';
      const qual  = (document.getElementById('careers-qual')  || {}).value || '';
      const cover = (document.getElementById('careers-cover') || {}).value || '';
      const cvFile = document.getElementById('careers-cv');

      const nameTrim = name.trim(), emailTrim = email.trim(), phoneTrim = phone.trim();

      if (!nameTrim || !emailTrim || !phoneTrim || !qual || !cvFile || !cvFile.files[0]) {
        const existingErr = document.querySelector('.careers-form-error');
        if (existingErr) existingErr.remove();
        const errMsg = document.createElement('p');
        errMsg.className = 'careers-form-error';
        errMsg.style.cssText = 'color:#e74c3c;font-size:13px;font-weight:600;padding:8px 1.5rem;text-align:center;';
        errMsg.textContent = 'Please fill in all required fields and upload your CV.';
        document.getElementById('careersModalBody').prepend(errMsg);
        return;
      }

      const submitBtn = document.getElementById('careersSubmitBtn');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…'; }

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: CAREERS_WEB3_KEY,
          subject: 'Career Application – ' + o.title + ' | Limuru Nursing Home',
          'Position': o.title,
          'Type': o.type === 'job' ? 'Job Offer' : o.type === 'intern' ? 'Internship' : 'Attachment',
          'Department': o.dept,
          'Applicant Name': nameTrim,
          'Email': emailTrim,
          'Phone': phoneTrim,
          'Qualification': qual,
          'Cover Letter': cover || 'Not provided'
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            showCareersSuccess(nameTrim, o.title, emailTrim);
          } else {
            throw new Error(data.message || 'Submission failed');
          }
        })
        .catch(err => {
          console.error('Career form error:', err);
          if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit Application'; }
          const errMsg = document.createElement('p');
          errMsg.style.cssText = 'color:#e74c3c;font-size:13px;font-weight:600;padding:8px 1.5rem;text-align:center;';
          errMsg.textContent = 'Failed to send. Please email info@limurunursinghome.co.ke or call +254 720 519 777.';
          document.getElementById('careersModalBody').prepend(errMsg);
        });
    }

    function showCareersSuccess(name, title, email) {
      document.getElementById('careersModalBody').innerHTML =
        '<div class="careers-success">' +
          '<div class="careers-success-icon"><i class="fa-solid fa-circle-check"></i></div>' +
          '<h3>Application Submitted!</h3>' +
          '<p>Thank you, <strong>' + name + '</strong>. Your application for <strong>' + title + '</strong> has been received.</p>' +
          '<p>Our HR team will review it and contact you at <strong>' + email + '</strong> within 5–7 business days.</p>' +
          '<div style="background:#f0f4ff;padding:10px 20px;border-radius:8px;font-size:0.82rem;color:var(--navy);margin-top:6px;">For urgent inquiries call: <strong>+254 720 519 777</strong></div>' +
          '<button class="appt-btn" style="margin-top:1rem;" onclick="document.getElementById(\'careersModalOverlay\').classList.remove(\'open\');document.body.style.overflow=\'\';">' +
            '<i class="fa-solid fa-check"></i> Done' +
          '</button>' +
        '</div>';
    }

    // Close on overlay click
    document.getElementById('careersModalOverlay').addEventListener('click', function (e) {
      if (e.target === this) closeCareersModal();
    });

    // Close button in header
    document.getElementById('careersModalClose').addEventListener('click', closeCareersModal);

    // Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.getElementById('careersModalOverlay').classList.contains('open')) {
        closeCareersModal();
      }
    });

    // Init
    loadOpportunities(); // fetches live data, then calls updateCounts() + renderCareers()
  })();
}