(function () {
  var menuButton = document.querySelector('.menu-button');
  var mobileNav = document.getElementById('mobileNav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  function startCarousel() {
    if (slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      if (timer) {
        window.clearInterval(timer);
      }
      showSlide(index);
      startCarousel();
    });
  });

  startCarousel();

  var filterInput = document.querySelector('[data-filter-input]');
  var filterCategory = document.querySelector('[data-filter-category]');
  var filterYear = document.querySelector('[data-filter-year]');
  var filterReset = document.querySelector('[data-filter-reset]');
  var filterCards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
  var filterCount = document.querySelector('[data-filter-count]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter() {
    if (!filterCards.length) {
      return;
    }

    var keyword = normalize(filterInput && filterInput.value);
    var category = normalize(filterCategory && filterCategory.value);
    var year = normalize(filterYear && filterYear.value);
    var visible = 0;

    filterCards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-year')
      ].join(' '));
      var cardCategory = normalize(card.getAttribute('data-category'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var matched = true;

      if (keyword && text.indexOf(keyword) === -1) {
        matched = false;
      }

      if (category && cardCategory !== category) {
        matched = false;
      }

      if (year && cardYear.indexOf(year) === -1) {
        matched = false;
      }

      card.classList.toggle('is-filter-hidden', !matched);

      if (matched) {
        visible += 1;
      }
    });

    if (filterCount) {
      filterCount.textContent = visible ? '找到 ' + visible + ' 部影片' : '没有匹配的影片';
    }
  }

  [filterInput, filterCategory, filterYear].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilter);
      control.addEventListener('change', applyFilter);
    }
  });

  if (filterReset) {
    filterReset.addEventListener('click', function () {
      if (filterInput) {
        filterInput.value = '';
      }
      if (filterCategory) {
        filterCategory.value = '';
      }
      if (filterYear) {
        filterYear.value = '';
      }
      applyFilter();
    });
  }

  applyFilter();
})();
