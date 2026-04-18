/* ═══════════════════════════════════════
   りのトレ Site 3 — Search & Filter
═══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ─── Elements ───
  const searchInput  = document.getElementById('searchInput');
  const searchClear  = document.getElementById('searchClear');
  const resultInfo   = document.getElementById('searchResultInfo');
  const filterBtns   = document.querySelectorAll('.filter-btn');
  const allCards     = document.querySelectorAll('.ex-card');
  const allExSecs    = document.querySelectorAll('.ex-sec');

  let currentCat = 'all';
  let searchQuery = '';

  // ─── Filter Logic ───
  function applyFilter() {
    let visibleCount = 0;

    allCards.forEach(card => {
      const cardCat    = card.dataset.cat || '';
      const cardSearch = (card.dataset.search || '') + ' ' + (card.textContent || '');

      const matchCat    = currentCat === 'all' || cardCat === currentCat;
      const matchSearch = searchQuery === '' || cardSearch.includes(searchQuery);

      if (matchCat && matchSearch) {
        card.classList.remove('hidden');
        visibleCount++;
      } else {
        card.classList.add('hidden');
      }
    });

    // Show/hide section headers based on visible cards
    allExSecs.forEach(sec => {
      const secCat   = sec.dataset.sectionCat || '';
      const cards    = sec.querySelectorAll('.ex-card');
      const anyVisible = Array.from(cards).some(c => !c.classList.contains('hidden'));
      sec.style.display = anyVisible ? '' : 'none';
    });

    // Result info
    if (searchQuery || currentCat !== 'all') {
      resultInfo.textContent = `${visibleCount}件のトレーニングが見つかりました`;
    } else {
      resultInfo.textContent = '';
    }
  }

  // ─── Search Input ───
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      if (searchClear) searchClear.style.display = searchQuery ? 'block' : 'none';
      applyFilter();
    });
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      searchClear.style.display = 'none';
      applyFilter();
    });
  }

  // ─── Filter Buttons ───
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCat = btn.dataset.cat;
      applyFilter();
    });
  });

  // ─── Navbar Toggle (Mobile) ───
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  // ─── Navbar scroll effect ───
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  // ─── Cat Nav: highlight active section ───
  const catLinks = document.querySelectorAll('.cat-link');
  const sections = ['back', 'shoulder', 'hand', 'knee', 'foot', 'knowledge']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const secObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        catLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.cat-link[data-id="${entry.target.id}"]`);
        if (active) {
          active.classList.add('active');
          active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
    });
  }, { rootMargin: '-64px 0px -50% 0px', threshold: 0 });

  sections.forEach(s => secObserver.observe(s));

  // ─── Image Sliders: update counter ───
  document.querySelectorAll('.img-track').forEach(track => {
    const counter = track.parentElement.querySelector('.img-count');
    const imgs    = track.querySelectorAll('img');
    const total   = imgs.length;
    if (!counter || total <= 1) return;

    counter.textContent = `1 / ${total}`;

    track.addEventListener('scroll', () => {
      const idx = Math.round(track.scrollLeft / (track.scrollWidth / total)) + 1;
      counter.textContent = `${Math.min(idx, total)} / ${total}`;
    }, { passive: true });
  });

  // ─── Hide swipe-hint for single images ───
  document.querySelectorAll('.img-track').forEach(track => {
    const imgs = track.querySelectorAll('img');
    if (imgs.length === 1) {
      track.classList.add('single');
      const hint = track.closest('.ex-card')?.querySelector('.swipe-hint');
      if (hint) hint.style.display = 'none';
      const cnt = track.parentElement.querySelector('.img-count');
      if (cnt) cnt.style.display = 'none';
    }
  });

  // ─── Reveal animation ───
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

});
