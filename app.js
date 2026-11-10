// ===================================================
// app.js - 危険物乙4 合格マスター
// ===================================================

let bookmarks   = [];
let examHistory = [];
let currentTab  = 'home';

// ── タブ切り替え ──────────────────────────────────
document.querySelectorAll('.tab-item').forEach(btn => {
  btn.addEventListener('click', () => {
    currentTab = btn.dataset.tab;
    document.querySelectorAll('.tab-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

function updateBadge() {
  const badge = document.getElementById('bookmark-badge');
  if (bookmarks.length > 0) {
    badge.textContent = bookmarks.length;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

function render() {
  const el = document.getElementById('main-content');
  if (currentTab === 'home')     el.innerHTML = renderHome();
  if (currentTab === 'practice') el.innerHTML = renderPractice();
  if (currentTab === 'mock')     el.innerHTML = renderMockStart();
  if (currentTab === 'cards')    el.innerHTML = renderCards();
  if (currentTab === 'review')   el.innerHTML = renderReview();
  bindEvents();
  updateBadge();
}

// ══════════════════════════════════════════════════
// ホーム画面
// ══════════════════════════════════════════════════
function renderHome() {
  const last = examHistory[0];
  let lastExamHtml = '';
  if (last) {
    lastExamHtml = `
      <div class="card">
        <div class="card-title">📊 直近の模試結果</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px">
          <span style="font-size:28px;font-weight:900;color:${last.passed ? '#22c55e' : '#ef4444'}">
            ${last.score} <span style="font-size:14px;color:#94a3b8;font-weight:normal">/ 35点</span>
          </span>
          <span style="padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;
            background:${last.passed ? '#16a34a22' : '#dc262222'};
            color:${last.passed ? '#22c55e' : '#ef4444'}">
            ${last.passed ? '合格' : '不合格'}
          </span>
        </div>
        <div class="last-exam-grid">
          <div class="score-box">
            <div class="score-box-label">法令(15)</div>
            <div class="score-box-val" style="color:${last.law >= 9 ? '#22c55e' : '#ef4444'}">${last.law}点</div>
          </div>
          <div class="score-box">
            <div class="score-box-label">物化(10)</div>
            <div class="score-box-val" style="color:${last.phy >= 6 ? '#22c55e' : '#ef4444'}">${last.phy}点</div>
          </div>
          <div class="score-box">
            <div class="score-box-label">性状(10)</div>
            <div class="score-box-val" style="color:${last.prop >= 6 ? '#22c55e' : '#ef4444'}">${last.prop}点</div>
          </div>
        </div>
      </div>`;
  }

  return `
    <div class="banner">
      <div class="banner-title">🔥 試験合格への最短ルート</div>
      <div class="banner-sub">法令15問・物化10問・性状10問の完全網羅模試と全要点単語カードで効率的に学習しよう。</div>
    </div>
    <div class="menu-grid">
      <div class="menu-card" data-action="go-practice">
        <div class="menu-card-icon">📖</div>
        <div class="menu-card-title">分野別演習</div>
        <div class="menu-card-desc">法令/物化/性状を選択練習</div>
      </div>
      <div class="menu-card" data-action="go-mock">
        <div class="menu-card-icon">🏆</div>
        <div class="menu-card-title">35問模試</div>
        <div class="menu-card-desc">35分タイマー＋合格判定</div>
      </div>
      <div class="menu-card" data-action="go-cards">
        <div class="menu-card-icon">✨</div>
        <div class="menu-card-title">単語カード</div>
        <div class="menu-card-desc">25枚の重要単語を暗記</div>
      </div>
      <div class="menu-card" data-action="go-review">
        <div class="menu-card-icon">🔖</div>
        <div class="menu-card-title">復習ノート</div>
        <div class="menu-card-desc">ブックマーク ${bookmarks.length}件</div>
      </div>
    </div>
    ${lastExamHtml}
    <div class="card">
      <div class="card-title">❓ 本試験の合格判定基準</div>
      <p style="color:#94a3b8;font-size:12px;line-height:1.8;margin-top:4px">
        • 法令：15問中 9問以上（60%）<br>
        • 基礎物理・化学：10問中 6問以上（60%）<br>
        • 性状・火災予防・消火：10問中 6問以上（60%）<br>
        <strong style="color:#f59e0b">※全3科目すべて60%以上で合格！</strong>
      </p>
    </div>`;
}

// ══════════════════════════════════════════════════
// 分野別演習
// ══════════════════════════════════════════════════
let practiceState = { cat: 'すべて', idx: 0, selected: null };

function renderPractice() {
  const cats = ['すべて', '法令', '物理・化学', '性質・消火'];
  const filtered = practiceState.cat === 'すべて' ? QUESTIONS : QUESTIONS.filter(q => q.cat === practiceState.cat);
  const cur = filtered[practiceState.idx];
  if (!cur) return '<p style="color:#94a3b8;text-align:center;padding:40px">問題がありません</p>';

  const chips = cats.map(c => `
    <button class="filter-chip ${practiceState.cat === c ? 'active' : ''}" data-filter="${c}">${c}</button>
  `).join('');

  const opts = cur.opts.map((opt, i) => {
    let cls = '';
    if (practiceState.selected !== null) {
      if (i === cur.ans) cls = 'correct';
      else if (i === practiceState.selected) cls = 'wrong';
      else cls = 'dimmed';
    }
    return `
      <button class="option-btn ${cls}" data-opt="${i}" ${practiceState.selected !== null ? 'disabled' : ''}>
        <span class="option-num">${i + 1}</span>
        <span class="option-text">${opt}</span>
      </button>`;
  }).join('');

  const expHtml = practiceState.selected !== null ? `
    <div class="explanation-box">
      <div class="explanation-title">💡 解説</div>
      <div class="explanation-text">${cur.exp}</div>
      <button class="primary-btn" style="margin-top:12px" data-action="next-q">次の問題へ →</button>
    </div>` : '';

  return `
    <div class="nav-row">
      <button class="back-link" data-action="go-home">← 戻る</button>
      <span class="nav-info">${practiceState.idx + 1} / ${filtered.length}</span>
    </div>
    <div class="filter-wrap">${chips}</div>
    <div class="card">
      <div class="question-header">
        <div class="cat-badge">${cur.cat} · ${cur.sub}</div>
        <button class="bookmark-btn" data-bookmark="${cur.id}">${bookmarks.includes(cur.id) ? '⭐' : '☆'}</button>
      </div>
      <div class="question-text">${cur.q}</div>
    </div>
    ${opts}
    ${expHtml}`;
}

// ══════════════════════════════════════════════════
// 模試
// ══════════════════════════════════════════════════
let mockState = null;
let mockTimer = null;

function renderMockStart() {
  return `
    <div style="text-align:center;padding:40px 20px">
      <div style="font-size:56px;margin-bottom:16px">🏆</div>
      <h2 style="font-size:20px;font-weight:900;margin-bottom:8px">危険物乙4 本試験35問模試</h2>
      <p style="color:#94a3b8;font-size:13px;margin-bottom:20px">本番同様の出題バランスと合格ライン判定</p>
      <div class="card" style="text-align:left;margin-bottom:20px">
        <div class="card-title">📋 模擬試験ルール</div>
        <p style="color:#94a3b8;font-size:12px;line-height:1.8;margin-top:4px">
          • 全35問（法令15問 / 物化10問 / 性状10問）<br>
          • 制限時間：35分<br>
          • 合格基準：3科目すべて正答率60%以上
        </p>
      </div>
      <button class="primary-btn" data-action="start-mock">模擬試験を開始する</button>
    </div>`;
}

function renderMockExam() {
  const s   = mockState;
  const cur = QUESTIONS[s.idx];
  const min = Math.floor(s.timeLeft / 60);
  const sec = String(s.timeLeft % 60).padStart(2, '0');

  const opts = cur.opts.map((opt, i) => {
    const sel = s.answers[cur.id] === i;
    return `
      <button class="option-btn ${sel ? 'correct' : ''}" data-mock-opt="${i}"
        style="${sel ? 'background:#f59e0b22;border-color:#f59e0b' : ''}">
        <span class="option-num" style="${sel ? 'background:#f59e0b;color:#0f172a' : ''}">${i + 1}</span>
        <span class="option-text" style="${sel ? 'color:#f59e0b;font-weight:700' : ''}">${opt}</span>
      </button>`;
  }).join('');

  return `
    <div class="mock-header">
      <span class="timer-text">⏱ 残り ${min}:${sec}</span>
      <button class="finish-btn" data-action="finish-mock">終了して採点</button>
    </div>
    <p class="nav-info" style="margin-bottom:8px">問 ${s.idx + 1} / 35 · ${cur.cat}</p>
    <div class="card"><div class="question-text">${cur.q}</div></div>
    ${opts}
    <div style="display:flex;gap:10px;margin-top:12px">
      <button class="secondary-btn" data-action="mock-prev" ${s.idx === 0 ? 'disabled' : ''}>前へ</button>
      <button class="primary-btn" data-action="mock-next" ${s.idx === QUESTIONS.length - 1 ? 'disabled' : ''}>次へ</button>
    </div>`;
}

function renderMockResult() {
  const s = mockState;
  let law = 0, phy = 0, prop = 0;
  QUESTIONS.forEach(q => {
    if (s.answers[q.id] === q.ans) {
      if (q.cat === '法令') law++;
      if (q.cat === '物理・化学') phy++;
      if (q.cat === '性質・消火') prop++;
    }
  });
  const passed = law >= 9 && phy >= 6 && prop >= 6;
  const total  = law + phy + prop;
  const col    = passed ? '#22c55e' : '#ef4444';

  const filtered = QUESTIONS.filter(q => {
    const ok = s.answers[q.id] === q.ans;
    if (s.reviewFilter === 'WRONG')   return !ok;
    if (s.reviewFilter === 'CORRECT') return ok;
    return true;
  });

  const reviewItems = filtered.map((q, i) => {
    const globalIdx = QUESTIONS.findIndex(mq => mq.id === q.id);
    const isOk = s.answers[q.id] === q.ans;
    const opts = q.opts.map((opt, oi) => {
      let c = '#475569';
      if (oi === q.ans) c = '#22c55e';
      if (oi === s.answers[q.id] && oi !== q.ans) c = '#ef4444';
      return `<div class="review-opt" style="color:${c}">
        ${oi + 1}. ${opt}
        ${oi === q.ans ? ' ◀正解' : ''}
        ${oi === s.answers[q.id] && oi !== q.ans ? ' ◀あなたの回答' : ''}
      </div>`;
    }).join('');
    return `
      <div class="review-item">
        <div class="review-item-header">
          <span style="color:#94a3b8;font-size:11px">問${globalIdx + 1} · ${q.cat}</span>
          <span class="${isOk ? 'correct-label' : 'wrong-label'}">${isOk ? '✅ 正解' : '❌ 不正解'}</span>
        </div>
        <div class="review-q-text">${q.q}</div>
        <div class="review-opts">${opts}</div>
        <div class="review-explanation">
          <div class="review-exp-title">💡 解説</div>
          <div class="review-exp-text">${q.exp}</div>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="result-hero" style="border-color:${col}66;background:${col}11">
      <div class="result-emoji">${passed ? '🎉' : '😢'}</div>
      <div class="result-title" style="color:${col}">${passed ? '合格！おめでとう！' : '不合格（再挑戦しよう）'}</div>
      <div class="result-score" style="color:${col}">${total}<span> / 35点</span></div>
    </div>
    <div class="card">
      <div class="card-title">科目別結果</div>
      <div class="score-grid">
        <div class="score-box">
          <div class="score-box-label">法令(15問)</div>
          <div class="score-box-val" style="color:${law >= 9 ? '#22c55e' : '#ef4444'}">${law}問 ${law >= 9 ? '✅' : '❌'}</div>
        </div>
        <div class="score-box">
          <div class="score-box-label">物化(10問)</div>
          <div class="score-box-val" style="color:${phy >= 6 ? '#22c55e' : '#ef4444'}">${phy}問 ${phy >= 6 ? '✅' : '❌'}</div>
        </div>
        <div class="score-box">
          <div class="score-box-label">性状(10問)</div>
          <div class="score-box-val" style="color:${prop >= 6 ? '#22c55e' : '#ef4444'}">${prop}問 ${prop >= 6 ? '✅' : '❌'}</div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-title">全問解答解説</div>
      <div class="review-filter">
        <button class="filter-chip ${s.reviewFilter === 'ALL' ? 'active' : ''}" data-rfilter="ALL">すべて</button>
        <button class="filter-chip ${s.reviewFilter === 'WRONG' ? 'active' : ''}" data-rfilter="WRONG">不正解</button>
        <button class="filter-chip ${s.reviewFilter === 'CORRECT' ? 'active' : ''}" data-rfilter="CORRECT">正解</button>
      </div>
      ${reviewItems}
    </div>
    <button class="primary-btn" data-action="go-home">ホームへ戻る</button>`;
}

// ══════════════════════════════════════════════════
// 単語カード
// ══════════════════════════════════════════════════
let cardState = { cat: 'すべて', idx: 0, flipped: false, mastered: [], starred: [] };

function renderCards() {
  const cats     = ['すべて', '指定数量', '性状', '法令', '物理・化学'];
  const filtered = cardState.cat === 'すべて' ? FLASHCARDS : FLASHCARDS.filter(c => c.cat === cardState.cat);
  const cur      = filtered[cardState.idx] || FLASHCARDS[0];

  const chips = cats.map(c => `
    <button class="filter-chip ${cardState.cat === c ? 'active' : ''}" data-card-filter="${c}">${c}</button>
  `).join('');

  const bodyHtml = !cardState.flipped
    ? `<div class="flash-card-body">
        <div class="flash-term">${cur.term}</div>
        <div class="flash-hint">タップして解説を表示</div>
      </div>`
    : `<div class="flash-card-body" style="align-items:flex-start">
        <div class="flash-def">${cur.def}</div>
      </div>`;

  return `
    <div class="nav-row">
      <button class="back-link" data-action="go-home">← 戻る</button>
      <span class="nav-info">習得済み: ${cardState.mastered.length} / ${FLASHCARDS.length}</span>
    </div>
    <div class="filter-wrap">${chips}</div>
    <p style="text-align:center;color:#475569;font-size:12px;margin-bottom:8px">${cardState.idx + 1} / ${filtered.length} 枚</p>
    <div class="flash-card ${cardState.flipped ? 'flipped' : ''}" id="flash-card-main">
      <div class="flash-card-top">
        <div class="cat-badge">${cur.cat}</div>
        <button class="bookmark-btn" data-star="${cur.id}">${cardState.starred.includes(cur.id) ? '⭐' : '☆'}</button>
      </div>
      ${bodyHtml}
      <div class="flash-footer">
        <button class="mastered-btn ${cardState.mastered.includes(cur.id) ? 'active' : ''}" data-master="${cur.id}">
          ${cardState.mastered.includes(cur.id) ? '✅ 習得済み' : '要復習'}
        </button>
      </div>
    </div>
    <div class="card-nav">
      <button class="secondary-btn" data-action="card-prev">前へ</button>
      <button class="shuffle-btn" data-action="card-shuffle">🔀</button>
      <button class="primary-btn" data-action="card-next">次へ</button>
    </div>`;
}

// ══════════════════════════════════════════════════
// 復習ノート
// ══════════════════════════════════════════════════
function renderReview() {
  const bmQs = QUESTIONS.filter(q => bookmarks.includes(q.id));

  if (bmQs.length === 0) {
    return `
      <div class="nav-row">
        <button class="back-link" data-action="go-home">← 戻る</button>
        <span class="nav-info">ブックマーク: 0件</span>
      </div>
      <div class="empty-state">
        <div class="empty-state-icon">🔖</div>
        <div class="empty-state-title">ブックマークした問題がありません</div>
        <div class="empty-state-sub">演習画面で ☆ をタップして登録できます</div>
      </div>`;
  }

  const items = bmQs.map(q => `
    <div class="card">
      <div class="question-header">
        <div class="cat-badge">${q.cat} · ${q.sub}</div>
        <button class="bookmark-btn" data-bookmark="${q.id}">⭐</button>
      </div>
      <div class="question-text" style="margin-bottom:10px">${q.q}</div>
      <div style="background:#0f172a;border-radius:8px;padding:10px">
        <div style="color:#22c55e;font-weight:700;font-size:12px;margin-bottom:4px">正解: 選択肢 ${q.ans + 1}</div>
        <div style="color:#94a3b8;font-size:12px;line-height:1.6">${q.exp}</div>
      </div>
    </div>`).join('');

  return `
    <div class="nav-row">
      <button class="back-link" data-action="go-home">← 戻る</button>
      <span class="nav-info">ブックマーク: ${bookmarks.length}件</span>
    </div>
    ${items}`;
}

// ══════════════════════════════════════════════════
// イベントバインド
// ══════════════════════════════════════════════════
function bindEvents() {
  const el = document.getElementById('main-content');

  // タブ遷移
  el.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const a = btn.dataset.action;
      if (a === 'go-home')     switchTab('home');
      if (a === 'go-practice') switchTab('practice');
      if (a === 'go-mock')     switchTab('mock');
      if (a === 'go-cards')    switchTab('cards');
      if (a === 'go-review')   switchTab('review');

      // 演習
      if (a === 'next-q') {
        const filtered = practiceState.cat === 'すべて' ? QUESTIONS : QUESTIONS.filter(q => q.cat === practiceState.cat);
        practiceState.idx = (practiceState.idx + 1) % filtered.length;
        practiceState.selected = null;
        render();
      }

      // 模試
      if (a === 'start-mock') {
        clearInterval(mockTimer);
        mockState = { idx: 0, answers: {}, timeLeft: 35 * 60, finished: false, reviewFilter: 'ALL' };
        mockTimer = setInterval(() => {
          if (!mockState || mockState.finished) return clearInterval(mockTimer);
          mockState.timeLeft--;
          if (mockState.timeLeft <= 0) { mockState.finished = true; clearInterval(mockTimer); }
          render();
        }, 1000);
        render();
      }
      if (a === 'mock-prev') { mockState.idx = Math.max(0, mockState.idx - 1); render(); }
      if (a === 'mock-next') { mockState.idx = Math.min(QUESTIONS.length - 1, mockState.idx + 1); render(); }
      if (a === 'finish-mock') {
        if (confirm('採点しますか？')) {
          clearInterval(mockTimer);
          mockState.finished = true;
          let law = 0, phy = 0, prop = 0;
          QUESTIONS.forEach(q => {
            if (mockState.answers[q.id] === q.ans) {
              if (q.cat === '法令') law++;
              if (q.cat === '物理・化学') phy++;
              if (q.cat === '性質・消火') prop++;
            }
          });
          examHistory.unshift({ score: law + phy + prop, law, phy, prop, passed: law >= 9 && phy >= 6 && prop >= 6 });
          render();
        }
      }

      // カード
      if (a === 'card-prev') {
        const f = cardState.cat === 'すべて' ? FLASHCARDS : FLASHCARDS.filter(c => c.cat === cardState.cat);
        cardState.idx = (cardState.idx - 1 + f.length) % f.length;
        cardState.flipped = false; render();
      }
      if (a === 'card-next') {
        const f = cardState.cat === 'すべて' ? FLASHCARDS : FLASHCARDS.filter(c => c.cat === cardState.cat);
        cardState.idx = (cardState.idx + 1) % f.length;
        cardState.flipped = false; render();
      }
      if (a === 'card-shuffle') {
        const f = cardState.cat === 'すべて' ? FLASHCARDS : FLASHCARDS.filter(c => c.cat === cardState.cat);
        cardState.idx = Math.floor(Math.random() * f.length);
        cardState.flipped = false; render();
      }
    });
  });

  // 演習：カテゴリフィルター
  el.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      practiceState.cat = btn.dataset.filter;
      practiceState.idx = 0; practiceState.selected = null;
      render();
    });
  });

  // 演習：選択肢
  el.querySelectorAll('[data-opt]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (practiceState.selected !== null) return;
      practiceState.selected = parseInt(btn.dataset.opt);
      render();
    });
  });

  // ブックマーク
  el.querySelectorAll('[data-bookmark]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.bookmark;
      bookmarks = bookmarks.includes(id) ? bookmarks.filter(x => x !== id) : [...bookmarks, id];
      render();
    });
  });

  // 模試：選択肢
  el.querySelectorAll('[data-mock-opt]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!mockState || mockState.finished) return;
      const cur = QUESTIONS[mockState.idx];
      mockState.answers[cur.id] = parseInt(btn.dataset.mockOpt);
      render();
    });
  });

  // 模試：振り返りフィルター
  el.querySelectorAll('[data-rfilter]').forEach(btn => {
    btn.addEventListener('click', () => {
      mockState.reviewFilter = btn.dataset.rfilter;
      render();
    });
  });

  // カード：カテゴリ
  el.querySelectorAll('[data-card-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      cardState.cat = btn.dataset.cardFilter;
      cardState.idx = 0; cardState.flipped = false;
      render();
    });
  });

  // カード：裏返し
  const fc = document.getElementById('flash-card-main');
  if (fc) fc.addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    cardState.flipped = !cardState.flipped;
    render();
  });

  // カード：スター
  el.querySelectorAll('[data-star]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.star;
      cardState.starred = cardState.starred.includes(id)
        ? cardState.starred.filter(x => x !== id)
        : [...cardState.starred, id];
      render();
    });
  });

  // カード：習得
  el.querySelectorAll('[data-master]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.master;
      cardState.mastered = cardState.mastered.includes(id)
        ? cardState.mastered.filter(x => x !== id)
        : [...cardState.mastered, id];
      render();
    });
  });
}

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab-item').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
  render();
}

// 模試中の画面レンダリング上書き
const _render = render;
render = function() {
  const el = document.getElementById('main-content');
  if (currentTab === 'home')     el.innerHTML = renderHome();
  if (currentTab === 'practice') el.innerHTML = renderPractice();
  if (currentTab === 'mock') {
    if (!mockState)              el.innerHTML = renderMockStart();
    else if (mockState.finished) el.innerHTML = renderMockResult();
    else                         el.innerHTML = renderMockExam();
  }
  if (currentTab === 'cards')    el.innerHTML = renderCards();
  if (currentTab === 'review')   el.innerHTML = renderReview();
  bindEvents();
  updateBadge();
};

// 初期描画
render();
