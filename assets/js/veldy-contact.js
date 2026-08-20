/*
 * veldy-contact.js — local (non-Framer) enhancements
 *
 * A standalone, fixed-position "Contact" button is planted directly on the page,
 * completely independent of Framer's DOM. Framer re-renders its own tree on every
 * responsive breakpoint change, which kept deleting anything injected into the
 * footer; a body-level overlay is never touched, so it never flickers or disappears.
 * Clicking it opens a contact popup with the email / Gmail compose link.
 * Also fixes the broken contact-page email link so it opens Gmail.
 */
(function () {
  var EMAIL = 'veldy.official@gmail.com';
  var GMAIL = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(EMAIL);
  var BROKEN = 'https://veldy.official@gmail.com';

  function ensureStyle() {
    if (document.getElementById('veldy-contact-style')) return;
    var css =
      /* fixed Contact button (top-right, independent overlay) */
      '#vc-fab{position:fixed;top:16px;right:16px;z-index:2147483000;' +
      'display:inline-flex;align-items:center;gap:7px;height:40px;padding:0 18px;' +
      'border-radius:999px;background:#fff;color:#000;cursor:pointer;' +
      'font-family:"Inter Display","Inter Display Placeholder",sans-serif;font-size:14px;font-weight:600;' +
      'line-height:1;border:1px solid #fff;box-shadow:0 6px 22px rgba(0,0,0,.35);' +
      '-webkit-tap-highlight-color:transparent;user-select:none;transition:transform .15s ease,opacity .15s ease}' +
      '#vc-fab:hover{transform:translateY(-1px);opacity:.9}' +
      '#vc-fab svg{width:15px;height:15px;display:block}' +
      '@media (max-width:809px){#vc-fab{top:12px;right:12px;height:36px;padding:0 15px;font-size:13px}}' +
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
    overlay._close = close;
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

  // Standalone fixed Contact button, planted on the page independent of Framer.
  function createFab() {
    if (document.getElementById('vc-fab')) return;
    if (!document.body) return;
    ensureStyle();
    var fab = document.createElement('button');
    fab.id = 'vc-fab';
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Contact');
    fab.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="m4 6 8 6 8-6"/></svg>' +
      '<span>Contact</span>';
    fab.addEventListener('click', openPopup);
    document.body.appendChild(fab);
  }

  function fixEmailLinks() {
    document.querySelectorAll('a[href="' + BROKEN + '"], a[href="' + BROKEN + '/"]').forEach(function (a) {
      a.setAttribute('href', GMAIL);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    });
  }

  function apply() { try { createFab(); fixEmailLinks(); } catch (e) {} }

  function schedule() {
    window.__vcLoaded = true;
    apply();
    setTimeout(apply, 500);
    setTimeout(apply, 1500);
    // Re-plant the button if anything ever removes it (it lives outside Framer's tree,
    // so this is just a cheap safety net).
    try {
      new MutationObserver(function () { if (!document.getElementById('vc-fab')) createFab(); if (document.querySelector('a[href="' + BROKEN + '"]')) fixEmailLinks(); })
        .observe(document.documentElement, { childList: true, subtree: true });
    } catch (e) {}
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') schedule();
  else window.addEventListener('DOMContentLoaded', schedule);
  window.addEventListener('load', apply);
})();
