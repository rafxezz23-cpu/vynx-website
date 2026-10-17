import { createIcons, icons } from "lucide";

const DISCORD_ID = "943108101492580362";
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = <T extends HTMLElement>(s: string) => document.querySelector<T>(s)!;

// ---------- Profil Discorda (japi.rest + Lanyard dla statusu) ----------
type JapiUser = {
  username: string;
  global_name: string | null;
  avatar: string | null;
  banner: string | null;
  display_name_styles?: { colors: number[] };
  clan?: { tag: string; badge: string; identity_guild_id: string };
};
type Status = "online" | "idle" | "dnd" | "offline";
const statusColor: Record<Status, string> = { online: "#23a55a", idle: "#f0b232", dnd: "#e5484d", offline: "#80848e" };
const statusLabel: Record<Status, string> = { online: "online", idle: "zaraz wracam", dnd: "nie przeszkadzać", offline: "offline" };

const hex = (n: number) => `#${n.toString(16).padStart(6, "0")}`;
const cdn = (kind: "avatars" | "banners", hash: string, size: number) =>
  `https://cdn.discordapp.com/${kind}/${DISCORD_ID}/${hash}.${hash.startsWith("a_") ? "gif" : "png"}?size=${size}`;

// data utworzenia konta z ID (snowflake)
const created = new Date(Number((BigInt(DISCORD_ID) >> 22n) + 1420070400000n));

async function loadProfile(): Promise<void> {
  try {
    const { data: u }: { data: JapiUser } = await (await fetch(`https://japi.rest/discord/v1/user/${DISCORD_ID}`)).json();
    if (u.avatar) {
      const a = u.avatar;
      document.querySelectorAll<HTMLImageElement>("[data-avatar]").forEach((img) => (img.src = cdn("avatars", a, 512)));
      $<HTMLLinkElement>("#favicon").href = cdn("avatars", a, 64);
    }
    if (u.banner) {
      const url = `url(${cdn("banners", u.banner, 1024)})`;
      ["#banner", "#cardBanner", "#bigBanner"].forEach((s) => ($(s).style.backgroundImage = url));
      $("#banner").style.opacity = ".35";
    }
    const name = u.global_name ?? u.username;
    $("#gName").textContent = name;
    $("#uName").textContent = u.username;
    document.title = name;

    const cols = u.display_name_styles?.colors;
    if (cols?.length) cols.slice(0, 4).forEach((c, i) => document.documentElement.style.setProperty(`--n${i + 1}`, hex(c)));

    if (u.clan) {
      const badge = `https://cdn.discordapp.com/clan-badges/${u.clan.identity_guild_id}/${u.clan.badge}.png?size=32`;
      ["#clanBadge", "#clanBadge2"].forEach((s) => {
        const img = $<HTMLImageElement>(s);
        img.src = badge;
        img.classList.remove("hidden");
      });
      $("#clanTag").textContent = u.clan.tag;
    }
  } catch { /* zostają dane domyślne */ }

  try {
    const j = await (await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`)).json();
    if (!j.success) return;
    const s: Status = j.data.discord_status;
    $("#status").style.background = statusColor[s];
    $("#heroStatus").textContent = statusLabel[s];
  } catch { /* brak statusu */ }
}

function profileDates(): void {
  $("#since").textContent = created.toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" });
  const days = Math.floor((Date.now() - created.getTime()) / 864e5);
  $("#days").dataset.count = String(days);
  const y = Math.floor(days / 365);
  $("#age").textContent = `${y} ${y === 1 ? "rok" : y < 5 ? "lata" : "lat"} ${Math.floor((days % 365) / 30)} mies.`;
}

// ---------- Kopiowanie ----------
function toast(msg: string): void {
  $("#toastTxt").textContent = msg;
  const t = $("#toast");
  t.style.transform = "translate(-50%, 0)";
  setTimeout(() => (t.style.transform = ""), 1800);
}
function copy(): void {
  $("#copyBtn").addEventListener("click", async () => {
    await navigator.clipboard.writeText($("#uName").textContent ?? "1vynx");
    toast("Skopiowano nick");
  });
  $("#copyId").addEventListener("click", async () => {
    await navigator.clipboard.writeText(DISCORD_ID);
    toast("Skopiowano ID");
  });
}

// ---------- Intro ----------
function intro(): void {
  document.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
    el.innerHTML = [...(el.textContent ?? "")]
      .map((c, i) => `<span class="char" style="animation-delay:${0.4 + i * 0.08}s">${c === " " ? "&nbsp;" : c}</span>`)
      .join("");
  });
  requestAnimationFrame(() => {
    const card = $("#profileCard");
    setTimeout(() => {
      card.style.opacity = "1";
      card.style.transform = "none";
    }, 500);
    document.querySelectorAll<HTMLElement>(".hero-fade").forEach((el, i) =>
      setTimeout(() => el.classList.remove("opacity-0"), 1000 + i * 150),
    );
  });
}

function marquee(): void {
  const words = ["! vynx", "1vynx", "REP¥", "since 2022", "! vynx", "black & white"];
  $("#marquee").innerHTML = words
    .map((w) => `<span>${w}</span><i data-lucide="cross" class="size-7 shrink-0"></i>`)
    .join("")
    .repeat(4);
}

// ---------- Reveal + liczniki ----------
function countUp(el: HTMLElement): void {
  const target = Number(el.dataset.count);
  const start = performance.now();
  const tick = (t: number) => {
    const p = Math.min((t - start) / 1800, 1);
    const v = Math.round(target * (1 - Math.pow(1 - p, 4)));
    el.textContent = el.dataset.plain !== undefined ? String(v) : v.toLocaleString("pl-PL");
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function reveal(): void {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("on");
        e.target.querySelectorAll<HTMLElement>("[data-count]").forEach(countUp);
        io.unobserve(e.target);
      }),
    { threshold: 0.15 },
  );
  document.querySelectorAll<HTMLElement>(".rv").forEach((el, i) => {
    el.style.transitionDelay = `${(i % 3) * 0.1}s`;
    io.observe(el);
  });
}

// ---------- Kursor: glow, spotlight, magnes, tilt ----------
function pointer(): void {
  const glow = $("#glow");
  addEventListener("pointermove", (e) => {
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
  });

  document.querySelectorAll<HTMLElement>(".spot-card, .card").forEach((c) =>
    c.addEventListener("pointermove", (e) => {
      const r = c.getBoundingClientRect();
      c.style.setProperty("--x", `${e.clientX - r.left}px`);
      c.style.setProperty("--y", `${e.clientY - r.top}px`);
    }),
  );

  if (reduced) return;
  document.querySelectorAll<HTMLElement>(".magnetic").forEach((b) => {
    b.style.transition += ", transform .4s cubic-bezier(.16,1,.3,1)";
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
    });
    b.addEventListener("pointerleave", () => (b.style.transform = ""));
  });

  const card = $("#profileCard");
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transition = "transform .15s ease-out";
    card.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) scale(1.02)`;
  });
  card.addEventListener("pointerleave", () => {
    card.style.transition = "transform .8s cubic-bezier(.16,1,.3,1)";
    card.style.transform = "none";
  });
}

// ---------- Scroll ----------
function scroll(): void {
  const bar = $("#progress");
  const nav = $("#nav");
  let last = 0;
  addEventListener(
    "scroll",
    () => {
      const y = scrollY;
      bar.style.transform = `scaleX(${y / (document.body.scrollHeight - innerHeight)})`;
      nav.style.transform = `translateX(-50%) translateY(${y > last && y > 300 ? "-140%" : "0"})`;
      last = y;
    },
    { passive: true },
  );
}

// ---------- Tło: dryfujące krzyże ----------
type P = { x: number; y: number; s: number; v: number; r: number; o: number };
function background(): void {
  const cv = $<HTMLCanvasElement>("#bg");
  const ctx = cv.getContext("2d")!;
  const resize = () => {
    cv.width = innerWidth * devicePixelRatio;
    cv.height = innerHeight * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  };
  resize();
  addEventListener("resize", resize);

  const cross = (s: number) => {
    const w = s * 0.18;
    ctx.fillRect(-w / 2, -s / 2, w, s);
    ctx.fillRect(-s * 0.32, -s * 0.22, s * 0.64, w);
  };
  const ps: P[] = Array.from({ length: 32 }, () => ({
    x: Math.random() * innerWidth, y: Math.random() * innerHeight,
    s: 14 + Math.random() * 36, v: 0.15 + Math.random() * 0.45,
    r: Math.random() * 6, o: 0.03 + Math.random() * 0.07,
  }));
  const frame = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of ps) {
      p.y += p.v; p.r += 0.004;
      if (p.y > innerHeight + 60) { p.y = -60; p.x = Math.random() * innerWidth; }
      ctx.save();
      ctx.translate(p.x, p.y - scrollY * 0.08 * p.v);
      ctx.rotate(Math.sin(p.r) * 0.35);
      ctx.globalAlpha = p.o;
      ctx.fillStyle = "#c4ed65";
      cross(p.s);
      ctx.restore();
    }
    if (!reduced) requestAnimationFrame(frame);
  };
  frame();
}

// ---------- Licznik wyświetleń (abacus.jasoncameron.dev) ----------
async function views(): Promise<void> {
  const counted = (() => { try { return sessionStorage.getItem("viewed") === "1"; } catch { return false; } })();
  try {
    const res = await fetch(`https://abacus.jasoncameron.dev/${counted ? "get" : "hit"}/vynx-website/views`);
    const { value }: { value: number } = await res.json();
    if (typeof value !== "number") return;
    try { sessionStorage.setItem("viewed", "1"); } catch { /* prywatne okno */ }
    $("#viewsCount").textContent = value.toLocaleString("pl-PL");
    $("#views").classList.remove("opacity-0");
  } catch { /* licznik niedostępny */ }
}

marquee();
createIcons({ icons });
views();
profileDates();
intro();
reveal();
pointer();
scroll();
copy();
background();
loadProfile();
