/*
┌──────────────────────────────────────────────────┐
│                                                  │
│   SUPER.SO CUSTOM JS FRAMEWORK - VERSION 5.1     │
│   DATE: 2026-01-27 - Matze Lenz                  │
│                                                  │
└──────────────────────────────────────────────────┘
*/

window.MALSuper = (function () {
    const STATE = { ready: false};
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
		if(logging) console.log("SET THEME");
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.className = 'theme-' + theme;
        document.querySelector('#my-theme-toggle')?.setAttribute('aria-label', theme);
		sendThemeToIframes(document.documentElement.classList.contains(theme);
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
        // Set the OS preferences on autochange
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
        if(logging) console.log("Set User Preference = " + newTheme );
        setTheme(newTheme);
        localStorage.setItem(storageKey, newTheme);
    }
	
	function sendThemeToIframes(theme) {
    document.querySelectorAll('iframe').forEach(iframe => {
        iframe.contentWindow.postMessage({ type: 'theme', value: theme }, '*');
    	});
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
        console.log("EMBEDS - ready");
        STATE.ready = true;
        window.dispatchEvent(new Event("EmbedsReady"));
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
        // GSAP - play Video
        // Videos mit GSAP ScrollTrigger automatisch abspielen
        gsap.utils.toArray('.my-video-content').forEach((video) => {
          ScrollTrigger.create({
            trigger: video,
            start: 'top 80%',  // Startet wenn das Video 80% vom top im Viewport ist
            end: 'bottom 20%', // Endet wenn das Video 20% vom bottom im Viewport ist
            onEnter: () => video.play(),
            onEnterBack: () => video.play(),
            onLeave: () => video.pause(),
            onLeaveBack: () => video.pause(),
            // markers: true // Aktiviere das für Debugging
          });
        })
    }
  // Visits tracked by application
  function setApplicationTracker() {
    // 1. Person-ID aus URL holen (einmalig)
    const urlParams = new URLSearchParams(window.location.search);
    const urlPersonId = urlParams.get("m");
    console.log("get ID: " + urlPersonId)

  // 2. Person-ID aus localStorage holen (falls schon mal da)
  let personId = localStorage.getItem("personId");
        console.log("get ID from storage: " + personId)

  // 3. Wenn URL eine neue/andere Person-ID bringt → übernehmen & speichern
  if (urlPersonId != null) {
    personId = urlPersonId;
    localStorage.setItem("personId", personId);
    console.log("New ID to storage: " + personId)
  }else{
    console.log("NO ID exist")
  }

  // 4. Session-ID aus sessionStorage holen oder neu erzeugen
  let sessionId = sessionStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = (self.crypto?.randomUUID && self.crypto.randomUUID()) 
      || Math.random().toString(36).slice(2);
    sessionStorage.setItem("sessionId", sessionId);
  }

  const slug = window.location.pathname;

  // Wenn wir keine Person-ID haben, tracken wir optional nur anonym
  const sendEvent = (event, value = null) =>{
    console.log("Send webhook" + event + " . " + slug + " . " + value)
    fetch("https://hook.eu2.make.com/tvij7iok0uoa9etlh7v788259d5fy29z", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personId: personId || null, 
        sessionId,                 
        event,
        value,
        slug,
        timestamp: new Date().toISOString()
      })
    });
  };

  // Nur tracken, wenn mindestens sessionId da ist
  // (personId ist Pflicht ich tracke nur Bewerbung in go)
  
  if(personId){
      console.log("IF TRACKING : "+ personId + " : " + slug );
	  sendEvent("page_view");
	}

  // Scroll-Tracking
  let lastBucket = 0;
  window.addEventListener("scroll", () => {
    const scrollDepth = Math.round(
      (window.scrollY + window.innerHeight) / document.body.scrollHeight * 100
    );
    // Nur senden, wenn wir ein neues 25%-Bucket erreicht haben
    const bucket = Math.floor(scrollDepth / 25) * 25;
    if(personId){
    if (bucket > lastBucket && bucket <= 100) {
      lastBucket = bucket;
      sendEvent("scroll", bucket);
    }}
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
        setApplicationTracker();
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
        //registerSPARouteHooks(); Brauche ich das noch?
    }

    // PUBLIC API
    return {
        init,
        setupGSAPBgFade,
        menu_toggle,
        theme_toggle,
        gotoHome,
        setupHomeButton,
        setApplicationTracker
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

