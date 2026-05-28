(function () {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  if (slides.length) {
    var current = 0;
    var activate = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        activate(i);
      });
    });
    window.setInterval(function () {
      activate(current + 1);
    }, 5200);
  }

  var input = document.querySelector('[data-filter-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
  var status = document.querySelector('[data-filter-status]');
  if (input && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (initial) {
      input.value = initial;
    }
    var applyFilter = function (value) {
      var keyword = String(value || '').trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '')).toLowerCase();
        var match = !keyword || text.indexOf(keyword) !== -1;
        card.classList.toggle('is-hidden', !match);
        if (match) {
          visible += 1;
        }
      });
      if (status) {
        status.textContent = keyword ? '匹配影片 ' + visible : '精选片库';
      }
    };
    input.addEventListener('input', function () {
      applyFilter(input.value);
    });
    Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]')).forEach(function (chip) {
      chip.addEventListener('click', function () {
        input.value = chip.getAttribute('data-filter-chip') || '';
        applyFilter(input.value);
      });
    });
    applyFilter(input.value);
  }
})();
