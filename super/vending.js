// rive prototype: 0.1.2
// vending machine prototype

  console.log("Init Rive");
  
  const r = new rive.Rive({
    src: "https://423matze.github.io/super/ttrays-003.riv", // Ensure this file name is correct
    canvas: document.getElementById("rivecanvas"),
    autoplay: true,
    autoBind: true,
    artboard: "vending",
    stateMachines: "tray machine",

    onLoad: () => {
      r.resizeDrawingSurfaceToCanvas();
    },
    onLoadError: (e) => {
      console.error("Rive error:", e);
    },
  });

