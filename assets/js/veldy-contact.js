/*
 * veldy-contact.js — local (non-Framer) enhancements
 * 1. Adds a "Contact" item to the footer social row (cloned from the Kakao link so it
 *    matches the site style) that opens a contact popup.
 * 2. The popup shows the email and opens Gmail compose when clicked.
 * 3. Fixes the broken email link (https://veldy.official@gmail.com) to open Gmail.
 *
 * Runs after Framer hydration (static export = full page loads, no SPA re-render),
 * and re-applies a couple of times to be safe.
 */
(function () {
  var EMAIL = 'veldy.official@gmail.com';
  var GMAIL = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(EMAIL);
  var BROKEN = 'https://veldy.official@gmail.com';

  function ensureStyle() {
    if (document.getElementById('veldy-contact-style')) return;
    var css =
      '.vc-overlay{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;' +
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
    document.head.appendChild(s);
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

    function close() { overlay.classList.remove('vc-open'); document.removeEventListener('keydown', onKey); setTimeout(function(){ overlay.style.display = 'none'; }, 200); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    overlay._open = function () { overlay.style.display = 'flex'; document.addEventListener('keydown', onKey); requestAnimationFrame(function(){ overlay.classList.add('vc-open'); }); };
    overlay._close = close;
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    overlay.querySelector('.vc-close').addEventListener('click', close);
    overlay.querySelector('[data-vc-copy]').addEventListener('click', function () {
      var done = function () { var t = overlay.querySelector('.vc-copied'); t.classList.add('vc-show'); setTimeout(function(){ t.classList.remove('vc-show'); }, 1400); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(EMAIL).then(done, done); else done();
    });
    overlay.style.display = 'none';
    return overlay;
  }

  function openPopup(e) { if (e) { e.preventDefault(); e.stopPropagation(); } buildPopup()._open(); }

  // Rebuild the rolling-text letters of a cloned social link to a new label.
  function relabel(anchor, label) {
    var ps = anchor.querySelectorAll('p[class*="rolling-text-inner"]');
    if (!ps.length) {
      // fallback: plain text
      anchor.textContent = label;
      return;
    }
    ps.forEach(function (p) {
      var tmpl = p.querySelector('span');
      var spanStyle = tmpl ? tmpl.getAttribute('style') : '';
      p.innerHTML = '';
      for (var i = 0; i < label.length; i++) {
        var sp = document.createElement('span');
        if (spanStyle) sp.setAttribute('style', spanStyle);
        sp.textContent = label[i];
        p.appendChild(sp);
      }
    });
  }

  // append a separator (comma) span to each rolling-text line, matching the site's
  // convention where every social item except the last carries a trailing comma.
  function appendComma(anchor) {
    anchor.querySelectorAll('p[class*="rolling-text-inner"]').forEach(function (p) {
      var tmpl = p.querySelector('span');
      var sp = document.createElement('span');
      if (tmpl) sp.setAttribute('style', tmpl.getAttribute('style') || '');
      sp.textContent = ',';
      p.appendChild(sp);
    });
  }

  function addContactAfter(kakao) {
    var container = kakao.parentElement;
    if (!container) return;
    if (container.querySelector('[data-vc-contact]')) return; // already added (idempotent)

    // Kakao is no longer the last item -> give it a trailing comma to match siblings.
    if (!kakao.hasAttribute('data-vc-comma')) { kakao.setAttribute('data-vc-comma', '1'); appendComma(kakao); }

    var clone = kakao.cloneNode(true);
    clone.removeAttribute('data-vc-comma');
    clone.setAttribute('data-vc-contact', '1');
    clone.setAttribute('data-framer-name', 'Contact');
    clone.removeAttribute('href');
    clone.removeAttribute('target');
    clone.style.cursor = 'pointer';
    relabel(clone, 'Contact');
    clone.addEventListener('click', openPopup);
    if (kakao.nextSibling) container.insertBefore(clone, kakao.nextSibling);
    else container.appendChild(clone);
  }

  function addFooterContact() {
    // footer social links share the class framer-12fazzh; handle every Kakao instance
    // (there can be one per responsive breakpoint variant).
    var socials = document.querySelectorAll('a.framer-12fazzh');
    var found = false;
    socials.forEach(function (a) {
      if (/pf\.kakao\.com/.test(a.getAttribute('href') || '')) { found = true; addContactAfter(a); }
    });
    return found;
  }

  function fixEmailLinks() {
    document.querySelectorAll('a[href="' + BROKEN + '"], a[href="' + BROKEN + '/"]').forEach(function (a) {
      a.setAttribute('href', GMAIL);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    });
  }

  function apply() { try { addFooterContact(); fixEmailLinks(); } catch (e) {} }

  function schedule() {
    apply();
    // re-apply after hydration settles / in case Framer replaced the footer
    setTimeout(apply, 400);
    setTimeout(apply, 1200);
    setTimeout(apply, 2600);
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') schedule();
  else window.addEventListener('DOMContentLoaded', schedule);
  window.addEventListener('load', apply);
})();
