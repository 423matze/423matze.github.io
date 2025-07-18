//
// MALSuper Custom Script v2.23 – FINAL SMART (by SUPERSTAR)
// Robust Button-Binding (bindUIEvents), GSAP, Theme, Home-Button, Notion-Toggle Observer
// Added scrollToY for Notion-Toggle, improved embed handling, and theme management

window.MALSuper = (function () {
    const SELECTOR = "code:not([super-embed-seen])";
    const storageKey = "color-preference";
    let toggle_state = false;

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
        if (event) event.preventDefault();
        let current = document.documentElement.getAttribute('data-theme') || 'dark';
        let newTheme = current === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem(storageKey, newTheme);
    }

    // MENU TOGGLE
    function menu_toggle(event) {
        if (event) event.preventDefault();
        toggle_state = !toggle_state;
        document.querySelector("#my-menu-toggle")?.setAttribute("aria-expanded", toggle_state);
        let state = toggle_state ? "menu-open" : "menu-closed";
        document.querySelector("#menu")?.setAttribute("aria-label", state);
        document.querySelector("#backdrop")?.setAttribute("visible", toggle_state);
    }

    // HOME BUTTON
    function gotoHome(event) {
        if (event) event.preventDefault();
        const ENTRY_KEY = 'homeEntryUrl';
        const DEFAULT_HOME = '/';
        const target = sessionStorage.getItem(ENTRY_KEY) || DEFAULT_HOME;
        window.location.href = target;
    }
    function setupHomeButton() {
        const ENTRY_KEY = 'homeEntryUrl';
        const DEFAULT_HOME = '/';
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
        bindUIEvents();
    }

    // NOTION-TOGGLE OBSERVER (SMART!)
    // Debounce-Delay, um Rendering nach Toggle zu berücksichtigen
    let yPos = 0;
    let scrollTimeout = null;

    function scrollToY(y) {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            window.scrollTo({ top: y, left: 0, behavior: "smooth" });
            scrollTimeout = null;
            console.log("Toggle closed → zu yPos scrollen:", y);
        }, 60); // 60ms Delay: testen, ggf. anpassen!
    }

    // Smarter Observer: prüft Attributänderung NUR für .class
    const observer = new MutationObserver(function (mutationsList) {
        mutationsList.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const el = mutation.target;
                const cls = el.className || "";
                // Interner Toggle-State tracken, um mehrfaches Scrollen zu verhindern
                if (!el._lastToggleState) el._lastToggleState = '';
                if (cls.includes("notion-toggle") && cls.includes("bg-blue")) {
                    if (cls.includes("open") && el._lastToggleState !== "open") {
                        yPos = window.scrollY;
                        el._lastToggleState = "open";
                        console.log("Toggle open → yPos gespeichert:", yPos);
                    }
                    if (cls.includes("closed") && el._lastToggleState !== "closed") {
                        el._lastToggleState = "closed";
                        scrollToY(yPos);
                    }
                }
            }
        });
    });

    // Toggle-Observer auf alle bestehenden und künftigen .notion-toggle.bg-blue setzen
    function smartInitToggleObservers() {
        console.log("smartInitToggleObservers: started");
        const notionRoot = document.querySelector('.notion-root') || document.body;
        const addToggleObserver = new MutationObserver((mutations) => {
            console.log("Mutation detected in notionRoot!");
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (
                        node.nodeType === 1 &&
                        node.classList.contains('notion-toggle') &&
                        node.classList.contains('bg-blue')
                    ) {
                        console.log("Observer set on new toggle:", node);
                        observer.observe(node, { attributes: true, attributeFilter: ['class'] });
                    }
                });
            });
        });
        document.querySelectorAll('.notion-toggle.bg-blue').forEach((el) => {
            console.log("Observer set on existing toggle:", el);
            observer.observe(el, { attributes: true, attributeFilter: ['class'] });
        });
        addToggleObserver.observe(notionRoot, { childList: true, subtree: true });
        console.log("addToggleObserver activated on notionRoot/body");
    }


    // GSAP BACKGROUND FADE ANIMATION
    function setupGSAPBgFade() {
        if (typeof gsap === "undefined") {
            console.warn("GSAP not found! Please include https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js");
            return;
        }
        document.querySelectorAll('.gsap-bg').forEach(function (bgDiv) {
            let ticking = false;
            function forceRepaint(element) {
                // Optional: Safari-Hack, nur aktivieren wenn nötig!
                element.style.display = 'none';
                element.offsetHeight; // Trigger reflow
                element.style.display = '';
            }
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
                            ease: "power2.out",
                            onUpdate: function () {
                                // Optional: Nur für Safari/iOS aktivieren wenn nötig!
                                // forceRepaint(bgDiv);
                            }
                        });
                        ticking = false;
                    });
                    ticking = true;
                }
            }
            window.addEventListener("scroll", fadeBg, { passive: true });
            fadeBg();
            console.log("GSAP background fade setup for:", bgDiv);
        });
    }
    // SMARTESTE LÖSUNG: DIREKTES BINDEN an alle Buttons (nach jedem DOM-Change!)
    function bindUIEvents() {
        // Menü-Button
        document.querySelectorAll('#my-menu-toggle').forEach(btn => {
            btn.removeEventListener('click', menu_toggle);
            btn.removeEventListener('touchend', menu_toggle);
            btn.addEventListener('click', menu_toggle);
            btn.addEventListener('touchend', menu_toggle);
        });
        // Theme-Button
        document.querySelectorAll('#my-theme-toggle').forEach(btn => {
            btn.removeEventListener('click', theme_toggle);
            btn.removeEventListener('touchend', theme_toggle);
            btn.addEventListener('click', theme_toggle);
            btn.addEventListener('touchend', theme_toggle);
        });
        // Home-Button
        document.querySelectorAll('[data-js="home-button"]').forEach(btn => {
            btn.removeEventListener('click', gotoHome);
            btn.removeEventListener('touchend', gotoHome);
            btn.addEventListener('click', gotoHome);
            btn.addEventListener('touchend', gotoHome);
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
            bindUIEvents();
            console.log("MALSuper initialized successfully.");
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
        setupHomeButton,
        smartInitToggleObservers,
        bindUIEvents
    };

})();
// === Funktionen global machen für onclick im HTML ===
window.menu_toggle = function (e) { window.MALSuper.menu_toggle(e); };
window.theme_toggle = function (e) { window.MALSuper.theme_toggle(e); };
window.gotoHome = function (e) { window.MALSuper.gotoHome(e); };

// === AUTO-INIT bei window.onload (maximale Kompatibilität) ===
window.addEventListener('load', function () {
    window.MALSuper.init();
});
