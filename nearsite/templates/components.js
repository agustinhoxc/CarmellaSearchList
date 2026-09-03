/* components.js — reusable HTML fragments shared by every page template. */
'use strict';

function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function attr(value) { return esc(value); }

/* Paragraph array -> HTML */
function paragraphs(list) {
  return (Array.isArray(list) ? list : [list])
    .filter(Boolean)
    .map(function (p) { return '<p>' + esc(p) + '</p>'; })
    .join('\n');
}

function icon(name) {
  var paths = {
    sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.6M12 19.4V22M2 12h2.6M19.4 12H22M4.9 4.9l1.9 1.9M17.2 17.2l1.9 1.9M19.1 4.9l-1.9 1.9M6.8 17.2l-1.9 1.9"/>',
    ledger: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 3v18M11 8h6M11 12h6M11 16h4"/>',
    hammer: '<path d="M3 20l7-7M9 11l4-4 3 3-4 4zM13 7l3-3 4 4-3 3"/>',
    tooth: '<path d="M8 3c-2.2 0-3.6 1.6-3.6 4 0 3.4 1 4.6 1.6 8.4.4 2.6.8 4.6 2.2 4.6 1.6 0 1.5-3.4 3.8-3.4s2.2 3.4 3.8 3.4c1.4 0 1.8-2 2.2-4.6.6-3.8 1.6-5 1.6-8.4 0-2.4-1.4-4-3.6-4-1.8 0-2.6 1-4 1s-2.2-1-4-1z"/>',
    signal: '<path d="M4 20V10M10 20V4M16 20v-8M22 20V7"/>',
    pin: '<path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
    tag: '<path d="M3 12.6V4h8.6L21 13.4 12.4 22 3 12.6z"/><circle cx="7.6" cy="7.6" r="1.4"/>'
  };
  var body = paths[name] || paths.tag;
  return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + body + '</svg>';
}

function badges(provider) {
  var out = [];
  if (provider.demo) out.push('<span class="badge badge-demo">Demo listing</span>');
  if (provider.featured) out.push('<span class="badge badge-featured">Featured</span>');
  if (provider.sponsored) out.push('<span class="badge badge-sponsored">Sponsored</span>');
  if (provider.verified) out.push('<span class="badge badge-verified">Verified</span>');
  return out.length ? '<span class="badges">' + out.join('') + '</span>' : '';
}

function header(ctx, currentPath) {
  var u = ctx.url;
  var links = [
    { href: u('/categories/'), label: 'Categories' },
    { href: u('/tags/'), label: 'Tags' },
    { href: u('/locations/'), label: 'Locations' },
    { href: u('/providers/'), label: 'Businesses' }
  ];
  return '' +
'<a class="skip-link" href="#main">Skip to content</a>' +
'<header class="site-header">' +
  '<div class="wrap header-inner">' +
    '<a class="brand" href="' + u('/') + '"><span class="mark"></span>' + esc(ctx.site.name) + '</a>' +
    '<button class="menu-toggle" type="button" data-menu-toggle aria-expanded="false" aria-controls="primary-nav">Menu</button>' +
    '<nav class="nav" id="primary-nav" aria-label="Main">' +
      '<ul>' +
        links.map(function (l) {
          var current = currentPath && currentPath.indexOf(l.href) === 0 && l.href !== u('/');
          return '<li><a href="' + attr(l.href) + '"' + (current ? ' aria-current="page"' : '') + '>' + esc(l.label) + '</a></li>';
        }).join('') +
        '<li><a class="nav-cta" href="' + u('/for-business/') + '">List your business</a></li>' +
      '</ul>' +
    '</nav>' +
  '</div>' +
'</header>';
}

function footer(ctx) {
  var u = ctx.url;
  var categories = ctx.categories.slice(0, 5).map(function (c) {
    return '<li><a href="' + u('/categories/' + c.slug + '/') + '">' + esc(c.name) + '</a></li>';
  }).join('');
  var cities = ctx.cities.map(function (c) {
    return '<li><a href="' + u('/locations/' + c.state.slug + '/' + c.city.slug + '/') + '">' + esc(c.city.name) + ', ' + esc(c.state.state) + '</a></li>';
  }).join('');
  return '' +
'<footer class="site-footer">' +
  '<div class="wrap footer-grid">' +
    '<div>' +
      '<a class="brand" href="' + u('/') + '"><span class="mark"></span>' + esc(ctx.site.name) + '</a>' +
      '<p class="muted" style="margin-top:.75rem">' + esc(ctx.site.tagline) + '</p>' +
    '</div>' +
    '<div><h2>Categories</h2><ul>' + categories +
      '<li><a href="' + u('/categories/') + '">All categories</a></li></ul></div>' +
    '<div><h2>Cities</h2><ul>' + cities +
      '<li><a href="' + u('/locations/') + '">All locations</a></li></ul></div>' +
    '<div><h2>Portal</h2><ul>' +
      '<li><a href="' + u('/about/') + '">About</a></li>' +
      '<li><a href="' + u('/for-business/') + '">List your business</a></li>' +
      '<li><a href="' + u('/tags/') + '">Browse by tag</a></li>' +
      '<li><a href="' + u('/privacy/') + '">Privacy</a></li>' +
      '<li><a href="' + u('/terms/') + '">Terms</a></li>' +
    '</ul></div>' +
  '</div>' +
  '<div class="wrap footer-bottom">' +
    '<span>&copy; ' + new Date().getFullYear() + ' ' + esc(ctx.site.name) + '</span>' +
    '<span>Listings are published by the businesses themselves. ' + esc(ctx.site.name) + ' does not rank or rate them.</span>' +
  '</div>' +
'</footer>';
}

function breadcrumb(ctx, trail) {
  if (!trail || trail.length < 2) return '';
  return '<nav class="breadcrumb wrap" aria-label="Breadcrumb"><ol>' +
    trail.map(function (item, i) {
      var last = i === trail.length - 1;
      return '<li>' + (last
        ? '<span aria-current="page">' + esc(item.name) + '</span>'
        : '<a href="' + attr(item.href) + '">' + esc(item.name) + '</a>') + '</li>';
    }).join('') +
  '</ol></nav>';
}

function breadcrumbSchema(ctx, trail) {
  if (!trail || trail.length < 2) return null;
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(function (item, i) {
      return {
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        item: ctx.absolute(item.href)
      };
    })
  };
}

function tagChips(ctx, slugs, options) {
  var opts = options || {};
  if (!slugs || !slugs.length) return '';
  return '<ul class="tag-list' + (opts.cloud ? ' tag-cloud' : '') + '">' + slugs.map(function (slug) {
    var tag = ctx.tagBySlug[slug];
    var label = tag ? tag.name : slug.replace(/-/g, ' ');
    var count = opts.counts ? ctx.tagCounts[slug] : null;
    return '<li><a class="tag' + (opts.strong ? ' tag-strong' : '') + '" href="' + ctx.url('/tags/' + slug + '/') + '">' +
      esc(label) + (count ? ' <span class="tag-count">' + count + '</span>' : '') + '</a></li>';
  }).join('') + '</ul>';
}

function whatsappHref(ctx, provider, subject) {
  if (!provider.whatsapp) return '';
  var number = String(provider.whatsapp).replace(/\D/g, '');
  var text = 'Hi ' + provider.name + '! I found you on ' + ctx.site.name + '. ' +
    'I would like to know more about ' + (subject || 'your services') + '.';
  return 'https://wa.me/' + number + '?text=' + encodeURIComponent(text);
}

function providerRow(ctx, provider) {
  var u = ctx.url;
  var href = u('/providers/' + provider.slug + '/');
  var wa = whatsappHref(ctx, provider, provider._categoryName.toLowerCase());
  return '' +
'<li class="provider-row">' +
  '<div class="logo"><img src="' + attr(provider._logo) + '" alt="' + attr(provider.name + ' logo') + '" width="72" height="72" loading="lazy"></div>' +
  '<div>' +
    '<h3><a href="' + href + '">' + esc(provider.name) + '</a>' + badges(provider) + '</h3>' +
    '<p class="meta">' + esc(provider._categoryName) + ' &middot; ' + esc(provider._cityName) + ', ' + esc(provider.state) + '</p>' +
    '<p class="desc">' + esc(provider.shortDescription) + '</p>' +
    tagChips(ctx, (provider.tags || []).slice(0, 4)) +
  '</div>' +
  '<div class="row-actions">' +
    '<a class="btn btn-secondary btn-sm" href="' + href + '">View page</a>' +
    (wa ? '<a class="btn btn-whatsapp btn-sm" href="' + attr(wa) + '" target="_blank" rel="nofollow noopener" data-track="click_whatsapp" data-provider="' + attr(provider.slug) + '">WhatsApp</a>' : '') +
  '</div>' +
'</li>';
}

function providerList(ctx, providers, emptyHtml) {
  if (!providers.length) return emptyHtml || emptyState(ctx);
  return '<ul class="provider-list">' + providers.map(function (p) { return providerRow(ctx, p); }).join('') + '</ul>';
}

function emptyState(ctx, message) {
  return '<div class="empty-state">' +
    '<h2>No businesses listed here yet</h2>' +
    '<p>' + esc(message || 'Nothing has been published in this part of the directory so far. Browse another category, or list a business you know.') + '</p>' +
    '<p style="margin-top:1rem"><a class="btn btn-primary" href="' + ctx.url('/for-business/') + '">List your business</a></p>' +
  '</div>';
}

function categoryCard(ctx, category) {
  var count = ctx.providersByCategory[category.slug] ? ctx.providersByCategory[category.slug].length : 0;
  return '<a class="card card-category" href="' + ctx.url('/categories/' + category.slug + '/') + '">' +
    icon(category.icon) +
    '<div><h3>' + esc(category.name) + '</h3>' +
    '<p>' + esc(category.shortDescription) + '</p>' +
    '<p class="count">' + (count ? count + (count === 1 ? ' business listed' : ' businesses listed') : 'No listings yet') + '</p></div>' +
  '</a>';
}

function faqBlock(ctx, items, heading) {
  if (!items || !items.length) return '';
  return '<section class="section-tight">' +
    '<div class="section-head"><h2>' + esc(heading || 'Common questions') + '</h2></div>' +
    '<div class="faq">' + items.map(function (item) {
      return '<details><summary>' + esc(item.q) + '</summary><p>' + esc(item.a) + '</p></details>';
    }).join('') + '</div>' +
  '</section>';
}

function faqSchema(items) {
  if (!items || !items.length) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: items.map(function (item) {
      return {
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a }
      };
    })
  };
}

function searchForm(ctx, options) {
  var opts = options || {};
  var id = opts.id || 'search';
  return '' +
'<form class="search-form" action="' + ctx.url('/search/') + '" method="get" role="search"' + (opts.dataAttr ? ' ' + opts.dataAttr : '') + '>' +
  '<div class="field autocomplete">' +
    '<label for="' + id + '-q">What do you need?</label>' +
    '<input type="search" id="' + id + '-q" name="q" placeholder="Solar installer, bookkeeper, bathroom remodel…" ' +
      'autocomplete="off" role="combobox" aria-expanded="false" aria-autocomplete="list" ' +
      'aria-controls="' + id + '-ac" data-autocomplete value="' + attr(opts.value || '') + '">' +
    '<ul class="autocomplete-list" id="' + id + '-ac" role="listbox" aria-label="Suggestions" hidden></ul>' +
  '</div>' +
  '<div class="field">' +
    '<label for="' + id + '-city">City</label>' +
    '<select id="' + id + '-city" name="city">' +
      '<option value="">Anywhere</option>' +
      ctx.cities.map(function (c) {
        return '<option value="' + attr(c.city.slug) + '"' + (opts.city === c.city.slug ? ' selected' : '') + '>' +
          esc(c.city.name) + ', ' + esc(c.state.state) + '</option>';
      }).join('') +
    '</select>' +
  '</div>' +
  '<button class="btn btn-primary" type="submit">Search</button>' +
'</form>';
}

function ctaBand(ctx, options) {
  var o = options || {};
  return '<section class="section"><div class="wrap"><div class="cta-band">' +
    '<h2>' + esc(o.title || 'Put your business where people are already looking') + '</h2>' +
    '<p>' + esc(o.text || 'A page on ' + ctx.site.name + ' gives your business a real address on the web: services, service area, photos and a direct WhatsApp button.') + '</p>' +
    '<div class="cta-actions">' +
      '<a class="btn btn-primary" href="' + ctx.url('/for-business/') + '">List your business</a>' +
      '<a class="btn btn-secondary" href="' + ctx.url('/about/') + '">How the directory works</a>' +
    '</div>' +
  '</div></div></section>';
}

function linkColumns(items) {
  if (!items.length) return '';
  return '<ul class="link-columns">' + items.map(function (i) {
    return '<li><a href="' + attr(i.href) + '">' + esc(i.label) + '</a>' +
      (i.note ? ' <span class="tag-count">' + esc(i.note) + '</span>' : '') + '</li>';
  }).join('') + '</ul>';
}

module.exports = {
  esc: esc, attr: attr, paragraphs: paragraphs, icon: icon, badges: badges,
  header: header, footer: footer, breadcrumb: breadcrumb, breadcrumbSchema: breadcrumbSchema,
  tagChips: tagChips, providerRow: providerRow, providerList: providerList, emptyState: emptyState,
  categoryCard: categoryCard, faqBlock: faqBlock, faqSchema: faqSchema, searchForm: searchForm,
  ctaBand: ctaBand, linkColumns: linkColumns, whatsappHref: whatsappHref
};
