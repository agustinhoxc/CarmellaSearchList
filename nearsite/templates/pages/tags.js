/* tags.js — tag index and tag pages.
   A tag is a semantic capability declared by the businesses themselves.
   A tag page is only indexable when it has a written definition AND enough
   businesses to be worth landing on. Everything else is generated but noindex. */
'use strict';

var c = require('../components');
var layout = require('../layout');
var directory = require('./directory');

function tagsIndex(ctx) {
  var described = ctx.tagsRanked.filter(function (t) { return t.described; });
  var undescribed = ctx.tagsRanked.filter(function (t) { return !t.described; });

  var main = '' +
'<section class="section"><div class="wrap">' +
  '<h1>Browse by tag</h1>' +
  '<p class="lede" style="margin-top:.75rem">Tags describe what a business actually offers: battery storage, evening hours, accessible design. They are written on each business page and collected here, so you can search across categories.</p>' +
  '<div style="margin-top:1.5rem;max-width:720px">' + c.searchForm(ctx, { id: 'tags' }) + '</div>' +
'</div></section>' +

'<section class="section-tight"><div class="wrap">' +
  '<div class="section-head"><h2>All tags in use</h2><p>' + ctx.tagsRanked.length + ' tags across ' + ctx.providers.length + ' businesses.</p></div>' +
  '<div class="grid grid-2">' + described.map(function (t) {
    return '<a class="card" href="' + ctx.url('/tags/' + t.slug + '/') + '" style="text-decoration:none;color:inherit">' +
      '<h3>' + c.esc(t.name) + ' <span class="tag-count">' + t.count + '</span></h3>' +
      '<p>' + c.esc(t.description) + '</p></a>';
  }).join('') + '</div>' +
  (undescribed.length ? '<h3 style="margin-top:2rem;font-size:var(--step-1)">Other tags</h3>' +
    '<p class="muted" style="font-size:var(--step--1);margin-bottom:.75rem">These are in use but do not have a written definition yet, so they are not indexed.</p>' +
    c.tagChips(ctx, undescribed.map(function (t) { return t.slug; }), { counts: true }) : '') +
'</div></section>' + c.ctaBand(ctx);

  return layout.render(ctx, {
    path: '/tags/',
    title: 'Browse businesses by tag | ' + ctx.site.name,
    description: 'Tags on ' + ctx.site.name + ' describe what businesses offer — battery storage, evening hours, accessible design — so you can search across categories and cities.',
    breadcrumbs: [{ name: 'Home', href: ctx.url('/') }, { name: 'Tags', href: ctx.url('/tags/') }],
    scripts: ['search.js'],
    main: main
  });
}

function tagPage(ctx, tag) {
  var providers = ctx.providersByTag[tag.slug] || [];
  var path = '/tags/' + tag.slug + '/';
  var min = ctx.site.indexRules.minProvidersForTagIndex;
  var indexable = tag.described && providers.length >= min;

  var cities = [];
  var categories = [];
  providers.forEach(function (p) {
    if (cities.indexOf(p._cityName) === -1) cities.push(p._cityName);
    if (categories.indexOf(p.category) === -1) categories.push(p.category);
  });

  var siblings = ctx.tagsRanked.filter(function (t) {
    return t.slug !== tag.slug && t.described && providers.some(function (p) {
      return (p.tags || []).indexOf(t.slug) !== -1;
    });
  }).slice(0, 8);

  var main = '' +
'<section class="section"><div class="wrap">' +
  '<h1>' + c.esc(tag.name) + '</h1>' +
  (tag.description ? '<p class="lede" style="margin-top:1rem">' + c.esc(tag.description) + '</p>'
    : '<p class="lede" style="margin-top:1rem">Businesses that list this tag on their page.</p>') +
  '<p style="margin-top:1rem" class="muted">' + providers.length + (providers.length === 1 ? ' business' : ' businesses') +
    (cities.length ? ' in ' + c.esc(cities.join(', ')) : '') + '.</p>' +
'</div></section>' +

'<section class="section-tight"><div class="wrap">' +
  '<div class="section-head"><h2>Businesses with this tag</h2></div>' +
  c.providerList(ctx, providers, c.emptyState(ctx, 'No business is using this tag yet.')) +
'</div></section>' +

(categories.length ? '<section class="section-tight"><div class="wrap">' +
  '<div class="section-head"><h2>Categories where this tag appears</h2></div>' +
  c.linkColumns(categories.map(function (slug) {
    var cat = ctx.categoryBySlug[slug];
    return { href: ctx.url('/categories/' + slug + '/'), label: cat ? cat.name : slug };
  })) +
'</div></section>' : '') +

(siblings.length ? '<section class="section-tight"><div class="wrap">' +
  '<div class="section-head"><h2>Tags often used alongside this one</h2></div>' +
  c.tagChips(ctx, siblings.map(function (t) { return t.slug; }), { cloud: true, counts: true }) +
'</div></section>' : '') +

'<section class="section-tight"><div class="wrap">' +
  '<p><a href="' + ctx.url('/tags/') + '">See all tags</a> or <a href="' + ctx.url('/search/') + '">combine several in search</a>.</p>' +
'</div></section>' +

c.ctaBand(ctx, {
  title: 'Do you offer ' + tag.name.toLowerCase() + '?',
  text: 'Add the tag to your business page and appear on this list. Tags are written by the business, and we only publish ones that describe real capability.'
});

  return layout.render(ctx, {
    path: path,
    title: c.esc(tag.name) + ' — businesses on ' + ctx.site.name,
    description: (tag.description || ('Businesses that offer ' + tag.name.toLowerCase() + '.')).slice(0, 155),
    breadcrumbs: [
      { name: 'Home', href: ctx.url('/') },
      { name: 'Tags', href: ctx.url('/tags/') },
      { name: tag.name, href: ctx.url(path) }
    ],
    noindex: !indexable,
    noindexReason: !indexable
      ? (!tag.described ? 'tag has no written definition' : 'fewer than ' + min + ' businesses with this tag')
      : '',
    schema: [directory.itemList(ctx, providers, tag.name)],
    main: main
  });
}

module.exports = { tagsIndex: tagsIndex, tagPage: tagPage };
