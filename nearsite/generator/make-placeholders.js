#!/usr/bin/env node
/* make-placeholders.js — creates SVG stand-ins for logos, hero images and
 * gallery photos so the demo build renders completely.
 *
 * Real listings should use WebP files at the same paths (set "logo" and
 * "heroImage" in providers.json). Existing files are never overwritten. */
'use strict';

var fs = require('fs');
var path = require('path');

var ROOT = path.resolve(__dirname, '..');
var providers = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'providers.json'), 'utf8'));

function write(file, content) {
  if (fs.existsSync(file)) return false;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return true;
}

function initials(name) {
  return name.replace(/&/g, '').split(/\s+/).filter(Boolean).slice(0, 2)
    .map(function (w) { return w[0].toUpperCase(); }).join('');
}

function logoSvg(p) {
  var t = p.theme || {};
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="' + p.name + ' logo">' +
    '<rect width="128" height="128" rx="16" fill="' + (t.primary || '#2b2a63') + '"/>' +
    '<circle cx="100" cy="28" r="14" fill="' + (t.accent || '#f2c744') + '"/>' +
    '<text x="64" y="82" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="46" font-weight="700" fill="#ffffff">' +
    initials(p.name) + '</text></svg>\n';
}

function sceneSvg(p, w, h, seed, label) {
  var t = p.theme || {};
  var primary = t.primary || '#2b2a63';
  var accent = t.accent || '#f2c744';
  var bars = '';
  for (var i = 0; i < 7; i++) {
    var x = 40 + i * ((w - 80) / 7);
    var bh = 40 + ((i * 37 + seed * 53) % Math.round(h * 0.45));
    bars += '<rect x="' + Math.round(x) + '" y="' + Math.round(h - 60 - bh) + '" width="' +
      Math.round((w - 80) / 7 - 12) + '" height="' + bh + '" rx="6" fill="' +
      (i % 3 === 0 ? accent : '#ffffff') + '" opacity="' + (i % 3 === 0 ? '0.9' : '0.16') + '"/>';
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + label + '">' +
    '<rect width="' + w + '" height="' + h + '" fill="' + primary + '"/>' +
    '<circle cx="' + Math.round(w * 0.82) + '" cy="' + Math.round(h * 0.22) + '" r="' + Math.round(h * 0.16) + '" fill="' + accent + '" opacity="0.85"/>' +
    bars +
    '<rect x="0" y="' + (h - 46) + '" width="' + w + '" height="46" fill="#000000" opacity="0.35"/>' +
    '<text x="24" y="' + (h - 17) + '" font-family="Helvetica,Arial,sans-serif" font-size="16" fill="#ffffff" opacity="0.9">' +
    'Placeholder image — ' + p.name + '</text></svg>\n';
}

var created = 0;
providers.forEach(function (p) {
  var dir = path.join(ROOT, 'assets', 'providers', p.slug);
  if (write(path.join(dir, 'logo.svg'), logoSvg(p))) created++;
  if (write(path.join(dir, 'hero.svg'), sceneSvg(p, 760, 500, 1, p.name + ' hero image placeholder'))) created++;
  (p.gallery || []).forEach(function (g, i) {
    if (write(path.join(dir, g.file), sceneSvg(p, 480, 360, i + 2, g.alt))) created++;
  });
});

/* portal marks */
if (write(path.join(ROOT, 'assets', 'icons', 'favicon.svg'),
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
  '<rect width="64" height="64" rx="12" fill="#2b2a63"/>' +
  '<rect x="16" y="16" width="14" height="14" rx="3" fill="#f2c744"/>' +
  '<rect x="34" y="16" width="14" height="14" rx="3" fill="#ffffff" opacity="0.7"/>' +
  '<rect x="16" y="34" width="14" height="14" rx="3" fill="#ffffff" opacity="0.7"/>' +
  '<rect x="34" y="34" width="14" height="14" rx="3" fill="#ffffff" opacity="0.4"/></svg>\n')) created++;

if (write(path.join(ROOT, 'assets', 'icons', 'logo.svg'),
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 64">' +
  '<rect x="0" y="24" width="16" height="16" rx="4" fill="#2b2a63"/>' +
  '<text x="28" y="42" font-family="Helvetica,Arial,sans-serif" font-size="28" font-weight="700" fill="#191833">Nearsite</text></svg>\n')) created++;

if (write(path.join(ROOT, 'assets', 'og-default.svg'),
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">' +
  '<rect width="1200" height="630" fill="#2b2a63"/>' +
  '<rect x="80" y="250" width="40" height="40" rx="8" fill="#f2c744"/>' +
  '<text x="140" y="285" font-family="Helvetica,Arial,sans-serif" font-size="52" font-weight="700" fill="#ffffff">Nearsite</text>' +
  '<text x="80" y="370" font-family="Helvetica,Arial,sans-serif" font-size="34" fill="#d9d8ee">Find local businesses that show their work.</text></svg>\n')) created++;

console.log('Placeholder assets created: ' + created);
