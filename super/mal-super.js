//
// MALSuper Custom Script v3.0 – SPA-Proof, Mobile-Proof, Toggle-Safe (by SUPERSTAR)
//

window.MALSuper = (function () {
    const SELECTOR = "code:not([super-embed-seen])";
    const storageKey = "color-preference";
    let toggle_state = false;
    let yPos = 0;

    // SPA/Observer State
    let observer = null;            // Toggle-Status-Observer
    let addToggleObserver = null;   // DOM-Change-Observer für neue Toggles

    // THEME MANAGEMENT
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.className = 'theme-' + theme;
        document.querySelector('#my-theme-toggle')?.setAttribute('aria-label', theme);
    }
    function getThemePref() {
        return localStorage.getItem(storageKey);
    }
    function initTheme() {
        let userPref = getThemePref();
        if (!userPref) {
            let sysTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            setTheme(sysTheme);
        } else {
            setTheme(userPref);
        }
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!getThemePref()) {
                let newTheme = e.matches ? 'dark' : 'light';
                setTheme(newTheme);
            }
        });
    }
    function theme_toggle(event) {
        if(event) event.preventDefault();
        let current = document.documentElement.getAttribute('data-theme') || 'dark';
        let newTheme = current === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem(storageKey, newTheme);
    }

    // MENU TOGGLE
    function menu_toggle(event) {
        if(event) event.preventDefault();
        toggle_state = !toggle_state;
        document.querySelector("#my-menu-toggle")?.setAttribute("aria-expanded", toggle_state);
        let state = toggle_state ? "menu-open" : "menu-closed";
        document.querySelector("#menu")?.setAttribute("aria-label", state);
        document.querySelector("#backdrop")?.setAttribute("visible", toggle_state);
    }

    // HOME BUTTON
    function gotoHome(event) {
        if(event) event.preventDefault();
        const ENTRY_KEY = 'homeEntryUrl';
        const DEFAULT_HOME = '/';
        const target = sessionStorage.getItem(ENTRY_KEY) || DEFAULT_HOME;
        window.location.href = target;
    }
    function setupHomeButton() {
        const ENTRY_KEY = 'homeEntryUrl';
        function setEntryUrl() {
            if (!sessionStorage.getItem(ENTRY_KEY)) {
                const path = window.location.pathname + window.location.search;
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
        setEntryUrl();
    }

    // EMBEDS & CODEBLOCKS
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

    // GSAP BACKGROUND FADE (mobile-proof, fadefix)
    function setupGSAPBgFade() {
        if (typeof gsap === "undefined") {
            console.warn("GSAP not found! Please include https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js");
            return;
        }
        document.querySelectorAll('.gsap-bg').forEach(function (bgDiv) {
            let ticking = false;
            function fadeBg() {
                if (!ticking) {
                    window.requestAnimationFrame(function () {
                        const scroll = window.scrollY;
                        const vh = window.innerHeight;
                        const opacity = 1 - Math.min(scroll / vh, 1);
                        gsap.to(bgDiv, {
                            opacity,
                            duration: 0.3,
                            overwrite: "auto",
                            ease: "power2.out"
                        });
                        ticking = false;
                    });
                    ticking = true;
                }
            }
            window.addEventListener("scroll", fadeBg, { passive: true });
            fadeBg();
        });
    }

    // toggleSAFE: Robuster Toggle-Observer mit Reset auf SPA
    function smartInitToggleObservers() {
        // Vorherige Observer disconnecten!
        if(observer) observer.disconnect();
        if(addToggleObserver) addToggleObserver.disconnect();

        let scrollTimeout = null;
        function scrollToY(y) {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                window.scrollTo({ top: y, left: 0, behavior: "smooth" });
                scrollTimeout = null;
            }, 60);
        }

        observer = new MutationObserver(function (mutationsList) {
            mutationsList.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const el = mutation.target;
                    const cls = el.className || "";
                    if (!el._lastToggleState) el._lastToggleState = '';
                    if (cls.includes("notion-toggle") && cls.includes("bg-blue")) {
                        if (cls.includes("open") && el._lastToggleState !== "open") {
                            yPos = window.scrollY;
                            el._lastToggleState = "open";
                        }
                        if (cls.includes("closed") && el._lastToggleState !== "closed") {
                            el._lastToggleState = "closed";
                            scrollToY(yPos);
                        }
                    }
                }
            });
        });

        addToggleObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (
                        node.nodeType === 1 &&
                        node.classList.contains('notion-toggle') &&
                        node.classList.contains('bg-blue')
                    ) {
                        observer.observe(node, { attributes: true, attributeFilter: ['class'] });
                    }
                });
            });
        });

        document.querySelectorAll('.notion-toggle.bg-blue').forEach((el) => {
            observer.observe(el, { attributes: true, attributeFilter: ['class'] });
        });
        const notionRoot = document.querySelector('.notion-root') || document.body;
        addToggleObserver.observe(notionRoot, { childList: true, subtree: true });
    }

    // SPA: Nach jedem RouteChange oder popstate alles re-initialisieren
    function registerSPARouteHooks() {
        window.addEventListener('popstate', function () {
            setTimeout(() => {
                window.MALSuper.init();
                // console.log("SPA popstate erkannt → MALSuper.init() ausgeführt");
            }, 150);
        });
        window.addEventListener('super:routeChange', function () {
            setTimeout(() => {
                window.MALSuper.init();
                // console.log("Super.so-RouteChange erkannt → MALSuper.init() ausgeführt");
            }, 150);
        });
    }

    // INIT (wird jetzt bei Start UND nach jedem SPA-Routenwechsel gefeuert)
    function init() {
        // console.log("MALSuper INIT fired!");
        initTheme();
        setupEmbeds();
        smartInitToggleObservers();
        setupGSAPBgFade();
        setupHomeButton();
        registerSPARouteHooks();
    }

    // PUBLIC API
    return {
        init,
        setupGSAPBgFade,
        menu_toggle,
        theme_toggle,
        gotoHome,
        setupHomeButton
    };

})();

// === SPA-proof: Initialisieren bei window.onload, danach bei jedem SPA-Route-Wechsel ===
window.addEventListener('load', function () {
    window.MALSuper.init();
});

// === Funktionen global machen für onclick im HTML (Hybrid-Pattern, garantiert mobile-kompatibel) ===
window.menu_toggle = function(e){ window.MALSuper.menu_toggle(e); };
window.theme_toggle = function(e){ window.MALSuper.theme_toggle(e); };
window.gotoHome = function(e){ window.MALSuper.gotoHome(e); };
