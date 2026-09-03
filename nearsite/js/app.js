/* app.js — page wiring: navigation, tracking hooks, module init.
   Loaded with defer on every page. Everything here is progressive:
   the pages are complete HTML without it. */
(function (global) {
  'use strict';

  var NS = (global.Nearsite = global.Nearsite || {});

  /* Analytics is not installed by default. Events are pushed to a queue and,
     if a tag manager or gtag is present, forwarded. See README. */
  NS.trackQueue = NS.trackQueue || [];
  NS.track = function (event, params) {
    var payload = Object.assign({ event: event }, params || {});
    NS.trackQueue.push(payload);
    if (global.dataLayer && typeof global.dataLayer.push === 'function') {
      global.dataLayer.push(payload);
    }
    if (typeof global.gtag === 'function') {
      global.gtag('event', event, params || {});
    }
  };

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.getElementById('primary-nav');
    if (!toggle || !nav) return;

    function isMobile() { return global.matchMedia('(max-width: 720px)').matches; }

    function setOpen(open) {
      nav.hidden = !open;
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function sync() { setOpen(!isMobile()); }

    toggle.addEventListener('click', function () {
      setOpen(nav.hidden);
    });
    global.addEventListener('resize', sync);
    sync();
  }

  function initTracking() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-track]');
      if (!el) return;
      NS.track(el.getAttribute('data-track'), {
        provider: el.getAttribute('data-provider') || '',
        label: el.getAttribute('data-label') || el.textContent.trim()
      });
    });
  }

  function initSearchUi() {
    if (!NS.search) return;
    document.querySelectorAll('[data-autocomplete]').forEach(function (input) {
      NS.search.initAutocomplete(input);
    });
    var results = document.querySelector('[data-search-page]');
    if (results) NS.search.initResults(results);
  }

  function initBusinessForm() {
    var form = document.querySelector('[data-lead-form]');
    if (!form) return;
    var out = form.querySelector('[data-lead-status]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var values = {};
      new FormData(form).forEach(function (value, key) { values[key] = String(value).trim(); });
      if (!values.name || !values.business) {
        out.textContent = 'Add your name and business name so we know who is writing.';
        return;
      }
      var lines = [
        'Hi ' + form.getAttribute('data-portal') + '! I would like to list my business.',
        'Name: ' + values.name,
        'Business: ' + values.business,
        values.category ? 'Category: ' + values.category : '',
        values.city ? 'City: ' + values.city : '',
        values.website ? 'Website: ' + values.website : ''
      ].filter(Boolean);
      var url = 'https://wa.me/' + NS.whatsapp.digitsOnly(form.getAttribute('data-whatsapp')) +
        '?text=' + encodeURIComponent(lines.join('\n'));
      NS.track('lead_form_submit', { category: values.category || '', city: values.city || '' });
      out.textContent = 'Opening WhatsApp with your details filled in.';
      global.open(url, '_blank', 'noopener');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initTracking();
    initSearchUi();
    initBusinessForm();
  });
})(window);
