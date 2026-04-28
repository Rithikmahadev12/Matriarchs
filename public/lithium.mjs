import { BareMuxConnection } from "https://unpkg.com/@mercuryworkshop/bare-mux@2.1.7/dist/index.mjs";

let connection;
document.addEventListener("DOMContentLoaded", () => {
  connection = new BareMuxConnection("/bareworker.js");
});

let wispURL;
let transportURL;

export let tabCounter = 0;
export let currentTab = 0;
export let framesElement;
export let currentFrame;
export const addressInput = document.getElementById("address");

requestIdleCallback(async () => {
  await import(`/scram/scramjet.all.js`);

  const { ScramjetController } = window.$scramjetLoadController();

  const scramjet = new ScramjetController({
    files: {
      wasm: `/scram/scramjet.wasm.wasm`,
      all: `/scram/scramjet.all.js`,
      sync: `/scram/scramjet.sync.js`,
    },
    siteFlags: {
      "https://www.google.com/(search|sorry).*": {
        naiiveRewriter: true,
      },
    },
  });

  scramjet.init();
  window.scramjet = scramjet;
});

const transportOptions = {
  epoxy: "https://unpkg.com/@mercuryworkshop/epoxy-transport@2.1.27/dist/index.mjs",
  libcurl: "https://unpkg.com/@mercuryworkshop/libcurl-transport@1.5.0/dist/index.mjs",
};

//////////////////////////////
///           SW           ///
//////////////////////////////
const stockSW = "./ultraworker.js";
const swAllowedHostnames = ["localhost", "127.0.0.1"];

export async function registerSW() {
  if (!navigator.serviceWorker) {
    if (
      location.protocol !== "https:" &&
      !swAllowedHostnames.includes(location.hostname)
    )
      throw new Error("Service workers cannot be registered without https.");

    throw new Error("Your browser doesn't support service workers.");
  }

  await navigator.serviceWorker.register(stockSW);
}

localStorage.setItem("searchEngine", "https://duckduckgo.com/?q=%s");

export function makeURL(input, template) {
  template = template || localStorage.getItem("searchEngine");

  try {
    return new URL(input).toString();
  } catch (err) {
    return template.replace("%s", encodeURIComponent(input));
  }
}

async function updateBareMux() {
  if (!connection) {
    console.warn("BareMux connection not ready yet");
    return;
  }
  if (transportURL != null && wispURL != null) {
    console.log(`lethal.js: Setting BareMux to ${transportURL} and Wisp to ${wispURL}`);
    await connection.setTransport(transportURL, [{ wisp: wispURL }]);
  }
}

export async function setTransport(transport) {
  console.log(`lethal.js: Setting transport to ${transport}`);
  transportURL = transportOptions[transport] || transport;
  await updateBareMux();
}

export function getTransport() {
  return transportURL;
}

export async function setWisp(wisp) {
  console.log(`lethal.js: Setting Wisp to ${wisp}`);
  wispURL = wisp;
  await updateBareMux();
}

export function getWisp() {
  return wispURL;
}

export async function proxySJ(input) {
  const url = makeURL(input);
  return scramjet.encodeUrl(url);
}

export async function proxyUV(input) {
  const url = makeURL(input);
  return __uv$config.prefix + __uv$config.encodeUrl(url);
}

export function setFrames(frames) {
  framesElement = frames;
}

export class Tab {
  constructor() {
    tabCounter++;
    this.tabNumber = tabCounter;

    this.frame = document.createElement("iframe");
    this.frame.setAttribute("class", "w-full h-full border-0 fixed");
    this.frame.setAttribute("title", "Proxy Frame");
    this.frame.setAttribute("src", "/newtab");
    this.frame.setAttribute("loading", "lazy");
    this.frame.setAttribute("id", `frame-${tabCounter}`);
    framesElement.appendChild(this.frame);

    this.switch();
    this.frame.addEventListener("load", () => this.handleLoad());

    document.dispatchEvent(
      new CustomEvent("new-tab", {
        detail: { tabNumber: tabCounter },
      })
    );
  }

  switch() {
    currentTab = this.tabNumber;
    const frames = document.querySelectorAll("iframe");
    [...frames].forEach((frame) => frame.classList.add("hidden"));
    this.frame.classList.remove("hidden");

    currentFrame = document.getElementById(`frame-${this.tabNumber}`);

    addressInput.value = decodeURIComponent(
      this.frame?.contentWindow?.location.href.split("/").pop()
    );

    document.dispatchEvent(
      new CustomEvent("switch-tab", {
        detail: { tabNumber: this.tabNumber },
      })
    );
  }

  close() {
    this.frame.remove();

    document.dispatchEvent(
      new CustomEvent("close-tab", {
        detail: { tabNumber: this.tabNumber },
      })
    );
  }

  handleLoad() {
    let url = decodeURIComponent(
      this.frame?.contentWindow?.location.href.split("/").pop()
    );
    let title = this.frame?.contentWindow?.document.title;

    let history = localStorage.getItem("history")
      ? JSON.parse(localStorage.getItem("history"))
      : [];
    history = [...history, { url, title }];
    localStorage.setItem("history", JSON.stringify(history));

    document.dispatchEvent(
      new CustomEvent("url-changed", {
        detail: { tabId: currentTab, title, url },
      })
    );

    if (url === "newtab") url = "bromine://newtab";
    addressInput.value = url;
  }
}

export async function newTab() {
  new Tab();
}

export function switchTab(tabNumber) {
  const frames = document.querySelectorAll("iframe");
  [...frames].forEach((frame) => {
    frame.classList.toggle("hidden", frame.id !== `frame-${tabNumber}`);
  });

  currentTab = tabNumber;
  currentFrame = document.getElementById(`frame-${tabNumber}`);

  addressInput.value = decodeURIComponent(
    currentFrame?.contentWindow?.location.href.split("/").pop()
  );

  document.dispatchEvent(
    new CustomEvent("switch-tab", {
      detail: { tabNumber },
    })
  );
}

export function closeTab(tabNumber) {
  const frames = document.querySelectorAll("iframe");
  [...frames].forEach((frame) => {
    if (frame.id === `frame-${tabNumber}`) {
      frame.remove();
    }
  });

  if (currentTab === tabNumber) {
    const otherFrames = document.querySelectorAll('iframe[id^="frame-"]');
    if (otherFrames.length > 0) {
      switchTab(parseInt(otherFrames[0].id.replace("frame-", "")));
    } else {
      newTab();
    }
  }

  document.dispatchEvent(
    new CustomEvent("close-tab", {
      detail: { tabNumber },
    })
  );
}

export function getOriginalUrl(url) {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    if (url.includes("/scramjet/") && url.includes(location.origin)) {
      try {
        const urlObj = new URL(url);
        if (urlObj.pathname.startsWith("/scramjet/")) {
          const encodedUrl = urlObj.pathname.substring("/scramjet/".length);
          try {
            const decoded = decodeURIComponent(encodedUrl);
            if (decoded.startsWith("http")) return decoded;
            const base64Decoded = atob(encodedUrl);
            if (base64Decoded.startsWith("http")) return base64Decoded;
          } catch (e) {}
        }
      } catch (e) {}
    } else {
      url.split(__uv$config.prefix)[1];
    }
    return url;
  }
}
