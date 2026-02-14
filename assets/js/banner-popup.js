/**
 * Corporate Commerce – Banner popup
 * Shows two promotional banners in a modal after 3 seconds (once per session).
 * Accessible: Escape to close, focus trap, ARIA, keyboard nav.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'cc_banner_popup_seen';
  var DELAY_MS = 3000;
  var AUTO_SCROLL_MS = 3000;
  var BANNERS = [
    { src: 'assets/images/resources/pop-up-banner1.jpeg', alt: 'Corporate Commerce – Admissions open, MEC and CEC Professional, practical commerce education and courses offered.' },
    { src: 'assets/images/resources/pop-up-banner2.jpeg', alt: 'Corporate Commerce – Step into professional degree, courses offered and admissions open with contact details.' }
  ];

  function getContainer() {
    var wrap = document.getElementById('cc-banner-popup');
    if (wrap) return wrap;
    wrap = document.createElement('div');
    wrap.id = 'cc-banner-popup';
    wrap.className = 'cc-banner-popup';
    wrap.setAttribute('aria-hidden', 'true');

    var backdrop = document.createElement('div');
    backdrop.className = 'cc-banner-popup__backdrop';
    backdrop.setAttribute('aria-hidden', 'true');

    var dialog = document.createElement('div');
    dialog.className = 'cc-banner-popup__dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'cc-banner-popup-title');
    dialog.setAttribute('aria-describedby', 'cc-banner-popup-desc');

    var titleEl = document.createElement('h2');
    titleEl.id = 'cc-banner-popup-title';
    titleEl.className = 'sr-only';
    titleEl.textContent = 'Promotional banners';
    dialog.appendChild(titleEl);

    var descEl = document.createElement('p');
    descEl.id = 'cc-banner-popup-desc';
    descEl.className = 'sr-only';
    descEl.textContent = 'Corporate Commerce admissions and course information. Use previous and next to switch between banners, or close to continue.';
    dialog.appendChild(descEl);

    var header = document.createElement('div');
    header.className = 'cc-banner-popup__header';

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'cc-banner-popup__close';
    closeBtn.setAttribute('aria-label', 'Close promotional banners');
    closeBtn.innerHTML = '&times;';
    header.appendChild(closeBtn);
    dialog.appendChild(header);

    var body = document.createElement('div');
    body.className = 'cc-banner-popup__body';

    var slider = document.createElement('div');
    slider.className = 'cc-banner-popup__slider';

    BANNERS.forEach(function (b, i) {
      var slide = document.createElement('div');
      slide.className = 'cc-banner-popup__slide' + (i === 0 ? ' is-active' : '');
      slide.setAttribute('data-slide', String(i));
      var img = document.createElement('img');
      img.src = b.src;
      img.alt = b.alt;
      img.loading = 'lazy';
      slide.appendChild(img);
      slider.appendChild(slide);
    });

    var prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'cc-banner-popup__nav cc-banner-popup__nav--prev';
    prevBtn.setAttribute('aria-label', 'Previous banner');
    prevBtn.innerHTML = '&#9664;';
    slider.appendChild(prevBtn);

    var nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'cc-banner-popup__nav cc-banner-popup__nav--next';
    nextBtn.setAttribute('aria-label', 'Next banner');
    nextBtn.innerHTML = '&#9654;';
    slider.appendChild(nextBtn);

    body.appendChild(slider);
    dialog.appendChild(body);

    var dotsWrap = document.createElement('div');
    dotsWrap.className = 'cc-banner-popup__dots';
    BANNERS.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'cc-banner-popup__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', 'Show banner ' + (i + 1));
      dot.setAttribute('data-slide', String(i));
      dotsWrap.appendChild(dot);
    });
    dialog.appendChild(dotsWrap);

    wrap.appendChild(backdrop);
    wrap.appendChild(dialog);
    document.body.appendChild(wrap);

    return wrap;
  }

  function getFocusables(root) {
    var sel = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return Array.prototype.slice.call(root.querySelectorAll(sel));
  }

  function trapFocus(e, container) {
    var focusables = getFocusables(container);
    if (focusables.length === 0) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }

  function showPopup() {
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch (e) {}
    var wrap = getContainer();
    var dialog = wrap.querySelector('.cc-banner-popup__dialog');
    var backdrop = wrap.querySelector('.cc-banner-popup__backdrop');
    var closeBtn = wrap.querySelector('.cc-banner-popup__close');
    var prevBtn = wrap.querySelector('.cc-banner-popup__nav--prev');
    var nextBtn = wrap.querySelector('.cc-banner-popup__nav--next');
    var dots = wrap.querySelectorAll('.cc-banner-popup__dot');
    var slides = wrap.querySelectorAll('.cc-banner-popup__slide');

    var previousFocus = document.activeElement;
    var autoScrollId = null;

    function setSlide(index) {
      var i = Math.max(0, Math.min(index, slides.length - 1));
      slides.forEach(function (s, idx) {
        s.classList.toggle('is-active', idx === i);
      });
      dots.forEach(function (d, idx) {
        d.classList.toggle('is-active', idx === i);
      });
      return i;
    }

    function goNext() {
      var curr = Array.prototype.indexOf.call(slides, wrap.querySelector('.cc-banner-popup__slide.is-active'));
      setSlide(curr + 1 >= slides.length ? 0 : curr + 1);
    }

    function startAutoScroll() {
      stopAutoScroll();
      autoScrollId = setInterval(goNext, AUTO_SCROLL_MS);
    }

    function stopAutoScroll() {
      if (autoScrollId) {
        clearInterval(autoScrollId);
        autoScrollId = null;
      }
    }

    function close() {
      stopAutoScroll();
      wrap.classList.remove('is-open');
      wrap.setAttribute('aria-hidden', 'true');
      dialog.setAttribute('aria-hidden', 'true');
      try {
        sessionStorage.setItem(STORAGE_KEY, '1');
      } catch (e) {}
      document.removeEventListener('keydown', onKeydown);
      if (previousFocus && typeof previousFocus.focus === 'function') {
        previousFocus.focus();
      }
    }

    function onKeydown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === 'ArrowLeft') {
        var curr = Array.prototype.indexOf.call(slides, wrap.querySelector('.cc-banner-popup__slide.is-active'));
        setSlide(curr - 1);
        return;
      }
      if (e.key === 'ArrowRight') {
        var cur = Array.prototype.indexOf.call(slides, wrap.querySelector('.cc-banner-popup__slide.is-active'));
        setSlide(cur + 1);
        return;
      }
      trapFocus(e, dialog);
    }

    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', close);

    prevBtn.addEventListener('click', function () {
      var curr = Array.prototype.indexOf.call(slides, wrap.querySelector('.cc-banner-popup__slide.is-active'));
      setSlide(curr - 1);
    });
    nextBtn.addEventListener('click', function () {
      var curr = Array.prototype.indexOf.call(slides, wrap.querySelector('.cc-banner-popup__slide.is-active'));
      setSlide(curr + 1);
    });

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        setSlide(i);
      });
    });

    dialog.addEventListener('mouseenter', stopAutoScroll);
    dialog.addEventListener('mouseleave', startAutoScroll);

    document.addEventListener('keydown', onKeydown);

    startAutoScroll();

    wrap.classList.add('is-open');
    wrap.setAttribute('aria-hidden', 'false');
    dialog.setAttribute('aria-hidden', 'false');
    closeBtn.focus();
  }

  function schedule() {
    var timeoutId = setTimeout(function () {
      showPopup();
    }, DELAY_MS);
    if (document.visibilityState === 'hidden') {
      document.addEventListener('visibilitychange', function onVis() {
        if (document.visibilityState === 'visible') {
          document.removeEventListener('visibilitychange', onVis);
          clearTimeout(timeoutId);
          timeoutId = setTimeout(showPopup, 500);
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule);
  } else {
    schedule();
  }
})();
