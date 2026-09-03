/* layout.js — the HTML shell every generated page shares.
   Owns <head>: title, description, robots, canonical, Open Graph, JSON-LD. */
'use strict';

var c = require('./components');

function jsonLd(ctx, blocks) {
  var graph = blocks.filter(Boolean);
  if (!graph.length) return '';
  var doc = { '@context': 'https://schema.org', '@graph': graph };
  return '<script type="application/ld+json">' +
    JSON.stringify(doc, null, 2).replace(/</g, '\\u003c') +
    '</script>';
}

/**
 * @param {Object} ctx   build context (site, url helpers, indexes)
 * @param {Object} page
 *   path        {string}  absolute site path, e.g. '/categories/solar-energy/'
 *   title       {string}  full <title>
 *   description {string}
 *   noindex     {boolean}
 *   noindexReason {string} written into an HTML comment for auditing
 *   breadcrumbs {Array}
 *   schema      {Array}
 *   bodyClass   {string}
 *   headExtra   {string}
 *   scripts     {Array<string>} extra script src values (relative to /js/)
 *   main        {string}  page body HTML
 */
function render(ctx, page) {
  var canonical = ctx.absolute(page.path);
  var ogImage = ctx.absolute(page.ogImage || ctx.site.defaultOgImage);
  var robots = page.noindex
    ? 'noindex, follow'
    : 'index, follow, max-image-preview:large';
  var scripts = ['whatsapp.js', 'providers.js', 'categories.js']
    .concat(page.scripts || [])
    .concat(['app.js']);

  var schema = [c.breadcrumbSchema(ctx, page.breadcrumbs)].concat(page.schema || []);

  return '<!DOCTYPE html>\n' +
'<html lang="' + ctx.site.lang + '" data-base="' + c.attr(ctx.basePath) + '">\n' +
'<head>\n' +
'<meta charset="utf-8">\n' +
'<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
'<title>' + c.esc(page.title) + '</title>\n' +
'<meta name="description" content="' + c.attr(page.description) + '">\n' +
'<meta name="robots" content="' + robots + '">\n' +
(page.noindex && page.noindexReason ? '<!-- noindex: ' + page.noindexReason + ' -->\n' : '') +
'<link rel="canonical" href="' + c.attr(canonical) + '">\n' +
'<meta property="og:type" content="' + c.attr(page.ogType || 'website') + '">\n' +
'<meta property="og:site_name" content="' + c.attr(ctx.site.name) + '">\n' +
'<meta property="og:locale" content="' + c.attr(ctx.site.locale) + '">\n' +
'<meta property="og:title" content="' + c.attr(page.ogTitle || page.title) + '">\n' +
'<meta property="og:description" content="' + c.attr(page.description) + '">\n' +
'<meta property="og:url" content="' + c.attr(canonical) + '">\n' +
'<meta property="og:image" content="' + c.attr(ogImage) + '">\n' +
'<meta name="twitter:card" content="summary_large_image">\n' +
(ctx.site.twitterHandle ? '<meta name="twitter:site" content="' + c.attr(ctx.site.twitterHandle) + '">\n' : '') +
'<link rel="icon" href="' + ctx.url('/assets/icons/favicon.svg') + '" type="image/svg+xml">\n' +
'<link rel="stylesheet" href="' + ctx.url('/css/style.css') + '">\n' +
(page.headExtra || '') +
jsonLd(ctx, schema) + '\n' +
'</head>\n' +
'<body class="' + c.attr(page.bodyClass || '') + '">\n' +
(ctx.demoMode ? '<p class="demo-banner">Demonstration data. The businesses listed are fictional examples — see <a href="' + ctx.url('/about/') + '">about this directory</a>.</p>\n' : '') +
c.header(ctx, page.path) +
c.breadcrumb(ctx, page.breadcrumbs) +
'<main id="main">\n' + page.main + '\n</main>\n' +
c.footer(ctx) +
(page.bodyEnd || '') +
scripts.map(function (s) {
  return '<script src="' + ctx.url('/js/' + s) + '" defer></script>';
}).join('\n') + '\n' +
'</body>\n</html>\n';
}

module.exports = { render: render, jsonLd: jsonLd };
