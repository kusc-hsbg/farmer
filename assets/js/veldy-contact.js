/*
 * veldy-contact.js — local (non-Framer) enhancements
 *
 * "Contact" is rendered as an independent overlay element that is NOT part of
 * Framer's DOM (so Framer's responsive re-renders can never delete it), yet is
 * positioned to sit right after the footer "Kakao" link and styled to match the
 * footer links — so it looks like a natural part of the footer ("Instagram, Blog,
 * Kakao, Contact"). Clicking it opens a contact popup (email / Gmail compose).
 * Also fixes the broken contact-page email link so it opens Gmail.
 */
(function () {
  var EMAIL = 'veldy.official@gmail.com';
  var GMAIL = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(EMAIL);
  var BROKEN = 'https://veldy.official@gmail.com';

  function ensureStyle() {
    if (document.getElementById('veldy-contact-style')) return;
    var css =
      /* independent Contact link, positioned to match the footer social links */
      '#vc-contact{position:absolute;z-index:2147483000;margin:0;padding:0;cursor:pointer;' +
      'font-family:"Inter Display","Inter Display Placeholder",sans-serif;font-size:14px;font-weight:600;' +
      'line-height:17px;letter-spacing:0;white-space:pre;text-decoration:none;' +
      'color:var(--token-af1df47b-ea84-448e-bdf0-a5ce0f875a59,#999);' +
      '-webkit-font-smoothing:antialiased;transition:color .2s ease}' +
      '#vc-contact:hover{color:var(--token-9811e40b-3ed8-4237-98e5-61535bb22d2f,#fff)}' +
      /* popup */
      '.vc-overlay{position:fixed;inset:0;z-index:2147483600;display:flex;align-items:center;justify-content:center;' +
      'background:rgba(0,0,0,.66);opacity:0;transition:opacity .18s ease;padding:20px}' +
      '.vc-overlay.vc-open{opacity:1}' +
      '.vc-card{position:relative;width:100%;max-width:360px;background:#111;border:1px solid rgba(255,255,255,.12);' +
      'border-radius:16px;padding:28px 26px;color:#fff;font-family:"Inter Display","Inter Display Placeholder",sans-serif;' +
      'transform:translateY(8px) scale(.98);transition:transform .18s ease}' +
      '.vc-overlay.vc-open .vc-card{transform:none}' +
      '.vc-eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#999;margin:0 0 14px}' +
      '.vc-email{display:block;font-size:20px;font-weight:600;color:#fff;text-decoration:none;word-break:break-all;line-height:1.3;margin:0 0 22px}' +
      '.vc-email:hover{color:#bbb}' +
      '.vc-actions{display:flex;gap:10px}' +
      '.vc-btn{flex:1;display:inline-flex;align-items:center;justify-content:center;height:44px;border-radius:10px;' +
      'font-size:14px;font-weight:600;text-decoration:none;cursor:pointer;border:1px solid rgba(255,255,255,.14);' +
      'background:transparent;color:#fff;transition:background .15s,border-color .15s}' +
      '.vc-btn:hover{background:rgba(255,255,255,.06)}' +
      '.vc-btn-primary{background:#fff;color:#000;border-color:#fff}' +
      '.vc-btn-primary:hover{background:#e6e6e6}' +
      '.vc-close{position:absolute;top:12px;right:12px;width:30px;height:30px;border:0;background:transparent;' +
      'color:#999;font-size:20px;line-height:30px;cursor:pointer;border-radius:8px}' +
      '.vc-close:hover{color:#fff;background:rgba(255,255,255,.08)}' +
      '.vc-copied{position:absolute;left:50%;bottom:-30px;transform:translateX(-50%);font-size:12px;color:#9f9;opacity:0;transition:opacity .2s}' +
      '.vc-copied.vc-show{opacity:1}';
    var s = document.createElement('style');
    s.id = 'veldy-contact-style';
    s.textContent = css;
    (document.head || document.documentElement).appendChild(s);
  }

  var overlay = null;
  function buildPopup() {
    if (overlay) return overlay;
    ensureStyle();
    overlay = document.createElement('div');
    overlay.className = 'vc-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML =
      '<div class="vc-card">' +
      '<button class="vc-close" aria-label="Close">×</button>' +
      '<p class="vc-eyebrow">Contact</p>' +
      '<a class="vc-email" href="' + GMAIL + '" target="_blank" rel="noopener">' + EMAIL + '</a>' +
      '<div class="vc-actions">' +
      '<a class="vc-btn vc-btn-primary" href="' + GMAIL + '" target="_blank" rel="noopener">Gmail로 보내기</a>' +
      '<button class="vc-btn" type="button" data-vc-copy>이메일 복사</button>' +
      '</div>' +
      '<span class="vc-copied">복사됨</span>' +
      '</div>';
    document.body.appendChild(overlay);
    function close() { overlay.classList.remove('vc-open'); document.removeEventListener('keydown', onKey); setTimeout(function () { overlay.style.display = 'none'; }, 200); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    overlay._open = function () { overlay.style.display = 'flex'; document.addEventListener('keydown', onKey); requestAnimationFrame(function () { overlay.classList.add('vc-open'); }); };
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

  function getEl() {
    var el = document.getElementById('vc-contact');
    if (!el) {
      ensureStyle();
      el = document.createElement('a');
      el.id = 'vc-contact';
      el.setAttribute('role', 'button');
      el.setAttribute('data-vc-contact', '1');
      el.textContent = 'Contact';
      el.addEventListener('click', openPopup);
      document.body.appendChild(el);
    }
    return el;
  }

  // Find the currently visible footer "Kakao" link (there can be one per breakpoint).
  function visibleKakao() {
    var list = document.querySelectorAll('a.framer-12fazzh');
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      if (!/pf\.kakao\.com/.test(a.getAttribute('href') || '')) continue;
      var r = a.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) return a;
    }
    return null;
  }

  // Anchor the Contact overlay right after Kakao, in document coordinates so it
  // scrolls naturally with the footer.
  function position() {
    var kakao = visibleKakao();
    var el = getEl();
    if (!kakao) { el.style.display = 'none'; return; }
    var r = kakao.getBoundingClientRect();
    el.style.display = 'block';
    el.style.height = r.height + 'px';
    el.style.lineHeight = r.height + 'px';
    // Place Contact on a new line directly under the social row, right-aligned to the
    // row's right edge (where Kakao ends) so it never overflows the viewport.
    el.style.top = (r.bottom + window.scrollY + 4) + 'px';
    el.style.left = (r.right + window.scrollX - el.offsetWidth) + 'px';
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
