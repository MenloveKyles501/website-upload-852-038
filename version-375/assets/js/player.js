(() => {
    const HLS_CDN = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
    let hlsPromise = null;

    const ready = (callback) => {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    };

    ready(() => {
        document.querySelectorAll("[data-player]").forEach((player) => {
            const video = player.querySelector(".js-hls-player");
            const button = player.querySelector("[data-play-button]");
            const message = player.querySelector("[data-player-message]");
            if (!video || !button) {
                return;
            }
            button.addEventListener("click", async () => {
                button.disabled = true;
                showMessage(message, "正在加载播放源…");
                try {
                    await prepareVideo(video);
                    await video.play();
                    button.classList.add("is-hidden");
                    hideMessage(message);
                } catch (error) {
                    button.disabled = false;
                    showMessage(message, "播放源加载失败，请检查网络或换用支持 HLS 的浏览器。", true);
                    console.error(error);
                }
            });
            video.addEventListener("play", () => {
                button.classList.add("is-hidden");
            });
        });
    });

    async function prepareVideo(video) {
        if (video.dataset.ready === "true") {
            return;
        }
        const source = video.dataset.src;
        if (!source) {
            throw new Error("Missing HLS source");
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.dataset.ready = "true";
            return;
        }
        const Hls = await loadHls();
        if (!Hls || !Hls.isSupported()) {
            throw new Error("HLS is not supported in this browser");
        }
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video.dataset.ready = "true";
        video._hlsInstance = hls;
    }

    function loadHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (hlsPromise) {
            return hlsPromise;
        }
        hlsPromise = new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = HLS_CDN;
            script.async = true;
            script.onload = () => resolve(window.Hls);
            script.onerror = () => reject(new Error("Unable to load hls.js"));
            document.head.appendChild(script);
        });
        return hlsPromise;
    }

    function showMessage(message, text, isError = false) {
        if (!message) {
            return;
        }
        message.textContent = text;
        message.hidden = false;
        message.dataset.error = isError ? "true" : "false";
    }

    function hideMessage(message) {
        if (!message) {
            return;
        }
        message.hidden = true;
    }
})();
