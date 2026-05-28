(function () {
  function bind(root) {
    var video = root.querySelector('video');
    var overlay = root.querySelector('.player-overlay');
    var button = root.querySelector('.player-start');
    var source = root.getAttribute('data-video');
    var loaded = false;
    var hls = null;

    function load() {
      if (loaded || !source || !video) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          backBufferLength: 30
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      loaded = true;
    }

    function start(event) {
      if (event) {
        event.preventDefault();
      }

      load();
      root.classList.add('is-playing');
      video.controls = true;

      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!loaded) {
          start();
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  document.querySelectorAll('.player-shell').forEach(bind);
})();
