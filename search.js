/* ═══════════════════════════════════════
   りのトレ Site 3 — Search & Filter
═══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ─── Elements ───
  const searchInput  = document.getElementById('searchInput');
  const searchClear  = document.getElementById('searchClear');
  const resultInfo   = document.getElementById('searchResultInfo');
  const allCards     = document.querySelectorAll('.ex-card');
  const allExSecs    = document.querySelectorAll('.ex-sec');

  let searchQuery = '';

  // ─── Filter Logic ───
  function applyFilter() {
    let visibleCount = 0;

    allCards.forEach(card => {
      const cardSearch = (card.dataset.search || '') + ' ' + (card.textContent || '');
      const matchSearch = searchQuery === '' || cardSearch.includes(searchQuery);

      if (matchSearch) {
        card.classList.remove('hidden');
        visibleCount++;
      } else {
        card.classList.add('hidden');
      }
    });

    // Show/hide section headers based on visible cards
    allExSecs.forEach(sec => {
      const cards    = sec.querySelectorAll('.ex-card');
      const anyVisible = Array.from(cards).some(c => !c.classList.contains('hidden'));
      sec.style.display = anyVisible ? '' : 'none';
    });

    // Result info
    if (searchQuery) {
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
  const sections = ['shoulder', 'back', 'hand', 'knee', 'foot', 'knowledge']
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
  // 主要ブロックに自動で reveal クラスを付与（HTML編集不要の演出強化）
  document.querySelectorAll(
    '.section-header, .profile-row, .message-body, .message-quote,' +
    ' .concept-card, .key-msg, .before-block, .warning-box,' +
    ' .ex-card, .k-cat-card, .k-item, .about-card, .daily-post'
  ).forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // 安全網：観測が動かない環境でも3秒後には全て表示する
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.active)').forEach(el => el.classList.add('active'));
  }, 3000);

  // 動的に追加される毎日投稿カードにも reveal を適用
  const dailyList = document.getElementById('daily-posts-list');
  if (dailyList) {
    new MutationObserver(() => {
      const added = dailyList.querySelectorAll('.daily-post:not(.reveal)');
      added.forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
      });
      // 安全網：追加分も確実に表示
      setTimeout(() => {
        added.forEach(el => el.classList.add('active'));
      }, 1200);
    }).observe(dailyList, { childList: true });
  }

  // ─── Scroll progress bar ───
  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    }, { passive: true });
  }

  // ─── Back to top ───
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('show', window.scrollY > 600);
    }, { passive: true });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

});
