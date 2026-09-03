/* home.js — the front page. The hero is the search itself plus the tag
   cloud, because tags are how this directory is meant to be browsed. */
'use strict';

var c = require('../components');
var layout = require('../layout');

module.exports = function home(ctx) {
  var featuredCategories = ctx.categories.filter(function (cat) { return cat.featured; });
  var featured = ctx.providers.filter(function (p) { return p.featured; }).slice(0, 4);
  var topTags = ctx.tagsRanked.slice(0, 10).map(function (t) { return t.slug; });

  var main = '' +
'<section class="hero">' +
  '<div class="wrap">' +
    '<h1>Find local businesses that show their work</h1>' +
    '<p class="lede">Every business here has a full page: what they do, where they work, how they price it, and a direct line to ask. Search by what you need, or browse by tag.</p>' +
    '<div class="hero-search">' + c.searchForm(ctx, { id: 'hero' }) + '</div>' +
    '<div class="hero-tags">' +
      '<span class="hero-tags-label" id="popular-tags-label">Popular tags</span>' +
      c.tagChips(ctx, topTags, { cloud: true, counts: true }) +
    '</div>' +
  '</div>' +
'</section>' +

'<section class="section">' +
  '<div class="wrap">' +
    '<div class="section-head"><h2>Browse by category</h2>' +
      '<p>Five categories are live. Each one lists the businesses that have published a page, not every company in the city.</p></div>' +
    '<div class="grid grid-3">' +
      featuredCategories.map(function (cat) { return c.categoryCard(ctx, cat); }).join('') +
    '</div>' +
  '</div>' +
'</section>' +

(featured.length ? '<section class="section-tight">' +
  '<div class="wrap">' +
    '<div class="section-head"><h2>Recently published pages</h2>' +
      '<p>Businesses that have filled in their full profile.</p></div>' +
    c.providerList(ctx, featured) +
  '</div>' +
'</section>' : '') +

'<section class="section">' +
  '<div class="wrap split">' +
    '<div>' +
      '<div class="section-head"><h2>Where we cover</h2>' +
        '<p>Coverage grows city by city, only where there are businesses to list.</p></div>' +
      c.linkColumns(ctx.cities.map(function (place) {
        var count = (ctx.providersByCity[place.city.slug] || []).length;
        return {
          href: ctx.url('/locations/' + place.state.slug + '/' + place.city.slug + '/'),
          label: place.city.name + ', ' + place.state.state,
          note: count + (count === 1 ? ' business' : ' businesses')
        };
      })) +
    '</div>' +
    '<div class="surface">' +
      '<h2 style="font-size:var(--step-2)">How this works</h2>' +
      '<ol class="stack" style="margin-top:1rem;padding-left:1.1rem">' +
        '<li>Search or follow a tag until you find businesses that match.</li>' +
        '<li>Open a business page and read what they actually do.</li>' +
        '<li>Message them directly. Nothing goes through a middleman.</li>' +
      '</ol>' +
      '<p class="muted" style="margin-top:1rem;font-size:var(--step--1)">' +
        'Businesses write their own pages. We do not rank, rate or score them.</p>' +
    '</div>' +
  '</div>' +
'</section>' +

c.ctaBand(ctx);

  return layout.render(ctx, {
    path: '/',
    title: ctx.site.name + ' — local businesses and service providers',
    description: ctx.site.description,
    main: main,
    scripts: ['search.js'],
    schema: [
      {
        '@type': 'WebSite',
        name: ctx.site.name,
        url: ctx.absolute('/'),
        description: ctx.site.description,
        inLanguage: ctx.site.lang,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: ctx.absolute('/search/') + '?q={search_term_string}'
          },
          'query-input': 'required name=search_term_string'
        }
      },
      {
        '@type': 'Organization',
        name: ctx.site.legalName || ctx.site.name,
        url: ctx.absolute('/'),
        logo: ctx.absolute('/assets/icons/logo.svg')
      }
    ]
  });
};
