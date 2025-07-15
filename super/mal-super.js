//
// MALSuper Custom Script v2.0 – Refactored by SUPERSTAR
//
window.MALSuper = (function() {
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

      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({matches:isDark}) => {
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
      if(val === 'user') localStorage.setItem(userKey, 'true');
      else if(val !== 'sys') localStorage.setItem(userKey, 'false');
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

  function mobile_check(e) {
    if(e && e.matches) {
      device = "MOBILE";
    }
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

  // === NOTION-TOGGLE OBSERVER (refactored) ===
  let yPos = 0;
  const observer = new MutationObserver(function(mutationsList) {
    mutationsList.forEach((mutation) => {
      const cls = mutation.target.className || "";
      if (cls.includes("notion-toggle") && cls.includes("bg-blue")) {
        if (cls.includes("open")) {
          yPos = window.scrollY;
        } else if (cls.includes("closed")) {
          window.scrollTo({top: yPos, left: 0, behavior: "smooth"});
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
    document.querySelectorAll('.gsap-bg').forEach(function(bgDiv) {
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

  // === INIT ===
  function init() {
    try {
      getColorPreference();
      setupEmbeds();
      setTimeout(() => { initToggleObservers(); }, 1500);
      setupGSAPBgFade();
      // Optionale: Mehr Event Listener oder Init-Calls
    } catch (e) {
      console.error('Error initializing MALSuper:', e);
    }
  }

  // === PUBLIC API ===
  return {
    init,
    setupGSAPBgFade,
    menu_toggle,
    theme_toggle
    // Weitere Methoden nach Bedarf exportieren!
  };

})();

// Auto-Init bei DOM-Ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.MALSuper.init);
} else {
  window.MALSuper.init();
}
