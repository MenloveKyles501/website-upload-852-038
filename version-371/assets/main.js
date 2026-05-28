(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[char];
    });
  }

  function setupMobileNav() {
    var button = qs('[data-mobile-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) return;
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        var value = input ? input.value.trim() : '';
        if (!value) {
          event.preventDefault();
          if (input) input.focus();
          return;
        }
        event.preventDefault();
        window.location.href = 'search.html?q=' + encodeURIComponent(value);
      });
    });
  }

  function setupHero() {
    var carousel = qs('[data-hero-carousel]');
    if (!carousel) return;
    var slides = qsa('.hero-slide', carousel);
    var dots = qsa('[data-hero-dot]', carousel);
    var index = 0;
    var timer;

    function activate(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        activate(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        activate(i);
        play();
      });
    });

    carousel.addEventListener('mouseenter', function () {
      clearInterval(timer);
    });

    carousel.addEventListener('mouseleave', play);
    play();
  }

  function setupFilters() {
    qsa('[data-filter-panel]').forEach(function (panel) {
      var input = qs('[data-filter-input]', panel);
      var chips = qsa('[data-filter-chip]', panel);
      var grid = qs(panel.getAttribute('data-filter-panel'));
      if (!grid) return;
      var cards = qsa('.movie-card, .rank-item', grid);
      var active = 'all';

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        cards.forEach(function (card) {
          var haystack = [card.dataset.title, card.dataset.tags, card.dataset.year, card.dataset.region, card.dataset.type].join(' ').toLowerCase();
          var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var okType = active === 'all' || haystack.indexOf(active.toLowerCase()) !== -1;
          card.style.display = okKeyword && okType ? '' : 'none';
        });
      }

      if (input) input.addEventListener('input', apply);
      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          active = chip.getAttribute('data-filter-chip') || 'all';
          chips.forEach(function (item) {
            item.classList.toggle('active', item === chip);
          });
          apply();
        });
      });
    });
  }

  function setupSearchPage() {
    var root = qs('[data-search-results]');
    var input = qs('[data-search-page-input]');
    var button = qs('[data-search-page-button]');
    if (!root || !input || !window.SEARCH_DATA) return;

    function render(items) {
      root.innerHTML = items.map(function (item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
          return '<span class="tag-pill">' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<article class="movie-card">' +
          '<a class="poster-link" href="' + escapeHtml(item.href) + '">' +
          '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span class="poster-shade"></span><span class="year-badge">' + escapeHtml(item.year) + '</span>' +
          '<span class="hover-summary">' + escapeHtml(item.oneLine) + '</span></a>' +
          '<div class="card-body"><h3><a href="' + escapeHtml(item.href) + '">' + escapeHtml(item.title) + '</a></h3>' +
          '<p class="card-meta">' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type) + '</p>' +
          '<div class="tag-row">' + tags + '</div></div></article>';
      }).join('');
    }

    function search() {
      var q = input.value.trim().toLowerCase();
      if (!q) {
        render(window.SEARCH_DATA.slice(0, 24));
        return;
      }
      var terms = q.split(/\s+/).filter(Boolean);
      var results = window.SEARCH_DATA.filter(function (item) {
        var haystack = [item.title, item.region, item.type, item.year, item.genre, (item.tags || []).join(' '), item.oneLine].join(' ').toLowerCase();
        return terms.every(function (term) {
          return haystack.indexOf(term) !== -1;
        });
      }).slice(0, 120);
      render(results);
    }

    button.addEventListener('click', search);
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') search();
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    input.value = q;
    search();
  }

  window.initMoviePlayer = function (source) {
    var video = qs('[data-player-video]');
    var overlay = qs('[data-player-overlay]');
    if (!video || !source) return;
    var ready = false;
    var hls;

    function load(playAfterLoad) {
      if (ready) return;
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.load();
        if (playAfterLoad) video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (playAfterLoad) video.play().catch(function () {});
        });
        return;
      }
      video.src = source;
      video.load();
      if (playAfterLoad) video.play().catch(function () {});
    }

    function start() {
      if (overlay) overlay.classList.add('is-hidden');
      load(true);
      if (ready) video.play().catch(function () {});
    }

    if (overlay) overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!ready || video.paused) start();
    });
    video.addEventListener('play', function () {
      if (overlay) overlay.classList.add('is-hidden');
    });
    window.addEventListener('beforeunload', function () {
      if (hls) hls.destroy();
    });
  };

  setupMobileNav();
  setupSearchForms();
  setupHero();
  setupFilters();
  setupSearchPage();
})();
