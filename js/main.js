/* ============================================================
   Portfolio JS — faresali74  v4.0
   ============================================================ */

/* ── Config ─────────────────────────────────────────────────── */
const GITHUB_USERNAME = "faresali74";
const GITHUB_TOKEN = ""; // اختياري — vercel.com/account/tokens
const GITHUB_API = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=20`;
const GITHUB_PROFILE = `https://github.com/${GITHUB_USERNAME}`;
const VERCEL_TOKEN = ""; // اختياري — vercel.com/account/tokens

const CACHE_KEY = "gh_repos_faresali74";
const CACHE_TTL = 1000 * 60 * 60 * 6; // 6 ساعات

/* ═══════════════════════════════════════════════════════════════
   DARK MODE
═══════════════════════════════════════════════════════════════ */
function injectDarkModeCSS() {
  const style = document.createElement("style");
  style.id = "dark-overrides";
  style.textContent = `
    .dark body                          { background-color: #0d0f12 !important; color: #e1e3e5; }
    .dark .bg-background,
    .dark .bg-surface,
    .dark .bg-surface-bright            { background-color: #0d0f12 !important; }
    .dark .bg-surface-dim               { background-color: #080a0d !important; }
    .dark .bg-surface-container-lowest  { background-color: #13161a !important; }
    .dark .bg-surface-container-low     { background-color: #181b1f !important; }
    .dark .bg-surface-container         { background-color: #1e2126 !important; }
    .dark .bg-surface-container-high    { background-color: #23272d !important; }
    .dark .bg-surface-container-highest { background-color: #292d34 !important; }
    .dark .bg-white                     { background-color: #1a1d22 !important; }
    .dark header.fixed                  { background-color: rgba(10,11,15,0.90) !important; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
    .dark .text-on-surface              { color: #e2e4e6 !important; }
    .dark .text-on-background           { color: #e2e4e6 !important; }
    .dark .text-tertiary                { color: #8fa3bc !important; }
    .dark .text-on-surface-variant      { color: #cac8dc !important; }
    .dark .text-slate-900               { color: #f1f5f9 !important; }
    .dark .text-slate-600               { color: #94a3b8 !important; }
    .dark .text-slate-500               { color: #64748b !important; }
    .dark .text-outline                 { color: #7a788e !important; }
    .dark .border-outline-variant       { border-color: #3d3b50 !important; }
    .dark .border-slate-200             { border-color: #252830 !important; }
    .dark .border-slate-100             { border-color: #1e2126 !important; }
    .dark .border-b                     { border-color: #3d3b50 !important; }
    .dark .border-white                 { border-color: #1a1d22 !important; }
    .dark .bg-primary-fixed             { background-color: #241e4e !important; }
    .dark .text-on-primary-fixed        { color: #c3c0ff !important; }
    .dark .text-on-primary-fixed-variant{ color: #a9a6f5 !important; }
    .dark .bg-secondary-fixed           { background-color: #1e2235 !important; }
    .dark .text-on-secondary-fixed      { color: #bec6e0 !important; }
    .dark .bg-secondary-container       { background-color: #252a3e !important; }
    .dark .text-on-secondary-container  { color: #bec6e0 !important; }
    .dark .border-primary-fixed         { border-color: #3d3a6e !important; }
    .dark input, .dark textarea         { background-color: #1a1d22 !important; color: #e2e4e6 !important; border-color: #3d3b50 !important; }
    .dark input::placeholder,
    .dark textarea::placeholder         { color: #555870 !important; }
    .dark .hero-pattern                 { background-image: radial-gradient(circle at 2px 2px, #2a2e38 1px, transparent 0); }
    .dark footer                        { background-color: #0d0f12 !important; border-color: #252830 !important; }
    .dark .bg-slate-50                  { background-color: #0d0f12 !important; }
    .dark .shadow-sm,
    .dark .shadow-2xl                   { box-shadow: 0 0 0 1px rgba(255,255,255,.05) !important; }
    .dark .shadow-xl                    { box-shadow: 0 0 0 1px rgba(255,255,255,.04) !important; }
    .dark .hover\\:shadow-lg:hover      { box-shadow: 0 8px 32px rgba(0,0,0,.6) !important; }
    .demo-badge                         { opacity: 0; transform: translateY(4px); transition: opacity .2s, transform .2s; }
    .card-hover:hover .demo-badge       { opacity: 1; transform: translateY(0); }
  `;
  document.head.appendChild(style);
}

function initDarkMode() {
  injectDarkModeCSS();

  const btn = [...document.querySelectorAll("button")].find((b) =>
    b.querySelector('[data-icon="dark_mode"], [data-icon="light_mode"]'),
  );
  const html = document.documentElement;
  const icon = btn?.querySelector(".material-symbols-outlined");

  const apply = (dark) => {
    html.classList.toggle("dark", dark);
    if (icon) icon.textContent = dark ? "light_mode" : "dark_mode";
  };

  const saved = localStorage.getItem("theme");
  apply(
    saved === "dark" ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches),
  );

  btn?.addEventListener("click", () => {
    const isDark = !html.classList.contains("dark");
    apply(isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

/* ═══════════════════════════════════════════════════════════════
   GITHUB FETCH + CACHE
═══════════════════════════════════════════════════════════════ */
async function fetchRepos() {
  // ── جرب الـ cache الأول ──
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      console.log("✅ Repos loaded from cache");
      return cached.data;
    }
  } catch {}

  // ── اجيب من GitHub ──
  const headers = GITHUB_TOKEN
    ? { Authorization: `Bearer ${GITHUB_TOKEN}` }
    : {};

  const res = await fetch(GITHUB_API, { headers });

  if (!res.ok) {
    // لو فشل — استخدم الـ cache القديم حتى لو expired
    try {
      const stale = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (stale?.data) {
        console.warn("⚠️ Rate limited — using stale cache");
        return stale.data;
      }
    } catch {}
    throw new Error(`GitHub ${res.status}`);
  }

  const data = await res.json();
  localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  console.log("✅ Repos fetched from GitHub & cached");
  return data;
}

/* ═══════════════════════════════════════════════════════════════
   DYNAMIC DESCRIPTION PIPELINE
   GitHub desc → README first paragraph → Claude AI
═══════════════════════════════════════════════════════════════ */
async function fetchReadmeDescription(repoName) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/readme`,
      { headers: { Accept: "application/vnd.github.v3.raw" } },
    );
    if (!res.ok) return null;

    const text = await res.text();
    const cleaned = text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`[^`]+`/g, "")
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .replace(/\[.*?\]\(.*?\)/g, (m) => m.match(/\[(.*?)\]/)?.[1] ?? "")
      .replace(/^\s*#{1,6}\s.+$/gm, "")
      .replace(/^\s*[-*>|].*/gm, "")
      .replace(/<[^>]+>/g, "")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 30);

    return cleaned[0]?.slice(0, 160) ?? null;
  } catch {
    return null;
  }
}

async function generateAIDescription(repo) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 80,
        messages: [
          {
            role: "user",
            content: `Write a single punchy one-sentence description (max 120 chars) for a GitHub repo:
Name: ${repo.name}
Language: ${repo.language ?? "unknown"}
Topics: ${(repo.topics ?? []).join(", ") || "none"}
Stars: ${repo.stargazers_count}
Rules: No filler. Start with a verb. No quotes. No period at end.`,
          },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.content?.[0]?.text?.trim() ?? null;
  } catch {
    return null;
  }
}

async function resolveDescription(repo) {
  if (repo.description && repo.description.length > 20) return repo.description;

  const [readme, ai] = await Promise.allSettled([
    fetchReadmeDescription(repo.name),
    generateAIDescription(repo),
  ]);

  return (
    (readme.status === "fulfilled" && readme.value) ||
    (ai.status === "fulfilled" && ai.value) ||
    "No description provided."
  );
}

/* ═══════════════════════════════════════════════════════════════
   VERCEL
═══════════════════════════════════════════════════════════════ */
async function fetchVercelProjects() {
  if (!VERCEL_TOKEN) return new Map();
  try {
    const res = await fetch("https://api.vercel.com/v9/projects?limit=25", {
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
    });
    if (!res.ok) return new Map();

    const { projects = [] } = await res.json();
    const map = new Map();
    for (const p of projects) {
      const alias =
        p.targets?.production?.alias?.[0] ?? p.alias?.[0]?.domain ?? null;
      const url = alias
        ? alias.startsWith("http")
          ? alias
          : `https://${alias}`
        : `https://${p.name}.vercel.app`;
      map.set(p.name.toLowerCase(), url);
      map.set(p.name.toLowerCase().replace(/[-_]/g, ""), url);
    }
    return map;
  } catch {
    return new Map();
  }
}

function matchVercelUrl(repoName, vercelMap) {
  const k1 = repoName.toLowerCase();
  return vercelMap.get(k1) ?? vercelMap.get(k1.replace(/[-_]/g, "")) ?? null;
}

function screenshotSrc(url) {
  return `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;
}

/* ═══════════════════════════════════════════════════════════════
   LANGUAGE COLOURS
═══════════════════════════════════════════════════════════════ */
const LANG_COLORS = {
  JavaScript: "#f7df1e",
  TypeScript: "#3178c6",
  Python: "#3572a5",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#42b883",
  React: "#61dafb",
  PHP: "#4f5d95",
  Java: "#b07219",
  Rust: "#dea584",
  Go: "#00add8",
  Ruby: "#701516",
  Swift: "#f05138",
  Kotlin: "#7f52ff",
  Dart: "#00b4ab",
  Shell: "#89e051",
  default: "#777587",
};
const langColor = (l) =>
  l ? (LANG_COLORS[l] ?? LANG_COLORS.default) : LANG_COLORS.default;
const fmt = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + "k" : n);

/* ═══════════════════════════════════════════════════════════════
   CARD BUILDERS
═══════════════════════════════════════════════════════════════ */
function placeholderPanel(repo, cls = "") {
  const lang = repo.language ?? "Code";
  const color = langColor(repo.language);
  return `
    <div class="${cls} bg-gradient-to-br from-primary/10 via-primary-fixed to-secondary-container
                 flex items-center justify-center relative overflow-hidden">
      <div class="absolute inset-0 opacity-10"
           style="background-image:radial-gradient(circle at 2px 2px,#4f46e5 1px,transparent 0);background-size:22px 22px;"></div>
      <div class="relative z-10 text-center px-lg">
        <div class="w-16 h-16 rounded-2xl bg-white/80 backdrop-blur flex items-center justify-center mx-auto mb-sm shadow-lg">
          <span class="material-symbols-outlined text-primary text-3xl">folder_code</span>
        </div>
        <span class="inline-flex items-center gap-1 text-xs font-semibold text-on-primary-fixed-variant">
          <span class="w-2 h-2 rounded-full" style="background:${color}"></span>${lang}
        </span>
      </div>
    </div>`;
}

function livePanel(demoUrl, cls = "") {
  return `
    <div class="${cls} overflow-hidden relative bg-surface-container">
      <img src="${screenshotSrc(demoUrl)}" loading="lazy" alt="Live preview"
           class="w-full h-full object-cover object-top"
           style="transition:transform .5s"
           onmouseover="this.style.transform='scale(1.05)'"
           onmouseout="this.style.transform='scale(1)'"
           onerror="this.parentElement.innerHTML='<div class=\\'flex items-center justify-center h-full text-xs text-tertiary p-md text-center\\'>Preview unavailable</div>'" />
      <a href="${demoUrl}" target="_blank" rel="noopener"
         class="demo-badge absolute bottom-3 right-3 bg-primary text-on-primary text-xs
                px-3 py-1.5 rounded-lg font-label-sm flex items-center gap-1 shadow-md">
        <span class="material-symbols-outlined text-sm">open_in_new</span> Open Demo
      </a>
    </div>`;
}

function featuredCard(repo, desc, demoUrl) {
  const lang = repo.language ?? "Code";
  const color = langColor(repo.language);
  const stars = fmt(repo.stargazers_count);
  const forks = fmt(repo.forks_count);
  const updated = new Date(repo.updated_at).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });

  return `
    <div class="card-hover md:col-span-2 lg:col-span-2 bg-white border border-outline-variant
                rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all">
      <div class="flex flex-col md:flex-row h-full">
        ${demoUrl ? livePanel(demoUrl, "md:w-1/2 h-64 md:h-auto") : placeholderPanel(repo, "md:w-1/2 h-64 md:h-auto")}
        <div class="md:w-1/2 p-lg flex flex-col justify-between">
          <div>
            <span class="text-primary font-label-sm uppercase tracking-widest">Latest Repository</span>
            <h3 class="font-h2 text-h2 mt-xs mb-md text-on-surface break-words">${repo.name}</h3>
            <p class="desc font-body-md text-tertiary mb-lg line-clamp-3">${desc}</p>
            <div class="flex flex-wrap gap-xs mb-lg">
              <span class="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                           border border-outline-variant text-on-surface-variant">
                <span class="w-2.5 h-2.5 rounded-full" style="background:${color}"></span>${lang}
              </span>
              ${(repo.topics ?? [])
                .slice(0, 2)
                .map(
                  (t) =>
                    `<span class="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full text-xs font-medium">${t}</span>`,
                )
                .join("")}
            </div>
            <div class="flex gap-md text-xs text-tertiary mb-lg">
              <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">star</span>${stars} stars</span>
              <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">fork_right</span>${forks} forks</span>
              <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">schedule</span>${updated}</span>
            </div>
          </div>
          <div class="flex gap-md flex-wrap">
            ${
              demoUrl
                ? `
              <a class="bg-primary text-on-primary px-5 py-2.5 rounded-lg font-label-md
                         flex items-center gap-2 hover:opacity-90 transition-opacity"
                 href="${demoUrl}" target="_blank" rel="noopener">
                <span class="material-symbols-outlined text-sm">rocket_launch</span> Live Demo
              </a>`
                : ""
            }
            <a class="border border-outline-variant text-on-surface px-5 py-2.5 rounded-lg font-label-md
                       flex items-center gap-2 hover:bg-surface-container-low transition-colors"
               href="${repo.html_url}" target="_blank" rel="noopener">
              <span class="material-symbols-outlined">source</span> Code
            </a>
          </div>
        </div>
      </div>
    </div>`;
}

function smallCard(repo, desc, demoUrl) {
  const lang = repo.language ?? "Code";
  const color = langColor(repo.language);
  const stars = fmt(repo.stargazers_count);
  const updated = new Date(repo.updated_at).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });

  return `
    <div class="card-hover bg-white border border-outline-variant rounded-xl overflow-hidden
                shadow-sm hover:shadow-lg transition-all flex flex-col">
      ${demoUrl ? livePanel(demoUrl, "w-full h-44") : placeholderPanel(repo, "w-full h-44")}
      <div class="p-lg flex flex-col flex-grow">
        <h3 class="font-h3 text-h3 mb-xs break-words">${repo.name}</h3>
        <p class="desc font-body-sm text-tertiary mb-md flex-grow line-clamp-2">${desc}</p>
        <div class="flex flex-wrap gap-xs mb-md">
          <span class="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
                       border border-outline-variant text-on-surface-variant">
            <span class="w-2 h-2 rounded-full" style="background:${color}"></span>${lang}
          </span>
          <span class="flex items-center gap-1 text-xs text-tertiary">
            <span class="material-symbols-outlined text-sm">star</span>${stars}
          </span>
          <span class="flex items-center gap-1 text-xs text-tertiary">
            <span class="material-symbols-outlined text-sm">schedule</span>${updated}
          </span>
        </div>
        <div class="flex items-center gap-md mt-auto">
          ${
            demoUrl
              ? `
            <a class="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-xs font-label-sm
                       flex items-center gap-1 hover:opacity-90 transition-opacity"
               href="${demoUrl}" target="_blank" rel="noopener">
              <span class="material-symbols-outlined text-sm">rocket_launch</span> Demo
            </a>`
              : ""
          }
          <a class="text-primary font-label-md hover:underline flex items-center gap-1"
             href="${repo.html_url}" target="_blank" rel="noopener">
            GitHub <span class="material-symbols-outlined">chevron_right</span>
          </a>
        </div>
      </div>
    </div>`;
}

/* ── Skeletons ── */
function renderSkeletons(container) {
  container.innerHTML = Array(5)
    .fill(0)
    .map(
      (_, i) => `
    <div class="${i === 0 ? "md:col-span-2 lg:col-span-2" : ""} animate-pulse bg-white border
                border-outline-variant rounded-xl overflow-hidden">
      <div class="h-44 bg-surface-container"></div>
      <div class="p-lg space-y-sm">
        <div class="h-3 bg-surface-container rounded w-1/3"></div>
        <div class="h-5 bg-surface-container rounded w-2/3"></div>
        <div class="h-3 bg-surface-container rounded w-full"></div>
        <div class="h-3 bg-surface-container rounded w-4/5"></div>
      </div>
    </div>`,
    )
    .join("");
}

/* ── Error state ── */
function renderError(container, message = "Couldn't load repositories") {
  container.innerHTML = `
    <div class="col-span-full flex flex-col items-center justify-center py-xxl text-center gap-md">
      <span class="material-symbols-outlined text-error text-5xl">error_outline</span>
      <p class="font-h3 text-h3 text-on-surface">${message}</p>
      <p class="text-tertiary font-body-sm">Check your network or try refreshing.</p>
      <a class="bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md mt-sm"
         href="${GITHUB_PROFILE}" target="_blank" rel="noopener">Visit GitHub Profile</a>
    </div>`;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN LOADER
═══════════════════════════════════════════════════════════════ */
async function loadProjects() {
  const section = document.querySelector("#projects");
  const grid = section?.querySelector(".grid");
  const exploreBtn = section?.querySelector("button");

  if (!grid) return;

  exploreBtn?.addEventListener("click", () =>
    window.open(GITHUB_PROFILE, "_blank", "noopener"),
  );

  renderSkeletons(grid);

  try {
    const [repos, vercelMap] = await Promise.all([
      fetchRepos(),
      fetchVercelProjects(),
    ]);

    const list = repos
      .filter((r) => !r.fork)
      .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
      .slice(0, 5);

    if (!list.length) throw new Error("No repositories found");

    /* ── Step 1: render فوراً بالـ description الموجودة ── */
    grid.innerHTML = list
      .map((repo, i) => {
        const demoUrl =
          matchVercelUrl(repo.name, vercelMap) ?? (repo.homepage || null);
        const desc = repo.description || "Loading description…";
        return i === 0
          ? featuredCard(repo, desc, demoUrl)
          : smallCard(repo, desc, demoUrl);
      })
      .join("");

    /* ── Step 2: حسّن الـ descriptions في الـ background ── */
    list.forEach(async (repo, i) => {
      if (repo.description?.length > 20) return;

      const desc = await resolveDescription(repo);
      const cards = grid.querySelectorAll(".card-hover");
      const p = cards[i]?.querySelector(".desc");

      if (p && desc) {
        p.style.transition = "opacity .3s";
        p.style.opacity = "0";
        setTimeout(() => {
          p.textContent = desc;
          p.style.opacity = "1";
        }, 300);
      }
    });
  } catch (err) {
    console.error("Projects load error:", err);
    const msg = err.message.includes("403")
      ? "GitHub rate limit reached — try again in an hour"
      : "Couldn't load repositories";
    renderError(grid, msg);
  }
}

/* ═══════════════════════════════════════════════════════════════
   SCROLL SPY
═══════════════════════════════════════════════════════════════ */
function initScrollSpy() {
  const sections = [...document.querySelectorAll("section[id]")];
  const links = [...document.querySelectorAll("header nav a[href^='#']")];

  const activate = (id) =>
    links.forEach((a) => {
      const on = a.getAttribute("href") === `#${id}`;
      a.classList.toggle("text-indigo-600", on);
      a.classList.toggle("dark:text-indigo-400", on);
      a.classList.toggle("border-b-2", on);
      a.classList.toggle("border-indigo-600", on);
      a.classList.toggle("pb-1", on);
      a.classList.toggle("text-slate-600", !on);
      a.classList.toggle("dark:text-slate-400", !on);
    });

  sections.forEach((s) =>
    new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.isIntersecting && activate(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" },
    ).observe(s),
  );
}

/* ── Smooth scroll ── */
function initSmoothScroll() {
  document.querySelectorAll("a[href^='#']").forEach((a) =>
    a.addEventListener("click", (e) => {
      const t = document.querySelector(a.getAttribute("href"));
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: "smooth" });
    }),
  );
}

/* ── CTA buttons ── */
function initCTA() {
  document.querySelectorAll("button").forEach((btn) => {
    const txt = btn.textContent.trim();
    if (txt === "Hire Me")
      btn.addEventListener("click", () =>
        document
          .querySelector("#contact")
          ?.scrollIntoView({ behavior: "smooth" }),
      );
    if (txt === "View Projects")
      btn.addEventListener("click", () =>
        document
          .querySelector("#projects")
          ?.scrollIntoView({ behavior: "smooth" }),
      );
    if (txt.includes("Download CV"))
      btn.addEventListener("click", () => window.open("./cv.pdf"));
  });
}

/* ── Contact form (Web3Forms) ── */
function initContactForm() {
  const form = document.querySelector("#contact form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const empties = [
      ...form.querySelectorAll(
        "input:not([type=hidden]):not([type=checkbox]),textarea",
      ),
    ].filter((i) => i.required && !i.value.trim());

    if (empties.length) {
      empties[0].focus();
      empties[0].classList.add("ring-2", "ring-red-500", "border-red-500");
      setTimeout(
        () =>
          empties[0].classList.remove(
            "ring-2",
            "ring-red-500",
            "border-red-500",
          ),
        2500,
      );
      return;
    }

    const btn = form.querySelector("button[type=submit]");
    btn.innerHTML = `<span class="material-symbols-outlined" style="animation:spin 1s linear infinite">progress_activity</span> Sending…`;
    btn.disabled = true;

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await res.json();

      if (data.success) {
        btn.innerHTML = `<span class="material-symbols-outlined">check_circle</span> Message Sent!`;
        btn.classList.replace("bg-primary", "bg-green-600");
        form.reset();
        setTimeout(() => {
          btn.innerHTML = `Send Message <span class="material-symbols-outlined">send</span>`;
          btn.disabled = false;
          btn.classList.replace("bg-green-600", "bg-primary");
        }, 4000);
      } else {
        throw new Error(data.message);
      }
    } catch {
      btn.innerHTML = `<span class="material-symbols-outlined">error</span> Failed — Try Again`;
      btn.classList.replace("bg-primary", "bg-red-600");
      btn.disabled = false;
      setTimeout(() => {
        btn.innerHTML = `Send Message <span class="material-symbols-outlined">send</span>`;
        btn.classList.replace("bg-red-600", "bg-primary");
      }, 3000);
    }
  });
}

/* ── Spinner keyframe ── */
const spinStyle = document.createElement("style");
spinStyle.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(spinStyle);

/* ═══════════════════════════════════════════════════════════════
   BOOT
═══════════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  initDarkMode();
  initScrollSpy();
  initSmoothScroll();
  initCTA();
  initContactForm();
  loadProjects();
});
