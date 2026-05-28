(() => {
    const ready = (callback) => {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    };

    ready(() => {
        setupMobileMenu();
        setupImageFallbacks();
        setupHeroCarousel();
        setupFilters();
        hydrateSearchQuery();
    });

    function setupMobileMenu() {
        const button = document.querySelector("[data-menu-button]");
        const menu = document.querySelector("[data-mobile-nav]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", () => {
            menu.classList.toggle("is-open");
        });
    }

    function setupImageFallbacks() {
        document.querySelectorAll("img").forEach((image) => {
            image.addEventListener("error", () => {
                image.style.display = "none";
                const fallback = image.nextElementSibling;
                if (fallback && fallback.classList.contains("poster-fallback")) {
                    fallback.classList.add("is-visible");
                }
            }, { once: true });
        });
    }

    function setupHeroCarousel() {
        const carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
        const thumbs = Array.from(document.querySelectorAll("[data-hero-thumb]"));
        if (slides.length <= 1) {
            return;
        }
        let activeIndex = 0;
        let timer = window.setInterval(next, 5200);

        dots.forEach((dot) => {
            dot.addEventListener("click", () => {
                const index = Number(dot.dataset.heroDot || 0);
                activate(index);
                restart();
            });
        });

        thumbs.forEach((thumb) => {
            thumb.addEventListener("mouseenter", () => {
                const index = Number(thumb.dataset.heroThumb || 0);
                activate(index);
                restart();
            });
        });

        function next() {
            activate((activeIndex + 1) % slides.length);
        }

        function activate(index) {
            activeIndex = index;
            slides.forEach((slide, current) => {
                slide.classList.toggle("is-active", current === index);
            });
            dots.forEach((dot, current) => {
                dot.classList.toggle("is-active", current === index);
            });
            thumbs.forEach((thumb, current) => {
                thumb.classList.toggle("is-active", current === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(next, 5200);
        }
    }

    function setupFilters() {
        document.querySelectorAll("[data-filter-area]").forEach((panel) => {
            const input = panel.querySelector("[data-filter-input]");
            const sort = panel.querySelector("[data-filter-sort]");
            const count = panel.querySelector("[data-filter-count]");
            const grid = panel.parentElement.querySelector("[data-filter-grid]");
            const empty = panel.parentElement.querySelector("[data-empty-state]");
            const viewButtons = panel.querySelectorAll("[data-view]");
            if (!grid) {
                return;
            }
            const cards = Array.from(grid.querySelectorAll("[data-card]"));

            const run = () => {
                const query = (input?.value || "").trim().toLowerCase();
                let visibleCount = 0;
                cards.forEach((card) => {
                    const haystack = [
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.genre,
                        card.dataset.tags,
                    ].join(" ").toLowerCase();
                    const matched = !query || haystack.includes(query);
                    card.hidden = !matched;
                    if (matched) {
                        visibleCount += 1;
                    }
                });
                if (count) {
                    count.textContent = String(visibleCount);
                }
                if (empty) {
                    empty.hidden = visibleCount !== 0;
                }
                applySort(grid, cards, sort?.value || "default");
            };

            input?.addEventListener("input", run);
            sort?.addEventListener("change", run);
            viewButtons.forEach((button) => {
                button.addEventListener("click", () => {
                    viewButtons.forEach((item) => item.classList.remove("is-active"));
                    button.classList.add("is-active");
                    grid.classList.toggle("is-list", button.dataset.view === "list");
                });
            });
            run();
        });
    }

    function applySort(grid, cards, mode) {
        const sorted = [...cards];
        sorted.sort((left, right) => {
            if (mode === "year-desc") {
                return numberValue(right.dataset.year) - numberValue(left.dataset.year);
            }
            if (mode === "year-asc") {
                return numberValue(left.dataset.year) - numberValue(right.dataset.year);
            }
            if (mode === "title-asc") {
                return (left.dataset.title || "").localeCompare(right.dataset.title || "", "zh-Hans-CN");
            }
            return 0;
        });
        sorted.forEach((card) => grid.appendChild(card));
    }

    function numberValue(value) {
        const parsed = Number.parseInt(value || "0", 10);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    function hydrateSearchQuery() {
        const params = new URLSearchParams(window.location.search);
        const query = params.get("q");
        if (!query) {
            return;
        }
        const input = document.querySelector("[data-filter-input]");
        if (!input) {
            return;
        }
        input.value = query;
        input.dispatchEvent(new Event("input", { bubbles: true }));
    }
})();
