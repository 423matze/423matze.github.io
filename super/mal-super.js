//
// MALSuper Custom Script v2.2 – FINAL (by SUPERSTAR)
// Alles in EINEM Namespace, ready für Super.so/Notion, GSAP & Co.
// Add event listeners, theme_toggle, menu_togggle

window.MALSuper = (function () {
    // === PRIVATE VARIABLEN & FUNKTIONEN ===

    const SELECTOR = "code:not([super-embed-seen])";
    const storageKey = "color-preference";
    const userKey = "user-preference";
    let toggle_state = false;
    let device = "";

    // === DARK/LIGHT MODE ===
    const theme = { value: "dark" };

    function getColorPreference() {
        try {
            if (localStorage.getItem(userKey) === 'false') {
                theme.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                localStorage.setItem(storageKey, theme.value);
            }
            if (localStorage.getItem(userKey) == null) {
                theme.value = 'dark';
                localStorage.setItem(storageKey, theme.value);
            }
            theme.value = localStorage.getItem(storageKey);
            setPreference('sys');

            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({ matches: isDark }) => {
                theme.value = isDark ? 'dark' : 'light';
                setPreference('sys');
            });
        } catch (e) {
            console.error('Error in getColorPreference:', e);
        }
    }

    function setPreference(val) {
        try {
            localStorage.setItem(storageKey, theme.value);
            if (val === 'user') localStorage.setItem(userKey, 'true');
            else if (val !== 'sys') localStorage.setItem(userKey, 'false');
            reflectPreference();
        } catch (e) {
            console.error('Error in setPreference:', e);
        }
    }

    function reflectPreference() {
        try {
            document.firstElementChild?.setAttribute('data-theme', theme.value);
            document.querySelector('#theme-toggle')?.setAttribute('aria-label', theme.value);
            document.documentElement.className = "theme-" + theme.value;
        } catch (e) {
            console.error('Error in reflectPreference:', e);
        }
    }

    function theme_toggle() {
        theme.value = theme.value === 'light' ? 'dark' : 'light';
        setPreference('user');
    }

    // === MENU & MOBILE ===

    function menu_toggle() {
        toggle_state = !toggle_state;
        document.querySelector("#my-menu-toggle")?.setAttribute("aria-expanded", toggle_state);
        let state = toggle_state ? "menu-open" : "menu-closed";
        document.querySelector("#menu")?.setAttribute("aria-label", state);
        document.querySelector("#backdrop")?.setAttribute("visible", toggle_state);
    }

    // === EMBEDS & CODEBLOCKS ===

    function clearBlock(el) {
        const node = el.parentElement?.parentElement;
        if (node) node.innerHTML = "";
        return node;
    }

    function setupEmbeds() {
        document.querySelectorAll(SELECTOR).forEach((node) => {
            node.setAttribute("super-embed-seen", 1);
            if (node.innerText.startsWith("super-embed:")) {
                const code = node.innerText.replace("super-embed:", "");
                const parentNode = clearBlock(node);
                if (parentNode) {
                    parentNode.innerHTML = code;
                    parentNode.querySelectorAll("script").forEach((script) => {
                        if (!script.src && script.innerText) {
                            try {
                                eval(script.innerText);
                            } catch (e) { console.error("Eval error in embed:", e); }
                            script.remove();
                        } else {
                            const scr = document.createElement("script");
                            Array.from(script.attributes).forEach(attr => {
                                scr.setAttribute(attr.name, attr.value);
                            });
                            script.parentNode.insertBefore(scr, script.nextSibling);
                            script.remove();
                        }
                    });
                }
            }
        });
    }

    // === NOTION-TOGGLE OBSERVER ===
    let yPos = 0;
    const observer = new MutationObserver(function (mutationsList) {
        mutationsList.forEach((mutation) => {
            const cls = mutation.target.className || "";
            if (cls.includes("notion-toggle") && cls.includes("bg-blue")) {
                if (cls.includes("open")) {
                    yPos = window.scrollY;
                } else if (cls.includes("closed")) {
                    window.scrollTo({ top: yPos, left: 0, behavior: "smooth" });
                }
            }
        });
    });

    function initToggleObservers() {
        document.querySelectorAll(".notion-toggle.bg-blue").forEach((element) => {
            observer.observe(element, { attributes: true });
        });
    }

    // === GSAP BACKGROUND FADE ANIMATION ===
    function setupGSAPBgFade() {
        if (typeof gsap === "undefined") {
            console.warn("GSAP not found! Please include https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js");
            return;
        }
        document.querySelectorAll('.gsap-bg').forEach(function (bgDiv) {
            function fadeBg() {
                const scroll = window.scrollY;
                const vh = window.innerHeight;
                const opacity = 1 - Math.min(scroll / vh, 1);
                gsap.to(bgDiv, { opacity, duration: 0.4, overwrite: "auto", ease: "power2.out" });
            }
            window.addEventListener("scroll", fadeBg);
            fadeBg();
        });
    }

    // === HOME BUTTON LOGIK ===
    function setupHomeButton() {
        const ENTRY_KEY = 'homeEntryUrl';
        const DEFAULT_HOME = '/';

        function setEntryUrl() {
            if (!sessionStorage.getItem(ENTRY_KEY)) {
                const path = window.location.pathname + window.location.search;
                // Home & spezielle Seiten ignorieren!
                if (
                    path !== "/" &&
                    path !== "/about-matze-lenz" &&
                    path !== "/think" &&
                    path !== "/projects"
                ) {
                    sessionStorage.setItem(ENTRY_KEY, path);
                }
            }
        }

        function gotoHome(event) {
            event.preventDefault();
            const target = sessionStorage.getItem(ENTRY_KEY) || DEFAULT_HOME;
            window.location.href = target;
        }

        setEntryUrl();
        const btn = document.querySelector('[data-js="home-button"]');
        if (btn) {
            btn.addEventListener('click', gotoHome);
        }
    }

    // === INIT ===
    function init() {
        try {
            getColorPreference();
            setupEmbeds();
            setTimeout(() => { initToggleObservers(); }, 1500);
            setupGSAPBgFade();
            setupHomeButton();
            // === Menü- und Theme-Toggle über JS verbinden ===
            document.querySelector('#my-menu-toggle')?.addEventListener('click', menu_toggle);
            document.querySelector('#my-theme-toggle')?.addEventListener('click', theme_toggle);

        } catch (e) {
            console.error('Error initializing MALSuper:', e);
        }
    }

    // === PUBLIC API ===
    return {
        init,
        setupGSAPBgFade,
        menu_toggle,
        theme_toggle,
        setupHomeButton
        // ...hier kannst du weitere Methoden publizieren!
    };

})();

// === AUTO-INIT bei DOM-Ready ===
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.MALSuper.init);
} else {
    window.MALSuper.init();
}
