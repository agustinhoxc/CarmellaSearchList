/* whatsapp.js — builds wa.me links with portal attribution.
   Every WhatsApp link on the site is generated here so the message
   format (and the "found you on the portal" attribution) stays consistent. */
(function (global) {
  'use strict';

  var NS = (global.Nearsite = global.Nearsite || {});

  function digitsOnly(value) {
    return String(value || '').replace(/\D/g, '');
  }

  /**
   * @param {Object} o
   * @param {string} o.whatsapp   provider number in international format, digits only
   * @param {string} o.provider   business name
   * @param {string} o.subject    what the visitor is asking about (service or category)
   * @param {string} o.portal     portal name
   * @param {string} [o.pageUrl]  page the visitor came from
   */
  function message(o) {
    var parts = ['Hi ' + o.provider + '!'];
    parts.push('I found you on ' + o.portal + '.');
    if (o.subject) {
      parts.push('I would like to know more about ' + o.subject + '.');
    } else {
      parts.push('I would like to know more about your services.');
    }
    return parts.join(' ');
  }

  function link(o) {
    var number = digitsOnly(o.whatsapp);
    if (!number) return '';
    return 'https://wa.me/' + number + '?text=' + encodeURIComponent(message(o));
  }

  NS.whatsapp = { link: link, message: message, digitsOnly: digitsOnly };
})(window);
