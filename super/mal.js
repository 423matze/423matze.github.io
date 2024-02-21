const SELECTOR = "code:not([super-embed-seen])";
const storageKey = "color-preference";
const mediaQueryList = window.matchMedia("(min-width: 546px)");

const getColorPreference = () => {
  if (localStorage.getItem(storageKey))
    return localStorage.getItem(storageKey)
  else
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
}

const setPreference = () => {
  localStorage.setItem(storageKey, theme.value)
  reflectPreference()
}

const reflectPreference = () => {
  document.firstElementChild
    .setAttribute('data-theme', theme.value)

  document
    .querySelector('#theme-toggle')
    ?.setAttribute('aria-label', theme.value)

  html.className = "theme-" + theme.value;
}

const theme = {
  value: getColorPreference();
}

/*-- submenu functions --*/

let toggle_state = false;
let device = "";

const toggle_menu = () => {
  toggle_state = toggle_state === false ? true : false;

  document
    .querySelector("#my-menu-toggle")
    ?.setAttribute("aria-expanded", toggle_state);

  let state = toggle_state === false ? "menu-closed" : "menu-open";

  document.querySelector("#menu")?.setAttribute("aria-label", state);

  console.log("toggle menu", toggle_state);
}

const mobile_check = (e) => {
  if(e.match){
    device = "MOBILE";
    console.log(device);
  }
}

/*-- init super-embad code navigation --*/

if (document.readyState === "loading") {
  reflectPreference()
  document.addEventListener("DOMContentLoaded", afterDOMLoaded);
} else {
  afterDOMLoaded();
}

function afterDOMLoaded() {
  setupEmbeds();
  //setTimeout(initNavigation(), 1000);
}

function initNavigation() {
  
  console.log("init toggle");

  const my_toggle = document.getElementById("theme-toggle");
    my_toggle.addEventListener("click", (e) => {
    theme.value = theme.value === 'light'
    ? 'dark'
    : 'light';
    
    /* -- pass selection to html class --- */
    //let mode = html.className === "theme-light" ? "theme-dark" : "theme-light";
    html.className = "theme-" + theme.value;
    //localStorage["color-preference"] = mode.replace("theme-", "");
    
    setPreference();

    /*-- add submenu listener --*/
    
    const my_submenu = document.getElementById("my-menu-toggle");
my_submenu.addEventListener("click", toggle_menu);
    
  });
}

function clearBlock(el) {
  const node = el.parentElement.parentElement;
  node.innerHTML = "";
  return node;
}

function setupEmbeds() {
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
}

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

window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', ({matches:isDark}) => {
    theme.value = isDark ? 'dark' : 'light'
    setPreference()
  });

mediaQueryList.addListener(screenTest);
