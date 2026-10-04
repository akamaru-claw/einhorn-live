/*
 * If-Sätze Typ 2 – Lerntrainer
 * Eigenständige Lern-App (kein Framework, keine externen Abhängigkeiten).
 * Integration in die Plattform: siehe INTEGRATION.md
 */
(function () {
  'use strict';

  const APP_ID = 'en-if-clauses-type2';
  const APP_VERSION = '1.0.0';
  const DATA = window.IF2_DATA;
  const CFG = Object.assign({
    mount: '#if2-app',
    storageKey: 'if2',
    user: null,               // { id, name }
    submitResult: null,       // async (result) => void
    fetchLeaderboard: null,   // async (modeId) => [{ name, score, streak, isMe }]
    onEvent: null             // (type, detail) => void
  }, window.LEARNAPP_CONFIG || {});

  /* =========================================================
   * Hilfsfunktionen
   * ======================================================= */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const pick = (arr, n) => shuffle(arr).slice(0, n);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const today = () => {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };
  function h(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  // Antworten vergleichbar machen: Kleinschreibung, Apostrophe, Kurzformen ausschreiben
  function norm(s) {
    let t = String(s).toLowerCase().replace(/[’‘`´]/g, "'").replace(/[.!?,;]+$/g, '').replace(/\s+/g, ' ').trim();
    t = t.replace(/\bwon't\b/g, 'will not')
      .replace(/\bcan't\b/g, 'can not').replace(/\bcannot\b/g, 'can not')
      .replace(/\b(would|could|did|do|does|was|were|had|is|are|have|has)n't\b/g, '$1 not')
      .replace(/^'d\b/, 'would').replace(/\b([a-z]+)'d\b/g, '$1 would')
      .replace(/\s+/g, ' ');
    return t;
  }
  const matches = (input, solution) => solution.split('|').some((alt) => norm(alt) === norm(input));

  /* =========================================================
   * Speicher (lokaler Fallback – die Plattform speichert serverseitig)
   * ======================================================= */
  const store = {
    key: (k) => CFG.storageKey + ':' + (CFG.user && CFG.user.id ? CFG.user.id : 'guest') + ':' + k,
    get(k, def) {
      try { const v = localStorage.getItem(this.key(k)); return v == null ? def : JSON.parse(v); } catch (e) { return def; }
    },
    set(k, v) { try { localStorage.setItem(this.key(k), JSON.stringify(v)); } catch (e) { /* ignore */ } }
  };

  function getProfile() {
    return Object.assign({ xp: 0, best: {}, bestCombo: 0, day: { last: null, count: 0 }, played: 0, history: [], sound: true }, store.get('profile', {}));
  }
  function saveProfile(p) { store.set('profile', p); }
  function getMistakes() { return store.get('mistakes', []); }
  function setMistakes(m) { store.set('mistakes', m.slice(-60)); }

  function touchDayStreak(p) {
    const t = today();
    if (p.day.last === t) return p.day.count;
    const y = new Date(); y.setDate(y.getDate() - 1);
    const yStr = y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0');
    p.day.count = p.day.last === yStr ? p.day.count + 1 : 1;
    p.day.last = t;
    return p.day.count;
  }
  function currentDayStreak(p) {
    if (!p.day.last) return 0;
    const y = new Date(); y.setDate(y.getDate() - 1);
    const yStr = y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0');
    return (p.day.last === today() || p.day.last === yStr) ? p.day.count : 0;
  }
  const level = (xp) => Math.floor(Math.sqrt(xp / 50)) + 1;
  const levelXp = (lv) => (lv - 1) * (lv - 1) * 50;

  /* =========================================================
   * Events an die Plattform
   * ======================================================= */
  function emit(type, detail) {
    const payload = Object.assign({ appId: APP_ID, appVersion: APP_VERSION, user: CFG.user }, detail || {});
    try { if (typeof CFG.onEvent === 'function') CFG.onEvent(type, payload); } catch (e) { console.error(e); }
    try { window.dispatchEvent(new CustomEvent('learnapp:' + type, { detail: payload })); } catch (e) { /* ignore */ }
    try { if (window.parent && window.parent !== window) window.parent.postMessage({ source: 'learnapp', type, detail: payload }, '*'); } catch (e) { /* ignore */ }
  }

  /* =========================================================
   * Sound (WebAudio, ohne Dateien)
   * ======================================================= */
  let audioCtx = null;
  function beep(kind) {
    if (!getProfile().sound) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const notes = kind === 'ok' ? [660, 880] : kind === 'win' ? [523, 659, 784, 1047] : [220, 180];
      notes.forEach((f, i) => {
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = kind === 'bad' ? 'square' : 'sine';
        o.frequency.value = f;
        const t0 = audioCtx.currentTime + i * 0.09;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.12, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
        o.connect(g).connect(audioCtx.destination);
        o.start(t0); o.stop(t0 + 0.18);
      });
    } catch (e) { /* ignore */ }
  }

  /* =========================================================
   * Modi
   * ======================================================= */
  const MODES = [
    { id: 'gap', icon: '✏️', name: 'Lückentext', desc: 'Setze die richtigen Verbformen ein.', kinds: ['gap'], n: 10 },
    { id: 'mc', icon: '🔘', name: 'Multiple Choice', desc: 'Wähle die passende Form aus.', kinds: ['mc'], n: 12 },
    { id: 'order', icon: '🧩', name: 'Satzbau', desc: 'Übersetze mit Wortbausteinen – Achtung, Fallen!', kinds: ['order'], n: 8 },
    { id: 'error', icon: '🔍', name: 'Fehlerjagd', desc: 'Finde den Fehler im Satz – oder ist alles korrekt?', kinds: ['error'], n: 10 },
    { id: 'match', icon: '🔗', name: 'Satzhälften', desc: 'Verbinde if-Satz und Hauptsatz.', kinds: ['match'], n: 3 },
    { id: 'short', icon: '💬', name: 'Kurzantworten', desc: 'Yes, … would. / No, … wouldn\'t.', kinds: ['short'], n: 10 },
    { id: 'type', icon: '⚖️', name: 'Typ 1 oder Typ 2?', desc: 'Wahrscheinlich oder nur gedacht?', kinds: ['type'], n: 12 },
    { id: 'comma', icon: '✒️', name: 'Komma-Check', desc: 'Komma oder kein Komma?', kinds: ['comma'], n: 12 },
    { id: 'blitz', icon: '⚡', name: 'Blitz-Runde', desc: '60 Sekunden – so viele richtige Antworten wie möglich!', kinds: ['mc', 'type', 'comma', 'short'], timed: 60, highlight: true },
    { id: 'exam', icon: '🎓', name: 'Klassenarbeit', desc: '20 gemischte Aufgaben mit Note.', exam: true, highlight: true },
    { id: 'mistakes', icon: '🔁', name: 'Fehler wiederholen', desc: 'Übe gezielt deine falschen Aufgaben.', mistakes: true }
  ];
  const modeById = (id) => MODES.find((m) => m.id === id);

  function makeItems(kind, n) {
    if (kind === 'match') {
      const rounds = [];
      for (let r = 0; r < n; r++) rounds.push({ kind: 'match', id: 'match:' + r, pairs: pick(DATA.pairs.map((p, i) => ({ p, i })), 5) });
      return rounds;
    }
    const src = kind === 'comma' ? DATA.pairs : DATA[kind];
    return pick(src.map((d, i) => i), Math.min(n, src.length)).map((i) => itemFor(kind, i));
  }
  function itemFor(kind, i) {
    const src = kind === 'comma' ? DATA.pairs : DATA[kind];
    return { kind, id: kind + ':' + i, data: src[i] };
  }
  function buildQueue(mode) {
    if (mode.exam) {
      const plan = [['gap', 4], ['mc', 4], ['order', 3], ['error', 3], ['short', 2], ['type', 2], ['comma', 2]];
      return plan.flatMap(([k, n]) => makeItems(k, n));
    }
    if (mode.mistakes) {
      return shuffle(getMistakes()).slice(0, 12).map((id) => {
        const [k, i] = id.split(':');
        return itemFor(k, +i);
      }).filter((it) => it.data);
    }
    if (mode.timed) {
      // großer gemischter Vorrat für die Blitz-Runde
      return shuffle(mode.kinds.flatMap((k) => makeItems(k, 40)));
    }
    return makeItems(mode.kinds[0], mode.n);
  }

  /* =========================================================
   * App-Zustand & Grundgerüst
   * ======================================================= */
  const root = typeof CFG.mount === 'string' ? $(CFG.mount) : CFG.mount;
  if (!root) { console.error('[if2] Mount-Element nicht gefunden:', CFG.mount); return; }
  root.classList.add('if2');

  let S = null;       // laufende Session
  let timerId = null;
  let keyHandler = null;

  function setKeys(fn) { keyHandler = fn; }
  document.addEventListener('keydown', (e) => {
    if (keyHandler && !e.ctrlKey && !e.metaKey && !e.altKey) keyHandler(e);
  });

  function shell(content) {
    root.innerHTML = '';
    root.appendChild(content);
    const top = root.getBoundingClientRect().top;
    if (top < 0) window.scrollTo({ top: top + window.scrollY - 10, behavior: 'smooth' });
  }

  /* =========================================================
   * Startseite
   * ======================================================= */
  function home() {
    stopTimer(); setKeys(null); S = null;
    const p = getProfile();
    const lv = level(p.xp), cur = levelXp(lv), next = levelXp(lv + 1);
    const mistakes = getMistakes().length;
    const el = h(`
      <div class="if2-wrap">
        <header class="if2-hero">
          <div class="if2-hero-text">
            <div class="if2-badge">LF 17 · Klasse 8</div>
            <h1>If-Sätze <span>Typ 2</span></h1>
            <p class="if2-sub">„Was wäre, wenn …?“ – Conditional sentences type 2</p>
          </div>
          <div class="if2-stats">
            <div class="if2-stat"><b>${lv}</b><span>Level</span></div>
            <div class="if2-stat"><b>${p.xp}</b><span>XP</span></div>
            <div class="if2-stat"><b>🔥 ${currentDayStreak(p)}</b><span>Tage-Streak</span></div>
            <div class="if2-stat"><b>⚡ ${p.bestCombo}</b><span>Beste Serie</span></div>
          </div>
          <div class="if2-level" title="${p.xp - cur} / ${next - cur} XP bis Level ${lv + 1}">
            <div style="width:${Math.min(100, ((p.xp - cur) / (next - cur)) * 100)}%"></div>
          </div>
        </header>

        <button class="if2-learn" data-go="theory">
          <span class="if2-learn-ico">📖</span>
          <span><b>Regeln lernen</b><small>Die Grammatik verständlich erklärt – mit Beispielen und Merkhilfen</small></span>
          <span class="if2-arrow">›</span>
        </button>

        <h2 class="if2-h2">Üben</h2>
        <div class="if2-grid">
          ${MODES.map((m) => {
            const disabled = m.mistakes && !mistakes;
            const best = p.best[m.id];
            return `<button class="if2-mode ${m.highlight ? 'is-hl' : ''}" data-mode="${m.id}" ${disabled ? 'disabled' : ''}>
              <span class="if2-mode-ico">${m.icon}</span>
              <span class="if2-mode-name">${m.name}${m.mistakes ? ` <em class="if2-pill">${mistakes}</em>` : ''}</span>
              <span class="if2-mode-desc">${disabled ? 'Noch keine Fehler gesammelt 🎉' : m.desc}</span>
              ${best ? `<span class="if2-mode-best">🏆 ${best}</span>` : ''}
            </button>`;
          }).join('')}
        </div>

        <div class="if2-footer">
          <button class="if2-link" data-go="board">🏆 Bestenliste</button>
          <button class="if2-link" data-go="sound">${p.sound ? '🔊 Ton an' : '🔇 Ton aus'}</button>
        </div>
      </div>`);
    el.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.mode) start(b.dataset.mode);
      else if (b.dataset.go === 'theory') theory();
      else if (b.dataset.go === 'board') board();
      else if (b.dataset.go === 'sound') { const pr = getProfile(); pr.sound = !pr.sound; saveProfile(pr); home(); }
    });
    shell(el);
  }

  /* =========================================================
   * Theorie
   * ======================================================= */
  function theory() {
    setKeys((e) => { if (e.key === 'Escape') home(); });
    const irr = DATA.irregular.map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`).join('');
    const el = h(`
      <div class="if2-wrap">
        <div class="if2-topbar"><button class="if2-back" data-go="home">‹ Zurück</button><span>📖 Regeln</span><span></span></div>

        <section class="if2-card">
          <h2>Wofür brauche ich Typ 2?</h2>
          <p>Mit if-Sätzen Typ 2 sagst du, was unter <b>unwahrscheinlichen</b> oder <b>unsicheren</b> (nur gedachten) Bedingungen geschehen würde: <b>„Was wäre, wenn …?“</b></p>
          <div class="if2-example">
            <p class="en">I love to travel. If I <mark class="c">had</mark> enough money, I<mark class="m">'d travel</mark> everywhere.</p>
            <p class="de">Wenn ich genug Geld hätte, würde ich überall hinreisen. <i>(Sie hat das Geld aber wahrscheinlich nicht.)</i></p>
          </div>
          <p>Im Deutschen benutzt man hier oft <b>würde / wäre / hätte</b>.</p>
        </section>

        <section class="if2-card">
          <h2>Die Formel</h2>
          <div class="if2-formula">
            <div class="f-c"><small>if-Satz (Bedingung)</small><b>if + simple past</b><span>If I had …</span></div>
            <div class="f-plus">,</div>
            <div class="f-m"><small>Hauptsatz (Folge)</small><b>would / 'd + Infinitiv</b><span>… I would travel.</span></div>
          </div>
          <ol class="if2-rules">
            <li>Die (unwahrscheinliche) <b>Bedingung</b> steht im if-Satz. Das Verb steht im <b>simple past</b>: <i>If my friend Tina <mark class="c">won</mark> a ticket, …</i></li>
            <li>Die (unsichere) <b>Folge</b> steht im Hauptsatz: <b>would</b> (Kurzform <b>'d</b>) bzw. verneint <b>wouldn't</b> + Infinitiv: <i>… she <mark class="m">wouldn't use</mark> it.</i></li>
            <li>Im Hauptsatz kann auch <b>could</b> („könnte“) + Infinitiv stehen: <i>If you were travelling around the world, you <mark class="m">could forget</mark> about school.</i></li>
          </ol>
        </section>

        <section class="if2-card if2-warn">
          <h2>⚠️ Die häufigsten Fehler</h2>
          <ul class="if2-dodont">
            <li><span class="no">✘</span> If I <s>would have</s> money, … <span class="yes">✔</span> If I <b>had</b> money, …<br><small>Merke: <b>Im if-Satz steht nie would!</b> („würde-Wörter“ gehören in den Hauptsatz.)</small></li>
            <li><span class="no">✘</span> If I had money, I <s>will</s> travel. <span class="yes">✔</span> … I <b>would</b> travel.<br><small>will gehört zu Typ 1.</small></li>
            <li><span class="no">✘</span> I would <s>travelled</s>. <span class="yes">✔</span> I would <b>travel</b>.<br><small>Nach would/could steht immer der Infinitiv (Grundform).</small></li>
            <li><span class="no">✘</span> I'd travel a lot<s>,</s> if I had the money. <span class="yes">✔</span> I'd travel a lot if I had the money.<br><small>Kein Komma vor dem if-Teil.</small></li>
          </ul>
        </section>

        <section class="if2-card">
          <h2>Satzstellung &amp; Komma</h2>
          <p>Der if-Satz kann <b>am Anfang oder am Ende</b> stehen (wie bei Typ 1):</p>
          <div class="if2-table2">
            <div><small>if-Satz (Bedingung)</small><i>If I <mark class="c">had</mark> the money,</i></div>
            <div><small>Hauptsatz (Folge)</small><i>I<mark class="m">'d travel</mark> a lot.</i></div>
            <div><small>Hauptsatz (Folge)</small><i>I<mark class="m">'d travel</mark> a lot</i></div>
            <div><small>if-Satz (Bedingung)</small><i>if I <mark class="c">had</mark> the money.</i></div>
          </div>
          <p class="if2-tip">❗ if-Satz vorne → <b>Komma</b> &nbsp;·&nbsp; if-Satz hinten → <b>kein Komma</b></p>
        </section>

        <section class="if2-card">
          <h2>Formen von <i>would</i></h2>
          <table class="if2-tbl">
            <thead><tr><th colspan="3">Bejahte und verneinte Aussagen</th></tr></thead>
            <tbody><tr><td>I / you / he / she / it / we / you / they</td><td><b>'d / would / wouldn't</b></td><td>travel to NYC.</td></tr></tbody>
          </table>
          <table class="if2-tbl">
            <thead><tr><th colspan="3">Fragen ohne Fragewort mit Kurzantworten</th></tr></thead>
            <tbody><tr><td><b>Would</b> I / you / he / she / it / we / they</td><td>travel to NYC?</td><td>Yes, … <b>would</b>.<br>No, … <b>wouldn't</b>.</td></tr></tbody>
          </table>
          <div class="if2-example">
            <p class="en"><mark class="m">Would</mark> you go on a trip around the world if you <mark class="c">had</mark> the chance? – Yes, I <mark class="m">would</mark>.</p>
            <p class="de">Würdest du eine Weltreise machen, wenn du die Chance hättest? – Ja, würde ich.</p>
          </div>
        </section>

        <section class="if2-card">
          <h2>was oder were?</h2>
          <p>Bei <i>be</i> verwendet man im if-Satz oft <b>were</b> – auch bei I / he / she / it. Besonders in der Wendung für Ratschläge:</p>
          <div class="if2-example"><p class="en">If I <mark class="c">were</mark> you, I<mark class="m">'d</mark> ask the teacher.</p><p class="de">Wenn ich du wäre, würde ich die Lehrerin fragen.</p></div>
          <p class="if2-muted">Umgangssprachlich hört man auch <i>If I was …</i> – in der Klassenarbeit ist <b>were</b> immer richtig.</p>
        </section>

        <section class="if2-card">
          <h2>Typ 1 oder Typ 2?</h2>
          <div class="if2-compare">
            <div><h3>Typ 1 – realistisch</h3><p>if + <b>simple present</b> → <b>will</b> + Infinitiv</p><i>If it rains tomorrow, we will stay at home.</i><small>Das kann gut passieren.</small></div>
            <div><h3>Typ 2 – unwahrscheinlich</h3><p>if + <b>simple past</b> → <b>would</b> + Infinitiv</p><i>If it snowed in July, we would build a snowman.</i><small>Das ist eher nur gedacht.</small></div>
          </div>
        </section>

        <section class="if2-card">
          <h2>Wichtige unregelmäßige Verben</h2>
          <p class="if2-muted">Für den if-Satz brauchst du das simple past:</p>
          <table class="if2-tbl if2-irr"><thead><tr><th>Infinitiv</th><th>simple past</th></tr></thead><tbody>${irr}</tbody></table>
        </section>

        <div class="if2-center"><button class="if2-btn" data-mode="mc">Jetzt üben 🚀</button></div>
      </div>`);
    el.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.go === 'home') home();
      if (b.dataset.mode) start(b.dataset.mode);
    });
    shell(el);
  }

  /* =========================================================
   * Session
   * ======================================================= */
  function start(modeId) {
    const mode = modeById(modeId);
    const queue = buildQueue(mode);
    if (!queue.length) { home(); return; }
    S = {
      mode, queue, idx: 0, score: 0, combo: 0, bestCombo: 0, correct: 0, total: 0,
      hints: 0, started: Date.now(), wrongIds: [], log: [],
      timeLeft: mode.timed || 0, ended: false
    };
    emit('start', { mode: mode.id });
    renderQuestion();
    if (mode.timed) startTimer();
  }

  function startTimer() {
    stopTimer();
    timerId = setInterval(() => {
      if (!S) return stopTimer();
      S.timeLeft--;
      const t = $('.if2-timer', root);
      if (t) { t.textContent = '⏱ ' + S.timeLeft + 's'; t.classList.toggle('is-low', S.timeLeft <= 10); }
      const bar = $('.if2-progress > div', root);
      if (bar) bar.style.width = (S.timeLeft / S.mode.timed) * 100 + '%';
      if (S.timeLeft <= 0) { stopTimer(); finish(); }
    }, 1000);
  }
  function stopTimer() { if (timerId) clearInterval(timerId); timerId = null; }

  const multiplier = () => 1 + Math.min(S.combo, 10) * 0.1;

  function header() {
    const m = S.mode;
    const progress = m.timed ? '' : `${Math.min(S.idx + 1, S.queue.length)} / ${S.queue.length}`;
    const pct = m.timed ? (S.timeLeft / m.timed) * 100 : (S.idx / S.queue.length) * 100;
    return `
      <div class="if2-topbar">
        <button class="if2-back" data-act="quit">✕</button>
        <span class="if2-title">${m.icon} ${m.name}</span>
        ${m.timed ? `<span class="if2-timer">⏱ ${S.timeLeft}s</span>` : `<span class="if2-prog-txt">${progress}</span>`}
      </div>
      <div class="if2-progress"><div style="width:${pct}%"></div></div>
      <div class="if2-hud">
        <span class="if2-score">⭐ <b>${S.score}</b></span>
        <span class="if2-combo ${S.combo >= 3 ? 'is-hot' : ''}">🔥 Serie <b>${S.combo}</b>${S.combo >= 1 ? ` <small>×${multiplier().toFixed(1)}</small>` : ''}</span>
      </div>`;
  }

  const KIND_LABEL = {
    gap: 'Setze die Verben in der richtigen Form ein.',
    mc: 'Wähle die richtige Antwort.',
    order: 'Bilde den englischen Satz. Achtung: Zwei Bausteine sind zu viel!',
    error: 'Klicke auf den fehlerhaften Satzteil – oder auf „Satz ist korrekt“.',
    match: 'Verbinde die passenden Satzhälften.',
    short: 'Gib die passende Kurzantwort.',
    type: 'Ist das ein if-Satz Typ 1 oder Typ 2?',
    comma: 'Komma oder kein Komma an der markierten Stelle?'
  };

  function renderQuestion() {
    if (!S) return;
    if (S.idx >= S.queue.length) {
      if (S.mode.timed) { S.queue = S.queue.concat(buildQueue(S.mode)); } else { finish(); return; }
    }
    const item = S.queue[S.idx];
    const el = h(`<div class="if2-wrap if2-session">${header()}<div class="if2-card if2-q"><p class="if2-instr">${KIND_LABEL[item.kind]}</p><div class="if2-body"></div><div class="if2-feedback" aria-live="polite"></div><div class="if2-actions"></div></div></div>`);
    el.querySelector('[data-act="quit"]').addEventListener('click', () => {
      if (S && S.total > 0 && !confirm('Runde wirklich abbrechen? Dein Fortschritt geht verloren.')) return;
      stopTimer(); home();
    });
    shell(el);
    RENDER[item.kind](item, $('.if2-body', el), $('.if2-actions', el));
  }

  // Ergebnis einer Aufgabe verbuchen
  function answer(item, ok, info) {
    info = info || {};
    S.total++;
    let pts = 0;
    if (ok) {
      S.correct++;
      pts = Math.round(10 * multiplier() * (info.hint ? 0.5 : 1));
      S.combo++;
      S.bestCombo = Math.max(S.bestCombo, S.combo);
      S.score += pts;
      beep('ok');
    } else {
      S.combo = 0;
      if (!S.wrongIds.includes(item.id) && item.kind !== 'match') S.wrongIds.push(item.id);
      beep('bad');
    }
    if (S.mode.mistakes && ok) {
      setMistakes(getMistakes().filter((id) => id !== item.id));
    }
    S.log.push({ id: item.id, ok });
    emit('answer', { mode: S.mode.id, itemId: item.id, correct: ok, points: pts, combo: S.combo });
    // HUD aktualisieren
    const hud = $('.if2-hud', root);
    if (hud) hud.outerHTML = h('<div>' + header() + '</div>').querySelector('.if2-hud').outerHTML;
    return pts;
  }

  function feedback(ok, html, pts) {
    const fb = $('.if2-feedback', root);
    if (!fb) return;
    fb.className = 'if2-feedback ' + (ok ? 'is-ok' : 'is-bad');
    fb.innerHTML = `<div class="if2-fb-head">${ok ? `✔ Richtig!${pts ? ` <span>+${pts}</span>` : ''}` : '✘ Leider falsch'}</div>${html ? `<div class="if2-fb-body">${html}</div>` : ''}`;
  }

  // "Weiter"-Button bzw. automatischer Wechsel in der Blitz-Runde
  function next(actions, ok) {
    if (S.mode.timed) {
      setKeys(null);
      const sess = S;
      setTimeout(() => { if (S === sess && !S.ended) { S.idx++; renderQuestion(); } }, ok ? 450 : 1300);
      return;
    }
    actions.innerHTML = '';
    const b = h(`<button class="if2-btn">${S.idx + 1 >= S.queue.length ? 'Auswertung' : 'Weiter'} <kbd>↵</kbd></button>`);
    const sess = S;
    let gone = false;
    const go = () => { if (gone || S !== sess) return; gone = true; setKeys(null); S.idx++; renderQuestion(); };
    b.addEventListener('click', go);
    actions.appendChild(b);
    b.focus({ preventScroll: true });
    setTimeout(() => setKeys((e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } }), 50);
  }

  /* =========================================================
   * Aufgabentypen
   * ======================================================= */
  const RENDER = {};

  // Gemeinsame Auswahlknöpfe (MC, Kurzantworten, Typ, Komma)
  function choices(body, actions, options, correctIdx, item, explain, opts) {
    opts = opts || {};
    const wrap = h(`<div class="if2-choices ${opts.cols ? 'cols-' + opts.cols : ''}"></div>`);
    options.forEach((o, i) => {
      const b = h(`<button class="if2-choice"><kbd>${i + 1}</kbd><span>${o}</span></button>`);
      b.addEventListener('click', () => choose(i));
      wrap.appendChild(b);
    });
    body.appendChild(wrap);
    let done = false;
    function choose(i) {
      if (done) return;
      done = true;
      const ok = i === correctIdx;
      const btns = wrap.querySelectorAll('.if2-choice');
      btns.forEach((b, j) => { b.disabled = true; if (j === correctIdx) b.classList.add('is-ok'); else if (j === i) b.classList.add('is-bad'); });
      const pts = answer(item, ok);
      feedback(ok, explain, pts);
      next(actions, ok);
    }
    setKeys((e) => { const n = parseInt(e.key, 10); if (n >= 1 && n <= options.length) choose(n - 1); });
  }

  /* ---- Lückentext ---- */
  RENDER.gap = function (item, body, actions) {
    const d = item.data;
    let k = 0;
    const html = esc(d.s).replace(/\{\}\s*\(([^)]*)\)/g, (_, verb) => {
      const i = k++;
      const w = Math.max(6, d.a[i].split('|')[0].length + 1);
      return `<span class="if2-gapwrap"><input class="if2-gap" data-i="${i}" autocomplete="off" autocapitalize="off" spellcheck="false" style="width:${w}ch" aria-label="Lücke ${i + 1}"><small>(${verb})</small></span>`;
    }).replace(/\{\}/g, () => { const i = k++; return `<input class="if2-gap" data-i="${i}" autocomplete="off">`; });
    body.appendChild(h(`<p class="if2-sentence">${html}</p>`));
    const inputs = [...body.querySelectorAll('.if2-gap')];
    let hint = false, done = false;
    const check = h('<button class="if2-btn">Prüfen <kbd>↵</kbd></button>');
    const tip = h('<button class="if2-btn ghost">💡 Tipp <small>(halbe Punkte)</small></button>');
    actions.append(tip, check);
    tip.addEventListener('click', () => {
      hint = true; S.hints++; tip.disabled = true;
      const lines = d.r.split('').map((r, i) => {
        const words = d.a[i].split('|')[0].split(' ');
        const last = words.pop();
        const start = (words.length ? words.join(' ') + ' ' + last[0] : last.slice(0, 2)) + '…';
        const rule = r === 'i' ? 'if-Satz → <b>simple past</b>' : r === 'q' ? 'Frage → <b>would + Subjekt + Infinitiv</b>' : 'Hauptsatz → <b>would/could + Infinitiv</b>';
        return `Lücke ${i + 1}: ${rule} · beginnt mit „<b>${esc(start)}</b>“`;
      });
      const fb = $('.if2-feedback', root);
      fb.className = 'if2-feedback is-hint'; fb.innerHTML = lines.join('<br>');
      inputs.find((x) => !x.value) && inputs.find((x) => !x.value).focus();
    });
    function submit() {
      if (done) return;
      if (inputs.some((x) => !x.value.trim())) { inputs.find((x) => !x.value.trim()).focus(); return; }
      done = true;
      let ok = true;
      inputs.forEach((x, i) => {
        const good = matches(x.value, d.a[i]);
        x.classList.add(good ? 'is-ok' : 'is-bad');
        x.readOnly = true;
        if (!good) ok = false;
      });
      const pts = answer(item, ok, { hint });
      const sol = d.a.map((a, i) => `<b>${i + 1}.</b> ${esc(a.split('|').join(' / '))}`).join(' &nbsp; ');
      const words = d.a.map((a) => a.split('|')[0]);
      let filled = esc(d.s); let j = 0;
      filled = filled.replace(/\{\}\s*\([^)]*\)/g, () => `<mark class="${d.r[j] === 'i' ? 'c' : 'm'}">${esc(words[j++])}</mark>`);
      feedback(ok, `${ok ? '' : `Lösung: ${sol}<br>`}<span class="if2-solved">${filled}</span>`, pts);
      tip.remove(); check.remove();
      next(actions, ok);
    }
    check.addEventListener('click', submit);
    inputs.forEach((x, i) => x.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); if (i < inputs.length - 1 && !inputs[i + 1].value) inputs[i + 1].focus(); else submit(); }
    }));
    setKeys(null);
    setTimeout(() => inputs[0].focus({ preventScroll: true }), 30);
  };

  /* ---- Multiple Choice ---- */
  RENDER.mc = function (item, body, actions) {
    const d = item.data;
    const order = shuffle(d.o.map((o, i) => i));
    const q = esc(d.q).replace('___', '<span class="if2-blank">_____</span>');
    body.appendChild(h(`<p class="if2-sentence">${q}</p>`));
    const longOpts = d.o.some((o) => o.length > 28);
    choices(body, actions, order.map((i) => esc(d.o[i])), order.indexOf(0), item, esc(d.e), { cols: longOpts ? 1 : 2 });
  };

  /* ---- Kurzantworten ---- */
  RENDER.short = function (item, body, actions) {
    const d = item.data;
    const yes = Math.random() < 0.5;
    const P = d.p;
    const doForm = ['he', 'she', 'it'].includes(d.p) ? 'does' : 'do';
    const correct = yes ? `Yes, ${P} would.` : `No, ${P} wouldn't.`;
    const pool = yes
      ? [`Yes, ${P} will.`, `Yes, ${P} ${doForm}.`, `No, ${P} wouldn't.`, `Yes, ${P} did.`, `Yes, ${P} would go.`]
      : [`No, ${P} won't.`, `No, ${P} didn't.`, `Yes, ${P} would.`, `No, ${P} would.`, `No, ${P} ${doForm === 'does' ? "doesn't" : "don't"}.`];
    const opts = shuffle([correct].concat(pick(pool, 3)));
    body.appendChild(h(`<div><p class="if2-sentence">${esc(d.q)}</p><p class="if2-polarity ${yes ? 'yes' : 'no'}">Antworte ${yes ? '<b>mit „Ja“</b> 👍' : '<b>mit „Nein“</b> 👎'}</p></div>`));
    choices(body, actions, opts.map(esc), opts.indexOf(correct), item,
      `Frage mit <b>Would</b> → Kurzantwort mit <b>would</b> / <b>wouldn't</b>: ${esc(correct)}`, { cols: 2 });
  };

  /* ---- Typ 1 oder Typ 2 ---- */
  RENDER.type = function (item, body, actions) {
    const d = item.data;
    body.appendChild(h(`<p class="if2-sentence">${esc(d.s)}</p>`));
    const ex = d.t === 1
      ? 'Typ 1: if + <b>simple present</b>, Hauptsatz mit <b>will</b> (oder can / Imperativ) → die Bedingung ist <b>realistisch</b>.'
      : 'Typ 2: if + <b>simple past</b>, Hauptsatz mit <b>would / could</b> → die Bedingung ist <b>unwahrscheinlich</b> oder nur gedacht.';
    choices(body, actions, ['<b>Typ 1</b><small>realistisch / wahrscheinlich</small>', '<b>Typ 2</b><small>unwahrscheinlich / gedacht</small>'], d.t - 1, item, ex, { cols: 2 });
  };

  /* ---- Komma-Check ---- */
  RENDER.comma = function (item, body, actions) {
    const [cond, main] = item.data;
    const ifFirst = Math.random() < 0.5;
    const slot = '<span class="if2-slot">?</span>';
    const sentence = ifFirst
      ? `${esc(cond)}${slot} ${esc(main)}.`
      : `${esc(cap(main))}${slot} ${esc(cond.replace(/^If/, 'if'))}.`;
    body.appendChild(h(`<p class="if2-sentence">${sentence}</p>`));
    const ex = ifFirst
      ? 'Der if-Satz steht <b>vorne</b> → Komma: <i>' + esc(cond) + '<b>,</b> ' + esc(main) + '.</i>'
      : 'Der if-Satz steht <b>hinten</b> → <b>kein</b> Komma vor dem if-Teil.';
    choices(body, actions, ['<b>,</b> &nbsp;Komma', '∅ &nbsp;Kein Komma'], ifFirst ? 0 : 1, item, ex, { cols: 2 });
  };

  /* ---- Fehlerjagd ---- */
  RENDER.error = function (item, body, actions) {
    const d = item.data;
    const wrap = h('<div class="if2-chunks"></div>');
    d.p.forEach((t, i) => {
      const b = h(`<button class="if2-chunk">${esc(t)}</button>`);
      b.addEventListener('click', () => choose(i));
      wrap.appendChild(b);
    });
    body.appendChild(wrap);
    const okBtn = h('<button class="if2-btn ghost">✔ Satz ist korrekt</button>');
    okBtn.addEventListener('click', () => choose(-1));
    actions.appendChild(okBtn);
    let done = false;
    function choose(i) {
      if (done) return; done = true;
      const ok = i === d.w;
      const chunks = wrap.querySelectorAll('.if2-chunk');
      chunks.forEach((c, j) => { c.disabled = true; if (j === d.w) c.classList.add('is-wrong-part'); if (j === i && !ok) c.classList.add('is-bad'); });
      if (i === d.w && i >= 0) chunks[i].classList.add('is-ok');
      const pts = answer(item, ok);
      const fix = d.w >= 0 ? `Korrektur: <s>${esc(d.p[d.w])}</s> → <b>${esc(d.f)}</b><br>` : '';
      const corrected = d.w >= 0 ? d.p.map((t, j) => j === d.w ? `<mark class="m">${esc(d.f)}</mark>` : esc(t)).join(' ') : esc(d.p.join(' '));
      feedback(ok, `${fix}${esc(d.e)}<br><span class="if2-solved">${corrected}</span>`, pts);
      okBtn.remove();
      next(actions, ok);
    }
    setKeys((e) => { const n = parseInt(e.key, 10); if (n >= 1 && n <= d.p.length) choose(n - 1); else if (e.key === '0' || e.key.toLowerCase() === 'k') choose(-1); });
  };

  /* ---- Satzbau ---- */
  RENDER.order = function (item, body, actions) {
    const d = item.data;
    const target = d.en.split(' ');
    let tiles = shuffle(target.concat(d.x).map((t, i) => ({ t, i })));
    let guard = 0;
    while (tiles.slice(0, target.length).map((x) => x.t).join(' ') === d.en && guard++ < 5) tiles = shuffle(tiles);
    const picked = [];
    body.appendChild(h(`<p class="if2-de">🇩🇪 ${esc(d.de)}</p>`));
    const line = h('<div class="if2-line" aria-label="Deine Antwort"></div>');
    const pool = h('<div class="if2-pool"></div>');
    body.append(line, pool);
    let done = false;
    function draw() {
      line.innerHTML = picked.length ? '' : '<span class="if2-ph">Tippe die Wörter in der richtigen Reihenfolge an …</span>';
      picked.forEach((tile, pi) => {
        const b = h(`<button class="if2-tile">${esc(tile.t)}</button>`);
        b.addEventListener('click', () => { if (done) return; picked.splice(pi, 1); draw(); });
        line.appendChild(b);
      });
      pool.innerHTML = '';
      tiles.forEach((tile) => {
        const used = picked.includes(tile);
        const b = h(`<button class="if2-tile ${used ? 'is-used' : ''}" ${used ? 'disabled' : ''}>${esc(tile.t)}</button>`);
        b.addEventListener('click', () => { if (done) return; picked.push(tile); draw(); });
        pool.appendChild(b);
      });
      check.disabled = picked.length === 0;
    }
    const reset = h('<button class="if2-btn ghost">↺ Zurücksetzen</button>');
    const check = h('<button class="if2-btn">Prüfen <kbd>↵</kbd></button>');
    reset.addEventListener('click', () => { if (done) return; picked.length = 0; draw(); });
    check.addEventListener('click', submit);
    actions.append(reset, check);
    function submit() {
      if (done || !picked.length) return;
      done = true;
      const ans = picked.map((x) => x.t).join(' ');
      const ok = ans === d.en;
      line.classList.add(ok ? 'is-ok' : 'is-bad');
      const pts = answer(item, ok);
      feedback(ok, ok ? `<span class="if2-solved">${esc(d.en)}</span>` : `Richtig wäre:<br><span class="if2-solved">${esc(d.en)}</span>`, pts);
      reset.remove(); check.remove();
      next(actions, ok);
    }
    draw();
    setKeys((e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } else if (e.key === 'Backspace' && !done) { e.preventDefault(); picked.pop(); draw(); } });
  };

  /* ---- Satzhälften verbinden ---- */
  RENDER.match = function (item, body, actions) {
    const pairs = item.pairs;
    const left = shuffle(pairs), right = shuffle(pairs);
    const grid = h(`<div class="if2-match">
      <div class="col-l">${left.map((x) => `<button class="if2-mitem" data-k="${x.i}">${esc(x.p[0])} …</button>`).join('')}</div>
      <div class="col-r">${right.map((x) => `<button class="if2-mitem" data-k="${x.i}">… ${esc(x.p[1])}.</button>`).join('')}</div>
    </div>`);
    body.appendChild(grid);
    let sel = null, found = 0, errors = 0;
    const failed = new Set();
    grid.addEventListener('click', (e) => {
      const b = e.target.closest('.if2-mitem');
      if (!b || b.disabled) return;
      const isLeft = !!b.closest('.col-l');
      if (!sel || sel.isLeft === isLeft) {
        grid.querySelectorAll('.is-sel').forEach((x) => x.classList.remove('is-sel'));
        sel = { b, isLeft }; b.classList.add('is-sel');
        return;
      }
      const a = sel.b; sel = null;
      a.classList.remove('is-sel');
      const ok = a.dataset.k === b.dataset.k;
      const leftKey = isLeft ? b.dataset.k : a.dataset.k;
      if (ok) {
        found++;
        [a, b].forEach((x) => { x.disabled = true; x.classList.add('is-ok'); x.dataset.n = found; });
        a.style.setProperty('--n', found); b.style.setProperty('--n', found);
        const pts = answer({ kind: 'match', id: 'match:' + leftKey }, !failed.has(leftKey));
        toast(failed.has(leftKey) ? '✔' : `+${pts}`);
        if (found === pairs.length) {
          feedback(errors === 0, errors === 0 ? 'Alle Paare fehlerfrei verbunden! 🎉' : `Geschafft – mit ${errors} Fehlversuch${errors > 1 ? 'en' : ''}.`, 0);
          next(actions, true);
        }
      } else {
        errors++;
        if (!failed.has(leftKey)) { failed.add(leftKey); }
        S.combo = 0; beep('bad');
        [a, b].forEach((x) => { x.classList.add('is-bad'); setTimeout(() => x.classList.remove('is-bad'), 600); });
        const hud = $('.if2-hud', root);
        if (hud) hud.outerHTML = h('<div>' + header() + '</div>').querySelector('.if2-hud').outerHTML;
      }
    });
    setKeys(null);
  };

  function toast(txt) {
    const t = h(`<div class="if2-toast">${txt}</div>`);
    root.appendChild(t);
    setTimeout(() => t.remove(), 900);
  }

  /* =========================================================
   * Auswertung
   * ======================================================= */
  function gradeFor(pct) {
    if (pct >= 92) return { n: 1, t: 'sehr gut' };
    if (pct >= 81) return { n: 2, t: 'gut' };
    if (pct >= 67) return { n: 3, t: 'befriedigend' };
    if (pct >= 50) return { n: 4, t: 'ausreichend' };
    if (pct >= 30) return { n: 5, t: 'mangelhaft' };
    return { n: 6, t: 'ungenügend' };
  }

  function finish() {
    if (!S || S.ended) return;
    S.ended = true;
    stopTimer(); setKeys(null);
    const m = S.mode;
    const accuracy = S.total ? Math.round((S.correct / S.total) * 100) : 0;
    const grade = m.exam ? gradeFor(accuracy) : null;
    // Bonus: Perfekte Runde
    const perfect = !m.timed && S.total > 0 && S.correct === S.total;
    if (perfect) S.score += 25;

    const p = getProfile();
    const isRecord = S.score > (p.best[m.id] || 0);
    const dayStreak = S.total > 0 ? touchDayStreak(p) : currentDayStreak(p);
    p.best[m.id] = Math.max(p.best[m.id] || 0, S.score);
    p.bestCombo = Math.max(p.bestCombo, S.bestCombo);
    const lvBefore = level(p.xp);
    p.xp += S.score;
    p.played++;
    p.history = (p.history || []).concat([{ mode: m.id, score: S.score, acc: accuracy, combo: S.bestCombo, at: Date.now() }]).slice(-100);
    saveProfile(p);
    if (!m.mistakes) setMistakes([...new Set(getMistakes().concat(S.wrongIds))]);
    const lvUp = level(p.xp) > lvBefore;

    const result = {
      mode: m.id,
      modeName: m.name,
      score: S.score,
      correct: S.correct,
      total: S.total,
      accuracy,
      bestCombo: S.bestCombo,
      hintsUsed: S.hints,
      perfect,
      grade: grade ? grade.n : null,
      durationMs: Date.now() - S.started,
      dayStreak,
      xpTotal: p.xp,
      level: level(p.xp),
      timestamp: new Date().toISOString()
    };
    emit('result', result);
    if (typeof CFG.submitResult === 'function') {
      Promise.resolve().then(() => CFG.submitResult(result)).catch((e) => console.error('[if2] submitResult fehlgeschlagen', e));
    }
    beep(accuracy >= 60 ? 'win' : 'bad');

    const msg = accuracy === 100 ? 'Perfekt! 🦄' : accuracy >= 80 ? 'Super gemacht! 🎉' : accuracy >= 60 ? 'Gut – weiter so! 💪' : 'Übung macht den Meister! 📚';
    const wrongList = S.wrongIds.length ? `<details class="if2-review"><summary>Deine Fehler ansehen (${S.wrongIds.length})</summary><ul>${S.wrongIds.map(describe).join('')}</ul></details>` : '';
    const el = h(`
      <div class="if2-wrap">
        <div class="if2-card if2-result">
          ${grade ? `<div class="if2-grade g${grade.n}"><b>${grade.n}</b><span>${grade.t}</span></div>` : `<div class="if2-big">${accuracy >= 80 ? '🏆' : accuracy >= 60 ? '⭐' : '📘'}</div>`}
          <h2>${msg}</h2>
          ${isRecord && S.score > 0 ? '<p class="if2-record">🎉 Neuer persönlicher Rekord!</p>' : ''}
          ${lvUp ? `<p class="if2-record">⬆️ Level ${level(p.xp)} erreicht!</p>` : ''}
          <div class="if2-res-grid">
            <div><b>${S.score}</b><span>Punkte${perfect ? ' (inkl. +25 Bonus)' : ''}</span></div>
            <div><b>${S.correct}/${S.total}</b><span>richtig (${accuracy}%)</span></div>
            <div><b>⚡ ${S.bestCombo}</b><span>beste Serie</span></div>
            <div><b>🔥 ${dayStreak}</b><span>Tage in Folge</span></div>
          </div>
          ${wrongList}
          <div class="if2-actions center">
            <button class="if2-btn ghost" data-go="home">Übersicht</button>
            ${S.wrongIds.length && !m.mistakes ? '<button class="if2-btn ghost" data-go="mistakes">🔁 Fehler üben</button>' : ''}
            <button class="if2-btn" data-go="again">Nochmal ↻</button>
          </div>
        </div>
      </div>`);
    el.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.go === 'home') home();
      if (b.dataset.go === 'again') start(m.id);
      if (b.dataset.go === 'mistakes') start('mistakes');
    });
    shell(el);
    if (accuracy >= 80) confetti();
  }

  function describe(id) {
    const [k, i] = id.split(':');
    const d = (k === 'comma' ? DATA.pairs : DATA[k] || [])[+i];
    if (!d) return '';
    switch (k) {
      case 'gap': { let j = 0; return `<li>${esc(d.s).replace(/\{\}\s*\([^)]*\)/g, () => `<b>${esc(d.a[j++].split('|')[0])}</b>`)}</li>`; }
      case 'mc': return `<li>${esc(d.q)} → <b>${esc(d.o[0])}</b></li>`;
      case 'order': return `<li>${esc(d.de)} → <b>${esc(d.en)}</b></li>`;
      case 'error': return `<li>${d.w >= 0 ? `<s>${esc(d.p[d.w])}</s> → <b>${esc(d.f)}</b>: ` : ''}${esc(d.p.join(' '))}</li>`;
      case 'short': return `<li>${esc(d.q)} → <b>Yes, ${esc(d.p)} would. / No, ${esc(d.p)} wouldn't.</b></li>`;
      case 'type': return `<li>${esc(d.s)} → <b>Typ ${d.t}</b></li>`;
      case 'comma': return `<li><b>${esc(d[0])}, ${esc(d[1])}.</b> / <b>${esc(cap(d[1]))} ${esc(d[0].replace(/^If/, 'if'))}.</b></li>`;
      default: return '';
    }
  }

  function confetti() {
    const box = h('<div class="if2-confetti" aria-hidden="true"></div>');
    const em = ['🦄', '⭐', '🎉', '✨', '🌈'];
    for (let i = 0; i < 28; i++) {
      const s = document.createElement('span');
      s.textContent = em[i % em.length];
      s.style.left = Math.random() * 100 + '%';
      s.style.animationDelay = Math.random() * 0.6 + 's';
      s.style.fontSize = 14 + Math.random() * 16 + 'px';
      box.appendChild(s);
    }
    root.appendChild(box);
    setTimeout(() => box.remove(), 2600);
  }

  /* =========================================================
   * Bestenliste
   * ======================================================= */
  function board(modeId) {
    modeId = modeId || 'blitz';
    setKeys((e) => { if (e.key === 'Escape') home(); });
    const rankable = MODES.filter((m) => !m.mistakes);
    const el = h(`
      <div class="if2-wrap">
        <div class="if2-topbar"><button class="if2-back" data-go="home">‹ Zurück</button><span>🏆 Bestenliste</span><span></span></div>
        <div class="if2-tabs">${rankable.map((m) => `<button class="if2-tab ${m.id === modeId ? 'is-on' : ''}" data-mode="${m.id}">${m.icon} ${m.name}</button>`).join('')}</div>
        <div class="if2-card"><div class="if2-board">Lade …</div></div>
      </div>`);
    el.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.go === 'home') home();
      if (b.dataset.mode) board(b.dataset.mode);
    });
    shell(el);
    const target = $('.if2-board', el);
    const renderRows = (rows, note) => {
      target.innerHTML = rows.length
        ? `<ol class="if2-rank">${rows.map((r, i) => `<li class="${r.isMe ? 'is-me' : ''}"><span class="pos">${['🥇', '🥈', '🥉'][i] || i + 1}</span><span class="nm">${esc(r.name || 'Ich')}</span>${r.streak != null ? `<span class="st">🔥 ${esc(r.streak)}</span>` : ''}<b>${esc(r.score)}</b></li>`).join('')}</ol>${note || ''}`
        : '<p class="if2-muted">Noch keine Einträge – spiel eine Runde! 🚀</p>';
    };
    if (typeof CFG.fetchLeaderboard === 'function') {
      Promise.resolve().then(() => CFG.fetchLeaderboard(modeId)).then((rows) => renderRows(rows || []))
        .catch(() => renderLocal());
    } else renderLocal();
    function renderLocal() {
      const p = getProfile();
      const rows = (p.history || []).filter((x) => x.mode === modeId).sort((a, b) => b.score - a.score).slice(0, 10)
        .map((x) => ({ name: new Date(x.at).toLocaleDateString('de-DE') + ` · ${x.acc}%`, score: x.score, isMe: true }));
      renderRows(rows, '<p class="if2-muted small">Lokale Bestenliste (nur dieses Gerät). Melde dich an, um dich mit anderen zu messen.</p>');
    }
  }

  /* =========================================================
   * Öffentliche API
   * ======================================================= */
  window.IfType2Trainer = {
    appId: APP_ID,
    version: APP_VERSION,
    modes: MODES.map((m) => ({ id: m.id, name: m.name })),
    setUser(user) { CFG.user = user; home(); },
    configure(opts) { Object.assign(CFG, opts || {}); },
    getStats() { const p = getProfile(); return { xp: p.xp, level: level(p.xp), best: p.best, bestCombo: p.bestCombo, dayStreak: currentDayStreak(p), played: p.played, openMistakes: getMistakes().length }; },
    start(modeId) { if (modeById(modeId)) start(modeId); },
    home
  };

  home();
  emit('ready', { modes: window.IfType2Trainer.modes });
})();
