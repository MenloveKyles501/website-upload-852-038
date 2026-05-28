(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  document.querySelectorAll('[data-filter-panel]').forEach(function (panelNode) {
    var container = panelNode.parentElement.querySelector('[data-card-container]');
    if (!container) {
      container = document.querySelector('[data-card-container]');
    }

    var cards = container ? Array.prototype.slice.call(container.querySelectorAll('.movie-card, .compact-card')) : [];
    var input = panelNode.querySelector('[data-local-search]');
    var selects = Array.prototype.slice.call(panelNode.querySelectorAll('[data-filter-field]'));
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    if (input && initial) {
      input.value = initial;
    }

    selects.forEach(function (select) {
      var field = select.getAttribute('data-filter-field');
      var values = [];
      cards.forEach(function (card) {
        var value = card.getAttribute('data-' + field) || '';
        if (value && values.indexOf(value) === -1) {
          values.push(value);
        }
      });
      values.sort().forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    });

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var activeFilters = {};

      selects.forEach(function (select) {
        if (select.value) {
          activeFilters[select.getAttribute('data-filter-field')] = select.value;
        }
      });

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var visible = !keyword || text.indexOf(keyword) !== -1;

        Object.keys(activeFilters).forEach(function (field) {
          if ((card.getAttribute('data-' + field) || '') !== activeFilters[field]) {
            visible = false;
          }
        });

        card.classList.toggle('hidden', !visible);
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', applyFilter);
    });

    applyFilter();
  });
})();
