const SELECTOR = "code:not([super-embed-seen])";
const storageKey = "color-preference";
const mediaQueryList = window.matchMedia("(max-width: 546px)");
const theme = { value: "dark"}

// Setup on route change
function setupRouteChangeListenerForTooltips() {
  var routeChangeHandler = () => {
  // Ensure tooltips are initialized after route changes
  initializeTooltips();
  };
  
  if (typeof next !== 'undefined' && next.router && next.router.events) {
  // Old method using 'next'
  next.router.events.on('routeChangeComplete', routeChangeHandler);
  } else if (window.events) {
  // New method using 'window.events'
  window.events.on('routeChangeComplete', routeChangeHandler);
  } else {
  console.error("The platform doesn't support the required event listeners for route changes.");
  }
  }
  
  // Initialize and set up route change listener after the DOM is fully loaded
  if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
  console.log("Route change init custom scripts");
  setupEmbeds();
  reflectPreference();
  setupRouteChangeListenerForTooltips();
  });
  } else {
  // If the DOMContentLoaded event has already fired, run the function directly and set up the listener
  console.log("DOMloaded init custom scripts");
  setupEmbeds();
  reflectPreference();
  setupRouteChangeListenerForTooltips();
  }

// Get Mode Settings

const getColorPreference = () => {
  if (localStorage.getItem(storageKey)){
    console.log("mode", storageKey);
    return localStorage.getItem(storageKey)
  }else{
    console.log("mode return matchmedia");
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
}

const setPreference = () => {
  localStorage.setItem(storageKey, theme.value)
  reflectPreference()
}

const reflectPreference = () => {
  
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', ({matches:isDark}) => {
      theme.value = isDark ? 'dark' : 'light'
      setPreference()
    });
    
  document.firstElementChild
    .setAttribute('data-theme', theme.value)

  document
    .querySelector('#theme-toggle')
    ?.setAttribute('aria-label', theme.value)

  html.className = "theme-" + theme.value;

  console.log("ReflectPreferences", theme.value);
}

// submenu functions 

let toggle_state = false;
let device = "";

// set default states

document.querySelector("#menu")?.setAttribute("aria-label", state);
document.querySelector("#backdrop")?.setAttribute("visible", toggle_state);

const toggle_menu = () => {
  toggle_state = toggle_state === false ? true : false;

  document
    .querySelector("#my-menu-toggle")
    ?.setAttribute("aria-expanded", toggle_state);

  let state = toggle_state === false ? "menu-closed" : "menu-open";

  document.querySelector("#menu")?.setAttribute("aria-label", state);
  document.querySelector("#backdrop")?.setAttribute("visible", toggle_state);

  console.log("toggle menu", toggle_state);
}

const theme_toggle = () => {
    theme.value = theme.value === 'light'
    ? 'dark'
    : 'light';    

    html.className = "theme-" + theme.value;
    
    setPreference();
}

const mobile_check = (e) => {
  if(e.match){
    device = "MOBILE";
    console.log(e, device);
  }
}

/*-- init super-embad code navigation old version

function afterDOMLoaded() {
  console.log("DOMloaded");
  setupEmbeds();
  reflectPreference();
}

if (document.readyState === "loading") {  
  document.addEventListener("DOMContentLoaded", afterDOMLoaded);
} else {
  //afterDOMLoaded();
  console.log("Whats going on!");
}

*/



// init custom navigation
function initNavigation() {  

  const my_submenu = document.getElementById("my-menu-toggle");
    my_submenu.addEventListener("click", toggle_menu);

  const my_toggle = document.getElementById("my-theme-toggle");
    my_toggle.addEventListener("click", theme_toggle);

  console.log("init toggle ready");
}

//insert custome codeblocks

function clearBlock(el) {
  const node = el.parentElement.parentElement;
  node.innerHTML = "";
  return node;
}

function setupEmbeds() {
  
  console.log("setup custome code and navagiation");
  
  document.querySelectorAll(SELECTOR).forEach((node) => {
    node.setAttribute("super-embed-seen", 1);
    if (node.innerText.startsWith("super-embed:")) {
      const code = node.innerText.replace("super-embed:", "");
      const parentNode = clearBlock(node);
      parentNode.innerHTML = code;

      parentNode.querySelectorAll("script").forEach((script) => {
        if (!script.src && script.innerText) {
          eval(script.innerText);
          script.remove(); // Removing the original inline script after evaluation
        } else {
          const scr = document.createElement("script");
          Array.from(script.attributes).forEach((attr) => {
            scr.setAttribute(attr.name, attr.value);
          });
          script.parentNode.insertBefore(scr, script.nextSibling); // Insert new script right after the original one
          script.remove(); // Remove the original script
        }
      });
    }
  });
  initNavigation();
}

/* 
var observer = new MutationObserver(function (mutations) {
  if (document.querySelector(SELECTOR)) {
    setupEmbeds();
    initNavigation();
  }
});

observer.observe(document, {
  attributes: false,
  childList: true,
  characterData: false,
  subtree: true,
});
*/

/* respond on user-settings color scheme
window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', ({matches:isDark}) => {
    theme.value = isDark ? 'dark' : 'light'
    setPreference()
  });
*/

