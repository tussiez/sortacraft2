import * as Alerts from "./modules/alerts.js";

const { navigator, document } = globalThis;

async function ready() {
  // Not really needed since repl now redirects to https! :D
  // if(location.protocol === "https"){
  //   Alerts.alert("You are using 'http'. To get the full experience, you need to use the 'https' version. Click <a href='https://" + location.host + "'>here</a> to redirect to the secure version.");
  // }
  if ("serviceWorker" in navigator) {
    try {
      // navigator.serviceWorker?.register(...)
      await navigator.serviceWorker.register("./sw.js");
    } catch (err) {
      console.error("Service worker registration failed with error: %O", err);
    }
  } else {
    Alerts.alertBanner(
      "Oops! Looks like you don't support service workers! You can play this but you won't be able to play offline!",
      "black",
      0.7,
      100000,
    );
  }
}

if (document.readyState !== "loading") {
  ready();
} else {
  window.addEventListener(
    "DOMContentLoaded",
    ready,
    {
      once: true,
      passive: true,
    },
  );
}

// how about
// window.addEventListener("load", ready, { once: true, passive: true });