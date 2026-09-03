/* search.js — client-side search, tag filtering and autocomplete.
   No network calls beyond the site's own static JSON files. */
(function (global) {
  'use strict';

  var NS = (global.Nearsite = global.Nearsite || {});
  var esc = function (s) { return NS.providers.esc(s); };

  /* ---------- autocomplete ---------- */
  function initAutocomplete(input) {
    var listId = input.getAttribute('aria-controls');
    var list = document.getElementById(listId);
    if (!list) return;
    var items = [];
    var active = -1;

    function close() {
      list.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      active = -1;
    }

    function render(matches) {
      if (!matches.length) return close();
      list.innerHTML = matches.map(function (m, i) {
        return '<li role="option" aria-selected="false" id="ac-' + i + '">' +
          '<button type="button" data-param="' + esc(m.param) + '" data-value="' + esc(m.value) + '" data-label="' + esc(m.label) + '">' +
          '<span>' + esc(m.label) + '</span><span class="ac-kind">' + esc(m.kind) + '</span></button></li>';
      }).join('');
      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    }

    function match(term) {
      var q = NS.providers.normalize(term);
      if (q.length < 2) return [];
      return items.filter(function (item) {
        return NS.providers.normalize(item.label).indexOf(q) !== -1;
      }).slice(0, 7);
    }

    NS.providers.load().then(function (data) {
      items = NS.categories.suggestions(data);
    });

    input.addEventListener('input', function () { render(match(input.value)); });
    input.addEventListener('blur', function () { setTimeout(close, 150); });
    input.addEventListener('keydown', function (e) {
      var options = list.querySelectorAll('li');
      if (list.hidden || !options.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        active = e.key === 'ArrowDown'
          ? Math.min(active + 1, options.length - 1)
          : Math.max(active - 1, 0);
        for (var i = 0; i < options.length; i++) {
          var selected = i === active;
          options[i].setAttribute('aria-selected', selected ? 'true' : 'false');
          options[i].querySelector('button').setAttribute('aria-selected', selected ? 'true' : 'false');
        }
      } else if (e.key === 'Enter' && active > -1) {
        e.preventDefault();
        options[active].querySelector('button').click();
      } else if (e.key === 'Escape') {
        close();
      }
    });

    list.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      var param = btn.getAttribute('data-param');
      var value = btn.getAttribute('data-value');
      var form = input.form;
      if (param === 'q') {
        input.value = btn.getAttribute('data-label');
      } else {
        input.value = '';
        var hidden = form.querySelector('input[type="hidden"][name="' + param + '"]');
        if (!hidden) {
          hidden = document.createElement('input');
          hidden.type = 'hidden';
          hidden.name = param;
          form.appendChild(hidden);
        }
        hidden.value = value;
      }
      close();
      form.submit();
    });
  }

  /* ---------- results page ---------- */
  function readQuery() {
    var params = new URLSearchParams(global.location.search);
    var tags = (params.get('tags') || '').split(',').map(function (t) { return t.trim(); }).filter(Boolean);
    return {
      text: params.get('q') || '',
      category: params.get('category') || '',
      city: params.get('city') || '',
      state: params.get('state') || '',
      tags: tags
    };
  }

  function writeQuery(query) {
    var params = new URLSearchParams();
    if (query.text) params.set('q', query.text);
    if (query.category) params.set('category', query.category);
    if (query.city) params.set('city', query.city);
    if (query.tags.length) params.set('tags', query.tags.join(','));
    var qs = params.toString();
    global.history.replaceState({}, '', qs ? '?' + qs : global.location.pathname);
  }

  function initResults(root) {
    var portal = root.getAttribute('data-portal') || 'Nearsite';
    var resultsEl = root.querySelector('[data-results]');
    var countEl = root.querySelector('[data-results-count]');
    var filtersEl = root.querySelector('[data-filters]');
    var form = root.querySelector('[data-search-form]');
    var query = readQuery();
    var data;

    function renderFilters() {
      var categories = NS.categories.categoryOptions(data);
      var cities = NS.categories.cityOptions(data);
      var tags = NS.categories.tagOptions(data);

      filtersEl.innerHTML = '' +
        '<fieldset><legend>Tags</legend><div class="filter-options">' +
          tags.map(function (t) {
            return '<label><input type="checkbox" name="tag" value="' + esc(t.value) + '"' +
              (query.tags.indexOf(t.value) !== -1 ? ' checked' : '') + '> ' +
              esc(t.label) + ' <span class="tag-count">(' + t.count + ')</span></label>';
          }).join('') +
        '</div></fieldset>' +
        '<fieldset><legend>Category</legend><div class="field">' +
          '<label class="visually-hidden" for="filter-category">Category</label>' +
          '<select id="filter-category" name="category"><option value="">All categories</option>' +
            categories.map(function (c) {
              return '<option value="' + esc(c.value) + '"' + (query.category === c.value ? ' selected' : '') + '>' +
                esc(c.label) + ' (' + c.count + ')</option>';
            }).join('') +
          '</select></div></fieldset>' +
        '<fieldset><legend>City</legend><div class="field">' +
          '<label class="visually-hidden" for="filter-city">City</label>' +
          '<select id="filter-city" name="city"><option value="">All cities</option>' +
            cities.map(function (c) {
              return '<option value="' + esc(c.value) + '"' + (query.city === c.value ? ' selected' : '') + '>' +
                esc(c.label) + ' (' + c.count + ')</option>';
            }).join('') +
          '</select></div></fieldset>' +
        '<button type="button" class="btn btn-secondary btn-sm" data-clear>Clear filters</button>';
    }

    function renderResults() {
      var results = NS.providers.search(data, query);
      var label = results.length === 1 ? '1 business found' : results.length + ' businesses found';
      countEl.textContent = label;

      if (!results.length) {
        resultsEl.innerHTML = '<li><div class="empty-state">' +
          '<h2>No businesses match those filters yet</h2>' +
          '<p>Try removing a tag, widening the city, or browsing all categories. ' +
          'If you run a business that fits, you can be listed here.</p>' +
          '<p><a class="btn btn-primary" href="' + NS.providers.basePath() + '/for-business/">List your business</a></p>' +
          '</div></li>';
      } else {
        resultsEl.innerHTML = results.map(function (p) {
          return NS.providers.rowHtml(p, { portal: portal });
        }).join('');
      }

      NS.track('search', {
        query: query.text, category: query.category, city: query.city,
        tags: query.tags.join(','), results: results.length
      });
    }

    function update() {
      writeQuery(query);
      renderResults();
    }

    filtersEl.addEventListener('change', function (e) {
      var el = e.target;
      if (el.name === 'tag') {
        var i = query.tags.indexOf(el.value);
        if (el.checked && i === -1) query.tags.push(el.value);
        if (!el.checked && i !== -1) query.tags.splice(i, 1);
        NS.track('filter_tag', { tag: el.value, active: el.checked });
      } else if (el.name === 'category') {
        query.category = el.value;
        NS.track('filter_category', { category: el.value });
      } else if (el.name === 'city') {
        query.city = el.value;
        NS.track('filter_city', { city: el.value });
      }
      update();
    });

    filtersEl.addEventListener('click', function (e) {
      if (!e.target.closest('[data-clear]')) return;
      query = { text: query.text, category: '', city: '', state: '', tags: [] };
      renderFilters();
      update();
    });

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        query.text = form.querySelector('input[name="q"]').value;
        update();
      });
    }

    NS.providers.load().then(function (loaded) {
      data = loaded;
      renderFilters();
      renderResults();
    }).catch(function () {
      resultsEl.innerHTML = '<li><div class="empty-state"><h2>Search is unavailable</h2>' +
        '<p>The directory data could not be loaded. Reload the page, or browse by ' +
        '<a href="' + NS.providers.basePath() + '/categories/">category</a>.</p></div></li>';
    });
  }

  NS.search = { initAutocomplete: initAutocomplete, initResults: initResults, readQuery: readQuery };
})(window);
