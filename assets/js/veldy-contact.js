/*
 * veldy-contact.js — local (non-Framer) enhancements
 *
 * "Contact" is rendered as an independent overlay element that is NOT part of
 * Framer's DOM (so Framer's responsive re-renders can never delete it), yet is
 * positioned to sit right after the "Kakao" link and styled to match its siblings
 * (Instagram / Blog / Kakao) — so it looks like a natural part of the row.
 *
 * Clicking it opens a contact FORM (name / email / message). Because this is a
 * static export with no server, submitting composes the message straight into the
 * user's mail client (Gmail compose, with a mailto fallback). The direct email
 * address + copy button are kept as a secondary path.
 *
 * On hover the label plays the same per-letter "rolling text" animation the Framer
 * nav items use (each letter rolls up by one line-height, staggered), implemented
 * here in plain CSS since Framer does not manage our element.
 *
 * Also fixes the broken contact-page email link so it opens Gmail.
 */
(function () {
  var EMAIL = 'veldy.official@gmail.com';
  var GMAIL = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(EMAIL);
  var BROKEN = 'https://veldy.official@gmail.com';

  // Rolling-text timing, matched to the Framer "Rolling Text" component
  // (Wt4XK6WYf.mjs): translateY(-lineHeight) per letter, staggered.
  var LINE = 17;                 // default line-height in px (nav label metrics)
  var ROLL_DUR = 0.5;            // seconds
  var ROLL_STAGGER = 0.35;       // fraction (component default 35%)
  var ROLL_EASE = 'cubic-bezier(.82,.08,.29,1)';
  var NBSP = ' ';

  function ensureStyle() {
    if (document.getElementById('veldy-contact-style')) return;
    var css =
      /* independent Contact link, positioned to match the footer social links */
      '#vc-contact{position:absolute;z-index:2147483000;margin:0;padding:0;cursor:pointer;' +
      '--vc-c1:var(--token-af1df47b-ea84-448e-bdf0-a5ce0f875a59,#999);' +
      '--vc-c2:var(--token-9811e40b-3ed8-4237-98e5-61535bb22d2f,#fff);' +
      'font-family:"Inter Display","Inter Display Placeholder",sans-serif;font-size:14px;font-weight:600;' +
      'line-height:17px;letter-spacing:0;white-space:pre;text-decoration:none;' +
      'color:var(--vc-c1);-webkit-font-smoothing:antialiased}' +
      /* rolling label — per-letter roll, staggered. Works for both the footer link
         and the contact.html primary-clone: --vc-line sets the roll distance, the
         glyph colour is inherited, and text-shadow paints the copy one line below. */
      '#vc-contact .vc-roll{display:inline-flex;overflow:hidden;' +
      'height:var(--vc-line,' + LINE + 'px);line-height:var(--vc-line,' + LINE + 'px);vertical-align:top;padding:0}' +
      '#vc-contact .vc-ch{display:block;white-space:pre;color:inherit;' +
      'text-shadow:0 var(--vc-line,' + LINE + 'px) 0 var(--vc-c2);' +
      'transition:transform ' + ROLL_DUR + 's ' + ROLL_EASE + ';' +
      '-webkit-backface-visibility:hidden;backface-visibility:hidden}' +
      '#vc-contact:hover .vc-ch{transform:translateY(calc(-1 * var(--vc-line,' + LINE + 'px)))}' +
      /* popup shell */
      '.vc-overlay{position:fixed;inset:0;z-index:2147483600;display:flex;align-items:center;justify-content:center;' +
      'background:rgba(0,0,0,.66);opacity:0;transition:opacity .18s ease;padding:20px}' +
      '.vc-overlay.vc-open{opacity:1}' +
      '.vc-card{position:relative;width:100%;max-width:400px;background:#111;border:1px solid rgba(255,255,255,.12);' +
      'border-radius:16px;padding:30px 28px 26px;color:#fff;box-sizing:border-box;' +
      'font-family:"Inter Display","Inter Display Placeholder",sans-serif;' +
      'transform:translateY(8px) scale(.98);transition:transform .18s ease}' +
      '.vc-overlay.vc-open .vc-card{transform:none}' +
      '.vc-eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#999;margin:0 0 6px}' +
      '.vc-title{font-size:19px;font-weight:600;line-height:1.3;margin:0 0 20px;color:#fff}' +
      /* form */
      '.vc-form{display:flex;flex-direction:column;gap:14px;margin:0}' +
      '.vc-field{display:flex;flex-direction:column;gap:6px}' +
      '.vc-field>span{font-size:12px;color:#9a9a9a;letter-spacing:.02em}' +
      '.vc-input,.vc-textarea{width:100%;box-sizing:border-box;background:#1b1b1b;border:1px solid rgba(255,255,255,.14);' +
      'border-radius:10px;color:#fff;font:inherit;font-size:14px;font-weight:400;padding:11px 12px;' +
      'outline:none;transition:border-color .15s,background .15s;-webkit-appearance:none}' +
      '.vc-textarea{resize:vertical;min-height:96px;line-height:1.45}' +
      '.vc-input::placeholder,.vc-textarea::placeholder{color:#666}' +
      '.vc-input:focus,.vc-textarea:focus{border-color:rgba(255,255,255,.5);background:#202020}' +
      '.vc-field.vc-invalid .vc-input,.vc-field.vc-invalid .vc-textarea{border-color:#ff5a5a;background:#241a1a}' +
      '.vc-err{font-size:11px;color:#ff7a7a;min-height:0;margin:0}' +
      '.vc-btn{flex:1;display:inline-flex;align-items:center;justify-content:center;height:46px;border-radius:10px;' +
      'font-size:14px;font-weight:600;text-decoration:none;cursor:pointer;border:1px solid rgba(255,255,255,.14);' +
      'background:transparent;color:#fff;transition:background .15s,border-color .15s;font-family:inherit}' +
      '.vc-btn:hover{background:rgba(255,255,255,.06)}' +
      '.vc-submit{width:100%;margin-top:4px}' +
      '.vc-btn-primary{background:#fff;color:#000;border-color:#fff}' +
      '.vc-btn-primary:hover{background:#e6e6e6}' +
      /* alt / direct email row */
      '.vc-alt{margin:16px 0 0;font-size:12.5px;color:#8a8a8a;display:flex;align-items:center;gap:8px;flex-wrap:wrap}' +
      '.vc-email-inline{color:#ddd;text-decoration:none;border-bottom:1px solid rgba(255,255,255,.25)}' +
      '.vc-email-inline:hover{color:#fff}' +
      '.vc-copy2{background:transparent;border:1px solid rgba(255,255,255,.16);color:#bbb;border-radius:7px;' +
      'font:inherit;font-size:11px;padding:3px 8px;cursor:pointer}' +
      '.vc-copy2:hover{color:#fff;border-color:rgba(255,255,255,.4)}' +
      /* success state */
      '.vc-success{display:none;text-align:center;padding:14px 4px 2px}' +
      '.vc-card.vc-sent .vc-form,.vc-card.vc-sent .vc-alt,.vc-card.vc-sent .vc-title{display:none}' +
      '.vc-card.vc-sent .vc-success{display:block}' +
      '.vc-success p{margin:0 0 6px;font-size:16px;font-weight:600;color:#fff}' +
      '.vc-success-sub{font-size:13px;font-weight:400;color:#999}' +
      /* close + copied toast */
      '.vc-close{position:absolute;top:12px;right:12px;width:30px;height:30px;border:0;background:transparent;' +
      'color:#999;font-size:20px;line-height:30px;cursor:pointer;border-radius:8px}' +
      '.vc-close:hover{color:#fff;background:rgba(255,255,255,.08)}' +
      '.vc-copied{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);font-size:12px;color:#9f9;opacity:0;' +
      'transition:opacity .2s;pointer-events:none}' +
      '.vc-copied.vc-show{opacity:1}';
    var s = document.createElement('style');
    s.id = 'veldy-contact-style';
    s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
  }

  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  // Compose the message into the user's mail client. Static hosting has no server,
  // so we open Gmail's compose window (with a mailto fallback if it is blocked).
  function sendMail(name, email, message) {
    var su = encodeURIComponent('[VELDY] ' + name + ' 님의 문의');
    var body = encodeURIComponent('이름: ' + name + '\n이메일: ' + email + '\n\n' + message);
    var url = GMAIL + '&su=' + su + '&body=' + body;
    var w = window.open(url, '_blank', 'noopener');
    if (!w) { window.location.href = 'mailto:' + EMAIL + '?subject=' + su + '&body=' + body; }
  }

  var overlay = null;
  function buildPopup() {
    if (overlay) return overlay;
    ensureStyle();
    overlay = document.createElement('div');
    overlay.className = 'vc-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Contact');
    overlay.innerHTML =
      '<div class="vc-card">' +
      '<button class="vc-close" type="button" aria-label="Close">×</button>' +
      '<p class="vc-eyebrow">Contact</p>' +
      '<h3 class="vc-title">프로젝트를 시작해볼까요?</h3>' +
      '<form class="vc-form" novalidate>' +
      '<label class="vc-field" data-for="name"><span>이름</span>' +
      '<input class="vc-input" name="name" type="text" autocomplete="name" placeholder="홍길동" required>' +
      '<p class="vc-err"></p></label>' +
      '<label class="vc-field" data-for="email"><span>이메일</span>' +
      '<input class="vc-input" name="email" type="email" autocomplete="email" placeholder="you@email.com" required>' +
      '<p class="vc-err"></p></label>' +
      '<label class="vc-field" data-for="message"><span>메시지</span>' +
      '<textarea class="vc-textarea" name="message" placeholder="어떤 작업이 필요하신가요?" required></textarea>' +
      '<p class="vc-err"></p></label>' +
      '<button class="vc-btn vc-btn-primary vc-submit" type="submit">보내기</button>' +
      '</form>' +
      '<div class="vc-alt">또는 직접 ' +
      '<a class="vc-email-inline" href="' + GMAIL + '" target="_blank" rel="noopener">' + EMAIL + '</a>' +
      '<button class="vc-copy2" type="button" data-vc-copy>복사</button></div>' +
      '<div class="vc-success"><p>메일 작성 창을 열었어요.</p>' +
      '<p class="vc-success-sub">보내주셔서 감사합니다. 곧 회신드릴게요.</p></div>' +
      '<span class="vc-copied">복사됨</span>' +
      '</div>';
    document.body.appendChild(overlay);

    var card = overlay.querySelector('.vc-card');
    var form = overlay.querySelector('.vc-form');

    function close() {
      overlay.classList.remove('vc-open');
      document.removeEventListener('keydown', onKey);
      setTimeout(function () { overlay.style.display = 'none'; }, 200);
    }
    function onKey(e) { if (e.key === 'Escape') close(); }

    function fieldError(name, msg) {
      var f = form.querySelector('.vc-field[data-for="' + name + '"]');
      if (!f) return;
      f.classList.toggle('vc-invalid', !!msg);
      f.querySelector('.vc-err').textContent = msg || '';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      // NB: use elements.namedItem — form.name would return the form's own name attr
      var get = function (n) { var el = form.elements.namedItem(n); return el ? el.value.trim() : ''; };
      var name = get('name');
      var email = get('email');
      var message = get('message');
      var firstBad = '';
      if (!name) { firstBad = firstBad || 'name'; fieldError('name', '이름을 입력해 주세요'); } else fieldError('name', '');
      if (!email) { firstBad = firstBad || 'email'; fieldError('email', '이메일을 입력해 주세요'); }
      else if (!isEmail(email)) { firstBad = firstBad || 'email'; fieldError('email', '올바른 이메일 형식이 아니에요'); }
      else fieldError('email', '');
      if (!message) { firstBad = firstBad || 'message'; fieldError('message', '메시지를 입력해 주세요'); } else fieldError('message', '');
      if (firstBad) {
        var bad = form.querySelector('.vc-field[data-for="' + firstBad + '"] .vc-input, .vc-field[data-for="' + firstBad + '"] .vc-textarea');
        if (bad) bad.focus();
        return;
      }
      sendMail(name, email, message);
      card.classList.add('vc-sent');
    });
    // clear a field's error as the user corrects it
    form.addEventListener('input', function (e) {
      var f = e.target.closest && e.target.closest('.vc-field');
      if (f && f.classList.contains('vc-invalid')) { f.classList.remove('vc-invalid'); f.querySelector('.vc-err').textContent = ''; }
    });

    overlay._open = function () {
      card.classList.remove('vc-sent');
      overlay.style.display = 'flex';
      document.addEventListener('keydown', onKey);
      requestAnimationFrame(function () {
        overlay.classList.add('vc-open');
        var first = form.querySelector('input,textarea'); if (first) first.focus();
      });
    };
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    overlay.querySelector('.vc-close').addEventListener('click', close);
    overlay.querySelector('[data-vc-copy]').addEventListener('click', function () {
      var done = function () { var t = overlay.querySelector('.vc-copied'); t.classList.add('vc-show'); setTimeout(function () { t.classList.remove('vc-show'); }, 1400); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(EMAIL).then(done, done); else done();
    });
    overlay.style.display = 'none';
    return overlay;
  }
  function openPopup(e) { if (e) { e.preventDefault(); e.stopPropagation(); } buildPopup()._open(); }

  function visible(a) { var r = a.getBoundingClientRect(); return r.width > 0 && r.height > 0; }

  // Turn a container into a per-letter rolling label: one .vc-ch span per character,
  // each with a staggered transition-delay so hover rolls the letters up one after
  // another (matching Framer's Rolling Text). Font/colour are inherited from `wrap`.
  function fillRolling(wrap, text) {
    wrap.classList.add('vc-roll');
    wrap.textContent = '';
    var n = text.length;
    for (var i = 0; i < n; i++) {
      var span = document.createElement('span');
      span.className = 'vc-ch';
      span.textContent = text[i] === ' ' ? NBSP : text[i];
      var delay = n > 0 ? (ROLL_DUR / n) * i * ROLL_STAGGER : 0;
      span.style.transitionDelay = delay.toFixed(3) + 's';
      wrap.appendChild(span);
    }
    return wrap;
  }
  function buildRollingLabel(text) {
    return fillRolling(document.createElement('span'), text);
  }

  // replace the visible text ("kakao") of a cloned row with a new label
  function relabelText(root, label) {
    [].forEach.call(root.querySelectorAll('*'), function (n) {
      if (n.childElementCount === 0 && /^kakao$/i.test((n.textContent || '').trim())) n.textContent = label;
    });
  }

  // Convert the cloned Primary row's label into the same per-letter rolling label so
  // it rolls on hover like the footer link. The row stacks two identical text copies
  // ("Text 1"/"Text 2") for Framer's own hover swap; we keep the first (its preset
  // font/colour) and drop the rest so nothing shows doubled. Runs after the clone is
  // in the DOM so the line-height can be measured.
  function makePrimaryRolling(el) {
    var texts = el.querySelector('[data-framer-name="Texts"]');
    if (!texts) return;
    var blocks = texts.querySelectorAll('[data-framer-name^="Text"]');
    if (!blocks.length) return;
    for (var i = blocks.length - 1; i >= 1; i--) blocks[i].parentNode.removeChild(blocks[i]);
    var p = blocks[0].querySelector('p') || blocks[0];
    var lh = parseFloat(getComputedStyle(p).lineHeight);
    if (!lh || isNaN(lh)) lh = (parseFloat(getComputedStyle(p).fontSize) || 16) * 1.2;
    var label = (p.textContent || 'Contact').trim();
    p.style.setProperty('--vc-line', lh + 'px');
    p.style.margin = '0';
    fillRolling(p, label);
  }

  // Build the Contact element once. On contact.html we clone the "Primary" kakao row
  // so the arrow, divider line and typography match exactly; elsewhere we build a
  // rolling-text link matching the footer social row.
  function getEl(mode, anchor) {
    var el = document.getElementById('vc-contact');
    if (el) return el;
    ensureStyle();
    if (mode === 'primary' && anchor) {
      el = anchor.cloneNode(true);
      el.removeAttribute('href');
      el.removeAttribute('target');
      el.removeAttribute('data-framer-appear-id');
      el.style.opacity = '1';
      el.style.transform = 'none';
      [].forEach.call(el.querySelectorAll('[data-framer-appear-id]'), function (n) {
        n.removeAttribute('data-framer-appear-id'); n.style.opacity = '1'; n.style.transform = 'none';
      });
      relabelText(el, 'Contact');
    } else {
      el = document.createElement('a');
      el.appendChild(buildRollingLabel('Contact'));
    }
    el.id = 'vc-contact';
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', 'Contact');
    el.setAttribute('data-vc-contact', '1');
    el.style.position = 'absolute';
    el.style.zIndex = '2147483000';
    el.style.margin = '0';
    el.style.cursor = 'pointer';
    el.addEventListener('click', openPopup);
    document.body.appendChild(el);
    // primary clone must be in the DOM before we can measure its line-height
    if (mode === 'primary') { try { makePrimaryRolling(el); } catch (e) {} }
    return el;
  }

  // Pick the Kakao link to sit under. On contact.html the prominent contact-section
  // list (Instagram / email / phone / kakao, "Primary" links) takes priority; on the
  // other pages we fall back to the footer social row.
  function findAnchor() {
    var prim = [].slice.call(document.querySelectorAll('a[href*="pf.kakao.com"][data-framer-name="Primary"]')).filter(visible)[0];
    if (prim) return { el: prim, mode: 'primary' };
    var foot = [].slice.call(document.querySelectorAll('a.framer-12fazzh[href*="pf.kakao.com"]')).filter(visible)[0];
    if (foot) return { el: foot, mode: 'footer' };
    return null;
  }

  // Anchor the Contact overlay on a new line directly under Kakao, in document
  // coordinates so it scrolls naturally with the page.
  function position() {
    var a = findAnchor();
    if (!a) { var ex = document.getElementById('vc-contact'); if (ex) ex.style.display = 'none'; return; }
    var el = getEl(a.mode, a.el);
    var r = a.el.getBoundingClientRect();
    el.style.display = 'block';
    if (a.mode === 'primary') {
      // cloned Primary row already carries the arrow, divider and typography.
      el.style.width = r.width + 'px';
      el.style.top = (r.bottom + window.scrollY + 10) + 'px';
      el.style.left = (r.left + window.scrollX) + 'px';
    } else {
      // match the footer social row: 14px, grey, right-aligned so it can't overflow
      el.style.height = r.height + 'px';
      el.style.lineHeight = r.height + 'px';
      el.style.fontSize = '14px';
      el.style.top = (r.bottom + window.scrollY + 4) + 'px';
      el.style.left = (r.right + window.scrollX - el.offsetWidth) + 'px';
    }
  }

  function fixEmailLinks() {
    document.querySelectorAll('a[href="' + BROKEN + '"], a[href="' + BROKEN + '/"]').forEach(function (a) {
      a.setAttribute('href', GMAIL);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    });
  }

  var pending = false;
  function apply() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; try { position(); fixEmailLinks(); } catch (e) {} });
  }

  function schedule() {
    window.__vcLoaded = true;
    apply();
    // layout settles as fonts/images load, and Framer re-renders on hydration/resize
    [120, 300, 600, 1000, 1600, 2600, 4000].forEach(function (t) { setTimeout(apply, t); });
    window.addEventListener('resize', apply);
    window.addEventListener('orientationchange', apply);
    window.addEventListener('load', apply);
    // Re-anchor whenever Framer re-renders the footer (cheap: only repositions).
    try { new MutationObserver(apply).observe(document.documentElement, { childList: true, subtree: true }); } catch (e) {}
    // Keep it aligned during layout shifts we don't get events for.
    if (window.ResizeObserver) { try { var ro = new ResizeObserver(apply); ro.observe(document.documentElement); } catch (e) {} }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') schedule();
  else window.addEventListener('DOMContentLoaded', schedule);
})();
