function initMoviePlayer(source) {
  var video = document.getElementById('movie-video');
  var overlay = document.getElementById('play-overlay');
  var button = document.getElementById('play-button');
  var hlsInstance = null;
  var started = false;

  if (!video || !source) {
    return;
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  }

  function attachStream() {
    if (started) {
      return;
    }
    started = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function start() {
    hideOverlay();
    attachStream();
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', start);
  }
  if (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      start();
    });
  }
  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener('play', hideOverlay);
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
