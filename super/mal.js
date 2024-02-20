const SELECTOR = "code:not([super-embed-seen])";
const storageKey = "theme-preference";

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
}

const theme = {
  value: getColorPreference(),
}

if (document.readyState === "loading") {
  reflectPreference()
  document.addEventListener("DOMContentLoaded", afterDOMLoaded);
} else {
  afterDOMLoaded();
}

function afterDOMLoaded() {
  setupEmbeds();
  setTimeout(addToggle(), 1000);
}

function addToggle() {
  console.log("init toggle");

  document
    .getElementById("#theme-toggle")
    .addEventListener("click", (e) => {
    theme.value = theme.value === 'light'
    ? 'dark'
    : 'light'

    setPreference()
    /*  
    let mode = html.className === "theme-light" ? "theme-dark" : "theme-light";
    html.className = mode;
    localStorage["color-preference"] = mode.replace("theme-", "");
    */
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
    addToggle();
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
