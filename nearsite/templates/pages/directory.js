/* directory.js — listing templates: categories, subcategories, locations,
   city pages and the city+category pages that carry the local SEO weight. */
'use strict';

var c = require('../components');
var layout = require('../layout');

function itemList(ctx, providers, name) {
  if (!providers.length) return null;
  return {
    '@type': 'ItemList',
    name: name,
    numberOfItems: providers.length,
    itemListElement: providers.map(function (p, i) {
      return {
        '@type': 'ListItem',
        position: i + 1,
        url: ctx.absolute('/providers/' + p.slug + '/'),
        name: p.name
      };
    })
  };
}

function crumbsRoot(ctx) {
  return [{ name: 'Home', href: ctx.url('/') }];
}

/* ---------- /categories/ ---------- */
function categoriesIndex(ctx) {
  var main = '' +
'<section class="section">' +
  '<div class="wrap">' +
    '<h1>Service categories</h1>' +
    '<p class="lede" style="margin-top:.75rem">Every category below has at least one business with a published page. Categories are added when there is something real to put in them.</p>' +
    '<div class="grid grid-3" style="margin-top:2rem">' +
      ctx.categories.map(function (cat) { return c.categoryCard(ctx, cat); }).join('') +
    '</div>' +
  '</div>' +
'</section>' + c.ctaBand(ctx);

  return layout.render(ctx, {
    path: '/categories/',
    title: 'Service categories | ' + ctx.site.name,
    description: 'Browse every service category on ' + ctx.site.name + ': solar energy, accounting, home renovation, dental care and digital marketing.',
    breadcrumbs: crumbsRoot(ctx).concat([{ name: 'Categories', href: ctx.url('/categories/') }]),
    main: main
  });
}

/* ---------- /categories/<category>/ ---------- */
function categoryPage(ctx, category) {
  var providers = ctx.providersByCategory[category.slug] || [];
  var cities = ctx.citiesForCategory(category.slug);
  var tags = ctx.tagsForProviders(providers);
  var related = (category.relatedCategories || []).map(function (slug) { return ctx.categoryBySlug[slug]; }).filter(Boolean);
  var path = '/categories/' + category.slug + '/';

  var main = '' +
'<section class="section">' +
  '<div class="wrap">' +
    '<h1>' + c.esc(category.name) + ' companies</h1>' +
    '<div class="prose" style="margin-top:1rem">' + c.paragraphs(category.intro.split('\n\n')) + '</div>' +
  '</div>' +
'</section>' +

'<section class="section-tight">' +
  '<div class="wrap">' +
    '<div class="section-head"><h2>Businesses in this category</h2>' +
      '<p>' + providers.length + ' listed across ' + cities.length + (cities.length === 1 ? ' city' : ' cities') + '.</p></div>' +
    c.providerList(ctx, providers) +
  '</div>' +
'</section>' +

(tags.length ? '<section class="section-tight"><div class="wrap">' +
  '<div class="section-head"><h2>Filter by what they offer</h2>' +
  '<p>Tags come from the businesses themselves, not from a keyword list.</p></div>' +
  c.tagChips(ctx, tags, { cloud: true, counts: true }) +
'</div></section>' : '') +

(category.subcategories && category.subcategories.length ? '<section class="section-tight"><div class="wrap">' +
  '<div class="section-head"><h2>' + c.esc(category.name) + ' services</h2></div>' +
  '<div class="grid grid-3">' + category.subcategories.map(function (sub) {
    var count = (ctx.providersBySubcategory[category.slug + '/' + sub.slug] || []).length;
    return '<a class="card" href="' + ctx.url('/categories/' + category.slug + '/' + sub.slug + '/') + '" style="text-decoration:none;color:inherit">' +
      '<h3>' + c.esc(sub.name) + '</h3><p>' + c.esc(sub.description) + '</p>' +
      '<p class="count muted" style="font-size:var(--step--1)">' + (count ? count + (count === 1 ? ' business' : ' businesses') : 'No listings yet') + '</p></a>';
  }).join('') + '</div>' +
'</div></section>' : '') +

(cities.length ? '<section class="section-tight"><div class="wrap">' +
  '<div class="section-head"><h2>Coverage by city</h2></div>' +
  c.linkColumns(cities.map(function (place) {
    var count = ctx.providersByCityCategory[place.city.slug + '/' + category.slug].length;
    return {
      href: ctx.url('/locations/' + place.state.slug + '/' + place.city.slug + '/' + category.slug + '/'),
      label: category.name + ' in ' + place.city.name,
      note: count + (count === 1 ? ' business' : ' businesses')
    };
  })) +
'</div></section>' : '') +

(category.buyerNotes && category.buyerNotes.length ? '<section class="section-tight"><div class="wrap">' +
  '<div class="section-head"><h2>What to ask before you hire</h2></div>' +
  '<ul class="check-list" style="max-width:var(--measure)">' + category.buyerNotes.map(function (n) {
    return '<li>' + c.esc(n) + '</li>';
  }).join('') + '</ul>' +
'</div></section>' : '') +

'<div class="wrap">' + c.faqBlock(ctx, category.faq, 'Questions about ' + category.name.toLowerCase()) + '</div>' +

(related.length ? '<section class="section-tight"><div class="wrap">' +
  '<div class="section-head"><h2>You may also be looking for</h2></div>' +
  '<div class="grid grid-3">' + related.map(function (r) { return c.categoryCard(ctx, r); }).join('') + '</div>' +
'</div></section>' : '') +

c.ctaBand(ctx);

  return layout.render(ctx, {
    path: path,
    title: c.esc(category.name) + ' companies | ' + ctx.site.name,
    description: category.shortDescription + ' Compare ' + providers.length + ' listed ' + category.pluralNoun + ' on ' + ctx.site.name + '.',
    breadcrumbs: crumbsRoot(ctx).concat([
      { name: 'Categories', href: ctx.url('/categories/') },
      { name: category.name, href: ctx.url(path) }
    ]),
    noindex: providers.length === 0,
    noindexReason: providers.length === 0 ? 'category has no published providers' : '',
    schema: [itemList(ctx, providers, category.name + ' companies'), c.faqSchema(category.faq)],
    main: main
  });
}

/* ---------- /categories/<category>/<subcategory>/ ---------- */
function subcategoryPage(ctx, category, sub) {
  var providers = ctx.providersBySubcategory[category.slug + '/' + sub.slug] || [];
  var path = '/categories/' + category.slug + '/' + sub.slug + '/';
  var min = ctx.site.indexRules.minProvidersForSubcategoryIndex;

  var main = '' +
'<section class="section">' +
  '<div class="wrap">' +
    '<h1>' + c.esc(sub.name) + '</h1>' +
    '<p class="lede" style="margin-top:1rem">' + c.esc(sub.description) + '</p>' +
    '<p style="margin-top:1rem">Part of <a href="' + ctx.url('/categories/' + category.slug + '/') + '">' + c.esc(category.name) + '</a> on ' + c.esc(ctx.site.name) + '.</p>' +
  '</div>' +
'</section>' +
'<section class="section-tight"><div class="wrap">' +
  '<div class="section-head"><h2>Businesses offering this service</h2></div>' +
  c.providerList(ctx, providers, c.emptyState(ctx, 'No business has listed ' + sub.name.toLowerCase() + ' as their main service yet. The category page lists everyone in ' + category.name.toLowerCase() + '.')) +
'</div></section>' +
c.ctaBand(ctx);

  return layout.render(ctx, {
    path: path,
    title: c.esc(sub.name) + ' | ' + c.esc(category.name) + ' | ' + ctx.site.name,
    description: sub.description + ' See businesses on ' + ctx.site.name + ' that list this as their main service.',
    breadcrumbs: crumbsRoot(ctx).concat([
      { name: 'Categories', href: ctx.url('/categories/') },
      { name: category.name, href: ctx.url('/categories/' + category.slug + '/') },
      { name: sub.name, href: ctx.url(path) }
    ]),
    noindex: providers.length < min,
    noindexReason: providers.length < min ? 'fewer than ' + min + ' providers' : '',
    schema: [itemList(ctx, providers, sub.name)],
    main: main
  });
}

/* ---------- /locations/ ---------- */
function locationsIndex(ctx) {
  var main = '' +
'<section class="section"><div class="wrap">' +
  '<h1>Where ' + c.esc(ctx.site.name) + ' has listings</h1>' +
  '<p class="lede" style="margin-top:.75rem">Coverage is built city by city. A city appears here once businesses in it have published pages.</p>' +
  '<div class="grid grid-3" style="margin-top:2rem">' +
    ctx.locations.map(function (state) {
      var count = ctx.providers.filter(function (p) { return p.state === state.state; }).length;
      return '<a class="card" href="' + ctx.url('/locations/' + state.slug + '/') + '" style="text-decoration:none;color:inherit">' +
        '<h3>' + c.esc(state.name) + '</h3>' +
        '<p>' + c.esc((state.cities || []).map(function (city) { return city.name; }).join(', ')) + '</p>' +
        '<p class="count muted" style="font-size:var(--step--1)">' + count + (count === 1 ? ' business' : ' businesses') + '</p></a>';
    }).join('') +
  '</div>' +
'</div></section>' + c.ctaBand(ctx);

  return layout.render(ctx, {
    path: '/locations/',
    title: 'Locations | ' + ctx.site.name,
    description: 'States and cities covered by ' + ctx.site.name + ', with the number of businesses listed in each.',
    breadcrumbs: crumbsRoot(ctx).concat([{ name: 'Locations', href: ctx.url('/locations/') }]),
    main: main
  });
}

/* ---------- /locations/<state>/ ---------- */
function statePage(ctx, state) {
  var providers = ctx.providers.filter(function (p) { return p.state === state.state; });
  var path = '/locations/' + state.slug + '/';
  var main = '' +
'<section class="section"><div class="wrap">' +
  '<h1>Businesses in ' + c.esc(state.name) + '</h1>' +
  '<div class="prose" style="margin-top:1rem">' + c.paragraphs([state.intro]) + '</div>' +
'</div></section>' +
'<section class="section-tight"><div class="wrap">' +
  '<div class="section-head"><h2>Cities</h2></div>' +
  '<div class="grid grid-3">' + (state.cities || []).map(function (city) {
    var count = (ctx.providersByCity[city.slug] || []).length;
    return '<a class="card" href="' + ctx.url(path + city.slug + '/') + '" style="text-decoration:none;color:inherit">' +
      '<h3>' + c.esc(city.name) + '</h3><p>' + c.esc(city.intro.split('. ')[0]) + '.</p>' +
      '<p class="count muted" style="font-size:var(--step--1)">' + count + (count === 1 ? ' business' : ' businesses') + '</p></a>';
  }).join('') + '</div>' +
'</div></section>' +
'<section class="section-tight"><div class="wrap">' +
  '<div class="section-head"><h2>All ' + c.esc(state.name) + ' listings</h2></div>' +
  c.providerList(ctx, providers) +
'</div></section>' + c.ctaBand(ctx);

  return layout.render(ctx, {
    path: path,
    title: 'Businesses in ' + c.esc(state.name) + ' | ' + ctx.site.name,
    description: 'Service providers listed in ' + state.name + ' on ' + ctx.site.name + ', by city and category.',
    breadcrumbs: crumbsRoot(ctx).concat([
      { name: 'Locations', href: ctx.url('/locations/') },
      { name: state.name, href: ctx.url(path) }
    ]),
    noindex: providers.length === 0,
    noindexReason: providers.length === 0 ? 'state has no published providers' : '',
    schema: [itemList(ctx, providers, 'Businesses in ' + state.name)],
    main: main
  });
}

/* ---------- /locations/<state>/<city>/ ---------- */
function cityPage(ctx, state, city) {
  var providers = ctx.providersByCity[city.slug] || [];
  var path = '/locations/' + state.slug + '/' + city.slug + '/';
  var categories = ctx.categoriesForCity(city.slug);
  var tags = ctx.tagsForProviders(providers);

  var main = '' +
'<section class="section"><div class="wrap">' +
  '<h1>Businesses and professionals in ' + c.esc(city.name) + '</h1>' +
  '<div class="prose" style="margin-top:1rem">' + c.paragraphs([city.intro]) + '</div>' +
  '<div style="margin-top:1.5rem;max-width:720px">' + c.searchForm(ctx, { id: 'city', city: city.slug }) + '</div>' +
'</div></section>' +

(categories.length ? '<section class="section-tight"><div class="wrap">' +
  '<div class="section-head"><h2>Categories with listings in ' + c.esc(city.name) + '</h2></div>' +
  c.linkColumns(categories.map(function (cat) {
    var count = ctx.providersByCityCategory[city.slug + '/' + cat.slug].length;
    return {
      href: ctx.url(path + cat.slug + '/'),
      label: cat.name + ' in ' + city.name,
      note: count + (count === 1 ? ' business' : ' businesses')
    };
  })) +
'</div></section>' : '') +

(tags.length ? '<section class="section-tight"><div class="wrap">' +
  '<div class="section-head"><h2>Tags used by ' + c.esc(city.name) + ' businesses</h2></div>' +
  c.tagChips(ctx, tags, { cloud: true, counts: true }) +
'</div></section>' : '') +

'<section class="section-tight"><div class="wrap">' +
  '<div class="section-head"><h2>All ' + c.esc(city.name) + ' listings</h2></div>' +
  c.providerList(ctx, providers) +
'</div></section>' +

(city.neighborhoodsServed && city.neighborhoodsServed.length ? '<section class="section-tight"><div class="wrap">' +
  '<div class="section-head"><h2>Areas covered</h2><p>Service areas set by the businesses themselves. Check each page for its own radius.</p></div>' +
  '<ul class="tag-list">' + city.neighborhoodsServed.map(function (n) {
    return '<li><span class="tag tag-plain">' + c.esc(n) + '</span></li>';
  }).join('') + '</ul>' +
'</div></section>' : '') +

c.ctaBand(ctx);

  return layout.render(ctx, {
    path: path,
    title: 'Businesses and professionals in ' + c.esc(city.name) + ', ' + c.esc(state.state) + ' | ' + ctx.site.name,
    description: 'Find service providers in ' + city.name + ', ' + state.state + ': ' +
      categories.map(function (cat) { return cat.name.toLowerCase(); }).join(', ') + '. Each business has its own page and direct contact.',
    breadcrumbs: crumbsRoot(ctx).concat([
      { name: 'Locations', href: ctx.url('/locations/') },
      { name: state.name, href: ctx.url('/locations/' + state.slug + '/') },
      { name: city.name, href: ctx.url(path) }
    ]),
    noindex: providers.length === 0,
    noindexReason: providers.length === 0 ? 'city has no published providers' : '',
    scripts: ['search.js'],
    schema: [itemList(ctx, providers, 'Businesses in ' + city.name)],
    main: main
  });
}

/* ---------- /locations/<state>/<city>/<category>/ ---------- */
function cityCategoryPage(ctx, state, city, category) {
  var providers = ctx.providersByCityCategory[city.slug + '/' + category.slug] || [];
  var path = '/locations/' + state.slug + '/' + city.slug + '/' + category.slug + '/';
  var min = ctx.site.indexRules.minProvidersForCityCategoryIndex;
  var tags = ctx.tagsForProviders(providers);
  var otherCities = ctx.citiesForCategory(category.slug).filter(function (p) { return p.city.slug !== city.slug; });

  var main = '' +
'<section class="section"><div class="wrap">' +
  '<h1>' + c.esc(category.name) + ' companies in ' + c.esc(city.name) + '</h1>' +
  '<p class="lede" style="margin-top:1rem">' +
    c.esc('Businesses offering ' + category.name.toLowerCase() + ' in ' + city.name + ', ' + state.state +
    '. Read what each one covers, then contact them directly.') + '</p>' +
'</div></section>' +

'<section class="section-tight"><div class="wrap">' +
  '<div class="results-head"><span class="results-count">' + providers.length +
    (providers.length === 1 ? ' business' : ' businesses') + ' in ' + c.esc(city.name) + '</span>' +
    '<a href="' + ctx.url('/categories/' + category.slug + '/') + '">See all ' + c.esc(category.name.toLowerCase()) + ' listings</a></div>' +
  c.providerList(ctx, providers, c.emptyState(ctx, 'No ' + category.name.toLowerCase() + ' business has published a page in ' + city.name + ' yet.')) +
'</div></section>' +

(tags.length ? '<section class="section-tight"><div class="wrap">' +
  '<div class="section-head"><h2>What these businesses cover</h2></div>' +
  c.tagChips(ctx, tags, { cloud: true, counts: true }) +
'</div></section>' : '') +

'<section class="section-tight"><div class="wrap">' +
  '<div class="section-head"><h2>Service area</h2></div>' +
  '<p>' + c.esc(city.intro) + '</p>' +
  (city.neighborhoodsServed ? '<ul class="tag-list" style="margin-top:1rem">' + city.neighborhoodsServed.map(function (n) {
    return '<li><span class="tag tag-plain">' + c.esc(n) + '</span></li>';
  }).join('') + '</ul>' : '') +
'</div></section>' +

'<div class="wrap">' + c.faqBlock(ctx, category.faq, 'Questions about ' + category.name.toLowerCase()) + '</div>' +

(otherCities.length ? '<section class="section-tight"><div class="wrap">' +
  '<div class="section-head"><h2>' + c.esc(category.name) + ' in other cities</h2></div>' +
  c.linkColumns(otherCities.map(function (place) {
    return {
      href: ctx.url('/locations/' + place.state.slug + '/' + place.city.slug + '/' + category.slug + '/'),
      label: category.name + ' in ' + place.city.name
    };
  })) +
'</div></section>' : '') +

c.ctaBand(ctx);

  return layout.render(ctx, {
    path: path,
    title: c.esc(category.name) + ' companies in ' + c.esc(city.name) + ', ' + c.esc(state.state) + ' | ' + ctx.site.name,
    description: providers.length + ' ' + category.pluralNoun + ' listed in ' + city.name + ', ' + state.state +
      ' on ' + ctx.site.name + '. Services, service areas and direct contact for each one.',
    breadcrumbs: crumbsRoot(ctx).concat([
      { name: 'Locations', href: ctx.url('/locations/') },
      { name: state.name, href: ctx.url('/locations/' + state.slug + '/') },
      { name: city.name, href: ctx.url('/locations/' + state.slug + '/' + city.slug + '/') },
      { name: category.name, href: ctx.url(path) }
    ]),
    noindex: providers.length < min,
    noindexReason: providers.length < min ? 'fewer than ' + min + ' providers in this city and category' : '',
    schema: [itemList(ctx, providers, category.name + ' companies in ' + city.name), c.faqSchema(category.faq)],
    main: main
  });
}

/* ---------- /providers/ ---------- */
function providersIndex(ctx) {
  var main = '' +
'<section class="section"><div class="wrap">' +
  '<h1>Every business listed on ' + c.esc(ctx.site.name) + '</h1>' +
  '<p class="lede" style="margin-top:.75rem">' + ctx.providers.length + ' businesses have published a page. Listed alphabetically, with no ranking applied.</p>' +
'</div></section>' +
'<section class="section-tight"><div class="wrap">' +
  c.providerList(ctx, ctx.providers.slice().sort(function (a, b) { return a.name.localeCompare(b.name); })) +
'</div></section>' + c.ctaBand(ctx);

  return layout.render(ctx, {
    path: '/providers/',
    title: 'All listed businesses | ' + ctx.site.name,
    description: 'The complete list of businesses with a page on ' + ctx.site.name + ', in alphabetical order.',
    breadcrumbs: crumbsRoot(ctx).concat([{ name: 'Businesses', href: ctx.url('/providers/') }]),
    schema: [itemList(ctx, ctx.providers, 'Listed businesses')],
    main: main
  });
}

module.exports = {
  categoriesIndex: categoriesIndex,
  categoryPage: categoryPage,
  subcategoryPage: subcategoryPage,
  locationsIndex: locationsIndex,
  statePage: statePage,
  cityPage: cityPage,
  cityCategoryPage: cityCategoryPage,
  providersIndex: providersIndex,
  itemList: itemList
};
