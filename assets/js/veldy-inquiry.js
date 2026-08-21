/*
 * veldy-inquiry.js — shared PROJECT INQUIRY form (survey modal)
 *
 * The full inquiry form used to live inline in contact.html only. This module
 * carries its markup + styles and injects them into ANY page, then opens the
 * modal whenever a "Contact" affordance is clicked (the contact-page trigger
 * row, the footer/overlay Contact link #vc-contact, any nav/footer link to
 * contact.html, or anything with [data-vldy-open] / href="#vldy-inquiry").
 * Submitting composes the answers into a Gmail compose window (mailto fallback).
 */
(function () {
  var TO = 'veldy.official@gmail.com';
  var CSS = `#vldy-inquiry-overlay{position:fixed;inset:0;z-index:2147483000;display:none;align-items:flex-start;justify-content:center;background:rgba(20,20,20,.55);overflow-y:auto;padding:32px 16px;-webkit-overflow-scrolling:touch}
#vldy-inquiry-overlay.vldy-open{display:flex}
#vldy-inquiry-overlay *{box-sizing:border-box}
.vldy-card{position:relative;width:100%;max-width:1240px;background:#fff;border-radius:14px;padding:48px 56px 44px;margin:auto;font-family:inherit;color:#111;box-shadow:0 24px 80px rgba(0,0,0,.28)}
.vldy-close{position:absolute;top:26px;right:30px;width:44px;height:44px;border-radius:50%;border:1px solid #d9d9d9;background:#fff;cursor:pointer;font-size:20px;line-height:1;color:#333;display:flex;align-items:center;justify-content:center;transition:background .15s,border-color .15s}
.vldy-close:hover{background:#f4f4f4;border-color:#bbb}
.vldy-eyebrow{font-size:13px;letter-spacing:.16em;font-weight:600;color:#8a8a8a;text-transform:uppercase;margin:0 0 14px}
.vldy-title{font-size:38px;line-height:1.15;font-weight:600;margin:0 0 34px;color:#111}
.vldy-field{margin-bottom:26px}
.vldy-label{display:block;font-size:15px;font-weight:700;color:#1a1a1a;margin-bottom:11px}
.vldy-label .vldy-req{color:#e0322d;margin-left:3px}
.vldy-input,.vldy-textarea{width:100%;border:1px solid #e2e2e2;border-radius:8px;background:#fff;color:#111;font-family:inherit;font-size:15px;padding:0 16px;height:52px;outline:none;transition:border-color .15s,box-shadow .15s}
.vldy-textarea{height:auto;min-height:130px;padding:14px 16px;line-height:1.5;resize:vertical}
.vldy-input:focus,.vldy-textarea:focus{border-color:#b9a04f;box-shadow:0 0 0 3px rgba(216,195,110,.22)}
.vldy-input.vldy-invalid,.vldy-textarea.vldy-invalid,.vldy-checks.vldy-invalid{border-color:#e0322d;box-shadow:0 0 0 3px rgba(224,50,45,.14)}
.vldy-phone{display:flex;align-items:center;gap:10px}
.vldy-phone .vldy-input{padding:0 12px;text-align:center}
.vldy-phone .p1{max-width:96px}.vldy-phone .p2{max-width:140px}.vldy-phone .p3{max-width:140px}
.vldy-phone .vldy-dash{color:#9a9a9a}
.vldy-date{max-width:220px}
.vldy-checks{display:flex;flex-direction:column;gap:14px;border:1px solid transparent;border-radius:8px;padding:2px}
.vldy-check{display:flex;align-items:center;gap:12px;font-size:15px;color:#2a2a2a;cursor:pointer;user-select:none}
.vldy-check input{width:20px;height:20px;accent-color:#b9a04f;cursor:pointer;flex:0 0 auto}
.vldy-file{display:flex;align-items:center;gap:10px}
.vldy-file-btn{display:inline-flex;align-items:center;gap:9px;cursor:pointer;color:#444;font-size:15px;padding:8px 4px}
.vldy-file-btn:hover{color:#111}
.vldy-file-btn .ic{font-size:17px}
.vldy-file-name{font-size:13px;color:#8a8a8a}
.vldy-send{width:100%;height:58px;margin-top:12px;border:none;border-radius:34px;background:#d8c36e;color:#2a2410;font-family:inherit;font-size:16px;font-weight:700;letter-spacing:.04em;cursor:pointer;transition:background .15s,transform .05s}
.vldy-send:hover{background:#cdb85e}
.vldy-send:active{transform:translateY(1px)}
.vldy-err{display:none;margin-top:14px;color:#e0322d;font-size:14px}
.vldy-err.show{display:block}
@media (max-width:680px){
  .vldy-card{padding:40px 22px 34px;border-radius:12px}
  .vldy-title{font-size:28px;margin-bottom:26px}
  .vldy-close{top:18px;right:18px;width:40px;height:40px}
  .vldy-phone .p1{max-width:80px}
}`;
  var HTML = `<div id="vldy-inquiry-overlay" role="dialog" aria-modal="true" aria-labelledby="vldy-title">
  <div class="vldy-card">
    <button type="button" class="vldy-close" aria-label="닫기">&#10005;</button>
    <p class="vldy-eyebrow">PROJECT INQUIRY</p>
    <h2 class="vldy-title" id="vldy-title">Tell us about your project.</h2>

    <form id="vldy-form" novalidate>
      <div class="vldy-field">
        <label class="vldy-label" for="vf-name">업종/상호명/성함 <span class="vldy-req">*</span></label>
        <input class="vldy-input" id="vf-name" name="name" type="text" required>
      </div>

      <div class="vldy-field">
        <label class="vldy-label">연락처 <span class="vldy-req">*</span></label>
        <div class="vldy-phone">
          <input class="vldy-input p1" id="vf-p1" inputmode="numeric" maxlength="4" required>
          <span class="vldy-dash">-</span>
          <input class="vldy-input p2" id="vf-p2" inputmode="numeric" maxlength="4" required>
          <span class="vldy-dash">-</span>
          <input class="vldy-input p3" id="vf-p3" inputmode="numeric" maxlength="4" required>
        </div>
      </div>

      <div class="vldy-field">
        <label class="vldy-label" for="vf-date">희망하는 제작 완료 일정 <span class="vldy-req">*</span></label>
        <input class="vldy-input vldy-date" id="vf-date" type="date" required>
      </div>

      <div class="vldy-field">
        <label class="vldy-label" for="vf-budget">예산 <span class="vldy-req">*</span></label>
        <input class="vldy-input" id="vf-budget" type="text" required>
      </div>

      <div class="vldy-field">
        <label class="vldy-label">의뢰 영역 <span class="vldy-req">*</span></label>
        <div class="vldy-checks" id="vf-areas">
          <label class="vldy-check"><input type="checkbox" name="area" value="브랜딩 : 브랜드에 필요한 모든 디자인 제작"><span>브랜딩 : 브랜드에 필요한 모든 디자인 제작</span></label>
          <label class="vldy-check"><input type="checkbox" name="area" value="로고"><span>로고</span></label>
          <label class="vldy-check"><input type="checkbox" name="area" value="디자인"><span>디자인</span></label>
          <label class="vldy-check"><input type="checkbox" name="area" value="마케팅"><span>마케팅</span></label>
          <label class="vldy-check"><input type="checkbox" name="area" value="웹 사이트"><span>웹 사이트</span></label>
          <label class="vldy-check"><input type="checkbox" name="area" value="영상 편집"><span>영상 편집</span></label>
        </div>
      </div>

      <div class="vldy-field">
        <label class="vldy-label" for="vf-detail">상세 내용</label>
        <textarea class="vldy-textarea" id="vf-detail" name="detail"></textarea>
      </div>

      <div class="vldy-field">
        <div class="vldy-file">
          <label class="vldy-file-btn" for="vf-file"><span class="ic">&#8679;</span><span>파일 올리기</span></label>
          <input id="vf-file" type="file" style="display:none">
          <span class="vldy-file-name" id="vf-file-name"></span>
        </div>
      </div>

      <div class="vldy-field">
        <label class="vldy-label" for="vf-source">문의하게 된 경로</label>
        <input class="vldy-input" id="vf-source" name="source" type="text">
      </div>

      <button type="submit" class="vldy-send">Send</button>
      <p class="vldy-err" id="vldy-err">필수 항목(*)을 모두 입력해 주세요.</p>
    </form>
  </div>
</div>`;

  function inject() {
    if (!document.getElementById('vldy-inquiry-style')) {
      var st = document.createElement('style');
      st.id = 'vldy-inquiry-style';
      st.textContent = CSS;
      (document.head || document.documentElement).appendChild(st);
    }
    if (!document.getElementById('vldy-inquiry-overlay')) {
      var tmp = document.createElement('div');
      tmp.innerHTML = HTML;
      var node = tmp.firstElementChild;
      if (node) document.body.appendChild(node);
    }
    return document.getElementById('vldy-inquiry-overlay');
  }

  var wired = false;
  function boot() {
    var overlay = inject();
    if (!overlay) return;
    var form = document.getElementById('vldy-form');
    var errBox = document.getElementById('vldy-err');
    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      overlay.classList.add('vldy-open');
      document.documentElement.style.overflow = 'hidden';
      var f = document.getElementById('vf-name'); if (f) { setTimeout(function () { f.focus(); }, 30); }
    }
    function close() {
      overlay.classList.remove('vldy-open');
      document.documentElement.style.overflow = '';
      if (errBox) errBox.classList.remove('show');
      if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
    }
    window.VeldyInquiry = { open: open, close: close };

    if (!wired) {
      wired = true;
      // Any Contact affordance opens the inquiry form.
      var TRIGGER = '#vldy-contact-trigger,#vc-contact,[data-vldy-open],a[href="#vldy-inquiry"],a[href="contact.html"],a[href^="contact.html#"]';
      document.addEventListener('click', function (e) {
        var t = e.target && e.target.closest ? e.target.closest(TRIGGER) : null;
        if (!t) return;
        // Exception: the hero "Contact" primary button links to the contact page
        // instead of opening the form. Read the rolling-text letter spans (not
        // textContent, which also contains the button's inline <style>) so it is
        // distinguished from the other primary button labelled "Get in touch".
        if (t.matches && t.matches('a.framer-znJo4')) {
          var pr = t.querySelector('p[class*="rolling-text-inner"]');
          var label = pr ? [].map.call(pr.querySelectorAll('span'), function (s) { return s.textContent; }).join('').replace(/\s+/g, '').toLowerCase() : '';
          if (label === 'contact') {
            e.preventDefault(); e.stopPropagation();
            window.location.href = 'https://kusc-hsbg.github.io/farmer/contact.html';
            return;
          }
        }
        e.preventDefault(); e.stopPropagation();
        open();
      }, true);
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay.classList.contains('vldy-open')) close();
      });
    }

    var closeBtn = overlay.querySelector('.vldy-close');
    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) close(); });

    var fileInput = document.getElementById('vf-file');
    if (fileInput) fileInput.addEventListener('change', function () {
      document.getElementById('vf-file-name').textContent = fileInput.files && fileInput.files[0] ? fileInput.files[0].name : '';
    });

    function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
    function mark(el, bad) { if (!el) return; el.classList[bad ? 'add' : 'remove']('vldy-invalid'); }

    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = val('vf-name');
      var p1 = val('vf-p1'), p2 = val('vf-p2'), p3 = val('vf-p3');
      var date = val('vf-date');
      var budget = val('vf-budget');
      var areas = Array.prototype.slice.call(document.querySelectorAll('input[name="area"]:checked')).map(function (c) { return c.value; });
      var detail = val('vf-detail');
      var source = val('vf-source');

      var phoneOk = (p1 && p2 && p3);
      var areasOk = areas.length > 0;
      mark(document.getElementById('vf-name'), !name);
      mark(document.getElementById('vf-p1'), !p1); mark(document.getElementById('vf-p2'), !p2); mark(document.getElementById('vf-p3'), !p3);
      mark(document.getElementById('vf-date'), !date);
      mark(document.getElementById('vf-budget'), !budget);
      mark(document.getElementById('vf-areas'), !areasOk);

      if (!name || !phoneOk || !date || !budget || !areasOk) {
        if (errBox) errBox.classList.add('show');
        var firstBad = document.querySelector('.vldy-invalid'); if (firstBad && firstBad.focus) firstBad.focus();
        return;
      }
      if (errBox) errBox.classList.remove('show');

      var phone = p1 + '-' + p2 + '-' + p3;
      var fileName = (fileInput && fileInput.files && fileInput.files[0]) ? fileInput.files[0].name : '';

      var subject = '[프로젝트 문의] ' + name;
      var lines = [
        '▪ 업종/상호명/성함: ' + name,
        '▪ 연락처: ' + phone,
        '▪ 희망하는 제작 완료 일정: ' + date,
        '▪ 예산: ' + budget,
        '▪ 의뢰 영역: ' + areas.join(', '),
        '',
        '▪ 상세 내용:',
        (detail || '(없음)'),
        '',
        '▪ 문의하게 된 경로: ' + (source || '(없음)')
      ];
      if (fileName) { lines.push('', '▪ 첨부파일: ' + fileName + '  (Gmail 작성창에서 직접 첨부해 주세요)'); }
      var body = lines.join('\n');

      var su = encodeURIComponent(subject);
      var bo = encodeURIComponent(body);
      var gmail = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(TO) + '&su=' + su + '&body=' + bo;
      var mailto = 'mailto:' + TO + '?subject=' + su + '&body=' + bo;

      var w = window.open(gmail, '_blank');
      if (!w) { window.location.href = mailto; }
      close();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
