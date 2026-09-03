#!/usr/bin/env node
/* build.js — turns /data/*.json into static HTML.
 *
 *   node generator/build.js
 *   SITE_URL=https://example.com node generator/build.js
 *   BASE_PATH=/repo-name node generator/build.js     (GitHub Pages subfolder)
 *
 * Node is a build-time tool only. The published site is plain HTML, CSS and
 * JavaScript and needs no server. */
'use strict';

var fs = require('fs');
var path = require('path');

var ROOT = path.resolve(__dirname, '..');
var read = function (file) { return JSON.parse(fs.readFileSync(path.join(ROOT, 'data', file), 'utf8')); };

var site = read('site.json');
var categories = read('categories.json');
var locations = read('locations.json');
var tags = read('tags.json');
var providersRaw = read('providers.json');

if (process.env.SITE_URL) site.url = process.env.SITE_URL.replace(/\/$/, '');
var basePath = (process.env.BASE_PATH || site.basePath || '').replace(/\/$/, '');

/* ---------- context ---------- */
var providers = providersRaw.filter(function (p) { return p.active !== false; });

var categoryBySlug = {};
categories.forEach(function (c) { categoryBySlug[c.slug] = c; });

var tagBySlug = {};
tags.forEach(function (t) { tagBySlug[t.slug] = t; });

var cities = [];
var cityBySlug = {};
locations.forEach(function (state) {
  (state.cities || []).forEach(function (city) {
    var place = { city: city, state: state };
    cities.push(place);
    cityBySlug[city.slug] = place;
  });
});

var providersByCategory = {};
var providersBySubcategory = {};
var providersByCity = {};
var providersByCityCategory = {};
var providersByTag = {};
var tagCounts = {};

providers.forEach(function (p) {
  var category = categoryBySlug[p.category];
  if (!category) throw new Error('Unknown category "' + p.category + '" on provider ' + p.slug);
  var place = cityBySlug[p.city];
  if (!place) throw new Error('Unknown city "' + p.city + '" on provider ' + p.slug);
  var sub = (category.subcategories || []).filter(function (s) { return s.slug === p.subcategory; })[0];

  p._categoryName = category.name;
  p._subcategoryName = sub ? sub.name : '';
  p._cityName = place.city.name;
  p._stateName = place.state.name;
  p._stateSlug = place.state.slug;
  p._logo = basePath + '/assets/providers/' + p.slug + '/' + (p.logo || 'logo.svg');
  p._hero = basePath + '/assets/providers/' + p.slug + '/' + (p.heroImage || 'hero.svg');

  (providersByCategory[p.category] = providersByCategory[p.category] || []).push(p);
  if (sub) {
    var subKey = p.category + '/' + sub.slug;
    (providersBySubcategory[subKey] = providersBySubcategory[subKey] || []).push(p);
  }
  (providersByCity[p.city] = providersByCity[p.city] || []).push(p);
  var ccKey = p.city + '/' + p.category;
  (providersByCityCategory[ccKey] = providersByCityCategory[ccKey] || []).push(p);
  (p.tags || []).forEach(function (slug) {
    (providersByTag[slug] = providersByTag[slug] || []).push(p);
    tagCounts[slug] = (tagCounts[slug] || 0) + 1;
  });
});

var tagsRanked = Object.keys(providersByTag).map(function (slug) {
  var defined = tagBySlug[slug];
  return {
    slug: slug,
    name: defined ? defined.name : slug.replace(/-/g, ' ').replace(/^./, function (m) { return m.toUpperCase(); }),
    description: defined ? defined.description : '',
    described: !!defined,
    count: providersByTag[slug].length
  };
}).sort(function (a, b) { return b.count - a.count || a.name.localeCompare(b.name); });

var ctx = {
  site: site,
  basePath: basePath,
  demoMode: providers.some(function (p) { return p.demo; }),
  categories: categories,
  locations: locations,
  tags: tags,
  cities: cities,
  providers: providers,
  categoryBySlug: categoryBySlug,
  cityBySlug: cityBySlug,
  tagBySlug: tagBySlug,
  tagsRanked: tagsRanked,
  tagCounts: tagCounts,
  providersByCategory: providersByCategory,
  providersBySubcategory: providersBySubcategory,
  providersByCity: providersByCity,
  providersByCityCategory: providersByCityCategory,
  providersByTag: providersByTag,
  url: function (p) { return basePath + p; },
  absolute: function (p) {
    if (/^https?:/.test(p)) return p;
    return site.url + (p.indexOf(basePath) === 0 ? p : basePath + p);
  },
  citiesForCategory: function (slug) {
    return cities.filter(function (place) {
      return (providersByCityCategory[place.city.slug + '/' + slug] || []).length > 0;
    });
  },
  categoriesForCity: function (slug) {
    return categories.filter(function (cat) {
      return (providersByCityCategory[slug + '/' + cat.slug] || []).length > 0;
    });
  },
  tagsForProviders: function (list) {
    var seen = [];
    list.forEach(function (p) {
      (p.tags || []).forEach(function (t) { if (seen.indexOf(t) === -1) seen.push(t); });
    });
    return seen.sort(function (a, b) { return (tagCounts[b] || 0) - (tagCounts[a] || 0); });
  },
  relatedProviders: function (provider) {
    var sameCategory = (providersByCategory[provider.category] || []).filter(function (p) { return p.slug !== provider.slug; });
    var sameCity = (providersByCity[provider.city] || []).filter(function (p) {
      return p.slug !== provider.slug && sameCategory.indexOf(p) === -1;
    });
    return sameCategory.concat(sameCity).slice(0, 3);
  }
};

/* ---------- templates ---------- */
var home = require('../templates/pages/home');
var directory = require('../templates/pages/directory');
var providerTemplate = require('../templates/pages/provider');
var tagPages = require('../templates/pages/tags');
var staticPages = require('../templates/pages/static');

/* ---------- output ---------- */
var pages = [];

function emit(urlPath, html, meta) {
  var dir = urlPath === '/' ? ROOT : path.join(ROOT, urlPath.replace(/^\/|\/$/g, ''));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  pages.push(Object.assign({ path: urlPath }, meta || {}));
}

function isNoindex(html) { return /name="robots" content="noindex/.test(html); }

function add(urlPath, html, priority) {
  emit(urlPath, html, { noindex: isNoindex(html), priority: priority });
}

add('/', home(ctx), '1.0');
add('/categories/', directory.categoriesIndex(ctx), '0.8');
add('/locations/', directory.locationsIndex(ctx), '0.7');
add('/providers/', directory.providersIndex(ctx), '0.7');
add('/tags/', tagPages.tagsIndex(ctx), '0.8');
add('/search/', staticPages.searchPage(ctx));
add('/about/', staticPages.aboutPage(ctx), '0.5');
add('/for-business/', staticPages.forBusinessPage(ctx), '0.6');
add('/privacy/', staticPages.privacyPage(ctx), '0.3');
add('/terms/', staticPages.termsPage(ctx), '0.3');

categories.forEach(function (category) {
  add('/categories/' + category.slug + '/', directory.categoryPage(ctx, category), '0.9');
  (category.subcategories || []).forEach(function (sub) {
    add('/categories/' + category.slug + '/' + sub.slug + '/', directory.subcategoryPage(ctx, category, sub), '0.6');
  });
});

locations.forEach(function (state) {
  add('/locations/' + state.slug + '/', directory.statePage(ctx, state), '0.6');
  (state.cities || []).forEach(function (city) {
    add('/locations/' + state.slug + '/' + city.slug + '/', directory.cityPage(ctx, state, city), '0.8');
    ctx.categoriesForCity(city.slug).forEach(function (category) {
      add('/locations/' + state.slug + '/' + city.slug + '/' + category.slug + '/',
        directory.cityCategoryPage(ctx, state, city, category), '0.9');
    });
  });
});

providers.forEach(function (provider) {
  add('/providers/' + provider.slug + '/', providerTemplate(ctx, provider), '0.9');
});

tagsRanked.forEach(function (tag) {
  add('/tags/' + tag.slug + '/', tagPages.tagPage(ctx, tag), '0.7');
});

/* ---------- 404 ---------- */
var notFound = require('../templates/layout').render(ctx, {
  path: '/404.html',
  title: 'Page not found | ' + site.name,
  description: 'That page does not exist on ' + site.name + '.',
  noindex: true,
  noindexReason: 'error page',
  main: '<section class="section"><div class="wrap wrap-narrow">' +
    '<h1>That page does not exist</h1>' +
    '<p class="lede" style="margin-top:1rem">The address may be out of date, or the business page may have been removed.</p>' +
    '<p style="margin-top:1.5rem"><a class="btn btn-primary" href="' + ctx.url('/') + '">Go to the directory</a> ' +
    '<a class="btn btn-secondary" href="' + ctx.url('/search/') + '">Search instead</a></p>' +
    '</div></section>'
});
fs.writeFileSync(path.join(ROOT, '404.html'), notFound);

/* ---------- sitemap + robots ---------- */
var indexable = pages.filter(function (p) { return !p.noindex; });
var today = new Date().toISOString().slice(0, 10);

var sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n' +
'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
indexable.map(function (p) {
  return '  <url>\n' +
    '    <loc>' + ctx.absolute(p.path) + '</loc>\n' +
    '    <lastmod>' + today + '</lastmod>\n' +
    (p.priority ? '    <priority>' + p.priority + '</priority>\n' : '') +
    '  </url>';
}).join('\n') + '\n</urlset>\n';
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);

var robots = [
  'User-agent: *',
  'Allow: /',
  '',
  '# Internal search and filtered views hold no unique content.',
  'Disallow: /search/',
  'Disallow: /*?q=',
  'Disallow: /*?tags=',
  'Disallow: /*?category=',
  'Disallow: /*?city=',
  'Disallow: /admin/',
  '',
  'Sitemap: ' + site.url + basePath + '/sitemap.xml',
  ''
].join('\n');
fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots);
fs.writeFileSync(path.join(ROOT, '.nojekyll'), '');

/* ---------- report ---------- */
var noindexed = pages.filter(function (p) { return p.noindex; });
console.log('Built ' + pages.length + ' pages (+ 404.html)');
console.log('  indexable: ' + indexable.length);
console.log('  noindex:   ' + noindexed.length);
noindexed.forEach(function (p) { console.log('    - ' + p.path); });
if (site.url.indexOf('example') !== -1) {
  console.log('\nWARNING: site.url is still a placeholder (' + site.url + ').');
  console.log('Set your real domain in data/site.json or run with SITE_URL=https://yourdomain.com');
}
