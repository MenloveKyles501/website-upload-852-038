(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupPlayer(container) {
    var video = container.querySelector("video[data-src]");
    var overlay = container.querySelector("[data-player-overlay]");
    var status = container.querySelector("[data-player-status]");
    var hlsInstance = null;
    var initialized = false;

    if (!video) {
      return;
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function initializeSource() {
      if (initialized) {
        return Promise.resolve();
      }

      initialized = true;
      var source = video.getAttribute("data-src");
      setStatus("正在加载播放源...");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        setStatus("播放源已就绪，点击视频可暂停或继续播放。");
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus("HLS 播放源已解析完成，点击视频可暂停或继续播放。");
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            setStatus("播放源加载遇到问题，请刷新页面或稍后重试。");
          }
        });
        return Promise.resolve();
      }

      video.src = source;
      setStatus("当前浏览器不支持 HLS.js，已尝试使用浏览器原生播放能力。");
      return Promise.resolve();
    }

    function play() {
      initializeSource().then(function () {
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            setStatus("浏览器阻止了自动播放，请再次点击播放按钮。");
          });
        }
      });
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      setStatus("正在播放。");
    });

    video.addEventListener("pause", function () {
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
      setStatus("已暂停，点击播放器继续观看。");
    });

    video.addEventListener("ended", function () {
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
      setStatus("播放结束，可重新点击播放。");
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(setupPlayer);
  });
})();
