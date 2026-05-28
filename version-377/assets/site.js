(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    if (slides.length <= 1) {
      return;
    }

    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupInlineFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }

    var input = panel.querySelector("[data-filter-input]");
    var region = panel.querySelector("[data-filter-region]");
    var type = panel.querySelector("[data-filter-type]");
    var year = panel.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var count = document.querySelector("[data-result-count]");

    function matches(card) {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var regionValue = region ? region.value : "";
      var typeValue = type ? type.value : "";
      var yearValue = year ? year.value : "";
      var text = card.getAttribute("data-search") || "";
      var cardRegion = card.getAttribute("data-region") || "";
      var cardType = card.getAttribute("data-type") || "";
      var cardYear = card.getAttribute("data-year") || "";

      return (!keyword || text.indexOf(keyword) !== -1) &&
        (!regionValue || cardRegion === regionValue) &&
        (!typeValue || cardType === typeValue) &&
        (!yearValue || cardYear === yearValue);
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matches(card);
        card.classList.toggle("hidden-by-filter", !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = "当前显示 " + visible + " 部影片";
      }
    }

    [input, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + '</span>';
    }).join("");

    return '<article class="movie-card">' +
      '<a class="movie-link" href="' + escapeHtml(movie.detail) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
      '<div class="poster-wrap">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<div class="poster-shade"></div>' +
      '<div class="play-mark" aria-hidden="true">▶</div>' +
      '</div>' +
      '<div class="movie-info">' +
      '<h3>' + escapeHtml(movie.title) + '</h3>' +
      '<p class="line-clamp-2">' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="meta-row"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</a>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearchPage() {
    var root = document.querySelector("[data-search-page]");
    if (!root || !window.MOVIES) {
      return;
    }

    var input = root.querySelector("[data-search-input]");
    var region = root.querySelector("[data-search-region]");
    var type = root.querySelector("[data-search-type]");
    var year = root.querySelector("[data-search-year]");
    var results = root.querySelector("[data-search-results]");
    var count = root.querySelector("[data-search-count]");

    function normalized(movie) {
      return [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" "), movie.oneLine]
        .join(" ")
        .toLowerCase();
    }

    function render() {
      var keyword = input.value.trim().toLowerCase();
      var regionValue = region.value;
      var typeValue = type.value;
      var yearValue = year.value;
      var matched = window.MOVIES.filter(function (movie) {
        return (!keyword || normalized(movie).indexOf(keyword) !== -1) &&
          (!regionValue || movie.region === regionValue) &&
          (!typeValue || movie.type === typeValue) &&
          (!yearValue || movie.year === yearValue);
      });

      count.textContent = "找到 " + matched.length + " 部影片";
      if (!matched.length) {
        results.innerHTML = '<div class="search-result-empty">没有找到匹配影片，请更换关键词或筛选条件。</div>';
        return;
      }

      results.innerHTML = matched.slice(0, 240).map(movieCard).join("");
      if (matched.length > 240) {
        results.insertAdjacentHTML("beforeend", '<div class="search-result-empty">已显示前 240 条结果，请继续输入关键词缩小范围。</div>');
      }
    }

    [input, region, type, year].forEach(function (control) {
      control.addEventListener("input", render);
      control.addEventListener("change", render);
    });

    render();
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupInlineFilters();
    setupSearchPage();
  });
})();
