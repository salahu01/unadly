// Unadly site: one continuous motion piece. The story runs from noise (hot ad colours,
// clutter, chaos) to calm (ink, green, space). Every animation serves that arc.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const desktop = matchMedia("(min-width: 901px)");
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/* ------------------------------------------------------------------ smooth scroll */
let lenis;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const target = $(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { duration: 1.6 });
    }),
  );
}

/* ------------------------------------------------------------------ blocked counter */
const counterEl = $("[data-blocked]");
let blocked = 0;
function countBlock() {
  blocked += 1;
  counterEl.textContent = blocked;
  gsap.fromTo(counterEl, { scale: 1.6, color: "#ffffff" }, { scale: 1, color: "#4ade80", duration: 0.5, ease: "back.out(3)" });
}

/* ------------------------------------------------------------------ cursor */
const pointer = { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0 };
addEventListener("pointermove", (e) => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  pointer.nx = e.clientX / innerWidth - 0.5;
  pointer.ny = e.clientY / innerHeight - 0.5;
}, { passive: true });

const cursor = $(".cursor");
if (finePointer && !reduced) {
  document.documentElement.classList.add("has-cursor");
  const ring = $(".cursor__ring"), shield = $(".cursor__shield");
  const rx = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3" });
  const ry = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3" });
  const sx = gsap.quickTo(shield, "x", { duration: 0.12, ease: "power3" });
  const sy = gsap.quickTo(shield, "y", { duration: 0.12, ease: "power3" });
  addEventListener("pointermove", (e) => { rx(e.clientX); ry(e.clientY); sx(e.clientX); sy(e.clientY); }, { passive: true });
  $$("a, button, [role=slider]").forEach((el) => {
    el.addEventListener("pointerenter", () => cursor.classList.add("is-link"));
    el.addEventListener("pointerleave", () => cursor.classList.remove("is-link"));
  });
}

/* ------------------------------------------------------------------ magnetic buttons */
if (finePointer && !reduced) {
  $$(".magnetic").forEach((btn) => {
    const label = btn.children;
    const mx = gsap.quickTo(btn, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    const my = gsap.quickTo(btn, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      mx(dx * 0.35); my(dy * 0.45);
      gsap.to(label, { x: dx * 0.12, y: dy * 0.15, duration: 0.4, ease: "power3" });
    });
    btn.addEventListener("pointerleave", () => {
      mx(0); my(0);
      gsap.to(label, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
    });
  });
}

/* ------------------------------------------------------------------ split helpers */
function splitWords(el) {
  // Keeps <em> runs styled: each word becomes <span class="w">, inside its original parent.
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.append(" ");
          else { const s = document.createElement("span"); s.className = "w"; s.textContent = part; frag.append(s); }
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1) walk(child);
    });
  };
  walk(el);
  return $$(".w", el);
}

function splitLines(el) {
  // Title lines are authored as sentences; break at the <em> so each part gets its own mask.
  const parts = [];
  [...el.childNodes].forEach((n) => {
    if (n.nodeType === 3 && !n.textContent.trim()) return;
    parts.push(n.nodeType === 3 ? document.createTextNode(n.textContent.trim()) : n);
  });
  el.textContent = "";
  return parts.map((p) => {
    const line = document.createElement("span"); line.className = "line";
    const inner = document.createElement("span"); inner.append(p);
    line.append(inner); el.append(line);
    return inner;
  });
}

/* ================================================================== HERO */
const storm = $(".storm");
const AD_TYPES = [
  () => ({ cls: "", html: `70% OFF<small>Today only · Shop now</small>`, c: "var(--noise-pink)" }),
  () => ({ cls: "", html: `BUY NOW`, c: "var(--noise-red)" }),
  () => ({ cls: "", html: `FREE GIFT 🎁<small>Click to claim</small>`, c: "var(--noise-blue)" }),
  () => ({ cls: "adcard--tag", html: `Ad`, c: "" }),
  () => ({ cls: "adcard--tag", html: `Sponsored`, c: "" }),
  () => ({ cls: "adcard--window", html: `<b>You won!</b><span>Claim your prize →</span>`, c: "" }),
  () => ({ cls: "adcard--window", html: `<b>Allow notifications?</b><span>Allow · Later</span>`, c: "" }),
  () => ({ cls: "", html: `🎰 SPIN TO WIN`, c: "#7c3aed" }),
  () => ({ cls: "", html: `LAST CHANCE ⏰`, c: "var(--noise-red)" }),
  () => ({ cls: "", html: `Earn $$$ from home`, c: "#f97316" }),
  () => ({ cls: "adcard--window", html: `<b>Hot deals near you</b><span>Open →</span>`, c: "" }),
];
const cards = [];

function placeCard(card, fromEdge = false) {
  const z = rand(-700, 220);
  const scale = gsap.utils.mapRange(-700, 220, 0.55, 1.25, z);
  // Keep a calm hole in the middle for the title.
  let x, y;
  do { x = rand(0.02, 0.92) * innerWidth; y = rand(0.06, 0.9) * innerHeight; }
  while (Math.abs(x / innerWidth - 0.47) < 0.22 && Math.abs(y / innerHeight - 0.48) < 0.2 && Math.random() < 0.85);
  card.depth = z;
  card.baseX = x; card.baseY = y;
  gsap.set(card.el, {
    x, y, z, scale, rotation: rand(-12, 12), opacity: 0,
    filter: z < -350 ? `blur(${gsap.utils.mapRange(-700, -350, 3.5, 0, z)}px)` : "blur(0px)",
    zIndex: Math.round(z + 1000),
  });
  card.alive = true;
  card.el.classList.remove("is-blocked");
  gsap.to(card.el, { opacity: z < -400 ? 0.55 : 1, duration: fromEdge ? 0.8 : 0.5, ease: "power2.out" });
}

function makeCard() {
  const t = pick(AD_TYPES)();
  const el = document.createElement("div");
  el.className = `adcard ${t.cls}`;
  if (t.c) el.style.setProperty("--c", t.c);
  el.innerHTML = t.html;
  storm.append(el);
  const card = { el, alive: false, depth: 0, baseX: 0, baseY: 0 };
  card.float = gsap.to(el, { yPercent: rand(-30, 30), rotation: `+=${rand(-6, 6)}`, duration: rand(2.5, 5), ease: "sine.inOut", yoyo: true, repeat: -1 });
  cards.push(card);
  return card;
}

function blockCard(card, auto = false) {
  if (!card.alive) return;
  card.alive = false;
  card.el.classList.add("is-blocked");
  countBlock();
  const r = card.el.getBoundingClientRect();
  const badge = document.createElement("span");
  badge.className = "blocked-badge";
  badge.textContent = "blocked";
  badge.style.left = `${r.left + r.width / 2}px`;
  badge.style.top = `${r.top + r.height / 2}px`;
  $(".hero").append(badge);
  gsap.fromTo(badge, { xPercent: -50, yPercent: -50, scale: 0.6, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(3)", onComplete: () =>
      gsap.to(badge, { y: -40, opacity: 0, duration: 0.8, delay: 0.25, ease: "power2.in", onComplete: () => badge.remove() }) });
  gsap.timeline()
    .to(card.el, { scale: "*=1.12", duration: 0.08 })
    .to(card.el, { scale: 0, rotation: `+=${auto ? 90 : rand(-200, 200)}`, opacity: 0, filter: "blur(6px)", duration: 0.45, ease: "back.in(2)" })
    .call(() => gsap.delayedCall(rand(2.5, 6), () => heroActive && placeCard(card, true)));
  if (!auto) cursor.classList.add("is-hit"), setTimeout(() => cursor.classList.remove("is-hit"), 180);
}

let heroActive = true;
const CARD_COUNT = innerWidth < 700 ? 12 : 24;

function hero() {
  for (let i = 0; i < CARD_COUNT; i++) makeCard();

  const chars = $$(".hero__word .ch");
  const ads = $(".hero__ads");
  const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

  if (reduced) {
    cards.forEach((c) => placeCard(c));
    gsap.set(ads, { autoAlpha: 0 });
    return;
  }

  gsap.set(chars, { yPercent: 115, rotateX: -80, opacity: 0 });
  gsap.set([".hero__eyebrow", ".hero__lede", ".hero__cta", ".scroll-cue"], { autoAlpha: 0, y: 30 });
  gsap.set(ads, { scale: 2.4, autoAlpha: 0, filter: "blur(20px)" });

  tl.call(() => cards.forEach((c, i) => gsap.delayedCall(i * 0.035, () => placeCard(c))))
    // 1. NOISE: the ads flood in, "ADS" slams onto the screen.
    .to(ads, { scale: 1, autoAlpha: 1, filter: "blur(0px)", duration: 0.7, ease: "power4.out" }, 0.25)
    .to(ads, { x: "+=6", duration: 0.05, repeat: 7, yoyo: true, ease: "none" }, ">-0.05")
    // 2. The shield strikes it out.
    .to(".hero__ads .strike", { scaleX: 1, duration: 0.5, ease: "expo.inOut" }, 1.05)
    .to(".hero__ads-word", { skewX: -14, scaleY: 0.15, opacity: 0, duration: 0.5, ease: "power4.in" }, 1.45)
    .to(".hero__ads .strike", { scaleX: 0, transformOrigin: "right", duration: 0.45, ease: "expo.in" }, 1.6)
    // 3. CALM: UNADLY rises out of the mask, letter by letter.
    .to(chars, { yPercent: 0, rotateX: 0, opacity: 1, duration: 1.3, stagger: 0.06 }, 1.75)
    .to([".hero__eyebrow", ".hero__lede", ".hero__cta"], { autoAlpha: 1, y: 0, duration: 1, stagger: 0.12 }, 2.3)
    .to(".scroll-cue", { autoAlpha: 1, y: 0, duration: 1 }, 2.9)
    .call(startAutoBlock, null, 2.8);

  // Cursor = shield: any ad it touches is blocked.
  if (finePointer) {
    addEventListener("pointermove", () => {
      if (!heroActive) return;
      for (const c of cards) {
        if (!c.alive) continue;
        const r = c.el.getBoundingClientRect();
        if (pointer.x > r.left - 16 && pointer.x < r.right + 16 && pointer.y > r.top - 16 && pointer.y < r.bottom + 16) blockCard(c);
      }
    }, { passive: true });
  }
  // Touch: tap an ad to block it.
  storm.addEventListener("pointerdown", (e) => {
    const c = cards.find((k) => k.el === e.target.closest(".adcard"));
    if (c) blockCard(c);
  });

  // Depth parallax: near ads drift with the cursor, far ones barely move.
  const px = gsap.quickTo(storm, "rotationY", { duration: 1.2, ease: "power3" });
  const py = gsap.quickTo(storm, "rotationX", { duration: 1.2, ease: "power3" });
  const wx = gsap.quickTo(".hero__word", "x", { duration: 1.4, ease: "power3" });
  const wy = gsap.quickTo(".hero__word", "y", { duration: 1.4, ease: "power3" });
  addEventListener("pointermove", () => { if (!heroActive) return; px(pointer.nx * 10); py(-pointer.ny * 8); wx(pointer.nx * -24); wy(pointer.ny * -14); }, { passive: true });

  // Scroll out: the storm is blown past the camera; the title sinks into the calm.
  gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true,
      onLeave: () => (heroActive = false), onEnterBack: () => (heroActive = true) } })
    .to(storm, { z: 600, opacity: 0, ease: "power2.in" }, 0)
    .to(".hero__word", { scale: 0.7, yPercent: 30, opacity: 0, filter: "blur(10px)", ease: "power1.in" }, 0)
    .to([".hero__eyebrow", ".hero__lede", ".hero__cta", ".scroll-cue"], { y: -80, opacity: 0, ease: "power1.in" }, 0);
}

let autoTimer;
function startAutoBlock() {
  // The shield works on its own too: ads keep getting picked off, one by one.
  const step = () => {
    const live = cards.filter((c) => c.alive);
    if (heroActive && live.length > CARD_COUNT * 0.35) blockCard(pick(live), true);
    autoTimer = setTimeout(step, rand(700, 1400));
  };
  step();
}

/* ================================================================== VALUE */
function value() {
  const words = splitWords($("[data-words]"));
  if (reduced) return;
  gsap.fromTo(".value__iris", { scale: 0 }, {
    scale: 1, ease: "none",
    scrollTrigger: { trigger: ".value", start: "top bottom", end: "top top", scrub: true },
  });
  gsap.to(words, {
    opacity: 1, stagger: 0.08, ease: "none",
    scrollTrigger: { trigger: ".value", start: "top top", end: "+=140%", scrub: 0.6, pin: true },
  });
  gsap.from(".value .eyebrow", { opacity: 0, y: 20, scrollTrigger: { trigger: ".value", start: "top 60%" } });
}

/* ================================================================== TITLES */
function titles() {
  $$(".split-title").forEach((el) => {
    const inners = splitLines(el);
    if (reduced) return;
    gsap.from(inners, {
      yPercent: 115, rotate: 4, duration: 1.3, stagger: 0.12, ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 82%" },
    });
  });
}

/* ================================================================== FEATURES */
function features() {
  const track = $(".features__track");
  const mm = gsap.matchMedia();

  mm.add({ isDesktop: "(min-width: 901px)", motion: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
    const { isDesktop, motion } = ctx.conditions;
    let containerAnimation;
    if (isDesktop && motion) {
      containerAnimation = gsap.to(track, {
        x: () => -(track.scrollWidth - innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: ".features", start: "top top", end: () => `+=${track.scrollWidth - innerWidth}`,
          scrub: 0.8, pin: true, invalidateOnRefresh: true, anticipatePin: 1,
        },
      });
      // Cards lean into the direction of travel.
      $$(".feature").forEach((card) => {
        gsap.fromTo(card, { rotateY: -18, scale: 0.88, opacity: 0.4 }, {
          rotateY: 0, scale: 1, opacity: 1, ease: "power2.out",
          scrollTrigger: { trigger: card, containerAnimation, start: "left 95%", end: "left 35%", scrub: true },
        });
      });
    }
    if (!motion) return;
    stageEngine(containerAnimation);
    stagePopups(containerAnimation);
    stagePins(containerAnimation);
    stagePlayer(containerAnimation);
  });

  // Tilt: cards turn toward the cursor, with a moving spotlight.
  if (finePointer && !reduced) {
    $$(".tilt").forEach((card) => {
      const rx = gsap.quickTo(card, "rotationX", { duration: 0.8, ease: "power3" });
      const ry = gsap.quickTo(card, "rotationY", { duration: 0.8, ease: "power3" });
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        rx((0.5 - y) * 10); ry((x - 0.5) * 12);
        card.style.setProperty("--mx", `${x * 100}%`);
        card.style.setProperty("--my", `${y * 100}%`);
      });
      card.addEventListener("pointerleave", () => { rx(0); ry(0); });
    });
  }
}

function whenVisible(el, containerAnimation, tl) {
  ScrollTrigger.create({
    trigger: el, containerAnimation, start: containerAnimation ? "left 90%" : "top 90%",
    end: containerAnimation ? "right 10%" : "bottom 10%",
    onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
  });
}

function stageEngine(containerAnimation) {
  const lane = $(".stage-engine .lane");
  const reqs = [
    ["site.com/article.html", false], ["ads.example.net/banner.js", true], ["fonts.site.com/inter.woff2", false],
    ["tracker.example.io/pixel.gif", true], ["img.site.com/hero.jpg", false], ["adserver.example/slot.js", true],
    ["cdn.site.com/app.js", false], ["popups.example.biz/open.js", true],
  ];
  let i = 0;
  const spawn = () => {
    const [text, isAd] = reqs[i++ % reqs.length];
    const el = document.createElement("span");
    el.className = `req${isAd ? " is-ad" : ""}`;
    el.textContent = text;
    el.style.top = `${rand(12, 80)}%`;
    lane.append(el);
    const w = lane.clientWidth, gateX = w * 0.62 - 70;
    const tl = gsap.timeline({ onComplete: () => el.remove() });
    tl.fromTo(el, { x: -el.offsetWidth, opacity: 0 }, { x: gateX - el.offsetWidth, opacity: 1, duration: 1.6, ease: "none" });
    if (isAd) {
      tl.to(el, { scale: 0.2, opacity: 0, rotation: rand(-40, 40), y: rand(-40, 40), filter: "blur(4px)", duration: 0.35, ease: "power3.in" })
        .to(".stage-engine .gate", { scale: 1.12, duration: 0.12, yoyo: true, repeat: 1 }, "<");
    } else {
      tl.to(el, { x: w + 20, duration: 1.4, ease: "none" });
    }
  };
  const loop = gsap.timeline({ repeat: -1, paused: true }).call(spawn).to({}, { duration: 0.55 });
  whenVisible($(".stage-engine"), containerAnimation, loop);
}

function stagePopups(containerAnimation) {
  const pops = $$(".stage-popups .pop");
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4, paused: true });
  tl.set(pops, { scale: 0, opacity: 0, rotation: 0 })
    .to(pops, { scale: 1, opacity: 1, rotation: () => rand(-6, 6), duration: 0.45, stagger: 0.18, ease: "back.out(2.2)" })
    .to({}, { duration: 0.5 })
    .to([...pops].reverse(), { scaleY: 0.02, scaleX: 1.15, opacity: 0, duration: 0.22, stagger: 0.14, ease: "power4.in" });
  whenVisible($(".stage-popups"), containerAnimation, tl);
}

function stagePins(containerAnimation) {
  const tiles = $$(".stage-pins .tile");
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.6, paused: true });
  tl.set(tiles, { y: 40, opacity: 0, scale: 0.6 })
    .set(".stage-pins .star", { scale: 0, rotation: -90 })
    .to(".stage-pins .star", { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(3)" })
    .to(tiles, { y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: { each: 0.09, from: "start" }, ease: "back.out(1.8)" }, "-=0.2")
    .to(".stage-pins .star", { y: -8, duration: 0.6, yoyo: true, repeat: 3, ease: "sine.inOut" });
  whenVisible($(".stage-pins"), containerAnimation, tl);
}

function stagePlayer(containerAnimation) {
  const tl = gsap.timeline({ repeat: -1, paused: true });
  tl.fromTo(".player__bar i", { scaleX: 0.04 }, { scaleX: 1, duration: 6, ease: "none" })
    .to(".player__play", { scale: 1.15, duration: 0.6, yoyo: true, repeat: 9, ease: "sine.inOut" }, 0);
  whenVisible($(".stage-webkit"), containerAnimation, tl);
}

/* ================================================================== SHOWCASE */
function showcase() {
  if (reduced) return;
  gsap.timeline({
    scrollTrigger: { trigger: ".showcase", start: "top top", end: "+=170%", scrub: 1, pin: true },
  })
    .fromTo(".window",
      { y: "38vh", scale: 0.5, rotateX: 38, clipPath: "inset(0% 0% 70% 0% round 18px)" },
      { y: "6vh", scale: 1, rotateX: 0, clipPath: "inset(0% 0% 0% 0% round 18px)", ease: "power2.out" })
    .fromTo(".showcase__title span", { opacity: 1 }, { opacity: 0.08, ease: "none" }, 0)
    .to(".showcase__title", { y: "-6vh", scale: 0.86, ease: "none" }, 0)
    .to(".window", { scale: 1.12, y: "2vh", ease: "none" });
}

/* ================================================================== COMPARE */
function compare() {
  const stage = $("[data-compare]");
  const handle = $(".compare__handle");
  const set = (pct) => {
    pct = gsap.utils.clamp(0, 100, pct);
    stage.style.setProperty("--split", `${pct}%`);
    handle.setAttribute("aria-valuenow", Math.round(pct));
  };
  let dragging = false;
  const move = (e) => {
    const r = stage.getBoundingClientRect();
    set(((e.clientX - r.left) / r.width) * 100);
  };
  stage.addEventListener("pointerdown", (e) => { dragging = true; stage.setPointerCapture(e.pointerId); move(e); sweep?.kill(); });
  stage.addEventListener("pointermove", (e) => dragging && move(e));
  stage.addEventListener("pointerup", () => (dragging = false));
  handle.addEventListener("keydown", (e) => {
    const now = +handle.getAttribute("aria-valuenow");
    if (e.key === "ArrowLeft") set(now - 5), e.preventDefault();
    if (e.key === "ArrowRight") set(now + 5), e.preventDefault();
  });

  let sweep;
  if (reduced) return set(50);
  // On arrival the clean page wipes across the noisy one, then settles in the middle.
  const state = { p: 100 };
  sweep = gsap.timeline({ scrollTrigger: { trigger: stage, start: "top 70%" }, onUpdate: () => set(state.p) })
    .to(state, { p: 4, duration: 1.4, ease: "power3.inOut" })
    .to(state, { p: 50, duration: 1.1, ease: "power3.inOut" });
  // The noisy ads keep jittering, the clean side doesn't.
  gsap.to(".page--noisy .ad--pop", { rotation: 2, x: 4, duration: 0.12, yoyo: true, repeat: -1, ease: "steps(2)" });
  gsap.to(".page--noisy .ad--top", { backgroundPosition: "200% 0", duration: 1, repeat: -1, ease: "none" });
}

/* ================================================================== PROCESS */
function processPath() {
  if (reduced || !desktop.matches) return;
  const draw = $(".process__path .draw");
  const len = draw.getTotalLength();
  gsap.set(draw, { strokeDasharray: len, strokeDashoffset: len });
  const packet = $(".packet");
  const tl = gsap.timeline({
    scrollTrigger: { trigger: ".process__map", start: "top 55%", end: "bottom 60%", scrub: 0.8,
      onUpdate: (self) => packet.classList.toggle("is-dead", self.progress > 0.62) },
  });
  tl.to(draw, { strokeDashoffset: 0, ease: "none" }, 0)
    .to(packet, { motionPath: { path: draw, align: draw, alignOrigin: [0.5, 0.5] }, ease: "none" }, 0);

  $$(".step").forEach((step) => {
    gsap.from(step.children, {
      y: 50, opacity: 0, duration: 1, stagger: 0.1, ease: "expo.out",
      scrollTrigger: { trigger: step, start: "top 75%" },
    });
  });
}

/* ================================================================== PROOF */
function proof() {
  $$("[data-count]").forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = +(el.dataset.decimals || 0);
    const suffix = el.dataset.suffix || "";
    const fmt = (v) => v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
    if (reduced) { el.textContent = fmt(target); return; }
    const obj = { v: 0 };
    el.textContent = fmt(0);
    gsap.to(obj, {
      v: target, duration: target > 100 ? 2.4 : 1.4, ease: "expo.out",
      onUpdate: () => (el.textContent = fmt(decimals ? obj.v : Math.round(obj.v))),
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });
  if (reduced) return;

  gsap.from(".stat", { y: 80, opacity: 0, duration: 1.2, stagger: 0.12, ease: "expo.out", scrollTrigger: { trigger: ".stats", start: "top 80%" } });

  // Marquee: endless, and it leans with scroll speed.
  const row = $(".marquee__row");
  const loop = gsap.to(row, { xPercent: -50, duration: 22, ease: "none", repeat: -1 });
  const skew = gsap.quickTo(row, "skewX", { duration: 0.4, ease: "power3" });
  ScrollTrigger.create({
    trigger: ".marquee", start: "top bottom", end: "bottom top",
    onUpdate: (self) => {
      const v = self.getVelocity();
      skew(gsap.utils.clamp(-12, 12, v / -250));
      loop.timeScale(gsap.utils.clamp(0.5, 4, 1 + Math.abs(v) / 900) * (v < 0 ? -1 : 1));
    },
  });
}

/* ================================================================== FINALE */
function finale() {
  if (reduced) return;
  gsap.from(".finale__title .row > *", {
    yPercent: 110, scaleY: 2.2, duration: 1.4, stagger: 0.14, ease: "expo.out",
    scrollTrigger: { trigger: ".finale__title", start: "top 85%" },
  });
  gsap.from(".finale__icon", {
    scale: 0.2, rotateY: -540, opacity: 0, ease: "power3.out",
    scrollTrigger: { trigger: ".finale", start: "top 85%", end: "top 25%", scrub: 1 },
  });
  gsap.from(".finale__cta > *", { y: 40, opacity: 0, stagger: 0.1, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".finale__cta", start: "top 90%" } });

  if (finePointer) {
    const icon = $(".finale__icon");
    const rx = gsap.quickTo(icon, "rotationX", { duration: 1, ease: "power3" });
    const ry = gsap.quickTo(icon, "rotationY", { duration: 1, ease: "power3" });
    addEventListener("pointermove", () => { rx(-pointer.ny * 30); ry(pointer.nx * 40); }, { passive: true });
  }
}

/* ================================================================== go */
hero();
value();
titles();
features();
showcase();
compare();
processPath();
proof();
finale();

addEventListener("load", () => ScrollTrigger.refresh());
document.fonts?.ready.then(() => ScrollTrigger.refresh());
