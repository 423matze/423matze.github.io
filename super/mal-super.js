//
// MALSuper Custom Script v4.2 - desktop und mobile optimiert
//

window.MALSuper = (function () {
    const SELECTOR = "code:not([super-embed-seen])";
    const storageKey = "color-preference";
    let toggle_state = false;
    let yPos = 0;
    //
    const logging = true;

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
        if(logging) console.log("INIT THEME");
        
        let userPref = getThemePref();
        if(logging) console.log("GET Theme: " + userPref);
        
        if (!userPref) {            
            let sysTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            if(logging) console.log("Set SYS Theme = " + sysTheme );
            setTheme(sysTheme);
        } else {
            if(logging) console.log("Set USER Preference = " + userPref );
            setTheme(userPref);
        }
        // Set the OS preferences
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!getThemePref()) {
                let newTheme = e.matches ? 'dark' : 'light';
                if(logging) console.log("Set SYS Preference = " + newTheme );
                setTheme(newTheme);
            }
        });
    }
    function theme_toggle(event) {
        if(event) event.preventDefault();
        let current = document.documentElement.getAttribute('data-theme') || 'dark';
        let newTheme = current === 'dark' ? 'light' : 'dark';
        if(logging) console.log("Set User Preference = " + userPref );
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

    // ToggleSAFE: Robuster Toggle-Observer mit Reset auf SPA
    function smartInitToggleObservers() {
        // Vorherige Observer disconnected!
        console.log("smartInitToggleObservers: started");
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
            console.log("Mutation detected in notionRoot!");
            mutationsList.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const el = mutation.target;
                    const cls = el.className || "";
                    console.log("Observer set on new toggle:", el);
                    if (!el._lastToggleState) el._lastToggleState = '';
                    if (cls.includes("notion-toggle") && cls.includes("bg-blue")) {
                        if (cls.includes("open") && el._lastToggleState !== "open") {
                            yPos = window.scrollY;
                            el._lastToggleState = "open";
                            console.log("Toggle OPEN:", el, yPos);
                        }
                        if (cls.includes("closed") && el._lastToggleState !== "closed") {
                            el._lastToggleState = "closed";
                            scrollToY(yPos);
                            console.log("Toggle CLOSE:", el, yPos);
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
    
    // Toogle und GSAP Bg -> die nicht sauber auf Mobile initiert werden wegen Super hydration
    function delayedInits() {
        smartInitToggleObservers();
        setupGSAPBgFade();
    }

    // INIT (wird jetzt bei Start UND nach jedem SPA-Routenwechsel gefeuert)
    function init() {
        console.log("MALSuper INIT fired!");
        initTheme();
        setupEmbeds();
        setupHomeButton();
        // Tricki elements
        let runCount = 0;
        const maxRuns = 8; // ~2 Sekunden bei 250ms Intervall
        const interval = setInterval(() => { 
            delayedInits();
            runCount++;
            if (
                document.querySelectorAll('.notion-toggle.bg-blue').length > 0 ||
                document.querySelectorAll('.gsap-bg').length > 0 ||
                runCount >= maxRuns
            ) {
                clearInterval(interval);
            }
        }, 250);
        //registerSPARouteHooks();
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

// === Initialisieren bei window.onload ===
window.addEventListener('load', function () {
    console.log("LOAD → MALSuper.init()")
    window.MALSuper.init();
});

// === Super.so SPA: routeChangeComplete-Event (mit Polling, garantiert robust!) ===
function waitForSuperEventsAndBindInit() {
    if (window.events && window.events.on) {
        window.events.on('routeChangeComplete', function () {
            setTimeout(() => {
                console.log('Super.so: routeChangeComplete → MALSuper.init() ausgeführt!');
                window.MALSuper.init();
            }, 2000);
        });
        
    } else {
        console.log('Super.so: routeChangeComplete-Hook TRY AGAIN!');
        setTimeout(waitForSuperEventsAndBindInit, 423);
    }
}
waitForSuperEventsAndBindInit();

// === Funktionen global machen für onclick im HTML (Hybrid-Pattern) ===
window.menu_toggle = function(e){ window.MALSuper.menu_toggle(e); };
window.theme_toggle = function(e){ window.MALSuper.theme_toggle(e); };
window.gotoHome = function(e){ window.MALSuper.gotoHome(e); };

