/* provider.js — the provider mini-site: the product being sold.
   One canonical URL per business: /providers/<slug>/. Category, city and
   search pages link here; they never duplicate this content. */
'use strict';

var c = require('../components');
var layout = require('../layout');

function contactCard(ctx, provider) {
  var rows = [];
  if (provider.phone) {
    rows.push('<dt>Phone</dt><dd><a href="tel:' + c.attr(provider.phone.replace(/[^\d+]/g, '')) + '" data-track="click_phone" data-provider="' + c.attr(provider.slug) + '">' + c.esc(provider.phone) + '</a></dd>');
  }
  if (provider.website) {
    rows.push('<dt>Website</dt><dd><a href="' + c.attr(provider.website) + '" target="_blank" rel="noopener" data-track="click_website" data-provider="' + c.attr(provider.slug) + '">' + c.esc(provider.website.replace(/^https?:\/\//, '')) + '</a></dd>');
  }
  if (provider.instagram) {
    rows.push('<dt>Instagram</dt><dd><a href="https://instagram.com/' + c.attr(provider.instagram.replace('@', '')) + '" target="_blank" rel="noopener">@' + c.esc(provider.instagram.replace('@', '')) + '</a></dd>');
  }
  if (provider.address) {
    rows.push('<dt>Address</dt><dd>' + c.esc(provider.address) + '</dd>');
  }
  if (provider.googleBusinessProfile) {
    rows.push('<dt>Google profile</dt><dd><a href="' + c.attr(provider.googleBusinessProfile) + '" target="_blank" rel="noopener" data-track="click_directions" data-provider="' + c.attr(provider.slug) + '">Open in Google Maps</a></dd>');
  }

  var hours = (provider.hours || []).length
    ? '<h3 style="font-size:var(--step-0);margin-top:1.25rem">Hours</h3>' +
      '<table class="hours-table"><tbody>' + provider.hours.map(function (h) {
        return '<tr><th scope="row">' + c.esc(h.days) + '</th><td>' + c.esc(h.time) + '</td></tr>';
      }).join('') + '</tbody></table>'
    : '';

  var wa = c.whatsappHref(ctx, provider, provider._categoryName.toLowerCase() + ' in ' + provider._cityName);

  return '<aside class="surface contact-card" aria-labelledby="contact-heading">' +
    '<h2 id="contact-heading" style="font-size:var(--step-2)">Contact ' + c.esc(provider.name) + '</h2>' +
    (wa ? '<a class="btn btn-whatsapp btn-block" style="margin-top:1rem" href="' + c.attr(wa) + '" target="_blank" rel="nofollow noopener" data-track="click_whatsapp" data-provider="' + c.attr(provider.slug) + '">Message on WhatsApp</a>' : '') +
    (rows.length ? '<dl style="margin-top:1.25rem">' + rows.join('') + '</dl>' : '') +
    hours +
    '<p class="muted" style="font-size:var(--step--1);margin-top:1.25rem">Mentioning ' + c.esc(ctx.site.name) + ' helps this business know where you found them.</p>' +
  '</aside>';
}

module.exports = function providerPage(ctx, provider) {
  var path = '/providers/' + provider.slug + '/';
  var assets = ctx.url('/assets/providers/' + provider.slug + '/');
  var wa = c.whatsappHref(ctx, provider, provider._categoryName.toLowerCase() + ' in ' + provider._cityName);
  var related = ctx.relatedProviders(provider);
  var theme = provider.theme || {};

  var main = '' +
'<article class="provider-page" style="--p-primary:' + c.attr(theme.primary || 'var(--primary)') + ';--p-accent:' + c.attr(theme.accent || 'var(--accent)') + '">' +

'<section class="provider-hero">' +
  '<div class="wrap split">' +
    '<div>' +
      '<div class="provider-identity">' +
        '<span class="logo"><img src="' + provider._logo + '" alt="' + c.attr(provider.name + ' logo') + '" width="64" height="64"></span>' +
        '<div>' +
          '<p class="eyebrow">' +
            '<a href="' + ctx.url('/categories/' + provider.category + '/') + '">' + c.esc(provider._categoryName) + '</a>' +
            ' in <a href="' + ctx.url('/locations/' + provider._stateSlug + '/' + provider.city + '/') + '">' + c.esc(provider._cityName) + ', ' + c.esc(provider.state) + '</a>' +
          '</p>' +
          c.badges(provider) +
        '</div>' +
      '</div>' +
      '<h1>' + c.esc(provider.name) + ' — ' + c.esc(provider._categoryName) + ' in ' + c.esc(provider._cityName) + '</h1>' +
      '<p class="tagline">' + c.esc(provider.tagline) + '</p>' +
      c.tagChips(ctx, provider.tags || []) +
      '<div class="cta-actions">' +
        (wa ? '<a class="btn btn-primary" href="' + c.attr(wa) + '" target="_blank" rel="nofollow noopener" data-track="click_whatsapp" data-provider="' + c.attr(provider.slug) + '">Request a quote on WhatsApp</a>' : '') +
        (provider.phone ? '<a class="btn btn-secondary" href="tel:' + c.attr(provider.phone.replace(/[^\d+]/g, '')) + '" data-track="click_phone" data-provider="' + c.attr(provider.slug) + '">Call ' + c.esc(provider.phone) + '</a>' : '') +
      '</div>' +
    '</div>' +
    '<div class="hero-media">' +
      '<img src="' + provider._hero + '" alt="' + c.attr(provider.name + ' — ' + provider.tagline) + '" width="760" height="500" fetchpriority="high">' +
    '</div>' +
  '</div>' +
'</section>' +

'<div class="wrap split section">' +
  '<div class="stack-lg">' +

    '<section>' +
      '<div class="section-head"><h2>About</h2></div>' +
      '<div class="prose">' + c.paragraphs(provider.description) + '</div>' +
    '</section>' +

    (provider.services && provider.services.length ? '<section>' +
      '<div class="section-head"><h2>Services</h2></div>' +
      '<ul class="service-list">' + provider.services.map(function (s) {
        return '<li><h3>' + c.esc(s.name) + '</h3><p>' + c.esc(s.description) + '</p></li>';
      }).join('') + '</ul>' +
    '</section>' : '') +

    (provider.differentials && provider.differentials.length ? '<section>' +
      '<div class="section-head"><h2>How they work</h2></div>' +
      '<ul class="check-list">' + provider.differentials.map(function (d) {
        return '<li>' + c.esc(d) + '</li>';
      }).join('') + '</ul>' +
    '</section>' : '') +

    (provider.gallery && provider.gallery.length ? '<section>' +
      '<div class="section-head"><h2>Work</h2></div>' +
      '<div class="gallery">' + provider.gallery.map(function (g) {
        return '<img src="' + assets + c.attr(g.file) + '" alt="' + c.attr(g.alt) + '" width="480" height="360" loading="lazy">';
      }).join('') + '</div>' +
    '</section>' : '') +

    '<section>' +
      '<div class="section-head"><h2>Service area</h2></div>' +
      '<p>' + c.esc(provider.serviceAreaNote) + '</p>' +
      (provider.areasServed && provider.areasServed.length ? '<ul class="tag-list" style="margin-top:1rem">' + provider.areasServed.map(function (a) {
        return '<li><span class="tag tag-plain">' + c.esc(a) + '</span></li>';
      }).join('') + '</ul>' : '') +
    '</section>' +

    (provider.faq && provider.faq.length ? c.faqBlock(ctx, provider.faq, 'Questions answered by ' + provider.name) : '') +

  '</div>' +
  contactCard(ctx, provider) +
'</div>' +

(related.length ? '<section class="section-tight"><div class="wrap">' +
  '<div class="section-head"><h2>Other businesses that may help</h2>' +
  '<p>Same category or same city. Shown in the order they were listed, not ranked.</p></div>' +
  c.providerList(ctx, related) +
'</div></section>' : '') +

(wa ? '<div class="floating-cta"><a class="btn btn-whatsapp btn-block" href="' + c.attr(wa) + '" target="_blank" rel="nofollow noopener" data-track="click_whatsapp" data-provider="' + c.attr(provider.slug) + '">Message ' + c.esc(provider.name) + ' on WhatsApp</a></div>' : '') +

'</article>';

  var business = {
    '@type': 'LocalBusiness',
    '@id': ctx.absolute(path) + '#business',
    name: provider.name,
    description: provider.shortDescription,
    url: ctx.absolute(path),
    image: ctx.absolute(provider._hero),
    logo: ctx.absolute(provider._logo),
    areaServed: (provider.areasServed || []).map(function (a) {
      return { '@type': 'Place', name: a };
    })
  };
  if (provider.phone) business.telephone = provider.phone;
  if (provider.address) {
    business.address = {
      '@type': 'PostalAddress',
      streetAddress: provider.address,
      addressLocality: provider._cityName,
      addressRegion: provider.state,
      addressCountry: ctx.site.country
    };
  } else {
    business.address = {
      '@type': 'PostalAddress',
      addressLocality: provider._cityName,
      addressRegion: provider.state,
      addressCountry: ctx.site.country
    };
  }
  var sameAs = [provider.website, provider.instagram ? 'https://instagram.com/' + provider.instagram.replace('@', '') : '', provider.googleBusinessProfile].filter(Boolean);
  if (sameAs.length) business.sameAs = sameAs;
  if (provider.services && provider.services.length) {
    business.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: provider.name + ' services',
      itemListElement: provider.services.map(function (s) {
        return { '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.name, description: s.description } };
      })
    };
  }

  return layout.render(ctx, {
    path: path,
    title: provider.name + ' | ' + provider._categoryName + ' in ' + provider._cityName + ' | ' + ctx.site.name,
    description: provider.shortDescription + ' Services, service area and direct contact in ' +
      provider._cityName + ', ' + provider.state + '.',
    ogType: 'business.business',
    ogImage: provider._hero,
    breadcrumbs: [
      { name: 'Home', href: ctx.url('/') },
      { name: provider._stateName, href: ctx.url('/locations/' + provider._stateSlug + '/') },
      { name: provider._cityName, href: ctx.url('/locations/' + provider._stateSlug + '/' + provider.city + '/') },
      { name: provider._categoryName, href: ctx.url('/locations/' + provider._stateSlug + '/' + provider.city + '/' + provider.category + '/') },
      { name: provider.name, href: ctx.url(path) }
    ],
    schema: [business, c.faqSchema(provider.faq)],
    main: main
  });
};
