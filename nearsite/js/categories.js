/* categories.js — category, city and tag helpers used by the search filters. */
(function (global) {
  'use strict';

  var NS = (global.Nearsite = global.Nearsite || {});

  function countBy(providers, key) {
    var out = {};
    providers.forEach(function (p) {
      var value = p[key];
      if (!value) return;
      out[value] = (out[value] || 0) + 1;
    });
    return out;
  }

  function countTags(providers) {
    var out = {};
    providers.forEach(function (p) {
      (p.tags || []).forEach(function (t) { out[t] = (out[t] || 0) + 1; });
    });
    return out;
  }

  function categoryOptions(data) {
    var counts = countBy(data.providers, 'category');
    return data.categories
      .filter(function (c) { return counts[c.slug]; })
      .map(function (c) { return { value: c.slug, label: c.name, count: counts[c.slug] }; });
  }

  function cityOptions(data) {
    var counts = countBy(data.providers, 'city');
    var out = [];
    data.locations.forEach(function (state) {
      (state.cities || []).forEach(function (city) {
        if (counts[city.slug]) {
          out.push({ value: city.slug, label: city.name + ', ' + state.state, count: counts[city.slug] });
        }
      });
    });
    return out;
  }

  function tagOptions(data) {
    var counts = countTags(data.providers);
    return Object.keys(counts)
      .map(function (slug) {
        var tag = data.tagBySlug[slug];
        return { value: slug, label: tag ? tag.name : slug.replace(/-/g, ' '), count: counts[slug] };
      })
      .sort(function (a, b) { return b.count - a.count || a.label.localeCompare(b.label); });
  }

  /* Suggestions for the autocomplete: tags first (they are the way this
     directory is meant to be browsed), then categories, then cities. */
  function suggestions(data) {
    var list = [];
    tagOptions(data).forEach(function (t) {
      list.push({ kind: 'Tag', label: t.label, param: 'tags', value: t.value, count: t.count });
    });
    categoryOptions(data).forEach(function (c) {
      list.push({ kind: 'Category', label: c.label, param: 'category', value: c.value, count: c.count });
    });
    data.categories.forEach(function (c) {
      (c.subcategories || []).forEach(function (s) {
        list.push({ kind: 'Service', label: s.name, param: 'q', value: s.name });
      });
    });
    cityOptions(data).forEach(function (c) {
      list.push({ kind: 'City', label: c.label, param: 'city', value: c.value, count: c.count });
    });
    return list;
  }

  NS.categories = {
    countBy: countBy, countTags: countTags,
    categoryOptions: categoryOptions, cityOptions: cityOptions,
    tagOptions: tagOptions, suggestions: suggestions
  };
})(window);
