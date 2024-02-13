const SELECTOR = "code:not([super-embed-seen])";

if (document.readyState === "loading") {
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

  const elm = document.getElementById("my-toggle");

  elm.addEventListener("click", (e) => {
    let mode = html.className === "theme-light" ? "theme-dark" : "theme-light";

    html.className = mode;

    localStorage["color-preference"] = mode.replace("theme-", "");
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
