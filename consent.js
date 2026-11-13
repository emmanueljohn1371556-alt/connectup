// ConnectUp cookie consent. Analytics and ads load only after the visitor taps "Accept".
const GA_ID = "G-YMRMYF20D7";   // Google Analytics measurement ID
const ADSENSE_ID = "";          // e.g. "ca-pub-1234567890123456" once AdSense approves you
const KEY = "consent";

function getChoice() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
function setChoice(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

function loadScript(src, attrs) {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  Object.entries(attrs || {}).forEach(([k, v]) => s.setAttribute(k, v));
  document.head.appendChild(s);
}

function enableTracking() {
  if (GA_ID) {
    window["ga-disable-" + GA_ID] = false;
    if (!window.__gaLoaded) {
      window.__gaLoaded = true;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", GA_ID, { anonymize_ip: true });
      loadScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID));
    }
  }
  if (ADSENSE_ID && !window.__adsLoaded) {
    window.__adsLoaded = true;
    loadScript("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(ADSENSE_ID), { crossorigin: "anonymous" });
  }
}

function disableTracking() {
  if (GA_ID) window["ga-disable-" + GA_ID] = true;
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0].trim();
    if (name === "_ga" || name.indexOf("_ga_") === 0 || name === "_gid") {
      document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=" + location.hostname;
    }
  });
}

function showBanner() {
  if (document.getElementById("consentBar")) return;
  const bar = document.createElement("div");
  bar.id = "consentBar";
  bar.setAttribute("role", "dialog");
  bar.setAttribute("aria-label", "Cookie consent");
  bar.style.cssText = "position:fixed;left:0;right:0;bottom:0;z-index:1000;padding:14px 16px calc(14px + env(safe-area-inset-bottom,0px));background:var(--surface,#182236);color:var(--text,#e8eefb);border-top:1px solid var(--border,#2a3855);font:14px/1.45 system-ui,sans-serif;box-shadow:0 -6px 20px rgba(0,0,0,.35)";

  const msg = document.createElement("div");
  msg.innerHTML = 'We use cookies for analytics and ads. You can accept or decline. See our <a href="Privacy.html" style="color:var(--accent,#6c9bff)">Privacy Policy</a>.';

  const row = document.createElement("div");
  row.style.cssText = "display:flex;gap:10px;margin-top:10px;justify-content:flex-end";

  const mk = (label, primary) => {
    const b = document.createElement("button");
    b.textContent = label;
    b.style.cssText = "padding:9px 18px;border-radius:8px;font-size:14px;cursor:pointer;border:1px solid var(--accent,#6c9bff);" +
      (primary ? "background:var(--accent,#6c9bff);color:#fff" : "background:none;color:var(--accent,#6c9bff)");
    return b;
  };
  const decline = mk("Decline", false);
  const accept = mk("Accept", true);

  decline.onclick = () => { setChoice("declined"); disableTracking(); bar.remove(); };
  accept.onclick = () => { setChoice("accepted"); enableTracking(); bar.remove(); };

  row.append(decline, accept);
  bar.append(msg, row);
  document.body.appendChild(bar);
}

// Lets Profile > Cookie settings reopen the banner
window.openConsent = showBanner;

const choice = getChoice();
if (choice === "accepted") enableTracking();
else if (choice !== "declined") showBanner();

// ---------- Install and invite helpers ----------
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferredPrompt = e; });

window.installApp = async function () {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    try { await deferredPrompt.userChoice; } catch (e) {}
    deferredPrompt = null;
    return;
  }
  alert("To install: open your browser menu (the three dots) and tap \u201cAdd to Home screen\u201d or \u201cInstall app\u201d.");
};

window.inviteFriends = async function () {
  const url = new URL("index.html", location.href).href;
  const text = "Join me on ConnectUp: share posts, photos, videos and stories, and chat with friends.";
  if (navigator.share) {
    try { await navigator.share({ title: "ConnectUp", text, url }); } catch (e) {}
    return;
  }
  try {
    await navigator.clipboard.writeText(text + " " + url);
    alert("Invite link copied. Paste it in WhatsApp or anywhere you like.");
  } catch (e) {
    prompt("Copy this invite:", text + " " + url);
  }
};
