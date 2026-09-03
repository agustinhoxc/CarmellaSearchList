/* static.js — search results plus the portal's own pages. */
'use strict';

var c = require('../components');
var layout = require('../layout');

function searchPage(ctx) {
  var main = '' +
'<section class="section"><div class="wrap" data-search-page data-portal="' + c.attr(ctx.site.name) + '">' +
  '<h1>Search the directory</h1>' +
  '<div style="margin-top:1.25rem;max-width:760px">' + c.searchForm(ctx, { id: 'page', dataAttr: 'data-search-form' }) + '</div>' +
  '<div class="split" style="margin-top:2rem">' +
    '<div>' +
      '<div class="results-head">' +
        '<span class="results-count" data-results-count role="status" aria-live="polite">Loading businesses…</span>' +
        '<a href="' + ctx.url('/tags/') + '">Browse by tag instead</a>' +
      '</div>' +
      '<ul class="provider-list" data-results></ul>' +
      '<noscript><p class="empty-state" style="margin-top:1rem">Search needs JavaScript. You can still browse every business through ' +
        '<a href="' + ctx.url('/categories/') + '">categories</a>, <a href="' + ctx.url('/tags/') + '">tags</a> or ' +
        '<a href="' + ctx.url('/providers/') + '">the full list</a>.</p></noscript>' +
    '</div>' +
    '<aside class="surface" aria-label="Filters"><div class="filters" data-filters></div></aside>' +
  '</div>' +
'</div></section>';

  return layout.render(ctx, {
    path: '/search/',
    title: 'Search | ' + ctx.site.name,
    description: 'Search businesses on ' + ctx.site.name + ' by service, tag and city.',
    noindex: true,
    noindexReason: 'internal search results',
    scripts: ['search.js'],
    breadcrumbs: [{ name: 'Home', href: ctx.url('/') }, { name: 'Search', href: ctx.url('/search/') }],
    main: main
  });
}

function aboutPage(ctx) {
  var main = '' +
'<section class="section"><div class="wrap wrap-narrow">' +
  '<h1>About ' + c.esc(ctx.site.name) + '</h1>' +
  '<div class="prose stack" style="margin-top:1.5rem">' +
    '<p>' + c.esc(ctx.site.name) + ' is a directory of local businesses and service providers. Each listed business gets a full page — services, service area, hours, photos and a direct contact button — rather than a line in a list.</p>' +
    '<h2>How businesses get listed</h2>' +
    '<p>Businesses are added by the directory administrator using information the business supplies: what they do, where they work, how to reach them. Nothing is scraped, and no page is published about a business that has not asked to be listed.</p>' +
    '<h2>How results are ordered</h2>' +
    '<p>Listings are shown in a fixed order within each page, not scored or ranked. Businesses that pay for a featured or sponsored placement are marked as such on the card, and they are never shown in place of an unpaid listing — only alongside it.</p>' +
    '<h2>What we do not do</h2>' +
    '<p>We do not publish reviews, star ratings or "best of" lists, because we have no verified basis for them. We do not create pages for city and service combinations where no business is actually listed. Tags are written by businesses to describe real capability, and tag pages are only indexed once they have a written definition and enough businesses to be useful.</p>' +
    '<h2>Demonstration data</h2>' +
    '<p>This build ships with example listings so the structure can be reviewed. Every demo business is fictional and marked with a "Demo listing" badge. Replace <code>/data/providers.json</code> with real businesses before publishing.</p>' +
    '<h2>Contact</h2>' +
    '<p>Corrections, removals and listing requests: <a href="mailto:' + c.attr(ctx.site.contactEmail) + '">' + c.esc(ctx.site.contactEmail) + '</a>.</p>' +
  '</div>' +
'</div></section>';

  return layout.render(ctx, {
    path: '/about/',
    title: 'About | ' + ctx.site.name,
    description: 'How ' + ctx.site.name + ' works: how businesses are listed, how results are ordered, and what the directory deliberately does not publish.',
    breadcrumbs: [{ name: 'Home', href: ctx.url('/') }, { name: 'About', href: ctx.url('/about/') }],
    main: main
  });
}

function forBusinessPage(ctx) {
  var categoryOptions = ctx.categories.map(function (cat) {
    return '<option value="' + c.attr(cat.name) + '">' + c.esc(cat.name) + '</option>';
  }).join('');
  var cityOptions = ctx.cities.map(function (place) {
    return '<option value="' + c.attr(place.city.name) + '">' + c.esc(place.city.name) + ', ' + c.esc(place.state.state) + '</option>';
  }).join('');

  var main = '' +
'<section class="hero"><div class="wrap">' +
  '<h1>Put your business where people are already looking</h1>' +
  '<p class="lede">A listing here is a working page, not an ad: your services in your words, your service area, your photos, and a WhatsApp button that tells you the lead came from ' + c.esc(ctx.site.name) + '.</p>' +
'</div></section>' +

'<section class="section"><div class="wrap">' +
  '<div class="grid grid-3">' +
    '<div class="card"><h3>Your own page</h3><p>A dedicated URL you can put on a card, a van or an invoice. It works as a landing page even for people who never touch the directory.</p></div>' +
    '<div class="card"><h3>Found in search</h3><p>Your page carries its own title, description, structured data and internal links, and is submitted in the sitemap. No guarantees on ranking — only that the technical work is done properly.</p></div>' +
    '<div class="card"><h3>Leads you can trace</h3><p>Every WhatsApp message opens with where the person found you, so you can tell what the listing is worth.</p></div>' +
    '<div class="card"><h3>Tags that match intent</h3><p>Describe what you actually offer — battery storage, evening hours, accessible builds — and appear when someone browses that tag.</p></div>' +
    '<div class="card"><h3>Your own look</h3><p>Your logo, photos and brand colours are applied to your page, inside the directory\'s layout.</p></div>' +
    '<div class="card"><h3>No lock-in</h3><p>You supply the content and can have it corrected or removed at any time.</p></div>' +
  '</div>' +
'</div></section>' +

'<section class="section-tight"><div class="wrap split">' +
  '<div>' +
    '<div class="section-head"><h2>What we need from you</h2></div>' +
    '<ul class="check-list">' +
      '<li>Business name, category and the city you work from</li>' +
      '<li>A short description and a longer one in your own words</li>' +
      '<li>Your services, with a sentence about each</li>' +
      '<li>Service area, hours, phone and WhatsApp number</li>' +
      '<li>Logo and a few photos of real work</li>' +
      '<li>Anything you get asked constantly — it becomes your FAQ</li>' +
    '</ul>' +
    '<p style="margin-top:1.5rem">We do not invent content for you, and we do not publish claims we cannot support. If a detail is missing, the section is simply left off your page.</p>' +
  '</div>' +
  '<div class="surface">' +
    '<h2 style="font-size:var(--step-2)">Ask about a listing</h2>' +
    '<p class="muted" style="margin-top:.5rem;font-size:var(--step--1)">This form opens WhatsApp with your details filled in. Nothing is stored on this site.</p>' +
    '<form class="stack" style="margin-top:1.25rem" data-lead-form data-portal="' + c.attr(ctx.site.name) + '" data-whatsapp="' + c.attr(ctx.site.contactWhatsapp) + '">' +
      '<div class="field"><label for="lead-name">Your name</label><input type="text" id="lead-name" name="name" autocomplete="name" required></div>' +
      '<div class="field"><label for="lead-business">Business name</label><input type="text" id="lead-business" name="business" autocomplete="organization" required></div>' +
      '<div class="field"><label for="lead-category">Category</label><select id="lead-category" name="category"><option value="">Not sure yet</option>' + categoryOptions + '<option value="Other">Something else</option></select></div>' +
      '<div class="field"><label for="lead-city">City</label><select id="lead-city" name="city"><option value="">Somewhere else</option>' + cityOptions + '</select></div>' +
      '<div class="field"><label for="lead-website">Website or social profile (optional)</label><input type="text" id="lead-website" name="website" autocomplete="url"></div>' +
      '<button class="btn btn-primary btn-block" type="submit" data-track="lead_form_open">Continue on WhatsApp</button>' +
      '<p class="muted" data-lead-status role="status" aria-live="polite" style="font-size:var(--step--1)"></p>' +
    '</form>' +
  '</div>' +
'</div></section>';

  return layout.render(ctx, {
    path: '/for-business/',
    title: 'List your business | ' + ctx.site.name,
    description: 'Get a full page for your business on ' + ctx.site.name + ': services, service area, photos, tags and a WhatsApp button that shows where the lead came from.',
    breadcrumbs: [{ name: 'Home', href: ctx.url('/') }, { name: 'List your business', href: ctx.url('/for-business/') }],
    main: main
  });
}

function legalPage(ctx, page) {
  var main = '' +
'<section class="section"><div class="wrap wrap-narrow">' +
  '<h1>' + c.esc(page.heading) + '</h1>' +
  '<p class="muted" style="margin-top:.75rem">Draft for legal review. Replace this text with terms prepared for your jurisdiction before launch.</p>' +
  '<div class="prose stack" style="margin-top:1.5rem">' + page.body + '</div>' +
'</div></section>';

  return layout.render(ctx, {
    path: page.path,
    title: page.heading + ' | ' + ctx.site.name,
    description: page.description,
    breadcrumbs: [{ name: 'Home', href: ctx.url('/') }, { name: page.heading, href: ctx.url(page.path) }],
    main: main
  });
}

function privacyPage(ctx) {
  return legalPage(ctx, {
    path: '/privacy/',
    heading: 'Privacy',
    description: 'How ' + ctx.site.name + ' handles visitor data. Draft pending legal review.',
    body: [
      '<h2>What this site collects</h2>',
      '<p>This is a static site. It has no accounts, no login and no database. Forms on the site do not send data to a server: they open a WhatsApp message on your own device with the details you typed, which you then choose to send or not.</p>',
      '<h2>Analytics</h2>',
      '<p>No analytics tool is installed in this build. If one is added later, this section must state which tool, what it records and how long data is kept.</p>',
      '<h2>Third parties</h2>',
      '<p>Contact links open external services such as WhatsApp, your phone app or a business website. Those services have their own privacy terms and are outside our control.</p>',
      '<h2>Business information</h2>',
      '<p>Information on business pages is supplied by the business itself for publication. A listed business can ask for a correction or removal at any time by writing to ' + c.esc(ctx.site.contactEmail) + '.</p>',
      '<h2>Contact</h2>',
      '<p>Privacy questions: ' + c.esc(ctx.site.contactEmail) + '.</p>'
    ].join('\n')
  });
}

function termsPage(ctx) {
  return legalPage(ctx, {
    path: '/terms/',
    heading: 'Terms of use',
    description: 'Terms for visitors and listed businesses on ' + ctx.site.name + '. Draft pending legal review.',
    body: [
      '<h2>What this directory is</h2>',
      '<p>' + c.esc(ctx.site.name) + ' publishes pages about businesses using information those businesses supply. We are not a party to any agreement you make with them, and we do not carry out the work described.</p>',
      '<h2>Accuracy</h2>',
      '<p>Business details change. Confirm prices, availability, licensing and insurance directly with the business before hiring. Report anything inaccurate to ' + c.esc(ctx.site.contactEmail) + ' and it will be corrected or removed.</p>',
      '<h2>Paid placement</h2>',
      '<p>Featured and sponsored placements are labelled on the listing. Paying for placement does not change the information published, and unpaid listings are never hidden.</p>',
      '<h2>Content ownership</h2>',
      '<p>Businesses keep the rights to their own logos, photos and text, and grant permission to publish them here. The directory structure, design and code belong to the portal operator.</p>',
      '<h2>Removal</h2>',
      '<p>A listed business may request removal at any time, and pages are taken down within a reasonable period.</p>'
    ].join('\n')
  });
}

module.exports = {
  searchPage: searchPage,
  aboutPage: aboutPage,
  forBusinessPage: forBusinessPage,
  privacyPage: privacyPage,
  termsPage: termsPage
};
