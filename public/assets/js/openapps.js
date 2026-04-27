import {
  setTransport,
  setWisp,
  makeURL,
  proxySJ,
  proxyUV,
} from "../../lithium.mjs";
console.log("openapps.js loaded");
export async function openurl(url, proxytype) {
  let tabNumber = activeTabId.replace("tab", "");
  let iframe = document.getElementById("frame" + tabNumber);
  loadingShow();
  input.value = url;
  let URL;
  if (proxytype === "SJ") {
    URL = await proxySJ(makeURL(input.value));
    console.log("set to SJ");
  } else if (proxytype === "UV") {
    URL = await proxyUV(makeURL(input.value));
    console.log("set to UV");
  }
  iframe.src = URL;
  let currentTab = document.getElementById("tab" + tabNumber);
  let tabName = currentTab?.querySelector(".tabName");
  iframe.onload = () => {
    loadingHide();
    console.log("YAYY");
    try {
      tabName.textContent =
        iframe.contentDocument?.title + " (" + proxytype + ")" || "Untitled";
    } catch {
      tabName.textContent = "Cross-origin page";
    }
  };
}
export async function openApp(url, proxytype) {
  let iframe = document.getElementById("frame");
  let URL;
  if (proxytype === "SJ") {
    URL = await proxySJ(makeURL(url));
    console.log("set to SJ");
  } else if (proxytype === "UV") {
    URL = await proxyUV(makeURL(url));
    console.log("set to UV");
  }
  iframe.src = URL;
}

let loadingNotice = document.createElement("div");

export function loadingShow() {
  loadingNotice.className = "notice";
  loadingNotice.style.animation = "noticeShow 0.4s forwards";
  loadingNotice.textContent = "Loading...";
  document.body.appendChild(loadingNotice);
  console.log("Final URL:", input.value);
}
export function loadingHide() {
  loadingNotice.textContent = "Done!";
  loadingNotice.style.animation = "noticeHide 0.4s ease 0.3s forwards";
}
loadingNotice.addEventListener("click", function () {
  loadingNotice.style.animation = "noticeHide 0.4s forwards";
});

window.openurl = openurl;
window.loadingShow = loadingShow;
window.loadingHide = loadingHide;
