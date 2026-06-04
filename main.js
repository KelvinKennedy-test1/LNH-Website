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

/* ══════════════════════════════════════════
   ── CAREERS SECTION ──
══════════════════════════════════════════ */
(function() {
  var CAREERS_WEB3_KEY = 'ad7c24f9-97ce-45d4-80cf-020a49a083d8'; // reuse your existing key

  /* ── Default seed listings (used only when localStorage is empty) ── */
  var DEFAULT_OPPORTUNITIES = [
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

  /* ── Load from localStorage (admin panel writes here) ── */
  function loadOpportunities() {
    try {
      var stored = localStorage.getItem('lnh_careers');
      if (stored) {
        var parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Only show published listings (published === false means draft)
          return parsed.filter(function(o){ return o.published !== false; });
        }
      }
    } catch(e) { /* ignore parse errors */ }
    // Seed localStorage with defaults on first visit
    localStorage.setItem('lnh_careers', JSON.stringify(DEFAULT_OPPORTUNITIES));
    return DEFAULT_OPPORTUNITIES.slice();
  }

  var opportunities = loadOpportunities();

  var activeTab = 'all';

  function getBadgeClass(type) {
    return type === 'job' ? 'badge-job' : type === 'intern' ? 'badge-intern' : 'badge-attach';
  }
  function getBadgeLabel(type) {
    return type === 'job' ? '<i class="fa-solid fa-hospital-user"></i> Job Offer'
         : type === 'intern' ? '<i class="fa-solid fa-graduation-cap"></i> Internship'
         : '<i class="fa-solid fa-certificate"></i> Attachment';
  }

  function updateCounts() {
    document.getElementById('ct-all').textContent    = opportunities.length;
    document.getElementById('ct-job').textContent    = opportunities.filter(function(o){ return o.type==='job'; }).length;
    document.getElementById('ct-intern').textContent = opportunities.filter(function(o){ return o.type==='intern'; }).length;
    document.getElementById('ct-attach').textContent = opportunities.filter(function(o){ return o.type==='attach'; }).length;
  }

  function renderCareers() {
    var list = activeTab === 'all' ? opportunities : opportunities.filter(function(o){ return o.type === activeTab; });
    var grid  = document.getElementById('careersGrid');
    var empty = document.getElementById('careersEmpty');
    if (!grid) return;

    if (!list.length) {
      grid.innerHTML = '';
      if (empty) empty.style.display = 'block';
      return;
    }
    if (empty) empty.style.display = 'none';

    grid.innerHTML = list.map(function(o) {
      return '<div class="career-card">' +
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
      '</div>';
    }).join('');

    // Attach apply button listeners
    grid.querySelectorAll('.career-apply-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        openCareersModal(parseInt(this.dataset.id));
      });
    });
  }

  // Tab switching
  document.querySelectorAll('.career-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.career-tab').forEach(function(t){ t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
      this.classList.add('active');
      this.setAttribute('aria-selected','true');
      activeTab = this.dataset.tab;
      renderCareers();
    });
  });

  /* ── Modal ── */
  function openCareersModal(id) {
    var o = opportunities.find(function(x){ return x.x === id; }) ||
            opportunities.filter(function(x){ return x.id === id; })[0];
    if (!o) return;

    document.getElementById('careersModalTitle').textContent = o.title;
    document.getElementById('careersModalMeta').textContent = (o.type === 'job' ? 'Job Offer' : o.type === 'intern' ? 'Internship' : 'Attachment') + ' · ' + o.dept + ' · ' + o.time;

    var introField = o.type === 'attach' ? (
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
          o.reqs.map(function(r){ return '<li>' + r + '</li>'; }).join('') +
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
    document.getElementById('careersSubmitBtn').addEventListener('click', function() {
      submitCareersApp(o);
    });

    document.getElementById('careersModalOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  window.careersFileChosen = function(inputId, labelId) {
    var f = document.getElementById(inputId);
    var label = document.getElementById(labelId);
    if (f && f.files[0] && label) {
      label.innerHTML = '<i class="fa-solid fa-circle-check" style="color:var(--teal)"></i> ' + f.files[0].name;
    }
  };

  function closeCareersModal() {
    document.getElementById('careersModalOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  function submitCareersApp(o) {
    var name  = (document.getElementById('careers-name')  || {}).value || '';
    var email = (document.getElementById('careers-email') || {}).value || '';
    var phone = (document.getElementById('careers-phone') || {}).value || '';
    var qual  = (document.getElementById('careers-qual')  || {}).value || '';
    var cover = (document.getElementById('careers-cover') || {}).value || '';
    var cvFile = document.getElementById('careers-cv');

    name = name.trim(); email = email.trim(); phone = phone.trim();

    if (!name || !email || !phone || !qual || !cvFile || !cvFile.files[0]) {
      alert('Please fill in all required fields and upload your CV.');
      return;
    }

    var submitBtn = document.getElementById('careersSubmitBtn');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…'; }

    // Send via Web3Forms
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: CAREERS_WEB3_KEY,
        subject: 'Career Application – ' + o.title + ' | Limuru Nursing Home',
        'Position': o.title,
        'Type': o.type === 'job' ? 'Job Offer' : o.type === 'intern' ? 'Internship' : 'Attachment',
        'Department': o.dept,
        'Applicant Name': name,
        'Email': email,
        'Phone': phone,
        'Qualification': qual,
        'Cover Letter': cover || 'Not provided'
      })
    })
    .then(function(res){ return res.json(); })
    .then(function(data) {
      if (data.success) {
        showCareersSuccess(name, o.title, email);
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    })
    .catch(function(err) {
      console.error('Career form error:', err);
      alert('Failed to send application. Please email us directly at info@limurunursinghome.co.ke or call +254 720 519 777.');
      if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit Application'; }
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
  document.getElementById('careersModalOverlay').addEventListener('click', function(e) {
    if (e.target === this) closeCareersModal();
  });

  // Close button in header
  document.getElementById('careersModalClose').addEventListener('click', closeCareersModal);

  // Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('careersModalOverlay').classList.contains('open')) {
      closeCareersModal();
    }
  });

  // ── Show/hide section via nav link ──
  var careersSection = document.getElementById('careers');
  var careersNavLink = document.querySelector('a.nav-link[data-section="careers"]');

  if (careersNavLink) {
    careersNavLink.addEventListener('click', function(e) {
      e.preventDefault();
      careersSection.style.display = 'block';
      setTimeout(function() {
        careersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
      // Close mobile menu if open
      var nav = document.getElementById('navMenu');
      var hbg = document.getElementById('hamburger');
      if (nav) nav.classList.remove('open');
      if (hbg) { hbg.classList.remove('open'); hbg.setAttribute('aria-expanded', 'false'); }
    });
  }

  // Hide careers when any other nav link is clicked
  document.querySelectorAll('.nav-link:not([data-section="careers"]), .nav-link-dropdown').forEach(function(link) {
    link.addEventListener('click', function() {
      if (careersSection) careersSection.style.display = 'none';
    });
  });

  // Init
  updateCounts();
  renderCareers();
})();