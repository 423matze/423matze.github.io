//
// MALSuper Custom Script v2.14 – HYBRID (by SUPERSTAR)
// Kombiniert globale Methoden + klassische onclick-Attribute für 100% Super.so/iOS-Kompatibilität
//

window.MALSuper = (function () {
    const SELECTOR = "code:not([super-embed-seen])";
    const storageKey = "color-preference";
    let toggle_state = false;
    let yPos = 0;

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

    // NOTION-TOGGLE OBSERVER (SMART!)
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
    function smartInitToggleObservers() {
        const notionRoot = document.querySelector('.notion-root') || document.body;
        const addToggleObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (
                        node.nodeType === 1 &&
                        node.classList.contains('notion-toggle') &&
                        node.classList.contains('bg-blue')
                    ) {
                        observer.observe(node, { attributes: true });
                    }
                });
            });
        });
        document.querySelectorAll('.notion-toggle.bg-blue').forEach((el) => {
            observer.observe(el, { attributes: true });
        });
        addToggleObserver.observe(notionRoot, { childList: true, subtree: true });
    }

    // GSAP BACKGROUND FADE ANIMATION
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

    // INIT
    function init() {
        try {
            initTheme();
            setupEmbeds();
            smartInitToggleObservers();
            setupGSAPBgFade();
            setupHomeButton();
        } catch (e) {
            console.error('Error initializing MALSuper:', e);
        }
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

// === AUTO-INIT bei window.onload (maximale Kompatibilität) ===
window.addEventListener('load', function () {
    window.MALSuper.init();
});

// === Funktionen global machen für onclick im HTML ===
window.menu_toggle = function(e){ window.MALSuper.menu_toggle(e); };
window.theme_toggle = function(e){ window.MALSuper.theme_toggle(e); };
window.gotoHome = function(e){ window.MALSuper.gotoHome(e); };
