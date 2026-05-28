(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-nav");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupCarousel() {
    var hero = document.querySelector(".hero-carousel");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var input = panel.querySelector(".filter-input");
      var select = panel.querySelector(".select-filter");
      var targetSelector = panel.getAttribute("data-target") || ".movie-grid";
      var scope = document.querySelector(targetSelector);
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-row"));
      var container = scope.parentElement || scope;
      var empty = container.querySelector(".empty-state");

      function apply() {
        var term = normalize(input && input.value);
        var typeValue = normalize(select && select.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-search"));
          var okTerm = !term || haystack.indexOf(term) !== -1;
          var okType = !typeValue || haystack.indexOf(typeValue) !== -1;
          var show = okTerm && okType;
          card.style.display = show ? "" : "none";
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          container.classList.toggle("no-results", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (select) {
        select.addEventListener("change", apply);
      }
      apply();
    });
  }

  function setupSearchPage() {
    var page = document.querySelector("[data-search-page]");
    if (!page) {
      return;
    }
    var input = page.querySelector(".filter-input");
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    if (input && q) {
      input.value = q;
      input.dispatchEvent(new Event("input"));
    }
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".movie-player"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".player-button");
      var url = player.getAttribute("data-source") || (video && video.getAttribute("data-source"));
      var connected = false;
      if (!video || !button || !url) {
        return;
      }

      function connect() {
        if (connected) {
          return;
        }
        connected = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(url);
          hls.attachMedia(video);
          player.hls = hls;
        } else {
          video.src = url;
        }
      }

      function play() {
        connect();
        var task = video.play();
        if (task && task.catch) {
          task.catch(function () {
            player.classList.remove("is-playing");
          });
        }
      }

      button.addEventListener("click", function (event) {
        event.preventDefault();
        play();
      });
      player.addEventListener("click", function (event) {
        if (event.target === player || event.target.classList.contains("player-overlay")) {
          play();
        }
      });
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          player.classList.remove("is-playing");
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupCarousel();
    setupFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
