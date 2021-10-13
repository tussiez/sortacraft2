/*
Service Worker for SortaCraft

Caches data for SortaCraft

@author Baconman321

sortagames.repl.co
*/


// This is the service worker file. It will be registered as a service worker. Service workers and Web workers both work on seperate threads than the main thread, which is used to handle all other JavaScript files otherwise.
// In a service worker, it uses the global scope of "self". This is like the window object in main frames. Note that you can't access local storage or session storage, or the window object. You could rewrite self as "this" as well.

// files to cache

/*let cacheList = [
  "https://threejs.org/examples/jsm/csm/Shader.js",
  "https://threejs.org/examples/jsm/csm/Frustum.js",
  "https://threejs.org/examples/jsm/postprocessing/EffectComposer.js",
  "https://threejs.org/examples/jsm/postprocessing/RenderPass.js",
  "https://threejs.org/examples/jsm/postprocessing/ShaderPass.js",
  "https://threejs.org/examples/jsm/shaders/FXAAShader.js",
  "https://threejs.org/examples/jsm/shaders/CopyShader.js",
  "https://threejs.org/examples/jsm/postprocessing/MaskPass.js",
  "https://threejs.org/examples/jsm/postprocessing/Pass.js",
  "threejs.js",
  "swHandler.js",
  "items/stonesword.gif",
  "https://minecraftfont.tussiez.repl.co/Minecraft.ttf",
  "https://threejs.org/examples/jsm/csm/CSM.js",
  "items/silversword.gif",
  "https://threejs.org/build/three.module.js",
  "items/hotbar.png",
  "/",
  "index.html",
  "chunkworker.js",
  "daynight.js",
  "resources/dirt.png",
  "gameworker.js",
  "geometrydataworker.js",
  "inventory.js",
  "newgame.html",
  "newgame.js",
  "script.js",
  "style.css",
  "textures.png",
  "tween.js",
  "sortacraft.ico",
  "VERSION.txt",
  "manifest.json",
  "icons/logo-large.png",
  "icons/logo-small.png",
  "textureatlas.js",
  "textureatlas_worker.js",
  "https://sortacanvas.sortagames.repl.co/lib.js",
  "https://sortaphysics.sortagames.repl.co/lib.js",
  "https://sortaphysics.sortagames.repl.co/cannonModule.js",
  "PhysicsControls.js",
  "VoxelWorld.js",
];*/

{ // begin big block scope
  const {
    caches,
    fetch,
    Promise,
    Error,
    Number,
    console,
    Response,
    Headers,
    TypeError,
    Boolean,
  } = globalThis;

  const cacheList = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./main.js",
    "./https://threejs.org/build/three.module.js",
    "./modules/Methods.js",
    "./modules/PlayerControls.js",
    "./modules/VoxelEngine.js",
    "./modules/GeometryData.js",
    "./modules/ChunkGen.js",
    "./modules/GeometryDataWorker.js",
    "./modules/ChunkGenWorker.js",
    "./modules/Perlin.js",
    "./modules/alerts.js",
    "./modules/WASMLoader.js",
    "./modules/TWEEN.js",
    "./modules/three.js",
    "./modules/Commands.js",
    "./modules/SortaCanvas.js",
    "./modules/Raycast.js",
    "./modules/GlobalMethods.js",
    "./modules/TouchControls.js",
    "./modules/TouchControlsWorker.js",
    "./swLauncher.js",
    "./idleTasks.js",
    "./lock.js",
    "./resources/img/dirt.png",
    "./resources/img/textures.png",
    "./resources/img/ico/sortacraft.ico",
    "./resources/Minecraft.woff2",
    "./VERSION.txt",
    "./WASM/Math/Math.wasm"
  ];

  const cacheControl = {
    addAll: async (cacheArr, storageName, throwOnFail) => {
      if ("undefined" === typeof cacheArr) {
        throw new TypeError(
          'Parameter "cacheArr" (argument 1) is not defined.',
        );
      }
      if (!("forEach" in cacheArr)) {
        throw new TypeError(
          'Parameter "cacheArr" (argument 1) cannot be iterated with "forEach()", meaning that it is not a valid array. If you are using a browser with an ECMAScript version of under 5, please consider upgrading your browser to a newer version (preferably one of the most current versions).',
        );
      }
      throwOnFail = Boolean(throwOnFail);
      if ("undefined" === typeof storageName) {
        throw new TypeError(
          'Parameter "storageName" (argument 2) is not defined.',
        );
      }
      const cache = await caches.open(storageName);

      const addCacheItem = async (v) => {
        try {
          const res = await cache.add(v);
          return v;
        } catch (err) {
          const errorMessage = `Failed to cache a file with an error: ${err}`;

          if (throwOnFail) {
            throw new Error(errorMessage);
          } else {
            console.warn(errorMessage);
          }
        }
      };

      const succededRequests = cacheArr.map(addCacheItem);

      return Promise.all(succededRequests);
    },
  };

  // control current page when it's activated (A.K.A, whenever it is run). Service workers run when there is a request of any kind, and stop when they aren't needed. So, when a user requests a webpage, it will activate. That is why it's like a proxy for the website.

  self.addEventListener(
    "activate",
    (event) => {
      // Claim the client (page)
      console.log("Service Worker Activated.");
      return self.clients.claim();
      // Checks the version. If it's not up to date, then update it if possible
    },
  );

  // Listens for when the service worker is installed (when it doesn't exist and the browser registers it)
  self.addEventListener(
    "install",
    (event) => {
      self.skipWaiting();
      console.log("Service worker installed.");
      // This opens a cache and adds the cached files
      return cacheControl.addAll(cacheList, "cache");
    },
  );

  // Listen for when someone requests a resource (like a webpage)

  // Checks the version

  const checkCache = async () => {
    const cache = await caches.open("cache");

    // Open "cache", then get VERSION.txt from cache archive
    const r = await cache.match("VERSION.txt");
    // If the response is invalid (will be falsely if it doesn't exist or some other error appears), then reject the promise
    if (!r) {
      throw new Error("Failed to check version");
    }
    //If the above code doesn't run, then read the readableStream as text and return it.
    const txt = await r.text();
    //If the text is valid, return it
    if (txt) {
      return txt;
    } else {
      //If it's invalid, the above code won't execute, causing this to reject and return.
      throw new Error("Invalid response, recieved: " + txt);
    }
  };

  async function checkVer() {
    //Fetch the cached version of VERSION.txt, then compare it to the website's file. If there is a difference, update the cache.
    try {
      const cacheVer = await checkCache();
      //Made a change to fetch the version file relatively (because otherwise it's blocked by CORS)
      const res = await fetch("/VERSION.txt");
      const txt = await res.text();
      try {
        const ver = Number(txt);
        if (ver) {
          const current = Number(cacheVer);
          if (ver > 0) {
            // It's actually a number
            console.log(
              "Latest version: %O.\n Cached version: %O.",
              ver,
              current,
            );

            if (ver > current) {
              //Outdated version detected!
              console.log(
                "Outdated game version detected, old: %O.",
                current,
              );
              cacheControl.addAll(cacheList, "cache");
            } else if (ver == current) {
              console.log("Game is up to date.");
            } else {
              // console.warn is less intrusive than console.error
              console.warn(
                "Cached game appears to be in a future state. Cached version: %O",
                current,
              );
              // Time machine used
            }
          } else {
            // hmm
            console.warn("strange response");
          }
        }
      } catch {
        //Probably offline
        console.warn(
          "Unable to establish a connection: cannot connect to server",
        );
        console.warn("Failed to check version.");
      }
    } catch (err) {
      //Probably offline
        console.warn(
          "Unable to establish a connection: cannot connect to server",
        );
        console.warn("Failed to check version.");
    }
  }

  const delay = (seconds) =>
    new Promise(
      (resolve) => setTimeout(resolve, 1000.0 * seconds),
    );

  self.addEventListener(
    "fetch",
    async (event) => {
      // Respond with an immediately invoked function expression (IIFE) (because event.respondWith takes a response, not a function, so compile the function that adds a response)
      const response = (async () => {
        // Use Regex to check if the request matches any files we want to try to serve from cache first.
        if (
          event.request.url.match(
            /(home\.js)|(tween\.js)|(daynight\.js)|(dirt\.png)/,
          )
        ) {
          // CACHE!
          return (await caches.match(event.request)) || fetch(event.request);
        } else {
          // Otherwise, try fetching the script first, then return it. If the user is offline, then try to serve it from cache. If not, tell them that something went wrong (since the cache doesn't exist or is bad and they aren't online)
          return fetch(event.request).catch(
            async () => {
              const cacheRes = await caches.match(event.request);
              // Return the response telling them that something went wrong. (One of the main reasons this would happen is if something isn't cached and they are offline)
              return cacheRes || new Response(
                `<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"> <title>Service unavailable</title> <meta name="viewport" content="width=device-width, initial-scale=1"> <meta name="description" content="Error"></head> <body><h1>Error fetching cache.</h1><p>Try connecting to the internet. If that doesn't work then try clearing the site's data.</p></body> </html>`,
                {
                  status: 503,
                  statusText: "Service unavailable.",
                  headers: new Headers({ "Content-Type": "text/html" }),
                },
              );
              // Interesting
            },
          );
        }
      })();

      event.respondWith(response);

      await delay(1);
      if (
        event.request.url.match(
          /(index\.html$)|(https?:\/\/sortacraft2?\.sortagames\.repl\.co\/?$)|(https?:\/\/tussiez\.github\.io\/sortacraft\/?$)|(newgame\.html$)/,
        )
      ) {
        checkVer();
        console.log("checking version...");
      }
    },
  );
} // end of big block scope
