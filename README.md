<img src="public/icon.svg" width="96" align="right" alt="Unadly icon">

# Unadly — website

Source of **https://salahu01.github.io/unadly/**, the marketing site for
[Unadly](https://github.com/salahu01/unadly-macos): a free, open-source Mac browser that blocks
ads inside the engine — before they leave your Mac. Built on WebKit. No server, no tracking.

Built as a single-page motion piece: Vite + GSAP with ScrollTrigger and Lenis smooth scroll.
All copy lives in the HTML, and the motion layer (`src/main.js`) only choreographs it, so
crawlers and answer engines see everything. `prefers-reduced-motion` turns the motion off.

## Develop

```sh
npm install
npm run dev        # local dev server
npm run build      # production build -> dist/
```

Deploy with `npx gh-pages -d dist` (builds and pushes `dist/` to the `gh-pages` branch, which
GitHub Pages serves). `vite.config.js` sets `base: "./"` for Pages.

## Licence

MIT, same as the app.
