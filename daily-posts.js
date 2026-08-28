/* ═══════════════════════════════════════
   りのトレ Site 3 — 毎日投稿セクション
   ＋ 知識まとめの大分類カードのドロップダウン挙動
═══════════════════════════════════════ */

/* 大分類カード: タッチ端末でタップ展開 / ハッシュ遷移時に該当項目を展開 */
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.k-cat-card');

  // タッチ/クリックでの開閉（ホバーなし環境向け）
  cards.forEach(card => {
    const btn = card.querySelector('.k-cat-card-btn');
    if (!btn) return;
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', e => {
      // hoverサポート環境ではホバーで開いている可能性があるが、
      // クリックで明示的に開閉できるようにする
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      // 他のカードを閉じる
      cards.forEach(c => {
        const b = c.querySelector('.k-cat-card-btn');
        if (b && b !== btn) b.setAttribute('aria-expanded', 'false');
      });
      btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      e.stopPropagation();
    });
  });

  // 外側クリックで全部閉じる
  document.addEventListener('click', e => {
    if (e.target.closest('.k-cat-card')) return;
    cards.forEach(c => {
      const b = c.querySelector('.k-cat-card-btn');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  });

  // ハッシュリンク（#k-xxx）で該当 <details> を自動展開
  function openTargetDetails() {
    const hash = location.hash;
    if (!hash || !hash.startsWith('#k-')) return;
    const target = document.querySelector(hash);
    if (target && target.tagName === 'DETAILS') {
      target.open = true;
    }
  }
  // 初回 + クリック時両方
  openTargetDetails();
  document.querySelectorAll('.k-cat-submenu a').forEach(a => {
    a.addEventListener('click', () => {
      // ハッシュ更新は標準動作で起きる。少し待ってから開く
      setTimeout(openTargetDetails, 50);
      // クリック後、開いていたカードは閉じる
      cards.forEach(c => {
        const b = c.querySelector('.k-cat-card-btn');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
    });
  });
  window.addEventListener('hashchange', openTargetDetails);
});

document.addEventListener('DOMContentLoaded', async () => {
  const listEl   = document.getElementById('daily-posts-list');
  const pagerEl  = document.getElementById('daily-posts-pager');
  const countEl  = document.getElementById('dailyPostsCount');
  const updatedEl= document.getElementById('dailyPostsUpdated');

  if (!listEl) return;

  const PAGE_SIZE  = 10;
  const EXCERPT_LEN = 70;
  let allPosts   = [];   // 全投稿（元データ）
  let posts      = [];   // 現在表示中（検索で絞り込んだ結果）
  let currentPage= 1;
  let sortOrder  = 'desc';
  let searchQuery= '';

  // 検索・並び替えを反映して表示リストを作り直す
  function applyView(resetPage = true) {
    const q = searchQuery.trim();
    posts = q
      ? allPosts.filter(p =>
          p.content.includes(q) ||
          String(p.num).includes(q) ||
          (p.date || '').includes(q))
      : allPosts.slice();
    posts.sort((a, b) => sortOrder === 'desc' ? b.num - a.num : a.num - b.num);
    if (countEl) {
      countEl.textContent = q
        ? `${posts.length}件ヒット（全${allPosts.length}投稿）`
        : `全${allPosts.length}投稿`;
    }
    renderPage(resetPage ? 1 : currentPage);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }
  function nl2br(s) { return s.replace(/\n/g, '<br>'); }
  function totalPages() { return Math.ceil(posts.length / PAGE_SIZE); }

  // 検索語をハイライト（エスケープ済みテキストに対して実行）
  function highlight(safeText) {
    const q = searchQuery.trim();
    if (!q) return safeText;
    const safeQ = escapeHtml(q);
    return safeText.split(safeQ).join('<mark>' + safeQ + '</mark>');
  }

  // ページの投稿を描画
  function renderPage(page) {
    currentPage = Math.max(1, Math.min(page, totalPages()));

    // 検索0件
    if (posts.length === 0) {
      listEl.innerHTML =
        `<div class="daily-error">「${escapeHtml(searchQuery)}」に一致する投稿は見つかりませんでした。<br>別のキーワードでお試しください。</div>`;
      renderPager();
      return;
    }

    const slice = posts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const q = searchQuery.trim();

    listEl.innerHTML = slice.map(p => {
      // 検索中はヒット箇所の周辺を抜粋、通常は先頭を抜粋
      let excerptText, hasMore;
      const idx = q ? p.content.indexOf(q) : -1;
      if (idx > -1) {
        const start = Math.max(0, idx - 30);
        const end = idx + q.length + 45;
        excerptText = (start > 0 ? '…' : '') + p.content.slice(start, end);
        hasMore = end < p.content.length;
      } else {
        excerptText = p.content.slice(0, EXCERPT_LEN);
        hasMore = p.content.length > EXCERPT_LEN;
      }
      const isLong = p.content.length > EXCERPT_LEN;
      const excerpt = highlight(nl2br(escapeHtml(excerptText))) + (hasMore ? '…' : '');
      const fullHtml = isLong
        ? `<div class="daily-post-full" hidden>${highlight(nl2br(escapeHtml(p.content)))}</div>
           <button class="daily-expand-btn">▼ 続きを読む</button>`
        : '';
      return `
        <article class="daily-post">
          <header class="daily-post-head">
            <span class="daily-post-num">${p.num}回目</span>
            <span class="daily-post-date">${escapeHtml(p.date)}</span>
          </header>
          <div class="daily-post-body">
            <div class="daily-post-excerpt">${excerpt}</div>
            ${fullHtml}
          </div>
        </article>`;
    }).join('');

    renderPager();

    // ページ切替後にセクション先頭へスクロール
    if (page !== 1) {
      document.getElementById('daily-posts')
        .scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ページャー描画
  function renderPager() {
    const total = totalPages();
    if (total <= 1) { pagerEl.innerHTML = ''; return; }

    const cur = currentPage;
    // 表示するページ番号の配列（省略は '...'）
    const nums = new Set([1, total, cur, cur-1, cur+1, cur-2, cur+2]);
    const sorted = [...nums].filter(n => n >= 1 && n <= total).sort((a,b) => a-b);
    const items = [];
    sorted.forEach((n, i) => {
      if (i > 0 && n - sorted[i-1] > 1) items.push('…');
      items.push(n);
    });

    const btnHtml = items.map(item => {
      if (item === '…') return `<span class="daily-pager-ellipsis">…</span>`;
      return `<button class="daily-pager-btn${item === cur ? ' active' : ''}"
                data-page="${item}">${item}</button>`;
    }).join('');

    pagerEl.innerHTML = `
      <button class="daily-pager-arrow" data-page="${cur-1}" ${cur===1?'disabled':''}>‹ 前へ</button>
      <span class="daily-pager-pages">${btnHtml}</span>
      <button class="daily-pager-arrow" data-page="${cur+1}" ${cur===total?'disabled':''}>次へ ›</button>`;
  }

  // ページャークリック（委任）
  pagerEl.addEventListener('click', e => {
    const btn = e.target.closest('[data-page]');
    if (!btn || btn.disabled) return;
    renderPage(Number(btn.dataset.page));
  });

  // 「続きを読む」展開（委任）
  listEl.addEventListener('click', e => {
    const btn = e.target.closest('.daily-expand-btn');
    if (!btn) return;
    const post = btn.closest('.daily-post');
    post.querySelector('.daily-post-excerpt').hidden = true;
    post.querySelector('.daily-post-full').hidden = false;
    btn.remove();
  });

  // データ取得
  try {
    const res = await fetch('posts.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    allPosts = await res.json();
  } catch (e) {
    listEl.innerHTML = '<div class="daily-error">投稿の読み込みに失敗しました。<br>しばらくしてから再度お試しください。</div>';
    return;
  }

  if (allPosts.length === 0) {
    listEl.innerHTML = '<div class="daily-error">投稿がまだありません。</div>';
    return;
  }

  const latest = allPosts.reduce((a, b) => (a.num > b.num ? a : b));
  if (updatedEl) updatedEl.textContent = `最終更新: ${latest.date.split(' ')[0]}`;

  applyView();

  // ソート切替
  document.querySelectorAll('.daily-sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.order === sortOrder) return;
      sortOrder = btn.dataset.order;
      document.querySelectorAll('.daily-sort-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.order === sortOrder)
      );
      applyView();
    });
  });

  // 検索
  const searchInput = document.getElementById('dailySearch');
  const searchClear = document.getElementById('dailySearchClear');
  let searchTimer = null;
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      searchQuery = e.target.value;
      if (searchClear) searchClear.style.display = searchQuery ? 'block' : 'none';
      clearTimeout(searchTimer);
      searchTimer = setTimeout(applyView, 200);
    });
  }
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      searchQuery = '';
      searchInput.value = '';
      searchClear.style.display = 'none';
      applyView();
      searchInput.focus();
    });
  }

  // シリーズのチップ（タップで検索）
  document.querySelectorAll('.daily-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.dataset.q || '';
      searchQuery = q;
      if (searchInput) searchInput.value = q;
      if (searchClear) searchClear.style.display = q ? 'block' : 'none';
      document.querySelectorAll('.daily-chip').forEach(c => c.classList.toggle('active', c === chip));
      applyView();
      document.getElementById('daily-posts').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
});
