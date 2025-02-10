//
// MAL super costome script v1.251
//
const SELECTOR = "code:not([super-embed-seen])";
const storageKey = "color-preference";
const userKey = "user-preference";
const mediaQueryList = window.matchMedia("(max-width: 546px)");
const theme = { value: "dark"};
//const userPref = { value: "false"};


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
  initToogleObservers();
  });
  } else {
  // If the DOMContentLoaded event has already fired, run the function directly and set up the listener
  console.log("DOMloaded init custom scripts");
  setupEmbeds();
  setupRouteChangeListenerForTooltips();
  }

// Get Dark / Light Mode Settings

const getColorPreference = () => {
  
  console.log("Funkt. getColorPreference", localStorage.getItem(userKey));

  if(localStorage.getItem(userKey) == 'false'){  
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme.value = 'dark';
      localStorage.setItem(storageKey, theme.value);
    }else{
      theme.value = 'light';
      localStorage.setItem(storageKey, theme.value);
    }
  }
  theme.value = localStorage.getItem(storageKey);
  console.log("Pref set on load", theme.value);

  setPreference('sys')
  
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ({matches:isDark}) => {
      theme.value = isDark ? 'dark' : 'light';
      console.log("Pref onChange Listener", theme.value);
      setPreference('sys')
    });
}

const setPreference = (val) => {
  console.log("Funkt. setPreference", val);
  
  localStorage.setItem(storageKey, theme.value);
  
  if(val === 'sys'){
    console.log("keep user preferences");    
  }else if(val === 'user'){
    localStorage.setItem(userKey, 'true'); 
  }else{
    localStorage.setItem(userKey, 'false'); 
  }
  reflectPreference()
}

const reflectPreference = () => {
      
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

const theme_toggle = () => {
    theme.value = theme.value === 'light'
    ? 'dark'
    : 'light';    

    html.className = "theme-" + theme.value;
    
    setPreference('user');
}

const menu_toggle = () => {
  toggle_state = toggle_state === false ? true : false;

  document
    .querySelector("#my-menu-toggle")
    ?.setAttribute("aria-expanded", toggle_state);

  let state = toggle_state === false ? "menu-closed" : "menu-open";

  document.querySelector("#menu")?.setAttribute("aria-label", state);
  document.querySelector("#backdrop")?.setAttribute("visible", toggle_state);

  console.log("toggle menu", toggle_state);
}

// Helper functions
const mobile_check = (e) => {
  if(e.match){
    device = "MOBILE";
    console.log(e, device);
  }
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
}

// m423 check when toggle ist offen oder zu
// when geschlossen scolle zu start position

//
let yPos = 0;
// Create a new MutationObserver instance
const observer = new MutationObserver(callback);
// Configure the MutationObserver options
const config = { attributes: true };
// Select the target element(s)
const targetElements = document.querySelectorAll(".notion-toggle");
// Define the callback function to be executed on mutations
function callback(mutationsList, observer) {
  // Handle mutations
  console.log("callback", mutationsList, observer );  
  mutationsList.forEach((mutation) => {    
    //toggleToggle(mutation.target.className);
    if(mutation.target.className == "notion-toggle open bg-blue"){
      yPos = window.scrollY;
    }else{
      window.scrollTo({
          top: yPos,
          left: 0,
          behavior: "smooth",
        });
      yPos = 0;
    }
  console.log(target + " - " + yPos);
  }) 
}
// Start observing the target elements
const initToogleObservers = () => {
  console.log("init observers");
  targetElements.forEach((element) => {
    observer.observe(element, config);
    console.log("Observe Element: ", element);
  });
};


  







