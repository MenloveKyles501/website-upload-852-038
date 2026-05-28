(function () {
  var header = document.querySelector('[data-header]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var backTop = document.querySelector('[data-back-top]');

  function setHeaderState() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 18);
    if (backTop) {
      backTop.classList.toggle('is-visible', window.scrollY > 420);
    }
  }

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  if (menuToggle && mobilePanel && header) {
    menuToggle.addEventListener('click', function () {
      var opened = mobilePanel.classList.toggle('is-open');
      header.classList.toggle('is-open', opened);
    });
  }

  if (backTop) {
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.querySelectorAll('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      window.location.href = './search.html' + (value ? '?q=' + encodeURIComponent(value) : '');
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer;

    function showSlide(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startHero();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    startHero();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function filterCards() {
    var list = document.querySelector('[data-card-list]');
    if (!list) {
      return;
    }
    var activeChip = document.querySelector('[data-filter-chip].is-active');
    var chipValue = activeChip ? normalize(activeChip.getAttribute('data-filter-chip')) : '';
    var input = document.querySelector('[data-local-search] input');
    var query = normalize(input ? input.value : '');
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search'));
      var matchQuery = !query || haystack.indexOf(query) !== -1;
      var matchChip = !chipValue || haystack.indexOf(chipValue) !== -1;
      card.classList.toggle('is-filter-hidden', !(matchQuery && matchChip));
    });
  }

  var localSearch = document.querySelector('[data-local-search]');
  if (localSearch) {
    var localInput = localSearch.querySelector('input');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && localInput) {
      localInput.value = q;
    }
    localSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      filterCards();
    });
    if (localInput) {
      localInput.addEventListener('input', filterCards);
    }
  }

  document.querySelectorAll('[data-filter-chip]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      document.querySelectorAll('[data-filter-chip]').forEach(function (item) {
        item.classList.remove('is-active');
      });
      chip.classList.add('is-active');
      filterCards();
    });
  });

  if (document.querySelector('[data-card-list]')) {
    filterCards();
  }

  function attachStream(player) {
    var video = player.querySelector('video');
    var src = player.getAttribute('data-stream');
    if (!video || !src || video.getAttribute('data-ready') === '1') {
      return video;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      player._hls = hls;
    } else {
      video.src = src;
    }

    video.setAttribute('data-ready', '1');
    return video;
  }

  document.querySelectorAll('.movie-player').forEach(function (player) {
    var overlay = player.querySelector('.player-overlay');
    var video = player.querySelector('video');

    function playVideo() {
      var activeVideo = attachStream(player);
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      if (activeVideo) {
        activeVideo.controls = true;
        var attempt = activeVideo.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {});
        }
      }
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.getAttribute('data-ready') !== '1') {
          playVideo();
        }
      });
    }
  });
})();
