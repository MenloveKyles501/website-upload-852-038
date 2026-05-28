(function () {
  "use strict";

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(text) {
    return String(text || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function withBase(path) {
    var base = document.body.getAttribute("data-base") || "";
    return base + path.replace(/^\.\//, "");
  }

  function initHeroCarousel() {
    var slides = selectAll("[data-hero-slide]");
    var dots = selectAll("[data-hero-dot]");
    if (!slides.length) {
      return;
    }

    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, currentIndex) {
        slide.classList.toggle("is-active", currentIndex === index);
      });
      dots.forEach(function (dot, currentIndex) {
        dot.classList.toggle("is-active", currentIndex === index);
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

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });

    show(0);
    start();
  }

  function initGlobalSearch() {
    var inputs = selectAll(".global-search");
    var index = window.SITE_SEARCH_INDEX || [];

    inputs.forEach(function (input) {
      var wrapper = input.closest(".header-search") || input.closest(".wide-search") || input.parentElement;
      var results = wrapper ? wrapper.querySelector(".search-results") : null;
      if (!results) {
        return;
      }

      function close() {
        results.classList.remove("is-open");
      }

      function render(items) {
        if (!items.length) {
          results.innerHTML = '<div class="search-empty">没有找到匹配影片</div>';
          results.classList.add("is-open");
          return;
        }

        results.innerHTML = items.slice(0, 24).map(function (item) {
          var meta = [item.year, item.region, item.type].filter(Boolean).join(" · ");
          return [
            '<a class="search-result-item" href="' + withBase(item.url) + '">',
            '  <img src="' + withBase(item.cover) + '" alt="' + escapeHtml(item.title) + '">',
            '  <span>',
            '    <strong>' + escapeHtml(item.title) + '</strong>',
            '    <span>' + escapeHtml(meta) + '</span>',
            '  </span>',
            '</a>'
          ].join("");
        }).join("");
        results.classList.add("is-open");
      }

      input.addEventListener("input", function () {
        var keyword = normalize(input.value);
        if (keyword.length < 1) {
          close();
          return;
        }

        var matched = index.filter(function (item) {
          var haystack = normalize([
            item.title,
            item.year,
            item.region,
            item.type,
            item.genre,
            (item.tags || []).join(" "),
            item.summary
          ].join(" "));
          return haystack.indexOf(keyword) !== -1;
        });

        render(matched);
      });

      input.addEventListener("focus", function () {
        if (input.value.trim()) {
          input.dispatchEvent(new Event("input"));
        }
      });

      document.addEventListener("click", function (event) {
        if (!wrapper.contains(event.target)) {
          close();
        }
      });
    });
  }

  function initCardFilters() {
    selectAll(".card-search").forEach(function (input) {
      var targetSelector = input.getAttribute("data-target");
      var target = targetSelector ? document.querySelector(targetSelector) : null;
      if (!target) {
        return;
      }

      var cards = selectAll("[data-search]", target);
      input.addEventListener("input", function () {
        var keyword = normalize(input.value);
        cards.forEach(function (card) {
          var matched = normalize(card.getAttribute("data-search")).indexOf(keyword) !== -1;
          card.classList.toggle("is-filtered-out", keyword && !matched);
        });
      });
    });
  }

  function initPlayers() {
    selectAll(".player-shell").forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".play-trigger");
      if (!video || !button) {
        return;
      }

      function attachAndPlay() {
        var source = video.getAttribute("data-src");
        button.classList.add("is-hidden");

        if (!source) {
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (!video.__hlsInstance) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video.__hlsInstance = hls;
          }
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          video.src = source;
        }

        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            button.classList.remove("is-hidden");
          });
        }
      }

      button.addEventListener("click", attachAndPlay);
      video.addEventListener("play", function () {
        button.classList.add("is-hidden");
      });
      video.addEventListener("pause", function () {
        if (!video.currentTime) {
          button.classList.remove("is-hidden");
        }
      });
    });
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHeroCarousel();
    initGlobalSearch();
    initCardFilters();
    initPlayers();
  });
})();
