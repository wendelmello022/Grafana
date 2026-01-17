const SELECTOR = ".cirion-row";
const CACHE_KEY = "bt_last_values_cirion_v1";

function formatBps(bps) {
  const units = ["b/s", "Kb/s", "Mb/s", "Gb/s", "Tb/s"];
  let value = bps;
  let unit = 0;

  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit++;
  }

  const decimals =
    value >= 100 ? 0 :
    value >= 10 ? 1 : 2;

  return `${value.toFixed(decimals).replace(".", ",")} ${units[unit]}`;
}

function loadCache() {
  try {
    return JSON.parse(sessionStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveCache(cache) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

function applyOnce() {
  const cache = loadCache();
  let changed = false;

  document.querySelectorAll(SELECTOR).forEach(row => {
    const rawName = row.querySelector(".raw-name");
    const rawLast = row.querySelector(".raw-last");
    const labelEl = row.querySelector(".label");
    const valueEl = row.querySelector(".value");

    if (!rawName || !rawLast || !labelEl || !valueEl) return;

    const name = rawName.textContent.toLowerCase();
    const key =
      name.includes("download") ? "download" :
      name.includes("upload") ? "upload" :
      "trafego";

    labelEl.textContent =
      key === "download" ? "Download" :
      key === "upload" ? "Upload" :
      "Tráfego";

    const n = Number(rawLast.textContent);

    if (isFinite(n)) {
      valueEl.textContent = formatBps(n);
      if (cache[key] !== n) {
        cache[key] = n;
        changed = true;
      }
    } else if (isFinite(cache[key])) {
      valueEl.textContent = formatBps(cache[key]);
    } else {
      valueEl.textContent = "—";
    }
  });

  if (changed) saveCache(cache);
}

let burst = 0;
const init = setInterval(() => {
  applyOnce();
  if (++burst >= 10) clearInterval(init);
}, 1000);

setInterval(applyOnce, 2000);
