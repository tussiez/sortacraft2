import Alerts from "./modules/alerts.js";
function ready() {
  /*Not really needed since repl now redirects to https! :D*/
  // if(location.protocol === "https"){
  //   Alerts.alert("You are using 'http'. To get the full experience, you need to use the 'https' version. Click <a href='https://" + location.host + "'>here</a> to redirect to the secure version.");
  // }
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").then(function (registration) {})
      .catch(function (err) {
        console.error("Service worker registration failed with error: " + err);
      });
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
  window.addEventListener("DOMContentLoaded", ready);
}
